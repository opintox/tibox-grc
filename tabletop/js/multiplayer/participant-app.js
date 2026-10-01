// Lógica de join.html (celular del participante): entrar con código de sala, nombre y función
// (Fase 1), votar quién debe actuar (Fase 2) y, si le tocó a la función que reclamó este
// celular, responder la alternativa (Fase 3).
import {
  getRoom, getMyParticipant, listenRoom, listenParticipants, listenMyParticipant, joinRoom, castVote, submitAnswer,
  PARTICIPANT_STATUS
} from './room.js';

const codeInput = document.getElementById('joinCodeInput');
const nameInput = document.getElementById('joinNameInput');
const roleSection = document.getElementById('joinRoleSection');
const roleGrid = document.getElementById('joinRoleGrid');
const statusEl = document.getElementById('joinStatus');
const submitBtn = document.getElementById('joinSubmitBtn');
const formPanel = document.getElementById('joinFormPanel');
const waitingPanel = document.getElementById('joinWaitingPanel');
const joinedRoleName = document.getElementById('joinedRoleName');
const joinWaitingText = document.getElementById('joinWaitingText');
const joinWaitingEyebrow = document.getElementById('joinWaitingEyebrow');
const votePanel = document.getElementById('joinVotePanel');
const voteStageEl = document.getElementById('joinVoteStage');
const voteTitleEl = document.getElementById('joinVoteTitle');
const voteStatusEl = document.getElementById('joinVoteStatus');
const voteGrid = document.getElementById('joinVoteGrid');
const answerPanel = document.getElementById('joinAnswerPanel');
const answerStatusEl = document.getElementById('joinAnswerStatus');
const answerGrid = document.getElementById('joinAnswerGrid');
const joinBriefing = document.getElementById('joinBriefing');
const joinBriefingTitle = document.getElementById('joinBriefingTitle');
const joinBriefingText = document.getElementById('joinBriefingText');

let unsubscribeParticipants = null;
let unsubscribeRoom = null;
let currentRoom = null; // {scenarioId, roleRoster, status} de la sala ya validada
let currentCode = null;
let takenRoleKeys = new Set();
let selectedRoleKey = null;
let myRoleKey = null; // función que este celular reclamó (ya unido) — usado en la Fase 3
let lastVotedActKey = null; // evita re-mostrar los botones de voto ya emitido para el mismo acto
let lastAnsweredActKey = null; // evita re-mostrar las alternativas ya enviadas para el mismo acto
// Admisión: estado de este celular en la sala ('pending' | 'admitted' | 'rejected'). Hasta que
// el facilitador lo admite solo ve la espera (las reglas tampoco le dejan votar ni responder).
let myStatus = null;
let unsubscribeMine = null;
let lastRoom = null;

function setStatus(text, kind){
  statusEl.textContent = text || '';
  statusEl.className = 'join-status' + (kind ? ` is-${kind}` : '');
}

function escapeHtmlLocal(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function stopWatchingRoom(){
  if(unsubscribeParticipants){ unsubscribeParticipants(); unsubscribeParticipants = null; }
  if(unsubscribeRoom){ unsubscribeRoom(); unsubscribeRoom = null; }
}

function renderRoleGrid(){
  roleGrid.innerHTML = (currentRoom.roleRoster || []).map(r => {
    const taken = takenRoleKeys.has(r.roleKey) && r.roleKey !== selectedRoleKey;
    const selected = r.roleKey === selectedRoleKey;
    const [a] = r.accent || ['#8592AE'];
    return `<button type="button" class="join-role-btn${selected ? ' is-selected' : ''}${taken ? ' is-taken' : ''}"
        data-role="${escapeHtmlLocal(r.roleKey)}" ${taken ? 'disabled' : ''} style="--a:${a};">
      <span class="join-role-name">${escapeHtmlLocal(r.name)}</span>
      ${taken ? '<span class="join-role-taken-tag">Ya tomada</span>' : ''}
    </button>`;
  }).join('');
  roleGrid.querySelectorAll('.join-role-btn:not(.is-taken)').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRoleKey = btn.dataset.role;
      renderRoleGrid();
      updateSubmitEnabled();
    });
  });
}

