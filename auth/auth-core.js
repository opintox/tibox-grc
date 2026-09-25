// Núcleo compartido del login con MFA (Firebase Auth: correo/contraseña + TOTP). Módulo ES sin
// bundler, mismo criterio que tabletop/js/multiplayer/firebase-init.js. Requiere que
// tabletop/js/multiplayer/firebase-config.js ya haya corrido (define window.TIBOX_FIREBASE_CONFIG).
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

export const app = getApps().length ? getApp() : initializeApp(window.TIBOX_FIREBASE_CONFIG);
export const auth = getAuth(app);

// Solo cuentas de este dominio pueden entrar como facilitador. Mantener alineado con
// isFacilitator() en tabletop/firestore.rules, que es donde esto se hace cumplir de verdad.
export const ALLOWED_EMAIL_DOMAIN = 'tibox.cl';

function isAllowedEmail(email){
  return typeof email === 'string' && email.toLowerCase().endsWith('@' + ALLOWED_EMAIL_DOMAIN);
}

// Una sesión vale para entrar solo si se abrió con contraseña Y segundo factor TOTP, con el
// correo verificado y del dominio permitido: Firebase firma esos datos en el token, así que no
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
// una cuenta de otro dominio llegue siquiera a registrar su autenticador.
export function isAllowedUser(user){
  return !!user && isAllowedEmail(user.email);
}
