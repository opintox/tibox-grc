// Escenarios predefinidos (situaciones, alternativas y explicaciones de cada acto).
// No se publican en texto legible: traen las respuestas correctas y el sitio es público.
// Van cifrados en escenarios.enc.json y los descifra js/scenario-vault.js cuando entra el
// facilitador autorizado (la llave está en Firestore y solo él puede leerla).
// Para editarlos: private/escenarios.js (solo en el computador del facilitador, fuera del repo)
// y luego `node tools/encrypt-escenarios.mjs`.
// Acá solo se crea el objeto que app.js usa; se llena al descifrar (y con los escenarios que
// se cargan desde Word, que nunca se publican).
window.QUESTIONS = {};
