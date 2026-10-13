// Descifra los escenarios predefinidos (js/data/escenarios.enc.json) para el facilitador.
// La llave AES-256 está en Firestore, en config/scenarios (campo "key"), y las reglas solo dejan
// leerla a un facilitador autorizado (isFacilitator en firestore.rules): sin esa sesión, el
// archivo publicado no sirve de nada. Con la llave, llena window.QUESTIONS (que crea
// js/data/escenarios.js) y deja el estado en window.TIBOX_SCENARIOS para que app.js avise si
// todavía se están cargando o si no se pudieron cargar.
// Módulo ES (import por URL, sin bundler), igual que el resto de la parte de Firebase.
import { auth, hasMfaSession } from '../../auth/auth-core.js';
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

// Descifra el contenido de escenarios.enc.json con la llave en base64. Exportado aparte para
// poder probarlo sin Firebase.
export async function decryptScenarios(keyB64, enc){
  if(!enc || enc.v !== 1) throw new Error('Formato de escenarios cifrados desconocido');
  const key = await crypto.subtle.importKey('raw', b64(keyB64), 'AES-GCM', false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({name: 'AES-GCM', iv: b64(enc.iv)}, key, b64(enc.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

const state = window.TIBOX_SCENARIOS = {status: 'loading', error: null, decrypt: decryptScenarios};

async function load(){
  await auth.authStateReady();
  if(!(await hasMfaSession(auth.currentUser))) throw new Error('No hay una sesión de facilitador.');
  const snap = await getDoc(doc(getFirestore(auth.app), 'config', 'scenarios'));
  const keyB64 = snap.exists() ? snap.data().key : null;
  if(!keyB64) throw new Error('Falta la llave de los escenarios en Firestore (config/scenarios).');
  const res = await fetch(new URL('./data/escenarios.enc.json', import.meta.url), {cache: 'no-cache'});
  if(!res.ok) throw new Error(`No se pudo descargar escenarios.enc.json (HTTP ${res.status}).`);
  const questions = await decryptScenarios(keyB64, await res.json());
  // Los escenarios cargados desde Word en esta sesión (si alguno se cargó antes) se respetan.
  Object.keys(questions).forEach(id => { if(!(id in window.QUESTIONS)) window.QUESTIONS[id] = questions[id]; });
}

load().then(() => { state.status = 'ready'; })
  .catch(err => {
    state.status = 'error';
    state.error = err && err.message || String(err);
    console.error('[escenarios] No se pudieron cargar los escenarios predefinidos:', err);
  })
  .finally(() => window.dispatchEvent(new CustomEvent('tibox:scenarios', {detail: state})));