function updateSubmitEnabled(){
  const hasName = nameInput.value.trim().length > 0;
  submitBtn.disabled = !(currentRoom && currentRoom.status === 'lobby' && hasName && selectedRoleKey);
}

async function loadRoom(code){
  stopWatchingRoom();
  currentRoom = null;
  selectedRoleKey = null;
  roleSection.classList.add('hidden');
  updateSubmitEnabled();

  if(!code || code.length < 4){ setStatus(''); return; }
  setStatus('Buscando sala…');
  let room;
  try{ room = await getRoom(code); }
  catch(err){ setStatus('No se pudo conectar. Revisa tu conexión e intenta de nuevo.', 'error'); return; }

  if(code !== codeInput.value.trim().toUpperCase()) return; // el usuario ya cambió el código mientras esperábamos la respuesta
  if(!room){ setStatus('No existe una sala con ese código.', 'error'); return; }

  // Reingreso: si esta misma sesión anónima (mismo navegador/celular) ya estaba en la sala
  // —cerró la pestaña sin querer o perdió la conexión—, se reconecta directo con la función
  // que ya tenía, sin pasar por el formulario ni por el bloqueo de "sala ya iniciada" de abajo.
  let mine = null;
  try{ mine = await getMyParticipant(code); }catch(err){ /* si falla, se sigue como unión nueva */ }
  if(code !== codeInput.value.trim().toUpperCase()) return;
  if(mine && mine.status === PARTICIPANT_STATUS.REJECTED){
    setStatus('El facilitador no autorizó tu ingreso a esta sala.', 'error');
    return;
  }
  if(mine){
    currentRoom = room;
    currentCode = code;
    setStatus('');
    enterWaitingMode(code, mine.claimedRoleKey, room.roleRoster || [], room, mine.status);
    return;
  }

  if(room.status !== 'lobby'){ setStatus('Esta sala ya inició el ejercicio — no se pueden sumar nuevos participantes.', 'error'); return; }

  currentRoom = room;
  currentCode = code;
  setStatus('Sala encontrada. Elige tu función.', 'ok');
  roleSection.classList.remove('hidden');
  renderRoleGrid();
  updateSubmitEnabled();

  unsubscribeParticipants = listenParticipants(code, list => {
    takenRoleKeys = new Set(list.filter(p => p.status !== PARTICIPANT_STATUS.REJECTED).map(p => p.claimedRoleKey).filter(Boolean));
    renderRoleGrid();
  });
  unsubscribeRoom = listenRoom(code, updatedRoom => {
    if(updatedRoom && updatedRoom.status !== 'lobby' && currentRoom && currentRoom.status === 'lobby'){
      currentRoom = updatedRoom;
      setStatus('Esta sala ya inició el ejercicio.', 'error');
      roleSection.classList.add('hidden');
      updateSubmitEnabled();
    }
  });
}

let codeDebounce = null;
codeInput.addEventListener('input', () => {
  codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  clearTimeout(codeDebounce);
  const code = codeInput.value.trim();
  codeDebounce = setTimeout(() => { if(code.length === 6) loadRoom(code); }, 250);
});
nameInput.addEventListener('input', updateSubmitEnabled);

