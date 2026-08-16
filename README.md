# TIBOX · Tabletop

Ejercicio de simulación de respuesta a incidentes de ciberseguridad. Aplicación web sin
dependencias ni build: se abre `index.html` en el navegador y funciona.

## Estructura

```
tabletop-project/
├── index.html              Marcado de las cuatro pantallas (configuración, ejercicio, resultados, informe)
├── css/
│   └── styles.css          Tokens de diseño y todos los estilos
└── js/
    ├── data/
    │   ├── catalogo.js     Escenarios, funciones, paleta de marca y matriz de participación
    │   └── escenarios.js   Contenido narrado: situaciones, alternativas y explicaciones
    └── app.js              Lógica: configuración, motor del ejercicio, resultados e informe
```

## Cómo trabajarlo en VS Code

1. Abre la carpeta: `code tabletop-project`
2. Instala la extensión **Live Server** (`ritwickdey.LiveServer`).
3. Clic derecho sobre `index.html` → *Open with Live Server*. Recarga sola al guardar.

Abrir el archivo con doble clic también funciona, pero Live Server evita problemas de
caché al iterar.

## Dónde tocar cada cosa

| Quiero… | Archivo |
|---|---|
| Cambiar el tamaño de toda la interfaz | `css/styles.css` → `--root-size` |
| Ajustar la escala tipográfica | `css/styles.css` → tokens `--fs-*` |
| Agregar o editar un tipo de ataque | `js/data/catalogo.js` → `SCENARIOS`, `SCENARIO_BLURBS`, `SCENARIO_TARGETS`, `SCENARIO_ACCENTS`, `SCENARIO_ICONS` |
| Cambiar quién participa en un escenario | `js/data/catalogo.js` → `PARTICIPATION_MATRIX` |
| Escribir o corregir el relato de un escenario | `js/data/escenarios.js` |
| Cambiar el comportamiento del ejercicio | `js/app.js` |

## Formato de un escenario

Cada escenario es un array de 5 etapas (Detección, Clasificación, Contención,
Recuperación, Cierre). Cada etapa tiene una o más preguntas:

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

## Identidad visual

Sigue el brand book de TIBOX: azul marino profundo como superficie dominante y los
colores del cubo (cian, amarillo, naranjo) más el degradado de Ciberseguridad
(magenta → rojo coral) solo como acentos. Una sola familia tipográfica, Plus Jakarta Sans,
con cifras tabulares donde se necesita alineación.
