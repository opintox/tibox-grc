// Contenido narrado de cada escenario: 5 etapas, con situación, alternativas y explicaciones.
// La alternativa de índice 0 es siempre la correcta; la app baraja el orden en pantalla.

const QUESTIONS = {
  "dispositivo": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · La llamada de las 19:52",
          "meta": [
            "19:52",
            "Martes, semana de cierre",
            "Llamada al celular de TI",
            "Notebook corporativo"
          ],
          "situation": "Camila Fuentes ya había cerrado su propio notebook y estaba en la fila del metro cuando le sonó el celular. Al otro lado, con bocinas de fondo y la voz cortada, Rodrigo Valenzuela, gerente comercial, le cuenta que le arrebataron el bolso en la vereda de un café en Providencia. Adentro iba el notebook de la empresa.\n\nAlcanza a decir dos cosas antes de que la señal se caiga: no alcanzó a bloquear la pantalla y tenía abiertos el correo y el sistema de contratos. Son las 19:52 de un martes de semana de cierre, con el equipo comercial todavía trabajando.\n\nCamila se sale de la fila y camina hasta un rincón menos ruidoso. Tiene el celular en una mano y ninguna consola a mano. Lo que decida en los próximos minutos define si esto queda como un robo de un activo o como un acceso no autorizado a información de clientes.",
          "options": [
            "Registrar el incidente de inmediato y confirmar con Rodrigo el nombre del equipo, la hora aproximada del robo y qué sesiones quedaron abiertas, mientras verifica en la consola si el disco está cifrado.",
            "Verificar de inmediato en la consola si el disco está cifrado, y dejar la confirmación con Rodrigo —equipo, hora, sesiones abiertas— para cuando se reincorpore mañana a la oficina.",
            "Registrar el incidente y confirmar con Rodrigo la hora aproximada del robo, pero dejar la revisión en consola para mañana temprano, ya que a esta hora no hay nadie más trabajando en el sistema de contratos.",
            "Confirmar con Rodrigo el nombre del equipo, la hora del robo y registrar el incidente de inmediato, pero sin preguntar qué sesiones quedaron abiertas, porque lo prioritario es dar de baja el activo físico."
          ],
          "explanations": [
            "Sin hostname, hora y sesiones abiertas no se puede dimensionar la exposición, y el estado del cifrado define si el disco es legible para quien lo tenga. Registrar en caliente deja la línea de tiempo desde el minuto uno.",
            "El estado del cifrado es solo una pieza; sin el equipo, la hora exacta y qué sesiones quedaron abiertas —datos que solo Rodrigo tiene y que se pierden si se corta la llamada— no se puede dimensionar nada. Postergar esa parte a mañana regala doce horas sin línea de tiempo.",
            "El sistema de contratos sigue con sesión abierta ahora mismo, no mañana; que nadie más esté conectado no dice nada sobre si el atacante ya está adentro. Postergar la consola es postergar la única forma de saberlo.",
            "Tratar esto como la pérdida de un activo es exactamente el error que el caso busca evitar: lo que define la gravedad no es el valor del notebook, sino qué quedó accesible desde las sesiones abiertas. Preguntar por ellas no es un detalle, es el centro de la evaluación."
          ],
          "mismatchContext": "El levantamiento técnico inicial —equipo, sesiones, cifrado— le toca a TI porque es quien tiene la consola y el inventario; Seguridad clasifica después, con esos datos en la mano.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Qué había realmente adentro",
          "meta": [
            "20:25",
            "Martes, semana de cierre",
            "Consola de administración",
            "Endpoint + Microsoft 365"
          ],
          "situation": "Ignacio Soto abre el notebook en la mesa del comedor de su casa, con la comida a medio servir. Camila le acaba de pasar por Teams el hostname, la hora del robo y una foto de la pantalla de la consola: el equipo aparece con última conexión a las 19:31 y cifrado activo.\n\nPero hay un detalle que no cuadra. El sistema de contratos que Rodrigo tenía abierto guarda propuestas firmadas de once clientes, con RUT, direcciones y condiciones comerciales. Y el buzón de un gerente comercial en semana de cierre no es un buzón cualquiera.\n\nIgnacio tiene que ponerle un nombre a esto antes de las nueve, porque de ese nombre depende a quién se despierta esta noche y a quién no.",
          "options": [
            "Clasificarlo como posible acceso no autorizado a datos personales y comerciales, no solo como pérdida de activo, cruzando qué información era alcanzable desde las sesiones que quedaron abiertas.",
            "Clasificarlo como posible acceso no autorizado a datos personales y comerciales, pero mantenerlo en nivel bajo mientras el equipo no reaparezca, ya que sin el notebook físico no hay forma de confirmar que alguien abrió los archivos.",
            "Clasificarlo como acceso no autorizado a datos comerciales, pero no como dato personal, ya que el sistema de contratos solo expone información de empresas clientes, no de personas naturales.",
            "Clasificarlo de inmediato como crítico, igual que si fuera un acceso confirmado con exfiltración masiva, y activar el mismo protocolo completo que para una fuga de datos ya consumada."
          ],
          "explanations": [
            "La sesión quedó abierta: el cifrado protege el disco apagado, no una pantalla desbloqueada. La criticidad se define por los datos alcanzables, no por el valor del fierro.",
            "La sesión abierta ya es la confirmación que hace falta: no se necesita el equipo físico para saber que quien lo tenía podía leer los contratos. Esperar el hallazgo del notebook para subir el nivel deja el caso mal clasificado mientras la ventana de exposición sigue corriendo.",
            "Los once contratos incluyen RUT y direcciones de contacto: eso es dato personal aunque la contraparte sea una empresa. Acotar la clasificación a 'solo comercial' deja fuera justo la parte que activa las obligaciones más estrictas.",
            "Acceso posible no es lo mismo que exfiltración confirmada; igualar ambos niveles gasta los mismos recursos de crisis en un caso que todavía admite una respuesta más acotada, y deja sin margen al protocolo completo el día que sí haya una fuga real."
          ],
          "mismatchContext": "Clasificar es decisión de Seguridad: TI aporta los datos técnicos, pero el nivel de criticidad y el encuadre del incidente no se definen desde la mesa de ayuda.",
          "correctIndex": 0
        },
        {
          "target": "legal",
          "title": "Acto 2 · El párrafo del contrato",
          "meta": [
            "20:50",
            "Martes, semana de cierre",
            "Llamada interna",
            "Contratos de clientes"
          ],
          "situation": "Paula Rojas contesta el teléfono con el pelo mojado. Ignacio le resume en dos minutos: notebook robado, sesión abierta, once contratos con datos personales accesibles, sin evidencia todavía de que alguien haya entrado.\n\nLo que Paula sabe y los demás no es que tres de esos once contratos tienen cláusula de notificación de incidentes en cuarenta y ocho horas, y que el reloj de esa cláusula parte cuando la empresa toma conocimiento, no cuando termina la investigación.",
          "options": [
            "Revisar qué obligaciones de notificación aplican —cláusulas con clientes y normativa de datos personales— y dejar por escrito qué plazos empezaron a correr desde el momento en que la empresa tomó conocimiento.",
            "Revisar qué obligaciones de notificación aplican y dejar por escrito los plazos, pero contarlos desde el momento en que se confirme técnicamente que alguien accedió a los datos, no desde el aviso inicial de Camila.",
            "Revisar las obligaciones de los tres contratos con cláusula de notificación en 48 horas, pero no de los ocho restantes, ya que esos no tienen esa cláusula específica.",
            "Concluir que, al estar el equipo cifrado, la obligación de notificar solo aplica a los clientes cuyo contrato menciona expresamente el cifrado como atenuante, y dejar los demás sin evaluar."
          ],
          "explanations": [
            "Los plazos contractuales suelen contarse desde la toma de conocimiento, así que el mapa de obligaciones se arma ahora aunque la investigación siga abierta.",
            "La mayoría de las cláusulas de este tipo cuentan el plazo desde la toma de conocimiento del incidente, no desde la confirmación de acceso efectivo; correrlo desde la confirmación técnica puede dejar el plazo ya vencido para cuando esa confirmación llegue.",
            "La cláusula de 48 horas no es la única fuente de obligación: la normativa general de datos personales puede aplicar igual a los ocho contratos sin cláusula explícita. Limitar la revisión a los tres deja sin mapear el resto de la exposición legal.",
            "El cifrado protegía el disco apagado, no la sesión que quedó abierta; usarlo como atenuante selectivo para unos contratos y no otros no tiene sustento técnico, porque la condición real —sesión viva— es la misma para los once."
          ],
          "mismatchContext": "Interpretar cláusulas y calcular plazos de notificación es de Legal; Seguridad y TI aportan hechos, pero no deciden qué obliga un contrato ni desde cuándo corre.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · Cerrar la puerta a distancia",
          "meta": [
            "21:10",
            "Martes, semana de cierre",
            "Consola MDM",
            "Entra ID"
          ],
          "situation": "Camila llegó a su casa y ahora sí tiene teclado. En una pantalla, la consola de identidad con la cuenta de Rodrigo y tres sesiones activas, una de ellas desde el equipo robado. En la otra, el MDM esperando una orden.\n\nRodrigo vuelve a llamar desde el celular de su señora. Está en la comisaría, quiere saber si puede seguir viendo su correo desde el teléfono porque mañana a primera hora firma con un cliente grande.\n\nCamila mira el reloj: 21:10. Sabe que hay una forma de dejarlo trabajando y otra de dejarlo en cero, y que la diferencia está en el orden de los pasos.",
          "options": [
            "Revocar todas las sesiones y tokens activos de Rodrigo, forzar cambio de credenciales y re-registro de MFA desde su teléfono, y recién entonces enviar bloqueo y borrado remoto al equipo, anotando la hora de cada acción.",
            "Revocar todas las sesiones y tokens activos de Rodrigo y enviar bloqueo y borrado remoto al equipo, sin forzar el cambio de credenciales ni el re-registro de MFA, para no dejarlo sin acceso a nada.",
            "Forzar cambio de credenciales y re-registro de MFA, y enviar bloqueo y borrado remoto al equipo, pero sin revocar antes las sesiones y tokens ya activos en la nube.",
            "Revocar sesiones, forzar credenciales nuevas y enviar bloqueo y borrado remoto en el mismo momento, sin anotar la hora de cada acción, para no perder tiempo con el registro mientras se contiene."
          ],
          "explanations": [
            "Revocar primero corta el acceso vivo, que es lo que realmente está en riesgo; el borrado remoto es complementario y depende de que el equipo se conecte. El registro horario sostiene el informe posterior.",
            "Revocar sesiones sin cambiar la contraseña deja la misma credencial disponible para iniciar una sesión nueva; el corte es momentáneo si no se cierra también esa puerta con credenciales y MFA nuevos.",
            "Cambiar la contraseña no cierra una sesión ya iniciada ni invalida los tokens ya emitidos: el atacante que ya estaba adentro sigue adentro hasta que esas sesiones se revocan explícitamente.",
            "Sin el registro horario de cada paso, el informe posterior no puede reconstruir qué estuvo expuesto entre una acción y otra; ese detalle es justamente lo que sostiene la revisión de Legal y el cierre del caso."
          ],
          "mismatchContext": "Ejecutar revocaciones, bloqueos y borrado remoto es de TI, que administra las consolas; Seguridad define el alcance, pero no aprieta los botones.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · El reemplazo que no repita el hoyo",
          "meta": [
            "Miércoles 08:30",
            "Semana de cierre",
            "Mesa de ayuda",
            "Equipo de reemplazo"
          ],
          "situation": "Rodrigo llega a las 8:30 con cara de no haber dormido y el parte de Carabineros doblado en el bolsillo. Firma con el cliente grande a las 11:00 y necesita un computador ahora.\n\nEn la bodega hay dos opciones: un notebook nuevo que todavía no pasa por la imagen corporativa y uno de sala de reuniones que está prendido y listo en cinco minutos. Camila mira los dos y sabe cuál le va a pedir Rodrigo.\n\nEl tema es que lo que se entregue hoy va a quedar en uso durante meses, y la sesión que se abra ahí es la misma que anoche estuvo dando vueltas en la calle.",
          "options": [
            "Entregar un equipo inscrito en MDM, con cifrado activo y MFA re-registrado desde cero, restaurando datos solo desde los respaldos corporativos y verificando que no queden accesos residuales del equipo anterior.",
            "Entregar un equipo inscrito en MDM con cifrado activo, restaurando datos desde los respaldos corporativos, pero reactivando los métodos de MFA que Rodrigo tenía configurados antes, para que pueda entrar sin fricción a la reunión de las 11:00.",
            "Entregar un equipo inscrito en MDM, con cifrado activo y MFA re-registrado desde cero, pero restaurando el perfil de usuario completo del notebook robado —incluidas las carpetas locales— para que Rodrigo no pierda ningún archivo de trabajo.",
            "Prestarle temporalmente el notebook de la sala de reuniones, ya inscrito en MDM y con cifrado activo, mientras se prepara con calma el equipo nuevo para dejarlo definitivo la próxima semana."
          ],
          "explanations": [
            "Recuperar es volver a operar sin heredar la debilidad: equipo gestionado, cifrado y factores nuevos cierran el ciclo del incidente.",
            "Si el atacante tuvo la sesión abierta, pudo interactuar con los factores de MFA existentes; reactivarlos tal cual en vez de re-registrarlos desde cero deja abierta la posibilidad de que uno de esos factores ya no sea confiable.",
            "Restaurar el perfil completo del equipo robado, aunque se excluyan las credenciales del navegador, arrastra archivos y configuraciones que estuvieron expuestos en la misma sesión comprometida; solo los respaldos corporativos garantizan un punto de partida limpio.",
            "Aunque el préstamo esté en MDM, sigue siendo un endpoint compartido que va a quedar en uso de facto por meses si 'la próxima semana' se posterga, con datos de gerencia fuera del inventario planificado para él."
          ],
          "mismatchContext": "La reposición y el endurecimiento del endpoint son de TI, que administra imágenes, inventario y respaldos; nadie más puede entregar un equipo confiable.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 5 · Lo que queda escrito",
          "meta": [
            "Viernes 16:00",
            "Cierre de semana",
            "Revisión de incidente",
            "Informe final"
          ],
          "situation": "Viernes, 16:00. La sala huele a café recalentado. Ignacio proyecta la línea de tiempo: 19:52 el aviso, 21:10 la revocación, 21:34 el borrado remoto confirmado. Setenta y ocho minutos entre el robo y el corte real de acceso.\n\nCamila comenta, casi al pasar, que cuando revisó el inventario encontró once equipos de la flota sin cifrado verificado. Nadie lo había mirado en meses porque el reporte figuraba en verde.\n\nRodrigo, que vino igual aunque no lo citaron, pregunta si esto se cierra hoy. Ignacio tiene la respuesta escrita a medias en la pantalla.",
          "options": [
            "Cerrar el incidente con un informe que documente línea de tiempo, alcance real de la exposición y decisiones tomadas, y abrir acciones con responsable y plazo para el cifrado no verificado y para bajar el tiempo de revocación.",
            "Cerrar el incidente con un informe que documente la línea de tiempo y el alcance real de la exposición, pero sin abrir acciones formales sobre los once equipos sin cifrado verificado, ya que ese hallazgo quedó fuera del alcance de este caso puntual.",
            "Cerrar el incidente documentando la línea de tiempo completa, y abrir una acción de concientización general a toda la empresa como única medida, sin plazo específico para verificar el cifrado de la flota.",
            "Dejar el informe borrador pendiente de firma hasta que Carabineros confirme si recuperó el equipo, para que la línea de tiempo del cierre incluya ese dato."
          ],
          "explanations": [
            "El cierre vale por lo que deja instalado: un relato verificable de lo ocurrido y correcciones con dueño y fecha sobre las debilidades que el caso destapó.",
            "Los once equipos sin cifrado aparecieron justamente por revisar este caso; dejarlos fuera del cierre porque 'no son parte del caso puntual' es la manera exacta en que un hallazgo real se pierde entre incidentes.",
            "Una charla no revisa ni corrige el cifrado de los otros diez equipos ni acorta los setenta y ocho minutos que tomó la revocación; sin una acción técnica con dueño y fecha, el mismo hallazgo va a reaparecer en el próximo incidente.",
            "El hallazgo de los equipos sin cifrado y el tiempo de revocación ya están confirmados y no dependen de si aparece el notebook; posponer el cierre por un dato que puede no llegar nunca deja las correcciones sin fecha real."
          ],
          "mismatchContext": "El cierre formal y las lecciones aprendidas quedan en Seguridad, dueña del proceso de incidentes; en este caso Dirección no participa y el cierre no puede quedar suelto en TI.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "recuperacion_fallida": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · El archivo que pesa muy poco",
          "meta": [
            "10:15",
            "Martes, cierre de mes",
            "Prueba de restauración",
            "ERP de facturación"
          ],
          "situation": "Matías Aravena estaba haciendo lo más aburrido de su semana: restaurar una tabla del ERP a un ambiente de pruebas porque Contabilidad pidió comparar un dato de junio. Copiar, montar, listo, a almorzar.\n\nEl archivo se montó en veinte segundos. Demasiado rápido. Matías mira el peso: 4,2 GB, cuando el respaldo del ERP siempre anduvo cerca de 90. Abre el contenido y faltan tablas completas, entre ellas la de documentos tributarios.\n\nVuelve al panel de respaldos. El job aparece en verde, con un check al lado, todos los días. Baja por la lista y el verde se repite hacia atrás: veintitrés días seguidos de un respaldo que se declara exitoso y no lo es.",
          "options": [
            "Detener la prueba, verificar la integridad de los respaldos de los últimos días y revisar los logs del job para determinar desde qué fecha exacta viene incompleto, dejando registrado el hallazgo como incidente.",
            "Detener la prueba y revisar los logs del job para determinar desde cuándo viene incompleto, pero sin registrarlo todavía como incidente, a la espera de confirmar primero si se trata de un problema puntual de esa tabla.",
            "Relanzar el job de respaldo y, en paralelo, revisar los logs de los últimos días para ver si el problema se repite antes de decidir si es necesario escalarlo.",
            "Verificar la integridad de los respaldos de los últimos días y registrar el hallazgo como incidente, pero recién retomar la revisión completa de logs después del cierre de mes, dado que el ERP está operando con normalidad."
          ],
          "explanations": [
            "Lo primero es saber el tamaño real del hoyo: desde cuándo no hay copia válida y qué sistemas comparten ese job. Sin esa fecha no se puede evaluar nada.",
            "Veintitrés días de respaldos en verde que no lo son ya es, por definición, un incidente; esperar a acotar el problema a 'una tabla puntual' antes de registrarlo retrasa la activación del proceso que existe justo para estos casos.",
            "Relanzar el job no aporta información sobre los veintitrés días anteriores ni sobre qué tablas faltan; el diagnóstico está en los logs históricos, no en un intento adicional que puede volver a marcar verde sin haber corregido nada.",
            "El ERP funciona hoy, pero eso no dice nada sobre si hay una copia válida disponible si algo falla mañana; postergar la revisión completa hasta después del cierre mantiene a la empresa sin red de seguridad justo en la semana de mayor volumen."
          ],
          "mismatchContext": "El diagnóstico técnico de los jobs y la verificación de integridad son de TI, que administra la plataforma de respaldo; Seguridad recién puede clasificar cuando existe una fecha y un alcance.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Un incidente sin caída",
          "meta": [
            "12:40",
            "Martes, cierre de mes",
            "Registro de incidentes",
            "ERP de facturación"
          ],
          "situation": "Fernanda Cáceres lee el reporte de Matías dos veces. Veintitrés días. El ERP factura, cobra y emite documentos tributarios, y su RPO comprometido es de 24 horas.\n\nEn la reunión de las 12:40 alguien lo dice en voz alta: 'pero no se cayó nada, no perdimos ni un dato'. Es cierto, y es exactamente lo que hace difícil este caso: el daño no se ve en ninguna pantalla.\n\nFernanda sabe que si esto entra al registro como 'falla operativa de TI' va a quedar sepultado en la lista de pendientes, y que el nombre que le ponga hoy determina cuánta atención recibe mañana.",
          "options": [
            "Clasificarlo como incidente de alto impacto por pérdida de capacidad de recuperación, midiendo la ventana real sin copia válida contra el RPO comprometido para el ERP.",
            "Clasificarlo como alto impacto por pérdida de capacidad de recuperación, pero medir la ventana comprometida desde que Matías detectó el problema hoy, no desde la fecha real en que el respaldo empezó a fallar.",
            "Ingresarlo al registro de incidentes con impacto alto, pero dejar la responsabilidad de definir el plazo de corrección en manos de TI, ya que es un tema estrictamente técnico de la plataforma de respaldo.",
            "Clasificarlo como incidente de alto impacto y, en paralelo, abrir una investigación formal sobre quién configuró originalmente el job de respaldo, antes de definir cualquier plazo de corrección."
          ],
          "explanations": [
            "El impacto de un respaldo fallido no se mide por lo que pasó, sino por lo que habría pasado: veintitrés días contra un RPO de 24 horas es una brecha grave.",
            "Medir desde la detección y no desde el origen real subestima la ventana comprometida: son veintitrés días sin copia válida, no unas horas. El RPO se compara contra el momento en que la falla empezó, no contra cuándo alguien la notó.",
            "El plazo de corrección depende del RPO comprometido para un sistema crítico, que es una decisión de riesgo, no una configuración técnica; dejarlo enteramente en manos de TI saca del registro la variable que justifica la urgencia.",
            "Buscar responsables de la configuración original no acelera la corrección ni reduce la ventana sin copia válida; mezclar la investigación de causa con el plazo de remediación solo retrasa lo urgente."
          ],
          "mismatchContext": "Ponerle nivel y nombre al incidente es de Seguridad, que administra el registro y los criterios de criticidad; TI no puede autoclasificar su propia falla.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · No perder lo poco que queda",
          "meta": [
            "15:20",
            "Martes, cierre de mes",
            "Plataforma de respaldo",
            "Repositorio y cintas"
          ],
          "situation": "Matías descubre algo peor a media tarde: la política de retención purga automáticamente las copias con más de treinta días. La última copia completa y sana es del 20 del mes pasado. Le quedan siete días antes de que la borre el propio sistema.\n\nAfuera, el equipo de Facturación está corriendo el cierre y la base está al máximo de carga. Cualquier cosa que Matías lance ahora se va a notar en los tiempos de respuesta de todo el país.\n\nTiene la ventana de mantención del jueves, un teléfono con el proveedor esperando y la sensación clara de que el orden importa más que la velocidad.",
          "options": [
            "Congelar la purga y la rotación para no perder las copias antiguas que sí sirven, programar un respaldo completo verificado en la ventana de mantención y configurar la alerta para que falle en rojo cuando el job no complete.",
            "Congelar la purga y la rotación para no perder las copias antiguas, y lanzar de inmediato un respaldo completo en horario productivo, sin esperar la ventana de mantención del jueves, para no arriesgarse a perder más tiempo.",
            "Congelar la purga y rotación, programar el respaldo completo verificado en la ventana de mantención, pero dejar la alerta de monitoreo como estaba, ya que el problema real fue humano y no de configuración de alertas.",
            "Programar el respaldo completo verificado para la ventana de mantención del jueves y configurar la alerta en rojo, pero sin congelar la purga automática de copias con más de treinta días mientras tanto."
          ],
          "explanations": [
            "Contener aquí es evitar que la única copia sana se borre sola, y cerrar el silencio del monitoreo para que la falla no se repita sin que nadie se entere.",
            "Un respaldo completo en pleno cierre de mes, con la base al máximo de carga, puede degradar los tiempos de respuesta de todo el país; la urgencia de tener una copia sana no justifica correr ese riesgo fuera de la ventana programada.",
            "El monitoreo estuvo en verde durante veintitrés días de fallas reales: dejarlo igual repite exactamente la condición que permitió que nadie se enterara. Corregir la alerta es parte de cerrar la causa, no un tema aparte.",
            "La última copia sana es de hace más de veinte días y la purga automática se activa a los treinta: si la política sigue corriendo tal cual, esa copia puede borrarse antes de que el respaldo del jueves esté verificado."
          ],
          "mismatchContext": "Modificar retención, programar jobs y ajustar alertas son operaciones de TI sobre su propia plataforma; Seguridad exige el resultado, no ejecuta la consola.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Probar antes de cantar victoria",
          "meta": [
            "Jueves 22:00",
            "Ventana de mantención",
            "Ambiente aislado",
            "ERP de facturación"
          ],
          "situation": "Jueves, 22:00. El respaldo completo corrió sin errores y esta vez pesa 91 GB. Matías tiene sueño y ganas de escribir en el grupo que el tema está resuelto.\n\nSe acuerda del panel en verde. Verde también estaba hace veintitrés días. Levanta un ambiente aislado y empieza a restaurar, sabiendo que va a terminar cerca de las tres de la mañana.\n\nA las 2:40 le escribe a Marcela, de Facturación, que había ofrecido revisar cifras si hacía falta. Necesita que alguien que conoce los datos diga si cuadran, porque él solo puede confirmar que el archivo abrió.",
          "options": [
            "Restaurar la copia en un ambiente aislado y validar con el área usuaria que los datos cuadran, documentando el resultado antes de declarar recuperada la capacidad de respaldo.",
            "Restaurar la copia en un ambiente aislado y, apenas el archivo abre sin errores, declarar recuperada la capacidad de respaldo, sin esperar la validación de Marcela sobre si los datos cuadran.",
            "Restaurar la copia en un ambiente aislado y validar con Marcela que los datos cuadran, pero declarar cerrado el punto verbalmente, sin dejar el resultado documentado.",
            "Restaurar directamente sobre el ambiente de producción, ya que de todas formas es la ventana de mantención, y validar ahí mismo con Marcela que los datos cuadran."
          ],
          "explanations": [
            "La capacidad de recuperación solo se demuestra restaurando y con alguien del negocio confirmando que los datos son los correctos.",
            "Que el archivo abra confirma que el respaldo no está corrupto, pero no que los datos sean los correctos; solo alguien que conoce las cifras del negocio puede confirmar eso, y sin esa validación la recuperación sigue siendo una hipótesis.",
            "Sin un registro escrito del resultado, la próxima auditoría —o el próximo incidente similar— no tiene cómo acreditar que esta restauración efectivamente se probó y validó; la palabra de Matías no reemplaza la documentación.",
            "Restaurar sobre producción para probar algo que se puede probar en un ambiente aislado arriesga sobrescribir datos vivos del cierre; la validación de que el respaldo sirve no necesita tocar el sistema real."
          ],
          "mismatchContext": "Ejecutar y validar la restauración es de TI, dueña del ambiente y del procedimiento; la validación funcional se pide al área usuaria, pero la operación no se delega.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "direccion",
          "title": "Acto 5 · La pregunta incómoda del comité",
          "meta": [
            "Lunes 09:00",
            "Comité de gerencia",
            "Sala de directorio",
            "Informe de incidente"
          ],
          "situation": "Lunes, 09:00. Gonzalo Pérez, gerente general, tiene el informe de tres páginas frente a él y una sola frase subrayada: durante veintitrés días la empresa no habría podido recuperar su sistema de facturación.\n\nAlrededor de la mesa hay dos corrientes. Una quiere saber quién dejó pasar el job en verde. La otra quiere pasar rápido al punto siguiente de la tabla porque, al final, no pasó nada.\n\nFernanda deja sobre la mesa una estimación: pruebas de restauración trimestrales y monitoreo real de respaldos cuestan menos que un día de facturación detenida. Gonzalo mira el reloj y sabe que la decisión no la puede empujar hacia abajo.",
          "options": [
            "Tomar la decisión de negocio: aprobar presupuesto y plazos para pruebas de restauración periódicas y monitoreo efectivo, y dejar definido quién responde por el RPO de cada sistema crítico.",
            "Aprobar presupuesto para pruebas de restauración periódicas, pero dejar sin definir quién responde formalmente por el RPO de cada sistema crítico, ya que eso se puede resolver más adelante entre los equipos técnicos.",
            "Aprobar presupuesto y plazos para pruebas de restauración periódicas y monitoreo efectivo, pero mantener también la sanción al administrador que dejó pasar el job en verde, como señal adicional hacia el resto del equipo.",
            "Definir plazos para pruebas de restauración periódicas y dejar que el jefe de TI decida el presupuesto necesario dentro de lo que ya tiene asignado para este año."
          ],
          "explanations": [
            "Lo que faltó no fue esfuerzo sino inversión y responsabilidad asignada; eso se resuelve en el nivel donde se aprueban plata y prioridades.",
            "Sin un responsable formal por sistema, el presupuesto aprobado no tiene quién lo ejecute con continuidad; 'resolverlo entre los equipos técnicos' es, en la práctica, la misma falta de dueño que permitió que esto pasara desapercibido.",
            "Sancionar a quien opera, incluso junto con invertir en el proceso, desincentiva que el próximo hallazgo similar se reporte con la misma franqueza con que se reportó este; la señal correcta es la inversión, no el castigo paralelo.",
            "El jefe de TI no puede reasignar presupuesto ya comprometido en otras prioridades para financiar algo nuevo; sin una aprobación explícita de recursos adicionales, los plazos definidos quedan sin cómo cumplirse."
          ],
          "mismatchContext": "Asignar presupuesto, plazos y responsabilidad sobre el RPO es una decisión de Dirección; TI y Seguridad pueden proponer, pero no aprobar la inversión ni fijar la tolerancia al riesgo.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "ddos": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · La curva que no baja",
          "meta": [
            "11:40",
            "Viernes de campaña",
            "Alerta de monitoreo",
            "Sitio de ventas en línea"
          ],
          "situation": "Jorge Muñoz alcanzó a dar un sorbo al café cuando el monitoreo empezó a sonar. Latencia arriba, errores 502 subiendo, y el gráfico de peticiones por segundo convertido en una pared vertical.\n\nEs viernes, 11:40, segundo día de la campaña de descuentos más grande del año. Marketing lleva tres semanas empujando tráfico al sitio. Desde el piso de ventas ya se escuchan los primeros '¿está caída la página?'.\n\nJorge tiene dos hipótesis y treinta segundos para no equivocarse: o la campaña funcionó demasiado bien, o alguien está empujando la puerta. Las dos se ven casi igual en el primer gráfico.",
          "options": [
            "Confirmar en las métricas si el tráfico es anómalo —volumen, orígenes, tipo de peticiones, tasa de conversión— y descartar en paralelo una falla propia como un despliegue reciente, la base de datos o un certificado vencido.",
            "Confirmar en las métricas si el tráfico es anómalo —volumen, orígenes, tipo de peticiones, tasa de conversión—, pero reiniciar de inmediato los servidores web y el balanceador mientras se hace esa revisión, para ganar tiempo.",
            "Revisar el volumen y los orígenes del tráfico, y al confirmar que no calza con el patrón habitual de una campaña, pedir de inmediato más capacidad al proveedor mientras se sigue investigando el resto del patrón.",
            "Confirmar que el tráfico es anómalo por su volumen y origen, pero descartar la revisión de la tasa de conversión, ya que en un ataque no hay compras y ese dato no aporta nada nuevo."
          ],
          "explanations": [
            "El patrón distingue una avalancha legítima de una maliciosa: miles de peticiones a la misma ruta sin carritos ni conversiones no son clientes. Descartar causa propia evita mitigar un ataque que nunca existió.",
            "Reiniciar mientras el tráfico sigue entrando no cambia nada si el origen es externo, y sí tumba las conexiones legítimas que estaban siendo atendidas; conviene tener el diagnóstico antes de tocar la infraestructura, no en paralelo a ciegas.",
            "Escalar capacidad frente a un volumen que ya no parece campaña, sin haber confirmado si es ataque, solo agranda la factura frente a un atacante que puede escalar igual de rápido; el diagnóstico completo debe cerrarse antes de esa decisión.",
            "La tasa de conversión es justamente lo que distingue una avalancha legítima de una maliciosa: miles de peticiones sin ningún carrito creado es la prueba más clara de que no son clientes. Omitirla deja el diagnóstico incompleto."
          ],
          "mismatchContext": "La lectura de métricas y el descarte de falla propia son de TI, que opera la infraestructura; Seguridad clasifica el evento una vez que hay un patrón identificado.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Ponerle nombre al ruido",
          "meta": [
            "12:05",
            "Viernes de campaña",
            "Sala de guerra improvisada",
            "Servicio expuesto"
          ],
          "situation": "Valentina Herrera llega a la sala con el notebook abierto y la evidencia de Jorge en pantalla: 400 mil peticiones por minuto desde miles de direcciones distintas, todas golpeando el buscador de productos, cero carritos creados en veinte minutos.\n\nNo es la campaña. Alguien está tirando la puerta abajo, y lo está haciendo justo el día de mayor facturación del año.\n\nValentina anota algo que nadie más está mirando: mientras todos ven el gráfico rojo del sitio, los logs de la VPN y del correo siguen corriendo sin que nadie los revise. Ha visto antes usar el ruido como cortina.",
          "options": [
            "Clasificarlo como ataque de disponibilidad en curso sobre un servicio crítico de ingresos y, en paralelo, revisar otros frentes —accesos, VPN, correo— por si el volumen está tapando actividad más silenciosa.",
            "Clasificarlo como ataque de disponibilidad en curso, pero concentrar toda la revisión en el sitio de ventas, sin destinar tiempo a mirar los logs de VPN y correo mientras dure el ataque.",
            "Clasificarlo como incidente menor de infraestructura mientras el sitio siga respondiendo de forma intermitente, y subirlo a ataque de disponibilidad recién si llega a caerse por completo.",
            "Clasificarlo como ataque de disponibilidad en curso y activar en paralelo el protocolo de brecha de datos, por si el volumen del ataque estuviera ocultando una exfiltración."
          ],
          "explanations": [
            "La clasificación correcta habilita la mitigación y los recursos, y mirar otros frentes cubre el uso clásico del DDoS como distracción.",
            "El volumen del DDoS es exactamente el tipo de cortina que se usa para tapar actividad más silenciosa en otros sistemas; no revisar VPN y correo en paralelo deja ese frente sin vigilancia justo cuando más conviene mirarlo.",
            "Un servicio de ventas intermitente en el día de mayor facturación del año ya es impacto alto; esperar la caída total para subir la clasificación retrasa la mitigación mientras las ventas se siguen perdiendo minuto a minuto.",
            "Activar el protocolo de brecha sin ningún indicio de acceso a datos moviliza recursos y genera una alarma que no corresponde; revisar VPN y correo por prudencia no es lo mismo que declarar una fuga confirmada."
          ],
          "mismatchContext": "Clasificar el evento y decidir qué otros frentes se revisan es de Seguridad; TI está ocupada sosteniendo el servicio y no puede además evaluar el panorama completo.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · Filtrar sin cerrar la caja",
          "meta": [
            "12:30",
            "Viernes de campaña",
            "Consola CDN / anti-DDoS",
            "Sitio de ventas en línea"
          ],
          "situation": "Jorge tiene al proveedor de CDN en línea y el dedo sobre la regla más tentadora del panel: bloquear todo el tráfico que no venga de Chile. Con un clic, el gráfico baja.\n\nEl problema es que el 18% de las ventas de la campaña vienen de compradores fuera del país, y hay una parte importante del tráfico legítimo que sale con IP de servicios internacionales. Ese clic también los deja afuera.\n\nDetrás suyo, el gerente comercial pregunta cada tres minutos cuánto falta. Son las 12:30 y cada minuto caído tiene un número asociado que alguien va a leer el lunes.",
          "options": [
            "Activar la mitigación con el proveedor de CDN y aplicar filtros por patrón de petición, reputación y límite de tasa, midiendo el efecto de cada cambio antes de aplicar el siguiente.",
            "Activar la mitigación con el proveedor de CDN y aplicar todos los filtros disponibles —patrón, reputación, límite de tasa y bloqueo geográfico fuera de Chile— al mismo tiempo, para cortar el ataque lo más rápido posible.",
            "Aplicar filtros por patrón de petición y reputación con el proveedor de CDN, pero dejar fuera el límite de tasa, ya que ese control suele afectar también a usuarios legítimos con conexiones lentas.",
            "Activar la mitigación con el proveedor de CDN aplicando primero el bloqueo geográfico de todo el tráfico fuera de Chile, y recién después medir si hace falta ajustar por patrón o reputación."
          ],
          "explanations": [
            "La mitigación efectiva ataca el patrón del ataque, no la geografía completa, y aplicar por etapas permite saber qué regla sirvió y cuál cortó clientes.",
            "Aplicar todo junto no permite saber qué regla realmente contuvo el ataque y cuál solo dejó fuera al 18% de clientes que compran desde el extranjero; medir el efecto de cada cambio por separado es lo que evita autoinfligirse ese costo.",
            "El límite de tasa es una de las herramientas más efectivas contra un volumen anómalo de peticiones; dejarlo fuera por el riesgo de afectar a algunos usuarios legítimos deja sin usar justo el filtro que más frena este tipo de ataque.",
            "Empezar por el bloqueo geográfico masivo dejaría fuera de entrada al 18% de las ventas de la campaña; el patrón y la reputación permiten filtrar el ataque sin sacrificar a los compradores internacionales legítimos desde el primer paso."
          ],
          "mismatchContext": "Aplicar reglas de mitigación en la CDN y el borde es de TI, que administra esas consolas; Seguridad define prioridades, pero la ejecución no se reparte en medio del ataque.",
          "correctIndex": 0
        },
        {
          "target": "comunicaciones",
          "title": "Acto 3 · Qué se dice mientras se cae",
          "meta": [
            "12:45",
            "Viernes de campaña",
            "Redes sociales y web",
            "Atención a clientes"
          ],
          "situation": "Andrea Salgado tiene tres pantallas: en una, los comentarios en Instagram pasando de 'no me carga' a 'esta empresa es un desastre'; en otra, el chat de atención a clientes con cola de 40 minutos; en la tercera, un mensaje del gerente comercial pidiéndole que 'no diga nada todavía'.\n\nSon las 12:45 y el silencio ya lleva una hora. Andrea sabe que en ese vacío la gente escribe su propia versión, y que a esta altura hay quien está diciendo que les robaron los datos de la tarjeta.",
          "options": [
            "Publicar un mensaje breve y honesto en los canales propios —hay problemas de acceso, se está trabajando, próxima actualización a una hora concreta— y entregar el mismo guion a atención a clientes.",
            "Publicar un mensaje breve en los canales propios avisando que hay problemas de acceso y que se está trabajando, pero sin comprometerse a una hora concreta de próxima actualización, para no quedar mal si se demora más de lo esperado.",
            "Publicar el mensaje en los canales propios y entregar a atención a clientes un guion similar pero adaptado, con más detalle técnico para que puedan explicar mejor la situación a quien pregunte.",
            "Esperar treinta minutos más antes de publicar cualquier mensaje, para poder confirmar primero con Seguridad si se trata de un ataque antes de usar la palabra 'problemas de acceso'."
          ],
          "explanations": [
            "Un mensaje corto, con compromiso de próxima actualización y guion único con atención a clientes, ocupa el espacio antes de que lo llene el rumor.",
            "Sin una hora concreta de próxima actualización, el mensaje ocupa el espacio por un momento pero no evita que la gente vuelva a preguntar en minutos; el compromiso de horario es lo que sostiene la calma mientras se resuelve.",
            "Un guion 'similar pero adaptado' termina generando variantes distintas de la misma explicación; el mismo guion, palabra por palabra, es lo que evita que atención a clientes diga algo que contradiga el mensaje público.",
            "El silencio ya lleva una hora y las versiones inventadas —como el rumor de robo de tarjetas— siguen creciendo mientras se espera esa confirmación; un mensaje genérico sobre 'problemas de acceso' no necesita esperar la clasificación técnica para publicarse."
          ],
          "mismatchContext": "El mensaje público y el guion para atención a clientes son de Comunicaciones; TI no puede sostener la conversación externa mientras mitiga, y una respuesta técnica improvisada en redes se vuelve declaración oficial.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Abrir de a poco",
          "meta": [
            "16:20",
            "Viernes de campaña",
            "Monitoreo en vivo",
            "Flujo de compra"
          ],
          "situation": "A las 16:20 el gráfico por fin se aplana. Las reglas de mitigación están conteniendo el grueso y la latencia volvió a valores normales. Alguien aplaude en la sala.\n\nJorge no se relaja. El tráfico cayó, pero eso también puede significar que el atacante está tomando aire para una segunda ola. Y hay algo que todavía nadie probó: si el botón de pagar funciona.\n\nMarketing quiere reactivar el envío de correos de la campaña de inmediato para recuperar la tarde. Jorge levanta la mano y pide veinte minutos.",
          "options": [
            "Reabrir por etapas manteniendo activas las reglas de mitigación, monitorear latencia y errores, y confirmar con el área comercial que el flujo de compra funciona completo, incluido el pago.",
            "Reabrir por etapas manteniendo activas las reglas de mitigación y confirmar con el área comercial que el flujo de compra funciona completo, pero declarar el servicio restablecido apenas la portada carga rápido, sin esperar la confirmación del pago.",
            "Monitorear latencia y errores, y confirmar con el área comercial que el flujo de compra funciona completo, pero desactivar las reglas de mitigación apenas el tráfico se estabilice, para no arrastrar reglas innecesarias.",
            "Reabrir por etapas manteniendo activas las reglas de mitigación y monitorear latencia y errores, pero postergar la reactivación del envío de correos de la campaña hasta el día siguiente, aunque el flujo de compra ya esté confirmado."
          ],
          "explanations": [
            "La reapertura gradual permite detectar una segunda ola con margen, y el negocio solo está recuperado cuando alguien logra pagar de punta a punta.",
            "La portada rápida no dice nada sobre si el botón de pagar funciona; el negocio solo está recuperado cuando alguien logra completar una compra de punta a punta, y eso es justo lo que falta confirmar antes de declarar el restablecimiento.",
            "El tráfico estabilizado puede significar que el atacante está tomando aire para una segunda ola; quitar las reglas apenas eso ocurre es exactamente lo que un atacante que pausó para medir la respuesta está esperando.",
            "Si el flujo de compra ya está confirmado funcionando completo, postergar la campaña un día entero solo por precaución adicional deja ventas de la tarde sin capturar sin que exista un riesgo real pendiente que lo justifique."
          ],
          "mismatchContext": "La reapertura controlada del servicio la ejecuta TI, que opera la infraestructura y el monitoreo; el área comercial valida el flujo, pero no maneja la puesta en marcha.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "direccion",
          "title": "Acto 5 · El número sobre la mesa",
          "meta": [
            "Lunes 09:30",
            "Comité de gerencia",
            "Sala de directorio",
            "Informe post incidente"
          ],
          "situation": "Lunes, 09:30. Cristián Bravo tiene dos hojas frente a él. En la primera, cuatro horas y cuarenta minutos de caída y una estimación de ventas perdidas con seis dígitos. En la segunda, la cotización anual del servicio de protección permanente, que cuesta una fracción de eso.\n\nEn la mesa hay quien dice que ya pasó, que el fin de semana se recuperó buena parte de las ventas y que no vale la pena gastar. Andrea, por su lado, tiene pendiente qué se les dice a los clientes que no alcanzaron a comprar con el descuento.\n\nValentina cierra su informe con una frase que nadie discute: el mismo ataque, el mismo día del año que viene, encontraría exactamente la misma infraestructura.",
          "options": [
            "Decidir con los números a la vista: aprobar el nivel de protección permanente que se contrata, con plazo y responsable, y definir qué compromiso se asume públicamente con los clientes que quedaron afectados.",
            "Aprobar el nivel de protección permanente que se contrata, con plazo y responsable definidos, pero dejar para más adelante la decisión sobre qué compromiso público se asume con los clientes que no alcanzaron a comprar con el descuento.",
            "Aprobar el nivel de protección permanente que se contrata y definir el compromiso público con los clientes afectados, pero condicionar el inicio del contrato de protección a que primero se identifique y denuncie al atacante.",
            "Definir el compromiso público con los clientes afectados, pero dejar que TI decida el nivel de protección permanente a contratar dentro de su presupuesto operacional actual, sin comprometer fondos adicionales."
          ],
          "explanations": [
            "Comparar el costo de la caída con el de la protección es una decisión de negocio, y el gesto hacia los clientes afectados también se define en este nivel.",
            "Postergar el gesto hacia los clientes afectados deja abierta una molestia real que ya está circulando en redes; ambas decisiones —la inversión técnica y el compromiso público— corresponden al mismo nivel y al mismo comité, no a momentos distintos.",
            "Identificar al atacante puede no ocurrir nunca y no cambia en nada la necesidad de protegerse para la próxima campaña; condicionar la contratación a esa denuncia deja la infraestructura expuesta exactamente igual hasta entonces.",
            "El presupuesto operacional de TI no está dimensionado para una inversión de continuidad de este tamaño; dejarla ahí equivale a no aprobarla, y el mismo ataque el próximo año encontraría la misma infraestructura."
          ],
          "mismatchContext": "Aprobar la inversión en protección y el compromiso público con los clientes es de Dirección; TI, Seguridad y Comunicaciones proponen, pero ninguna puede comprometer plata ni palabra de la empresa.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "phishing_bec": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · El correo del banco",
          "meta": [
            "09:12",
            "Martes, semana de cierre",
            "Reporte por Teams",
            "Microsoft 365"
          ],
          "situation": "Es martes por la mañana en plena semana de cierre contable y el área de Finanzas trabaja contra reloj. A las 09:12 entra un mensaje al canal de soporte. Es Camila, analista de conciliaciones, y escribe rápido, sin puntos: recibió un correo con el asunto «Verificación urgente de cuenta corriente», el logo del banco de la empresa y un enlace que abrió sin pensarlo mucho porque estaba esperando justamente una gestión bancaria.\n\nIngresó su usuario y su contraseña. La página se recargó y le pidió el código del segundo factor. Lo escribió. La página se lo pidió de nuevo. Ahí se dio cuenta de que algo no calzaba y cerró todo.\n\nHan pasado quince minutos desde el primer clic. Nadie sabe todavía si alguien está usando esas credenciales en este momento. Al revisar el buzón compartido aparece el mismo correo en otras seis casillas del área, todas recibidas a las 09:03, y ninguna de esas seis personas ha dicho nada.",
          "options": [
            "Registrar el incidente y revisar de inmediato los inicios de sesión y las reglas de la casilla de Camila",
            "Registrar el incidente y revisar de inmediato los inicios de sesión de la casilla de Camila, pero dejar la revisión de reglas de reenvío para más tarde, ya que lo urgente es confirmar si alguien inició sesión con sus credenciales",
            "Pedirle a Camila que cambie su contraseña de inmediato, y en paralelo registrar el incidente y revisar los inicios de sesión de su casilla",
            "Registrar el incidente y revisar los inicios de sesión y reglas de la casilla de Camila, pero esperar el reporte del filtro de correo antes de avisar al resto de las seis casillas que recibieron el mismo mensaje"
          ],
          "explanations": [
            "Registrar y revisar accesos de inmediato responde la única pregunta que importa ahora: si el atacante ya entró. Todo lo demás depende de esa respuesta.",
            "Una regla de reenvío se puede crear en el mismo minuto en que el atacante entra, y sigue filtrando correo aunque después se cambie la contraseña; dejarla para 'más tarde' regala tiempo exacto a la puerta que más conviene cerrar ahora.",
            "Cambiar la contraseña no invalida una sesión ya iniciada ni cierra un token ya emitido; si el atacante ya entró, sigue teniendo acceso hasta que esa sesión se revoque explícitamente, algo que el cambio de clave por sí solo no hace.",
            "El filtro puede no marcar nunca un sitio de phishing creado esa misma mañana; las otras seis casillas ya recibieron el mismo correo y esperar su reporte para avisarles solo amplía la ventana en la que alguna de ellas también puede caer."
          ],
          "mismatchContext": "Confirmar el reporte y revisar accesos es una acción técnica sobre la plataforma de correo: la ejecuta TI, no es una decisión de clasificación ni una definición de severidad.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Alguien más entró",
          "meta": [
            "09:26",
            "Inicio de sesión desde el exterior",
            "Cuenta con acceso a pagos"
          ],
          "situation": "Catorce minutos después de que Camila escribiera al canal, el registro de accesos deja de ser una sospecha y pasa a ser un hecho: hay un inicio de sesión exitoso con su cuenta desde una dirección IP que no corresponde a ninguna oficina ni a ningún proveedor conocido, y ocurrió tres minutos después de que ella entregara sus datos.\n\nEl detalle que cambia el peso del caso está en los permisos. Camila no es una usuaria cualquiera: su cuenta puede cargar pagos a proveedores en el ERP, y desde su casilla salen y llegan las confirmaciones de transferencia del área. Es semana de cierre, así que hoy circulan más órdenes de pago que un día normal.\n\nEl equipo se reúne en la sala. La primera decisión no es técnica: es decidir qué tan grave es esto, porque de esa etiqueta depende a quién se despierta, qué recursos se movilizan y con qué urgencia.",
          "options": [
            "Clasificarlo como incidente de severidad alta y activar el plan de respuesta",
            "Clasificarlo como severidad alta, pero activar el plan de respuesta recién cuando se confirme que la cuenta efectivamente cargó o modificó una orden de pago",
            "Clasificarlo como severidad alta y activar el plan de respuesta, pero limitarlo por ahora a la cuenta de Camila, sin revisar si hay otras cuentas con el mismo nivel de acceso a pagos que pudieran estar en la misma situación",
            "Clasificarlo como severidad alta y activar el plan de respuesta, pero esperar a que termine la semana de cierre contable para no interrumpir el proceso de pagos en curso"
          ],
          "explanations": [
            "La severidad no la define cuántas cuentas cayeron, sino a qué da acceso la que cayó. Con permisos de pago comprometidos en semana de cierre, es alta desde ya.",
            "Esperar la confirmación de una transferencia para activar el plan es esperar el daño consumado; la clasificación alta existe precisamente para movilizar al equipo antes de que eso ocurra, no después.",
            "El correo llegó a siete casillas del área, varias con acceso similar; activar el plan solo sobre la cuenta ya confirmada deja sin revisar si alguna de las otras seis también entregó credenciales sin reportarlo todavía.",
            "Es exactamente la semana de cierre la que hace más urgente actuar ahora: más órdenes de pago circulando significa más oportunidades para un fraude que se ejecuta en minutos, no una razón para esperar."
          ],
          "mismatchContext": "Definir la severidad y activar el plan de respuesta es una decisión de Seguridad; no es una acción técnica sobre la plataforma ni una gestión de comunicación.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · La regla invisible",
          "meta": [
            "09:34",
            "Sesión activa ahora",
            "Regla de reenvío creada hace 4 min"
          ],
          "situation": "Mientras Seguridad termina de clasificar, la revisión técnica encuentra lo que faltaba. Hay una sesión abierta en este preciso momento con la cuenta de Camila. Y hay algo más: una regla de reenvío automático creada hace cuatro minutos, que envía copia a una dirección externa de todo correo que contenga las palabras «factura», «transferencia» o «pago», y que además lo marca como leído y lo mueve a una carpeta que nadie mira.\n\nEso significa que el atacante ya no depende de la contraseña. Tiene la sesión viva y tiene el flujo de correo del área. Aunque Camila cambiara su clave ahora mismo, seguiría recibiendo copia de cada orden de pago que entre.\n\nEn la pantalla, el reloj del cierre contable sigue corriendo y las primeras órdenes del día ya están circulando.",
          "options": [
            "Revocar las sesiones activas, forzar el cambio de contraseña y eliminar la regla de reenvío",
            "Revocar las sesiones activas y forzar el cambio de contraseña, pero dejar la regla de reenvío activa por unas horas más para monitorear hacia qué otras direcciones podría estar copiando el atacante",
            "Eliminar la regla de reenvío y forzar el cambio de contraseña, pero no revocar las sesiones ya activas, ya que al cambiar la contraseña esas sesiones deberían caerse solas",
            "Revocar las sesiones activas y eliminar la regla de reenvío, pero forzar el cambio de contraseña recién al final del día, para no interrumpir a Camila mientras termina las conciliaciones pendientes"
          ],
          "explanations": [
            "Las tres acciones juntas cierran las tres puertas abiertas: la sesión viva, la credencial y la regla que sigue filtrando correo aunque la cuenta quede sana.",
            "Cada hora que la regla sigue activa es una hora más de órdenes de pago saliendo hacia esa dirección externa; el valor de 'ver qué hace' el atacante no compensa el riesgo de dejar la fuga abierta en plena semana de cierre.",
            "Una sesión ya iniciada no depende de la contraseña para seguir viva: sigue funcionando hasta que se revoca explícitamente. Confiar en que 'se caiga sola' deja al atacante con acceso activo mientras se hacen los otros cambios.",
            "Mientras la contraseña siga siendo la misma que el atacante ya obtuvo, puede volver a iniciar sesión en cualquier momento; postergar ese cambio por comodidad operativa deja la puerta principal sin cerrar durante horas."
          ],
          "mismatchContext": "Revocar sesiones, forzar credenciales y eliminar reglas son acciones técnicas de contención sobre la plataforma: las ejecuta TI.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Devolver la llave",
          "meta": [
            "10:05",
            "Cuenta restablecida",
            "Camila sin acceso hace 30 min"
          ],
          "situation": "A las 10:05 la cuenta tiene contraseña nueva, el segundo factor reinscrito desde cero y todas las sesiones cortadas. La regla de reenvío fue eliminada y se guardó una copia como evidencia.\n\nCamila lleva media hora sin poder trabajar y pregunta por el canal cuándo puede volver a entrar. Su jefatura pregunta lo mismo, con más apuro: hay pagos que deben quedar cursados hoy.\n\nLa tentación es devolver el acceso de inmediato. Pero la regla de reenvío apareció recién a la cuarta revisión, y nadie ha mirado todavía si el atacante dejó una delegación de buzón, una aplicación autorizada con permisos permanentes o un dispositivo enrolado a su nombre. Cualquiera de esas tres sobrevive intacta a un cambio de contraseña.",
          "options": [
            "Revisar reglas, delegaciones y aplicaciones autorizadas de la cuenta antes de devolver el acceso",
            "Revisar reglas y delegaciones de la cuenta antes de devolver el acceso, pero no las aplicaciones autorizadas con permisos permanentes, ya que esas requieren autorización explícita del usuario para operar",
            "Revisar reglas, delegaciones y aplicaciones autorizadas, y devolver el acceso apenas termine esa revisión, sin dejar registrado el resultado de lo encontrado",
            "Devolver el acceso a Camila de inmediato porque hay pagos urgentes que deben quedar cursados hoy, y revisar reglas, delegaciones y aplicaciones autorizadas en paralelo mientras ella ya está trabajando"
          ],
          "explanations": [
            "Delegaciones y aplicaciones con permiso concedido sobreviven a cualquier cambio de contraseña. Revisarlas es lo que cierra el incidente de verdad, no la clave nueva.",
            "Una aplicación autorizada con permiso concedido puede seguir leyendo o modificando la casilla igual que una regla de reenvío, sin que Camila tenga que volver a autorizarla; dejarlas fuera de la revisión deja exactamente el mismo tipo de puerta abierta que ya se encontró una vez.",
            "Sin un registro de qué se revisó y qué se encontró, no queda evidencia de que la cuenta se validó antes de reabrirla; ese registro es lo que sostiene después cualquier pregunta sobre el estado en que quedó la casilla.",
            "Revisar 'en paralelo' mientras la cuenta ya está en uso activo significa que, si aparece algo —como ya pasó con la regla de reenvío en la cuarta revisión—, ya hubo tiempo de operar con una cuenta potencialmente comprometida."
          ],
          "mismatchContext": "La validación técnica de la casilla antes de devolver el acceso la ejecuta TI; no es una decisión de severidad ni una autorización.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 5 · Lo que queda escrito",
          "meta": [
            "11:40",
            "Sin transferencias",
            "6 casillas alcanzadas · 1 clic"
          ],
          "situation": "Dos horas y media después del primer clic, el balance está sobre la mesa. No hubo transferencias ni movimientos en el ERP. La casilla quedó limpia, revisada permiso por permiso. Camila volvió a trabajar a las 10:40 y el cierre contable sigue su curso.\n\nDel correo original se confirmó que llegó a siete casillas en total. Una persona hizo clic. Las otras seis nunca lo reportaron: dos lo borraron, tres no lo vieron y una lo dejó ahí, sin abrirlo, por si acaso.\n\nEl equipo quiere dar el caso por terminado y volver a la operación. Lo que se decida ahora es lo único que va a quedar escrito de todo este martes.",
          "options": [
            "Declarar el cierre formal, documentar el caso y avisar a las seis casillas alcanzadas",
            "Declarar el cierre formal y documentar el caso, pero no avisar a las otras seis casillas que recibieron el mismo correo, ya que ninguna de ellas reportó haber hecho clic",
            "Documentar el caso completo y avisar a las seis casillas alcanzadas, pero cerrar el ticket técnico sin declarar el cierre formal del incidente, dejándolo como pendiente de revisión",
            "Declarar el cierre formal y avisar a las seis casillas alcanzadas, pero incluir en ese aviso el detalle técnico completo del ataque —el dominio falso, la técnica usada— para que aprendan a reconocerlo"
          ],
          "explanations": [
            "El cierre formal deja trazabilidad de qué pasó y qué se hizo, y avisar a las casillas alcanzadas evita que el mismo correo cobre una segunda víctima mañana.",
            "Que no hayan reportado un clic no significa que estén a salvo del mismo correo mañana: dos lo borraron, tres no lo vieron y una lo dejó sin abrir; las seis siguen expuestas al mismo remitente si no se les avisa explícitamente.",
            "Dejar el incidente sin cierre formal, con todo el trabajo ya hecho, no aporta ninguna vigilancia adicional y solo deja el registro incompleto para una eventual auditoría; el cierre formal es lo que convierte el trabajo en un caso trazable.",
            "El detalle técnico completo del ataque es exactamente el tipo de información que no hace falta compartir masivamente: alcanza con advertir sobre el correo específico, sin entregar un manual que también podría orientar a quien lo lea con otras intenciones."
          ],
          "mismatchContext": "En este escenario Dirección no participa según la matriz definida: el cierre formal lo declara Seguridad, y no es una acción técnica de TI.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "credenciales": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · El pitido de las tres de la mañana",
          "meta": [
            "03:14",
            "Madrugada de sábado",
            "Alerta de Zabbix",
            "Directorio Activo"
          ],
          "situation": "Camila Fuentes lleva ocho meses en el turno de soporte y ya reconoce el ringtone de Zabbix incluso dormida. A las 03:14 el celular vibra sobre el velador con tres alertas encadenadas: 47 intentos fallidos de autenticación contra la cuenta svc_admin en el controlador de dominio principal, en un lapso de once minutos.\n\nSe sienta en la cama, abre el notebook y conecta la VPN con los ojos a medio abrir. La cuarta alerta llegó a las 03:12 y dice algo distinto a las anteriores: inicio de sesión exitoso. La IP de origen no le suena a nada, no está en el rango de la oficina ni en el pool de la VPN corporativa. Un WHOIS rápido la ubica en un proveedor de hosting fuera de Chile.\n\nsvc_admin no es una cuenta cualquiera: es administrador de dominio, la usan para tareas de mantención programada y la contraseña no se cambia desde antes de que Camila entrara a la empresa. Son las 03:17. El único despierto en toda la organización es ella.",
          "options": [
            "Escalar de inmediato al encargado de seguridad por el canal de emergencia y dejar registrada la hora, la IP de origen, la cuenta afectada y la secuencia de eventos antes de intervenir el sistema.",
            "Escalar de inmediato al encargado de seguridad por el canal de emergencia, pero cambiar la contraseña de svc_admin antes de avisar, para dejar al atacante afuera mientras se espera la respuesta.",
            "Bloquear la IP de origen en el firewall perimetral y escalar de inmediato al encargado de seguridad, dejando la alerta de Zabbix abierta pero sin registrar todavía la secuencia completa de eventos.",
            "Escalar al encargado de seguridad por el canal de emergencia y dejar registrada la hora y la cuenta afectada, pero sin la IP de origen, ya que un WHOIS a esta hora puede no ser confiable."
          ],
          "explanations": [
            "Un ingreso exitoso en una cuenta de administrador de dominio es un evento que activa el protocolo de inmediato, y la evidencia inicial (hora, IP, cuenta, secuencia) se pierde o se contamina apenas alguien empieza a tocar el sistema.",
            "Cambiar la clave antes de escalar borra la oportunidad de que Seguridad decida con la sesión todavía viva qué evidencia conviene capturar primero; el orden importa: primero se registra y escala, después se interviene coordinadamente.",
            "Bloquear la IP frena solo ese origen —el atacante rota a otra en minutos— y sin la secuencia completa registrada antes de tocar nada, se pierde el detalle de qué hizo exactamente entre el ingreso exitoso y el bloqueo.",
            "La IP de origen es uno de los datos más útiles para correlacionar el incidente después, sea o no el WHOIS completamente preciso; omitirla del registro inicial por esa duda deja un vacío que después es más difícil de reconstruir."
          ],
          "mismatchContext": "La detección y el escalamiento inicial le corresponden a TI porque es quien tiene el turno, la visibilidad de la plataforma y la capacidad de leer los eventos del controlador de dominio en el momento en que ocurren.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Ponerle nombre a lo que entró",
          "meta": [
            "04:05",
            "Sala de reuniones vacía",
            "Llamada de emergencia",
            "Logs de AD"
          ],
          "situation": "Rodrigo Peña, encargado de seguridad, contesta al segundo timbrazo. A las 04:05 ya está en la mesa del comedor de su casa con dos ventanas abiertas: los eventos 4625 y 4624 que le mandó Camila, y la consola de la EDR. Se sirve café frío del día anterior porque no quiere despertar a nadie más en la casa.\n\nLos logs muestran que desde el ingreso exitoso, svc_admin consultó el listado completo de miembros del grupo Domain Admins, enumeró los recursos compartidos del servidor de archivos y dejó una sesión abierta que sigue viva. No hay cifrado, no hay borrado, no hay nada roto. Todo funciona. Eso es exactamente lo que le preocupa.\n\nCamila le pregunta por el chat si esto cuenta como incidente crítico o si lo dejan como alerta media, porque el domingo hay cierre de facturación y bajar servicios va a doler. Rodrigo tiene que decidir la categoría ahora, y de esa categoría depende a quién se despierta a continuación.",
          "options": [
            "Clasificarlo como incidente crítico de compromiso de identidad privilegiada, con alcance potencial de todo el dominio, y activar el protocolo de escalamiento a dirección aunque todavía no haya daño visible.",
            "Clasificarlo como incidente crítico de compromiso de identidad privilegiada, pero activar el protocolo de escalamiento a dirección recién el lunes, ya que de madrugada no hay a quién más avisar sin generar alarma innecesaria.",
            "Clasificarlo como incidente crítico con alcance potencial de todo el dominio, pero esperar a confirmar con el proveedor de mantención si alguno de sus técnicos estaba trabajando esa noche antes de activar el protocolo de escalamiento.",
            "Clasificarlo como incidente crítico de compromiso de identidad privilegiada y activar el escalamiento a dirección, pero solo si en las próximas horas aparece evidencia de que el atacante tocó datos, ya que por ahora todo funciona con normalidad."
          ],
          "explanations": [
            "Con una cuenta de administrador de dominio en manos ajenas, el alcance potencial es la totalidad del ambiente; la ausencia de daño visible suele significar reconocimiento en curso, no que no pasó nada.",
            "El alcance potencial de una cuenta de administrador de dominio no espera al horario de oficina; postergar el escalamiento a dirección hasta el lunes deja horas sin la decisión que solo ese nivel puede tomar sobre recursos y comunicación.",
            "Consultar al proveedor es válido en paralelo, pero condicionar la activación del protocolo a esa respuesta deja el incidente sin escalar mientras la sesión sigue potencialmente activa; la clasificación no depende de esa confirmación.",
            "Que todo 'funcione' es justamente lo que preocupa: la ausencia de daño visible en una cuenta con esos privilegios suele significar reconocimiento en curso, no que no haya pasado nada. Condicionar la clasificación a encontrar daño primero invierte el criterio."
          ],
          "mismatchContext": "La clasificación es responsabilidad de seguridad porque exige ponderar alcance, criticidad de la identidad y riesgo residual, no solo el estado técnico de los servidores.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · Cortar sin apagar la empresa",
          "meta": [
            "04:40",
            "Domingo de cierre de facturación",
            "Consola de AD",
            "Sesión activa"
          ],
          "situation": "Rodrigo autoriza contener. Camila tiene la consola de Active Directory abierta y las manos sobre el teclado a las 04:40. La sesión del atacante sigue viva; en la última media hora hizo dos consultas más al servidor de archivos y nada que se parezca a exfiltración masiva.\n\nEl problema es quirúrgico: svc_admin corre tres tareas programadas que alimentan el proceso de facturación que arranca a las 06:00 del domingo. Si la deshabilita a lo bruto, el cierre no corre y el lunes la gerencia de finanzas va a preguntar por qué. Si no la toca, el atacante sigue adentro con el nivel más alto de privilegios del dominio.\n\nRodrigo escribe en el chat: la decisión es tuya, tú tienes la consola. Camila mira el reloj: le quedan poco más de ochenta minutos antes de que el proceso de facturación intente autenticarse.",
          "options": [
            "Deshabilitar svc_admin, revocar sus tickets Kerberos activos y matar las sesiones abiertas, avisando en el mismo acto a Rodrigo y al responsable de facturación para levantar las tareas con una cuenta de servicio nueva antes de las 06:00.",
            "Deshabilitar svc_admin y revocar sus tickets Kerberos activos, pero avisar a Rodrigo y al responsable de facturación recién después de las 06:00, cuando ya se sepa si el proceso de facturación falló o no.",
            "Deshabilitar svc_admin y matar las sesiones abiertas, pero no revocar los tickets Kerberos ya emitidos, ya que esos expiran solos en un par de horas sin necesidad de intervenir.",
            "Revocar los tickets Kerberos y matar las sesiones abiertas de svc_admin, pero dejar la cuenta habilitada por si hace falta usarla de urgencia antes de que la cuenta de reemplazo esté lista."
          ],
          "explanations": [
            "Deshabilitar y revocar los tickets corta el acceso de verdad, y coordinar en paralelo la cuenta de reemplazo evita que la contención se transforme en una caída del negocio.",
            "Avisar después de que el proceso falle deja al responsable de facturación sin margen para levantar una cuenta de reemplazo a tiempo; el aviso debe ir en el mismo acto que la deshabilitación, no condicionado a ver primero si algo se rompe.",
            "Un ticket Kerberos vigente puede seguir siendo válido para autenticarse mientras no expire o se revoque explícitamente; confiar en que 'expire solo' deja una ventana de acceso activo que la revocación explícita cierra de inmediato.",
            "Dejar la cuenta comprometida habilitada, aunque sin sesiones activas, mantiene disponible la misma credencial que el atacante ya tiene; deshabilitarla del todo es lo que cierra esa puerta mientras se coordina el reemplazo."
          ],
          "mismatchContext": "La contención técnica la ejecuta TI porque es quien tiene los accesos administrativos, conoce las dependencias operativas de la cuenta y puede levantar el reemplazo en el mismo movimiento.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Volver a confiar en el dominio",
          "meta": [
            "Domingo 11:20",
            "Oficina vacía",
            "Informe forense preliminar",
            "Cuentas privilegiadas"
          ],
          "situation": "Domingo, 11:20. Camila lleva ocho horas despierta y está en la oficina con la luz del pasillo apagada porque nadie prendió el tablero. Rodrigo llegó con sopaipillas y el informe preliminar: el acceso entró por una credencial reutilizada que apareció en una filtración de un servicio externo, y svc_admin no tenía segundo factor.\n\nEl análisis muestra que el atacante alcanzó a crear una segunda cuenta, svc_backup2, con membresía en Domain Admins, a las 03:31. Estuvo dieciséis horas sin que nadie la mirara. No hay evidencia de que se haya usado todavía.\n\nLa presión ahora es al revés: son las 11:20 del domingo y a las 08:00 del lunes ciento ochenta personas van a intentar iniciar sesión. Rodrigo pregunta cuál es el plan para volver a operar sin arrastrar el problema adentro.",
          "options": [
            "Eliminar la cuenta creada por el atacante, rotar las credenciales de todas las cuentas privilegiadas y de servicio, habilitar segundo factor en los accesos administrativos y recién entonces restablecer la operación, verificando en los logs que no queden sesiones ni tareas anómalas.",
            "Eliminar la cuenta creada por el atacante y habilitar segundo factor en los accesos administrativos, pero dejar la rotación de las demás cuentas privilegiadas y de servicio agendada para el próximo ciclo de mantención.",
            "Rotar las credenciales de todas las cuentas privilegiadas y de servicio y habilitar segundo factor, pero restablecer la operación antes de terminar de verificar en los logs que no queden sesiones ni tareas programadas anómalas.",
            "Eliminar la cuenta creada por el atacante y rotar las credenciales de las cuentas privilegiadas, pero mantener el segundo factor como opcional en los accesos administrativos, ya que hacerlo obligatorio de inmediato podría trabar el reinicio de la operación del lunes."
          ],
          "explanations": [
            "La recuperación solo es real cuando se elimina la persistencia, se invalidan las credenciales que el atacante pudo capturar y se cierra el hueco que permitió el ingreso, en ese orden y antes de reabrir.",
            "Postergar la rotación deja vivas otras credenciales que el atacante, con privilegios de administrador de dominio durante casi una hora, pudo haber visto o capturado; la puerta puede seguir abierta con un nombre de cuenta distinto.",
            "Reabrir antes de confirmar que no quedan sesiones o tareas anómalas es exactamente el tipo de paso que, si se salta, permite que algo dejado por el atacante siga funcionando aunque las credenciales ya se hayan cambiado.",
            "La falta de segundo factor obligatorio en svc_admin fue justamente la condición que permitió este incidente; dejarlo opcional en el resto de las cuentas administrativas reproduce la misma debilidad para la próxima credencial que se filtre."
          ],
          "mismatchContext": "La recuperación operativa la ejecuta TI porque implica intervenir el directorio, las cuentas de servicio y la plataforma de autenticación con la que trabaja todos los días.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "direccion",
          "title": "Acto 5 · La pregunta incómoda del lunes",
          "meta": [
            "Lunes 09:00",
            "Sala de directorio",
            "Informe de cierre",
            "Decisión de inversión"
          ],
          "situation": "Lunes, 09:00. Marcela Sandoval, gerente general, tiene sobre la mesa el informe de cierre de tres páginas que Rodrigo alcanzó a redactar a las seis de la mañana. Afuera, la operación corre normal: nadie en la empresa, salvo cuatro personas, sabe que hubo alguien con privilegios de administrador dentro del dominio durante casi una hora.\n\nEl informe termina con una frase seca: la cuenta comprometida no tenía segundo factor, su contraseña llevaba más de cuatro años sin rotar y no existía inventario de cuentas privilegiadas. Los mismos tres puntos aparecen, textuales, en la auditoría interna de hace catorce meses, con estado pendiente.\n\nCamila está sentada al fondo de la sala, todavía con la ropa del domingo. Marcela levanta la vista y pregunta qué hacemos ahora, y todos entienden que la respuesta no es técnica.",
          "options": [
            "Asumir el cierre formal del incidente, asignar dueño, presupuesto y plazo a cada brecha identificada (segundo factor obligatorio en cuentas privilegiadas, rotación e inventario) y fijar una revisión de cumplimiento con fecha en el comité siguiente.",
            "Asumir el cierre formal del incidente y asignar dueño y plazo a cada brecha identificada, pero dejar el presupuesto pendiente de la próxima revisión anual, ya que asignarlo ahora podría descuadrar el plan financiero del trimestre.",
            "Asignar dueño, presupuesto y plazo a cada brecha identificada, pero fijar la revisión de cumplimiento sin una fecha concreta en el comité, confiando en que el equipo la traiga de vuelta cuando esté lista.",
            "Asumir el cierre formal del incidente y asignar presupuesto y plazo a cada brecha, pero encargar primero una investigación sobre por qué la auditoría de hace catorce meses no se resolvió, antes de avanzar con las correcciones nuevas."
          ],
          "explanations": [
            "El cierre de un incidente es una decisión de dirección: sin dueño, plata, plazo y una fecha de revisión, los hallazgos vuelven a quedar pendientes como ya ocurrió una vez.",
            "Dueño y plazo sin presupuesto asignado es la misma combinación que dejó estos tres hallazgos pendientes durante catorce meses en la auditoría anterior; sin recursos comprometidos ahora, el plazo fijado corre el riesgo de no cumplirse igual.",
            "Sin una fecha fija de revisión, el seguimiento queda a discreción del equipo que ya dejó pasar los mismos hallazgos una vez; una fecha concreta en el comité es lo que sostiene que la corrección realmente se revise y no vuelva a quedar pendiente.",
            "Investigar por qué no se resolvió antes es legítimo, pero condicionar las correcciones nuevas a que esa investigación termine primero solo repite el mismo patrón de postergación que dejó los hallazgos pendientes la primera vez."
          ],
          "mismatchContext": "El cierre le corresponde a dirección porque implica comprometer presupuesto, prioridad y responsables, cosas que ni TI ni seguridad pueden autorizar por su cuenta.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "0day": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · El aviso que llegó por Twitter",
          "meta": [
            "08:52",
            "Martes",
            "Boletín del CSIRT",
            "Portal expuesto a internet"
          ],
          "situation": "Diego Aravena está tomando el segundo café del martes cuando le llega el correo del CSIRT y, casi en paralelo, tres mensajes al grupo de WhatsApp de administradores de sistemas. Una vulnerabilidad crítica, CVSS 9.8, ejecución remota de código sin autenticación, en el software del portal de proveedores que la empresa tiene publicado a internet desde hace cuatro años.\n\nEl boletín trae dos frases que le suben la temperatura: hay prueba de concepto pública desde anoche y se observa explotación activa en el mundo. Diego abre el portal en el navegador y ahí está, funcionando, con el banner de versión visible en el pie de página. Versión afectada.\n\nEl fabricante publicó parche hace once horas. La ventana de mantención de la empresa es el sábado en la noche, faltan cuatro días, y el portal lo usan noventa proveedores para subir facturas. Son las 08:52 y Diego todavía no le ha dicho nada a nadie.",
          "options": [
            "Escalar de inmediato al encargado de seguridad con el identificador de la vulnerabilidad, la versión instalada, la exposición a internet y la evidencia de explotación activa, y en paralelo revisar los logs del portal en busca de indicadores de compromiso.",
            "Escalar de inmediato al encargado de seguridad con la versión instalada y la exposición a internet, pero dejar la revisión de logs del portal para la reunión de la tarde, ya que a esa hora el equipo recién está llegando.",
            "Escalar al encargado de seguridad con la evidencia de explotación activa y revisar los logs del portal, pero instalar el parche de inmediato en producción en paralelo, sin esperar la evaluación de impacto ni el respaldo previo.",
            "Escalar al encargado de seguridad y revisar los logs del portal, pero agendar la instalación del parche para la ventana de mantención del sábado, ya que aplicar cambios fuera de calendario requiere una autorización que a esta hora nadie ha dado."
          ],
          "explanations": [
            "Exposición a internet más exploit público más explotación activa es la combinación que obliga a escalar en el momento, y revisar logs temprano permite saber si ya entraron antes de que se pierda la evidencia.",
            "Con explotación activa reportada desde hace horas, revisar los logs temprano es lo que permite saber si ya entraron antes de que la evidencia se pierda o se sobrescriba; postergarla a la tarde arriesga justo esa ventana.",
            "Parchar sin respaldo ni evaluación de impacto puede dejar caído el canal de facturación de noventa proveedores; escalar primero y coordinar la instalación con esos resguardos no le resta velocidad real a la respuesta.",
            "El calendario de mantención está pensado para actualizaciones normales, no para una vulnerabilidad con exploit público y explotación activa; esperar la autorización habitual del sábado regala cuatro días de exposición a un riesgo ya confirmado."
          ],
          "mismatchContext": "La detección y el escalamiento le corresponden a TI porque es quien mantiene el inventario de versiones, ve la exposición real del servicio y puede confirmar en minutos si la instalación está afectada.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Cuánto duele si pasa",
          "meta": [
            "09:30",
            "Sala de TI",
            "Reunión de 15 minutos",
            "CVSS 9.8"
          ],
          "situation": "Paula Vergara llega a la sala de TI con el notebook bajo el brazo a las 09:30. Diego proyecta en la pantalla el boletín y, al lado, la topología: el portal de proveedores está en la DMZ, pero comparte segmento con el servidor que expone la API interna de facturación.\n\nParte del equipo empuja a esperar. El jefe de finanzas ya escribió preguntando si el portal se va a caer justo en semana de cierre. Otro sysadmin comenta que en cuatro años nunca los han atacado por ahí y que el portal ni siquiera guarda datos sensibles.\n\nPaula tiene que fijar la severidad y el plazo. En la pantalla, el contador del boletín del CSIRT dice que la explotación masiva empezó hace catorce horas.",
          "options": [
            "Clasificarlo como riesgo crítico con plazo de remediación inmediato, considerando exposición a internet, exploit público, explotación activa y la posibilidad de pivotar desde la DMZ hacia el segmento de facturación.",
            "Clasificarlo como riesgo crítico considerando la exposición a internet y el exploit público, pero con plazo de remediación de una semana, ya que instalar en la ventana normal reduce el riesgo de que el parche rompa algo en plena semana de cierre.",
            "Clasificarlo como riesgo crítico por la exposición y el exploit público, pero sin considerar la posibilidad de pivotar desde la DMZ hacia el segmento de facturación, ya que ambos segmentos están separados por un firewall interno.",
            "Clasificarlo como riesgo crítico con plazo de remediación inmediato, pero esperar la nota técnica del fabricante antes de confirmar si la instalación específica de la empresa es explotable, dejando la remediación en pausa hasta entonces."
          ],
          "explanations": [
            "La severidad se construye con exposición, facilidad de explotación y alcance posterior; aquí las tres están al máximo y el segmento compartido convierte al portal en puerta de entrada.",
            "Con explotación activa reportada hace catorce horas, una semana es tiempo más que suficiente para que el portal sea comprometido; el riesgo de que el parche cause una falla no se compara con el de dejar la vulnerabilidad abierta ese tiempo.",
            "Un firewall interno reduce el riesgo de pivote, pero no lo elimina si la vulnerabilidad permite ejecución de código en el servidor de la DMZ; descartar esa posibilidad de la clasificación subestima el alcance real si el exploit funciona.",
            "Esperar confirmaciones adicionales del fabricante mientras el exploit ya circula públicamente deja el sistema expuesto por razones de trámite; el boletín del CSIRT ya entrega la evidencia suficiente para actuar sin esa nota adicional."
          ],
          "mismatchContext": "La clasificación de la severidad le corresponde a seguridad porque requiere combinar el riesgo técnico con el impacto en el negocio y fijar un plazo exigible al resto de la organización.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · Cerrar la puerta antes de arreglarla",
          "meta": [
            "10:15",
            "Martes, semana de cierre",
            "Firewall perimetral",
            "90 proveedores conectados"
          ],
          "situation": "Paula fija el plazo: contener hoy, parchar hoy. Diego vuelve a su puesto a las 10:15 con el respaldo del portal corriendo en segundo plano y el ticket de cambio de emergencia recién abierto.\n\nEl parche existe, pero el proveedor del portal advierte que la actualización requiere migrar la base de datos y estiman entre dos y cuatro horas con el servicio abajo. En semana de cierre, cuatro horas sin portal significa noventa proveedores llamando por teléfono y un jefe de finanzas ya escribiendo su tercer correo.\n\nDiego escribe la propuesta en el ticket y se queda con el cursor parpadeando antes de mandarla. Sabe que lo que decida en los próximos veinte minutos define si esto se recuerda como una tarde larga o como algo peor.",
          "options": [
            "Restringir de inmediato el acceso al portal desde internet dejando pasar solo los rangos de IP de los proveedores conocidos o publicándolo tras VPN, y con la exposición ya reducida ejecutar el parche con respaldo y ventana comunicada el mismo día.",
            "Restringir el acceso al portal dejando pasar solo los rangos de IP de los proveedores conocidos, pero ejecutar el parche recién cuando el proveedor confirme por escrito que la migración de base de datos no tiene riesgos, para no arriesgar el cierre de mes.",
            "Restringir el acceso al portal publicándolo tras VPN, y ejecutar el parche con respaldo el mismo día, pero sin comunicar previamente a los proveedores la ventana de indisponibilidad, para no generar preguntas antes de tener certeza de los tiempos.",
            "Ejecutar el parche con respaldo y ventana comunicada el mismo día, pero sin restringir antes el acceso desde internet, ya que la migración de base de datos va a dejar el portal fuera de línea de todas formas durante el proceso."
          ],
          "explanations": [
            "Reducir la superficie expuesta compra tiempo real en minutos y permite parchar sin la presión de estar bajo ataque, sin sacrificar la operación completa.",
            "Con la exposición ya reducida el riesgo baja, pero esperar una confirmación formal por escrito puede tomar días que el exploit público no da; una vez reducida la exposición, el parche se ejecuta con el respaldo tomado, sin necesidad de esa confirmación adicional.",
            "Noventa proveedores intentando entrar sin aviso durante la migración genera la misma presión telefónica que se quería evitar; comunicar la ventana con anticipación, aunque sea aproximada, es parte de reducir el costo operativo de la misma medida.",
            "Mientras el parche no está aplicado, el portal sigue expuesto y explotable; restringir el acceso antes de empezar reduce ese riesgo durante las horas previas a la migración, que es exactamente la ventana que queda descubierta si se salta este paso."
          ],
          "mismatchContext": "La contención la ejecuta TI porque es quien administra el perímetro, el servidor y la ventana de cambio, y puede aplicar la restricción de acceso en el momento.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Verificar que no llegaron antes",
          "meta": [
            "18:40",
            "Martes en la tarde",
            "Portal parchado",
            "Logs de 30 días"
          ],
          "situation": "18:40. El parche quedó aplicado, la migración demoró dos horas y cuarenta minutos y el portal volvió a las 17:55. Diego tiene la camisa arrugada y el jefe de finanzas dejó de escribir. Paula está al lado revisando la salida de un script sobre los logs del servidor web.\n\nHay algo. El 12 de agosto, tres días antes de que se publicara la vulnerabilidad, aparecen dos peticiones con un patrón que se parece bastante al de la prueba de concepto, desde una IP que nunca más volvió. El servidor respondió con código 200.\n\nDiego mira la pantalla y dice en voz baja lo que ambos están pensando: el parche cerró la puerta, pero quizás alguien ya había pasado.",
          "options": [
            "Mantener el sistema parchado y en operación mientras se ejecuta una revisión de compromiso completa sobre ese servidor (archivos nuevos, tareas programadas, cuentas, conexiones salientes) y se rotan las credenciales y secretos que el portal utiliza.",
            "Ejecutar la revisión de compromiso completa sobre el servidor —archivos nuevos, tareas programadas, cuentas, conexiones salientes—, pero dejar la rotación de credenciales y secretos para la próxima ventana de mantención, ya que el sistema ya está parchado.",
            "Rotar las credenciales y secretos que el portal utiliza de inmediato, y mantener el sistema parchado y en operación, pero sin revisar tareas programadas ni conexiones salientes, ya que el patrón de las dos peticiones del 12 de agosto no muestra indicios de persistencia.",
            "Mantener el sistema parchado y en operación mientras se revisan archivos nuevos y tareas programadas, pero dejar fuera del análisis las conexiones salientes del servidor, ya que ese tráfico normalmente corresponde a actualizaciones automáticas del propio portal."
          ],
          "explanations": [
            "Parchar elimina la vulnerabilidad, no al intruso que pudo entrar antes; con un indicio de explotación previa hay que buscar persistencia y rotar los secretos que ese servidor conocía.",
            "El parche cierra la vulnerabilidad, no invalida credenciales que un atacante pudo haber visto si logró ejecutar código en el servidor antes del 15 de agosto; postergar esa rotación deja utilizables secretos que ya pudieron quedar expuestos.",
            "Dos peticiones con código de respuesta 200 antes de la publicación de la vulnerabilidad son indicio suficiente de que algo pudo ejecutarse; descartar la revisión de tareas y conexiones salientes por 'no mostrar indicios' es justamente lo que una persistencia bien hecha busca lograr.",
            "Una conexión saliente hacia un destino no habitual es uno de los indicadores más claros de que un servidor comprometido está comunicándose con un atacante; descartarla por parecerse al tráfico normal de actualizaciones es exactamente el punto ciego que una revisión de compromiso debe cubrir."
          ],
          "mismatchContext": "La verificación y la recuperación del servicio las ejecuta TI porque tiene acceso al sistema de archivos, a los logs históricos y a los secretos que hay que rotar.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "direccion",
          "title": "Acto 5 · Cuatro días que no teníamos",
          "meta": [
            "Jueves 15:00",
            "Comité de gerencia",
            "Informe de lecciones",
            "Gestión de vulnerabilidades"
          ],
          "situation": "Jueves, 15:00, comité de gerencia. Ricardo Bustos escucha el resumen: la vulnerabilidad se publicó un lunes en la noche, la empresa se enteró el martes por un boletín externo y no por un proceso propio, y el único calendario de parches disponible apuntaba al sábado.\n\nPaula agrega el dato que incomoda: no existe inventario actualizado de software expuesto a internet, ni un procedimiento de cambio de emergencia distinto al normal. Lo del martes funcionó porque Diego estaba disponible y decidió rápido, no porque hubiera un proceso.\n\nRicardo mira el presupuesto de TI en la otra pestaña. El portal quedó parchado, la revisión no encontró persistencia, y aun así todos en la sala saben que la próxima vez puede caer un viernes en la tarde.",
          "options": [
            "Aprobar formalmente un proceso de gestión de vulnerabilidades con inventario de activos expuestos, monitoreo de boletines, plazos de remediación por severidad y un procedimiento de cambio de emergencia, asignando responsable, recursos y fecha de puesta en marcha.",
            "Aprobar el proceso de gestión de vulnerabilidades con inventario de activos expuestos y plazos de remediación por severidad, pero dejar el procedimiento de cambio de emergencia para una revisión posterior, ya que el de esta semana funcionó razonablemente bien.",
            "Aprobar el proceso completo de gestión de vulnerabilidades con inventario, monitoreo de boletines y procedimiento de cambio de emergencia, pero sin asignar un responsable formal, confiando en que el equipo de TI lo sostenga de forma natural.",
            "Aprobar formalmente el proceso de gestión de vulnerabilidades con inventario, monitoreo, plazos por severidad y cambio de emergencia, asignando responsable y recursos, pero sin fijar una fecha concreta de puesta en marcha, dejándola a criterio del equipo."
          ],
          "explanations": [
            "Lo que falló no fue la reacción sino la ausencia de proceso; institucionalizarlo con dueño, plazos y recursos es una decisión que solo dirección puede tomar.",
            "Que haya funcionado esta vez dependió de que Diego estuviera disponible y decidiera rápido, no de que existiera un procedimiento; dejar ese punto pendiente es apostar de nuevo a que la próxima vez también haya alguien así.",
            "Un proceso sin dueño formal tiende a diluirse en la operación diaria del equipo, que es exactamente lo que no existía antes de este incidente; asignar responsable es lo que da continuidad al proceso más allá de quién esté de turno.",
            "Sin fecha de puesta en marcha, el proceso aprobado puede quedar en diseño indefinidamente mientras compite con la operación diaria; una fecha concreta es lo que convierte la aprobación en algo que realmente empieza a funcionar."
          ],
          "mismatchContext": "El cierre le corresponde a dirección porque exige aprobar un proceso permanente, asignar recursos y aceptar el costo operativo de interrumpir servicios cuando la severidad lo amerite.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "terceros": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · El proveedor que trabaja de noche",
          "meta": [
            "23:47",
            "Miércoles",
            "Alerta de la VPN",
            "Cuenta de soporte externo"
          ],
          "situation": "Karen Muñoz revisa por costumbre el panel de accesos remotos antes de cerrar el notebook. 23:47 de un miércoles. La cuenta soporte_sitec, que usa el proveedor externo que mantiene el sistema de gestión de bodegas, aparece conectada desde hace cincuenta minutos.\n\nEso pasa a veces, los técnicos de Sitec trabajan de noche cuando hay mantención. Pero hay dos cosas que no calzan: no hay ticket de mantención abierto esta semana, y la conexión no viene del rango habitual de la empresa proveedora sino de una IP residencial de otra región. Karen abre el historial: en los últimos cuarenta minutos, esa sesión intentó acceder tres veces al servidor de archivos de Recursos Humanos, que no tiene ninguna relación con el sistema de bodegas.\n\nEl contacto técnico de Sitec le contestó el último correo a las 18:30 diciendo que quedaban listos hasta el próximo mes. Karen se queda mirando la pantalla con el dedo sobre el touchpad.",
          "options": [
            "Escalar de inmediato al encargado de seguridad con la hora de conexión, la IP de origen, los recursos a los que intentó acceder y la ausencia de ticket, dejando la evidencia registrada antes de intervenir la cuenta.",
            "Escalar de inmediato al encargado de seguridad con la hora, la IP de origen y la ausencia de ticket, pero desconectar la sesión y bloquear la cuenta en el mismo momento, antes de que Seguridad alcance a decidir cómo intervenir.",
            "Escalar al encargado de seguridad con la hora de conexión y los recursos a los que intentó acceder, pero sin mencionar la ausencia de ticket de mantención, ya que ese dato lo puede confirmar directamente el proveedor cuando responda.",
            "Registrar la hora, la IP de origen y los recursos a los que intentó acceder, y escalar al encargado de seguridad, pero recién después de confirmar con el contrato si el acceso a Recursos Humanos está formalmente excluido del alcance de Sitec."
          ],
          "explanations": [
            "El patrón (sin ticket, origen anómalo, intentos de acceso fuera del alcance contratado) es suficiente para escalar, y la evidencia inicial es lo primero que se pierde al intervenir.",
            "Cortar la sesión antes de coordinar con Seguridad puede alertar al atacante de que fue detectado y perder la oportunidad de observar hacia dónde más intenta moverse; escalar primero permite decidir el momento de la intervención con criterio.",
            "La ausencia de ticket es justamente lo que distingue una conexión legítima fuera de horario de una sospechosa; omitirla del reporte inicial deja a Seguridad sin el dato que más pesa para decidir la urgencia de la respuesta.",
            "Confirmar el alcance contractual es útil pero no urgente: la sesión sigue activa mientras se revisa el contrato, y esa verificación se puede hacer en paralelo al escalamiento, no como condición previa para avisar."
          ],
          "mismatchContext": "La detección y el escalamiento le corresponden a TI porque administra la plataforma de acceso remoto y es quien puede correlacionar la sesión con los tickets y los rangos autorizados.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · No es nuestra cuenta, pero es nuestra red",
          "meta": [
            "00:20",
            "Jueves de madrugada",
            "Llamada al celular",
            "Servidor de RRHH"
          ],
          "situation": "Andrés Lagos contesta a las 00:20 con la voz pastosa y en tres minutos está mirando lo mismo que Karen. La sesión sigue arriba. Los intentos contra el servidor de RRHH fallaron por permisos, pero el segundo intento cambió de técnica: en vez de ir al recurso compartido, buscó enumerar las carpetas.\n\nAndrés levanta el contrato de Sitec en el drive. La cuenta soporte_sitec es compartida por al menos cuatro técnicos del proveedor, no tiene segundo factor y tiene permisos que exceden el sistema de bodegas porque se configuró así en 2021 para no tener que ir ajustando accesos.\n\nKaren pregunta si esto se clasifica como incidente de la empresa o como problema del proveedor, porque el equipo interno no hizo nada malo. Andrés tiene que decidir eso ahora, con la sesión todavía activa al otro lado.",
          "options": [
            "Clasificarlo como incidente crítico propio de compromiso de acceso de terceros, con alcance potencial sobre datos de Recursos Humanos, y activar el protocolo interno completo sin esperar la respuesta del proveedor.",
            "Clasificarlo como incidente crítico propio de compromiso de acceso de terceros y activar el protocolo interno, pero esperar la respuesta de Sitec antes de definir el alcance potencial sobre los datos de Recursos Humanos.",
            "Clasificarlo como incidente crítico con alcance potencial sobre datos de Recursos Humanos y activar el protocolo interno, pero coordinar primero con Sitec cómo van a gestionar ellos su parte, antes de avanzar con la respuesta propia.",
            "Clasificarlo como incidente crítico propio y activar el protocolo interno completo, pero mantener la cuenta soporte_sitec activa mientras dura la clasificación, para no interrumpir a Sitec sin haber confirmado primero que el acceso es realmente anómalo."
          ],
          "explanations": [
            "El acceso ocurre dentro de la red de la empresa y afecta datos propios: la responsabilidad frente a los titulares de esos datos no se traspasa junto con la cuenta.",
            "El alcance potencial se puede estimar con lo que la sesión intentó tocar, sin depender de lo que el proveedor confirme después; esperar esa respuesta retrasa una evaluación que ya se puede hacer con la información disponible ahora.",
            "La responsabilidad frente a los datos de Recursos Humanos es de la empresa, no del proveedor; condicionar el avance de la respuesta propia a cómo Sitec organice la suya deja la contención esperando algo que no está bajo control interno.",
            "El patrón —sin ticket, origen residencial, intentos fuera del sistema de bodegas— ya es suficiente indicio; mantener la cuenta activa 'para confirmar primero' regala tiempo justo en la clasificación que debería gatillar la contención."
          ],
          "mismatchContext": "La clasificación le corresponde a seguridad porque debe ponderar el alcance sobre datos propios y la responsabilidad de la empresa, más allá de dónde se originó la credencial.",
          "correctIndex": 0
        },
        {
          "target": "legal",
          "title": "Acto 2 · Lo que dice el contrato y lo que dice la ley",
          "meta": [
            "08:15",
            "Jueves",
            "Contrato de servicios 2021",
            "Datos de RRHH"
          ],
          "situation": "Constanza Rivas, abogada interna, recibe el resumen del incidente a las 08:15 con el café todavía cerrado sobre el escritorio. Andrés le adjunta dos archivos: la línea de tiempo de la madrugada y el contrato con Sitec firmado en 2021, cuatro páginas, sin anexo de seguridad de la información y sin cláusula de notificación de incidentes.\n\nLos recursos que la sesión intentó alcanzar contienen fichas de personal: cédulas, remuneraciones, contratos de ciento ochenta trabajadores. Todavía no hay confirmación de que se haya accedido a ninguno, pero tampoco hay confirmación de lo contrario. Constanza sabe que lo que decida en las próximas horas define la posición de la empresa si esto termina siendo una filtración.",
          "options": [
            "Determinar de inmediato las obligaciones aplicables por el tipo de datos involucrados, exigir formalmente por escrito a Sitec la información del incidente conforme al contrato, y preparar en paralelo la eventual notificación a los titulares y a la autoridad según lo que arroje el análisis.",
            "Determinar de inmediato las obligaciones aplicables por el tipo de datos involucrados y preparar la eventual notificación, pero esperar el informe forense definitivo antes de exigir formalmente a Sitec la información del incidente conforme al contrato.",
            "Exigir formalmente a Sitec la información del incidente conforme al contrato y preparar la eventual notificación a la autoridad, pero no incluir en esa preparación a los ciento ochenta trabajadores, ya que la notificación a titulares depende de una decisión posterior.",
            "Determinar las obligaciones aplicables y exigir formalmente a Sitec la información del incidente, pero declarar de inmediato ante el directorio que hubo una filtración confirmada de datos de los ciento ochenta trabajadores, para que la empresa no sea acusada después de haberlo ocultado."
          ],
          "explanations": [
            "Las obligaciones legales corren con plazos propios que no esperan al informe forense, y el requerimiento formal al proveedor asegura la información y la posición contractual desde el primer día.",
            "El requerimiento formal a Sitec asegura la evidencia y la posición contractual desde ahora; esperar el informe forense para recién exigirla puede dar tiempo a que la información del proveedor se pierda o se vuelva menos confiable.",
            "Preparar la eventual notificación a titulares en paralelo, sin enviarla todavía, es justamente lo que permite actuar rápido si el análisis confirma que corresponde; dejarla completamente fuera de la preparación retrasa esa vía si termina siendo necesaria.",
            "Todavía no hay confirmación de que se haya accedido efectivamente a los datos; declarar una filtración confirmada sin esa certeza compromete la posición de la empresa sobre hechos que el análisis aún no ha establecido."
          ],
          "mismatchContext": "Esta decisión le corresponde a legal porque involucra plazos normativos, obligaciones frente a titulares de datos y el uso de instrumentos contractuales que ni TI ni seguridad pueden ejercer.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · Cortar el cordón con el proveedor",
          "meta": [
            "00:35",
            "Jueves de madrugada",
            "Consola de VPN",
            "Bodegas en turno noche"
          ],
          "situation": "Andrés autoriza contener a las 00:35. Karen tiene la consola de la VPN abierta y la sesión de soporte_sitec sigue ahí, con el contador de tiempo corriendo.\n\nEl detalle que complica: el sistema de gestión de bodegas está corriendo el proceso nocturno de consolidación de inventario, y el turno de noche del centro de distribución trabaja con él hasta las 06:00. Si algo se cae, cuarenta personas se quedan sin sistema y la distribución de la mañana se atrasa.\n\nKaren pregunta si corta ahora o si espera a las seis. Andrés se queda callado dos segundos al teléfono. La sesión anómala, mientras tanto, acaba de intentar un cuarto acceso.",
          "options": [
            "Terminar la sesión activa y deshabilitar la cuenta soporte_sitec de inmediato, preservando los registros de la sesión y avisando al jefe de turno del centro de distribución que el sistema de bodegas sigue operativo pero sin soporte remoto externo hasta nuevo aviso.",
            "Terminar la sesión activa y deshabilitar la cuenta soporte_sitec de inmediato, preservando los registros, pero sin avisar al jefe de turno del centro de distribución, para no generar preguntas mientras se sigue investigando.",
            "Terminar la sesión activa de soporte_sitec y avisar al jefe de turno que el sistema sigue operativo, pero esperar hasta las 06:00, cuando termine el proceso nocturno, para deshabilitar formalmente la cuenta.",
            "Deshabilitar la cuenta soporte_sitec y preservar los registros de la sesión, pero cortar también el enlace VPN completo con todos los demás proveedores, como medida de precaución mientras se investiga el alcance real."
          ],
          "explanations": [
            "Cortar la sesión y la cuenta detiene el acceso sin tocar el sistema de bodegas, que sigue corriendo por su cuenta; el aviso al jefe de turno evita que la contención se lea como una falla.",
            "El jefe de turno necesita saber que el sistema de bodegas sigue operativo pero sin soporte remoto externo, porque si algo falla en el proceso nocturno va a intentar contactar a un proveedor que ya no tiene acceso; no avisarle puede convertir la contención en una sorpresa operativa a mitad de la noche.",
            "Terminar la sesión sin deshabilitar la cuenta deja la credencial disponible para que el atacante vuelva a iniciar sesión en cualquier momento antes de las 06:00; el corte real ocurre cuando la cuenta queda inhabilitada, no solo cuando se cierra la sesión activa.",
            "Cortar a todos los proveedores por un incidente localizado en una sola cuenta es una respuesta desproporcionada que detiene otras operaciones sin necesidad; aislar la cuenta comprometida ya contiene el acceso sin afectar a quienes no tienen relación con el caso."
          ],
          "mismatchContext": "La contención la ejecuta TI porque administra la plataforma de acceso remoto y las cuentas de terceros, y puede evaluar en el momento qué depende realmente de esa sesión.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Reabrir la puerta con reglas nuevas",
          "meta": [
            "Viernes 10:00",
            "Informe de Sitec",
            "Cuenta compartida",
            "Segmentación pendiente"
          ],
          "situation": "Viernes, 10:00. Sitec respondió: el notebook de uno de sus técnicos estaba infectado con un ladrón de credenciales y la contraseña de soporte_sitec, guardada en el navegador, salió por ahí. La misma clave la usaban cuatro personas y no cambiaba desde 2021.\n\nKaren revisó los registros de las tres semanas anteriores: no hay accesos anómalos previos, y los intentos contra Recursos Humanos fallaron todos. El daño quedó contenido. Pero el sistema de bodegas lleva treinta y cuatro horas sin soporte externo y el proveedor pide que le reactiven el acceso hoy mismo porque hay un ajuste pendiente.\n\nDiego, el jefe de turno, ya preguntó dos veces por el chat. La presión es reabrir. La pregunta es cómo.",
          "options": [
            "Reactivar el acceso con cuentas individuales por técnico, segundo factor obligatorio, permisos limitados solo al sistema de bodegas, ventana horaria y registro de sesión, condicionando la reapertura a que esos controles estén operativos.",
            "Crear cuentas individuales por técnico con segundo factor obligatorio y permisos limitados al sistema de bodegas, pero reactivar el acceso antes de tener lista la ventana horaria y el registro de sesión, para no seguir demorando al proveedor.",
            "Reactivar el acceso con cuentas individuales por técnico y segundo factor obligatorio, pero mantener los permisos amplios configurados en 2021, ya que ajustarlos ahora podría interrumpir alguna integración que Sitec no ha documentado.",
            "Reactivar el acceso con cuentas individuales, segundo factor obligatorio, permisos limitados y ventana horaria, pero sin condicionar la reapertura a que esos controles ya estén operativos, dejando que se terminen de implementar con el acceso ya reactivado."
          ],
          "explanations": [
            "La recuperación es la única oportunidad real de corregir la causa: cuenta compartida, sin segundo factor y con permisos excesivos; reabrir con controles evita repetir el mismo incidente.",
            "La ventana horaria y el registro de sesión son parte del mismo paquete de controles que corrige la causa raíz; reactivar sin ellos deja una versión a medias del nuevo esquema, con el mismo tipo de vacío de trazabilidad que permitió que el incidente pasara inadvertido tanto tiempo.",
            "Los permisos que excedían el sistema de bodegas fueron justamente lo que permitió que la sesión comprometida intentara llegar a Recursos Humanos; mantenerlos por temor a romper algo no documentado deja la causa raíz del incidente sin corregir.",
            "Reabrir antes de que los controles estén realmente en marcha equivale, en la práctica, a reabrir sin ellos por el tiempo que tome terminarlos; condicionar la reapertura es lo que asegura que el proveedor no vuelva a operar bajo las condiciones anteriores."
          ],
          "mismatchContext": "La recuperación del acceso la ejecuta TI porque debe crear las cuentas individuales, ajustar permisos y habilitar el segundo factor en la plataforma que administra.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "direccion",
          "title": "Acto 5 · Cuántos Sitec tenemos",
          "meta": [
            "Lunes 11:00",
            "Comité de gerencia",
            "Informe de cierre",
            "14 proveedores con acceso"
          ],
          "situation": "Lunes, 11:00. Felipe Domínguez, director de operaciones, tiene el informe de cierre y un anexo que Andrés preparó el domingo: catorce proveedores tienen acceso remoto a sistemas internos. Nueve usan cuentas compartidas. Once no tienen segundo factor. Ninguno de los catorce contratos incluye cláusula de notificación de incidentes.\n\nConstanza agrega que en cuatro casos ni siquiera está claro quién dentro de la empresa es el dueño del contrato. El incidente de Sitec se resolvió bien, pero solo porque Karen miró un panel a las 23:47 por costumbre, no porque hubiera un control funcionando.\n\nFelipe deja el informe sobre la mesa. En la sala están Andrés, Constanza y el gerente de operaciones. Todos esperan que diga algo.",
          "options": [
            "Aprobar un programa de gestión de riesgo de terceros con dueño designado, revisión de los catorce accesos existentes, exigencias mínimas de seguridad y cláusulas de notificación en todos los contratos, con plazos y presupuesto definidos y seguimiento en el comité.",
            "Aprobar el programa de gestión de riesgo de terceros con dueño designado y revisión de los catorce accesos existentes, pero dejar las cláusulas de notificación de incidentes para renegociar contrato por contrato a medida que cada uno se venza.",
            "Aprobar el programa de gestión de riesgo de terceros con exigencias mínimas de seguridad y plazos definidos, pero sin designar un dueño formal, ya que la revisión de los catorce accesos es un trabajo compartido entre TI y legal que no necesita un responsable único.",
            "Aprobar el programa de gestión de riesgo de terceros con dueño, plazos y presupuesto definidos, pero mantener el contrato con Sitec como estaba, sin aplicarle los nuevos controles, ya que ese caso ya se resolvió durante el incidente."
          ],
          "explanations": [
            "El incidente expuso un riesgo estructural, no puntual; convertirlo en un programa con dueño, plazo y presupuesto es la única decisión que evita que se repita con otro proveedor.",
            "Esperar el vencimiento natural de cada contrato para incorporar la cláusula de notificación puede tomar años según el proveedor; exigirla ahora, como condición para mantener el acceso vigente, es lo que cierra el vacío que este incidente mostró en los catorce.",
            "En cuatro de los catorce casos ni siquiera está claro quién dentro de la empresa es dueño del contrato; repetir esa falta de responsable único en el programa nuevo reproduce exactamente el problema que el informe acaba de destapar.",
            "Los controles nuevos —cuentas individuales, segundo factor, permisos acotados— se aplicaron de forma reactiva solo al acceso de Sitec; dejarlo fuera del programa formal significa que nadie revisa si esos controles se mantienen en el tiempo, a diferencia de los otros trece."
          ],
          "mismatchContext": "El cierre le corresponde a dirección porque implica comprometer presupuesto, exigir cambios contractuales a terceros y priorizar el trabajo entre áreas.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "insider": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · La carpeta que nadie abre a esa hora",
          "meta": [
            "21:47",
            "Martes",
            "Alerta DLP",
            "Servidor de archivos"
          ],
          "situation": "Camila Fuentes lleva media hora sola en la oficina de TI, con el ventilador del rack como única compañía. A las 21:47 la consola de DLP tira una alerta que ella nunca había visto en ese color: 1.842 archivos copiados desde la carpeta \"Comercial/Contratos\" en menos de once minutos.\n\nEl usuario es Rodrigo Salinas, ejecutivo de cuentas. Camila lo conoce de los asados de fin de año. Revisa el historial: en los últimos seis meses Rodrigo abrió esa carpeta cuatro veces. Esta noche la vació entera, y siguió con \"Precios 2026\" y \"Base de partners\".\n\nMientras mira la pantalla, Camila se acuerda de algo que escuchó en el café: Rodrigo renunció hace nueve días y le quedan tres de aviso. La sesión sigue activa. El contador de archivos sigue subiendo.",
          "options": [
            "Preservar los registros de la alerta y del servidor, documentar hora, usuario y archivos, y escalar de inmediato al encargado de seguridad por el canal definido, sin contactar al usuario",
            "Preservar los registros de la alerta y documentar hora, usuario y archivos, pero cortarle la sesión y bloquear la cuenta de Rodrigo de inmediato, antes de escalar al encargado de seguridad",
            "Documentar hora, usuario y archivos, y escalar de inmediato al encargado de seguridad, pero enviarle también un correo a Rodrigo confirmando que se detectó actividad inusual en su cuenta, para que quede formalmente notificado",
            "Escalar de inmediato al encargado de seguridad con la hora y el usuario involucrado, pero sin detallar todavía los nombres específicos de los archivos copiados, ya que esa lista completa se puede levantar con más calma al día siguiente"
          ],
          "explanations": [
            "La evidencia de una amenaza interna se pierde o se contamina en minutos: registrarla y escalarla por el canal formal protege el caso y le entrega la decisión a quien corresponde.",
            "Actuar sobre la cuenta antes de escalar deja la decisión de contención en manos de quien está de turno de noche, sin que Seguridad haya evaluado si conviene cortar ya o dejar la sesión un poco más para entender el alcance completo.",
            "Notificar al sospechoso antes de que el comité decida cómo proceder le da tiempo para borrar rastros, sacar el respaldo que le falta o preparar una explicación; esa comunicación no le corresponde al turno de noche ni debe ocurrir antes del escalamiento.",
            "Cuáles archivos exactos se copiaron —contratos, precios, base de partners— es justo lo que define la gravedad del caso para quien decide cómo proceder; dejar ese detalle para el día siguiente le resta a Seguridad la información que necesita esta misma noche."
          ],
          "mismatchContext": "Detectar, preservar y escalar la evidencia técnica es tarea de TI: es quien tiene acceso a los registros y al servidor. Decidir qué se hace con el trabajador no lo resuelve el turno de noche.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Ponerle nombre a lo que pasó",
          "meta": [
            "22:20",
            "Martes",
            "Llamada de escalamiento",
            "Comité de incidentes"
          ],
          "situation": "Valentina Ríos contesta el teléfono en pijama y con el notebook apoyado en la mesa del comedor. Camila le lee la lista: contratos, precios, base de partners. Valentina abre el detalle y ve algo que Camila no alcanzó a mirar: los archivos no solo se copiaron a la estación local, hay un dispositivo USB montado a las 21:39.\n\nEn el chat interno alguien ya está preguntando \"¿pasó algo con el file server?\". Valentina cierra el chat. Sabe que lo que decida en los próximos veinte minutos define si esto es un caso manejable o un ruido que se filtra por toda la empresa antes del desayuno.\n\nTiene el procedimiento abierto en otra ventana. La casilla de clasificación está en blanco y todo el resto del protocolo depende de lo que escriba ahí.",
          "options": [
            "Clasificarlo como incidente de amenaza interna con compromiso de información confidencial, activar el comité en modalidad reservada y convocar a legal, RR.HH. y dirección",
            "Clasificarlo como incidente de amenaza interna con compromiso de información confidencial y activar el comité, pero convocarlo de forma abierta en el canal general de incidentes, ya que la reserva no es necesaria porque el trabajador ya está en proceso de salida",
            "Clasificarlo como incidente de amenaza interna con compromiso de información confidencial, y convocar a legal y dirección en modalidad reservada, pero dejar fuera a RR.HH. por ahora, ya que el caso todavía es principalmente un tema de seguridad de la información",
            "Clasificarlo como incidente de amenaza interna y convocar al comité en modalidad reservada con legal, RR.HH. y dirección, pero recién a primera hora de la mañana, ya que a esta hora de la noche no tiene sentido despertar a tanta gente por un caso que puede esperar unas horas"
          ],
          "explanations": [
            "La clasificación correcta activa las funciones que sí pueden resolver: legal define el marco, RR.HH. el vínculo laboral y dirección las consecuencias. La reserva evita alertar al involucrado.",
            "La reserva no depende de si el trabajador sigue o no en la empresa: convocar en un canal abierto expone el caso a comentarios y especulación antes de que exista una decisión formal, y puede llegar a oídos de Rodrigo antes de que el comité defina cómo proceder.",
            "El vínculo laboral de Rodrigo, sus accesos vigentes y los pasos de una entrevista formal son justamente terreno de RR.HH.; dejarlo fuera de la convocatoria inicial retrasa una pieza que el comité va a necesitar de todas formas en las próximas horas.",
            "La sesión de Rodrigo sigue activa y el contador de archivos copiados sigue subiendo mientras se espera; cada hora que pasa es una hora más de copia con el USB montado, y el comité reservado existe justamente para poder convocarse fuera de horario."
          ],
          "mismatchContext": "Clasificar el incidente y activar el comité es responsabilidad de seguridad, que es quien sostiene el criterio de riesgo; TI aporta los datos técnicos pero no define la categoría ni convoca a las áreas.",
          "correctIndex": 0
        },
        {
          "target": "legal",
          "title": "Acto 2 · El marco antes del impulso",
          "meta": [
            "23:05",
            "Martes",
            "Videollamada de comité",
            "Contratos y NDA"
          ],
          "situation": "Andrés Covarrubias entra a la videollamada con la cámara apagada y el contrato de Rodrigo Salinas ya descargado. Valentina le resume en tres minutos: copia masiva, USB, renuncia con fecha de término el viernes.\n\nAlguien en la llamada propone mandarle una carta esta misma noche para asustarlo. Otro dice que mejor esperar, que \"total todavía no pasa nada\". Andrés mira la cláusula de confidencialidad, la política de uso aceptable firmada en 2024, y piensa en algo que nadie ha mencionado: si la evidencia no está bien tomada, ninguna de las dos sirve de nada.",
          "options": [
            "Fijar el marco: confirmar qué obligaciones de confidencialidad aplican, instruir cadena de custodia sobre logs y equipos, y definir qué acciones laborales y judiciales quedan disponibles según la evidencia",
            "Confirmar qué obligaciones de confidencialidad aplican e instruir la cadena de custodia sobre logs y equipos, pero enviar en paralelo una carta de advertencia al trabajador esa misma noche, para dejar constancia formal de que la empresa detectó la situación",
            "Fijar el marco de confidencialidad y cadena de custodia, y definir qué acciones laborales y judiciales quedan disponibles, pero avanzar directamente hacia una denuncia penal con la evidencia que hay hasta ahora, sin esperar el resultado del análisis forense",
            "Instruir la cadena de custodia sobre logs y equipos y confirmar las obligaciones de confidencialidad aplicables, pero dejar la decisión sobre acciones laborales y judiciales para después del viernes, cuando el trabajador ya no tenga vínculo con la empresa"
          ],
          "explanations": [
            "Sin cadena de custodia la evidencia es impugnable y la empresa pierde tanto la vía laboral como la penal; definir el marco primero es lo que hace viable todo lo demás.",
            "Una carta esa misma noche le confirma a Rodrigo que está siendo investigado y le da la oportunidad de destruir el USB o alterar algo antes de cualquier diligencia; la constancia formal se deja mediante la cadena de custodia, no avisándole directamente.",
            "Denunciar antes de que el análisis forense valide la evidencia puede debilitar el caso si después aparecen matices; definir las vías disponibles no es lo mismo que activarlas de inmediato sin haber asegurado primero que la evidencia sostiene la acusación.",
            "Algunas acciones laborales dependen de que el vínculo siga vigente; esperar a que termine el contrato el viernes puede cerrar opciones que solo están disponibles mientras Rodrigo sigue siendo trabajador de la empresa."
          ],
          "mismatchContext": "Definir qué se puede exigir, con qué evidencia y por qué vía es competencia exclusiva de legal; seguridad describe el hecho técnico y RR.HH. administra el vínculo, pero ninguno fija el marco jurídico.",
          "correctIndex": 0
        },
        {
          "target": "rrhh",
          "title": "Acto 2 · Tres días de contrato",
          "meta": [
            "23:30",
            "Martes",
            "Videollamada de comité",
            "Ficha del trabajador"
          ],
          "situation": "Paula Meneses revisa la ficha de Rodrigo Salinas mientras la llamada sigue. Renuncia presentada el 4, término el viernes 15. Tiene notebook, teléfono corporativo, acceso al CRM y una firma pendiente en el finiquito.\n\nEl jefe comercial, que se acaba de sumar a la llamada, dice que él lo llama al tiro, que se conocen hace años y que \"esto se aclara en dos minutos\". Paula lo frena. Sabe que una conversación mal armada, sin abogado y sin acta, puede transformar un caso sólido en un despido impugnable.",
          "options": [
            "Confirmar fechas, accesos vigentes y entregables pendientes, y coordinar con legal una entrevista formal con acta, sin que nadie contacte al trabajador antes",
            "Confirmar fechas, accesos vigentes y entregables pendientes, y coordinar con legal una entrevista formal con acta, pero adelantarla a esta misma noche antes de tener lista la cadena de custodia de la evidencia",
            "Confirmar fechas, accesos vigentes y entregables pendientes, pero dejar que el jefe comercial, que conoce a Rodrigo hace años, sea quien coordine el contacto inicial para la entrevista formal, ya que tiene mejor llegada con él",
            "Confirmar fechas, accesos vigentes y entregables pendientes, y coordinar con legal la entrevista formal, pero esperar a realizarla el jueves, un día antes del término del contrato, para dar tiempo a preparar bien el acta"
          ],
          "explanations": [
            "Los datos del vínculo laboral determinan qué accesos siguen vivos y qué se puede exigir; la entrevista con acta y con legal presente es la única que sostiene una consecuencia posterior.",
            "Una entrevista formal sin que la evidencia esté todavía asegurada por la cadena de custodia puede alertar a Rodrigo mientras la copia sigue en curso; el orden correcto es primero contener y preservar, y después citar a la entrevista con todo ya resguardado.",
            "El jefe comercial no tiene el rol ni el entrenamiento para conducir un contacto que puede terminar en una acción laboral o judicial; una conversación informal, aunque bienintencionada, contamina el proceso y le avisa al involucrado antes de tiempo.",
            "Cada día que pasa sin la entrevista formal es un día más de accesos vigentes y posible actividad adicional; preparar bien el acta no requiere esperar hasta el jueves, se puede coordinar con la misma urgencia que el resto del comité."
          ],
          "mismatchContext": "El estado del vínculo laboral, los accesos asociados al cargo y la conducción de una entrevista formal son competencia de RR.HH.; TI puede ver la cuenta, pero no la relación contractual detrás.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · Cerrar la puerta sin romper la casa",
          "meta": [
            "00:15",
            "Miércoles",
            "Instrucción del comité",
            "Cuentas y accesos"
          ],
          "situation": "Camila lleva cuatro horas despierta más de lo que planeaba. La instrucción llega por escrito desde Valentina: contener ahora, sin destruir nada. Rodrigo sigue con sesión activa en el VPN y con el correo abierto en el teléfono.\n\nEn la pizarra Camila anota lo que existe: cuenta de dominio, VPN, CRM, correo, un token de aplicación que nadie recordaba, y el notebook corporativo que todavía está en su casa en Ñuñoa.\n\nEl equipo de guardia le pregunta si borran la cuenta y listo. Camila se queda mirando la lista y sabe que \"borrar y listo\" es lo que le van a reprochar en dos semanas.",
          "options": [
            "Revocar sesiones activas y accesos en todos los sistemas de forma simultánea, deshabilitando la cuenta sin eliminarla, y dejar registrada la hora de cada acción",
            "Revocar sesiones activas y deshabilitar la cuenta sin eliminarla en la mayoría de los sistemas, pero dejar el token de aplicación que nadie recordaba para revisarlo con más calma al día siguiente, ya que no aparece en la lista principal de accesos",
            "Revocar sesiones activas y accesos en todos los sistemas de forma simultánea y dejar registrada la hora de cada acción, pero eliminar directamente el buzón de correo, ya que ahí es donde podría seguir recibiendo información sensible",
            "Revocar sesiones activas y deshabilitar la cuenta de dominio, VPN, CRM y correo de forma simultánea, pero dejar el registro de la hora de cada acción para completarlo en el informe del día siguiente, ya que lo urgente ahora es cortar el acceso"
          ],
          "explanations": [
            "Deshabilitar preserva buzón, permisos y registros como evidencia; hacerlo simultáneo evita que un acceso olvidado deje la puerta abierta mientras se cierran las otras.",
            "Un token de aplicación olvidado puede seguir dando acceso programático aunque la cuenta principal quede deshabilitada; dejarlo para 'mañana' es exactamente el tipo de acceso residual que una contención simultánea busca evitar.",
            "Eliminar el buzón borra justo la evidencia que legal necesita para sostener el caso —qué se envió, a quién, cuándo—; deshabilitarlo sin eliminarlo preserva esa información mientras corta el acceso igual de efectivamente.",
            "Sin el registro de la hora exacta de cada acción, después es difícil reconstruir qué pudo alcanzar a hacer Rodrigo entre una revocación y otra; anotarlo en el momento, no al día siguiente, es lo que sostiene esa línea de tiempo."
          ],
          "mismatchContext": "Ejecutar la revocación técnica de accesos en cada sistema es de TI; seguridad ordena la contención y legal define qué se preserva, pero las manos en la consola son las de TI.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Medir el hoyo, no taparlo con tierra",
          "meta": [
            "09:40",
            "Miércoles",
            "Reunión de seguimiento",
            "Permisos y respaldos"
          ],
          "situation": "Camila llega a la oficina con la misma ropa de ayer y un café doble. La cuenta está deshabilitada, el notebook llega a las once con un acta de recepción. Nadie más ha tocado el servidor.\n\nEn la reunión de las 9:40 el gerente comercial pregunta lo obvio: \"¿qué se llevó exactamente?\". Camila no tiene la respuesta todavía. Lo que sí tiene, y le molesta, es el hallazgo del análisis preliminar: Rodrigo tenía permiso de lectura sobre \"Precios 2026\" desde un proyecto que terminó en 2024 y que nadie revocó.\n\nEse permiso no era suyo hace dos años. Y hay otros catorce usuarios en la misma situación.",
          "options": [
            "Reconstruir el alcance exacto de lo copiado y su destino, y en paralelo corregir los permisos heredados de las carpetas críticas validando con los dueños de cada información",
            "Reconstruir el alcance exacto de lo copiado y su destino, pero dejar la corrección de los permisos heredados de las carpetas críticas para una revisión general de permisos que se haga más adelante con calma",
            "Corregir los permisos heredados de las carpetas críticas validando con los dueños de cada información, pero no reconstruir el alcance exacto de lo copiado, ya que la cuenta ya está deshabilitada y el riesgo inmediato quedó controlado",
            "Reconstruir el alcance exacto de lo copiado y corregir los permisos heredados, pero aplicar la corrección de permisos sin validar antes con los dueños de cada carpeta, para no demorar el cierre de la brecha con reuniones adicionales"
          ],
          "explanations": [
            "Recuperar aquí es doble: saber qué información salió para dimensionar el daño y cerrar la causa raíz, que es el permiso heredado que nadie revocó.",
            "El permiso heredado que tenía Rodrigo es la causa raíz de que pudiera copiar 'Precios 2026' sin que nadie lo revocara a tiempo; postergar esa corrección deja a los otros catorce usuarios en la misma situación mientras se define 'más adelante'.",
            "Sin reconstruir qué se copió y hacia dónde, la empresa no puede dimensionar el daño real ni decidir con criterio los siguientes pasos legales; que la cuenta esté deshabilitada resuelve el acceso, no la pregunta de qué salió.",
            "Ajustar permisos sin que el dueño de la información confirme quién debería tener acceso puede cortar accesos legítimos que sí se necesitan operativamente; esa validación es lo que evita reemplazar un problema de seguridad por uno operativo."
          ],
          "mismatchContext": "Dimensionar técnicamente lo ocurrido y corregir la configuración de permisos es de TI, que administra el servidor; los dueños de la información validan, pero no ejecutan el cambio.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "direccion",
          "title": "Acto 5 · Lo que se firma queda",
          "meta": [
            "16:00",
            "Viernes",
            "Comité de cierre",
            "Informe de incidente"
          ],
          "situation": "Fernando Larraín tiene sobre la mesa el informe de once páginas y un café frío. Rodrigo Salinas firmó su finiquito esta mañana con el abogado de la empresa presente y devolvió el USB; el peritaje confirma que no hubo copia a la nube ni envío a terceros.\n\nAlrededor de la mesa cada uno trae su versión: TI quiere presupuesto, legal quiere una decisión sobre acciones judiciales, RR.HH. quiere revisar el proceso de salida, y el gerente comercial quiere que esto no se hable más.\n\nFernando sabe que la reunión termina en cuarenta minutos y que lo que no quede escrito hoy no va a existir el lunes.",
          "options": [
            "Aprobar formalmente el informe, decidir con legal el curso de las acciones, y dejar comprometidas las medidas correctivas con responsable, plazo y presupuesto asignados",
            "Aprobar formalmente el informe y decidir con legal el curso de las acciones, pero dejar las medidas correctivas —revisión de permisos heredados, proceso de desvinculación— sin presupuesto asignado, ya que se pueden resolver con el equipo existente",
            "Aprobar el informe y comprometer las medidas correctivas con responsable, plazo y presupuesto, pero decidir el curso de las acciones legales sin involucrar a legal en esa decisión final, ya que dirección ya tiene el resumen completo del caso",
            "Aprobar formalmente el informe y comprometer las medidas correctivas con responsable y presupuesto, pero sin fijar un plazo concreto, dejando que cada área lo estime según su propia carga de trabajo"
          ],
          "explanations": [
            "El cierre solo vale si deja decisiones tomadas y compromisos con nombre, fecha y plata; eso es lo único que la dirección puede entregar y que nadie más puede.",
            "Resolver 'con el equipo existente' es la misma lógica que dejó el permiso heredado sin revocar durante dos años; sin presupuesto y plazo explícitos, estas correcciones compiten con la operación diaria y tienden a perderse.",
            "El curso de las acciones judiciales o laborales depende de criterios técnicos que legal maneja mejor que dirección; tomar esa decisión sin su participación directa en el momento final puede dejar fuera consideraciones que cambian el resultado.",
            "Sin un plazo fijado desde dirección, cada área tiende a priorizar su operación diaria por sobre una corrección que no tiene fecha; el plazo concreto es lo que convierte el compromiso en algo exigible."
          ],
          "mismatchContext": "Aprobar el cierre, comprometer presupuesto y decidir el curso de las acciones son atribuciones de dirección; ninguna de las otras funciones puede asignar recursos ni asumir el riesgo residual.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "exfiltracion": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · Catorce gigas hacia ninguna parte",
          "meta": [
            "03:12",
            "Domingo",
            "Monitoreo de red",
            "Base de datos de clientes"
          ],
          "situation": "Karla Sepúlveda está de turno en el NOC y la única luz encendida es la del muro de monitores. A las 03:12 el gráfico de tráfico saliente, que a esa hora suele ser una línea plana, se levanta como un muro: 14,2 GB en cuarenta minutos.\n\nEl origen no es un notebook cualquiera. Es el servidor de la base de datos de clientes. El destino es una IP que Karla nunca ha visto, alojada fuera del país, y la conexión sigue abierta.\n\nAbre la consulta de sesiones y ve el nombre de una cuenta de servicio que debería correr solo respaldos internos. Karla siente ese frío específico de darse cuenta de que está mirando algo que ya lleva rato pasando.",
          "options": [
            "Registrar la evidencia del flujo, la IP destino y la cuenta involucrada, y activar de inmediato el escalamiento a seguridad por el canal de guardia",
            "Registrar la evidencia del flujo, la IP destino y la cuenta involucrada, pero bloquear la IP en el firewall antes de escalar a seguridad, para cortar la transferencia mientras se espera que alguien conteste el canal de guardia",
            "Activar de inmediato el escalamiento a seguridad por el canal de guardia, pero registrar solo la IP destino y la hora, sin identificar todavía la cuenta de servicio involucrada, ya que eso requiere cruzar varios logs y puede esperar al reporte completo",
            "Registrar la evidencia del flujo, la IP destino y la cuenta involucrada, y escalar a seguridad por el canal de guardia, pero esperar primero a que la transferencia termine para tener el volumen final exacto antes de avisar"
          ],
          "explanations": [
            "La evidencia del flujo activo es efímera y el escalamiento de guardia existe precisamente para las 03:12; con eso seguridad puede clasificar y ordenar contención en minutos.",
            "Bloquear antes de escalar corta ese destino puntual, pero el atacante puede tener otras rutas, y decidir eso sin que Seguridad lo sepa deja al incidente avanzando sin nadie evaluando el alcance completo; escalar primero permite decidir la contención con criterio.",
            "La cuenta de servicio involucrada es justamente el dato que permite a Seguridad dimensionar el alcance —qué más podría tocar esa cuenta—; dejarlo fuera del escalamiento inicial retrasa una pieza clave de la clasificación.",
            "Esperar a que termine la transferencia para escalar regala minutos exactos a una fuga que sigue activa; el volumen final se puede confirmar después, pero la decisión de contener no debería depender de tener esa cifra cerrada."
          ],
          "mismatchContext": "Detectar el flujo anómalo, preservar la evidencia de red y escalar corresponde a TI, que opera el monitoreo; la decisión sobre el alcance y las obligaciones no se toma en el turno.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Qué salió y de quién es",
          "meta": [
            "03:35",
            "Domingo",
            "Guardia de seguridad",
            "Datos personales de clientes"
          ],
          "situation": "Matías Bravo se conecta desde su casa en Maipú con el pelo mojado y el computador todavía arrancando. Karla le pasa lo que tiene. Matías cruza la cuenta de servicio con las tablas consultadas y le aparece lo que temía: nombres, RUT, correos, direcciones de despacho y el historial de compras de una porción grande de la cartera.\n\nNo es un servidor de pruebas. No es un respaldo interno. Y la ventana de tiempo dice que esto empezó a las 02:31, no ahora.\n\nEn la ficha del incidente hay un campo que decide todo lo que viene: severidad y tipo de dato comprometido. Matías sabe que si lo baja de nivel para no despertar a nadie un domingo, el lunes va a ser mucho peor.",
          "options": [
            "Clasificarlo como incidente crítico con compromiso confirmado de datos personales de clientes, activar el comité de crisis y convocar a legal, comunicaciones y dirección",
            "Clasificarlo como incidente crítico con compromiso confirmado de datos personales de clientes y activar el comité de crisis, pero convocar solo a legal por ahora, dejando comunicaciones y dirección para cuando haya más claridad sobre el alcance",
            "Clasificarlo como incidente crítico con compromiso confirmado de datos personales, pero mantenerlo dentro de seguridad y TI mientras se confirma con exactitud cuántos registros fueron afectados, antes de convocar al comité completo",
            "Clasificarlo como incidente crítico con compromiso confirmado de datos personales y activar el comité de crisis, pero ordenar en el mismo momento el aviso a todos los clientes afectados por correo masivo, para no perder tiempo"
          ],
          "explanations": [
            "El tipo de dato comprometido, no el uso posterior, define la severidad y gatilla las obligaciones legales y contractuales; la clasificación correcta despierta a quien tiene que decidir.",
            "Convocar de a poco retrasa exactamente lo que un comité de crisis busca evitar: que cada función evalúe su frente en paralelo desde el inicio. Comunicaciones necesita tiempo para preparar mensajes y dirección para decidir recursos, no pueden sumarse después.",
            "El tipo de dato comprometido ya está confirmado —nombres, RUT, direcciones, historial de compras—; esperar el número exacto de registros para convocar al comité completo retrasa decisiones que no dependen de esa cifra.",
            "La severidad es correcta, pero el contenido, la forma y el momento de la notificación a clientes los define legal en conjunto con comunicaciones; un correo masivo improvisado a las tres de la madrugada puede agravar el daño reputacional en vez de contenerlo."
          ],
          "mismatchContext": "Asignar severidad y activar el comité de crisis es de seguridad; TI aporta el detalle técnico y legal define las obligaciones, pero la clasificación del incidente parte acá.",
          "correctIndex": 0
        },
        {
          "target": "legal",
          "title": "Acto 2 · El reloj que ya está corriendo",
          "meta": [
            "04:20",
            "Domingo",
            "Comité de crisis",
            "Obligaciones con clientes"
          ],
          "situation": "Ignacia Vergara entra a la sala virtual con la libreta y el listado de contratos marco de los cinco clientes más grandes. Matías le confirma el tipo de dato: identificadores, contacto y comportamiento de compra de personas naturales.\n\nEn la llamada alguien sugiere esperar a tener el número exacto de registros antes de avisar a nadie, \"para no quedar como que exageramos\". Ignacia anota la hora en la que se dijo eso. Sabe que la exactitud es deseable, pero que los plazos de notificación no esperan a que el número esté redondo.",
          "options": [
            "Determinar qué obligaciones de notificación aplican según la ley de datos personales y los contratos con clientes, fijar los plazos y ordenar la preservación formal de la evidencia",
            "Determinar las obligaciones de notificación según la ley y los contratos, y ordenar la preservación formal de evidencia, pero fijar los plazos recién cuando se tenga el conteo definitivo de registros afectados, para comunicar una cifra exacta",
            "Determinar qué obligaciones de notificación aplican y fijar los plazos correspondientes, pero dejar la preservación formal de la evidencia a criterio de TI, ya que es un tema técnico que no requiere instrucción legal específica",
            "Determinar las obligaciones de notificación aplicables y ordenar la preservación de evidencia, pero delegar en el área comercial el primer contacto informal con los cinco clientes más grandes, mientras se prepara la notificación formal"
          ],
          "explanations": [
            "Los plazos de notificación se cuentan desde que se toma conocimiento, no desde que el conteo es exacto; fijarlos temprano evita el incumplimiento y ordena todo lo demás.",
            "Los plazos de notificación se cuentan desde que se toma conocimiento del incidente, no desde que el conteo está cerrado; fijarlos condicionados a esa cifra exacta puede dejar la empresa fuera de plazo mientras el conteo sigue en curso.",
            "Sin una instrucción formal de preservación, la evidencia puede manejarse sin el estándar que después se necesita para sostener el caso ante una autoridad o un cliente; ese resguardo formal es justamente lo que legal debe ordenar, no dejar a criterio técnico.",
            "Un contacto informal y anticipado, aunque sea solo con los clientes grandes, puede adelantar una versión de los hechos distinta a la que después contendrá la notificación formal; el mensaje debe salir una sola vez, ya validado, no en dos tiempos distintos."
          ],
          "mismatchContext": "Determinar obligaciones de notificación, plazos y preservación de evidencia es competencia de legal; seguridad establece los hechos y comunicaciones redacta, pero el marco lo fija el abogado.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · Cortar el caño sin volar la casa",
          "meta": [
            "04:50",
            "Domingo",
            "Orden del comité",
            "Servidor de base de datos"
          ],
          "situation": "La orden le llega a Karla por escrito y con firma: contener ahora, preservar todo. La transferencia sigue abierta y va en 21 GB.\n\nKarla tiene el diagrama de red proyectado. El servidor atiende también el portal de pedidos, que a las ocho de la mañana empieza a recibir tráfico real. Si lo apaga, el lunes parte con la operación caída. Si lo deja como está, se siguen yendo datos de clientes.\n\nSu jefe le escribe desde el auto: \"lo que decidas, déjalo escrito\".",
          "options": [
            "Bloquear el tráfico saliente hacia la IP y hacia destinos no autorizados, aislar el servidor de la red manteniéndolo encendido, y rotar las credenciales de la cuenta de servicio comprometida",
            "Bloquear el tráfico saliente hacia la IP y destinos no autorizados, y aislar el servidor manteniéndolo encendido, pero dejar la rotación de la credencial de la cuenta de servicio comprometida para después de que el comité confirme el alcance completo",
            "Aislar el servidor de la red manteniéndolo encendido y rotar las credenciales de la cuenta de servicio comprometida, pero bloquear solo la IP destino conocida, dejando pasar el resto del tráfico saliente por si hay procesos legítimos que dependen de él",
            "Aislar el servidor de la red manteniéndolo encendido y bloquear el tráfico saliente hacia destinos no autorizados, pero reiniciar el servicio de base de datos antes de rotar las credenciales, para asegurarse de que el aislamiento realmente esté surtiendo efecto"
          ],
          "explanations": [
            "Aislar sin apagar corta la fuga y conserva memoria, sesiones y evidencia; rotar la credencial comprometida impide que el atacante vuelva por la misma puerta.",
            "Mientras la credencial comprometida siga vigente, sigue siendo válida para que el atacante intente usarla desde otro punto; rotarla no depende de tener el alcance completo confirmado, es una acción que se ejecuta en paralelo al aislamiento.",
            "Dejar pasar tráfico saliente 'por si acaso' es exactamente el resquicio que permite que la fuga continúe por otra ruta; el aislamiento completo del tráfico no autorizado es lo que corta la fuga mientras se identifican los procesos legítimos que sí deben mantenerse.",
            "Reiniciar antes de rotar las credenciales no aporta ninguna confirmación adicional sobre el aislamiento y sí arriesga perder sesiones y memoria que forman parte de la evidencia; el orden correcto es aislar y rotar, sin necesidad de ese reinicio intermedio."
          ],
          "mismatchContext": "La ejecución técnica del aislamiento, el bloqueo y la rotación de credenciales es de TI, que opera la infraestructura; seguridad ordena contener pero no toca los equipos.",
          "correctIndex": 0
        },
        {
          "target": "comunicaciones",
          "title": "Acto 3 · Antes de que lo cuente otro",
          "meta": [
            "06:15",
            "Domingo",
            "Comité de crisis",
            "Clientes y medios"
          ],
          "situation": "Tomás Riquelme lleva una hora escribiendo y borrando el mismo párrafo. A las 06:15 le llega un pantallazo: en un foro técnico alguien publicó un aviso de venta de una base de datos con \"clientes de retail chileno\". No menciona a la empresa. Todavía.\n\nEl gerente comercial le insiste por privado que publique algo ahora, cualquier cosa, \"para adelantarnos\". Ignacia, la abogada, le acaba de decir que el alcance exacto no estará confirmado hasta la tarde. Tomás tiene dos presiones tirando para lados opuestos y un teléfono que va a empezar a sonar cuando abran las oficinas.",
          "options": [
            "Preparar y validar con legal un mensaje base con los hechos confirmados, designar una vocería única y tener listos los guiones para clientes, personal y medios, sin publicar hasta la autorización del comité",
            "Preparar y validar con legal un mensaje base con los hechos confirmados y designar una vocería única, pero publicarlo de inmediato en cuanto quede listo, sin esperar la autorización formal del comité, para adelantarse al foro donde ya circula el aviso",
            "Preparar el mensaje base con los hechos confirmados y los guiones para clientes y personal, pero designar vocerías distintas para clientes y para medios, ya que cada público requiere un tono y un nivel de detalle diferente",
            "Preparar y validar con legal el mensaje base y los guiones, pero mientras se espera la autorización del comité, dejar que el área de atención a clientes responda de forma genérica sin usar todavía ninguno de esos guiones preparados"
          ],
          "explanations": [
            "Tener el mensaje listo y validado permite responder en minutos cuando el comité autorice, sin improvisar ni comprometer a la empresa con afirmaciones que después se caen.",
            "Publicar sin la autorización del comité, aunque el mensaje ya esté validado por legal, salta el paso que confirma que toda la información sigue siendo correcta en el momento exacto de publicar; el comité es quien decide el instante, no solo el contenido.",
            "Dos vocerías distintas, aunque manejen guiones parecidos, pueden terminar diciendo cosas ligeramente distintas frente a la misma pregunta; una vocería única es lo que garantiza que la versión sea exactamente la misma sin importar quién la entregue.",
            "Que atención a clientes responda 'de forma genérica' sin el guion preparado, mientras el mensaje oficial ya existe, abre la puerta a que digan algo inconsistente con lo que se va a publicar apenas se autorice; el guion debería estar disponible para ellos desde que está listo, no solo después de publicarse."
          ],
          "mismatchContext": "Construir el mensaje, definir vocería y preparar los guiones es de comunicaciones; legal valida el contenido y dirección autoriza, pero nadie más arma el relato.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Volver a levantar sin volver a caer",
          "meta": [
            "14:00",
            "Domingo",
            "Sala de guerra",
            "Portal de pedidos"
          ],
          "situation": "Karla lleva once horas conectada. El servidor está aislado, la fuga se detuvo en 23,4 GB y el análisis ya identificó por dónde entraron: la cuenta de servicio tenía una contraseña de 2021 y acceso remoto habilitado desde cualquier origen.\n\nEl lunes a las ocho tiene que haber portal de pedidos. El gerente de operaciones lo repite cada media hora como un metrónomo.\n\nEn la pizarra hay dos columnas: \"lo que hay que arreglar\" y \"lo que hay que probar\". La segunda columna es la que nadie quiere leer.",
          "options": [
            "Levantar el servicio en una instancia reconstruida y verificada, con las credenciales rotadas y el acceso remoto restringido, y monitorear tráfico saliente de forma reforzada antes de abrir al público",
            "Levantar el servicio en una instancia reconstruida y verificada, con las credenciales rotadas, pero mantener el acceso remoto abierto desde cualquier origen mientras se termina de ajustar la configuración de restricción, para no atrasar la apertura del lunes",
            "Levantar el servicio en una instancia reconstruida con las credenciales rotadas y el acceso remoto restringido, pero abrir al público antes de que el monitoreo reforzado de tráfico saliente esté funcionando, para no perder más horas de operación",
            "Reconstruir la instancia del servicio y rotar las credenciales, pero restringir el acceso remoto solo después de la apertura al público del lunes, evaluando primero si el volumen de pedidos requiere mantenerlo más abierto"
          ],
          "explanations": [
            "Reconstruir sobre una base verificada y con la causa raíz cerrada es lo único que evita que el mismo acceso se reutilice apenas el servicio vuelva a estar expuesto.",
            "El acceso remoto abierto desde cualquier origen fue justamente la condición que permitió el acceso inicial; dejarlo así 'mientras se ajusta' reproduce la misma puerta que se acaba de cerrar en el servidor comprometido.",
            "Sin el monitoreo reforzado activo, una segunda fuga por el mismo camino podría pasar inadvertida igual que la primera hasta que alguien la note por casualidad; ese monitoreo es parte de la validación previa a abrir, no un ajuste posterior.",
            "Abrir al público antes de restringir el acceso remoto dejaría el servicio nuevo expuesto con la misma configuración que permitió la fuga original, aunque sea por unas horas; la restricción debe estar activa desde el primer minuto en producción, no evaluarse después."
          ],
          "mismatchContext": "Reconstruir, endurecer y validar el servicio antes de reabrirlo es tarea de TI; el negocio fija la urgencia y seguridad los criterios, pero la ejecución técnica es de infraestructura.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "direccion",
          "title": "Acto 5 · La cuenta que hay que pagar",
          "meta": [
            "10:00",
            "Jueves",
            "Comité ejecutivo",
            "Informe y notificaciones"
          ],
          "situation": "Cecilia Toro entra a la sala con el informe final y la lista de clientes notificados. Cuatro días después, el portal opera normal, dos clientes grandes pidieron una reunión y uno pidió una auditoría independiente.\n\nEl informe es incómodo en un punto específico: la cuenta de servicio con contraseña de 2021 estaba levantada como hallazgo desde la revisión del año pasado, con prioridad media y sin responsable asignado.\n\nCecilia mira la mesa. Todos leyeron ese párrafo y nadie lo ha mencionado.",
          "options": [
            "Aprobar el informe, asumir formalmente el riesgo residual y comprometer el plan de remediación con responsables, plazos y presupuesto, incluyendo el tratamiento de hallazgos pendientes",
            "Aprobar el informe y comprometer el plan de remediación con responsables y plazos, pero dejar el hallazgo de la cuenta de servicio con contraseña de 2021 fuera del plan formal, ya que ya quedó corregido durante la contención del incidente",
            "Aprobar el informe y asumir formalmente el riesgo residual, pero definir el presupuesto del plan de remediación recién en el próximo ciclo presupuestario, ya que comprometer fondos adicionales ahora requeriría reabrir el presupuesto anual ya aprobado",
            "Aprobar el informe y comprometer el plan de remediación con responsables y plazos, pero asignar el presupuesto solo para las correcciones nuevas que salieron de este incidente, sin incluir el tratamiento de otros hallazgos pendientes de revisiones anteriores"
          ],
          "explanations": [
            "El cierre ejecutivo vale por lo que compromete: sin responsable, plazo y plata, el hallazgo de este informe termina igual que el del año pasado.",
            "Que esa credencial específica ya se haya rotado no corrige el proceso que dejó ese hallazgo con prioridad media y sin responsable durante un año; sin incorporarlo al plan formal, el próximo hallazgo similar puede quedar exactamente en la misma situación.",
            "Esperar al próximo ciclo presupuestario dilata la corrección de un hallazgo que ya llevaba un año pendiente sin plata ni dueño asignado; comprometer los recursos ahora, aunque implique un ajuste, es lo que realmente cambia la situación de fondo.",
            "Dejar fuera los hallazgos pendientes de revisiones anteriores dentro del mismo tipo de sistema repite la lógica que llevó a este incidente: una cuenta de servicio con contraseña de 2021 que nadie priorizó a tiempo; el plan debe incluir ese arrastre, no solo lo nuevo."
          ],
          "mismatchContext": "Asumir el riesgo residual, aprobar presupuesto y comprometer plazos son decisiones que solo puede tomar la dirección; ninguna función operativa puede autoasignarse recursos.",
          "correctIndex": 0
        }
      ]
    }
  ],
  "ransomware": [
    {
      "stage": "Detección",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 1 · Los archivos que cambiaron de nombre",
          "meta": [
            "11:20",
            "Jueves",
            "Mesa de ayuda",
            "Servidor de negocio"
          ],
          "situation": "Nicolás Peña atiende el tercer ticket de la mañana cuando entra el cuarto, y el quinto, en un minuto. Todos dicen lo mismo con distintas palabras: \"no me abren los archivos\", \"me aparece un nombre raro\".\n\nAbre la carpeta compartida de contabilidad. Cada archivo termina en una extensión que no existía ayer y en la raíz hay un documento de texto que se llama LEEME. Lo abre. Está en inglés, pide pago en criptomonedas y tiene un contador.\n\nNicolás mira el registro del antivirus y ve el origen: a las 11:01, Bárbara Cáceres, de contabilidad, abrió un adjunto llamado \"Factura_pendiente_agosto.xlsm\". Hace diecinueve minutos. El proceso de cifrado sigue corriendo.",
          "options": [
            "Aislar de inmediato el servidor y el equipo de origen de la red sin apagarlos, y escalar al encargado de seguridad activando el protocolo de incidente crítico",
            "Aislar de inmediato el servidor y el equipo de origen de la red sin apagarlos, y escalar al encargado de seguridad, pero dejar el resto de los servidores del datacenter conectados normalmente mientras se confirma si el cifrado se propagó más allá de contabilidad",
            "Aislar el equipo de origen de Bárbara de la red sin apagarlo y escalar activando el protocolo de incidente crítico, pero dejar el servidor de contabilidad conectado, ya que ahí es donde varias personas todavía están tratando de recuperar archivos que necesitan hoy",
            "Aislar el servidor y el equipo de origen de la red, y escalar al encargado de seguridad, pero hacerlo mediante un ticket de prioridad alta en el sistema normal, en vez de activar directamente el protocolo de incidente crítico"
          ],
          "explanations": [
            "Aislar sin apagar detiene la propagación y conserva la evidencia y las claves que puedan estar en memoria; escalar en paralelo activa a quien decide el resto.",
            "El proceso de cifrado sigue corriendo y ya tocó al menos un servidor de negocio; dejar el resto de la red conectada 'mientras se confirma' arriesga que se propague a más servidores en los minutos que toma esa confirmación.",
            "El servidor de contabilidad es justamente uno de los puntos donde el cifrado ya está corriendo; dejarlo conectado porque hay gente esperando sus archivos permite que el proceso siga avanzando sobre más contenido mientras se decide qué hacer.",
            "Un ticket de prioridad alta sigue el flujo habitual de revisión y asignación, que puede tomar minutos u horas en ser atendido; el protocolo de incidente crítico existe justamente para saltarse esa cola cuando el cifrado sigue en curso."
          ],
          "mismatchContext": "El aislamiento inmediato y el escalamiento son de TI porque es quien tiene acceso a la red y ve el incidente primero; la decisión sobre pago, comunicación o denuncia no se toma en la mesa de ayuda.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Clasificación",
      "questions": [
        {
          "target": "seguridad",
          "title": "Acto 2 · Cuánto de la empresa está adentro",
          "meta": [
            "11:35",
            "Jueves",
            "Escalamiento crítico",
            "Servidores y respaldos"
          ],
          "situation": "Daniela Alfaro corta la reunión en la que estaba y camina rápido hacia la sala de TI. Nicolás le muestra la pantalla y el reloj: el cifrado partió a las 11:03 y ya tocó dos servidores, contabilidad y el de documentos de operaciones.\n\nDaniela hace la pregunta que nadie quiere responder: \"¿los respaldos están en la misma red?\". Nicolás demora dos segundos de más en contestar y esos dos segundos le dicen todo.\n\nEn su tablet abre la ficha del incidente. El campo de severidad tiene cinco opciones y la que elija va a definir si en veinte minutos hay un comité de crisis o solo un ticket con prioridad alta.",
          "options": [
            "Clasificarlo como incidente crítico con impacto en la continuidad operacional, activar el comité de crisis y convocar a dirección, legal y comunicaciones",
            "Clasificarlo como incidente crítico con impacto en la continuidad operacional y activar el comité de crisis, pero convocar solo a dirección por ahora, dejando a legal y comunicaciones para cuando se sepa si los respaldos están comprometidos",
            "Clasificarlo como incidente crítico con impacto en la continuidad operacional y convocar al comité de crisis completo, pero mantener la coordinación de la respuesta dentro de TI, ya que es quien tiene la visibilidad técnica más actualizada del alcance",
            "Clasificarlo como incidente crítico con impacto en la continuidad operacional y activar el comité de crisis, pero esperar el análisis del proveedor de antivirus antes de convocar a legal, para tener más claridad técnica sobre el alcance del ataque"
          ],
          "explanations": [
            "El ransomware compromete continuidad, datos y posiblemente respaldos: eso es crisis desde el minuto uno y requiere decisiones que solo el comité puede tomar.",
            "Legal necesita evaluar desde ya los plazos de la póliza y la denuncia, y comunicaciones necesita preparar mensajes antes de que la situación se filtre por fuera; esperar la confirmación sobre los respaldos para sumarlos retrasa un trabajo que pueden empezar en paralelo.",
            "Convocar al comité pero seguir coordinando solo desde TI deja las decisiones de negocio —pago, comunicación, denuncia— sin el espacio donde realmente se toman; el comité de crisis existe para que esas decisiones se tomen ahí, no en la mesa técnica.",
            "El proveedor puede tardar horas en responder y los plazos de la póliza de ciberseguro ya están corriendo; convocar a legal no depende de tener el análisis técnico completo, sino de que exista un incidente de este tipo en curso."
          ],
          "mismatchContext": "Asignar la severidad y levantar el comité de crisis es de seguridad; TI ejecuta la contención y dirección decide, pero el gatillo del protocolo está acá.",
          "correctIndex": 0
        },
        {
          "target": "legal",
          "title": "Acto 2 · Con quién se habla y con quién no",
          "meta": [
            "12:10",
            "Jueves",
            "Comité de crisis",
            "Póliza y denuncia"
          ],
          "situation": "Cristián Bulnes llega a la sala con dos carpetas: la póliza de ciberseguro y la matriz de datos por sistema. La nota de rescate incluye un enlace a un chat con los atacantes y alguien de operaciones ya preguntó, medio en broma, cuánto están pidiendo.\n\nCristián pone las dos carpetas sobre la mesa. Sabe que la póliza tiene un plazo de aviso de 48 horas, que hablar con los atacantes sin autorización puede invalidarla, y que en el servidor de operaciones hay contratos con datos de personas.",
          "options": [
            "Fijar el marco: aviso a la aseguradora dentro de plazo, denuncia a la policía especializada, preservación de evidencia, y prohibición de contactar a los atacantes sin autorización expresa del comité",
            "Fijar el marco con aviso a la aseguradora dentro de plazo y preservación de evidencia, pero postergar la denuncia a la policía especializada hasta contar con el informe técnico completo, para presentar antecedentes más sólidos",
            "Fijar el marco completo —aviso a la aseguradora, denuncia y preservación de evidencia—, pero autorizar a un integrante técnico del equipo a entrar al chat de los atacantes solo para confirmar el monto solicitado, sin negociar nada",
            "Fijar el marco con aviso a la aseguradora dentro de plazo, denuncia y preservación de evidencia, pero dejar sin definir formalmente la prohibición de contactar a los atacantes, confiando en que nadie del equipo lo haría sin autorización"
          ],
          "explanations": [
            "El aviso a la aseguradora y la denuncia tienen plazos propios que corren desde ahora, y el contacto no autorizado con los atacantes puede dejar a la empresa sin cobertura.",
            "La denuncia se puede presentar con los antecedentes disponibles ahora y complementarse después; esperar el informe completo retrasa el apoyo especializado y el antecedente que la propia aseguradora suele exigir dentro de un plazo que no espera al informe técnico.",
            "Cualquier interacción con los atacantes, aunque sea solo para 'mirar' el monto, puede registrarse como contacto no autorizado y comprometer la póliza; esa tarea, si llega a ser necesaria, la debe hacer un especialista autorizado por el comité, no un integrante técnico por su cuenta.",
            "Confiar en que 'nadie lo haría' no reemplaza una instrucción explícita, y ya hay alguien en operaciones preguntando cuánto piden; sin la prohibición formal, un contacto bien intencionado pero no autorizado puede ocurrir igual y comprometer la póliza."
          ],
          "mismatchContext": "Los plazos de la póliza, la denuncia y las reglas de contacto con los atacantes son materia de legal; seguridad describe el ataque y dirección decide sobre el pago, pero el marco lo fija el abogado.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Contención",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 3 · Hasta dónde llegó",
          "meta": [
            "12:40",
            "Jueves",
            "Sala de guerra",
            "Red interna y respaldos"
          ],
          "situation": "Nicolás tiene la red segmentada de emergencia y una lista de equipos escrita a mano en una hoja cuadriculada, porque el sistema de inventario también está caído.\n\nEl equipo de Bárbara está desconectado y precintado. Faltan dos sucursales, Concepción y La Serena, que se conectan por VPN y donde nadie contesta el teléfono a la hora de almuerzo.\n\nDaniela le pregunta por los respaldos. Nicolás confirma lo que temía: la copia diaria está en un NAS de la misma red. La copia semanal, en cambio, está en una unidad que se desconecta después de cada trabajo. Esa unidad es todo lo que hay.",
          "options": [
            "Cortar la VPN de las sucursales y segmentar la red completa, desconectar físicamente el respaldo semanal para protegerlo, y deshabilitar la cuenta y sesiones del usuario de origen",
            "Segmentar la red completa y desconectar físicamente el respaldo semanal para protegerlo, pero mantener la VPN de las sucursales activa por la tarde, ya que Concepción y La Serena todavía no reportan ningún archivo cifrado",
            "Cortar la VPN de las sucursales y desconectar físicamente el respaldo semanal, pero dejar la cuenta y las sesiones del usuario de origen activas, ya que Bárbara ya no tiene el archivo abierto y el foco debe estar en contener la red",
            "Cortar la VPN de las sucursales, segmentar la red completa y deshabilitar la cuenta del usuario de origen, pero conectar brevemente el respaldo semanal para confirmar que los archivos están sanos antes de desconectarlo físicamente"
          ],
          "explanations": [
            "Cortar los caminos de propagación y sacar de línea el único respaldo sano es lo que define si mañana hay empresa o no; la cuenta de origen todavía puede tener sesión válida.",
            "Que las sucursales todavía no reporten nada no significa que estén a salvo: la VPN es un camino directo hacia ellas, y mantenerla activa cambia unas horas de atención por el riesgo de que el cifrado llegue también a esas dos oficinas.",
            "La cuenta de Bárbara pudo quedar comprometida por el mismo correo que descargó el cifrador; dejarla activa deja abierta la posibilidad de que se use esa misma sesión para algo más, aunque el archivo original ya no esté abierto.",
            "Conectar el respaldo semanal, aunque sea brevemente, a una red que todavía puede estar infectada es la forma más rápida de perder la única copia sana disponible; esa verificación se hace después, en un entorno aislado, no conectándolo a la red actual."
          ],
          "mismatchContext": "Segmentar la red, proteger los respaldos y cortar accesos son acciones técnicas de TI; el comité fija la prioridad, pero nadie más puede ejecutar en la infraestructura.",
          "correctIndex": 0
        },
        {
          "target": "comunicaciones",
          "title": "Acto 3 · Doscientas personas mirando el techo",
          "meta": [
            "13:15",
            "Jueves",
            "Comité de crisis",
            "Personal y clientes"
          ],
          "situation": "Josefa Aravena baja un piso y ve lo que pasa cuando nadie dice nada: gente parada en los pasillos, teléfonos grabando la pantalla del servidor con la nota de rescate, y un grupo de WhatsApp interno donde ya circula la palabra \"hackeo\" con tres audios encima.\n\nUn cliente importante acaba de llamar al ejecutivo comercial preguntando por qué no le llegó la factura de la mañana. Josefa tiene quince minutos antes de que ese pantallazo salga de la empresa.",
          "options": [
            "Emitir primero un mensaje interno breve y claro con instrucciones concretas y una vocería única, y en paralelo preparar con legal el mensaje para clientes con los hechos confirmados",
            "Emitir un mensaje interno breve con instrucciones concretas y vocería única, pero publicar también de inmediato un comunicado externo con el tipo de ataque y los sistemas afectados, para adelantarse a que algún cliente lo publique primero",
            "Preparar con legal el mensaje para clientes con los hechos confirmados, pero antes de emitir cualquier mensaje interno, esperar a que el comité de crisis termine de reunirse por completo, para no adelantarse con información parcial",
            "Emitir un mensaje interno breve con instrucciones concretas y una vocería única, pero dejar que cada jefatura de área decida si comparte o no información adicional con su propio equipo, según lo que considere necesario"
          ],
          "explanations": [
            "El vacío de información lo llena el rumor: un mensaje interno temprano con instrucciones concretas frena las filtraciones y ordena la conducta de doscientas personas.",
            "Detallar el tipo de ataque y los sistemas afectados en un comunicado externo entrega información útil al atacante y condiciona la negociación antes de que el comité de crisis haya definido una posición; el mensaje externo debe esperar los hechos confirmados y validados con legal.",
            "El vacío interno ya está generando pantallazos y rumores con la palabra 'hackeo' circulando; esperar a que termine toda la reunión del comité para decir algo hacia adentro deja ese vacío creciendo justo en los minutos donde más se necesita una instrucción clara.",
            "Dejar la información adicional a criterio de cada jefatura reproduce el mismo riesgo de versiones distintas que la vocería única busca evitar; el mensaje y lo que se agrega a él deben salir del mismo lugar, no de decisiones separadas por área."
          ],
          "mismatchContext": "Definir el mensaje, su secuencia y la vocería es de comunicaciones; TI está conteniendo y legal valida el contenido, pero nadie más puede ordenar el relato interno y externo.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Recuperación",
      "questions": [
        {
          "target": "ti",
          "title": "Acto 4 · Levantar en el orden correcto",
          "meta": [
            "08:00",
            "Viernes",
            "Sala de guerra",
            "Respaldo semanal"
          ],
          "situation": "Nicolás durmió cuatro horas en la sala de reuniones. El respaldo semanal está montado en un entorno aislado y sí, está sano: tiene hasta el domingo pasado. Se perdieron cuatro días de contabilidad.\n\nEl gerente de operaciones quiere todo arriba hoy. El de finanzas quiere primero el sistema de facturación. El de ventas dice que sin el servidor de documentos no puede cerrar el mes.\n\nNicolás mira la pizarra donde escribió, en la madrugada, una sola frase: \"si restauro sobre algo sucio, esto pasa de nuevo el lunes\".",
          "options": [
            "Restaurar en equipos reconstruidos y verificados limpios, por orden de criticidad para el negocio, validando integridad y con monitoreo reforzado antes de devolver cada sistema a producción",
            "Restaurar en equipos reconstruidos y verificados limpios, con monitoreo reforzado, pero hacerlo todo en paralelo para los tres sistemas —facturación, documentos y contabilidad— al mismo tiempo, para recuperar la operación completa lo antes posible",
            "Restaurar en equipos reconstruidos y verificados limpios, por orden de criticidad para el negocio, pero considerar cada sistema recuperado apenas los archivos vuelven a abrirse, sin esperar la validación de integridad completa",
            "Restaurar en equipos reconstruidos y verificados limpios, validando integridad antes de devolver cada sistema a producción, pero priorizar el orden según qué gerente insiste más, ya que todos los sistemas afectados son igual de críticos para el negocio"
          ],
          "explanations": [
            "Restaurar sobre equipos limpios y por criticidad evita la reinfección y permite recuperar primero lo que sostiene el negocio, con evidencia de que cada sistema volvió sano.",
            "Restaurar tres sistemas críticos en paralelo, con un equipo que lleva toda la noche despierto, aumenta el riesgo de saltarse algún paso de verificación en alguno de ellos; hacerlo por orden de criticidad permite confirmar que cada uno vuelve realmente limpio antes de pasar al siguiente.",
            "Que los archivos abran no confirma que el sistema esté realmente limpio ni que el vector de entrada esté cerrado; sin la validación completa, la operación puede reanudar sobre una base que todavía arrastra algo del compromiso original.",
            "No todos los sistemas tienen el mismo nivel de criticidad real para sostener la operación, aunque cada gerente sienta que el suyo es el más urgente; priorizar por insistencia en vez de por criticidad real puede dejar para el final algo que el negocio necesita antes."
          ],
          "mismatchContext": "Reconstruir, restaurar y validar la integridad de los sistemas es ejecución de TI; el negocio aporta la criticidad de cada sistema, pero el orden técnico y la verificación son de infraestructura.",
          "correctIndex": 0
        }
      ]
    },
    {
      "stage": "Cierre",
      "questions": [
        {
          "target": "direccion",
          "title": "Acto 5 · La decisión que no se delega",
          "meta": [
            "09:00",
            "Lunes",
            "Directorio",
            "Informe de crisis"
          ],
          "situation": "Álvaro Pinto abre la reunión con el informe impreso y la operación restablecida en un 90%. No se pagó rescate. Se perdieron cuatro días de registros contables que el equipo está reconstruyendo a mano desde los correos.\n\nEl informe dice tres cosas incómodas: no había doble factor en el correo, el respaldo diario estaba en la misma red, y el adjunto de la \"factura pendiente\" pasó todos los filtros porque el remitente era un proveedor real cuyo correo estaba comprometido.\n\nÁlvaro sabe que la sala está aliviada. También sabe que el alivio es el peor momento para cerrar un incidente.",
          "options": [
            "Aprobar el informe, dejar por escrito la decisión sobre el pago y sus fundamentos, y comprometer el plan de mejora con responsables, plazos y presupuesto asignado",
            "Aprobar el informe y dejar por escrito la decisión sobre el pago y sus fundamentos, pero comprometer el plan de mejora sin presupuesto adicional, ya que gran parte de las correcciones —doble factor, respaldos fuera de línea— se pueden ir implementando de a poco con lo que TI ya tiene asignado",
            "Aprobar el informe y comprometer el plan de mejora con responsables, plazos y presupuesto, pero dejar la decisión sobre el pago y sus fundamentos sin documentar por escrito, ya que finalmente no se pagó y el punto quedó resuelto por sí solo",
            "Aprobar el informe y comprometer el plan de mejora con plazos y presupuesto, pero encargar a TI que identifique primero quién dentro del equipo debería haber revisado el adjunto antes de que Bárbara lo abriera, como parte del plan de mejora"
          ],
          "explanations": [
            "El cierre ejecutivo sirve si deja decisiones documentadas y mejoras financiadas: doble factor, respaldos fuera de línea y filtros no se implementan solos.",
            "El respaldo diario en la misma red y la falta de doble factor son fallas estructurales que requieren inversión real, no ajustes graduales dentro de un presupuesto ya comprometido en otras prioridades; sin recursos adicionales, esas correcciones compiten con la operación diaria y tienden a postergarse.",
            "No pagar fue la decisión correcta, pero dejarla sin documentar borra el criterio que la sostuvo; ese registro es lo que permite decidir con el mismo criterio, y más rápido, si un incidente similar vuelve a ocurrir.",
            "El adjunto pasó todos los filtros porque venía de un proveedor real con el correo comprometido; buscar a alguien del equipo que 'debería haberlo revisado' antes de abrir el correo desvía el foco de las correcciones reales —doble factor, filtros, respaldos fuera de línea— hacia una responsabilidad individual que no corresponde."
          ],
          "mismatchContext": "Documentar la decisión sobre el pago, asumir el riesgo y asignar presupuesto son atribuciones indelegables de dirección; ninguna otra función puede comprometer recursos ni cerrar formalmente la crisis.",
          "correctIndex": 0
        }
      ]
    }
  ]
};
