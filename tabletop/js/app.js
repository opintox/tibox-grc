// Lógica de la aplicación: configuración, motor del ejercicio, resultados e informe.
// Depende de js/data/catalogo.js y js/data/escenarios.js, cargados antes que este archivo.

(function(){

// Ordenados de menor a mayor peligrosidad/impacto potencial para el negocio:
// dispositivo perdido (alcance acotado) → ... → ransomware (paralización operativa + extorsión, el más severo)
// Nota: la primera opción (índice 0) de cada pregunta sigue siendo la canónicamente correcta en los datos;
// el orden que ve el usuario se mezcla en pantalla (ver renderAnswerOptions), así que no siempre aparece primera.

const ROLE_LABELS = ROLE_NAMES;
// Mismo criterio que los íconos de escenario: masas sólidas en grilla 24×24,
// que a 13 px se leen mucho mejor que el trazo fino anterior.
const ROLE_ICONS = {
  seguridad:'<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 1.8 20.6 5v6.4c0 5.3-3.5 9.4-8.6 11-5.1-1.6-8.6-5.7-8.6-11V5Z"/></svg>',
  ti:'<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" fill-rule="evenodd"><path d="M3.4 3.2h17.2A1.8 1.8 0 0 1 22.4 5v10.4a1.8 1.8 0 0 1-1.8 1.8H3.4a1.8 1.8 0 0 1-1.8-1.8V5a1.8 1.8 0 0 1 1.8-1.8Zm.6 2.4v9.2h16V5.6Z"/><path d="M7.5 19h9v2h-9Z"/></svg>',
  legal:'<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M11 1.9h2v2.7l7.7 2-.5 2.3L13 7.1V19.4h4.6v2.3H6.4v-2.3H11V7.1L3.8 8.9l-.5-2.3 7.7-2Z"/><path d="M4.3 9.7 7.6 16H1Z"/><path d="M19.7 9.7 23 16h-6.6Z"/></svg>',
  comunicaciones:'<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M14.8 2.6v18.8L7.4 17.2V6.8Z"/><path d="M2 8.4h4.2v7.2H2A1.4 1.4 0 0 1 .6 14.2V9.8A1.4 1.4 0 0 1 2 8.4Z"/><path d="M17.6 7.6a6.6 6.6 0 0 1 0 8.8l-1.5-1.5a4.5 4.5 0 0 0 0-5.8Z"/></svg>',
  rrhh:'<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><circle cx="8.6" cy="7" r="3.9"/><path d="M1.6 20.4c0-3.9 3.1-7 7-7s7 3.1 7 7a1.2 1.2 0 0 1-1.2 1.2H2.8a1.2 1.2 0 0 1-1.2-1.2Z"/><circle cx="17.8" cy="8.4" r="2.8"/><path d="M17.8 13.4c2.8 0 4.9 2.1 4.9 4.9v1.6h-4.6c0-2.3-.8-4.4-2.2-6a5 5 0 0 1 1.9-.5Z"/></svg>',
  direccion:'<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M4 2h2.2v20H4Z"/><path d="M7.6 3.2h12.9l-3.6 4.6 3.6 4.6H7.6Z"/></svg>'
};
// Descripciones breves: caben en una línea dentro de la tarjeta de función.
const ROLE_DESCRIPTIONS = {
  seguridad:'clasifica la severidad y coordina la respuesta',
  ti:'detecta, contiene, aísla y restaura los sistemas',
  legal:'evalúa obligaciones regulatorias y contractuales',
  comunicaciones:'gestiona el mensaje a clientes y al público',
  rrhh:'gestiona los aspectos laborales del caso',
  direccion:'autoriza decisiones y declara el cierre formal'
};

// ---------------- funciones y etapas: fijas por defecto, o propias por escenario ----------------
// Los 10 escenarios de catalogo.js comparten siempre estas 6 funciones y estas 5 etapas. Un
// escenario importado desde Word puede traer su propia lista de funciones y/o de etapas (ver
// docx.js) cuando el guion del cliente tiene un organigrama o un proceso distinto al estándar
// (ej. un runbook con "TeamLeader", "Encargado Regulatorio", etapas de "Erradicación" y
// "Notificación regulatoria", etc.). roleMetaFor()/stagesFor() son el único punto de lectura:
// todo el resto de la app pide "la función activa" o "las etapas activas" de un escenario por
// acá, en vez de leer ROLE_KEYS/STAGE_LABELS directo, así que un escenario con estructura propia
// no toca en nada a los que usan la estructura estándar.
const DEFAULT_ROLE_META = {
  keys: ROLE_KEYS, names: ROLE_NAMES, icons: ROLE_ICONS, color: ROLE_COLOR,
  desc: ROLE_DESCRIPTIONS, org: ROLE_ORG, accents: ROLE_ACCENTS
};
// Los 4 colores oficiales de TIBOX (brand book "TIBOX AI Knowledge v0.2", ver también
// SCENARIO_ACCENTS en catalogo.js): las tres caras del cubo — cian, amarillo, naranjo — y el
// degradado de la unidad de Ciberseguridad (magenta → rojo coral), la unidad de esta herramienta.
// Se ciclan en este orden para cualquier cantidad de funciones propias que traiga un escenario.
const CUSTOM_ROLE_PALETTE = [
  {color:'blue', accent:['#0FC7F6','#0B8FD6']},   // cian
  {color:'amber', accent:['#F3E006','#D9A800']},  // amarillo
  {color:'amber', accent:['#FF8A3D','#F0651D']},  // naranjo
  {color:'purple', accent:['#E0219A','#FF4D6A']}  // magenta → rojo coral (Ciberseguridad)
];
function initialsIconSvg(name){
  const initials = String(name || '?').trim().split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase() || '?';
  return `<svg viewBox="0 0 24 24" width="13" height="13"><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" font-family="inherit">${escapeHtml(initials)}</text></svg>`;
}
// Mismo lenguaje visual que .scn-icon en las tarjetas de escenario: el ícono de cada
// función vive en su propio chip circular, con el acento de esa función (rm.accents,
// ya definido por función tanto en el organigrama estándar como en uno propio importado
// desde Word) en vez de quedar suelto dentro de la píldora de texto neutra.
function roleIconChipHtml(rm, roleKey){
  const icon = (rm.icons && rm.icons[roleKey]) || '';
  const [c1] = (rm.accents && rm.accents[roleKey]) || ['#8592AE'];
  return `<span class="p-role-icon" style="background:${hexToRgba(c1, 0.18)}; color:${c1};">${icon}</span>`;
}
// Mismo chip que roleIconChipHtml, pero para el encabezado del popout de explicación
// (.ex-role-icon en vez de .p-role-icon: un poco más grande ahí).
function roleExplainIconHtml(rm, roleKey){
  const icon = (rm.icons && rm.icons[roleKey]) || '';
  const [c1] = (rm.accents && rm.accents[roleKey]) || ['#8592AE'];
  return `<span class="ex-role-icon" style="background:${hexToRgba(c1, 0.18)}; color:${c1};">${icon}</span>`;
}
// roleList: [{key, name}] en el orden en que el documento las declaró.
function buildCustomRoleMeta(roleList){
  const keys = roleList.map(r => r.key);
  const names = {}, icons = {}, color = {}, desc = {}, org = {}, accents = {};
  roleList.forEach((r, i) => {
    const palette = CUSTOM_ROLE_PALETTE[i % CUSTOM_ROLE_PALETTE.length];
    names[r.key] = r.name;
    icons[r.key] = initialsIconSvg(r.name);
    color[r.key] = palette.color;
    accents[r.key] = palette.accent;
    desc[r.key] = '';
    org[r.key] = 'Cliente';
  });
  return {keys, names, icons, color, desc, org, accents};
}
function roleMetaFor(scenarioId){
  const s = SCENARIOS.find(x => x.id === scenarioId);
  return (s && s.roleMeta) ? s.roleMeta : DEFAULT_ROLE_META;
}
function stagesFor(scenarioId){
  const s = SCENARIOS.find(x => x.id === scenarioId);
  return (s && s.customStages && s.customStages.length) ? s.customStages : STAGE_LABELS;
}
// Funciones que corresponde listar como participantes de un escenario: en el organigrama
// estándar, solo las que la matriz de participación (PARTICIPATION_MATRIX/getMatrix) marca
// como activas para ese escenario en particular — no las 6 fijas. Un escenario con funciones
// propias no tiene ese concepto y las trae todas.
function activeRoleKeysFor(scenarioId){
  const rm = roleMetaFor(scenarioId);
  if(rm !== DEFAULT_ROLE_META || !scenarioId) return rm.keys;
  const matrix = getMatrix(scenarioId);
  return rm.keys.filter(k => matrix[k]);
}
// Regla única de "función activa en esta sesión": está en la matriz del escenario (getMatrix,
// con los ajustes de la sesión) Y sigue marcada en participantes. La usan las preguntas que
// entran al juego, el tablero de personajes, el roster de la sala, la introducción y el informe.
function isRoleActive(roleKey, scenarioId){
  const p = participants.find(x => x.roleKey === roleKey);
  return !!(p && p.checked && getMatrix(scenarioId)[roleKey]);
}
function sessionRoleKeys(scenarioId){
  return roleMetaFor(scenarioId).keys.filter(k => isRoleActive(k, scenarioId));
}
// Empresa que ejecuta una función en esta sesión: la asignada en participantes o, si no hay
// ninguna, la que trae el organigrama del escenario.
function roleCompanyFor(roleKey, scenarioId){
  const p = participants.find(x => x.roleKey === roleKey);
  return (p && p.empresa) || roleMetaFor(scenarioId).org[roleKey] || '';
}
function defaultParticipantsFor(scenarioId){
  return activeRoleKeysFor(scenarioId).map(k => ({roleKey:k, empresa:'', checked:true}));
}
// Frases variadas para el acierto (personaje y alternativa correcta): una sesión completa
// acierta ~20 veces entre las dos pantallas, y repetir siempre la misma línea se siente
// mecánico. Se elige una al azar cada vez en vez de un texto fijo.
const CORRECT_CHARACTER_PHRASES = [
  'Esta es la función que debe ejecutar la acción según el plan del ejercicio. Presiona «Siguiente» para elegir la respuesta.',
  'Correcto: le corresponde a esta función actuar acá. Ahora falta decidir qué hace.',
  'Bien identificado. El plan del ejercicio asigna esta acción a esta función — continúa para elegir la decisión.',
  'Acertaste con quién responde. El siguiente paso es decidir qué hace.',
  'Es la función correcta para este momento del incidente. Presiona «Siguiente» para elegir la alternativa.'
];
const CORRECT_ANSWER_TAGS = ['✓ Correcta', '✓ Acertaste', '✓ Es la decisión correcta', '✓ Bien resuelto', '✓ Elegida · Correcta'];
function pickRandom(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
// Cambia el escenario elegido y, si sus funciones no son las mismas que ya están cargadas en
// `participants` (ej. se pasa de un escenario estándar a uno con funciones propias, o viceversa),
// reconstruye la lista de participantes desde cero para el nuevo set de funciones.
function applyScenarioSelection(id){
  const newKeys = activeRoleKeysFor(id);
  const sameKeys = participants.length === newKeys.length && participants.every((p,i) => p.roleKey === newKeys[i]);
  if(!sameKeys) participants = defaultParticipantsFor(id);
  selectedScenarioId = id;
  enforceMandatoryRoles();
  autoAssignCompanies(id);
}

let selectedScenarioId = null;

let participants = DEFAULT_PARTICIPANTS.map(p => ({...p}));
let clientName = '';
let facilitatorName = '';
// matriz de participación editable en tiempo real, una copia por escenario partiendo de PARTICIPATION_MATRIX
let sessionMatrices = {};
// Se pone en true solo al guardar (o cargar) un perfil de cliente explícito; cualquier edición
// posterior de cliente/facilitador/participantes/escenario lo vuelve a poner en false. El botón
// «Comenzar ejercicio» exige que esté en true (ver updateBottomState) para forzar a guardar el
// perfil del cliente antes de empezar la sesión.
let profileSaved = false;
// ---------------- wizard de configuración (Perfil → Escenario → Participantes) ----------------
// Solo 3 y solo estos: cambiar el número de pasos implica ajustar también el markup
// (#wizardStep1/2/3) y goToStep/renderWizardStepper más abajo. Declarados aquí (no junto al
// resto de la lógica del wizard) porque updateBottomState() ya los necesita desde la primera
// llamada, antes de que el body del wizard se defina más abajo en el archivo.
let currentSetupStep = 1;
const WIZARD_STEPS = [
  {n: 1, label: 'Perfil de cliente'},
  {n: 2, label: 'Escenario'},
  {n: 3, label: 'Participantes'}
];
// El paso más lejano ya visitado: el stepper solo deja saltar por clic hacia atrás,
// nunca hacia un paso futuro que todavía no se mostró.
let furthestSetupStep = 1;
function getMatrix(scenarioId){
  if(!sessionMatrices[scenarioId]) sessionMatrices[scenarioId] = {...(PARTICIPATION_MATRIX[scenarioId] || {})};
  const m = sessionMatrices[scenarioId];
  // TI y Seguridad son obligatorias en todo escenario del organigrama estándar: se fuerzan aquí
  // para que nunca queden desactivadas por un error de datos. Un escenario con funciones propias
  // no tiene ese concepto (sus funciones ya vienen todas activas por defecto al registrarlo).
  if(roleMetaFor(scenarioId) === DEFAULT_ROLE_META){
    m.ti = true;
    m.seguridad = true;
  }
  return m;
}
// TI y Seguridad no se pueden desmarcar como participantes (ver getMatrix): se fuerza su
// checked=true cada vez que la lista de participantes se reemplaza (carga inicial, restauración
// de configuración guardada o importación de un archivo), para que la matriz forzada arriba y lo
// que ve el usuario en pantalla nunca queden desincronizados.
function enforceMandatoryRoles(){
  participants.forEach(p => { if(p.roleKey === 'ti' || p.roleKey === 'seguridad') p.checked = true; });
}

// ---------------- autoguardado de configuración (setup) ----------------
// Solo persiste los datos de configuración (cliente, facilitador, participantes, escenario,
// matrices), no el progreso dentro de un ejercicio en curso: eso requeriría serializar gameState
// completo (incluye funciones y referencias al DOM) y queda fuera de alcance por ahora. Aun así,
// evita perder toda la configuración del cliente ante un refresh accidental antes de empezar.
// sessionStorage (no localStorage): sobrevive a recargar la misma pestaña, pero una pestaña o
// visita nueva empieza en blanco — para reutilizar un cliente están los perfiles guardados.
const SETUP_STORAGE_KEY = 'tabletop_setup_v1';
try{ localStorage.removeItem(SETUP_STORAGE_KEY); }catch(e){ /* borrador de la versión anterior */ }
let setupSaveTimer = null;
function saveSetupState(){
  clearTimeout(setupSaveTimer);
  setupSaveTimer = setTimeout(() => {
    try{
      sessionStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify({
        clientName, facilitatorName, participants, selectedScenarioId, sessionMatrices,
        savedAt: new Date().toISOString()
      }));
    }catch(e){ /* localStorage no disponible o lleno; no es crítico para seguir usando la app */ }
  }, 300);
}
// ---------------- perfiles de cliente guardados ----------------
// A diferencia del autoguardado de arriba (un solo borrador, se sobreescribe solo), esto es una
// lista de perfiles con nombre que el facilitador guarda a propósito con el botón «Guardar perfil»,
// para poder reutilizarlos entre sesiones sin depender de un archivo exportado.
const PROFILES_STORAGE_KEY = 'tabletop_profiles_v1';
function loadProfiles(){
  try{
    const list = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  }catch(e){ return []; }
}
function saveProfilesList(list){
  try{ localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(list)); }
  catch(e){ /* localStorage no disponible o lleno; no es crítico para seguir usando la app */ }
}
function currentConfigSnapshot(){
  const allMatrices = {};
  SCENARIOS.forEach(s => { allMatrices[s.id] = getMatrix(s.id); });
  return {
    clientName, facilitatorName,
    participants: participants.map(p => ({...p})),
    selectedScenarioId, sessionMatrices: allMatrices
  };
}
// Guarda (o actualiza, si ya existe uno con el mismo nombre de cliente) un perfil. Devuelve
// null si no hay nombre de cliente, ya que el nombre es la clave con la que se identifica el perfil.
function saveProfile(){
  const name = clientName.trim();
  if(!name) return null;
  const list = loadProfiles();
  const snapshot = currentConfigSnapshot();
  const idx = list.findIndex(p => (p.clientName || '').trim().toLowerCase() === name.toLowerCase());
  const now = new Date().toISOString();
  let profile;
  if(idx >= 0){
    profile = {...list[idx], ...snapshot, savedAt: now};
    list[idx] = profile;
  } else {
    profile = {id: `profile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, ...snapshot, savedAt: now};
    list.push(profile);
  }
  saveProfilesList(list);
  profileSaved = true;
  updateBottomState();
  return profile;
}
function deleteProfile(id){
  saveProfilesList(loadProfiles().filter(p => p.id !== id));
}
function loadProfileIntoForm(profile){
  clientName = profile.clientName || '';
  facilitatorName = profile.facilitatorName || '';
  const expectedKeys = activeRoleKeysFor(profile.selectedScenarioId || null);
  participants = Array.isArray(profile.participants) && profile.participants.length === expectedKeys.length
    ? profile.participants.map(p => ({...p})) : defaultParticipantsFor(profile.selectedScenarioId || null);
  enforceMandatoryRoles();
  selectedScenarioId = profile.selectedScenarioId || null;
  // Un escenario cargado desde Word solo vive en esta sesión (ver registerCustomScenario):
  // si el perfil guardado apuntaba a uno, ya no existe tras recargar la página.
  if(selectedScenarioId && !SCENARIOS.some(s => s.id === selectedScenarioId)) selectedScenarioId = null;
  sessionMatrices = profile.sessionMatrices ? JSON.parse(JSON.stringify(profile.sessionMatrices)) : {};
  document.getElementById('clientNameInput').value = clientName;
  document.getElementById('facilitatorNameInput').value = facilitatorName;
  renderParticipants();
  renderScenarioCards();
  profileSaved = true; // coincide exactamente con lo guardado: no hace falta volver a guardar
  updateBottomState();
  saveSetupState();
}

// ---------------- panel desplegable de perfiles guardados ----------------
let profilesPanelEl = null;
function closeProfilesPanel(){
  if(!profilesPanelEl) return;
  profilesPanelEl.remove();
  profilesPanelEl = null;
  document.removeEventListener('mousedown', profilesOutsideClick, true);
}
function profilesOutsideClick(e){
  if(profilesPanelEl && !profilesPanelEl.contains(e.target) && e.target.id !== 'profilesToggleBtn'){
    closeProfilesPanel();
  }
}
function renderProfilesPanel(){
  if(!profilesPanelEl) return;
  const list = loadProfiles().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  if(list.length === 0){
    profilesPanelEl.innerHTML = '<div class="profiles-dropdown-empty">Aún no hay perfiles guardados.</div>';
    return;
  }
  profilesPanelEl.innerHTML = `<div class="profiles-dropdown-list">${list.map(p => `
    <div class="profile-row" data-id="${p.id}" role="button" tabindex="0">
      <div class="profile-row-main">
        <div class="profile-row-name">${escapeHtml(p.clientName || 'Sin nombre')}</div>
        <div class="profile-row-meta">${escapeHtml(p.facilitatorName || 'Sin facilitador')} · ${escapeHtml(new Date(p.savedAt).toLocaleDateString('es-CL'))}</div>
      </div>
      <button class="profile-row-del" data-id="${p.id}" title="Borrar perfil" aria-label="Borrar perfil de ${escapeHtml(p.clientName || '')}">✕</button>
    </div>`).join('')}</div>`;
  const openProfile = id => {
    const profile = loadProfiles().find(p => p.id === id);
    if(profile){ loadProfileIntoForm(profile); closeProfilesPanel(); }
  };
  profilesPanelEl.querySelectorAll('.profile-row').forEach(row => {
    row.addEventListener('click', e => { if(!e.target.closest('.profile-row-del')) openProfile(row.dataset.id); });
    row.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openProfile(row.dataset.id); } });
  });
  profilesPanelEl.querySelectorAll('.profile-row-del').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const profile = loadProfiles().find(p => p.id === id);
      const ok = await showConfirmModal({
        title: 'Borrar perfil',
        message: `¿Borrar el perfil de <b>${escapeHtml(profile ? profile.clientName : '')}</b>? Esta acción no se puede deshacer.`,
        confirmText: 'Borrar', cancelText: 'Cancelar'
      });
      if(ok){ deleteProfile(id); renderProfilesPanel(); }
    });
  });
}
document.getElementById('profilesToggleBtn').addEventListener('click', () => {
  if(profilesPanelEl){ closeProfilesPanel(); return; }
  const btn = document.getElementById('profilesToggleBtn');
  const rect = btn.getBoundingClientRect();
  profilesPanelEl = document.createElement('div');
  profilesPanelEl.className = 'profiles-dropdown';
  profilesPanelEl.style.left = Math.min(rect.left, window.innerWidth - 300) + 'px';
  profilesPanelEl.style.top = (rect.bottom + 8) + 'px';
  document.body.appendChild(profilesPanelEl);
  renderProfilesPanel();
  setTimeout(() => document.addEventListener('mousedown', profilesOutsideClick, true), 0);
});
document.getElementById('saveProfileBtn').addEventListener('click', () => {
  const btn = document.getElementById('saveProfileBtn');
  if(!clientName.trim()){
    showConfirmModal({
      title: 'Falta el nombre del cliente',
      message: 'Escribe el nombre del cliente antes de guardar el perfil.',
      confirmText: 'Entendido', cancelText: null
    });
    document.getElementById('clientNameInput').focus();
    return;
  }
  saveProfile();
  saveSetupState();
  const orig = btn.textContent;
  btn.textContent = 'Guardado ✓';
  setTimeout(() => { btn.textContent = orig; }, 1500);
});

// ---------------- ejercicios guardados (resultados finales) ----------------
const EXERCISES_STORAGE_KEY = 'tabletop_exercises_v1';
function loadSavedExercises(){
  try{
    const list = JSON.parse(localStorage.getItem(EXERCISES_STORAGE_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  }catch(e){ return []; }
}
function saveExercisesList(list){
  try{ localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(list)); }
  catch(e){ /* localStorage no disponible o lleno; no es crítico para seguir usando la app */ }
}

// Modal propio (reemplaza confirm()/alert() nativos del navegador, que no respetan el estilo oscuro de la app)
function showConfirmModal({title, message, confirmText = 'Aceptar', cancelText = 'Cancelar'}){
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box" role="alertdialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-title" id="modalTitle">${escapeHtml(title)}</div>
        <div class="modal-message">${message}</div>
        <div class="modal-actions">
          ${cancelText ? `<button class="btn" id="modalCancelBtn">${escapeHtml(cancelText)}</button>` : ''}
          <button class="btn btn-primary" id="modalConfirmBtn">${escapeHtml(confirmText)}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const cleanup = (result) => { overlay.remove(); document.removeEventListener('keydown', onKey); resolve(result); };
    function onKey(e){ if(e.key === 'Escape') cleanup(false); }
    overlay.querySelector('#modalConfirmBtn').addEventListener('click', () => cleanup(true));
    const cancelBtn = overlay.querySelector('#modalCancelBtn');
    if(cancelBtn) cancelBtn.addEventListener('click', () => cleanup(false));
    overlay.addEventListener('mousedown', e => { if(e.target === overlay) cleanup(false); });
    document.addEventListener('keydown', onKey);
    overlay.querySelector('#modalConfirmBtn').focus();
  });
}

// Antes preguntaba con un modal ("¿Quieres restaurarla?") cada vez que había un borrador
// guardado; se sacó esa interrupción — ahora restaura directo y en silencio, que es lo que
// el usuario elegía casi siempre igual (el modal solo se veía como un cartel molesto).
function loadSetupState(){
  let data;
  try{
    const raw = sessionStorage.getItem(SETUP_STORAGE_KEY);
    if(!raw) return;
    data = JSON.parse(raw);
  }catch(e){ try{ sessionStorage.removeItem(SETUP_STORAGE_KEY); }catch(e2){ /* sin sessionStorage */ } return; } // datos corruptos: se borran y se ignora
  clientName = data.clientName || '';
  facilitatorName = data.facilitatorName || '';
  const expectedKeys = activeRoleKeysFor(data.selectedScenarioId || null);
  if(Array.isArray(data.participants) && data.participants.length === expectedKeys.length) participants = data.participants;
  else participants = defaultParticipantsFor(data.selectedScenarioId || null);
  enforceMandatoryRoles();
  selectedScenarioId = data.selectedScenarioId || null;
  // Un escenario cargado desde Word solo vive en esta sesión (ver registerCustomScenario):
  // si la configuración guardada apuntaba a uno, ya no existe tras recargar la página.
  if(selectedScenarioId && !SCENARIOS.some(s => s.id === selectedScenarioId)) selectedScenarioId = null;
  sessionMatrices = data.sessionMatrices || {};
  document.getElementById('clientNameInput').value = clientName;
  document.getElementById('facilitatorNameInput').value = facilitatorName;
  renderParticipants();
  renderScenarioCards();
  // El borrador autoguardado no es un perfil guardado a propósito: hay que confirmar con
  // «Guardar perfil» antes de poder comenzar el ejercicio.
  profileSaved = false;
  updateBottomState();
}

document.getElementById('clientNameInput').addEventListener('input', e => { clientName = e.target.value; profileSaved = false; updateBottomState(); saveSetupState(); });
document.getElementById('facilitatorNameInput').addEventListener('input', e => { facilitatorName = e.target.value; profileSaved = false; updateBottomState(); saveSetupState(); });

// ---------------- scenario cards ----------------
const coreGridEl = document.getElementById('scenarioGridCore');

// Imagen propia por escenario (opcional): si un id no está acá, la tarjeta simplemente
// no trae bloque de imagen (por ejemplo, un escenario personalizado importado de Word).
// Rutas relativas a index.html, ya que ahora se usan en un <img src> real (antes eran
// background-image vía variable CSS, resuelta relativa a la hoja de estilos).
const SCENARIO_BG_IMAGES = {
  dispositivo: 'assets/scenario-bg/dispositivo.png',
  recuperacion_fallida: 'assets/scenario-bg/recuperacion_fallida.png',
  insider: 'assets/scenario-bg/insider.jpg',
  terceros: 'assets/scenario-bg/terceros.jpg',
  credenciales: 'assets/scenario-bg/credenciales.jpg',
  ddos: 'assets/scenario-bg/ddos.jpg',
  phishing_bec: 'assets/scenario-bg/phishing_bec.jpg',
  '0day': 'assets/scenario-bg/0day.jpg',
  exfiltracion: 'assets/scenario-bg/exfiltracion.jpg',
  ransomware: 'assets/scenario-bg/ransomware.jpg'
};
// Encuadre por escenario para object-fit:cover (por defecto "center"): la mayoría de las
// ilustraciones son cuadradas con el ícono ya centrado, así que centrado alcanza. Solo
// se agregan overrides puntuales acá para los casos donde center corta contenido relevante.
const SCENARIO_IMG_POS = {};
function renderScenarioCard(s, container){
  const el = document.createElement('div');
  el.className = 'scn-card' + (selectedScenarioId === s.id ? ' selected' : '');
  const [accent, accent2] = scenarioAccent(s.id);
  el.style.setProperty('--a', accent);
  el.style.setProperty('--a2', accent2);
  el.style.setProperty('--glow', hexToRgba(accent2, 0.55));
  if(SCENARIO_IMG_POS[s.id]) el.style.setProperty('--scn-img-pos', SCENARIO_IMG_POS[s.id]);
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-pressed', selectedScenarioId === s.id ? 'true' : 'false');
  el.setAttribute('aria-label', s.name);
  const icon = SCENARIO_ICONS[s.id] || '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="5.5"/></svg>';
  const blurb = SCENARIO_BLURBS[s.id] || '';
  // Bloque de imagen: rectangular, ancho completo, object-fit:cover (ver .scn-card-img)
  // para que la ilustración llene el marco de borde a borde, sin franjas de fondo blanco/
  // color plano alrededor. Sin imagen para este escenario, la tarjeta arranca directo en
  // el cuerpo.
  const mediaHtml = SCENARIO_BG_IMAGES[s.id]
    ? `<div class="scn-card-media"><img class="scn-card-img" src="${SCENARIO_BG_IMAGES[s.id]}" alt="" loading="lazy"></div>`
    : '';
  el.innerHTML = `
    ${mediaHtml}
    <div class="scn-card-body">
      <div class="scn-head">
        <div class="scn-title-row">
          <span class="scn-icon">${icon}</span>
          <span class="scn-title">${escapeHtml(s.name)}</span>
        </div>
        <div class="scn-head-actions">
          <button class="scn-export-btn" type="button" title="Exportar este escenario a Word" aria-label="Exportar este escenario a Word">⇩</button>
          <span class="scn-check" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.4 6.4 12 13 4.6"/></svg></span>
        </div>
      </div>
      <p class="scn-desc">${escapeHtml(blurb)}</p>
      <div class="scn-fields"><span class="scn-target">${escapeHtml(SCENARIO_TARGETS[s.id] || '—')}</span></div>
    </div>`;
  const choose = () => {
    applyScenarioSelection(s.id);
    renderParticipants();
    renderScenarioCards();
    profileSaved = false;
    updateBottomState();
    saveSetupState();
  };
  el.addEventListener('click', choose);
  el.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(); } });
  el.querySelector('.scn-export-btn').addEventListener('click', e => {
    e.stopPropagation();
    const rm = roleMetaFor(s.id);
    const isCustomRoles = rm !== DEFAULT_ROLE_META;
    const matrix = PARTICIPATION_MATRIX[s.id] || {};
    TibDocx.downloadScenarioDocx({
      name: s.name, blurb: SCENARIO_BLURBS[s.id] || '', target: SCENARIO_TARGETS[s.id] || '',
      intro: SCENARIO_INTROS[s.id] || '',
      facilitatorContext: SCENARIO_FACILITATOR_CONTEXT[s.id] || '',
      roleNames: rm.names,
      customRoleList: isCustomRoles ? rm.keys.map(k => ({key:k, name: rm.names[k]})) : null,
      extraRoleKeys: isCustomRoles ? [] : ROLE_KEYS.filter(k => k !== 'ti' && k !== 'seguridad' && matrix[k]),
      stages: QUESTIONS[s.id]
    });
  });
  container.appendChild(el);
}
function renderScenarioCards(){
  coreGridEl.innerHTML = '';
  SCENARIOS.forEach(s => renderScenarioCard(s, coreGridEl));
}

// ---------------- escenarios personalizados (importados desde Word) ----------------
// A propósito NO se guardan en localStorage: cargar un ejercicio desde Word es algo de "por
// ahora", para la sesión actual del navegador — no debe pasar a formar parte permanente del
// catálogo de la app. Al recargar la página o cerrarla, vuelve a desaparecer; si se quiere
// retomar, se vuelve a cargar el mismo archivo (el .docx sigue siendo la fuente de verdad).
const CUSTOM_SCENARIOS_MIGRATION_KEY = 'tabletop_custom_scenarios_v1'; // versión anterior, ya no se usa
try{ localStorage.removeItem(CUSTOM_SCENARIOS_MIGRATION_KEY); }catch(e){ /* localStorage no disponible; no es crítico */ }
const CUSTOM_SCENARIO_ACCENT = ['#9FB4CE','#5A6E8C'];
const CUSTOM_SCENARIO_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M5.4 2h9.2l5.4 5.4V21A1.8 1.8 0 0 1 18.2 22.8H5.4A1.8 1.8 0 0 1 3.6 21V3.8A1.8 1.8 0 0 1 5.4 2Zm8.2 1.6v4.6h4.6Z"/><path d="M7.2 13h9.6v1.8H7.2Zm0 3.6h9.6v1.8H7.2Z"/></svg>';
// Fondos de tarjeta por cliente para escenarios personalizados importados de Word: si el texto
// del documento menciona al cliente (sin importar en qué etiqueta cae), su tarjeta usa el logo
// del cliente en vez de quedar sin imagen. Buscar por texto (no por id de escenario) porque el
// id se genera desde "NOMBRE DEL ESCENARIO", que puede variar entre documentos del mismo cliente.
// roleCompany: cómo se reparte la empresa de cada función propia del escenario (ver
// ROLE_COMPANY_RULES), para que el paso de participantes la complete sola.
const CUSTOM_SCENARIO_CLIENT_BG = [
  {match: /quintero\s*energ|empresa\s*electrica\s*ventanas/i, image: 'assets/scenario-bg/quintero_energia.jpg', roleCompany: 'eev'}
];
function customScenarioClient(data){
  const text = [data.rawText, data.name, data.blurb, data.target].filter(Boolean).join(' ')
    .normalize('NFD').replace(/\p{M}/gu, '');
  return CUSTOM_SCENARIO_CLIENT_BG.find(c => c.match.test(text)) || null;
}

// Empresa de cada función según el catálogo de roles del cliente: devuelve 'TIBOX' o
// 'cliente' a partir del nombre de la función. Catálogo EEV (skill /roles): de TIBOX son los
// Ingenieros de Soporte N1/N2 y el TeamLeader; todos los demás cargos son de EEV. Operador de
// Sala de Control y Jefe de Turno no están en el catálogo y se asumen de EEV.
const ROLE_COMPANY_RULES = {
  eev: name => {
    const n = String(name || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    return /\bn[12]\b|team\s*leader|tibox|mesa de ayuda/.test(n) ? 'TIBOX' : 'cliente';
  }
};
// Completa la empresa de las funciones que todavía no la tienen asignada (no pisa una
// elección manual). El "cliente" es el nombre registrado en el paso 1, igual que en el modal.
function autoAssignCompanies(scenarioId){
  const entry = SCENARIOS.find(s => s.id === scenarioId);
  const rule = entry && ROLE_COMPANY_RULES[entry.roleCompany];
  if(!rule) return;
  const rm = roleMetaFor(scenarioId);
  participants.forEach(p => {
    if(p.empresa) return;
    p.empresa = rule(rm.names[p.roleKey]) === 'TIBOX' ? 'TIBOX' : (clientName.trim() || 'Cliente');
  });
}

function slugifyScenarioId(name){
  const base = String(name || 'escenario').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'escenario';
  let id = 'custom_' + base, n = 2;
  while(SCENARIOS.some(s => s.id === id)) id = `custom_${base}_${n++}`;
  return id;
}
// Da de alta un escenario (nuevo o ya guardado) en las estructuras globales que usa el
// resto de la app (SCENARIOS, QUESTIONS, PARTICIPATION_MATRIX, ...), tal como si viniera
// de js/data/catalogo.js y escenarios.js. `data` viene de TibDocx.parseScenarioDocxFile
// o de un registro ya persistido en localStorage.
function registerCustomScenario(data){
  const id = data.id || slugifyScenarioId(data.name);
  let entry = SCENARIOS.find(s => s.id === id);
  if(!entry){
    entry = {id, name: data.name, color:'slate', matrixValidated:false, custom:true};
    SCENARIOS.push(entry);
  } else {
    entry.name = data.name;
  }
  // Etapas propias del documento (nombre y cantidad libres); si no vienen, el escenario usa
  // las 5 estándar (STAGE_LABELS) como cualquiera de los que trae la app por defecto.
  entry.customStages = (data.customStages && data.customStages.length) ? data.customStages : null;
  // Funciones propias del documento (ver docx.js, bloque "FUNCIÓN DEL ESCENARIO"); si no vienen,
  // el escenario usa las 6 funciones estándar (Seguridad/TI/Legal/Comunicaciones/RRHH/Dirección).
  entry.roleMeta = (data.customRoles && data.customRoles.length) ? buildCustomRoleMeta(data.customRoles) : null;
  SCENARIO_BLURBS[id] = data.blurb || '';
  SCENARIO_TARGETS[id] = data.target || '';
  SCENARIO_INTROS[id] = data.intro || '';
  SCENARIO_FACILITATOR_CONTEXT[id] = data.facilitatorContext || '';
  SCENARIO_ACCENTS[id] = CUSTOM_SCENARIO_ACCENT;
  SCENARIO_ICONS[id] = CUSTOM_SCENARIO_ICON;
  const client = customScenarioClient(data);
  if(client) SCENARIO_BG_IMAGES[id] = client.image;
  entry.roleCompany = (client && entry.roleMeta) ? client.roleCompany : null;
  if(entry.roleCompany){
    const rule = ROLE_COMPANY_RULES[entry.roleCompany];
    entry.roleMeta.keys.forEach(k => { entry.roleMeta.org[k] = rule(entry.roleMeta.names[k]) === 'TIBOX' ? 'TIBOX' : 'Cliente'; });
  }
  if(entry.roleMeta){
    // Escenario con organigrama propio: todas sus funciones participan siempre (son las únicas
    // que existen para este escenario; no hay concepto de "función que no aplica" aquí).
    const matrix = {};
    entry.roleMeta.keys.forEach(k => { matrix[k] = true; });
    PARTICIPATION_MATRIX[id] = matrix;
  } else {
    const matrix = {seguridad:true, ti:true, legal:false, comunicaciones:false, rrhh:false, direccion:false};
    (data.extraRoleKeys || []).forEach(r => { matrix[r] = true; });
    PARTICIPATION_MATRIX[id] = matrix;
  }
  QUESTIONS[id] = data.stages;
  return id;
}

renderScenarioCards();

// ---------------- participants table ----------------
const bodyEl = document.getElementById('participantsBody');
function renderParticipants(){
  bodyEl.innerHTML = '';
  const rm = roleMetaFor(selectedScenarioId);
  participants.forEach((p, i) => {
    // TI y Seguridad son obligatorias solo en el organigrama estándar (6 funciones fijas); un
    // escenario con funciones propias no tiene ese concepto y deja todas editables.
    const locked = rm === DEFAULT_ROLE_META && (p.roleKey === 'ti' || p.roleKey === 'seguridad');
    const card = document.createElement('div');
    card.className = 'participant-card' + (p.checked ? '' : ' row-inactive');
    const [pBarColor] = (rm.accents && rm.accents[p.roleKey]) || ['#8592AE'];
    card.style.setProperty('--p-bar', pBarColor);
    const hasEmpresa = !!p.empresa;
    card.innerHTML = `
      <div class="pc-head">
        <label class="pc-switch">
          <input type="checkbox" class="pc-switch-input" ${p.checked ? 'checked' : ''} ${locked ? 'disabled title="TI y Seguridad participan siempre"' : ''} data-i="${i}">
          <span class="pc-switch-track"><span class="pc-switch-thumb"></span></span>
        </label>
        <div class="pc-role">
          ${roleIconChipHtml(rm, p.roleKey)}
          <span class="pc-role-name">${escapeHtml(rm.names[p.roleKey] || p.roleKey)}</span>
        </div>
        <span class="pc-status-pill">${p.checked ? 'ACTIVO' : 'INACTIVO'}</span>
      </div>
      <p class="pc-desc" title="${escapeHtml(rm.desc[p.roleKey] || '')}">${escapeHtml(rm.desc[p.roleKey] || '')}</p>
      <div class="pc-empresa">
        <button type="button" class="pc-empresa-btn" data-i="${i}" aria-label="${hasEmpresa ? `Empresa asignada: ${escapeHtml(p.empresa)}. Editar.` : 'Asignar empresa'}">${hasEmpresa ? `EMPRESA: ${escapeHtml(p.empresa)}` : 'EMPRESA'}</button>
      </div>`;
    card.querySelector('.pc-empresa-btn').addEventListener('click', () => openCompanyModal(i));
    card.querySelector('.pc-switch-input').addEventListener('change', e => {
      participants[i].checked = e.target.checked;
      renderParticipants();
      profileSaved = false;
      updateBottomState();
      saveSetupState();
    });
    bodyEl.appendChild(card);
  });
}
// El truco textContent->innerHTML solo escapa &/</> (posición de texto entre etiquetas) — no
// comillas. La mayoría de los usos en este archivo interpolan dentro de texto y están bien,
// pero varios sitios (ej. buildStepper, este mismo botón de empresa) lo usan DENTRO de un
// atributo `"..."`, donde una comilla sin escapar rompe el atributo e inyecta HTML/atributos
// nuevos — con nombre de cliente o nombres de etapa de un Word cargado, ambos texto libre sin
// validar, esto era explotable. Se agrega el escape de comillas para que escapeHtml() sea
// seguro también en posición de atributo, sin tener que acordarse caso por caso.
function escapeHtml(s){
  const d = document.createElement('div'); d.textContent = s;
  return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function participantName(p){ return ROLE_NAMES[p.roleKey]; }
renderParticipants();

// ---------------- modal de asignación de empresa ----------------
// Reemplaza el popout de doble clic de antes: un modal centrado (mismo patrón que
// showConfirmModal/showRuleModal — overlay + caja creados al vuelo) que se abre con un
// solo clic en el botón "EMPRESA" de la tarjeta del rol.
let closeCompanyModalFn = null;
function closeCompanyModal(){
  if(closeCompanyModalFn) closeCompanyModalFn();
}
function openCompanyModal(i){
  closeCompanyModal();
  const p = participants[i];
  const rm = roleMetaFor(selectedScenarioId);
  const roleName = rm.names[p.roleKey] || p.roleKey;
  // Solo 2 empresas posibles para cualquier función: TIBOX (equipo propio) o el cliente cuyo
  // nombre se registró en el paso 1 del wizard — nunca texto libre. Si por algo p.empresa
  // quedó con otro valor (ej. de una sesión vieja o un cliente que cambió de nombre), no
  // coincide con ninguna opción y el select arranca sin selección, forzando a elegir de nuevo.
  const clientOption = clientName.trim() || 'Cliente';
  const options = ['TIBOX', clientOption];

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="companyModalTitle">
      <div class="modal-head">
        <div class="modal-title" id="companyModalTitle">Asignar empresa para ${escapeHtml(roleName)}</div>
        <button class="modal-close-btn" id="companyModalClose" aria-label="Cerrar">✕</button>
      </div>
      <label for="companyModalInput">Empresa</label>
      <select id="companyModalInput">
        <option value="" disabled ${!options.includes(p.empresa) ? 'selected' : ''}>Selecciona una empresa</option>
        ${options.map(opt => `<option value="${escapeHtml(opt)}" ${p.empresa === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('')}
      </select>
      <div class="modal-actions" style="margin-top:18px;">
        <button class="btn" id="companyModalCancel">Cancelar</button>
        <button class="btn-cta" id="companyModalSave">Guardar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#companyModalInput');
  input.focus();

  function save(){
    if(!input.value) return; // sigue en el placeholder ("Selecciona una empresa"): no hay nada que guardar
    participants[i].empresa = input.value;
    renderParticipants();
    profileSaved = false;
    updateBottomState();
    saveSetupState();
    closeCompanyModal();
  }
  function onKey(ev){
    if(ev.key === 'Escape') closeCompanyModal();
    if(ev.key === 'Enter'){ ev.preventDefault(); save(); }
  }
  overlay.querySelector('#companyModalSave').addEventListener('click', save);
  overlay.querySelector('#companyModalCancel').addEventListener('click', closeCompanyModal);
  overlay.querySelector('#companyModalClose').addEventListener('click', closeCompanyModal);
  overlay.addEventListener('mousedown', e => { if(e.target === overlay) closeCompanyModal(); });
  document.addEventListener('keydown', onKey);

  closeCompanyModalFn = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    closeCompanyModalFn = null;
  };
}

// ---------------- wizard de configuración: stepper + CTA ----------------
const CHECK_ICON = '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.4 6.4 12 13 4.6"/></svg>';

function renderWizardStepper(){
  document.getElementById('wizardStepper').innerHTML = WIZARD_STEPS.map(step => {
    const done = step.n < currentSetupStep;
    const active = step.n === currentSetupStep;
    const clickable = step.n <= furthestSetupStep && !active;
    const cls = ['wizard-step-item', done ? 'done' : '', active ? 'active' : '', clickable ? 'clickable' : ''].filter(Boolean).join(' ');
    return `
    <button type="button" class="${cls}" data-goto="${step.n}" ${clickable ? '' : 'disabled'}>
      <span class="wizard-step-n">${done ? CHECK_ICON : step.n}</span>
      <span class="wizard-step-label">${escapeHtml(step.label)}</span>
    </button>`;
  }).join('');
  document.querySelectorAll('.wizard-step-item.clickable').forEach(btn => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.goto, 10)));
  });
}

