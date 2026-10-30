# TIBOX · Herramientas

Sitio estático (sin build ni dependencias de npm) publicado con GitHub Pages desde la rama
`main`. Contiene un inicio con login y tres herramientas:

- **Tabletop**: ejercicio de simulación de respuesta a incidentes de ciberseguridad, en una
  sola pantalla o con los participantes votando y respondiendo desde su celular.
- **Generador de Informes**: arma un Word con el formato documental de TIBOX (portada, ficha
  documental, control de cambios, firmas, índice y contenido) a partir de un borrador.
- **SGC** (Cumplimiento CIP): hoy **deshabilitado** (ver más abajo).

## Estructura

```
/
├── index.html                 Inicio: tarjetas de las herramientas (protegido por login)
├── login.html                 Login: correo + contraseña + código TOTP
├── favicon.ico / apple-touch-icon.png  Ícono de la pestaña (cubo TIBOX); cada página lo enlaza
├── firebase.json / .firebaserc  Para publicar las reglas de Firestore con Firebase CLI
├── shared/
│   └── firebase-config.js     Config del proyecto Firebase (la usan login, tabletop y SGC)
├── auth/
│   ├── auth-core.js           Inicializa Firebase Auth y define qué sesión es válida
│   ├── guard.js               Protege una página: sin sesión válida, manda a login.html
│   └── login.js               Lógica de login.html (MFA, enrolamiento, verificación de correo)
├── img/                       Fondo del sitio
├── tabletop/
│   ├── index.html             Todas las pantallas del facilitador (solo marcado)
│   ├── join.html              Página del celular de cada participante
│   ├── firestore.rules        Reglas de Firestore (se publican con firebase deploy, ver abajo)
│   ├── assets/                Logo e imágenes de las tarjetas de escenario
│   ├── css/
│   │   ├── styles.css         Tokens de diseño y estilos de todas las pantallas
│   │   └── multiplayer.css    Sala de espera, celulares y avisos del modo con celulares
│   └── js/
│       ├── data/
│       │   ├── catalogo.js    Escenarios, funciones, matriz de participación, introducciones
│       │   ├── escenarios.js  Solo crea QUESTIONS vacío (el contenido va cifrado, ver abajo)
│       │   └── escenarios.enc.json  Escenarios predefinidos cifrados (AES-256-GCM)
│       ├── lib/               JSZip (Word) y generador de QR, versionados en el repo
│       ├── docx.js            Leer/escribir escenarios en Word y generar el informe en Word
│       ├── screens.js         Navegación entre pantallas (una sola función: show)
│       ├── builder.js         Constructor guiado de escenarios
│       ├── report.js          Resultados, informe ejecutivo y exportaciones (JSON/Word/PDF)
│       ├── report-pdf.js      Informe en PDF con el mismo formato del Word (formato-sgsi-v2)
│       ├── scenario-vault.js  Descifra los escenarios con la llave de Firestore (solo facilitador)
│       ├── saved.js           Ejercicios guardados (ver, Word/JSON, borrar, importar)
│       ├── app.js             Configuración del ejercicio y motor del juego
│       └── multiplayer/       Modo "Con celulares" (módulos ES + Firestore)
│           ├── firebase-init.js   Firestore + sesión anónima de los celulares
│           ├── room.js            Lectura/escritura de la sala en Firestore (sin DOM)
│           ├── facilitator.js     Sala de espera, votación y respuestas del lado del facilitador
│           └── participant-app.js Lógica de join.html
├── informes/                  Generador de Informes (protegido por login)
│   ├── index.html             Marcado de los 4 pasos (portada, ficha, contenido, descargar)
│   ├── css/informes.css       Diseño TIBOX de la app; la hoja de vista previa imita el Word
│   ├── assets/                Portada base, logo del encabezado y plantilla Word neutra
│   └── js/
│       ├── app.js             Pasos, ficha, hoja editable, lectura del borrador y descarga
│       ├── docx-builder.js    Arma el .docx sobre assets/plantilla-informe.docx
│       ├── docx-parts.js      Trozos de XML de la plantilla (portada, índice, firmas…)
│       └── lib/               mammoth (lee el borrador .docx); JSZip se toma de tabletop/js/lib
└── sgc/                       SGC deshabilitado (ver más abajo)
```

