// Capa de acceso a datos de Firestore para el modo "Con celulares" (Fase 1: crear/unirse a
// una sala y ver el lobby en vivo — sin votación/respuesta todavía, ver el plan). Sin código
// de DOM acá: solo lectura/escritura de rooms/{roomCode} y su subcolección participants.
// No lee window.TIBOX_MP_FIREBASE al cargar el módulo (evita depender del orden exacto de
// <script type="module">): lo hace recién dentro de cada función, cuando ya se necesita.
import {
  doc, setDoc, updateDoc, getDoc, getDocs, collection, onSnapshot, serverTimestamp, Timestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Estado de cada participante (admisión): al unirse queda 'pending' y solo el facilitador que
// creó la sala puede pasarlo a 'admitted' o 'rejected' (lo exige firestore.rules). Solo un
// participante 'admitted' puede votar o responder, y solo esos cuentan en el tally.
//
// Admisión por código: el facilitador genera un código de 6 dígitos para cada pendiente y se lo
// dice en persona. El código NUNCA se escribe en Firestore: vive solo en el navegador del
// facilitador. El celular escribe lo que la persona tecleó (codeAttempt: {value, n}) y el
// navegador del facilitador lo compara: si coincide lo admite; si no, marca ese intento como
// revisado (codeChecked = n). Las reglas limitan a MAX_CODE_ATTEMPTS intentos por código
// (n - attemptBase); "Nuevo código" sube attemptBase y vuelve a habilitar los intentos.
export const PARTICIPANT_STATUS = {PENDING: 'pending', ADMITTED: 'admitted', REJECTED: 'rejected'};
export const isAdmitted = p => !!p && p.status === PARTICIPANT_STATUS.ADMITTED;
export const MAX_CODE_ATTEMPTS = 5; // mismo tope que firestore.rules
// Intentos usados con el código vigente (los anteriores a "Nuevo código" no cuentan).
export const codeAttemptsUsed = p => ((p && p.codeAttempt && p.codeAttempt.n) || 0) - ((p && p.attemptBase) || 0);

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I/L: se confunden al leerlos en voz alta o a distancia
const ROOM_TTL_MS = 12 * 60 * 60 * 1000; // 12h — sesión corta, no hace falta más

// crypto.getRandomValues y no Math.random: el código de sala es la única barrera para
// entrar, así que no debe ser predecible. El sesgo de módulo (256 % 31) es despreciable acá.
function randomRoomCode(){
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let code = '';
  for(const b of bytes) code += ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length];
  return code;
}

async function firebaseReady(){
  const fb = window.TIBOX_MP_FIREBASE;
  if(!fb) throw new Error('Firebase no está inicializado (falta firebase-init.js).');
  const uid = await fb.ready;
  return {db: fb.db, uid};
}

// scenarioMeta: {scenarioId, roleRoster: [{roleKey, name, org, accent:[c1,c2]}]}
// roleRoster es una foto de las funciones activas al crear la sala (no cambia si el
// facilitador vuelve a tocar la configuración después) — así el celular que se une siempre
// ve una lista consistente durante toda la sala.
export async function createRoom(scenarioMeta){
  const {db, uid} = await firebaseReady();
  let attempts = 0;
  while(attempts < 5){
    const code = randomRoomCode();
    const ref = doc(db, 'rooms', code);
    const existing = await getDoc(ref);
    if(!existing.exists()){
      const now = Date.now();
      await setDoc(ref, {
        facilitatorUid: uid,
        status: 'lobby',
        scenarioId: scenarioMeta.scenarioId,
        roleRoster: scenarioMeta.roleRoster,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(now + ROOM_TTL_MS)
      });
      return code;
    }
    attempts++;
  }
  throw new Error('No se pudo generar un código de sala único. Intenta de nuevo.');
}

export async function getRoom(code){
  const {db} = await firebaseReady();
  const snap = await getDoc(doc(db, 'rooms', code));
  return snap.exists() ? snap.data() : null;
}

// Si esta sesión anónima (mismo navegador/celular) ya tiene un documento de participante en
// esta sala —se unió antes y cerró la pestaña o perdió la conexión sin querer—, lo devuelve
// para poder reconectarlo directo, sin pasar por el formulario ni por el bloqueo de "sala ya
// iniciada" de joinRoom(). null si nunca se unió desde este navegador.
export async function getMyParticipant(code){
  const {db, uid} = await firebaseReady();
  const snap = await getDoc(doc(db, 'rooms', code, 'participants', uid));
  return snap.exists() ? {uid, ...snap.data()} : null;
}

// Devuelve la función para cancelar la suscripción (llamarla al salir de la pantalla).
export function listenRoom(code, cb){
  const fb = window.TIBOX_MP_FIREBASE;
  if(!fb) throw new Error('Firebase no está inicializado (falta firebase-init.js).');
  return onSnapshot(doc(fb.db, 'rooms', code), snap => cb(snap.exists() ? snap.data() : null));
}