const STEP3_ALERT_ICON_WARN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>';
const STEP3_ALERT_ICON_OK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 5-5"/></svg>';
function updateBottomState(){
  const hasClientName = !!clientName.trim();
  const hasScenario = !!selectedScenarioId;
  const activeParticipants = participants.filter(p => p.checked);
  const activeCount = activeParticipants.length;
  const hasParticipant = activeCount > 0;
  const rm = hasScenario ? roleMetaFor(selectedScenarioId) : null;
  // Cada función activa (incluidas TI/Seguridad, que siempre están activas) necesita su
  // empresa asignada antes de poder empezar — sin esto, el informe final no puede atribuir
  // correctamente quién ejecutó cada acción.
  const missingEmpresa = hasScenario ? activeParticipants.filter(p => !p.empresa || !p.empresa.trim()) : [];
  const scenarioName = hasScenario ? SCENARIOS.find(s => s.id === selectedScenarioId).name : null;
  const canStart = hasScenario && hasParticipant && missingEmpresa.length === 0;

  renderWizardStepper();

  const setupNextBtn = document.getElementById('setupNextBtn');
  if(setupNextBtn){
    const label=document.getElementById('setupNextBtnLabel');
    if(currentSetupStep === 1){
      setupNextBtn.disabled = !hasClientName;
      if(label) label.textContent = 'Siguiente';
    } else if(currentSetupStep === 2){
      setupNextBtn.disabled = !hasScenario;
      if(label) label.textContent = 'Siguiente';
    } else {
      setupNextBtn.disabled = !canStart;
      if(label) label.textContent = 'Comenzar ejercicio';
    }
  }

  const scnBadge = document.getElementById('scenarioBadge');
  if(scnBadge) scnBadge.textContent = scenarioName || 'Sin escenario';
  const pBadge = document.getElementById('participantsBadge');
  if(pBadge) pBadge.textContent = `${activeCount} activa${activeCount === 1 ? '' : 's'}`;

  // Paso 1: sin nombre de cliente no se puede seguir a "Escenario".
  const step1Summary = document.getElementById('wizardStep1Summary');
  if(step1Summary){
    if(hasClientName){
      step1Summary.className = 'step3-alert is-ready';
      step1Summary.innerHTML = `${STEP3_ALERT_ICON_OK}<span>Perfil listo — puedes continuar.</span>`;
    } else {
      step1Summary.className = 'step3-alert is-warning';
      step1Summary.innerHTML = `${STEP3_ALERT_ICON_WARN}<span>Escribe el nombre del cliente para continuar.</span>`;
    }
  }

  // Paso 2: sin escenario elegido no se puede seguir a "Participantes".
  const step2Summary = document.getElementById('wizardStep2Summary');
  if(step2Summary){
    if(hasScenario){
      step2Summary.className = 'step3-alert is-ready';
      step2Summary.innerHTML = `${STEP3_ALERT_ICON_OK}<span>${escapeHtml(`Escenario elegido: ${scenarioName}.`)}</span>`;
    } else {
      step2Summary.className = 'step3-alert is-warning';
      step2Summary.innerHTML = `${STEP3_ALERT_ICON_WARN}<span>Elige un escenario para continuar.</span>`;
    }
  }

  // Paso 3: sin escenario, sin participantes activos, o con alguna función activa sin
  // empresa asignada, no se puede comenzar el ejercicio.
  const summaryEl = document.getElementById('wizardStep3Summary');
  if(summaryEl){
    if(canStart){
      summaryEl.className = 'step3-alert is-ready';
      summaryEl.innerHTML = `${STEP3_ALERT_ICON_OK}<span>${escapeHtml(`Escenario elegido: ${scenarioName} · ${activeCount} ${activeCount === 1 ? 'función activa' : 'funciones activas'}.`)}</span>`;
    } else {
      summaryEl.className = 'step3-alert is-warning';
      const missingParts = [];
      if(!hasScenario) missingParts.push('elegir escenario');
      if(!hasParticipant) missingParts.push('marcar al menos un participante');
      if(hasScenario && missingEmpresa.length > 0){
        const names = missingEmpresa.map(p => (rm && rm.names[p.roleKey]) || p.roleKey).join(', ');
        missingParts.push(`asignar la empresa de: ${names}`);
      }
      summaryEl.innerHTML = `${STEP3_ALERT_ICON_WARN}<span>${escapeHtml(`Falta: ${missingParts.join('; ')}.`)}</span>`;
    }
  }
}
// La app abre siempre en la pantalla de bienvenida (reglas del ejercicio); recién al presionar
// «Siguiente» ahí se entra al modo configuración que antes era la pantalla inicial.
TabletopScreens.show('intro', {scroll: false});
updateBottomState();

