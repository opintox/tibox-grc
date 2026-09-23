// Capa de acceso a datos de Firestore para el modo "Con celulares" (Fase 1: crear/unirse a
// una sala y ver el lobby en vivo — sin votación/respuesta todavía, ver el plan). Sin código
// de DOM acá: solo lectura/escritura de rooms/{roomCode} y su subcolección participants.
// No lee window.TIBOX_MP_FIREBASE al cargar el módulo (evita depender del orden exacto de
// <script type="module">): lo hace recién dentro de cada función, cuando ya se necesita.
import {
  doc, setDoc, updateDoc, getDoc, collection, onSnapshot, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I/L: se confunden al leerlos en voz alta o a distancia
const ROOM_TTL_MS = 12 * 60 * 60 * 1000; // 12h — sesión corta, no hace falta más

function randomRoomCode(){
  let code = '';
  for(let i = 0; i < 6; i++) code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
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
// los dos) — ahora se reclama primero un documento rooms/{code}/roleClaims/{roleKey}, cuya
// creación es atómica en Firestore: si dos participantes intentan la misma función a la vez,
// el segundo choca con la regla de seguridad (ver firestore.rules) porque para su escritura
// el documento ya existe con otro uid. Este chequeo local (roleRoster.some) sigue sirviendo
// para dar un mensaje temprano sin round-trip cuando la función ni siquiera existe.
// Lanza Error con mensaje legible si: la sala no existe, ya empezó el ejercicio, la función
// no existe en este escenario, o ya la tomó otro participante.
export async function joinRoom(code, {displayName, roleKey}){
  const {db, uid} = await firebaseReady();
  const roomRef = doc(db, 'rooms', code);
  const roomSnap = await getDoc(roomRef);
  if(!roomSnap.exists()) throw new Error('No existe una sala con ese código.');
  const room = roomSnap.data();
  if(room.status !== 'lobby') throw new Error('Esta sala ya inició el ejercicio; no se pueden sumar nuevos participantes.');
  if(!room.roleRoster.some(r => r.roleKey === roleKey)) throw new Error('Esa función no existe en este escenario.');

  const now = Date.now();
  const expiresAt = Timestamp.fromMillis(now + ROOM_TTL_MS);

  try{
    await setDoc(doc(db, 'rooms', code, 'roleClaims', roleKey), {uid, claimedAt: serverTimestamp(), expiresAt});
  }catch(err){
    // La regla de seguridad rechaza la escritura si el documento ya existe con otro uid —
    // esto es lo que hace atómica la unicidad, no una condición que revisemos nosotros.
    throw new Error('Esa función ya la tomó otro participante. Elige otra.');
  }

  await setDoc(doc(db, 'rooms', code, 'participants', uid), {
    uid, displayName: displayName.trim(), claimedRoleKey: roleKey,
    joinedAt: serverTimestamp(), lastSeen: serverTimestamp(),
    expiresAt,
    vote: null, answer: null
  });
  return uid;
}

// El facilitador cierra el lobby y arranca el ejercicio (status -> 'in_progress'). A partir
// de acá join.html ya no deja sumarse (ver joinRoom).
export async function startRoom(code){
  const {db} = await firebaseReady();
  await setDoc(doc(db, 'rooms', code), {status: 'in_progress'}, {merge: true});
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

// El participante actual vota por un roleKey para el acto vigente (actKey). Las reglas de
// seguridad ya exigen que currentAct.phase sea 'voting' para poder escribir este campo.
export async function castVote(code, actKey, roleKey){
  const {db, uid} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code, 'participants', uid), {
    vote: {actKey, roleKey, castAt: serverTimestamp()}
  });
}

// ---------------- Fase 3: respuesta individual ----------------

// El participante actual envía su alternativa (optionIndex, en el orden ORIGINAL de q.options
// — cada celular mezcla las 4 por su cuenta, ver participant-app.js) para el acto vigente.
// Las reglas de seguridad ya exigen phase == 'answering' y que este uid haya reclamado
// exactamente la función a la que le toca responder (currentAct.target).
export async function submitAnswer(code, actKey, optionIndex){
  const {db, uid} = await firebaseReady();
  await updateDoc(doc(db, 'rooms', code, 'participants', uid), {
    answer: {actKey, optionIndex, submittedAt: serverTimestamp()}
  });
}