### Cómo se conectan los scripts del tabletop

`tabletop/index.html` carga en este orden: `catalogo.js` → `escenarios.js` → JSZip →
`docx.js` → `screens.js` → `builder.js` → `report.js` → `app.js`, y después los módulos del
modo con celulares. `builder.js` y `report.js` solo definen su módulo
(`TabletopBuilder`, `TabletopReport`); `app.js` les entrega lo que necesitan al final del
archivo con `init(...)`. Para cambiar de pantalla se usa siempre
`TabletopScreens.show('nombre')` (ver `screens.js`): nunca ocultar/mostrar pantallas a mano.

## Cómo correrlo en local

El sitio necesita un servidor HTTP (los módulos ES y Firebase no funcionan abriendo el
archivo con doble clic) y una cuenta autorizada para pasar el login:

1. Abre la carpeta en VS Code e instala **Live Server** (`ritwickdey.LiveServer`).
2. Clic derecho sobre `index.html` (el de la raíz) → *Open with Live Server*.
3. Inicia sesión con una cuenta de facilitador autorizada con TOTP (ver "Acceso").

Al publicar en GitHub Pages, los cambios en `main` quedan en línea en 1–2 minutos.

## Acceso

- Login con Firebase Auth: correo + contraseña + código de app autenticadora (TOTP).
- Solo los correos de la lista de facilitadores (ver "Modo Con celulares"), con el correo verificado. Las cuentas se crean a mano en Firebase
  Console → Authentication → Users (no hay registro abierto en el sitio).
- La primera vez el login pide verificar el correo (el link abre `login.html` y se confirma
  con un botón, para que los filtros de correo no gasten el link) y luego registrar el
  autenticador.
- El login solo oculta las páginas: el código del sitio es público. Lo que protege los datos
  son las reglas de Firestore (`tabletop/firestore.rules`) y de Supabase.

## Dónde tocar cada cosa

| Quiero… | Archivo |
|---|---|
| Cambiar el tamaño de toda la interfaz | `tabletop/css/styles.css` → `--root-size` |
| Ajustar la escala tipográfica | `tabletop/css/styles.css` → tokens `--fs-*` |
| Agregar o editar un tipo de ataque | `js/data/catalogo.js` → `SCENARIOS`, `SCENARIO_BLURBS`, `SCENARIO_TARGETS`, `SCENARIO_ACCENTS`, `SCENARIO_ICONS` |
| Cambiar quién participa en un escenario | `js/data/catalogo.js` → `PARTICIPATION_MATRIX` |
| Cambiar qué funciones estándar son obligatorias, opcionales o quién las suple | `js/data/catalogo.js` → `ROLE_MANDATORY`, `ROLE_SUPLENTES`, `ROLE_OPTIONAL` |
| Escribir o corregir el relato de un escenario | `private/escenarios.js` (fuera del repo) y luego `node tools/encrypt-escenarios.mjs` |
| Cambiar la introducción previa a la primera etapa | `js/data/catalogo.js` → `SCENARIO_INTROS` |
| Agregar o cambiar una pantalla | `tabletop/index.html` (marcado) + `js/screens.js` (registrarla) |
| Cambiar el informe final o sus descargas | `js/report.js`; el Word en `docx.js` → `downloadReportDocx` y el PDF en `js/report-pdf.js`, los dos con el formato de la skill `/formato-sgsi-v2` (Carta, portada con imagen TIBOX, encabezado con logo, control de cambios, títulos I./1.1, tablas azul marino). Las imágenes están en `tabletop/assets/informe/`; si se cambia el formato, cambiar los dos archivos |
| Cambiar el constructor de escenarios | `js/builder.js` |
| Cambiar el modo con celulares | `js/multiplayer/` y `tabletop/firestore.rules` |
| Cambiar el comportamiento del ejercicio | `js/app.js` |
| Cambiar el Generador de Informes | `informes/js/app.js` (pantallas y borrador), `informes/js/docx-builder.js` (el Word). La plantilla `informes/assets/plantilla-informe.docx` va sin datos de clientes: el repo es público, así que logos, nombres y firmas se cargan en la app y quedan solo en el navegador |