// Restaura la configuración solo si esta misma pestaña se recargó (ver saveSetupState).
loadSetupState();

function enterSetup(){
  TabletopScreens.show('setup');
  goToStep(1);
}

// Vuelve de la configuración a la pantalla de bienvenida, dentro de la misma sesión
// (el logo ya no usa esto: ahora navega directo al índice principal del sitio).
function goHome(){
  hideExplain();
  if(gameState.timerInterval) clearInterval(gameState.timerInterval);
  TabletopScreens.show('intro');
  updateBottomState();
}

function goToStep(n){
  currentSetupStep = n;
  if(n > furthestSetupStep) furthestSetupStep = n;
  document.querySelectorAll('.wizard-step').forEach(el => {
    el.classList.toggle('hidden', parseInt(el.dataset.step, 10) !== n);
  });
  window.scrollTo({top: 0, behavior: 'smooth'});
  updateBottomState();
}

// ---------------- reglas del ejercicio: detalle educativo en modal al hacer clic ----------------
// Estructura de cada regla: badge (fase), título táctico, el porqué (por qué importa en un
// incidente real), el cómo (qué hace el participante en esta interfaz) y un tip pro/CTA.
// Un color de acento propio por regla (mismo mecanismo --a/--a-dim/--a-border que usan las
// tarjetas de escenario y de función) le da variedad visual sin salirse de la paleta TIBOX.
const RULE_ICON_WHY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/></svg>';
const RULE_ICON_HOW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M5 3l6.5 16 2-6.5L20 10.5z"/></svg>';
const RULE_ICON_TIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3L3 9.5l6.4-.6z"/></svg>';
// Lenguaje pensado para cualquier persona que participe del ejercicio, no solo para quienes
// ya conocen el vocabulario de gestión de crisis/ciberseguridad (ej. evitar "comité de
// crisis", "matriz de responsabilidades", "post-mortem", "segregación de funciones") — este
// modal lo puede leer cualquiera antes de empezar, incluida gente de Legal, RRHH o Comunicaciones
// que nunca ha participado de un ejercicio así.
const RULE_DETAILS = {
  1: {
    badge: 'Antes de empezar',
    accent: '#0FC7F6',
    title: 'Se prepara el terreno antes de comenzar',
    why: 'En una crisis real, gran parte del caos inicial no lo causa el ataque, sino no saber quién está participando, qué está en juego y quién decide qué. Cuando el comité de respuesta se arma improvisando sobre la marcha, se pierden minutos valiosos — y esos minutos son los que más importan.',
    how: 'Primero se elige el tipo de ataque que se va a simular (por ejemplo, un ransomware o un phishing dirigido) y se marca qué áreas de la organización participan en esta sesión: Tecnología (TI), Legal, Comunicaciones, Recursos Humanos y Dirección son opcionales según el caso, mientras que Seguridad y TI participan siempre. Junto con esto, se registra el perfil del cliente (su nombre y el del facilitador a cargo): es un dato obligatorio, y la aplicación no permite continuar sin completarlo.',
    tip: 'Un plan de respuesta que nunca se ha ensayado con las personas reales de la organización es solo un documento. Mientras más parecida sea esta configuración inicial a la realidad de la organización, más útil resulta el diagnóstico que arroja el ejercicio al final.'
  },
  2: {
    badge: 'Cómo avanza',
    accent: '#F3E006',
    title: 'El ejercicio avanza por etapas, sin poder adelantarse',
    why: 'Una crisis de ciberseguridad no ocurre de una sola vez: es una secuencia de momentos, y lo que se decide (o no se decide) en uno de ellos condiciona qué opciones quedan disponibles en el siguiente. Los equipos suelen fallar más seguido por saltarse un paso que por tomar una mala decisión dentro de él.',
    how: 'El incidente se juega en un orden fijo, de principio a fin, dividido en varias etapas (por ejemplo: detección, contención, recuperación y cierre). Cada etapa presenta una o más situaciones nuevas dentro del mismo caso. No es posible adelantarse a una etapa futura, y solo se puede retroceder a la pregunta anterior con el botón correspondiente en la parte superior de la pantalla.',
    tip: 'En una crisis real conviene resistir la tentación de "saltar directo a la solución": actuar antes de entender bien la situación casi siempre significa actuar sobre lo que no correspondía.'
  },
  3: {
    badge: 'Quién actúa',
    accent: '#FF8A3D',
    title: 'Actúa quien corresponde, no quien esté más disponible',
    why: 'En una crisis real, la persona más disponible no siempre es quien debe tomar la decisión — a veces por su función dentro de la organización, a veces porque esa decisión requiere una autoridad específica. Confundir esto genera respuestas desordenadas y, en el peor de los casos, decisiones tomadas por quien no tenía la atribución para hacerlo.',
    how: 'Frente a cada situación planteada, se elige entre las funciones disponibles (por ejemplo, Seguridad, TI o Legal) cuál de ellas debería hacerse cargo de esa acción específica. Elegir una función que no corresponde cuenta como error, y antes de permitir un nuevo intento la aplicación explica por qué esa función no era la indicada.',
    tip: 'Si durante el ejercicio hay dudas constantes sobre "a quién le toca esto", el problema no es el ejercicio en sí — es una señal de que, en la organización real, tampoco está del todo claro quién hace qué. Conviene anotarlo para conversarlo en el cierre de la sesión.'
  },
  4: {
    badge: 'Qué se decide',
    accent: '#FF4D6A',
    title: 'De varias opciones parecidas, solo una es la correcta',
    why: 'Las alternativas incorrectas de este ejercicio no son absurdas a propósito: están escritas para parecerse mucho a la decisión correcta, con un solo detalle que las hace equivocadas (un paso que falta, un orden distinto, un supuesto que no se confirmó). De esta forma se pone a prueba el criterio del equipo, no su memoria.',
    how: 'Una vez elegida la función correcta, se revisan las alternativas disponibles y se conversa en equipo cuál es la más adecuada para la situación planteada. Si la elección es incorrecta, la aplicación explica exactamente por qué antes de permitir un nuevo intento — no hay penalización por volver a intentarlo, solo por no analizar bien la situación antes de decidir.',
    tip: 'Conviene conversar en voz alta antes de elegir una alternativa. Lo más valioso de este ejercicio no es acertar: es observar cómo razona el equipo bajo presión, ya que ahí suelen aparecer los supuestos equivocados.'
  },
  5: {
    badge: 'Al cerrar',
    accent: '#22D3A6',
    title: 'Lo que no se conversa después, se repite',
    why: 'Un ejercicio de simulación que termina sin conversar los resultados es, en el mejor de los casos, una tarde bien invertida y nada más. Lo más valioso de un tabletop —igual que el de un incidente real— está en la revisión posterior: qué salió bien, dónde hubo dificultades y qué acción concreta evita que el mismo error vuelva a ocurrir.',
    how: 'Al terminar la última etapa, la aplicación genera automáticamente un puntaje general, un informe con los patrones de error más frecuentes y recomendaciones asociadas, y un acta de la sesión con los datos del cliente y del facilitador. Este informe se puede guardar en el navegador o descargar en formato JSON para adjuntarlo a un reporte propio de la organización.',
    tip: 'Conviene compartir el informe con el equipo mientras el ejercicio todavía está fresco en la memoria de todos. Un hallazgo que se detecta pero que nadie asume como propio para mejorarlo, tarde o temprano, vuelve a repetirse.'
  }
};
let activeRuleModal = null;
function showRuleModal(ruleN){
  const rule = RULE_DETAILS[ruleN];
  if(!rule) return;
  closeRuleModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'ruleModal';
  overlay.innerHTML = `
    <div class="modal-box rule-modal-box" role="dialog" aria-modal="true" aria-labelledby="ruleModalTitle"
         style="--a:${rule.accent}; --a-dim:${hexToRgba(rule.accent, 0.14)}; --a-border:${hexToRgba(rule.accent, 0.35)};">
      <div class="modal-head">
        <span class="rule-badge">${escapeHtml(rule.badge)}</span>
        <button class="modal-close-btn" id="ruleModalClose" aria-label="Cerrar">✕</button>
      </div>
      <h3 class="rule-modal-title" id="ruleModalTitle">${escapeHtml(rule.title)}</h3>
      <div class="rule-modal-section">
        <div class="rule-modal-section-head">${RULE_ICON_WHY}<span>El porqué</span></div>
        <p>${escapeHtml(rule.why)}</p>
      </div>
      <div class="rule-modal-section">
        <div class="rule-modal-section-head">${RULE_ICON_HOW}<span>En la simulación</span></div>
        <p>${escapeHtml(rule.how)}</p>
      </div>
      <div class="rule-modal-tip">
        ${RULE_ICON_TIP}
        <p><b>Tip pro:</b> ${escapeHtml(rule.tip)}</p>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  activeRuleModal = overlay;
  const onKey = e => { if(e.key === 'Escape') closeRuleModal(); };
  overlay.addEventListener('mousedown', e => { if(e.target === overlay) closeRuleModal(); });
  overlay.querySelector('#ruleModalClose').addEventListener('click', closeRuleModal);
  document.addEventListener('keydown', onKey);
  overlay._onKey = onKey;
  overlay.querySelector('#ruleModalClose').focus();
}
function closeRuleModal(){
  if(!activeRuleModal) return;
  document.removeEventListener('keydown', activeRuleModal._onKey);
  activeRuleModal.remove();
  activeRuleModal = null;
}
document.querySelectorAll('.rule-step[data-rule]').forEach(el => {
  const open = () => showRuleModal(el.dataset.rule);
  el.addEventListener('click', open);
  el.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
});

// ---------------- carrusel "Cómo funciona" ----------------
// Autoavance cada 2s con barra de progreso, flechas/puntos para navegar a mano y pausa al
// pasar el cursor por encima. El progreso se anima a mano con requestAnimationFrame (en vez
// de una transición CSS) porque así se puede pausar/reanudar exactamente donde iba, sin
// saltos — algo que una transición CSS no deja hacer de forma limpia.
(function initRulesCarousel(){
  const root = document.getElementById('rulesCarousel');
  if(!root) return;
  const track = document.getElementById('carouselTrack');
  const progressBar = document.getElementById('carouselProgressBar');
  const dots = Array.from(document.querySelectorAll('#carouselDots .carousel-dot'));
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const slideCount = track.children.length;
  const SLIDE_MS = 10000; // tiempo para leer título + resumen de cada regla sin sentirse apurado

  let current = 0;
  let rafId = null;
  let advanceTimer = null;
  let slideStartTime = 0;
  let pausedElapsed = 0;
  let paused = false;

  function goTo(index){
    current = (index + slideCount) % slideCount;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
    restartTimer();
  }

  function tickProgress(){
    const elapsed = performance.now() - slideStartTime;
    progressBar.style.width = Math.min(100, (elapsed / SLIDE_MS) * 100) + '%';
    rafId = requestAnimationFrame(tickProgress);
  }

  // Reinicia el ciclo de esta diapositiva desde cero (0% de progreso, SLIDE_MS completos) —
  // se usa tanto al llegar a una diapositiva nueva como al navegar a mano.
  function restartTimer(){
    clearTimeout(advanceTimer);
    cancelAnimationFrame(rafId);
    pausedElapsed = 0;
    progressBar.style.width = '0%';
    if(paused) return; // se retoma con el tiempo completo cuando el cursor salga (ver resume)
    slideStartTime = performance.now();
    rafId = requestAnimationFrame(tickProgress);
    advanceTimer = setTimeout(() => goTo(current + 1), SLIDE_MS);
  }

  function pause(){
    if(paused) return;
    paused = true;
    pausedElapsed = performance.now() - slideStartTime;
    clearTimeout(advanceTimer);
    cancelAnimationFrame(rafId);
  }

  function resume(){
    if(!paused) return;
    paused = false;
    slideStartTime = performance.now() - pausedElapsed;
    const remaining = Math.max(0, SLIDE_MS - pausedElapsed);
    rafId = requestAnimationFrame(tickProgress);
    advanceTimer = setTimeout(() => goTo(current + 1), remaining);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  root.addEventListener('mouseenter', pause);
  root.addEventListener('mouseleave', resume);

  goTo(0);
})();

document.getElementById('continueBtn').addEventListener('click', enterSetup);
document.getElementById('setupBackBtn').addEventListener('click', () => {
  if(currentSetupStep === 1) goHome();
  else goToStep(currentSetupStep - 1);
});
// ---------------- modo "Con celulares" (opcional) ----------------
// Apagado por defecto: sin tocar el toggle, "Comenzar ejercicio" hace exactamente lo mismo
// que siempre (startGame() directo). Con el toggle activo, primero pasa por la sala de espera
// (window.MP, ver js/multiplayer/facilitator.js) y solo al tocar "Iniciar ejercicio" ahí se
// llama a la misma startGame() sin modificarla — ver plan de multijugador, Fase 1.
let multiplayerEnabled = false;
// Código de la sala activa (Fase 2 lo usa en renderStage/renderCharGrid/onCharacterPick para
// publicar el acto y la votación) — solo tiene valor mientras dura un ejercicio que arrancó
// desde el lobby; se vuelve a fijar en cada "Comenzar ejercicio" con celulares.
let mpRoomCode = null;
// Roster {roleKey,name,org,accent} publicado al crear la sala (ver startGameOrLobby) — se
// reusa tal cual para repintar el popout "Sala" (#roomInfoBtn) sin recalcularlo.
let mpRoleRoster = [];
// Cuántas veces se reintentó el acto vigente (0 = primera vez). Sube cada vez que la persona
// responde mal desde su celular y se le vuelve a habilitar la misma pregunta (ver onAnswerPick)
// y vuelve a 0 apenas se avanza a un acto distinto (ver renderStage). Forma parte del actKey
// que se publica en Firestore para que los celulares sepan que hay una ronda NUEVA (si no, un
// participante que ya votó/respondió en la ronda anterior quedaría con su pantalla congelada).
let mpActRevote = 0;
function currentActKey(){
  return `${gameState.stepIndex}-${gameState.subIndex}-${mpActRevote}`;
}
document.getElementById('mpEnabledInput').addEventListener('change', e => { multiplayerEnabled = e.target.checked; });

// Introducción del escenario (#screen-briefing): se muestra entre la configuración (o la sala
// de espera) y la primera etapa. roomCode: solo en modo "Con celulares" — publica la misma
// introducción en la sala para que los celulares la muestren mientras tanto, y oculta "Volver"
// porque la sala ya quedó iniciada (volver a configurar dejaría a los celulares colgados).
function showBriefing(onStart, roomCode){
  const id = selectedScenarioId;
  const scenario = SCENARIOS.find(s => s.id === id);
  const rm = roleMetaFor(id);
  const roleKeys = sessionRoleKeys(id);
  const intro = (SCENARIO_INTROS[id] || '').trim();
  // Mismas etapas y actos que se van a jugar (funciones activas de esta sesión).
  const sessionStages = buildStagesForSession(id);
  const totalActs = sessionStages.reduce((n, s) => n + stageQuestions(s).length, 0);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  const [accent, accent2] = scenarioAccent(id);
  const panel = document.querySelector('#screen-briefing .briefing-panel');
  panel.style.setProperty('--a', accent);
  panel.style.setProperty('--a2', accent2);
  document.getElementById('briefingIcon').innerHTML = SCENARIO_ICONS[id] || ''; // SVG del catálogo
  document.getElementById('briefingTitle').textContent = scenario ? scenario.name : '';
  document.getElementById('briefingBlurb').textContent = SCENARIO_BLURBS[id] || '';
  document.getElementById('briefingTarget').textContent = SCENARIO_TARGETS[id] || '—';
  document.getElementById('briefingStats').innerHTML = [
    clientName.trim() ? `<span class="briefing-stat is-client">${escapeHtml(clientName.trim())}</span>` : '',
    `<span class="briefing-stat">${plural(sessionStages.length, 'etapa', 'etapas')}</span>`,
    `<span class="briefing-stat">${plural(totalActs, 'acto', 'actos')}</span>`,
    `<span class="briefing-stat">${plural(roleKeys.length, 'función', 'funciones')}</span>`
  ].join('');
  document.getElementById('briefingStages').innerHTML = sessionStages.map((s, i) => {
    const acts = stageQuestions(s).length;
    return `<li><span class="bs-n">${i + 1}</span><span class="bs-text"><span class="bs-name">${escapeHtml(s.stage)}</span><span class="bs-acts">${plural(acts, 'acto', 'actos')}</span></span></li>`;
  }).join('');
  document.getElementById('briefingRoles').innerHTML = roleKeys.map(k => {
    const [c] = rm.accents[k] || ['#8592AE'];
    const company = roleCompanyFor(k, id);
    return `<span class="briefing-role" style="--c:${c};"><span class="br-dot"></span><span class="br-name">${escapeHtml(rm.names[k])}</span>${company ? `<span class="br-org">${escapeHtml(company)}</span>` : ''}</span>`;
  }).join('') || '—';
  const textEl = document.getElementById('briefingText');
  textEl.innerHTML = intro.split(/\n\s*\n/).filter(t => t.trim()).map(t => `<p>${escapeHtml(t.trim())}</p>`).join('');
  textEl.classList.toggle('hidden', !intro);

  const backBtn = document.getElementById('briefingBackBtn');
  const startBtn = document.getElementById('briefingStartBtn');
  const contextBtn = document.getElementById('briefingContextBtn');
  TabletopScreens.show('briefing');
  backBtn.classList.toggle('hidden', !!roomCode);
  // Contexto para facilitadores (solo si el escenario lo trae): se abre solo antes de la
  // introducción y se puede volver a abrir con el botón "Contexto".
  const facilitatorContext = (SCENARIO_FACILITATOR_CONTEXT[id] || '').trim();
  contextBtn.classList.toggle('hidden', !facilitatorContext);
  contextBtn.onclick = facilitatorContext ? () => showFacilitatorContext(facilitatorContext) : null;
  if(facilitatorContext) showFacilitatorContext(facilitatorContext);

  if(roomCode && window.MP) window.MP.publishBriefing(roomCode, {title: scenario ? scenario.name : '', intro});

  const leave = () => {
    startBtn.onclick = null;
    backBtn.onclick = null;
  };
  startBtn.onclick = () => { leave(); onStart(); };
  backBtn.onclick = () => {
    leave();
    TabletopScreens.show('setup', {scroll: false});
    updateBottomState();
  };
}

// Ventana "Contexto": notas para el facilitador. Solo en esta pantalla (los celulares no la
// reciben); por eso es una ventana que se lee y se cierra antes de proyectar la introducción.
// El texto se ordena en antecedentes / cronología / datos clave (ver js/context-format.js).
function showFacilitatorContext(text){
  const html = window.formatFacilitatorContext(text);
  return showConfirmModal({
    title: 'Contexto',
    message: `<div class="facilitator-context">${html}</div>`,
    confirmText: 'Continuar a la introducción',
    cancelText: null
  });
}

function startGameOrLobby(){
  if(!multiplayerEnabled){ showBriefing(startGame); return; }
  if(!window.MP){
    alert('El modo "Con celulares" no terminó de cargar (revisa tu conexión) — desactiva el toggle o recarga la página.');
    return;
  }
  const rm = roleMetaFor(selectedScenarioId);
  const roleRoster = sessionRoleKeys(selectedScenarioId).map(k => ({
    roleKey: k,
    name: rm.names[k],
    org: roleCompanyFor(k, selectedScenarioId),
    accent: rm.accents[k] || ['#5AD1E8','#0B8FD6']
  }));
  mpRoleRoster = roleRoster; // se reusa en el popout "Sala" (#roomInfoBtn) durante el ejercicio
  window.MP.openLobby({scenarioId: selectedScenarioId, roleRoster, onStart: code => { mpRoomCode = code; showBriefing(startGame, code); }});
}

document.getElementById('roomInfoBtn').addEventListener('click', () => {
  if(multiplayerEnabled && mpRoomCode && window.MP) window.MP.openRoomPanel(mpRoomCode, mpRoleRoster);
});

document.getElementById('setupNextBtn').addEventListener('click', () => {
  if(currentSetupStep === 3){
    if(!document.getElementById('setupNextBtn').disabled) startGameOrLobby();
  } else {
    goToStep(currentSetupStep + 1);
  }
});

const playbookFileInput = document.getElementById('playbookFile');
const playbookFileName = document.getElementById('playbookFileName');
const playbookStatus = document.getElementById('playbookStatus');

playbookFileInput.addEventListener('change', () => {
  const file = playbookFileInput.files[0];
  playbookFileName.textContent = file ? file.name : 'Ningún archivo seleccionado';
  playbookStatus.textContent = '';
});

// Arrastrar y soltar sobre la dropzone: el <label> ya abre el selector de archivos al
// hacer clic (input anidado adentro); esto suma soltar un archivo arrastrado, asignándolo
// al mismo <input> y disparando su evento 'change' para reusar la lógica de arriba.
const playbookDropzone = document.getElementById('playbookDropzone');
['dragenter', 'dragover'].forEach(evt => {
  playbookDropzone.addEventListener(evt, e => {
    e.preventDefault();
    playbookDropzone.classList.add('dragover');
  });
});
['dragleave', 'dragend'].forEach(evt => {
  playbookDropzone.addEventListener(evt, e => {
    e.preventDefault();
    playbookDropzone.classList.remove('dragover');
  });
});
playbookDropzone.addEventListener('drop', e => {
  e.preventDefault();
  playbookDropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if(!file) return;
  playbookFileInput.files = e.dataTransfer.files;
  playbookFileInput.dispatchEvent(new Event('change'));
});

// Un .docx se interpreta como un escenario a importar (ver formato de plantilla); cualquier
// otro tipo de archivo (pdf/doc/txt/json) se trata como material de referencia sin procesar,
// igual que antes.
document.getElementById('loadPlaybookBtn').addEventListener('click', async () => {
  const file = playbookFileInput.files[0];
  if(!file){
    playbookStatus.textContent = 'Selecciona un archivo para cargarlo.';
    playbookStatus.style.color = 'var(--amber)';
    return;
  }
  if(!/\.docx$/i.test(file.name)){
    playbookStatus.style.color = 'var(--green)';
    playbookStatus.textContent = `Playbook cargado: ${file.name}`;
    return;
  }
  playbookStatus.style.color = 'var(--muted)';
  playbookStatus.textContent = 'Leyendo el escenario…';
  try{
    const data = await TibDocx.parseScenarioDocxFile(file);
    const id = registerCustomScenario(data);
    applyScenarioSelection(id);
    renderParticipants();
    renderScenarioCards();
    profileSaved = false;
    updateBottomState();
    saveSetupState();
    playbookStatus.style.color = 'var(--green)';
    playbookStatus.textContent = `Escenario "${data.name}" cargado y seleccionado para esta sesión — continúa a "Tipo de ataque" para verlo.`;
  }catch(e){
    playbookStatus.style.color = 'var(--red)';
    playbookStatus.textContent = e.message || 'No se pudo leer el documento.';
  }
});

// ---------------- game screen ----------------
let gameState = { scenarioId:null, stages:null, stepIndex:0, subIndex:0, chosenCorrectParticipant:null, nextAction:null, startTime:null, timerInterval:null, wrongCharacterCount:0, wrongAnswerCount:0, totalQuestions:0, stageStats:{}, characterMistakes:[], answerAttemptLog:[], currentAnswerAttempts:0, history:[], actLog:[], currentAct:null, personByRole:{} };

function stageQuestions(stageEntry){
  return stageEntry.questions || [stageEntry];
}

function buildStepper(stageLabels){
  const el = document.getElementById('gameStepper');
  // Solo el número — el nombre completo de la etapa queda como tooltip (title) y ya se ve
  // grande en el panel de la situación mientras esa etapa está activa. Así el stepper se ve
  // igual de prolijo con 5 etapas que con las que traiga un escenario importado de Word.
  el.innerHTML = stageLabels.map((label, i) => `
    <div class="gh-step" data-step="${i}" title="${escapeHtml(label)}">
      <span class="gh-step-n">${i + 1}</span>
    </div>`).join('');
}

function setStep(n){
  document.querySelectorAll('#gameStepper .gh-step').forEach(stepEl => {
    const idx = parseInt(stepEl.dataset.step, 10);
    stepEl.classList.remove('active','completed');
    if(idx < n) stepEl.classList.add('completed');
    else if(idx === n) stepEl.classList.add('active');
  });
}

function fmtElapsed(ms){ const t=Math.floor(ms/1000); return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'); }

// Algunos escenarios (p.ej. ransomware) traen varias "variantes narrativas" de la misma pregunta
// por etapa (mismo target, mismas opciones y explicaciones; solo cambia el detalle de la historia).
// Antes se mostraban TODAS seguidas en una misma sesión, haciendo esa etapa 5-10x más larga y
// repetitiva que en otros escenarios. Esto agrupa esas variantes por firma (target+opciones+explicaciones)
// y elige una al azar por grupo, dejando intactas las preguntas realmente distintas (distinto target).
function sampleVariants(qs){
  const groups = [];
  const seen = new Map();
  qs.forEach(q => {
    const sig = q.target + '|' + JSON.stringify(q.options) + '|' + JSON.stringify(q.explanations);
    if(!seen.has(sig)){ const g = []; seen.set(sig, g); groups.push(g); }
    seen.get(sig).push(q);
  });
  return groups.map(g => g[Math.floor(Math.random() * g.length)]);
}

function buildStagesForSession(scenarioId){
  const rawStages = QUESTIONS[scenarioId];
  const rm = roleMetaFor(scenarioId);
  // El auto-cierre (Dirección/Seguridad) y la red de seguridad de "seguridad" son reglas del
  // organigrama estándar; un escenario con funciones propias ya trae su propio cierre y no tiene
  // una función universal a la que recurrir, así que usa su primera función declarada.
  const isStandard = rm === DEFAULT_ROLE_META;
  return rawStages.map(stageEntry => {
    let qs = stageQuestions(stageEntry).filter(q => {
      // una pregunta solo entra si su función está activa en la sesión (isRoleActive). TI y
      // Seguridad siempre lo están: la matriz las fuerza en getMatrix() y su checkbox está
      // bloqueado en renderParticipants().
      return isRoleActive(q.target, scenarioId);
    });
    qs = sampleVariants(qs);
    if(isStandard && stageEntry.stage === 'Cierre'){
      // el cierre lo autoriza Dirección si participa (matriz) y sigue marcada hoy; si no, lo asume Seguridad
      const closingRole = isRoleActive('direccion', scenarioId) ? 'direccion' : 'seguridad';
      qs = qs.map(q => ({...q, target: closingRole}));
    }
    // red de seguridad: nunca dejar una etapa sin preguntas.
    if(qs.length === 0) qs = [{...stageQuestions(stageEntry)[0], target: isStandard ? 'seguridad' : rm.keys[0]}];
    return {stage: stageEntry.stage, questions: qs};
  });
}

function startGame(){
  gameState.scenarioId = selectedScenarioId;
  gameState.stages = buildStagesForSession(selectedScenarioId);
  gameState.stepIndex = 0;
  gameState.subIndex = 0;
  gameState.chosenCorrectParticipant = null;
  gameState.startTime = null;
  gameState.wrongCharacterCount = 0;
  gameState.wrongAnswerCount = 0;
  gameState.totalQuestions = gameState.stages.reduce((sum, s) => sum + stageQuestions(s).length, 0);
  gameState.stageStats = {};
  gameState.characterMistakes = [];
  gameState.answerAttemptLog = [];
  gameState.currentAnswerAttempts = 0;
  // Registro acto por acto para el informe (ver onCharacterPick/onAnswerPick) y, con celulares,
  // quién tomó cada función (foto del roster al iniciar).
  gameState.actLog = [];
  gameState.currentAct = null;
  gameState.personByRole = (multiplayerEnabled && mpRoomCode && window.MP) ? window.MP.getPersonByRole() : {};
  gameState.history = []; // pila de snapshots para poder volver a la pregunta anterior
  gameState.stages.forEach(s => { gameState.stageStats[s.stage] = {questions: stageQuestions(s).length, wrongAnswers: 0, wrongCharacters: 0}; });

  TabletopScreens.show('game', {scroll: false});
  document.getElementById('continueBtn').classList.add('hidden');
  document.getElementById('gameSessionBadge').textContent = SCENARIOS.find(s=>s.id===selectedScenarioId).name;
  // Botón "Sala": solo tiene sentido si este ejercicio arrancó desde el lobby con celulares.
  document.getElementById('roomInfoBtn').classList.toggle('hidden', !(multiplayerEnabled && mpRoomCode));

  if(gameState.timerInterval) clearInterval(gameState.timerInterval);
  gameState.timerInterval = null;
  document.getElementById('gameTimer').textContent = '00:00';

  buildStepper(stagesFor(gameState.scenarioId));
  renderStage();
}

// El botón "← Pregunta anterior" solo tiene sentido si hay al menos una pregunta antes de la
// actual en el historial (largo > 1: el snapshot de la pregunta actual + al menos uno anterior).
function updatePrevButton(){
  document.getElementById('prevQuestionBtn').disabled = gameState.history.length <= 1;
}

function goToPreviousQuestion(){
  if(gameState.history.length <= 1) return; // ya estamos en la primera pregunta del ejercicio
  gameState.history.pop(); // descarta el progreso hecho en la pregunta actual
  const target = gameState.history[gameState.history.length - 1]; // snapshot de la pregunta anterior (queda en el historial)
  gameState.stepIndex = target.stepIndex;
  gameState.subIndex = target.subIndex;
  gameState.wrongCharacterCount = target.wrongCharacterCount;
  gameState.wrongAnswerCount = target.wrongAnswerCount;
  gameState.characterMistakes.length = target.characterMistakesLen;
  gameState.answerAttemptLog.length = target.answerAttemptLogLen;
  gameState.actLog.length = target.actLogLen;
  gameState.stageStats = JSON.parse(JSON.stringify(target.stageStats));
  renderStage({skipHistory: true});
}

document.getElementById('prevQuestionBtn').addEventListener('click', goToPreviousQuestion);

// La explicación aparece como popout al responder y se cierra al pasar de pregunta.
// El popout permanece abierto hasta que el usuario lo cierra. Al cerrarlo, si la
// respuesta fue correcta, el ejercicio avanza solo: cerrar ES continuar.
let explainBackdrop = null;
function showExplain(html){
  document.getElementById('explanationContent').innerHTML = html;
  document.getElementById('explainPop').classList.remove('hidden');
  if(!explainBackdrop){
    explainBackdrop = document.createElement('div');
    explainBackdrop.className = 'explain-backdrop';
    document.body.appendChild(explainBackdrop);
  }
  // El pie se pinta en el siguiente tick: recién ahí gameState.nextAction ya quedó
  // asignado por el flujo que abrió el popout, y sabemos si toca continuar o reintentar.
  setTimeout(renderExplainFooter, 0);
}
function renderExplainFooter(){
  const pie = document.getElementById('explainFoot');
  if(!pie) return;
  const puedeAvanzar = !!gameState.nextAction;
  pie.innerHTML = puedeAvanzar
    ? '<button class="btn-cta" id="explainContinueBtn">Continuar →</button>'
    : '<button class="btn" id="explainRetryBtn">Volver a intentar</button>';
  const btn = pie.querySelector('button');
  btn.addEventListener('click', closeExplain);
  btn.focus();
}
// Cierra el popout. Si había una acción pendiente (respuesta correcta), continúa.
function closeExplain(){
  const seguir = gameState.nextAction;
  hideExplain();
  if(seguir) seguir();
}
function hideExplain(){
  document.getElementById('explainPop').classList.add('hidden');
  document.getElementById('explanationContent').innerHTML = '';
  const pie = document.getElementById('explainFoot');
  if(pie) pie.innerHTML = '';
  if(explainBackdrop){ explainBackdrop.remove(); explainBackdrop = null; }
}
document.getElementById('explainPopClose').addEventListener('click', closeExplain);
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && !document.getElementById('explainPop').classList.contains('hidden')) closeExplain();
});

function currentQuestion(){
  return stageQuestions(gameState.stages[gameState.stepIndex])[gameState.subIndex];
}

function globalQuestionNumber(){
  let count = 0;
  for(let i = 0; i < gameState.stepIndex; i++) count += stageQuestions(gameState.stages[i]).length;
  return count + gameState.subIndex + 1;
}

function updateGlobalProgress(){
  const current = globalQuestionNumber();
  const total = gameState.totalQuestions;
  const remaining = total - current;
  document.getElementById('globalProgressText').textContent = `${current} / ${total}`;
  document.getElementById('globalProgressRemaining').textContent = remaining > 0 ? `faltan ${remaining}` : 'última';
  document.getElementById('globalProgressFill').style.width = `${((current - 1) / total) * 100}%`;
}

// El botón de acción (Siguiente →) ya no se oculta: queda siempre visible en la barra de
// arriba, pero deshabilitado hasta que la respuesta (personaje o alternativa) sea correcta.
function setActionButton(active, text){
  const btn = document.getElementById('restartGameBtn');
  btn.disabled = !active;
  if(text) btn.textContent = text;
}

function renderStage(opts){
  opts = opts || {};
  const questions = stageQuestions(gameState.stages[gameState.stepIndex]);
  const stageLabel = gameState.stages[gameState.stepIndex].stage;
  const q = questions[gameState.subIndex];
  gameState.chosenCorrectParticipant = null;
  gameState.nextAction = null;
  gameState.currentAnswerAttempts = 0;
  gameState.currentAct = {wrongRoles: [], wrongOptions: []};
  // Acto distinto: se reinicia el contador de reintentos (ver onAnswerPick, que lo sube cuando
  // una respuesta incorrecta republica el mismo acto para que el celular reintente).
  mpActRevote = 0;

  // Guarda un snapshot del estado ANTES de que esta pregunta pueda generar errores, para poder
  // deshacerla con "← Pregunta anterior". No se guarda al re-renderizar por un "volver" (skipHistory),
  // para no crear un snapshot de un snapshot.
  if(!opts.skipHistory){
    gameState.history.push({
      stepIndex: gameState.stepIndex, subIndex: gameState.subIndex,
      wrongCharacterCount: gameState.wrongCharacterCount, wrongAnswerCount: gameState.wrongAnswerCount,
      characterMistakesLen: gameState.characterMistakes.length,
      answerAttemptLogLen: gameState.answerAttemptLog.length,
      actLogLen: gameState.actLog.length,
      stageStats: JSON.parse(JSON.stringify(gameState.stageStats))
    });
  }

  const scenarioMeta = SCENARIOS.find(s => s.id === gameState.scenarioId);
  const subLabel = questions.length > 1 ? ` · Pregunta ${gameState.subIndex + 1} de ${questions.length} de esta etapa` : '';
  document.getElementById('storyScenarioLabel').textContent = `${scenarioMeta.name.toUpperCase()} · ${stageLabel.toUpperCase()}${subLabel}`;
  const clientLabel = clientName ? `<b>${escapeHtml(clientName)}</b>` : 'el equipo del cliente';
  // Esta frase describe el modelo operativo estándar (TIBOX opera TI/Seguridad en remoto); un
  // escenario con funciones propias ya deja ese reparto explícito en sus propios roles, así que
  // no hace falta repetirlo acá.
  document.getElementById('opsContext').innerHTML = roleMetaFor(gameState.scenarioId) === DEFAULT_ROLE_META
    ? `TIBOX ejecuta la respuesta técnica de forma remota; ${clientLabel} aporta la información y el contexto desde su infraestructura.`
    : '';
  // Escenarios narrados: título de acto, metadatos, relato y —en su propio panel— la doble pregunta.
  const storyEl = document.getElementById('storyText');
  const panelEl = document.getElementById('storyPanel');
  const askEl = document.getElementById('askPanel');
  const [sa, sa2] = scenarioAccent(gameState.scenarioId);
  [panelEl, askEl].forEach(el => { el.style.setProperty('--a', sa); el.style.setProperty('--a2', sa2); });

  if(q.situation){
    const chips = (q.meta || []).map(m => `<span class="sit-chip">${escapeHtml(m)}</span>`).join('');
    const parrafos = q.situation.split('\n\n').map(t => `<p>${escapeHtml(t)}</p>`).join('');
    storyEl.innerHTML = `
      ${q.title ? `<h2 class="sit-title">${escapeHtml(q.title)}</h2>` : ''}
      ${chips ? `<div class="sit-meta">${chips}</div>` : ''}
      <div class="sit-body">${parrafos}</div>`;
  } else {
    storyEl.innerHTML = escapeHtml(q.text).replace(/\n\n/g,'<br><br>');
  }
  askEl.innerHTML = `
    <div class="sit-ask">
      <span class="sit-ask-q" id="askQuestion">¿Quién debe actuar?</span>
      <span class="sit-ask-step on" id="askStep1">1 · Función</span>
      <span class="sit-ask-step" id="askStep2">2 · Decisión</span>
    </div>`;

  updateGlobalProgress();

  document.getElementById('answerBlock').classList.add('hidden');
  document.getElementById('charPanel').classList.remove('hidden');
  hideExplain();
  setActionButton(false, 'Siguiente →');
  updatePrevButton();

  // Modo "Con celulares" (Fase 2): publica el acto vigente para que los celulares puedan
  // votar quién debe actuar. mpRoomCode solo tiene valor si este ejercicio arrancó desde el
  // lobby (ver startGameOrLobby) — en el modo de siempre esto no hace nada.
  // Solo lo que el celular muestra: cualquier participante puede leer la sala completa, así
  // que target/alternativas se publican recién al pasar a 'answering' (ver MP.closeVoting) y
  // correctIndex/explicaciones nunca salen de esta pantalla.
  if(multiplayerEnabled && mpRoomCode && window.MP){
    window.MP.publishAct(mpRoomCode, {
      actKey: currentActKey(), stage: stageLabel, title: q.title || ''
    });
  }

  setStep(gameState.stepIndex);
  renderCharGrid();
}

// Describe el rol principal de una función dentro del escenario/sesión activa, a partir de en
// qué etapas realmente le corresponde actuar en esta partida (según gameState.stages ya armado
// con la matriz de participación y el reasignado de Cierre aplicados).
function roleContextInScenario(roleKey){
  const rm = roleMetaFor(gameState.scenarioId);
  const stagesInvolved = [...new Set(
    gameState.stages
      .filter(st => stageQuestions(st).some(q => q.target === roleKey))
      .map(st => st.stage)
  )];
  const base = `${rm.names[roleKey]}: ${rm.desc[roleKey] || ''}.`;
  if(stagesInvolved.length === 0) return base;
  const stageWord = stagesInvolved.length > 1 ? `las etapas de ${stagesInvolved.join(', ')}` : `la etapa de ${stagesInvolved[0]}`;
  return `${base} En este escenario le corresponde actuar en ${stageWord}.`;
}

function renderCharGrid(){
  const grid = document.getElementById('charGrid');
  grid.innerHTML = '';
  grid.className = 'char-grid';
  const rm = roleMetaFor(gameState.scenarioId);
  // Se muestran todas las funciones del escenario (las 6 estándar, o las propias si el
  // escenario las trae). Solo quedan activas las que participan y fueron marcadas en la
  // configuración.
  const todas = rm.keys.map(k => participants.find(p => p.roleKey === k)).filter(Boolean);
  const available = todas.filter(p => isRoleActive(p.roleKey, gameState.scenarioId));
  grid.classList.add(`count-${Math.min(todas.length, 6)}`);
  if(available.length === 0){
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M4 4l16 16"/></svg></div>
      <p class="empty-state-title">Nadie disponible para responder</p>
      <p class="empty-state-desc">Ninguna de las funciones marcadas como participantes hoy aplica a este escenario según la matriz de participación.</p>
      <button class="btn btn-primary" id="emptyStateBackBtn">← Volver y activar funciones</button>
    </div>`;
    document.getElementById('emptyStateBackBtn').addEventListener('click', backToSetup);
    return;
  }
  todas.forEach(p => {
    const activo = isRoleActive(p.roleKey, gameState.scenarioId);
    const el = document.createElement('div');
    el.className = 'char-card' + (activo ? '' : ' char-off');
    el.dataset.roleKey = p.roleKey; // usado por MP.attachVotingPhase (Fase 2) para pintar el tally
    const [a, a2] = rm.accents[p.roleKey] || ['#5AD1E8','#0B8FD6'];
    el.style.setProperty('--a', a);
    el.style.setProperty('--a2', a2);
    el.style.setProperty('--glow', hexToRgba(a2, 0.55));
    // Mismo color plano (no degradado) que --p-bar en renderParticipants, para que la
    // barra se vea idéntica en tamaño y efecto en ambas pantallas.
    el.style.setProperty('--card-bar', a);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', activo ? '0' : '-1');
    if(!activo){ el.setAttribute('aria-disabled', 'true'); }
    el.title = activo ? roleContextInScenario(p.roleKey)
                      : `${rm.names[p.roleKey]} no participa en este escenario.`;
    // Misma anatomía que las tarjetas de tipo de ataque: barra de acento, tile del ícono,
    // nombre, descripción y una fila inferior con el dato clave (quién la ejecuta).
    el.innerHTML = `
      <div class="c-head">
        <span class="c-icon">${rm.icons[p.roleKey]}</span>
        <span class="c-name">${escapeHtml(rm.names[p.roleKey])}</span>
      </div>
      <div class="c-desc">${escapeHtml(rm.desc[p.roleKey] || '')}</div>
      <div class="c-foot"><span class="c-foot-label">${activo ? 'Ejecuta' : 'No participa'}</span><span class="c-foot-value">${activo ? escapeHtml(roleCompanyFor(p.roleKey, gameState.scenarioId)) : '—'}</span></div>`;
    if(activo){
      el.addEventListener('click', () => onCharacterPick(p, el));
      el.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onCharacterPick(p, el); } });
    }
    grid.appendChild(el);
  });

  // Modo "Con celulares" (Fase 2): arranca la votación de este acto. El clic manual de arriba
  // sigue funcionando en paralelo (no se toca) — es el desatasco si la votación empata o nadie
  // vota. Al resolver, dispara el mismo onCharacterPick de siempre, con el participant/el
  // reales, resueltos acá (MP solo conoce roleKeys, no la lista de participantes de la app).
  if(multiplayerEnabled && mpRoomCode && window.MP){
    window.MP.attachVotingPhase(mpRoomCode, currentActKey(), available.map(p => p.roleKey), winnerRoleKey => {
      const winnerParticipant = available.find(p => p.roleKey === winnerRoleKey);
      const winnerEl = grid.querySelector(`.char-card[data-role-key="${winnerRoleKey}"]`);
      if(winnerParticipant && winnerEl) onCharacterPick(winnerParticipant, winnerEl);
    });
  }
}

