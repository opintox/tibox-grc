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
function defaultParticipantsFor(scenarioId){
  return roleMetaFor(scenarioId).keys.map(k => ({roleKey:k, empresa:'', checked:true}));
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
  const newKeys = roleMetaFor(id).keys;
  const sameKeys = participants.length === newKeys.length && participants.every((p,i) => p.roleKey === newKeys[i]);
  if(!sameKeys) participants = defaultParticipantsFor(id);
  selectedScenarioId = id;
  enforceMandatoryRoles();
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
const SETUP_STORAGE_KEY = 'tabletop_setup_v1';
let setupSaveTimer = null;
function saveSetupState(){
  clearTimeout(setupSaveTimer);
  setupSaveTimer = setTimeout(() => {
    try{
      localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify({
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
  const expectedKeys = roleMetaFor(profile.selectedScenarioId || null).keys;
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

function loadSetupState(){
  let data;
  try{
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    if(!raw) return;
    data = JSON.parse(raw);
  }catch(e){ localStorage.removeItem(SETUP_STORAGE_KEY); return; } // datos corruptos: se borran y se ignora
  const label = data.clientName ? `de <b>${escapeHtml(data.clientName)}</b>` : 'sin cliente asociado';
  const when = data.savedAt ? new Date(data.savedAt).toLocaleString('es-CL') : '';
  showConfirmModal({
    title: 'Configuración guardada encontrada',
    message: `Se encontró una configuración guardada ${label}${when ? ' (' + escapeHtml(when) + ')' : ''}. ¿Quieres restaurarla?`,
    confirmText: 'Restaurar', cancelText: 'Empezar de nuevo'
  }).then(ok => {
    if(!ok){ localStorage.removeItem(SETUP_STORAGE_KEY); return; }
    clientName = data.clientName || '';
    facilitatorName = data.facilitatorName || '';
    const expectedKeys = roleMetaFor(data.selectedScenarioId || null).keys;
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
  });
}

document.getElementById('clientNameInput').addEventListener('input', e => { clientName = e.target.value; profileSaved = false; updateBottomState(); saveSetupState(); });
document.getElementById('facilitatorNameInput').addEventListener('input', e => { facilitatorName = e.target.value; profileSaved = false; updateBottomState(); saveSetupState(); });

// ---------------- scenario cards ----------------
const coreGridEl = document.getElementById('scenarioGridCore');

// Imagen de fondo propia por escenario (opcional): si un id no está acá, la tarjeta
// se ve exactamente igual que antes (solo el degradado oscuro de siempre).
// Rutas relativas a tabletop/css/styles.css (no al HTML): un url() dentro del valor de
// una variable CSS se resuelve relativo a la hoja de estilos donde vive la propiedad que
// lo consume (background-image en .scn-card), no al archivo que setea la variable.
const SCENARIO_BG_IMAGES = {
  dispositivo: '../assets/scenario-bg/dispositivo.jpg',
  recuperacion_fallida: '../assets/scenario-bg/recuperacion_fallida.jpg',
  insider: '../assets/scenario-bg/insider.jpg',
  terceros: '../assets/scenario-bg/terceros.jpg',
  credenciales: '../assets/scenario-bg/credenciales.jpg',
  ddos: '../assets/scenario-bg/ddos.jpg',
  phishing_bec: '../assets/scenario-bg/phishing_bec.jpg',
  '0day': '../assets/scenario-bg/0day.jpg',
  exfiltracion: '../assets/scenario-bg/exfiltracion.png',
  ransomware: '../assets/scenario-bg/ransomware.png'
};
// Encuadre por escenario: por defecto "center" (mitad vertical de la imagen), pero
// dispositivo.jpg tiene el personaje y el globo de diálogo en el tercio superior — con
// center a secas, una tarjeta baja y ancha recorta justo esa parte y deja solo el pecho
// y el fondo naranjo (la "imagen desalineada" reportada).
const SCENARIO_BG_POS = {
  dispositivo: 'center 22%',
  // El apretón de manos (lo más reconocible de "compromiso de terceros") queda casi
  // fuera de cuadro con el center por defecto — la imagen es más alta que ancha y el
  // encuadre corto de la tarjeta termina mostrando sobre todo el espacio vacío del medio.
  terceros: 'center 85%',
  // Con center a secas se alcanzaba a ver un resto suelto de los puntitos de la barra
  // de navegador (arriba) sin mostrar completo ni el candado/gancho ni el campo de
  // contraseña — bajar el encuadre deja ambos elementos dentro de la tarjeta.
  credenciales: '65% 65%'
};
function renderScenarioCard(s, container){
  const el = document.createElement('div');
  el.className = 'scn-card' + (selectedScenarioId === s.id ? ' selected' : '');
  const [accent, accent2] = scenarioAccent(s.id);
  el.style.setProperty('--a', accent);
  el.style.setProperty('--a2', accent2);
  el.style.setProperty('--glow', hexToRgba(accent2, 0.55));
  if(SCENARIO_BG_IMAGES[s.id]) el.style.setProperty('--scn-bg-image', `url(${SCENARIO_BG_IMAGES[s.id]})`);
  if(SCENARIO_BG_POS[s.id]) el.style.setProperty('--scn-bg-pos', SCENARIO_BG_POS[s.id]);
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-pressed', selectedScenarioId === s.id ? 'true' : 'false');
  el.setAttribute('aria-label', s.name);
  const icon = SCENARIO_ICONS[s.id] || '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="5.5"/></svg>';
  const blurb = SCENARIO_BLURBS[s.id] || '';
  el.innerHTML = `
    <div class="scn-head">
      <span class="scn-badge"><span class="scn-icon">${icon}</span>${escapeHtml(s.name)}</span>
      <div class="scn-head-actions">
        <button class="scn-export-btn" type="button" title="Exportar este escenario a Word" aria-label="Exportar este escenario a Word">⇩</button>
        <span class="scn-check" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.4 6.4 12 13 4.6"/></svg></span>
      </div>
    </div>
    <div class="scn-desc">${escapeHtml(blurb)}</div>
    <div class="scn-fields"><span class="scn-target">${escapeHtml(SCENARIO_TARGETS[s.id] || '—')}</span></div>`;
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
  SCENARIO_ACCENTS[id] = CUSTOM_SCENARIO_ACCENT;
  SCENARIO_ICONS[id] = CUSTOM_SCENARIO_ICON;
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
    card.className = 'p-card glow-' + (rm.color[p.roleKey] || 'blue') + (p.checked ? '' : ' row-inactive');
    const [pBarColor] = (rm.accents && rm.accents[p.roleKey]) || ['#8592AE'];
    card.style.setProperty('--p-bar', pBarColor);
    card.innerHTML = `
      <div class="p-card-head">
        <input type="checkbox" ${p.checked ? 'checked' : ''} ${locked ? 'disabled title="TI y Seguridad participan siempre"' : ''} data-i="${i}">
        <span class="empresa-badge ${p.roleKey}">${roleIconChipHtml(rm, p.roleKey)}${escapeHtml(rm.names[p.roleKey] || p.roleKey)}</span>
      </div>
      <p class="p-card-desc" title="${escapeHtml(rm.desc[p.roleKey] || '')}">${escapeHtml(rm.desc[p.roleKey] || '')}</p>
      <div class="p-card-fields">
        <div class="p-card-field"><span class="p-card-field-label">Empresa</span><span class="p-card-field-value pf-empresa" data-i="${i}" data-field="empresa" tabindex="0" role="button" aria-label="Editar empresa" title="Doble clic o Enter para editar">${p.empresa ? escapeHtml(p.empresa) : '<span class="undefined-chip">+ Agregar</span>'}</span></div>
      </div>`;
    card.querySelectorAll('.pf-empresa').forEach(elField => {
      elField.addEventListener('dblclick', openEditPopout);
      elField.addEventListener('keydown', ev => {
        if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); openEditPopout(ev); }
      });
    });
    card.querySelector('input').addEventListener('change', e => {
      participants[i].checked = e.target.checked;
      renderParticipants();
      profileSaved = false;
      updateBottomState();
      saveSetupState();
    });
    bodyEl.appendChild(card);
  });
}
function escapeHtml(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function participantName(p){ return ROLE_NAMES[p.roleKey]; }
renderParticipants();

// ---------------- edit popout (double-click) ----------------
let activePopout = null;
function closePopout(){
  if(activePopout){ activePopout.remove(); activePopout = null; document.removeEventListener('mousedown', outsideClickHandler, true); }
}
function outsideClickHandler(e){
  if(activePopout && !activePopout.contains(e.target)){ closePopout(); }
}
function openEditPopout(e){
  closePopout();
  const cell = e.currentTarget;
  const i = parseInt(cell.dataset.i, 10);
  const field = cell.dataset.field; // 'persona', 'rol' o 'empresa'
  const rect = cell.getBoundingClientRect();

  const fieldLabels = {empresa:'Empresa'};

  const pop = document.createElement('div');
  pop.className = 'edit-popout';
  pop.style.left = Math.min(rect.left, window.innerWidth - 280) + 'px';
  pop.style.top = (rect.bottom + 8) + 'px';
  pop.innerHTML = `
    <label>${fieldLabels[field] || field}</label>
    <input type="text" id="popoutInput" value="${escapeHtml(participants[i][field] || '')}">
    <div class="edit-actions">
      <button class="btn btn-sm" id="popoutCancel">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="popoutSave">Guardar</button>
    </div>`;
  document.body.appendChild(pop);
  activePopout = pop;

  const input = pop.querySelector('#popoutInput');
  input.focus();
  input.select();

  function save(){
    const val = input.value.trim();
    participants[i][field] = val; // permite guardar vacío para poder borrar un valor ya escrito
    renderParticipants();
    profileSaved = false;
    updateBottomState();
    saveSetupState();
    closePopout();
  }
  pop.querySelector('#popoutSave').addEventListener('click', save);
  pop.querySelector('#popoutCancel').addEventListener('click', closePopout);
  input.addEventListener('keydown', ev => {
    if(ev.key === 'Enter') save();
    if(ev.key === 'Escape') closePopout();
  });

  setTimeout(() => document.addEventListener('mousedown', outsideClickHandler, true), 0);
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

function updateBottomState(){
  const hasScenario = !!selectedScenarioId;
  const activeCount = participants.filter(p => p.checked).length;
  const hasParticipant = activeCount > 0;
  const scenarioName = hasScenario ? SCENARIOS.find(s => s.id === selectedScenarioId).name : null;
  const canStart = hasScenario && hasParticipant;

  renderWizardStepper();

  const setupNextBtn = document.getElementById('setupNextBtn');
  if(setupNextBtn){
    const label=document.getElementById('setupNextBtnLabel');
    if(currentSetupStep === 3){
      setupNextBtn.disabled = !canStart;
      if(label) label.textContent = 'Comenzar ejercicio';
    } else {
      setupNextBtn.disabled = false;
      if(label) label.textContent = 'Siguiente';
    }
  }

  const scnBadge = document.getElementById('scenarioBadge');
  if(scnBadge) scnBadge.textContent = scenarioName || 'Sin escenario';
  const pBadge = document.getElementById('participantsBadge');
  if(pBadge) pBadge.textContent = `${activeCount} activa${activeCount === 1 ? '' : 's'}`;

  const summaryEl = document.getElementById('wizardStep3Summary');
  if(summaryEl){
    summaryEl.textContent = canStart
      ? `Escenario elegido: ${scenarioName} · ${activeCount} ${activeCount === 1 ? 'función activa' : 'funciones activas'}.`
      : `Falta: ${!hasScenario ? 'elegir escenario' : ''}${!hasScenario && !hasParticipant ? ' y ' : ''}${!hasParticipant ? 'marcar al menos un participante' : ''}.`;
  }
}
// La app abre siempre en la pantalla de bienvenida (reglas del ejercicio); recién al presionar
// «Siguiente» ahí se entra al modo configuración que antes era la pantalla inicial.
document.body.classList.add('intro-mode');
updateBottomState();

// Intenta restaurar configuración guardada de una sesión anterior (si existe). El modal de
// confirmación se encarga de re-pintar la UI si el usuario decide restaurarla.
loadSetupState();

function enterSetup(){
  document.getElementById('screen-intro').classList.add('hidden');
  document.getElementById('screen-setup').classList.remove('hidden');
  document.body.classList.remove('intro-mode');
  document.body.classList.add('setup-mode');
  goToStep(1);
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// Vuelve de la configuración a la pantalla de bienvenida, dentro de la misma sesión
// (el logo ya no usa esto: ahora navega directo al índice principal del sitio).
function goHome(){
  hideExplain();
  if(gameState.timerInterval) clearInterval(gameState.timerInterval);
  ['screen-setup', 'screen-game', 'screen-results', 'screen-report'].forEach(id => {
    const screen = document.getElementById(id);
    if(screen) screen.classList.add('hidden');
  });
  document.getElementById('screen-intro').classList.remove('hidden');
  document.body.classList.remove('setup-mode', 'game-mode');
  document.body.classList.add('intro-mode');
  document.getElementById('statusLabel').textContent = 'CONFIGURACIÓN';
  updateBottomState();
  window.scrollTo({top: 0, behavior: 'smooth'});
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

// ---------------- reglas del ejercicio: detalle en modal al hacer clic ----------------
// Mismo texto que tenían los pasos antes de dejarlos solo con título (ver historial):
// se mantiene disponible bajo demanda en vez de ocupar espacio siempre visible.
const RULE_DETAILS = {
  1: {
    title: 'Configuren la sesión',
    body: 'Elijan el tipo de ataque a simular y marquen qué funciones participan hoy (TI, Legal, Comunicaciones, RRHH, Dirección — Seguridad y TI siempre están). Guarden el perfil del cliente: es lo último que falta para poder empezar.'
  },
  2: {
    title: 'El incidente avanza en 5 etapas',
    body: 'Detección → Clasificación → Contención → Recuperación → Cierre. Cada una plantea una situación nueva dentro del mismo caso, en orden.'
  },
  3: {
    title: 'Decidan quién actúa',
    body: 'Frente a cada situación, el equipo elige qué función debe hacerse cargo de esa acción específica. Elegir a alguien a quien no le corresponde cuenta como error.'
  },
  4: {
    title: 'Decidan qué hacer',
    body: 'Con la función correcta ya elegida, discutan entre varias alternativas y elijan la respuesta. Si se equivocan, se explica por qué antes de dejarlos reintentar.'
  },
  5: {
    title: 'Cierren con el informe',
    body: 'Al terminar la última etapa se genera un puntaje, un informe ejecutivo con lo que conviene reforzar, y un acta que pueden guardar o descargar.'
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
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="ruleModalTitle">
      <div class="modal-head">
        <div class="modal-title" id="ruleModalTitle">${escapeHtml(rule.title)}</div>
        <button class="modal-close-btn" id="ruleModalClose" aria-label="Cerrar">✕</button>
      </div>
      <div class="modal-message">${escapeHtml(rule.body)}</div>
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

document.getElementById('continueBtn').addEventListener('click', enterSetup);
document.getElementById('setupBackBtn').addEventListener('click', () => {
  if(currentSetupStep === 1) goHome();
  else goToStep(currentSetupStep - 1);
});
document.getElementById('setupNextBtn').addEventListener('click', () => {
  if(currentSetupStep === 3){
    if(!document.getElementById('setupNextBtn').disabled) startGame();
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

document.getElementById('downloadTemplateBtn').addEventListener('click', () => {
  TibDocx.downloadBlankTemplate();
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
let gameState = { scenarioId:null, stages:null, stepIndex:0, subIndex:0, chosenCorrectParticipant:null, nextAction:null, startTime:null, timerInterval:null, wrongCharacterCount:0, wrongAnswerCount:0, totalQuestions:0, stageStats:{}, characterMistakes:[], answerAttemptLog:[], currentAnswerAttempts:0, history:[] };

function stageQuestions(stageEntry){
  return stageEntry.questions || [stageEntry];
}

function buildStepper(stageLabels){
  const el = document.getElementById('gameStepper');
  el.innerHTML = stageLabels.map((label, i) => `
    <div class="gh-step" data-step="${i}">
      <span class="gh-step-n">${i + 1}</span>
      <span class="gh-step-label">${escapeHtml(label)}</span>
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
  const matrix = getMatrix(scenarioId);
  const rawStages = QUESTIONS[scenarioId];
  const rm = roleMetaFor(scenarioId);
  // El auto-cierre (Dirección/Seguridad) y la red de seguridad de "seguridad" son reglas del
  // organigrama estándar; un escenario con funciones propias ya trae su propio cierre y no tiene
  // una función universal a la que recurrir, así que usa su primera función declarada.
  const isStandard = rm === DEFAULT_ROLE_META;
  return rawStages.map(stageEntry => {
    let qs = stageQuestions(stageEntry).filter(q => {
      // una pregunta solo entra si su función participa en el escenario (matriz) Y sigue
      // marcada como participante hoy (checked). TI/Seguridad siempre cumplen ambas: la matriz
      // las fuerza en getMatrix() y su checkbox está bloqueado en renderParticipants().
      const participant = participants.find(p => p.roleKey === q.target);
      return !!matrix[q.target] && !!(participant && participant.checked);
    });
    qs = sampleVariants(qs);
    if(isStandard && stageEntry.stage === 'Cierre'){
      // el cierre lo autoriza Dirección si participa (matriz) y sigue marcada hoy; si no, lo asume Seguridad
      const dirParticipant = participants.find(p => p.roleKey === 'direccion');
      const closingRole = (matrix.direccion && dirParticipant && dirParticipant.checked) ? 'direccion' : 'seguridad';
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
  gameState.history = []; // pila de snapshots para poder volver a la pregunta anterior
  gameState.stages.forEach(s => { gameState.stageStats[s.stage] = {questions: stageQuestions(s).length, wrongAnswers: 0, wrongCharacters: 0}; });

  document.getElementById('screen-setup').classList.add('hidden');
  document.getElementById('screen-game').classList.remove('hidden');
  document.body.classList.remove('setup-mode');
  document.body.classList.add('game-mode');
  document.getElementById('continueBtn').classList.add('hidden');
  document.getElementById('gameSessionBadge').textContent = SCENARIOS.find(s=>s.id===selectedScenarioId).name;
  document.getElementById('statusLabel').textContent = 'EN CURSO';

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

  // Guarda un snapshot del estado ANTES de que esta pregunta pueda generar errores, para poder
  // deshacerla con "← Pregunta anterior". No se guarda al re-renderizar por un "volver" (skipHistory),
  // para no crear un snapshot de un snapshot.
  if(!opts.skipHistory){
    gameState.history.push({
      stepIndex: gameState.stepIndex, subIndex: gameState.subIndex,
      wrongCharacterCount: gameState.wrongCharacterCount, wrongAnswerCount: gameState.wrongAnswerCount,
      characterMistakesLen: gameState.characterMistakes.length,
      answerAttemptLogLen: gameState.answerAttemptLog.length,
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
  const matrix = getMatrix(gameState.scenarioId);
  const rm = roleMetaFor(gameState.scenarioId);
  // Se muestran todas las funciones del escenario (las 6 estándar, o las propias si el
  // escenario las trae). Solo quedan activas las que participan y fueron marcadas en la
  // configuración.
  const todas = rm.keys.map(k => participants.find(p => p.roleKey === k)).filter(Boolean);
  const available = todas.filter(p => p.checked && matrix[p.roleKey]);
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
    const activo = p.checked && !!matrix[p.roleKey];
    const el = document.createElement('div');
    el.className = 'char-card' + (activo ? '' : ' char-off');
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
      <div class="c-foot"><span class="c-foot-label">${activo ? 'Ejecuta' : 'No participa'}</span><span class="c-foot-value">${activo ? escapeHtml(p.empresa || rm.org[p.roleKey]) : '—'}</span></div>`;
    if(activo){
      el.addEventListener('click', () => onCharacterPick(p, el));
      el.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onCharacterPick(p, el); } });
    }
    grid.appendChild(el);
  });
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
    el.classList.remove('wrong-flash'); void el.offsetWidth; el.classList.add('wrong-flash');
    setTimeout(() => el.classList.remove('wrong-flash'), 350);
    renderWrongCharacterExplanation(participant, q);
    setActionButton(false);
    return;
  }
  // correcto: marcar en verde y detenerse aquí, sin avanzar automáticamente
  gameState.chosenCorrectParticipant = participant;
  el.classList.add('correct-flash');
  document.querySelectorAll('.char-card').forEach(c => {
    if(c !== el) c.style.opacity = '0.35';
    c.style.pointerEvents = 'none';
    c.setAttribute('tabindex', '-1');
    c.setAttribute('aria-disabled', 'true');
  });
  const rmPick = roleMetaFor(gameState.scenarioId);
  showExplain(
    `<div class="explanation-item is-correct"><span class="ex-tag">✓ Personaje correcto</span><div class="ex-opt">${escapeHtml(rmPick.names[participant.roleKey])}</div><div class="ex-why">${pickRandom(CORRECT_CHARACTER_PHRASES)}</div></div>`);

  gameState.nextAction = () => {
    document.getElementById('charPanel').classList.add('hidden');
    const s1 = document.getElementById('askStep1'), s2 = document.getElementById('askStep2');
    if(s1 && s2){ s1.classList.remove('on'); s2.classList.add('on'); }
    const askQ = document.getElementById('askQuestion');
    if(askQ) askQ.textContent = '¿Qué decisión debe tomar?';

    document.getElementById('answeringAs').textContent = `${rmPick.names[participant.roleKey]} · ${participant.empresa || rmPick.org[participant.roleKey]}`;
    hideExplain();
    renderAnswerOptions(q);
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
      <span class="ex-tag">✕ Personaje incorrecto</span>
      <div class="ex-opt">${escapeHtml(chosenLabel)}</div>
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

function renderAnswerOptions(q){
  const el = document.getElementById('answerOptions');
  el.innerHTML = '';
  shuffledIndices(q.options.length).forEach(origIdx => {
    const b = document.createElement('button');
    b.className = 'answer-btn';
    b.textContent = q.options[origIdx];
    b.addEventListener('click', () => onAnswerPick(origIdx, b, q));
    el.appendChild(b);
  });
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
    // se puede reintentar: no se bloquean los botones, solo se marca el error elegido, sin revelar la correcta
    document.querySelectorAll('#answerOptions .answer-btn').forEach(b => b.classList.remove('chosen-wrong'));
    btn.classList.add('chosen-wrong');
    renderExplanation(idx, false, q);
    setActionButton(false);
    gameState.nextAction = null;
    return;
  }

  // correcta: se bloquea, se marca en verde y se avanza el stepper
  document.querySelectorAll('#answerOptions .answer-btn').forEach(b => b.disabled = true);
  btn.classList.add('chosen-correct');
  renderExplanation(idx, true, q);
  gameState.answerAttemptLog.push({stage: gameState.stages[gameState.stepIndex].stage, attempts: gameState.currentAnswerAttempts + 1});

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
  let html = `<div style="font-size:var(--fs-xs); color:var(--muted); margin-bottom:12px;">Respondió <b style="color:var(--text);">${escapeHtml(rm.names[p.roleKey])}</b> · ${escapeHtml(p.empresa || rm.org[p.roleKey])}.</div>`;

  const tag = correct ? pickRandom(CORRECT_ANSWER_TAGS) : '✕ Elegida · Incorrecta';
  const cls = correct ? 'is-correct' : 'is-wrong';
  html += `<div class="explanation-item ${cls}">
    <span class="ex-tag">${tag}</span>
    <div class="ex-opt">${escapeHtml(q.options[chosenIdx])}</div>
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

// ---------------- informe ejecutivo narrativo ----------------
function roleLabelWithName(roleKey){
  return roleMetaFor(gameState.scenarioId).names[roleKey];
}

function buildExecutiveReport(){
  const mistakes = gameState.characterMistakes;
  const attempts = gameState.answerAttemptLog;

  // --- análisis de confusiones de personaje ---
  const confusionCounts = {};
  mistakes.forEach(m => {
    const key = m.chosenRole + '→' + m.targetRole;
    if(!confusionCounts[key]) confusionCounts[key] = {chosenRole:m.chosenRole, targetRole:m.targetRole, count:0, stages:new Set()};
    confusionCounts[key].count++;
    confusionCounts[key].stages.add(m.stage);
  });
  const confusionList = Object.values(confusionCounts).sort((a,b) => b.count - a.count);

  const mistakesByStage = {};
  mistakes.forEach(m => { mistakesByStage[m.stage] = (mistakesByStage[m.stage]||0) + 1; });

  // --- análisis de intentos por pregunta (¿acertaron a la primera?) ---
  const attemptsByStage = {};
  attempts.forEach(a => {
    if(!attemptsByStage[a.stage]) attemptsByStage[a.stage] = {total:0, firstTry:0, sumAttempts:0, maxAttempts:0};
    const d = attemptsByStage[a.stage];
    d.total++; d.sumAttempts += a.attempts; d.maxAttempts = Math.max(d.maxAttempts, a.attempts);
    if(a.attempts === 1) d.firstTry++;
  });
  const totalAnswered = attempts.length;
  const firstTryTotal = attempts.filter(a => a.attempts === 1).length;
  const firstTryPct = totalAnswered ? Math.round((firstTryTotal / totalAnswered) * 100) : 100;

  let worstStage = null, worstRate = 101;
  Object.entries(attemptsByStage).forEach(([stage, d]) => {
    const rate = (d.firstTry / d.total) * 100;
    if(rate < worstRate){ worstRate = rate; worstStage = stage; }
  });

  // --- fortalezas: etapas sin ningún error, de ningún tipo ---
  const scenarioStages = stagesFor(gameState.scenarioId);
  const strengths = scenarioStages.filter(s => {
    const noCharMistakes = !mistakesByStage[s];
    const noRetries = !attemptsByStage[s] || attemptsByStage[s].firstTry === attemptsByStage[s].total;
    return noCharMistakes && noRetries;
  });

  const parts = [];

  // 1. Resumen ejecutivo
  const totalIssues = mistakes.length + attempts.reduce((s,a) => s + (a.attempts - 1), 0);
  let resumen;
  if(totalIssues === 0){
    resumen = `El ejercicio se completó sin un solo tropiezo: cada función identificó correctamente su rol y acertó la acción esperada al primer intento en las ${gameState.totalQuestions} preguntas. Es el mejor escenario posible antes de una auditoría o un incidente real.`;
  } else if(firstTryPct >= 85 && mistakes.length <= 1){
    resumen = `El desempeño general fue sólido. El equipo identificó con claridad quién debía actuar en cada momento, con solo puntos aislados de duda que no comprometen la lectura global del ejercicio.`;
  } else if(firstTryPct >= 60){
    resumen = `El ejercicio mostró un desempeño mixto: hubo tramos resueltos con seguridad y otros donde el grupo necesitó más de un intento o dudó sobre quién debía tomar la acción. Es un resultado normal para una primera corrida, pero identifica puntos concretos a reforzar antes de la próxima.`;
  } else {
    resumen = `El ejercicio evidenció dificultades recurrentes tanto en identificar quién debía responder como en dar con la acción correcta a la primera. Esto no es necesariamente un mal resultado — es exactamente el tipo de brecha que un tabletop está diseñado para sacar a la luz antes de que ocurra un incidente real.`;
  }
  parts.push({title:'Resumen ejecutivo', html:`<p>${resumen}</p>`});

  // 2. Patrones de asignación de responsables
  let asignacionHtml = '';
  if(mistakes.length === 0){
    asignacionHtml = `<p>No se registró ninguna confusión de responsables durante el ejercicio: cada vez que se necesitó una acción, el grupo identificó de inmediato a la función correcta.</p>`;
  } else {
    const top = confusionList[0];
    // Nombres de función/etapa escapados: en un escenario importado desde Word pueden venir
    // de "FUNCIÓN DEL ESCENARIO"/"ETAPA" tal cual las escribió quien armó el documento —
    // mismo criterio de escape que el resto de la pantalla del juego (renderStage, etc.),
    // que este informe no venía aplicando.
    const chosenName = escapeHtml(roleLabelWithName(top.chosenRole));
    const targetName = escapeHtml(roleLabelWithName(top.targetRole));
    const stageWord = top.stages.size > 1
      ? `las etapas de ${[...top.stages].map(escapeHtml).join(', ')}`
      : `la etapa de ${escapeHtml([...top.stages][0])}`;
    let topSentence;
    if(top.count >= 3){
      topSentence = `El patrón más marcado fue confundir a <b>${chosenName}</b> con <b>${targetName}</b> — ocurrió ${top.count} veces, principalmente en ${stageWord}. Vale la pena revisar con el grupo la diferencia entre ambas funciones antes del próximo ejercicio.`;
    } else if(top.count === 2){
      topSentence = `Se repitió al menos dos veces la confusión entre <b>${chosenName}</b> y <b>${targetName}</b> (en ${stageWord}), lo que sugiere que el límite entre ambas funciones no está del todo interiorizado.`;
    } else {
      topSentence = `Se registró una confusión puntual entre <b>${chosenName}</b> y <b>${targetName}</b> en ${stageWord} — aislada, no parece ser un patrón sistemático.`;
    }
    asignacionHtml = `<p>${topSentence}</p>`;
    if(confusionList.length > 1){
      const others = confusionList.slice(1, 3).map(c => `${escapeHtml(roleLabelWithName(c.chosenRole))} → ${escapeHtml(roleLabelWithName(c.targetRole))} (${c.count}×)`).join(', ');
      asignacionHtml += `<p>Otras confusiones registradas, con menor frecuencia: ${others}.</p>`;
    }
  }
  parts.push({title:'Patrones al asignar responsables', html:asignacionHtml});

  // 3. Primera respuesta correcta
  let primerIntentoHtml;
  if(totalAnswered === 0){
    primerIntentoHtml = `<p>No hay datos suficientes de respuestas para analizar.</p>`;
  } else if(firstTryPct >= 90){
    primerIntentoHtml = `<p>El <b>${firstTryPct}%</b> de las preguntas se resolvieron a la primera, sin necesidad de reintentar. Es un indicador fuerte de que el equipo no solo sabe quién actúa, sino también qué acción corresponde en cada momento.</p>`;
  } else if(firstTryPct >= 65){
    primerIntentoHtml = `<p>El <b>${firstTryPct}%</b> de las preguntas se resolvieron al primer intento. La etapa donde más costó dar con la acción correcta fue <b>${escapeHtml(worstStage)}</b>, con un ${Math.round(worstRate)}% de aciertos inmediatos — conviene revisarla con el grupo en la revisión posterior (hot-wash).</p>`;
  } else {
    primerIntentoHtml = `<p>Solo el <b>${firstTryPct}%</b> de las preguntas se resolvieron al primer intento, lo que indica que buena parte del ejercicio se resolvió por descarte más que por certeza. <b>${escapeHtml(worstStage)}</b> fue la etapa más costosa, con apenas ${Math.round(worstRate)}% de aciertos inmediatos.</p>`;
  }
  parts.push({title:'Primera respuesta correcta', html:primerIntentoHtml});

  // 4. Fortalezas
  let fortalezasHtml;
  if(strengths.length === scenarioStages.length){
    fortalezasHtml = `<p>Todas las etapas del ejercicio se resolvieron sin errores de ningún tipo — un resultado excelente y poco común en una primera corrida.</p>`;
  } else if(strengths.length > 0){
    fortalezasHtml = `<p>${strengths.length === 1 ? 'La etapa' : 'Las etapas'} de <b>${strengths.map(escapeHtml).join(', ')}</b> se resolvieron sin errores de personaje ni reintentos — un buen punto de partida que vale la pena reconocer con el equipo.</p>`;
  } else {
    fortalezasHtml = `<p>Ninguna etapa quedó completamente libre de errores o reintentos, aunque eso es información igual de valiosa: señala que el refuerzo debe ser transversal, no puntual.</p>`;
  }
  parts.push({title:'Fortalezas identificadas', html:fortalezasHtml});

  // 5. Recomendaciones
  const recs = [];
  const planAccion = [];
  if(confusionList.length > 0){
    const top = confusionList[0];
    // recs[] se inserta como <li> sin re-escapar (ver más abajo), así que acá también hay
    // que escapar los nombres antes de interpolarlos. planAccion en cambio SÍ se escapa al
    // volcarse en la tabla (más abajo), así que ahí puede ir el texto plano.
    recs.push(`Reforzar con ${escapeHtml(roleLabelWithName(top.chosenRole))} y ${escapeHtml(roleLabelWithName(top.targetRole))} la diferencia entre sus responsabilidades, idealmente con ejemplos concretos del propio incidente simulado.`);
    planAccion.push({accion:`Reforzar la diferencia de responsabilidades entre ${roleLabelWithName(top.chosenRole)} y ${roleLabelWithName(top.targetRole)} con ejemplos del propio ejercicio`, responsable:`${roleLabelWithName(top.chosenRole)} y ${roleLabelWithName(top.targetRole)}`, plazo:'15 días'});
  }
  if(worstStage && worstRate < 85){
    recs.push(`Revisar el procedimiento de la etapa de <b>${escapeHtml(worstStage)}</b> con el equipo — fue donde más costó identificar la acción correcta a la primera.`);
    planAccion.push({accion:`Revisar el procedimiento y las decisiones de la etapa de ${worstStage} con todo el equipo`, responsable:'Equipo completo', plazo:'15 días'});
  }
  if(totalIssues === 0){
    recs.push(`Con este resultado, el equipo está en condiciones de intentar un escenario más exigente o un ejercicio operacional real como siguiente paso.`);
    planAccion.push({accion:'Programar un escenario más exigente o un ejercicio operacional real como siguiente paso', responsable: facilitatorName || 'Facilitador', plazo:'30 días'});
  } else if(recs.length === 0){
    recs.push(`Repetir este mismo escenario en unas semanas para confirmar que los puntos de duda se resolvieron con la práctica.`);
    planAccion.push({accion:'Repetir este mismo escenario para confirmar que los puntos de duda se resolvieron con la práctica', responsable: facilitatorName || 'Facilitador', plazo:'30 días'});
  }
  recs.push(`Documentar este resultado como línea base — el valor real de repetir el ejercicio está en comparar contra esta primera corrida.`);
  planAccion.push({accion:'Documentar este resultado como línea base para comparar contra la próxima corrida', responsable: facilitatorName || 'Facilitador', plazo:'7 días'});
  parts.push({title:'Recomendaciones', html:`<ul class="report-recs">${recs.map(r => `<li>${r}</li>`).join('')}</ul>`});

  const planHtml = `<div class="table-wrap"><table class="ptable plan-table">
    <thead><tr><th>Acción</th><th>Responsable sugerido</th><th>Plazo</th></tr></thead>
    <tbody>${planAccion.map(p => `<tr><td>${escapeHtml(p.accion)}</td><td>${escapeHtml(p.responsable)}</td><td><span class="plazo-chip">${escapeHtml(p.plazo)}</span></td></tr>`).join('')}</tbody>
  </table></div>`;
  parts.push({title:'Plan de acción', html:planHtml});

  return {parts, plain: {
    resumen, firstTryPct, worstStage, worstRate: worstStage ? Math.round(worstRate) : null,
    confusionTop: confusionList[0] || null, strengths, recomendaciones: recs.map(r => r.replace(/<\/?b>/g,'')),
    planAccion
  }};
}

function showResults(){
  hideExplain();
  if(gameState.timerInterval) clearInterval(gameState.timerInterval);
  document.getElementById('screen-game').classList.add('hidden');
  document.body.classList.remove('game-mode');
  document.getElementById('screen-report').classList.add('hidden');
  document.getElementById('screen-results').classList.remove('hidden');
  document.getElementById('statusLabel').textContent = 'FINALIZADO';

  // animación de entrada escalonada (respeta prefers-reduced-motion vía la regla global)
  const enterEls = document.querySelectorAll('#screen-results .results-enter');
  enterEls.forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });

  const scenarioMeta = SCENARIOS.find(s => s.id === gameState.scenarioId);
  const resultsRoleMeta = roleMetaFor(gameState.scenarioId);
  const resultsStages = stagesFor(gameState.scenarioId);
  const duration = gameState.startTime ? fmtElapsed(new Date() - gameState.startTime) : '00:00';
  const total = gameState.totalQuestions;
  const wrongA = gameState.wrongAnswerCount;
  const wrongC = gameState.wrongCharacterCount;
  // La nota debe reflejar ambos tipos de error: elegir mal el personaje (quien responde)
  // es tan relevante para un tabletop como elegir mal la alternativa de respuesta.
  const precision = total > 0 ? Math.round((total / (total + wrongA + wrongC)) * 100) : 0;
  const elapsedSeconds = gameState.startTime ? Math.max(0, Math.round((new Date() - gameState.startTime) / 1000)) : 0;
  // El tiempo aporta una penalización moderada: 1 punto por cada 2 minutos, con un máximo de 10.
  const timePenalty = Math.min(10, Math.floor(elapsedSeconds / 120));
  const accuracy = Math.max(0, precision - timePenalty);

  let gradeClass, gradeLabel, message;
  if(accuracy >= 90){
    gradeClass = 'grade-excelente'; gradeLabel = 'Excelente';
    message = 'El grupo respondió con muy pocos errores. El ejercicio validó que el equipo conoce bien su rol en este escenario.';
  } else if(accuracy >= 75){
    gradeClass = 'grade-bueno'; gradeLabel = 'Bueno';
    message = 'Buen desempeño general, con algunos puntos de duda. Conviene revisar en la revisión posterior (hot-wash) las preguntas donde hubo más de un intento y observar el efecto del tiempo sobre el resultado.';
  } else if(accuracy >= 50){
    gradeClass = 'grade-regular'; gradeLabel = 'Regular';
    message = 'Hubo varias dudas durante el ejercicio. Esto es útil — señala en qué partes del procedimiento el equipo necesita más claridad antes de un incidente real.';
  } else {
    gradeClass = 'grade-refuerzo'; gradeLabel = 'Necesita refuerzo';
    message = 'El número de errores sugiere que el procedimiento no está suficientemente interiorizado por el equipo. Recomendable repetir el ejercicio después de reforzar los roles y el plan.';
  }

  document.getElementById('reportScenarioName').textContent = `Informe · ${scenarioMeta.name}${clientName ? ' · ' + clientName : ''}`;
  document.getElementById('gradeBadge').className = `grade-badge ${gradeClass}`;
  document.getElementById('gradePct').textContent = accuracy + '%';
  document.getElementById('gradeLabel').textContent = gradeLabel;
  document.getElementById('gradeMeta').textContent = `Precisión ${precision}% · −${timePenalty} pts por tiempo`;
  document.getElementById('resDuration').textContent = duration;
  document.getElementById('resTotal').textContent = total;
  document.getElementById('resWrongAnswers').textContent = wrongA;
  document.getElementById('resWrongChars').textContent = wrongC;
  document.getElementById('resDonutPct').textContent = accuracy + '%';

  // Dona de 3 colores proporcional a preguntas respondidas / errores de alternativa / errores de
  // personaje (misma base que el % de la nota final), armada con 3 círculos SVG superpuestos.
  const donutTotal = total + wrongA + wrongC;
  const circumference = 339.3; // 2 * PI * 54, coincide con el radio del círculo del SVG
  const correctLen = (total / donutTotal) * circumference;
  const altLen = (wrongA / donutTotal) * circumference;
  const charLen = (wrongC / donutTotal) * circumference;
  document.getElementById('resDonutCorrect').setAttribute('stroke-dasharray', `${correctLen} ${circumference}`);
  document.getElementById('resDonutAlt').setAttribute('stroke-dasharray', `${altLen} ${circumference}`);
  document.getElementById('resDonutAlt').setAttribute('transform', `rotate(${-90 + (correctLen / circumference) * 360} 66 66)`);
  document.getElementById('resDonutChar').setAttribute('stroke-dasharray', `${charLen} ${circumference}`);
  document.getElementById('resDonutChar').setAttribute('transform', `rotate(${-90 + ((correctLen + altLen) / circumference) * 360} 66 66)`);

  const stageChartEl = document.getElementById('resStageChart');
  const stageBarMax = Math.max(1, ...resultsStages.map(s => {
    const st = gameState.stageStats[s];
    return st ? Math.max(st.wrongAnswers, st.wrongCharacters) : 0;
  }));
  stageChartEl.innerHTML = resultsStages.map((stageName, idx) => {
    const stat = gameState.stageStats[stageName];
    if(!stat) return '';
    return `
      <div class="stage-chart-block results-enter" style="animation-delay:${0.24 + idx * 0.06}s;">
        <div class="stage-chart-label">${escapeHtml(stageName)} <span>(${stat.questions} pregunta${stat.questions === 1 ? '' : 's'})</span></div>
        <div class="mini-bar-row">
          <span class="mini-bar-label">Alternativa</span>
          <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.min(100, (stat.wrongAnswers / stageBarMax) * 100)}%; background:var(--amber);"></div></div>
          <span class="mini-bar-val">${stat.wrongAnswers}</span>
        </div>
        <div class="mini-bar-row">
          <span class="mini-bar-label">Personaje</span>
          <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.min(100, (stat.wrongCharacters / stageBarMax) * 100)}%; background:var(--red);"></div></div>
          <span class="mini-bar-val">${stat.wrongCharacters}</span>
        </div>
      </div>`;
  }).join('');
  document.getElementById('resultsMessage').textContent = message;

  const report = buildExecutiveReport();
  const reportEl = document.getElementById('executiveReport');
  reportEl.innerHTML = report.parts.map(p => `
    <div class="report-section">
      <div class="report-section-title">${escapeHtml(p.title)}</div>
      ${p.html}
    </div>`).join('');

  const activeParticipants = participants.filter(p => p.checked);
  const nowDate = new Date();
  const fechaLegible = nowDate.toLocaleDateString('es-CL', {day:'2-digit', month:'long', year:'numeric'});

  // ---- llenar el bloque de acta ----
  document.getElementById('actaFecha').textContent = fechaLegible;
  document.getElementById('actaFacilitador').textContent = facilitatorName || 'Sin registrar';
  document.getElementById('actaCliente').textContent = clientName || 'Sin registrar';
  document.getElementById('actaParticipantes').textContent = `${activeParticipants.length} de ${resultsRoleMeta.keys.length} funciones`;
  document.getElementById('actaNotes').value = '';

  function buildResultsExport(){
    return {
      tipo: 'tabletop-resultados', version: 1,
      cliente: clientName || null,
      facilitador: facilitatorName || null,
      escenario: scenarioMeta.name,
      fecha: nowDate.toISOString(),
      fecha_legible: fechaLegible,
      duracion: duration,
      calificacion: { porcentaje: accuracy, etiqueta: gradeLabel, precision, penalizacion_tiempo: timePenalty, segundos: elapsedSeconds },
      total_preguntas: total,
      errores_alternativas: wrongA,
      errores_personaje: wrongC,
      desglose_por_etapa: resultsStages.map(stageName => ({
        etapa: stageName, ...gameState.stageStats[stageName]
      })),
      informe_ejecutivo: {
        resumen: report.plain.resumen,
        porcentaje_primer_intento: report.plain.firstTryPct,
        etapa_mas_dificil: report.plain.worstStage,
        confusion_principal: report.plain.confusionTop ? {
          se_eligio: roleLabelWithName(report.plain.confusionTop.chosenRole),
          correspondia_a: roleLabelWithName(report.plain.confusionTop.targetRole),
          veces: report.plain.confusionTop.count
        } : null,
        fortalezas: report.plain.strengths,
        recomendaciones: report.plain.recomendaciones,
        plan_de_accion: report.plain.planAccion
      },
      acta: {
        participantes_confirmados: activeParticipants.length,
        notas_facilitador: document.getElementById('actaNotes').value || null
      },
      participantes: activeParticipants.map(p => ({
        funcion: resultsRoleMeta.names[p.roleKey], empresa: p.empresa || null
      }))
    };
  }

  function downloadResults(){
    const jsonStr = JSON.stringify(buildResultsExport(), null, 2);
    const blob = new Blob([jsonStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tabletop-resultado_${(clientName || 'cliente').toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${scenarioMeta.id}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.getElementById('downloadResultsBtn').onclick = downloadResults;
  document.getElementById('downloadResultsBtnBottom').onclick = downloadResults;
  document.getElementById('copyResultsBtn').onclick = () => {
    const btn = document.getElementById('copyResultsBtn'); const orig = btn.textContent;
    if(!navigator.clipboard || !navigator.clipboard.writeText){
      btn.textContent = 'No disponible en este navegador'; setTimeout(() => btn.textContent = orig, 2000);
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(buildResultsExport(), null, 2)).then(() => {
      btn.textContent = 'Copiado ✓'; setTimeout(() => btn.textContent = orig, 1500);
    }).catch(() => {
      btn.textContent = 'No se pudo copiar'; setTimeout(() => btn.textContent = orig, 2000);
    });
  };

  // «Guardar ejercicio»: persiste el resultado en localStorage (no depende de que el facilitador
  // recuerde descargar el JSON) y con eso da por cerrado el ejercicio, volviendo a la configuración.
  document.getElementById('saveExerciseBtn').onclick = () => {
    const record = buildResultsExport();
    record.id = `exercise_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    record.guardado_en = new Date().toISOString();
    const list = loadSavedExercises();
    list.push(record);
    saveExercisesList(list);
    showConfirmModal({
      title: 'Ejercicio guardado',
      message: `El resultado de <b>${escapeHtml(scenarioMeta.name)}</b>${clientName ? ` para <b>${escapeHtml(clientName)}</b>` : ''} quedó guardado en este navegador (${list.length} ejercicio${list.length === 1 ? '' : 's'} guardado${list.length === 1 ? '' : 's'} en total).`,
      confirmText: 'Cerrar y volver a la configuración', cancelText: null
    }).then(closeExerciseToSetup);
  };
}

document.getElementById('goToReportBtn').addEventListener('click', () => {
  document.getElementById('screen-results').classList.add('hidden');
  document.getElementById('screen-report').classList.remove('hidden');
  window.scrollTo({top: 0, behavior: 'smooth'});
});

document.getElementById('backToResultsBtn').addEventListener('click', () => {
  document.getElementById('screen-report').classList.add('hidden');
  document.getElementById('screen-results').classList.remove('hidden');
  window.scrollTo({top: 0, behavior: 'smooth'});
});

function closeExerciseToSetup(){
  document.getElementById('screen-report').classList.add('hidden');
  document.getElementById('screen-setup').classList.remove('hidden');
  document.getElementById('continueBtn').classList.remove('hidden');
  document.getElementById('statusLabel').textContent = 'CONFIGURACIÓN';
  document.body.classList.add('setup-mode');
  updateBottomState();
}
document.getElementById('backFromResultsBtn').addEventListener('click', closeExerciseToSetup);

function backToSetup(){
  hideExplain();
  if(gameState.timerInterval) clearInterval(gameState.timerInterval);
  document.getElementById('screen-game').classList.add('hidden');
  document.body.classList.remove('game-mode');
  document.getElementById('screen-setup').classList.remove('hidden');
  document.getElementById('continueBtn').classList.remove('hidden');
  document.getElementById('statusLabel').textContent = 'CONFIGURACIÓN';
  document.body.classList.add('setup-mode');
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
})();
