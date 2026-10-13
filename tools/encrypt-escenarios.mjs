// Cifra los escenarios predefinidos para publicarlos sin exponer las respuestas correctas.
//
//   node tools/encrypt-escenarios.mjs
//
// Lee private/escenarios.js (texto legible, NO va al repo) y escribe
// tabletop/js/data/escenarios.enc.json (AES-256-GCM, sí va al repo). La llave vive en
// private/scenario-key.txt (se crea la primera vez) y en Firestore, en config/scenarios
// (campo "key"), que solo puede leer el facilitador autorizado (ver tabletop/firestore.rules).
// La app la lee al entrar y descifra los escenarios en el navegador (tabletop/js/scenario-vault.js).
//
// Después de editar private/escenarios.js: correr este script y subir escenarios.enc.json.
// Si cambias la llave (borrando private/scenario-key.txt), hay que actualizarla también en
// Firestore, o la app no podrá descifrar.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = path.join(root, 'private', 'escenarios.js');
const keyPath = path.join(root, 'private', 'scenario-key.txt');
const outPath = path.join(root, 'tabletop', 'js', 'data', 'escenarios.enc.json');

// escenarios.js define `const QUESTIONS = {...}`: se evalúa aislado y se toma ese objeto.
const ctx = {};
vm.runInNewContext(readFileSync(srcPath, 'utf8') + '\n;__out = QUESTIONS;', ctx);
const questions = ctx.__out;
if(!questions || typeof questions !== 'object') throw new Error('private/escenarios.js no define QUESTIONS');

let keyB64;
if(existsSync(keyPath)){
  keyB64 = readFileSync(keyPath, 'utf8').trim();
} else {
  keyB64 = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64');
  writeFileSync(keyPath, keyB64 + '\n');
  console.log('Llave nueva creada en private/scenario-key.txt — cárgala en Firestore (config/scenarios, campo "key").');
}
const rawKey = Buffer.from(keyB64, 'base64');
if(rawKey.length !== 32) throw new Error('La llave debe ser de 32 bytes (base64)');

const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
const iv = crypto.getRandomValues(new Uint8Array(12));
const plain = new TextEncoder().encode(JSON.stringify(questions));
const data = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, plain));

writeFileSync(outPath, JSON.stringify({
  v: 1, alg: 'AES-256-GCM',
  iv: Buffer.from(iv).toString('base64'),
  data: Buffer.from(data).toString('base64')
}) + '\n');
console.log(`Listo: ${Object.keys(questions).length} escenarios cifrados en tabletop/js/data/escenarios.enc.json`);
