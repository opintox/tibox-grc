// Lado facilitador del modo "Con celulares": Fase 1 (crear la sala, mostrar código/QR, ver
// el lobby en vivo, iniciar el ejercicio existente sin tocarlo) + Fase 2 (votación: publicar
// el acto vigente, tally en vivo sobre las mismas .char-card, resolver por timeout/empate).
// Expone window.MP para que app.js (script clásico, no módulo) lo llame sin imports.
import {
  createRoom, listenParticipants, startRoom, publishAct, setActPhase, openAnswering, publishBriefing,
  resolveCodeAttempt, resetCodeAttempts, rejectParticipant, closeRoom,
  PARTICIPANT_STATUS, MAX_CODE_ATTEMPTS, isAdmitted, codeAttemptsUsed
} from './room.js';

// ---------------- admisión por código (una escucha por sala) ----------------
// Desde que se crea la sala hasta que se cierra hay UNA escucha de participantes: revisa los
// intentos de código y redibuja las vistas abiertas (sala de espera y popout "Sala"). Así un
// código se verifica aunque ninguna de las dos esté abierta en ese momento.
let watchUnsub = null;
let watchCode = null;
let lastParticipants = [];          // también lo usa getPersonByRole para el informe final
const rosterViews = new Map();      // 'lobby' | 'panel' -> {listEl, countEl, roleRoster}
const issuedCodes = new Map();      // uid -> código de 6 dígitos (solo en este navegador)
const revealUntil = new Map();      // uid -> hasta cuándo se muestra el código sin ocultar
const inFlight = new Set();         // `${uid}:${n}` en revisión, para no resolver dos veces
const REVEAL_MS = 10000;

function newAccessCode(){
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
}

function renderAllViews(){
  rosterViews.forEach(v => renderRoster(lastParticipants, v.roleRoster, v.listEl, v.countEl, watchCode));
}

// Compara cada intento nuevo con el código que se le dio a esa persona (si no se le dio
// ninguno, cualquier intento es incorrecto) y deja el resultado en Firestore.
function processCodeAttempts(list){
  list.forEach(p => {
    if(p.status !== PARTICIPANT_STATUS.PENDING || !p.codeAttempt) return;
    const n = p.codeAttempt.n;
    if(n <= (p.codeChecked || 0)) return;
    const key = `${p.uid}:${n}`;
    if(inFlight.has(key)) return;
    inFlight.add(key);
    const issued = issuedCodes.get(p.uid);
    const correct = !!issued && p.codeAttempt.value === issued;
    resolveCodeAttempt(watchCode, p.uid, n, correct)
      .then(() => { if(correct){ issuedCodes.delete(p.uid); revealUntil.delete(p.uid); } })
      .catch(err => reportSyncError('revisar el código de un participante', err))
      .finally(() => inFlight.delete(key));
  });
}

function startAdmissionWatch(code){
  stopAdmissionWatch();
  watchCode = code;
  watchUnsub = listenParticipants(code, list => { lastParticipants = list; processCodeAttempts(list); renderAllViews(); });
}
function stopAdmissionWatch(){
  if(watchUnsub){ watchUnsub(); watchUnsub = null; }
  watchCode = null;
  lastParticipants = [];
  rosterViews.clear();
  issuedCodes.clear();
  revealUntil.clear();
  inFlight.clear();
}

// Cierra el ejercicio: corta la escucha, olvida los códigos y borra a todos los participantes
// y sus funciones (ver closeRoom en room.js); cada celular se desconecta solo al detectarlo.
function mpCloseRoom(code){
  stopAdmissionWatch();
  closeRoomPanel();
  closeRoom(code).catch(err => reportSyncError('cerrar la sala y desconectar a los participantes', err));
}

function joinUrlFor(code){
  return new URL('join.html?room=' + encodeURIComponent(code), location.href).href;
}