function onCharacterPick(participant, el){
  if(gameState.chosenCorrectParticipant) return; // ya se avanzó
  // El cronómetro comienza con la primera decisión del equipo, no al abrir el ejercicio.
  if(!gameState.startTime){
    gameState.startTime = new Date();
    gameState.timerInterval = setInterval(() => {
      document.getElementById('gameTimer').textContent = fmtElapsed(new Date() - gameState.startTime);
    }, 500);
  }
  const q = currentQuestion();
  if(participant.roleKey !== q.target){
    gameState.wrongCharacterCount++;
    gameState.stageStats[gameState.stages[gameState.stepIndex].stage].wrongCharacters++;
    gameState.characterMistakes.push({stage: gameState.stages[gameState.stepIndex].stage, chosenRole: participant.roleKey, targetRole: q.target});
    if(gameState.currentAct) gameState.currentAct.wrongRoles.push(participant.roleKey);
    el.classList.remove('wrong-flash'); void el.offsetWidth; el.classList.add('wrong-flash');
    setTimeout(() => el.classList.remove('wrong-flash'), 350);
    renderWrongCharacterExplanation(participant, q);
    setActionButton(false);
    return;
  }
  // correcto: marcar en verde y detenerse aquí, sin avanzar automáticamente
  gameState.chosenCorrectParticipant = participant;
  // Modo "Con celulares" (Fase 2): sea que esto haya venido de un clic manual o de una
  // votación resuelta (ver renderCharGrid), corta el listener/timeout de la votación y avisa
  // a Firestore que la fase pasó a 'answering' — así los celulares dejan de mostrar la
  // votación de este acto ya resuelto.
  // El orden de las alternativas se decide acá, una sola vez: la pantalla del facilitador y
  // los celulares muestran exactamente el mismo orden (ver renderAnswerOptions).
  const answerOrder = shuffledIndices(q.options.length);
  if(multiplayerEnabled && mpRoomCode && window.MP) window.MP.closeVoting(mpRoomCode, {target: q.target, options: q.options, order: answerOrder});
  el.classList.add('correct-flash');
  document.querySelectorAll('.char-card').forEach(c => {
    if(c !== el) c.style.opacity = '0.35';
    c.style.pointerEvents = 'none';
    c.setAttribute('tabindex', '-1');
    c.setAttribute('aria-disabled', 'true');
  });
  const rmPick = roleMetaFor(gameState.scenarioId);
  showExplain(
    `<div class="explanation-item is-correct">
      <div class="ex-head">${roleExplainIconHtml(rmPick, participant.roleKey)}<div class="ex-head-text"><span class="ex-tag">✓ Personaje correcto</span><div class="ex-opt">${escapeHtml(rmPick.names[participant.roleKey])}</div></div></div>
      <div class="ex-why">${pickRandom(CORRECT_CHARACTER_PHRASES)}</div>
    </div>`);

  gameState.nextAction = () => {
    document.getElementById('charPanel').classList.add('hidden');
    const s1 = document.getElementById('askStep1'), s2 = document.getElementById('askStep2');
    if(s1 && s2){ s1.classList.remove('on'); s2.classList.add('on'); }
    const askQ = document.getElementById('askQuestion');
    if(askQ) askQ.textContent = '¿Qué decisión debe tomar?';

    document.getElementById('answeringAs').textContent = `${rmPick.names[participant.roleKey]} · ${roleCompanyFor(participant.roleKey, gameState.scenarioId)}`;
    hideExplain();
    renderAnswerOptions(q, answerOrder);
    document.getElementById('answerBlock').classList.remove('hidden');
    setActionButton(false, 'Siguiente →');
    gameState.nextAction = null;
  };
  setActionButton(true, 'Siguiente →');
}

