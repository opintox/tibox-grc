// Navegación entre las pantallas del tabletop (index.html). Una sola función muestra una
// pantalla, oculta todas las demás y deja en <body> las clases de modo y en la barra superior
// la etiqueta de estado que esa pantalla necesita. Antes cada transición hacía esto a mano en
// su propia función (y agregar una pantalla obligaba a tocar varias de ellas).
// Script clásico: lo usan app.js, builder.js, report.js y multiplayer/facilitator.js (módulo).
window.TabletopScreens = (function(){
  // modes: clases de <body> que dependen de la pantalla (los estilos las usan para el ancho del
  // contenedor, el fondo y qué mostrar en la barra). La sala de espera conserva setup-mode
  // porque toma el mismo ancho de contenedor que la configuración.
  const SCREENS = {
    intro:    {id: 'screen-intro',    modes: ['intro-mode'],              status: 'CONFIGURACIÓN'},
    setup:    {id: 'screen-setup',    modes: ['setup-mode'],              status: 'CONFIGURACIÓN'},
    builder:  {id: 'screen-builder',  modes: ['builder-mode'],            status: 'CREAR ESCENARIO'},
    lobby:    {id: 'screen-lobby',    modes: ['setup-mode', 'lobby-mode'], status: 'SALA DE ESPERA'},
    briefing: {id: 'screen-briefing', modes: ['briefing-mode'],           status: 'INTRODUCCIÓN'},
    game:     {id: 'screen-game',     modes: ['game-mode'],               status: 'EN CURSO'},
    results:  {id: 'screen-results',  modes: [],                          status: 'FINALIZADO'},
    report:   {id: 'screen-report',   modes: [],                          status: 'FINALIZADO'}
  };
  const ALL_MODES = [...new Set(Object.values(SCREENS).flatMap(s => s.modes))];
  let current = null;

  // opts.scroll (por defecto true): volver arriba al cambiar de pantalla.
  function show(name, opts){
    const target = SCREENS[name];
    if(!target) throw new Error(`Pantalla desconocida: ${name}`);
    Object.values(SCREENS).forEach(s => {
      const el = document.getElementById(s.id);
      if(el) el.classList.toggle('hidden', s !== target);
    });
    document.body.classList.remove(...ALL_MODES);
    if(target.modes.length) document.body.classList.add(...target.modes);
    const label = document.getElementById('statusLabel');
    if(label) label.textContent = target.status;
    current = name;
    if(!opts || opts.scroll !== false) window.scrollTo({top: 0, behavior: 'smooth'});
  }

  return {show, current: () => current};
})();