// Deja al celular en modo "unido, esperando" y arranca la escucha de la sala (no de la lista
// de participantes: ya no hace falta acá) para avisar cuando el facilitador inicie el
// ejercicio y reaccionar al acto vigente (Fase 2: votar quién debe actuar; Fase 3: responder
// si le tocó a la función de este celular). `room`: si ya se tiene el snapshot a mano (caso
// reingreso), se pinta el estado vigente de inmediato en vez de esperar el próximo cambio.
function enterWaitingMode(code, roleKey, roleRoster, room, status){
  myRoleKey = roleKey;
  myStatus = status || PARTICIPANT_STATUS.PENDING;
  const role = roleRoster.find(r => r.roleKey === roleKey);
  joinedRoleName.textContent = role ? role.name : roleKey;
  roleSection.classList.add('hidden');
  formPanel.classList.add('hidden');
  votePanel.classList.add('hidden');
  answerPanel.classList.add('hidden');
  waitingPanel.classList.remove('hidden');

  if(unsubscribeParticipants){ unsubscribeParticipants(); unsubscribeParticipants = null; }
  if(unsubscribeRoom) unsubscribeRoom();
  if(unsubscribeMine) unsubscribeMine();
  lastRoom = room || null;
  if(room) handleActUpdate(room, roleRoster);
  else renderAdmissionWait();
  unsubscribeRoom = listenRoom(code, updatedRoom => {
    if(!updatedRoom) return;
    handleActUpdate(updatedRoom, roleRoster);
  });
  // Cuando el facilitador admite o rechaza, se vuelve a pintar con la última sala conocida.
  unsubscribeMine = listenMyParticipant(code, me => {
    if(!me) return;
    myStatus = me.status;
    if(lastRoom) handleActUpdate(lastRoom, roleRoster);
    else renderAdmissionWait();
  });
}

// Pantalla de espera mientras este celular no está admitido (pendiente o rechazado).
function renderAdmissionWait(){
  votePanel.classList.add('hidden');
  answerPanel.classList.add('hidden');
  waitingPanel.classList.remove('hidden');
  renderBriefing(null);
  const rejected = myStatus === PARTICIPANT_STATUS.REJECTED;
  joinWaitingEyebrow.textContent = rejected ? 'Ingreso no autorizado' : 'Solicitud enviada';
  joinWaitingText.textContent = rejected
    ? 'El facilitador no autorizó tu ingreso a esta sala. Si crees que es un error, avísale.'
    : 'Esperando que el facilitador autorice tu ingreso. Cuando lo haga, esta pantalla se actualiza sola.';
}

submitBtn.addEventListener('click', async () => {
  if(submitBtn.disabled) return;
  submitBtn.disabled = true;
  setStatus('Uniéndote…');
  try{
    await joinRoom(currentCode, {displayName: nameInput.value, roleKey: selectedRoleKey});
  }catch(err){
    setStatus(err.message || 'No se pudo unir a la sala.', 'error');
    submitBtn.disabled = false;
    return;
  }
  enterWaitingMode(currentCode, selectedRoleKey, currentRoom.roleRoster || [], null, PARTICIPANT_STATUS.PENDING);
});

// Alterna entre "esperando", la vista de voto (Fase 2) y la vista de respuesta (Fase 3) según
// room.status/currentAct.phase. Solo redibuja cada vista cuando cambia el actKey (si no, cada
// snapshot de la sala volvería a pintar el formulario y perdería "ya voté"/"ya respondí").
function handleActUpdate(room, roleRoster){
  lastRoom = room;
  if(myStatus !== PARTICIPANT_STATUS.ADMITTED){ renderAdmissionWait(); return; }
  joinWaitingEyebrow.textContent = 'Listo';
  const act = room.currentAct;
  // Introducción del escenario: solo entre que el facilitador inicia y publica el primer acto.
  const showBriefing = room.status === 'in_progress' && !act && !!room.briefing;
  renderBriefing(showBriefing ? room.briefing : null);

  if(room.status !== 'in_progress' || !act || (act.phase !== 'voting' && act.phase !== 'answering')){
    votePanel.classList.add('hidden');
    answerPanel.classList.add('hidden');
    waitingPanel.classList.remove('hidden');
    joinWaitingText.textContent = showBriefing
      ? 'El facilitador está presentando el escenario. Cuando empiece la primera etapa, aquí vas a poder votar.'
      : room.status === 'in_progress'
        ? 'Esperando a que el facilitador continúe…'
        : 'El ejercicio todavía no comienza.';
    return;
  }

  if(act.phase === 'voting'){
    answerPanel.classList.add('hidden');
    waitingPanel.classList.add('hidden');
    votePanel.classList.remove('hidden');
    if(act.actKey === lastVotedActKey) return; // ya se pintó/votó este acto, no repintar
    renderVoteGrid(act, roleRoster);
    return;
  }

  // act.phase === 'answering'
  votePanel.classList.add('hidden');
  if(act.target === myRoleKey){
    waitingPanel.classList.add('hidden');
    answerPanel.classList.remove('hidden');
    if(act.actKey === lastAnsweredActKey) return; // ya se pintó/envió este acto, no repintar
    renderAnswerGrid(act);
  } else {
    answerPanel.classList.add('hidden');
    waitingPanel.classList.remove('hidden');
    const role = roleRoster.find(r => r.roleKey === act.target);
    joinWaitingText.textContent = `Turno de ${role ? role.name : (act.target || 'otra función')} — está respondiendo…`;
  }
}

