// Lógica de login.html: correo+contraseña -> código TOTP. Si la cuenta todavía no tiene
// autenticador, obliga a registrarlo antes de dejarla entrar (ver enrolamiento abajo).
import { auth, hasMfaSession, isAllowedUser } from './auth-core.js';
import {
  signInWithEmailAndPassword, signOut, sendEmailVerification, multiFactor,
  getMultiFactorResolver, TotpMultiFactorGenerator, applyActionCode
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const $ = id => document.getElementById(id);
const steps = { creds: $('stepCreds'), mfa: $('stepMfa'), enroll: $('stepEnroll'), verify: $('stepVerify') };
let resolver = null;      // resolver de Firebase mientras se espera el código TOTP
let totpHint = null;
let pendingSecret = null; // secreto TOTP a punto de registrarse
const VERIFY_RESEND_MS = 10 * 60 * 1000; // ver startEnrollment

function show(name){
  Object.entries(steps).forEach(([k, el]) => el.classList.toggle('on', k === name));
  const first = steps[name].querySelector('input');
  if(first) first.focus();
}
function setMsg(text, kind){
  const el = $('msg');
  el.textContent = text || '';
  el.className = 'msg' + (text ? ` show ${kind || 'error'}` : '');
}

function errText(err){
  switch(err && err.code){
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email': return 'Correo o contraseña incorrectos.';
    case 'auth/user-disabled': return 'Esta cuenta está deshabilitada.';
    case 'auth/too-many-requests': return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    case 'auth/invalid-verification-code': return 'Código incorrecto o vencido. Revisa que el reloj de tu teléfono esté en hora automática.';
    case 'auth/network-request-failed': return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
    case 'auth/operation-not-allowed': return 'El acceso con correo o la verificación en 2 pasos no está habilitado en Firebase todavía (falta activar Correo/contraseña, Identity Platform y TOTP).';
    case 'auth/unverified-email': return 'Debes verificar tu correo antes de activar la verificación en 2 pasos.';
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code': return 'Este link de verificación ya no es válido. Inicia sesión otra vez para recibir uno nuevo y usa solo el más reciente.';
    default: return 'No se pudo completar. Inténtalo de nuevo.';
  }
}

// Destino tras entrar: solo rutas del mismo sitio (evita usar ?next= como redirección abierta).
function destination(){
  const next = new URLSearchParams(location.search).get('next');
  if(next){
    try{
      const u = new URL(next, location.origin);
      if(u.origin === location.origin) return u.pathname + u.search + u.hash;
    }catch(e){ /* next inválido: se ignora */ }
  }
  return 'index.html';
}

async function startEnrollment(user){
  if(!isAllowedUser(user)){
    await signOut(auth);
    show('creds');
    setMsg('Esta cuenta no está autorizada para acceder.');
    return;
  }
  if(!user.emailVerified){
    // Cada envío invalida el link anterior: si se reintenta el login antes de abrir el correo,
    // no se manda otro (así el link que ya está en la bandeja sigue sirviendo).
    const email = user.email;
    const sentKey = 'tibox.verifySentAt.' + email;
    let lastSent = 0;
    try{ lastSent = Number(localStorage.getItem(sentKey)) || 0; }catch(e){ /* sin localStorage */ }
    const recent = Date.now() - lastSent < VERIFY_RESEND_MS;
    if(!recent){
      await sendEmailVerification(user);
      try{ localStorage.setItem(sentKey, String(Date.now())); }catch(e){ /* sin localStorage */ }
    }
    await signOut(auth);
    show('creds');
    setMsg(recent
      ? `Ya te enviamos un correo de verificación a ${email} hace poco. Usa ese link; si no llegó, espera unos minutos y vuelve a intentar.`
      : `Te enviamos un correo de verificación a ${email}. Ábrelo, presiona "Confirmar mi correo" y vuelve a iniciar sesión.`, 'ok');
    return;
  }
  const session = await multiFactor(user).getSession();
  pendingSecret = await TotpMultiFactorGenerator.generateSecret(session);
  const uri = pendingSecret.generateQrCodeUrl(user.email, 'TIBOX Tabletop');
  try{
    const qr = window.qrcode(0, 'M');
    qr.addData(uri);
    qr.make();
    $('enrollQr').innerHTML = qr.createSvgTag({cellSize: 4, margin: 0, scalable: true});
  }catch(err){
    $('enrollQr').textContent = '';
  }
  $('enrollKey').textContent = pendingSecret.secretKey;
  show('enroll');
}

steps.creds.addEventListener('submit', async e => {
  e.preventDefault();
  setMsg('');
  const btn = $('credsBtn');
  btn.disabled = true;
  try{
    const cred = await signInWithEmailAndPassword(auth, $('email').value.trim(), $('password').value);
    // Entró solo con contraseña: la cuenta todavía no tiene segundo factor.
    await startEnrollment(cred.user);
  }catch(err){
    if(err && err.code === 'auth/multi-factor-auth-required'){
      resolver = getMultiFactorResolver(auth, err);
      totpHint = resolver.hints.find(h => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
      if(!totpHint){ setMsg('Tu cuenta usa un método de verificación no compatible con este sitio.'); }
      else { $('password').value = ''; show('mfa'); }
    }else{
      setMsg(errText(err));
    }
  }finally{
    btn.disabled = false;
  }
});

steps.mfa.addEventListener('submit', async e => {
  e.preventDefault();
  setMsg('');
  const btn = $('mfaBtn');
  btn.disabled = true;
  try{
    const assertion = TotpMultiFactorGenerator.assertionForSignIn(totpHint.uid, $('mfaCode').value.trim());
    const cred = await resolver.resolveSignIn(assertion);
    if(!(await hasMfaSession(cred.user))){
      await signOut(auth);
      $('mfaCode').value = '';
      btn.disabled = false;
      show('creds');
      setMsg('Esta cuenta no está autorizada para acceder.');
      return;
    }
    location.replace(destination());
  }catch(err){
    setMsg(errText(err));
    $('mfaCode').value = '';
    btn.disabled = false;
  }
});

steps.enroll.addEventListener('submit', async e => {
  e.preventDefault();
  setMsg('');
  const btn = $('enrollBtn');
  btn.disabled = true;
  try{
    const assertion = TotpMultiFactorGenerator.assertionForEnrollment(pendingSecret, $('enrollCode').value.trim());
    await multiFactor(auth.currentUser).enroll(assertion, 'Autenticador');
    pendingSecret = null;
    // El token de esta sesión todavía no trae el segundo factor: se cierra y se entra de nuevo con código.
    await signOut(auth);
    $('enrollCode').value = '';
    btn.disabled = false;
    show('creds');
    setMsg('Autenticador activado. Inicia sesión otra vez e ingresa tu código.', 'ok');
  }catch(err){
    setMsg(errText(err));
    $('enrollCode').value = '';
    btn.disabled = false;
  }
});

document.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', async () => {
  resolver = null; totpHint = null; pendingSecret = null;
  try{ await signOut(auth); }catch(e){ /* sin sesión */ }
  setMsg('');
  show('creds');
}));