// Escucha el documento de participante de esta misma sesión (para que el celular se entere
// cuando el facilitador lo admite o lo rechaza). cb(null) si todavía no existe.
export function listenMyParticipant(code, cb){
  const fb = window.TIBOX_MP_FIREBASE;
  if(!fb) throw new Error('Firebase no está inicializado (falta firebase-init.js).');
  let unsub = () => {};
  let cancelled = false;
  fb.ready.then(uid => {
    if(cancelled) return;
    unsub = onSnapshot(doc(fb.db, 'rooms', code, 'participants', uid), snap => cb(snap.exists() ? {uid, ...snap.data()} : null));
  });
  return () => { cancelled = true; unsub(); };
}

export function listenParticipants(code, cb){
  const fb = window.TIBOX_MP_FIREBASE;
  if(!fb) throw new Error('Firebase no está inicializado (falta firebase-init.js).');
  return onSnapshot(collection(fb.db, 'rooms', code, 'participants'), snap => {
    cb(snap.docs.map(d => ({uid: d.id, ...d.data()})));
  });
}

// Une al participante actual (uid de su propia sesión anónima) a la sala, reclamando una
// función libre. La unicidad de la función ya NO depende de este chequeo (antes era
// lectura-antes-de-escribir, no atómico: dos toques en el mismo milisegundo podían ganar
// los dos) — la reserva rooms/{code}/roleClaims/{roleKey} y el participante se crean en un
// mismo batch: si dos participantes intentan la misma función a la vez, el segundo choca con
// la regla de seguridad (ver firestore.rules) porque para su escritura la reserva ya existe con
// otro uid, y no se crea nada. Este chequeo local (roleRoster.some) sigue sirviendo para dar
// un mensaje temprano sin round-trip cuando la función ni siquiera existe.
// Lanza Error con mensaje legible si: la sala no existe, ya empezó el ejercicio, la función
// no existe en este escenario, ya la tomó otro participante, o esta sesión ya fue rechazada.
// El participante queda 'pending' hasta que entre con el código que le da el facilitador.
export async function joinRoom(code, {displayName, roleKey}){
  const {db, uid} = await firebaseReady();
  const roomRef = doc(db, 'rooms', code);
  const roomSnap = await getDoc(roomRef);
  if(!roomSnap.exists()) throw new Error('No existe una sala con ese código.');
  const room = roomSnap.data();
  if(room.status !== 'lobby') throw new Error('Esta sala ya inició el ejercicio; no se pueden sumar nuevos participantes.');
  if(!room.roleRoster.some(r => r.roleKey === roleKey)) throw new Error('Esa función no existe en este escenario.');
  const mineSnap = await getDoc(doc(db, 'rooms', code, 'participants', uid));
  if(mineSnap.exists() && mineSnap.data().status === PARTICIPANT_STATUS.REJECTED){
    throw new Error('El facilitador no autorizó tu ingreso a esta sala.');
  }

  const now = Date.now();
  const expiresAt = Timestamp.fromMillis(now + ROOM_TTL_MS);

  // Reserva de la función + participante en una sola operación: o se crean ambos o ninguno
  // (las reglas lo exigen, para que no queden reservas sin participante).
  const batch = writeBatch(db);
  batch.set(doc(db, 'rooms', code, 'roleClaims', roleKey), {uid, claimedAt: serverTimestamp(), expiresAt});
  batch.set(doc(db, 'rooms', code, 'participants', uid), {
    uid, displayName: displayName.trim().slice(0, 60), claimedRoleKey: roleKey, // 60: tope de firestore.rules
    joinedAt: serverTimestamp(), lastSeen: serverTimestamp(),
    expiresAt,
    status: PARTICIPANT_STATUS.PENDING,
    vote: null, answer: null
  });
  try{
    await batch.commit();
  }catch(err){
    // Lo más común: la reserva ya existe a nombre de otro (las reglas la rechazan; eso es lo
    // que hace atómica la unicidad). Si no es eso, se informa como falla de conexión.
    const claim = await getDoc(doc(db, 'rooms', code, 'roleClaims', roleKey)).catch(() => null);
    if(claim && claim.exists() && claim.data().uid !== uid) throw new Error('Esa función ya la tomó otro participante. Elige otra.');
    throw new Error('No se pudo unir a la sala. Revisa tu conexión e intenta de nuevo.');
  }
  return uid;
}

// El celular envía el código que tecleó la persona. n: número de intento (siempre creciente;
// las reglas exigen que sea el anterior + 1 y que no pase el tope).
export async function submitAccessCode(code, value, n){
  const {db, uid} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code, 'participants', uid), {codeAttempt: {value: String(value), n}});
}

