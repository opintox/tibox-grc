// Catálogo del ejercicio: escenarios, funciones, paleta de marca y matriz de participación.
// Editar aquí para agregar un tipo de ataque o cambiar quién participa en cada uno.

const SCENARIOS = [
  {id:'dispositivo', name:'Dispositivo perdido/robado', color:'indigo', matrixValidated:false},
  {id:'recuperacion_fallida', name:'Recuperación fallida', color:'lime', matrixValidated:false},
  {id:'ddos', name:'DDoS', color:'cyan', matrixValidated:false},
  {id:'phishing_bec', name:'Phishing / BEC', color:'sky', matrixValidated:true},
  {id:'credenciales', name:'Credenciales privilegiadas', color:'amber', matrixValidated:false},
  {id:'0day', name:'Vulnerabilidad crítica', color:'orange', matrixValidated:false},
  {id:'terceros', name:'Compromiso de terceros', color:'emerald', matrixValidated:true},
  {id:'insider', name:'Amenaza interna', color:'rose', matrixValidated:true},
  {id:'exfiltracion', name:'Exfiltración de datos', color:'violet', matrixValidated:true},
  {id:'ransomware', name:'Ransomware', color:'red', matrixValidated:true}
];

// Las 6 funciones son fijas — lo único que cambia por cliente es el cargo y el responsable de cada una
const ROLE_KEYS = ['seguridad','ti','legal','comunicaciones','rrhh','direccion'];
const ROLE_NAMES = {seguridad:'Seguridad', ti:'TI', legal:'Legal', comunicaciones:'Comunicaciones', rrhh:'RRHH', direccion:'Dirección'};
const ROLE_COLOR = {seguridad:'red', ti:'blue', legal:'amber', comunicaciones:'purple', rrhh:'green', direccion:'blue'};
// Acento por función, con el mismo tratamiento que las tarjetas de tipo de ataque.
const ROLE_ACCENTS = {
  seguridad:['#FF6B7F','#D6224E'], ti:['#5AD1E8','#0B8FD6'], legal:['#FFC414','#E09000'],
  comunicaciones:['#A9B4F7','#6B7BE8'], rrhh:['#6EE7B7','#12A97C'], direccion:['#9FB4CE','#5A6E8C']
};
// Modelo operativo: TI y Seguridad las ejecuta TIBOX en remoto; el resto las aporta el equipo del cliente.
const ROLE_ORG = {seguridad:'TIBOX', ti:'TIBOX', legal:'Cliente', comunicaciones:'Cliente', rrhh:'Cliente', direccion:'Cliente'};