// briefing: {title, intro} publicado por el facilitador (ver publishBriefing en room.js), o
// null para ocultarlo. Texto plano: cada párrafo se escapa (lo escribe el facilitador, pero
// viene de un Word importado).
function renderBriefing(briefing){
  joinBriefing.classList.toggle('hidden', !briefing);
  if(!briefing) return;
  joinBriefingTitle.textContent = briefing.title || '';
  joinBriefingText.innerHTML = String(briefing.intro || '').split(/\n\s*\n/).filter(t => t.trim())
    .map(t => `<p>${escapeHtmlLocal(t.trim())}</p>`).join('');
}

function renderVoteGrid(act, roleRoster){
  voteStageEl.textContent = act.stage || 'Etapa';
  voteTitleEl.textContent = act.title || '¿Quién debe actuar?';
  voteStatusEl.textContent = 'Elige la función que crees que debe hacerse cargo de esta situación.';
  voteGrid.innerHTML = roleRoster.map(r => {
    const [a] = r.accent || ['#8592AE'];
    return `<button type="button" class="join-vote-btn" data-role="${escapeHtmlLocal(r.roleKey)}" style="--a:${a};">${escapeHtmlLocal(r.name)}</button>`;
  }).join('');
  voteGrid.querySelectorAll('.join-vote-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      voteGrid.querySelectorAll('.join-vote-btn').forEach(b => { b.disabled = true; b.classList.remove('is-selected'); });
      btn.classList.add('is-selected');
      const actKey = act.actKey;
      try{
        await castVote(currentCode, actKey, btn.dataset.role);
        lastVotedActKey = actKey;
        voteStatusEl.textContent = 'Voto registrado — esperando a los demás.';
      }catch(err){
        voteStatusEl.textContent = err.message || 'No se pudo registrar el voto.';
        voteGrid.querySelectorAll('.join-vote-btn').forEach(b => { b.disabled = false; });
      }
    });
  });
}

// Las alternativas se muestran tal como vienen en act.options: el facilitador ya las publicó
// mezcladas en el mismo orden que su pantalla, así el celular y la pantalla grande coinciden.
// Se envía la posición en act.options (ver room.js, submitAnswer).
function renderAnswerGrid(act){
  answerStatusEl.textContent = 'Elige la alternativa correcta.';
  const options = act.options || [];
  answerGrid.innerHTML = options.map((text, pos) =>
    `<button type="button" class="answer-btn" data-pos="${pos}">${escapeHtmlLocal(text)}</button>`
  ).join('');
  answerGrid.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      answerGrid.querySelectorAll('.answer-btn').forEach(b => { b.disabled = true; });
      const actKey = act.actKey;
      try{
        await submitAnswer(currentCode, actKey, parseInt(btn.dataset.pos, 10));
        lastAnsweredActKey = actKey;
        answerStatusEl.textContent = 'Respuesta enviada — esperando al facilitador.';
      }catch(err){
        answerStatusEl.textContent = err.message || 'No se pudo enviar la respuesta.';
        answerGrid.querySelectorAll('.answer-btn').forEach(b => { b.disabled = false; });
      }
    });
  });
}

// Prellenado desde el link/QR (?room=ABC123): si viene, se completa y se busca de una.
const params = new URLSearchParams(location.search);
const prefillCode = (params.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
if(prefillCode){
  codeInput.value = prefillCode;
  loadRoom(prefillCode);
}