// Links de los correos de Firebase (plantillas con "URL de acción" apuntando a esta página).
// La verificación de correo se aplica recién cuando la persona presiona el botón: los filtros
// de correo corporativo (ej. Microsoft Defender Safe Links) abren los links para revisarlos y,
// con la página por defecto de Firebase, eso gastaba el código antes de que la persona llegara.
// Cualquier otra acción (ej. restablecer contraseña) se deriva a la página estándar de Firebase.
function handleActionLink(){
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  const oobCode = params.get('oobCode');
  if(!mode || !oobCode) return false;
  if(mode !== 'verifyEmail'){
    location.replace(`https://${window.TIBOX_FIREBASE_CONFIG.authDomain}/__/auth/action${location.search}`);
    return true;
  }
  show('verify');
  steps.verify.addEventListener('submit', async e => {
    e.preventDefault();
    setMsg('');
    const btn = $('verifyBtn');
    btn.disabled = true;
    try{
      await applyActionCode(auth, oobCode);
      history.replaceState(null, '', location.pathname); // saca el código de la URL
      show('creds');
      setMsg('Correo verificado. Ahora inicia sesión para activar tu autenticador.', 'ok');
    }catch(err){
      history.replaceState(null, '', location.pathname);
      show('creds');
      setMsg(errText(err));
    }finally{
      btn.disabled = false;
    }
  });
  return true;
}

(async () => {
  if(handleActionLink()) return;
  await auth.authStateReady();
  if(await hasMfaSession(auth.currentUser)) location.replace(destination());
})();