function renderWrongCharacterExplanation(participant, q){
  const rm = roleMetaFor(gameState.scenarioId);
  const chosenKey = participant.roleKey;
  const chosenLabel = rm.names[chosenKey];
  const chosenDesc = rm.desc[chosenKey] || 'cumple otra función dentro del ejercicio';
  const mismatch = q.mismatchContext || 'Esta acción específica requiere otra función dentro del equipo de respuesta.';

  const html = `<div class="explanation-item is-wrong">
      <div class="ex-head">${roleExplainIconHtml(rm, chosenKey)}<div class="ex-head-text"><span class="ex-tag">✕ Personaje incorrecto</span><div class="ex-opt">${escapeHtml(chosenLabel)}</div></div></div>
      <div class="ex-why">${escapeHtml(chosenLabel)} ${chosenDesc}. ${escapeHtml(mismatch)}</div>
    </div>`;
  showExplain(html);
}

function shuffledIndices(n){
  const arr = Array.from({length:n}, (_, i) => i);
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// order: índices originales de q.options en el orden en que se muestran (ver onCharacterPick).
function renderAnswerOptions(q, order){
  const el = document.getElementById('answerOptions');
  el.innerHTML = '';
  order.forEach(origIdx => {
    const b = document.createElement('button');
    b.className = 'answer-btn';
    b.textContent = q.options[origIdx];
    b.dataset.origIdx = origIdx; // usado por MP.attachAnsweringPhase (Fase 3) para ubicar el botón
    b.addEventListener('click', () => onAnswerPick(origIdx, b, q));
    el.appendChild(b);
  });

  // Modo "Con celulares" (Fase 3): la persona cuyo personaje ganó la Fase 2 responde desde su
  // propio celular. El clic de arriba sigue funcionando en paralelo (respaldo manual, igual
  // que en la votación) — al llegar la respuesta del celular, dispara el mismo onAnswerPick.
  if(multiplayerEnabled && mpRoomCode && window.MP && gameState.chosenCorrectParticipant){
    window.MP.attachAnsweringPhase(mpRoomCode, currentActKey(), gameState.chosenCorrectParticipant.roleKey, origIdx => {
      const btn = el.querySelector(`.answer-btn[data-orig-idx="${origIdx}"]`);
      if(btn) onAnswerPick(origIdx, btn, q);
    });
  }
}

function onAnswerPick(idx, btn, q){
  // En los datos actuales, la opción de índice 0 es siempre la canónicamente correcta (el orden
  // visual ya viene mezclado por shuffledIndices). Se admite además un campo explícito
  // `correctIndex` por pregunta para no depender solo de esa convención hacia adelante.
  const correct = idx === (q.correctIndex ?? 0);

  if(!correct){
    gameState.wrongAnswerCount++;
    gameState.stageStats[gameState.stages[gameState.stepIndex].stage].wrongAnswers++;
    gameState.currentAnswerAttempts++;
    if(gameState.currentAct) gameState.currentAct.wrongOptions.push(q.options[idx]);
    // se puede reintentar: no se bloquean los botones, solo se marca el error elegido, sin revelar la correcta
    document.querySelectorAll('#answerOptions .answer-btn').forEach(b => b.classList.remove('chosen-wrong'));
    btn.classList.add('chosen-wrong');
    renderExplanation(idx, false, q);
    // Modo "Con celulares": una respuesta incorrecta deja a la MISMA persona reintentar la
    // misma pregunta desde su celular — no se reabre la votación de personaje. Se sube el
    // contador de reintentos (currentActKey() cambia) y se republica el acto en fase
    // 'answering' con la misma función objetivo, para que el celular vuelva a mostrar las 4
    // alternativas habilitadas (ver handleActUpdate en participant-app.js, que repinta cuando
    // el actKey cambia). El modo de una sola pantalla no cambia: sigue siendo un reintento
    // normal de la alternativa, sin pasos extra.
    if(multiplayerEnabled && mpRoomCode && window.MP){
      mpActRevote++;
      window.MP.retryAnswer(mpRoomCode, {
        actKey: currentActKey(),
        stage: gameState.stages[gameState.stepIndex].stage,
        title: q.title || '', target: q.target, options: q.options,
        // mismo orden que ya está en pantalla (el reintento no vuelve a mezclar)
        order: [...document.querySelectorAll('#answerOptions .answer-btn')].map(b => Number(b.dataset.origIdx))
      });
      window.MP.attachAnsweringPhase(mpRoomCode, currentActKey(), gameState.chosenCorrectParticipant.roleKey, origIdx => {
        const retryBtn = document.querySelector(`#answerOptions .answer-btn[data-orig-idx="${origIdx}"]`);
        if(retryBtn) onAnswerPick(origIdx, retryBtn, q);
      });
    }
    setActionButton(false);
    gameState.nextAction = null;
    return;
  }

  // correcta: se bloquea, se marca en verde y se avanza el stepper
  document.querySelectorAll('#answerOptions .answer-btn').forEach(b => b.disabled = true);
  btn.classList.add('chosen-correct');
  // Modo "Con celulares" (Fase 3): corta el listener de respuesta del celular (clic manual o
  // envío del celular, cualquiera haya resuelto esto) y marca el acto como 'resolved'.
  if(multiplayerEnabled && mpRoomCode && window.MP) window.MP.closeAnswering(mpRoomCode);
  renderExplanation(idx, true, q);
  gameState.answerAttemptLog.push({stage: gameState.stages[gameState.stepIndex].stage, attempts: gameState.currentAnswerAttempts + 1});
  const act = gameState.currentAct || {wrongRoles: [], wrongOptions: []};
  gameState.actLog.push({
    stage: gameState.stages[gameState.stepIndex].stage, title: q.title || '', target: q.target,
    wrongRoles: act.wrongRoles.slice(), wrongOptions: act.wrongOptions.slice(),
    correctOption: q.options[idx], explanation: q.explanations[idx] || ''
  });

  const questions = stageQuestions(gameState.stages[gameState.stepIndex]);
  const isLastSub = gameState.subIndex === questions.length - 1;
  const isLastStage = gameState.stepIndex === gameState.stages.length - 1;

  if(!isLastSub){
    setStep(gameState.stepIndex); // aún en la misma etapa
    gameState.nextAction = () => { gameState.subIndex++; renderStage(); };
    setActionButton(true, `Siguiente pregunta (${gameState.subIndex + 2} de ${questions.length}) →`);
  } else if(!isLastStage){
    setStep(gameState.stepIndex + 1);
    gameState.nextAction = () => { gameState.stepIndex++; gameState.subIndex = 0; renderStage(); };
    setActionButton(true, 'Siguiente etapa →');
  } else {
    setStep(gameState.stepIndex + 1);
    gameState.nextAction = () => showResults();
    setActionButton(true, 'Ver resultado del ejercicio →');
  }
}

function renderExplanation(chosenIdx, correct, q){
  const p = gameState.chosenCorrectParticipant;
  const rm = roleMetaFor(gameState.scenarioId);

  const tag = correct ? pickRandom(CORRECT_ANSWER_TAGS) : '✕ Elegida · Incorrecta';
  const cls = correct ? 'is-correct' : 'is-wrong';
  let html = `<div class="explanation-item ${cls}">
    <div class="ex-head">${roleExplainIconHtml(rm, p.roleKey)}<div class="ex-head-text"><span class="ex-tag">${tag}</span><div class="ex-opt">${escapeHtml(q.options[chosenIdx])}</div></div></div>
    <div class="ex-respondio">Respondió <b>${escapeHtml(rm.names[p.roleKey])}</b> · ${escapeHtml(roleCompanyFor(p.roleKey, gameState.scenarioId))}</div>
    <div class="ex-why">${escapeHtml(q.explanations[chosenIdx])}</div>
  </div>`;
  if(!correct){
    html += `<div class="explanation-placeholder" style="margin-top:4px;">Vuelve a intentarlo — elige otra alternativa.</div>`;
  }

  showExplain(html);
}

document.getElementById('restartGameBtn').addEventListener('click', () => {
  if(gameState.nextAction) gameState.nextAction();
});
document.getElementById('backToSetupBtn').addEventListener('click', backToSetup);

// ---------------- resultados e informe (js/report.js) ----------------
function showResults(){
  hideExplain();
  if(gameState.timerInterval) clearInterval(gameState.timerInterval);
  document.getElementById('roomInfoBtn').classList.add('hidden');
  if(window.MP) window.MP.closeRoomPanel();
  // Con celulares: foto final de quién tomó cada función (incluye a quien se admitió durante el
  // ejercicio) y después se cierra la sala, lo que desconecta a todos los participantes.
  if(multiplayerEnabled && mpRoomCode && window.MP){
    gameState.personByRole = window.MP.getPersonByRole();
    closeMultiplayerRoom();
  }
  TabletopReport.show({gameState, participants, clientName, facilitatorName});
}

// Cierra la sala del modo "Con celulares" (si hay una abierta): borra participantes y
// funciones reservadas y cada celular se desconecta solo (ver closeRoom en room.js).
function closeMultiplayerRoom(){
  if(!mpRoomCode || !window.MP) return;
  window.MP.closeRoom(mpRoomCode);
  mpRoomCode = null;
}

function backToSetup(){
  hideExplain();
  if(gameState.timerInterval) clearInterval(gameState.timerInterval);
  document.getElementById('roomInfoBtn').classList.add('hidden');
  if(window.MP) window.MP.closeRoomPanel();
  closeMultiplayerRoom(); // salir del ejercicio también lo cierra para los celulares
  TabletopScreens.show('setup', {scroll: false});
  document.getElementById('continueBtn').classList.remove('hidden');
  updateBottomState();
}

// Mantiene --topbar-h sincronizado con el alto real de la barra superior. Ese alto
// cambia según el modo (config trae los botones Retroceder/Siguiente, en curso trae el
// stepper del ejercicio), y varios calc(100dvh - var(--topbar-h)) de más abajo dependen
// de que este valor sea exacto — si no, sobra un resto de alto que obliga a hacer scroll
// para ver todo el contenido.
const topbarEl = document.querySelector('.topbar');
if(topbarEl && window.ResizeObserver){
  const syncTopbarHeight = () => {
    document.documentElement.style.setProperty('--topbar-h', topbarEl.offsetHeight + 'px');
  };
  new ResizeObserver(syncTopbarHeight).observe(topbarEl);
  syncTopbarHeight();
}
// Constructor de escenarios (js/builder.js): lo que necesita de esta pantalla de configuración.
TabletopBuilder.init({
  escapeHtml,
  checkIcon: CHECK_ICON,
  useScenario: data => {
    const id = registerCustomScenario(data);
    applyScenarioSelection(id);
    renderParticipants();
    renderScenarioCards();
    profileSaved = false;
    TabletopScreens.show('setup', {scroll: false});
    goToStep(2);
  }
});

// Resultados e informe (js/report.js): funciones de esta pantalla que el informe necesita.
TabletopReport.init({
  escapeHtml, fmtElapsed, roleMetaFor, stagesFor, sessionRoleKeys, roleCompanyFor,
  showConfirmModal, loadSavedExercises, saveExercisesList,
  onClose: () => {
    document.getElementById('continueBtn').classList.remove('hidden');
    updateBottomState();
  }
});

})();