## Escenarios en Word

Cualquier escenario se puede exportar a Word desde su tarjeta, y un Word con el mismo formato
se puede importar para jugarlo en la sesión (no queda guardado al recargar). La plantilla en
blanco y el constructor guiado generan el mismo formato.

El Word se lee por **etiquetas en MAYÚSCULAS seguidas de dos puntos**, un párrafo por línea:
`NOMBRE DEL ESCENARIO`, `DESCRIPCION CORTA`, `OBJETIVO (ACTIVO AFECTADO)`,
`FUNCION DEL ESCENARIO` (una línea por función propia), `INTRODUCCION`, `ETAPA` y, por cada
acto, `FUNCION QUE RESPONDE`, `TITULO DEL ACTO`, `CONTEXTO`, `SITUACION`, `ALTERNATIVA A–D`,
`EXPLICACION A–D`, `ALTERNATIVA CORRECTA` y `POR QUE RESPONDE ESTA FUNCION`. Las tildes en las
etiquetas son opcionales.

- `INTRODUCCION:` va **justo antes de la primera `ETAPA:`**: toma todos los párrafos que
  siguen hasta la próxima etiqueta.
- El párrafo que empieza con `Contexto para facilitadores.` se muestra en la ventana
  "Contexto" ordenado en bloques (`js/context-format.js`), según cómo esté escrita cada
  oración: antecedentes; cronología (oraciones que empiezan con una hora); protocolo ("…debe
  hacer tres cosas: a, b y c"); personas ("…participan: Nombre, Cargo, que…; …"); cadena de
  escalamiento ("el SOC escala al TeamLeader y el TeamLeader pide … a Empresa X"); cargos que
  "solo se mencionan; no juegan"; y fichas `Etiqueta: valor` (ej. `Plazos:`, `Fuera de
  alcance:`, `Duración objetivo:`), con los tiempos destacados.
- Si el documento menciona "Quintero Energía" o "Empresa Eléctrica Ventanas", la tarjeta usa
  el logo del cliente y la empresa de cada función se completa sola (Ingenieros de Soporte
  N1/N2 y TeamLeader → TIBOX; el resto → cliente).

### Funciones que no participan: obligatorias, con suplente y opcionales

En el paso **Participantes** se desmarcan las funciones que no asisten y el ejercicio se adapta.
Cada función es de uno de tres tipos:

| Tipo | En el Word | Si no participa… |
|---|---|---|
| Obligatoria | `(OBLIGATORIA)` | No se puede desmarcar |
| Con suplente | `(SUPLENTE: otra función)` | Sus actos los asume el suplente (y si falta, el suplente del suplente) |
| Opcional | `(OPCIONAL)` | Sus actos se omiten: se escriben para que el resto no dependa de ellos |

```
FUNCION DEL ESCENARIO: Jefe de Turno (OBLIGATORIA)
FUNCION DEL ESCENARIO: TeamLeader (OBLIGATORIA)
FUNCION DEL ESCENARIO: Ingeniero de Soporte N1 (SUPLENTE: Ingeniero de Soporte N2 (SOC))
FUNCION DEL ESCENARIO: Ingeniero de Soporte N2 (SOC) (SUPLENTE: TeamLeader)
FUNCION DEL ESCENARIO: Encargado CIP (OPCIONAL)
...
FUNCION QUE RESPONDE: Ingeniero de Soporte N1
SI NO PARTICIPA, RESPONDE: Ingeniero de Soporte N2 (Firewall)   ← opcional, solo para este acto
```

- Una función sin marca se trata como opcional, con un aviso al cargar el Word.
- Un paréntesis que no es una marca es parte del nombre: así la especialidad del N2 se
  conserva, también dentro del suplente (`(SUPLENTE: Ingeniero de Soporte N2 (SOC))`).
- Los cargos salen del catálogo de la skill `/roles` (Ingeniero de Soporte N1/N2, TeamLeader,
  Encargado CIP, Área Legal…). Con el logo de EEV, la empresa se completa sola: los Ingenieros
  de Soporte y el TeamLeader son de TIBOX; el resto, del cliente.
- `SI NO PARTICIPA, RESPONDE:` (en un acto) manda sobre el tipo de la función.
- Organigrama estándar (`catalogo.js` → `ROLE_MANDATORY`, `ROLE_SUPLENTES`, `ROLE_OPTIONAL`):
  Seguridad, TI y Dirección obligatorias (Dirección, en los escenarios donde participa);
  Legal, Comunicaciones y RRHH opcionales. Dirección es obligatoria porque su acto es el Cierre,
  una decisión de la gerencia que el texto dice que no se delega: si la asumiera Seguridad, el
  acto no calzaría. Donde Dirección no está en la matriz, el Cierre lo responde Seguridad.
  Legal, Comunicaciones y RRHH no tienen suplente porque en los escenarios predefinidos sus
  actos son de competencia exclusiva (el propio "por qué" del acto lo dice) y ningún otro acto
  depende de ellos: omitirlos no deja huecos, reasignarlos sí contradeciría la explicación.
  Una función que no está en `PARTICIPATION_MATRIX` para un escenario no juega en él: sus actos
  se omiten siempre.
- Si una etapa queda sin actos, se juega su primer acto con Seguridad (estándar) o con la
  primera función obligatoria activa.
- Al cargar un Word se avisa (sin bloquear) si hay funciones sin tipo, ninguna obligatoria,
  suplentes en círculo o actos cuyo texto nombra al cargo que responde (no calzaría con el
  suplente). El constructor guiado muestra los mismos avisos en "Revisar y generar".
- El paso Participantes resume qué pasa con cada función desmarcada, con los títulos de los
  actos que se omiten. En el juego se avisa cuando actúa un suplente, y el informe lo anota.

## Escenarios predefinidos cifrados

Los escenarios predefinidos traen las respuestas correctas y el sitio es público, así que no se
publican en texto legible:

- `private/escenarios.js`: el texto legible. Solo en el computador del facilitador (`private/`
  está en `.gitignore`), junto con la llave (`private/scenario-key.txt`).
- `node tools/encrypt-escenarios.mjs`: cifra `private/escenarios.js` y escribe
  `tabletop/js/data/escenarios.enc.json`, que es lo que se sube.
- La llave también está en Firestore, en `config/scenarios` (campo `key`). Las reglas solo dejan
  leerla al facilitador autorizado; `js/scenario-vault.js` la lee al entrar y descifra en el navegador.
- Si se pierde `private/`, se puede recuperar el contenido descifrando `escenarios.enc.json` con la
  llave de Firestore. Si se cambia la llave, hay que actualizarla en los dos lugares.

## Formato de un escenario en `private/escenarios.js`

Cada escenario es una lista de etapas; cada etapa tiene una o más preguntas (actos):

```js
{
  "target": "ti",                       // función que debe actuar
  "title": "Acto 1 · El correo del banco",
  "meta": ["09:12", "Martes", "Microsoft 365"],
  "situation": "Párrafo 1.\n\nPárrafo 2.\n\nPárrafo 3.",
  "options": ["correcta", "incorrecta", "incorrecta", "incorrecta"],
  "explanations": ["por qué sí", "por qué no", "por qué no", "por qué no"],
  "mismatchContext": "Por qué le toca a esta función y no a otra.",
  "correctIndex": 0,                    // siempre 0: el orden se baraja en pantalla
  "backup": "seguridad"                 // opcional: quién lo asume si "target" no participa
}
```

Reglas: la opción de índice 0 es siempre la correcta, `options` y `explanations` deben
tener el mismo largo, y `target` debe ser una función que participe en ese escenario
según `PARTICIPATION_MATRIX`.

## Modo "Con celulares"

El facilitador crea una sala (código + QR); cada participante entra desde `join.html`,
elige su función, vota quién debe actuar y, si le toca, responde desde el celular. La sala
vive en Firestore; `expiresAt` queda listo para una política TTL, que hoy no está activa (ver
"Sin TTL" más abajo).

**Votación consultiva:** el voto de "quién debe actuar" solo muestra, sobre las tarjetas del
facilitador, qué cree el equipo. Nunca elige la función ni avanza el ejercicio: la función la
elige siempre el facilitador con un clic, y recién ahí el celular de esa función recibe las
alternativas. Después de cada respuesta, también es el facilitador quien pasa al acto siguiente.

**Admisión por código personal:** al unirse, cada participante queda *por autorizar* con su
función reservada. El facilitador presiona **Dar código** junto a su nombre, le dicta en
persona el código de 6 dígitos y la persona lo escribe en su celular: si coincide, entra
sola. El código nunca se guarda en Firestore (vive solo en el navegador del facilitador) y se
muestra oculto (•••) con un botón **Ver**, porque la pantalla suele estar proyectada. Hay 5
intentos por código; **Nuevo código** los rehabilita. **Rechazar** libera la función y esa
sesión no puede volver a pedir ingreso; **Quitar** saca a alguien ya admitido. Solo los
admitidos pueden votar y responder; lo exigen las reglas de Firestore, no solo la pantalla.
Si el facilitador recarga la página, los códigos dados se pierden: se da uno nuevo.

**Cierre:** al terminar el ejercicio (o salir con ✕, o volver desde la sala de espera) la
sala queda cerrada, se borran todos los participantes y sus funciones, y cada celular muestra
"Ejercicio finalizado" y cierra su sesión.

**Experiencia personal en el celular:**
- *Te toca a ti*: cuando le corresponde responder a la función de esa persona, el celular la
  llama por su nombre ("María, te toca a ti"), vibra (Android; iPhone no lo permite) y destaca
  el panel de respuesta.
- *Resumen personal*: al terminar el ejercicio, antes de cerrar la sala, el facilitador deja
  en `rooms/{código}/summaries/{uid}` el resumen de cada persona: sus actos, cuántos identificó
  el equipo y cuántos decidió a la primera, en qué dudó, a quién cubrió como suplente y una
  recomendación. Lo lee **solo** esa persona (lo exigen las reglas: a diferencia de
  `participants`, que lee toda la sala) y se ve en su celular al cerrarse el ejercicio; apenas
  lo lee, el celular lo borra de Firestore. Salir con ✕ o volver desde la sala de espera no
  deja resumen. Si un celular estaba desconectado al cerrar, su resumen queda en Firestore.
- **Sin TTL**: el proyecto está en el plan gratuito y Firestore solo permite políticas TTL con
  facturación activa (plan Blaze). Por eso nada se borra solo por `expiresAt`: ni salas, ni
  participantes, ni resúmenes; los participantes y reservas se borran al cerrar la sala.

**Facilitadores:** solo los correos de la lista `ALLOWED_FACILITATORS` (`auth/auth-core.js`) y
de `isFacilitator()` (`tabletop/firestore.rules`) pueden entrar al sitio y crear salas. Para
agregar a alguien, editar ambas listas y crearle la cuenta en Firebase Console.

- Las reglas de `tabletop/firestore.rules` se publican desde la raíz del repo con
  `firebase deploy --only firestore:rules` (Firebase CLI: `npm i -g firebase-tools` y
  `firebase login` la primera vez; en PowerShell, si dice que la ejecución de scripts está
  deshabilitada, usar `firebase.cmd` en vez de `firebase`). Alternativa: pegarlas en Firebase
  Console → Firestore → Reglas.
- Los celulares entran con sesión anónima de Firebase: en Authentication debe estar activo el
  proveedor Anónimo y permitida la creación de usuarios.
- Si falla una escritura en Firestore, el facilitador ve un aviso en pantalla y puede seguir
  el ejercicio con clic.

## SGC (deshabilitado)

`sgc/index.html` muestra un aviso de "no disponible" y la tarjeta está oculta en el inicio.
La aplicación completa está en `sgc/_index.app.html` (GitHub Pages no publica archivos que
empiezan con `_`). La base de Supabase está cerrada a la clave pública. Para reactivarlo:
ejecutar `sgc/db/seguridad.sql` en Supabase (login con Firebase, roles y auditoría),
renombrar `_index.app.html` a `index.html` y quitar `hidden` de la tarjeta en `index.html`.

## Identidad visual

Sigue el brand book de TIBOX: azul marino profundo como superficie dominante y los
colores del cubo (cian, amarillo, naranjo) más el degradado de Ciberseguridad
(magenta → rojo coral) solo como acentos. Una sola familia tipográfica, Plus Jakarta Sans,
con cifras tabulares donde se necesita alineación.