// ---------------- admisión (solo el facilitador de la sala; ver firestore.rules) ----------------
// Resultado de revisar el intento n en el navegador del facilitador: admitido, o solo revisado
// (incorrecto) para que el celular muestre "código incorrecto".
export async function resolveCodeAttempt(code, uid, n, correct){
  const {db} = await firebaseReady();
  const patch = {codeChecked: n};
  if(correct) patch.status = PARTICIPANT_STATUS.ADMITTED;
  await updateDoc(doc(db, 'rooms', code, 'participants', uid), patch);
}

// "Nuevo código": los intentos ya usados dejan de contar para el tope.
export async function resetCodeAttempts(code, uid, attemptBase){
  const {db} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code, 'participants', uid), {attemptBase});
}

// Rechaza y libera la función que había reservado, para que otra persona la pueda tomar. El
// documento queda como 'rejected' (no se borra): así esa sesión no puede volver a pedir ingreso.
export async function rejectParticipant(code, uid, roleKey){
  const {db} = await firebaseReady();
  const batch = writeBatch(db);
  batch.update(doc(db, 'rooms', code, 'participants', uid), {status: PARTICIPANT_STATUS.REJECTED});
  if(roleKey) batch.delete(doc(db, 'rooms', code, 'roleClaims', roleKey));
  await batch.commit();
}

// Cierre del ejercicio: la sala queda 'closed' y se borran todos los participantes y las
// funciones reservadas. Cada celular lo detecta (sala cerrada o su documento borrado), corta
// sus escuchas y cierra su sesión anónima (ver participant-app.js).
export async function closeRoom(code){
  const {db} = await firebaseReady();
  const [parts, claims] = await Promise.all([
    getDocs(collection(db, 'rooms', code, 'participants')),
    getDocs(collection(db, 'rooms', code, 'roleClaims'))
  ]);
  const batch = writeBatch(db);
  batch.update(doc(db, 'rooms', code), {status: 'closed'});
  parts.forEach(d => batch.delete(d.ref));
  claims.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// El facilitador cierra el lobby y arranca el ejercicio (status -> 'in_progress'). A partir
// de acá join.html ya no deja sumarse (ver joinRoom).
export async function startRoom(code){
  const {db} = await firebaseReady();
  await setDoc(doc(db, 'rooms', code), {status: 'in_progress'}, {merge: true});
}

// Introducción del escenario ({title, intro}): la publica el facilitador al mostrar
// #screen-briefing, para que los celulares la lean mientras tanto (ver participant-app.js).
export async function publishBriefing(code, briefing){
  const {db} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code), {briefing});
}

// ---------------- Fase 2: votación ----------------

// Publica el acto vigente (reemplaza currentAct entero — no queda ningún campo del acto
// anterior colgando). Solo el facilitador puede escribir la sala (ver firestore.rules), así
// que esto solo lo llama facilitator.js. `act.phase` normalmente arranca en 'voting'.
export async function publishAct(code, act){
  const {db} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code), {currentAct: act});
}

// Actualiza solo la fase del acto vigente (ej. 'voting' -> 'answering'), sin tocar el resto
// de currentAct. updateDoc con un path de puntos actualiza únicamente ese campo anidado.
export async function setActPhase(code, phase){
  const {db} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code), {'currentAct.phase': phase});
}

// Pasa el acto vigente a 'answering' y recién ahí publica la función que debe responder y
// las alternativas. Durante la votación currentAct no las trae: cualquier participante puede
// leer la sala completa (DevTools), así que publicar `target` antes delataría la respuesta.
export async function openAnswering(code, target, options){
  const {db} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code), {
    'currentAct.phase': 'answering', 'currentAct.target': target, 'currentAct.options': options
  });
}

// El participante actual vota por un roleKey para el acto vigente (actKey). Las reglas de
// seguridad ya exigen que currentAct.phase sea 'voting' para poder escribir este campo.
export async function castVote(code, actKey, roleKey){
  const {db, uid} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code, 'participants', uid), {
    vote: {actKey, roleKey, castAt: serverTimestamp()}
  });
}

// ---------------- Fase 3: respuesta individual ----------------

// El participante actual envía su alternativa (optionIndex, en el orden de currentAct.options
// tal como lo publicó el facilitador — ver answerOrder en facilitator.js) para el acto vigente.
// Las reglas de seguridad ya exigen phase == 'answering' y que este uid haya reclamado
// exactamente la función a la que le toca responder (currentAct.target).
export async function submitAnswer(code, actKey, optionIndex){
  const {db, uid} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code, 'participants', uid), {
    answer: {actKey, optionIndex, submittedAt: serverTimestamp()}
  });
}
