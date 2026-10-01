# TIBOX · Herramientas

Sitio estático (sin build ni dependencias de npm) publicado con GitHub Pages desde la rama
`main`. Contiene un inicio con login y dos herramientas:

- **Tabletop**: ejercicio de simulación de respuesta a incidentes de ciberseguridad, en una
  sola pantalla o con los participantes votando y respondiendo desde su celular.
- **SGC** (Cumplimiento CIP): hoy **deshabilitado** (ver más abajo).

## Estructura

```
/
├── index.html                 Inicio: tarjetas de las herramientas (protegido por login)
├── login.html                 Login: correo + contraseña + código TOTP
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
│   ├── firestore.rules        Reglas de Firestore (se publican a mano en la consola)
│   ├── assets/                Logo e imágenes de las tarjetas de escenario
│   ├── css/
│   │   ├── styles.css         Tokens de diseño y estilos de todas las pantallas
│   │   └── multiplayer.css    Sala de espera, celulares y avisos del modo con celulares
│   └── js/
│       ├── data/
│       │   ├── catalogo.js    Escenarios, funciones, matriz de participación, introducciones
│       │   └── escenarios.js  Contenido narrado: situaciones, alternativas y explicaciones
│       ├── lib/               JSZip (Word) y generador de QR, versionados en el repo
│       ├── docx.js            Leer/escribir escenarios en Word y generar el informe en Word
│       ├── screens.js         Navegación entre pantallas (una sola función: show)
│       ├── builder.js         Constructor guiado de escenarios
│       ├── report.js          Resultados, informe ejecutivo y exportaciones (JSON/Word/PDF)
│       ├── app.js             Configuración del ejercicio y motor del juego
│       └── multiplayer/       Modo "Con celulares" (módulos ES + Firestore)
│           ├── firebase-init.js   Firestore + sesión anónima de los celulares
│           ├── room.js            Lectura/escritura de la sala en Firestore (sin DOM)
│           ├── facilitator.js     Sala de espera, votación y respuestas del lado del facilitador
│           └── participant-app.js Lógica de join.html
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
3. Inicia sesión con una cuenta `@tibox.cl` con TOTP (ver "Acceso").

Al publicar en GitHub Pages, los cambios en `main` quedan en línea en 1–2 minutos.

## Acceso

- Login con Firebase Auth: correo + contraseña + código de app autenticadora (TOTP).
- Solo cuentas **@tibox.cl** con el correo verificado. Las cuentas se crean a mano en Firebase
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
| Escribir o corregir el relato de un escenario | `js/data/escenarios.js` |
| Cambiar la introducción previa a la primera etapa | `js/data/catalogo.js` → `SCENARIO_INTROS` |
| Agregar o cambiar una pantalla | `tabletop/index.html` (marcado) + `js/screens.js` (registrarla) |
| Cambiar el informe final o sus descargas | `js/report.js` (y `docx.js` → `downloadReportDocx` para el Word) |
| Cambiar el constructor de escenarios | `js/builder.js` |
| Cambiar el modo con celulares | `js/multiplayer/` y `tabletop/firestore.rules` |
| Cambiar el comportamiento del ejercicio | `js/app.js` |

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
- Si el documento menciona "Quintero Energía" o "Empresa Eléctrica Ventanas", la tarjeta usa
  el logo del cliente y la empresa de cada función se completa sola (N1, N2 y TeamLeader →
  TIBOX; el resto → cliente).

## Formato de un escenario en `escenarios.js`

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
  "correctIndex": 0                     // siempre 0: el orden se baraja en pantalla
}
```

Reglas: la opción de índice 0 es siempre la correcta, `options` y `explanations` deben
tener el mismo largo, y `target` debe ser una función que participe en ese escenario
según `PARTICIPATION_MATRIX`.

## Modo "Con celulares"

El facilitador crea una sala (código + QR); cada participante entra desde `join.html`,
elige su función, vota quién debe actuar y, si le toca, responde desde el celular. La sala
vive en Firestore y se borra sola por TTL (`expiresAt`).

- Las reglas de `tabletop/firestore.rules` se publican a mano en Firebase Console →
  Firestore → Reglas.
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
