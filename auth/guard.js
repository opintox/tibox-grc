// Guardia de las páginas protegidas (hub e index del tabletop). Cada página trae en su <head>
// un <style id="authHide"> que la deja invisible; acá se quita solo si hay una sesión válida
// con MFA, y si no se manda a login.html. Falla cerrado: si el SDK no carga, la página queda
// oculta. Límite conocido: es una barrera del lado del navegador (el sitio es estático); la
// protección real de los datos vive en las reglas de Firestore, que exigen esta misma sesión
// con MFA para crear salas.
import { auth, hasMfaSession } from './auth-core.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const loginUrl = new URL('../login.html', import.meta.url);

// Solo estético: si se entró por ".../index.html" (marcador antiguo o link compartido), la barra
// muestra la carpeta (".../tabletop/"), que GitHub Pages sirve igual. No recarga la página.
if(location.pathname.endsWith('/index.html')){
  history.replaceState(history.state, '', location.pathname.slice(0, -'index.html'.length) + location.search + location.hash);
}

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
