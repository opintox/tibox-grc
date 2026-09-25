// Guardia de las páginas protegidas (hub e index del tabletop). Cada página trae en su <head>
// un <style id="authHide"> que la deja invisible; acá se quita solo si hay una sesión válida
// con MFA, y si no se manda a login.html. Falla cerrado: si el SDK no carga, la página queda
// oculta. Límite conocido: es una barrera del lado del navegador (el sitio es estático); la
// protección real de los datos vive en las reglas de Firestore, que exigen esta misma sesión
// con MFA para crear salas.
import { auth, hasMfaSession } from './auth-core.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const loginUrl = new URL('../login.html', import.meta.url);

async function run(){
  try{
    await auth.authStateReady();
    const user = auth.currentUser;
    if(await hasMfaSession(user)){
      document.getElementById('authHide')?.remove();
      document.querySelectorAll('[data-auth-email]').forEach(el => { el.textContent = user.email || ''; });
      document.querySelectorAll('[data-auth-signout]').forEach(el => {
        el.addEventListener('click', async () => {
          await signOut(auth);
          location.replace(loginUrl.href);
        });
      });
      return;
    }
  }catch(err){
    console.error('[auth] No se pudo verificar la sesión:', err);
  }
  loginUrl.searchParams.set('next', location.pathname + location.search + location.hash);
  location.replace(loginUrl.href);
}
run();
