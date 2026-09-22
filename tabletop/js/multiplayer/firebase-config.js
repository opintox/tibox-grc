// Config del proyecto Firebase (Firestore + Auth anónima) para el modo "Con celulares".
// No es secreto: lo que protege los datos son las reglas de seguridad de Firestore
// (firestore.rules), no ocultar este objeto. Script clásico (no módulo) para que tanto
// index.html (facilitador) como join.html (participante) lo carguen igual, antes de
// firebase-init.js.
window.TIBOX_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDjU50Egec3T_f_qpF9RvbTOVz9cLsw2hQ",
  authDomain: "cosmic-roaming-walrus.firebaseapp.com",
  projectId: "cosmic-roaming-walrus",
  storageBucket: "cosmic-roaming-walrus.firebasestorage.app",
  messagingSenderId: "1060355620958",
  appId: "1:1060355620958:web:a626463e61c444d626f4cf",
  measurementId: "G-K99LWE3BSX"
};