// Paleta de tipos de ataque — alineada al brand book de TIBOX (TIBOX AI Knowledge v0.2):
//  · El azul marino profundo es siempre la superficie dominante de la tarjeta.
//  · El color del escenario entra solo como ACENTO, y se toma exclusivamente de los
//    colores oficiales: las tres caras del cubo (cian, amarillo, naranjo) y el degradado
//    de la unidad Ciberseguridad (magenta → rojo coral), que corresponde a esta herramienta.
//  · Los acentos forman una rampa de intensidad que sigue el orden de severidad de
//    SCENARIOS: cian (impacto acotado) → amarillo/ámbar → naranjo → coral → magenta
//    (ransomware, el más severo). Ningún degradado de otra unidad de negocio se reutiliza.
// Orden de asignación: ninguna tarjeta comparte familia de color con la de al lado
// (ni en horizontal ni en vertical) en la grilla de 5 columnas, y las dos variantes de
// una misma familia quedan siempre separadas. Clave = id del escenario.
const SCENARIO_ACCENTS = {
  dispositivo:          ['#F3E006','#D9A800'], // amarillo (cubo, cara superior)
  recuperacion_fallida: ['#0FC7F6','#0B8FD6'], // cian (cubo, cara izquierda)
  ddos:                 ['#FF4D6A','#D6224E'], // rojo coral (Ciberseguridad)
  phishing_bec:         ['#C81FB0','#8E1490'], // magenta profundo (Ciberseguridad)
  credenciales:         ['#FF8A3D','#F0651D'], // naranjo (cubo, cara derecha)
  '0day':               ['#FF6B5A','#D93A2B'], // coral rojizo
  terceros:             ['#FFC414','#E09000'], // amarillo dorado
  insider:              ['#5AD1E8','#1490C4'], // cian claro
  exfiltracion:         ['#FFA200','#F07C10'], // naranjo ámbar
  ransomware:           ['#E0219A','#FF4D6A']  // magenta → rojo coral: degradado oficial de Ciberseguridad
};
function hexToRgba(hex, alpha){
  const h = hex.replace('#','');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
function scenarioAccent(id){ return SCENARIO_ACCENTS[id] || ['#0FC7F6','#0B8FD6']; }
// Un ícono representativo por tipo de ataque, mismo estilo de trazo fino que ROLE_ICONS
// Íconos sólidos, grilla común de 24×24 con área viva de 20×20 y máximo 2–3 formas por
// glifo: sobre un tile de color saturado las masas se leen mucho mejor que el trazo fino.
const SCENARIO_ICONS = {
  // portátil corporativo
  dispositivo:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M4.6 3.4h14.8A1.8 1.8 0 0 1 21.2 5.2v10.4H2.8V5.2A1.8 1.8 0 0 1 4.6 3.4Zm.6 2.4v7.4h13.6V5.8Z"/><path d="M1.2 17.2h21.6v1.6a1.8 1.8 0 0 1-1.8 1.8H3a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>',
  // respaldo (cilindro) con una barra diagonal calada: existe, pero no sirve
  recuperacion_fallida:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M9.4 1.8c3.6 0 6.6 1.2 6.6 2.7s-3 2.7-6.6 2.7S2.8 6 2.8 4.5 5.8 1.8 9.4 1.8Z"/><path d="M2.8 6.8c1.4 1.1 3.9 1.8 6.6 1.8 1.4 0 2.7-.2 3.8-.5v2.3c-1.1.3-2.4.4-3.8.4-2.7 0-5.2-.7-6.6-1.8v2.6c1.4 1.1 3.9 1.8 6.6 1.8h.5v2.3h-.5c-2.7 0-5.2-.7-6.6-1.8v2.3c0 1.5 3 2.7 6.6 2.7h.5v2.3h-.5c-3.6 0-6.6-1.2-6.6-2.7Z"/><path d="M16.8 12.4a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8Zm-1 2.2v4.2h2v-4.2Zm0 5.4v1.8h2v-1.8Z"/></svg>',
  // oleada de tráfico golpeando el servicio
  ddos:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 12 16.1 13.7 19.4 19.4 13.7 16.1 12 22.5 10.3 16.1 4.6 19.4 7.9 13.7 1.5 12 7.9 10.3 4.6 4.6 10.3 7.9 12 1.5 13.7 7.9 19.4 4.6 16.1 10.3Z"/></svg>',
  // correo
  phishing_bec:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 7.1A2.6 2.6 0 0 1 4.6 4.5h14.8A2.6 2.6 0 0 1 22 7.1v.4l-9.5 5.4a1 1 0 0 1-1 0L2 7.5Z"/><path d="M2 9.9l8.6 4.9a2.8 2.8 0 0 0 2.8 0L22 9.9v7A2.6 2.6 0 0 1 19.4 19.5H4.6A2.6 2.6 0 0 1 2 16.9Z"/></svg>',
  // llave privilegiada
  credenciales:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M7.6 6.2a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6Zm0 3.7a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2Z"/><path d="M12.6 10.7H22.4v2.6h-9.8Z"/><path d="M16.6 13.3h2.3v3.4h-2.3Z"/><path d="M20.4 13.3h2v2.4h-2Z"/></svg>',
  // escudo con la falla calada
  '0day':'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M12 1.8 20.6 5v6.4c0 5.3-3.5 9.4-8.6 11-5.1-1.6-8.6-5.7-8.6-11V5Zm1.6 4.3-4.4 6.2h2.6L10.6 18l4.6-6.6h-2.7Z"/></svg>',
  // dos nodos enlazados: proveedor y empresa
  terceros:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="10.4" y="3" width="3.2" height="18" rx="1.6" transform="rotate(-45 12 12)"/><circle cx="6" cy="6" r="4"/><circle cx="18" cy="18" r="4"/></svg>',
  // alguien de adentro saliendo por la puerta
  insider:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><circle cx="8.4" cy="6.2" r="3.7"/><path d="M1.9 20.6c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5a1.2 1.2 0 0 1-1.2 1.2H3.1a1.2 1.2 0 0 1-1.2-1.2Z"/><path d="M17.4 2.4h3.4A1.8 1.8 0 0 1 22.6 4.2v15.6a1.8 1.8 0 0 1-1.8 1.8h-3.4v-2.2h2.9V4.6h-2.9Z"/></svg>',
  // documento saliendo del perímetro
  exfiltracion:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.4 2h6.4l5.4 5.4v3.1h-6.7v4.2H3.6V3.8A1.8 1.8 0 0 1 5.4 2Zm7 1.6v4h4Z"/><path d="M3.6 16.5h7.5V20A1.8 1.8 0 0 1 9.3 21.8H5.4A1.8 1.8 0 0 1 3.6 20Z"/><path d="M13.4 12.2h5.2V9.1L23 13.4l-4.4 4.3v-3.1h-5.2Z"/></svg>',
  // candado con el bombín calado
  ransomware:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M12 1.6a5.2 5.2 0 0 1 5.2 5.2v2.6h-2.6V6.8a2.6 2.6 0 0 0-5.2 0v2.6H6.8V6.8A5.2 5.2 0 0 1 12 1.6Z"/><path d="M5.6 9.9h12.8A1.9 1.9 0 0 1 20.3 11.8v8.7a1.9 1.9 0 0 1-1.9 1.9H5.6a1.9 1.9 0 0 1-1.9-1.9v-8.7A1.9 1.9 0 0 1 5.6 9.9Zm6.4 4.2a1.9 1.9 0 0 0-1 3.5v1.9h2v-1.9a1.9 1.9 0 0 0-1-3.5Z"/></svg>'
};

// Descripción corta de cada escenario, para la tarjeta de selección
const SCENARIO_BLURBS = {
  dispositivo:'Un equipo corporativo queda fuera de control',
  recuperacion_fallida:'El respaldo existe, pero no permite restaurar',
  ddos:'Tráfico masivo deja el servicio fuera de línea',
  phishing_bec:'Credenciales entregadas por engaño en un correo',
  credenciales:'Acceso privilegiado en manos de un tercero',
  '0day':'Falla crítica con exploit público y activo',
  terceros:'Un proveedor con acceso abre la puerta',
  insider:'Alguien de adentro se lleva información',
  exfiltracion:'Datos sensibles saliendo hacia afuera',
  ransomware:'Cifrado masivo, operación detenida y extorsión'
};

// Objetivo principal de cada ataque: el activo o superficie sobre la que recae el incidente.
const SCENARIO_TARGETS = {
  dispositivo:'Endpoint',
  recuperacion_fallida:'Backup',
  ddos:'Servicio expuesto',
  phishing_bec:'Correo corporativo',
  credenciales:'Identidad privilegiada',
  '0day':'Software en producción',
  terceros:'Acceso de proveedor',
  insider:'Información interna',
  exfiltracion:'Datos de clientes',
  ransomware:'Servidores y datos'
};

// Introducción de cada escenario: se muestra en pantalla después de configurar y antes de la
// primera etapa (y en los celulares, en el modo "Con celulares"). Presenta el contexto y lo que
// se busca practicar sin adelantar los hechos de los actos. Párrafos separados por "\n\n".
// En los escenarios importados desde Word viene de la etiqueta "INTRODUCCIÓN:" (ver docx.js).
const SCENARIO_INTROS = {
  dispositivo:'Hoy trabajamos sobre algo que pasa todas las semanas en cualquier ciudad: un equipo de la empresa que sale de la oficina y deja de estar bajo nuestro control. Un notebook, un celular o una tablet guardan correo abierto, sesiones iniciadas y documentos de clientes, y quien los tiene en la mano puede usarlos aunque no sea su dueño.\n\nEl ejercicio transcurre fuera del horario normal, en plena semana de cierre, cuando la mayoría ya se fue a la casa. Vamos a practicar qué se hace en los primeros minutos, quién decide qué y cómo se evalúa si lo que había en el equipo obliga a avisar a alguien más.',
  recuperacion_fallida:'Todas las organizaciones dicen tener respaldos. La pregunta de hoy es otra: ¿sirven para volver a operar cuando hacen falta? Un respaldo que nunca se ha probado es una suposición, no una garantía.\n\nEl ejercicio transcurre en una semana de cierre de mes, con los sistemas de facturación en uso intenso. Vamos a practicar cómo se reacciona cuando algo que se daba por seguro resulta no estarlo, cómo se prioriza qué recuperar primero y quién debe enterarse de que el plan de continuidad tiene un hueco.',
  ddos:'Hoy el foco está en un servicio que la empresa tiene expuesto a internet y del que depende para vender. Cuando un servicio así se pone lento o deja de responder, el reloj corre en ventas perdidas, clientes molestos y presión de todas las áreas al mismo tiempo.\n\nEl ejercicio transcurre en un día de alta demanda, justo cuando más se necesita que el sitio funcione. Vamos a practicar cómo distinguir un problema de capacidad de un ataque, quién toma las decisiones técnicas, quién habla con los clientes y cómo se vuelve a la normalidad sin repetir el problema.',
  phishing_bec:'El correo sigue siendo la puerta de entrada más usada por los atacantes, y no hace falta ningún error técnico para que funcione: basta un mensaje bien hecho que llegue en el momento justo a la persona correcta.\n\nEl ejercicio transcurre en plena semana de cierre contable, con el área de Finanzas trabajando contra reloj y atenta a gestiones bancarias. Vamos a practicar cómo se recibe un reporte de un usuario, cómo se mide hasta dónde llegó el problema y qué se hace para que una cuenta comprometida no termine en un pago o una transferencia indebida.',
  credenciales:'Las cuentas con privilegios de administrador son las llaves maestras de la organización: con ellas se puede crear usuarios, cambiar permisos y desactivar protecciones. Por eso son el objetivo más buscado por un atacante que quiere moverse sin ser visto.\n\nEl ejercicio transcurre de madrugada, en fin de semana, cuando hay poca gente disponible y las decisiones recaen en el turno de guardia. Vamos a practicar cómo se responde a una alerta fuera de horario, a quién se despierta, qué se puede cortar sin detener la operación y cómo se recupera la confianza en las identidades.',
  '0day':'Hoy trabajamos sobre una situación en la que la empresa no cometió ningún error: el fabricante de un software que usamos publica una falla crítica y, al mismo tiempo, alguien ya la está aprovechando en el mundo. La ventana para reaccionar se mide en horas.\n\nEl ejercicio parte un día hábil cualquiera, con un sistema publicado a internet que proveedores y clientes usan a diario. Vamos a practicar cómo se evalúa la exposición real, cómo se decide entre parchar, aislar o seguir operando, y cómo se verifica que nadie haya entrado antes de que cerráramos la puerta.',
  terceros:'Los proveedores que mantienen nuestros sistemas necesitan acceso para hacer su trabajo, y ese acceso es tan poderoso como el de cualquier persona de la empresa. Cuando algo falla del lado del proveedor, el problema entra por una puerta que nosotros mismos abrimos.\n\nEl ejercicio transcurre de noche, fuera del horario habitual de oficina. Vamos a practicar cómo se detecta un acceso de tercero que no calza, cómo se coordina con una empresa externa en medio de un incidente, qué dicen los contratos y quién toma la decisión de cortar un acceso del que depende la operación.',
  insider:'No todos los incidentes vienen de afuera. Una persona de la propia organización, con accesos legítimos y conocimiento del negocio, puede llevarse información sin forzar nada, y eso hace que estos casos sean especialmente delicados.\n\nEl ejercicio transcurre de noche, con la oficina casi vacía. Vamos a practicar cómo se actúa cuando la evidencia apunta a alguien conocido: qué se puede revisar y qué no, cómo se resguarda la prueba, cuál es el rol de RRHH y de Legal, y cómo se protege a la empresa sin pasar a llevar los derechos de nadie.',
  exfiltracion:'La información de clientes es uno de los activos más valiosos de la empresa, y también uno de los que más obligaciones genera: cuando sale sin autorización, el problema deja de ser solo técnico y pasa a ser legal, regulatorio y de reputación.\n\nEl ejercicio transcurre de madrugada, durante el turno de monitoreo. Vamos a practicar cómo se confirma una fuga, cómo se corta sin destruir la evidencia, cómo se dimensiona qué datos y de quiénes se vieron afectados, y quién decide cuándo y cómo avisar a la autoridad y a los clientes.',
  ransomware:'El ransomware es hoy uno de los incidentes más dañinos para cualquier organización: cifra la información, detiene la operación y además suele venir acompañado de una extorsión. Cada minuto de demora en reaccionar puede significar más equipos afectados.\n\nEl ejercicio transcurre en un día hábil normal, a media mañana, con todas las áreas trabajando. Vamos a practicar cómo se contiene un ataque en curso, cómo se decide qué apagar y qué mantener, quién se comunica con quién y cómo se vuelve a operar sin reinfectarse.'
};

// Contexto para facilitadores: notas solo para quien conduce (quién es quién, canales,
// restricciones del ejercicio). Viene del párrafo "Contexto para facilitadores." de un Word
// importado (ver docx.js) y se muestra en una ventana antes de la introducción, solo en la
// pantalla del facilitador. Los escenarios precargados no lo traen.
const SCENARIO_FACILITATOR_CONTEXT = {};

const DEFAULT_PARTICIPANTS = ROLE_KEYS.map(k => ({roleKey:k, empresa:'', checked:true}));

// Matriz de participación por escenario: qué funciones pueden aparecer como personaje seleccionable.
// Los primeros 5 vienen de la matriz validada por Omar; los 5 restantes son una extrapolación a confirmar.
const PARTICIPATION_MATRIX = {
  ransomware:          {seguridad:true, ti:true, legal:true,  comunicaciones:true,  rrhh:false, direccion:true},
  phishing_bec:        {seguridad:true, ti:true, legal:false, comunicaciones:false, rrhh:false, direccion:false},
  exfiltracion:        {seguridad:true, ti:true, legal:true,  comunicaciones:true,  rrhh:false, direccion:true},
  insider:             {seguridad:true, ti:true, legal:true,  comunicaciones:false, rrhh:true,  direccion:true},
  terceros:            {seguridad:true, ti:true, legal:true,  comunicaciones:false, rrhh:false, direccion:true},
  // --- extrapolados, a validar ---
  credenciales:        {seguridad:true, ti:true, legal:false, comunicaciones:false, rrhh:false, direccion:true},
  ddos:                {seguridad:true, ti:true, legal:false, comunicaciones:true,  rrhh:false, direccion:true},
  '0day':              {seguridad:true, ti:true, legal:false, comunicaciones:false, rrhh:false, direccion:true},
  dispositivo:         {seguridad:true, ti:true, legal:true,  comunicaciones:false, rrhh:false, direccion:false},
  recuperacion_fallida:{seguridad:true, ti:true, legal:false, comunicaciones:false, rrhh:false, direccion:true}
};

const STAGE_LABELS = ['Detección','Clasificación','Contención','Recuperación','Cierre'];
