// Núcleo compartido del login con MFA (Firebase Auth: correo/contraseña + TOTP). Módulo ES sin
// bundler, mismo criterio que tabletop/js/multiplayer/firebase-init.js. Requiere que
// shared/firebase-config.js ya haya corrido (define window.TIBOX_FIREBASE_CONFIG).
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

export const app = getApps().length ? getApp() : initializeApp(window.TIBOX_FIREBASE_CONFIG);
export const auth = getAuth(app);

// Correos exactos que pueden entrar como facilitador (no "cualquier @tibox.cl": con el registro
// abierto para los celulares, alguien podría crear una cuenta a nombre de un colega sin cuenta
// y, si este confirma el correo de verificación, quedaría como facilitador). Mantener alineado
// con isFacilitator() en tabletop/firestore.rules, que es donde esto se hace cumplir de verdad.
export const ALLOWED_FACILITATORS = ['opinto@tibox.cl'];

function isAllowedEmail(email){
  return typeof email === 'string' && ALLOWED_FACILITATORS.includes(email.toLowerCase());
}

// Una sesión vale para entrar solo si se abrió con contraseña Y segundo factor TOTP, con el
// correo verificado y en la lista de facilitadores: Firebase firma esos datos en el token, así que no
// se pueden falsificar desde la consola del navegador. forceRefresh=true consulta al servidor,
// así una cuenta deshabilitada o eliminada deja de entrar aunque el navegador todavía tenga su
// sesión guardada.
export async function hasMfaSession(user){
  if(!user) return false;
  try{
    const t = await user.getIdTokenResult(true);
    const fb = t.claims.firebase || {};
    return fb.sign_in_provider === 'password' && fb.sign_in_second_factor === 'totp'
      && t.claims.email_verified === true && isAllowedEmail(t.claims.email);
  }catch(err){
    return false;
  }
}

// Chequeo previo al enrolamiento TOTP (antes de tener token con segundo factor): evita que
// una cuenta fuera de la lista llegue siquiera a registrar su autenticador.
export function isAllowedUser(user){
  return !!user && isAllowedEmail(user.email);
}
