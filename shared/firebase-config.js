// Config del proyecto Firebase del sitio: la usan el login con MFA (auth/), el inicio, el
// tabletop (facilitador y celulares, modo "Con celulares") y el SGC. No es secreto: lo que
// protege los datos son las reglas de Firestore (tabletop/firestore.rules) y de Supabase, no
// ocultar este objeto. Script clásico (no módulo) para que cualquier página lo cargue igual,
// antes de auth/auth-core.js o tabletop/js/multiplayer/firebase-init.js.
window.TIBOX_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDjU50Egec3T_f_qpF9RvbTOVz9cLsw2hQ",
  authDomain: "cosmic-roaming-walrus.firebaseapp.com",
  projectId: "cosmic-roaming-walrus",
  storageBucket: "cosmic-roaming-walrus.firebasestorage.app",
  messagingSenderId: "1060355620958",
  appId: "1:1060355620958:web:a626463e61c444d626f4cf",
  measurementId: "G-K99LWE3BSX"
};