// Copia local de escapeHtml: app.js tiene la suya, pero vive dentro de un IIFE que no la
// expone — este módulo no depende del orden de carga respecto a app.js.
function escapeHtmlLocal(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Aviso visible cuando falla una escritura en Firestore: antes solo quedaba en la consola y el
// facilitador seguía sin saber que los celulares se habían desincronizado. `what` describe
// qué no se pudo hacer ("publicar el acto vigente"); el aviso se va solo a los pocos segundos
// y uno nuevo reemplaza al anterior.
let syncAlertTimer = null;
function reportSyncError(what, err){
  console.error(`[multiplayer] No se pudo ${what}:`, err);
  let el = document.getElementById('mpSyncAlert');
  if(!el){
    el = document.createElement('div');
    el.id = 'mpSyncAlert';
    el.className = 'mp-sync-alert';
    el.setAttribute('role', 'alert');
    document.body.appendChild(el);
  }
  el.textContent = `No se pudo ${what} en los celulares. Revisa la conexión a internet; mientras tanto puedes seguir el ejercicio con clic en esta pantalla.`;
  el.classList.add('is-visible');
  clearTimeout(syncAlertTimer);
  syncAlertTimer = setTimeout(() => el.classList.remove('is-visible'), 9000);
}

// targetEl: el contenedor del QR — parametrizado porque tanto la sala de espera
// (#lobbyQr) como el popout "Sala" durante el ejercicio (#roomPanelQr) lo usan.
function renderQr(url, targetEl){
  targetEl.innerHTML = '';
  try{
    const qr = window.qrcode(0, 'M'); // typeNumber 0 = auto (el tamaño mínimo que alcance)
    qr.addData(url);
    qr.make();
    targetEl.innerHTML = qr.createSvgTag({cellSize: 5, margin: 3, scalable: true});
  }catch(err){
    console.error('[multiplayer] No se pudo generar el QR:', err);
    targetEl.textContent = 'No se pudo generar el QR — usa el link de abajo.';
  }
}

const LOBBY_EMPTY_ICON = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M12 2v2M4 4l1.5 1.5M20 4l-1.5 1.5"/></svg>';

// listEl/countEl: mismo motivo que renderQr — la sala de espera y el popout "Sala" comparten
// esta función con sus propios contenedores.
// Roster con admisión por código: los pendientes aparecen primero con "Dar código" (o su código
// oculto con "Ver", los intentos usados y "Nuevo código") y "Rechazar"; los admitidos, con
// "Quitar"; los rechazados no se muestran. El código se muestra oculto (•••) porque la pantalla
// del facilitador suele estar proyectada: "Ver" lo deja visible unos segundos para dictarlo.
// roomCode: la sala sobre la que actúan los botones.
function renderRoster(participantList, roleRoster, listEl, countEl, roomCode){
  const visibles = participantList.filter(p => p.status !== PARTICIPANT_STATUS.REJECTED);
  const pending = visibles.filter(p => p.status === PARTICIPANT_STATUS.PENDING);
  const admitted = visibles.filter(isAdmitted);
  if(countEl) countEl.textContent = pending.length ? `${admitted.length} · ${pending.length} por autorizar` : String(admitted.length);
  if(visibles.length === 0){
    listEl.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">${LOBBY_EMPTY_ICON}</div>
      <p class="empty-state-title">Esperando participantes</p>
      <p class="empty-state-desc">Nadie se ha unido todavía — comparte el código o el QR de la izquierda.</p>
    </div>`;
    return;
  }
  const now = Date.now();
  listEl.innerHTML = pending.concat(admitted).map(p => {
    const role = roleRoster.find(r => r.roleKey === p.claimedRoleKey);
    const [a] = (role && role.accent) || ['#8592AE'];
    const isPending = p.status === PARTICIPANT_STATUS.PENDING;
    const uid = escapeHtmlLocal(p.uid);
    const rejectBtn = `<button type="button" class="btn btn-sm lobby-reject-btn" data-reject="${uid}" data-role="${escapeHtmlLocal(p.claimedRoleKey || '')}"${isPending ? '' : ' title="Quitar de la sala y liberar la función"'}>${isPending ? 'Rechazar' : 'Quitar'}</button>`;
    let actions = rejectBtn;
    if(isPending){
      const issued = issuedCodes.get(p.uid);
      const used = codeAttemptsUsed(p);
      const shown = !!issued && (revealUntil.get(p.uid) || 0) > now;
      const attempts = used > 0
        ? `<span class="lobby-attempts${used >= MAX_CODE_ATTEMPTS ? ' is-out' : ''}">${used >= MAX_CODE_ATTEMPTS ? 'Sin intentos' : `${used}/${MAX_CODE_ATTEMPTS} intentos`}</span>`
        : '';
      const code = issued
        ? `<span class="lobby-access-code${shown ? ' is-shown' : ''}">${shown ? `${issued.slice(0, 3)} ${issued.slice(3)}` : '••• •••'}</span>
           <button type="button" class="btn btn-sm" data-show="${uid}">${shown ? 'Ocultar' : 'Ver'}</button>`
        : '';
      actions = `${code}${attempts}<button type="button" class="btn btn-sm lobby-give-btn" data-give="${uid}">${issued ? 'Nuevo código' : 'Dar código'}</button>${rejectBtn}`;
    }
    return `<div class="lobby-roster-item${isPending ? ' is-pending' : ''}" style="--a:${a};">
      <span class="lobby-roster-dot"></span>
      <span class="lobby-roster-name">${escapeHtmlLocal(p.displayName || 'Sin nombre')}${isPending ? ' <span class="lobby-roster-pending">Por autorizar</span>' : ''}</span>
      <span class="lobby-roster-role">${escapeHtmlLocal(role ? role.name : (p.claimedRoleKey || '—'))}</span>
      <span class="lobby-roster-actions">${actions}</span>
    </div>`;
  }).join('');
  if(!roomCode) return;
  listEl.onclick = async e => {
    const giveBtn = e.target.closest('[data-give]');
    const showBtn = e.target.closest('[data-show]');
    const rejectBtn = e.target.closest('[data-reject]');
    if(showBtn){
      const uid = showBtn.dataset.show;
      if((revealUntil.get(uid) || 0) > Date.now()) revealUntil.delete(uid);
      else { revealUntil.set(uid, Date.now() + REVEAL_MS); setTimeout(renderAllViews, REVEAL_MS + 100); }
      renderAllViews();
      return;
    }
    if(giveBtn){
      // Código nuevo (o reemplazo): se muestra unos segundos para dictarlo. Si la persona ya
      // había gastado intentos, se le vuelven a habilitar.
      const uid = giveBtn.dataset.give;
      const participant = lastParticipants.find(x => x.uid === uid);
      issuedCodes.set(uid, newAccessCode());
      revealUntil.set(uid, Date.now() + REVEAL_MS);
      setTimeout(renderAllViews, REVEAL_MS + 100);
      renderAllViews();
      if(participant && participant.codeAttempt && participant.codeAttempt.n){
        try{ await resetCodeAttempts(roomCode, uid, participant.codeAttempt.n); }
        catch(err){ reportSyncError('habilitar nuevos intentos de código', err); }
      }
      return;
    }
    if(rejectBtn){
      rejectBtn.disabled = true;
      try{
        await rejectParticipant(roomCode, rejectBtn.dataset.reject, rejectBtn.dataset.role);
        issuedCodes.delete(rejectBtn.dataset.reject);
      }catch(err){
        rejectBtn.disabled = false;
        reportSyncError('rechazar al participante', err);
      }
    }
  };
}

// scenarioId/roleRoster: ver room.js (createRoom). onStart: la función a llamar (sin
// argumentos) una vez que el facilitador toca "Iniciar ejercicio" — hoy siempre es la
// startGame() existente de app.js, sin modificarla. onCancel: opcional, si el facilitador
// vuelve atrás sin iniciar.
async function openLobby({scenarioId, roleRoster, onStart, onCancel}){
  const codeEl = document.getElementById('lobbyRoomCode');
  const urlInput = document.getElementById('lobbyJoinUrl');
  const qrEl = document.getElementById('lobbyQr');
  const listEl = document.getElementById('lobbyRosterList');
  const countEl = document.getElementById('lobbyRosterCount');
  const startBtn = document.getElementById('lobbyStartBtn');
  const cancelBtn = document.getElementById('lobbyCancelBtn');
  const copyBtn = document.getElementById('lobbyCopyBtn');

  window.TabletopScreens.show('lobby', {scroll: false});
  codeEl.textContent = 'Creando sala…';
  qrEl.innerHTML = '';
  renderRoster([], roleRoster, listEl, countEl);
  startBtn.disabled = true;

  // La pantalla siguiente (introducción o configuración) la muestra quien sigue: acá solo se
  // cortan la escucha y los botones de la sala.
  const exitLobby = () => {
    rosterViews.delete('lobby');
    startBtn.onclick = null;
    cancelBtn.onclick = null;
    copyBtn.onclick = null;
  };

  let code;
  try{
    code = await createRoom({scenarioId, roleRoster});
  }catch(err){
    codeEl.textContent = 'Error';
    listEl.innerHTML =
      `<p class="lobby-roster-empty">No se pudo crear la sala: ${escapeHtmlLocal(err.message || err)}</p>`;
    cancelBtn.onclick = () => { exitLobby(); window.TabletopScreens.show('setup', {scroll: false}); if(onCancel) onCancel(); };
    return;
  }

  codeEl.textContent = code;
  const url = joinUrlFor(code);
  urlInput.value = url;
  renderQr(url, qrEl);
  startBtn.disabled = false;

  startAdmissionWatch(code);
  rosterViews.set('lobby', {listEl, countEl, roleRoster});
  renderAllViews();

  copyBtn.onclick = async () => {
    try{
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = 'Copiado ✓';
      setTimeout(() => { copyBtn.textContent = 'Copiar link'; }, 1800);
    }catch(err){
      urlInput.select();
    }
  };

  startBtn.onclick = async () => {
    startBtn.disabled = true;
    try{ await startRoom(code); }
    catch(err){ reportSyncError('marcar la sala como iniciada', err); }
    exitLobby();
    onStart(code);
  };

  // Volver sin iniciar: la sala se cierra y se desconecta a quienes ya se habían unido.
  cancelBtn.onclick = () => {
    exitLobby();
    mpCloseRoom(code);
    window.TabletopScreens.show('setup', {scroll: false});
    if(onCancel) onCancel();
  };
}

function mpPublishBriefing(roomCode, briefing){
  publishBriefing(roomCode, briefing).catch(err => {
    reportSyncError('publicar la introducción', err);
  });
}

// ---------------- Fase 2: votación ----------------
// app.js llama a estas 3 desde renderStage()/renderCharGrid()/onCharacterPick() (hooks
// mínimos, ver plan de multijugador) — todo el estado de la votación en sí (quién votó qué,
// el timeout, el desempate) vive acá adentro, no en app.js.
const MP_VOTE_SECONDS = 45;
let voteUnsub = null;
let voteTimeoutHandle = null;

function clearVotingWatch(){
  if(voteUnsub){ voteUnsub(); voteUnsub = null; }
  if(voteTimeoutHandle){ clearTimeout(voteTimeoutHandle); voteTimeoutHandle = null; }
}

// Dibuja/actualiza un badge de conteo sobre cada .char-card activa (data-role-key, ver
// renderCharGrid en app.js) — no toca nada más de la tarjeta.
function renderVoteBadges(tally){
  document.querySelectorAll('#charGrid .char-card[data-role-key]').forEach(el => {
    const key = el.dataset.roleKey;
    const count = tally[key] || 0;
    let badge = el.querySelector('.mp-vote-badge');
    if(!badge){
      badge = document.createElement('span');
      badge.className = 'mp-vote-badge';
      el.appendChild(badge);
    }
    badge.textContent = count > 0 ? `${count} voto${count === 1 ? '' : 's'}` : '';
    badge.classList.toggle('is-empty', count === 0);
  });
}

// Empate: gana la función que aparece primero en roleKeys — ese arreglo ya viene en el orden
// fijo del organigrama del escenario (roleMetaFor(...).keys en app.js), no por quién votó
// primero ni por latencia (ver plan, criterio de desempate explícito y reproducible).
function pickWinner(tally, roleKeys){
  let best = null, bestCount = 0;
  roleKeys.forEach(key => {
    const count = tally[key] || 0;
    if(count > bestCount){ best = key; bestCount = count; }
  });
  return best;
}

// Publica el acto vigente en Firestore (fase 'voting') — se llama una vez por acto, desde
// renderStage(). No hace nada más: la UI de la votación la arma attachVotingPhase.
function mpPublishAct(roomCode, act){
  publishAct(roomCode, {...act, phase: 'voting'}).catch(err => {
    reportSyncError('publicar el acto vigente', err);
  });
}

// Suscribe la tarjeta en vivo del acto actual: pinta los votos que van llegando sobre las
// .char-card y, a los MP_VOTE_SECONDS, resuelve automáticamente por mayoría (si hubo al
// menos un voto) llamando a onResolve(roleKeyGanador) — que en app.js dispara el mismo
// onCharacterPick de siempre. El clic manual del facilitador en una tarjeta sigue funcionando
// en paralelo en todo momento (no se deshabilita nada acá): es el "desatasco" si la votación
// queda empatada sin ganador o si nadie votó.
function attachVotingPhase(roomCode, actKey, roleKeys, onResolve){
  clearVotingWatch();
  let resolved = false;
  let lastTally = {};

  const resolveOnce = winnerKey => {
    if(resolved || !winnerKey) return;
    resolved = true;
    clearVotingWatch();
    onResolve(winnerKey);
  };

  voteUnsub = listenParticipants(roomCode, list => {
    const tally = {};
    // Solo votan los admitidos (las reglas ya lo impiden; esto además ignora datos viejos).
    list.filter(isAdmitted).forEach(p => {
      if(p.vote && p.vote.actKey === actKey && roleKeys.includes(p.vote.roleKey)){
        tally[p.vote.roleKey] = (tally[p.vote.roleKey] || 0) + 1;
      }
    });
    lastTally = tally;
    renderVoteBadges(tally);
  });

  voteTimeoutHandle = setTimeout(() => resolveOnce(pickWinner(lastTally, roleKeys)), MP_VOTE_SECONDS * 1000);
}

// Se llama desde onCharacterPick() apenas se resuelve el acto (por clic manual o por
// votación) — corta cualquier listener/timeout de votación pendiente y marca en Firestore
// que la fase pasó a 'answering', para que los celulares dejen de mostrar la votación.
// `answer`: {target, options, order} de la pregunta vigente — se publican recién acá (ver
// openAnswering en room.js), en el mismo orden que muestra la pantalla del facilitador.
function closeVoting(roomCode, answer){
  clearVotingWatch();
  answerOrder = answer.order;
  openAnswering(roomCode, answer.target, answerOrder.map(i => answer.options[i])).catch(err => {
    reportSyncError('cerrar la votación', err);
  });
}

// ---------------- Fase 3: respuesta individual ----------------
// Simplificación a propósito: el celular envía UNA alternativa y queda en "enviado, esperando"
// sin importar si acertó — el feedback de correcto/incorrecto (con reintento) sigue viéndose
// solo en la pantalla del facilitador, igual que la narrativa del acto. Si la respuesta llegó
// incorrecta, el facilitador puede resolverlo con el mismo panel compartido (clic manual, ya
// activo en paralelo) tal como en la votación — no hay timeout automático acá: a diferencia de
// una votación, una sola respuesta no tiene "mayoría" que resolver sola con el paso del tiempo.
let answerUnsub = null;

// La alternativa correcta siempre es q.options[0] (ver README). Si se publicara tal cual,
// cualquier participante la vería en la sala; por eso se publican en el orden mezclado de la
// pantalla del facilitador (lo decide app.js) y answerOrder[i] guarda el índice ORIGINAL de la
// alternativa publicada en la posición i. El celular responde por posición publicada —la misma
// que ve en la pantalla grande— y acá se traduce de vuelta.
let answerOrder = [];

function clearAnsweringWatch(){
  if(answerUnsub){ answerUnsub(); answerUnsub = null; }
}

// targetRoleKey: la función que ganó la Fase 2 para este acto (gameState.chosenCorrectParticipant.roleKey
// en app.js). onResolve(origIdx) se llama por cada envío nuevo y distinto de esa persona —
// incluye reintentos si la app marca la primera alternativa como incorrecta y la persona no
// tiene forma de reintentar desde su celular en esta fase (ver arriba); en la práctica alcanza
// con un solo envío, pero no se asume.
function attachAnsweringPhase(roomCode, actKey, targetRoleKey, onResolve){
  clearAnsweringWatch();
  let seenKey = null;
  answerUnsub = listenParticipants(roomCode, list => {
    const p = list.find(x => isAdmitted(x) && x.claimedRoleKey === targetRoleKey);
    if(!p || !p.answer || p.answer.actKey !== actKey) return;
    const pos = p.answer.optionIndex;
    if(!Number.isInteger(pos) || pos < 0 || pos >= answerOrder.length) return; // dato ajeno a la UI: se ignora
    const ts = p.answer.submittedAt;
    const key = pos + '@' + (ts && ts.seconds != null ? `${ts.seconds}.${ts.nanoseconds}` : 'pending');
    if(key === seenKey) return;
    seenKey = key;
    onResolve(answerOrder[pos]);
  });
}

// Se llama desde onAnswerPick() apenas la respuesta queda resuelta como correcta (por
// clic manual o por el envío del celular) — corta el listener y marca la fase como 'resolved'.
function closeAnswering(roomCode){
  clearAnsweringWatch();
  setActPhase(roomCode, 'resolved').catch(err => {
    reportSyncError('cerrar la fase de respuesta', err);
  });
}

// Se llama desde onAnswerPick() cuando la respuesta llega incorrecta: republica el mismo acto
// (misma función objetivo) en fase 'answering' con un actKey nuevo, para que el celular de
// quien respondió mal vuelva a mostrar las 4 alternativas habilitadas y pueda reintentar — a
// diferencia de mpPublishAct, acá NO se fuerza la fase a 'voting' (no se reabre la elección
// de personaje).
// `act`: {actKey, stage, title, target, options, order} — order es el que ya está en pantalla.
function mpRetryAnswer(roomCode, {order, ...act}){
  answerOrder = order;
  publishAct(roomCode, {...act, options: order.map(i => act.options[i]), phase: 'answering'}).catch(err => {
    reportSyncError('habilitar el reintento de la respuesta', err);
  });
}

// ---------------- popout "Sala" (durante el ejercicio) ----------------
// Botón fijo en la barra superior mientras el ejercicio corre en modo "Con celulares": vuelve
// a mostrar el código/QR/link de la sala y el roster en vivo, para que el facilitador se lo
// pueda mostrar de nuevo a alguien que cerró su navegador sin querer y necesita reingresar
// (ver getMyParticipant en room.js — el reingreso funciona solo desde el mismo celular).

function openRoomPanel(roomCode, roleRoster){
  const overlay = document.getElementById('roomPanelOverlay');
  if(!overlay) return;
  const codeEl = document.getElementById('roomPanelCode');
  const urlInput = document.getElementById('roomPanelJoinUrl');
  const qrEl = document.getElementById('roomPanelQr');
  const listEl = document.getElementById('roomPanelRosterList');
  const countEl = document.getElementById('roomPanelRosterCount');
  const copyBtn = document.getElementById('roomPanelCopyBtn');
  const closeBtn = document.getElementById('roomPanelClose');

  codeEl.textContent = roomCode;
  const url = joinUrlFor(roomCode);
  urlInput.value = url;
  renderQr(url, qrEl);
  rosterViews.set('panel', {listEl, countEl, roleRoster});
  if(watchCode === roomCode) renderAllViews();
  else renderRoster([], roleRoster, listEl, countEl);

  copyBtn.onclick = async () => {
    try{
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = 'Copiado ✓';
      setTimeout(() => { copyBtn.textContent = 'Copiar link'; }, 1800);
    }catch(err){
      urlInput.select();
    }
  };

  const onKeydown = e => { if(e.key === 'Escape') closeRoomPanel(); };
  closeBtn.onclick = closeRoomPanel;
  overlay.onclick = e => { if(e.target === overlay) closeRoomPanel(); };
  document.addEventListener('keydown', onKeydown);
  overlay._onKeydown = onKeydown; // para poder sacarlo al cerrar

  overlay.classList.remove('hidden');
}

function closeRoomPanel(){
  const overlay = document.getElementById('roomPanelOverlay');
  if(!overlay || overlay.classList.contains('hidden')) return;
  rosterViews.delete('panel');
  if(overlay._onKeydown){ document.removeEventListener('keydown', overlay._onKeydown); overlay._onKeydown = null; }
  overlay.classList.add('hidden');
}

window.MP = {
  openLobby, publishBriefing: mpPublishBriefing, publishAct: mpPublishAct, attachVotingPhase, closeVoting,
  attachAnsweringPhase, closeAnswering, retryAnswer: mpRetryAnswer,
  openRoomPanel, closeRoomPanel, closeRoom: mpCloseRoom,
  // {roleKey: nombre de la persona} según el último roster visto.
  getPersonByRole: () => Object.fromEntries(lastParticipants.filter(p => isAdmitted(p) && p.claimedRoleKey).map(p => [p.claimedRoleKey, p.displayName || '']))
};
