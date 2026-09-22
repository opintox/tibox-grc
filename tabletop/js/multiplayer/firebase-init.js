// Inicializa Firebase (Firestore + Auth anónima) para el modo "Con celulares".
// Módulo ES (import por URL, sin npm/build — mismo criterio que el resto de la app, que no
// tiene bundler) que expone lo necesario en window.TIBOX_MP_FIREBASE para que tanto app.js
// (script clásico) como participant-app.js (otro módulo) lo consuman sin duplicar la carga
// del SDK. Requiere que js/multiplayer/firebase-config.js ya haya corrido (define
// window.TIBOX_FIREBASE_CONFIG) y que <script> para este archivo tenga type="module".
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const app = initializeApp(window.TIBOX_FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

// Promesa única: se resuelve con el uid una vez que la sesión anónima queda lista (ya sea
// una nueva o una que el navegador ya traía). Todo lo demás en room.js espera esto antes de
// leer/escribir, para que las reglas de seguridad (que exigen request.auth != null) nunca
// fallen por una carrera contra el login anónimo.
let resolveReady;
const ready = new Promise(res => { resolveReady = res; });
onAuthStateChanged(auth, user => {
  if(user){ resolveReady(user.uid); return; }
  signInAnonymously(auth).catch(err => {
    console.error('[multiplayer] No se pudo iniciar sesión anónima en Firebase:', err);
  });
});

window.TIBOX_MP_FIREBASE = { app, db, auth, ready };
