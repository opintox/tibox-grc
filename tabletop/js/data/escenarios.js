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
            "Pedirle a Rodrigo que primero haga la denuncia en Carabineros y que la llame cuando tenga el parte para empezar a trabajar el caso.",
            "Decirle que cambie su contraseña desde el celular y dejar el resto de la revisión para mañana temprano, cuando esté en la oficina.",
            "Escribir en el grupo de WhatsApp de gerencia que robaron un notebook, para que todos estén al tanto antes de hacer cualquier otra cosa."
          ],
          "explanations": [
            "Sin hostname, hora y sesiones abiertas no se puede dimensionar la exposición, y el estado del cifrado define si el disco es legible para quien lo tenga. Registrar en caliente deja la línea de tiempo desde el minuto uno.",
            "La denuncia es un trámite paralelo y necesario, pero mientras se espera el parte la sesión sigue viva y el equipo sigue encendido.",
            "Cambiar la contraseña no invalida los tokens de sesión ya emitidos, y postergar hasta mañana regala doce horas de acceso potencial.",
            "El grupo de WhatsApp no bloquea nada y difundir el hecho sin datos confirmados agrega ruido y presión antes de saber qué se perdió."
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
            "Clasificarlo como incidente bajo, porque el disco estaba cifrado y el equipo tiene contraseña de arranque.",
            "Dejar la clasificación pendiente hasta saber si el equipo aparece o no, para no alarmar de más a la organización.",
            "Clasificarlo de inmediato como crítico, activar sala de crisis completa y adelantar aviso a los clientes esa misma noche."
          ],
          "explanations": [
            "La sesión quedó abierta: el cifrado protege el disco apagado, no una pantalla desbloqueada. La criticidad se define por los datos alcanzables, no por el valor del fierro.",
            "El cifrado no aplica cuando el equipo estaba encendido y con sesión iniciada; clasificar bajo por esa razón subestima el escenario más probable.",
            "Esperar a que aparezca el equipo puede tomar semanas y congela decisiones que tienen plazo, como la revisión de obligaciones contractuales.",
            "Avisar a clientes antes de tener alcance confirmado genera un daño que después no se desarma, y la sala de crisis completa por un endpoint desgasta al equipo sin agregar control."
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
            "Esperar la confirmación técnica de que efectivamente alguien accedió a los datos antes de revisar cualquier obligación contractual.",
            "Concluir que, al estar el equipo cifrado, no hay nada que notificar y cerrar la revisión legal del caso.",
            "Redactar de inmediato una carta a todos los clientes de la cartera informando que hubo una filtración de sus datos."
          ],
          "explanations": [
            "Los plazos contractuales suelen contarse desde la toma de conocimiento, así que el mapa de obligaciones se arma ahora aunque la investigación siga abierta.",
            "Muchos contratos no exigen acceso confirmado sino incidente con potencial de exposición; esperar la confirmación puede vencer el plazo.",
            "El cifrado es un atenuante relevante, pero aquí la sesión estaba abierta, y esa distinción cambia por completo el análisis.",
            "Notificar a toda la cartera afirmando una filtración que aún no está acreditada excede lo exigido y genera exposición innecesaria."
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
            "Enviar solo el borrado remoto al notebook y dar el caso por contenido, sin tocar las sesiones en la nube.",
            "Deshabilitar por completo la cuenta de Rodrigo y dejarla así hasta que se aclare todo, sin avisarle ni ofrecerle una alternativa para trabajar.",
            "Dejar todo preparado y esperar a que el equipo se vuelva a conectar a internet para recién ahí ejecutar las acciones."
          ],
          "explanations": [
            "Revocar primero corta el acceso vivo, que es lo que realmente está en riesgo; el borrado remoto es complementario y depende de que el equipo se conecte. El registro horario sostiene el informe posterior.",
            "El borrado remoto solo actúa si el equipo se conecta, y no toca los tokens ya emitidos en la nube: la sesión seguiría abierta.",
            "Dejar sin cuenta al gerente comercial en semana de cierre y sin avisarle convierte un incidente contenible en un problema de negocio, cuando bastaba revocar y re-habilitar con credenciales nuevas.",
            "Esperar la conexión del equipo entrega la iniciativa a quien tiene el notebook; las acciones en la nube se pueden ejecutar ahora mismo."
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
            "Prestarle el notebook de la sala de reuniones sin inscribirlo en MDM, para que alcance a firmar a las 11:00 y regularizarlo después.",
            "Restaurar en el equipo nuevo el perfil completo del notebook robado, incluyendo las credenciales guardadas en el navegador, para que no pierda tiempo.",
            "Reactivar los métodos de MFA que Rodrigo tenía antes, tal cual estaban, para no complicarlo con configuraciones nuevas."
          ],
          "explanations": [
            "Recuperar es volver a operar sin heredar la debilidad: equipo gestionado, cifrado y factores nuevos cierran el ciclo del incidente.",
            "El 'después' de un préstamo urgente casi nunca llega, y queda un equipo con datos de gerencia fuera de inventario y sin cifrado.",
            "Arrastrar credenciales guardadas replica exactamente el material que quedó expuesto anoche.",
            "Si el atacante tuvo la sesión abierta, pudo interactuar con los factores existentes; el re-registro desde cero es lo que garantiza el corte."
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
            "Cerrar el caso sin más, porque el equipo se borró y no hubo evidencia de accesos posteriores al robo.",
            "Cerrar con una charla de concientización a toda la empresa como única acción de mejora.",
            "Dejar el incidente abierto de forma indefinida hasta que Carabineros informe algo sobre el equipo."
          ],
          "explanations": [
            "El cierre vale por lo que deja instalado: un relato verificable de lo ocurrido y correcciones con dueño y fecha sobre las debilidades que el caso destapó.",
            "Cerrar sin registrar los hallazgos deja intactos los once equipos sin cifrado, que son el próximo incidente.",
            "Una charla no corrige un control técnico faltante ni acorta el tiempo de revocación de sesiones.",
            "Un incidente abierto sin actividad no protege a nadie y solo distorsiona las métricas del proceso."
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
            "Volver a lanzar el job de respaldo y, si esta vez termina en verde, dar el tema por resuelto.",
            "Anotarlo como incidencia de baja prioridad y retomarlo después del cierre de mes, ya que el ERP está operando con normalidad.",
            "Restaurar de inmediato sobre el ambiente productivo el respaldo completo más antiguo que encuentre, para normalizar la situación cuanto antes."
          ],
          "explanations": [
            "Lo primero es saber el tamaño real del hoyo: desde cuándo no hay copia válida y qué sistemas comparten ese job. Sin esa fecha no se puede evaluar nada.",
            "Un job en verde ya demostró que miente; repetirlo sin revisar los logs no dice nada sobre la causa ni sobre los veintitrés días anteriores.",
            "El sistema funciona hoy, pero la empresa está sin red de seguridad: postergar mantiene la exposición justo en la semana de mayor volumen.",
            "Restaurar datos viejos sobre producción sin necesidad destruye información válida y convierte un problema de respaldo en una pérdida real."
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
            "Clasificarlo como bajo impacto, porque no hubo interrupción del servicio ni pérdida efectiva de datos.",
            "Tratarlo como una falla operativa interna de TI y no ingresarlo al registro de incidentes.",
            "Clasificarlo como posible sabotaje interno y abrir una investigación al administrador del sistema antes de revisar los logs."
          ],
          "explanations": [
            "El impacto de un respaldo fallido no se mide por lo que pasó, sino por lo que habría pasado: veintitrés días contra un RPO de 24 horas es una brecha grave.",
            "Clasificar por consecuencia visible castiga la suerte, no el riesgo; con esa lógica el caso se cierra sin corregir nada.",
            "Dejarlo fuera del registro borra la trazabilidad y hace imposible exigir plazos, presupuesto o seguimiento.",
            "Acusar antes de leer los logs quema la confianza del equipo que justamente detectó el problema y desvía el foco de la causa técnica."
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
            "Lanzar un respaldo completo de inmediato en horario productivo, sin coordinar ventana ni carga, para no quedar otra noche sin copia.",
            "Cambiar esa misma noche la herramienta de respaldo por otra que no tenga este problema.",
            "Confiar en la copia más reciente que hay en la nube y darla por buena sin restaurarla, para no gastar la ventana de mantención."
          ],
          "explanations": [
            "Contener aquí es evitar que la única copia sana se borre sola, y cerrar el silencio del monitoreo para que la falla no se repita sin que nadie se entere.",
            "Un respaldo completo en pleno cierre de mes puede degradar la facturación y transformar un problema latente en una caída real.",
            "Migrar de herramienta en caliente, sin pruebas ni conocimiento del equipo, agrega un riesgo nuevo encima del que ya existe.",
            "Un respaldo que no se restaura es una hipótesis; asumirla buena es exactamente el error que llevó a los veintitrés días en verde."
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
            "Declarar el incidente resuelto cuando el job termina en verde y con el peso esperado, sin restaurar nada.",
            "Restaurar directamente sobre producción para ganar tiempo y aprovechar que ya está en ventana de mantención.",
            "Pedirle al proveedor del ERP que confirme por correo que todo quedó correcto y cerrar el punto con esa respuesta."
          ],
          "explanations": [
            "La capacidad de recuperación solo se demuestra restaurando y con alguien del negocio confirmando que los datos son los correctos.",
            "El verde del job es precisamente el indicador que falló durante veintitrés días; volver a confiar en él no cierra nada.",
            "Restaurar sobre producción arriesga sobrescribir datos vivos del cierre para probar algo que se puede probar aislado.",
            "El proveedor no tiene visibilidad de la integridad de las copias internas; su correo no reemplaza una restauración verificada."
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
            "Pedir que se sancione al administrador de sistemas que dejó pasar el job en verde y dar el tema por cerrado con eso.",
            "Instruir a TI que esto no vuelva a ocurrir, sin asignar presupuesto, plazos ni responsables formales.",
            "Delegar completamente la decisión al jefe de TI, que ya conoce el tema y puede resolverlo dentro de su presupuesto actual."
          ],
          "explanations": [
            "Lo que faltó no fue esfuerzo sino inversión y responsabilidad asignada; eso se resuelve en el nivel donde se aprueban plata y prioridades.",
            "Sancionar a quien opera no arregla un monitoreo que nunca alertó, y garantiza que el próximo hallazgo no se reporte.",
            "Una instrucción sin recursos ni fecha es una expectativa, no un control: en tres meses el panel vuelve a estar en verde.",
            "El jefe de TI no puede fijar el RPO que el negocio está dispuesto a tolerar ni financiar con su presupuesto una decisión de riesgo corporativo."
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
            "Reiniciar los servidores web y el balanceador a ver si el sitio se levanta y recién después mirar los gráficos.",
            "Asumir que es el éxito de la campaña y pedir de inmediato más capacidad al proveedor, sin revisar el origen del tráfico.",
            "Avisar en el grupo general de la empresa que están bajo ataque, antes de revisar cualquier métrica."
          ],
          "explanations": [
            "El patrón distingue una avalancha legítima de una maliciosa: miles de peticiones a la misma ruta sin carritos ni conversiones no son clientes. Descartar causa propia evita mitigar un ataque que nunca existió.",
            "Reiniciar borra evidencia, tumba las conexiones que sí estaban funcionando y no cambia nada si el tráfico sigue llegando.",
            "Escalar capacidad frente a un ataque volumétrico solo agranda la factura y da unos minutos más antes de caer igual.",
            "Declarar 'ataque' sin datos instala una versión que después cuesta corregir y activa a media empresa sin necesidad."
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
            "Clasificarlo como incidente menor de infraestructura mientras el sitio siga respondiendo de forma intermitente.",
            "Esperar a tener identificado al atacante y su motivación antes de asignar una clasificación formal.",
            "Clasificarlo como fuga de datos y activar el protocolo de brecha con notificación a clientes."
          ],
          "explanations": [
            "La clasificación correcta habilita la mitigación y los recursos, y mirar otros frentes cubre el uso clásico del DDoS como distracción.",
            "Un servicio de ventas intermitente en el día más grande del año es impacto alto por definición; llamarlo menor frena la respuesta.",
            "La atribución puede no llegar nunca y no cambia en nada la respuesta operativa; esperarla solo pierde minutos de facturación.",
            "No hay evidencia de exfiltración: activar el protocolo de brecha desvía al equipo y genera un daño reputacional sin sustento."
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
            "Bloquear de una vez todo el tráfico internacional, sin medir cuántos clientes legítimos quedan fuera.",
            "Sacar el sitio de línea y dejarlo apagado hasta que el ataque pase por sí solo.",
            "Escalar el hardware y el ancho de banda al máximo disponible y esperar a que el atacante se quede sin recursos."
          ],
          "explanations": [
            "La mitigación efectiva ataca el patrón del ataque, no la geografía completa, y aplicar por etapas permite saber qué regla sirvió y cuál cortó clientes.",
            "El bloqueo geográfico masivo elimina el ataque y también el 18% de las ventas; es autoinfligirse parte del daño que se quiere evitar.",
            "Apagar el sitio le entrega el objetivo al atacante y no acorta el ataque en nada.",
            "En un ataque volumétrico el atacante escala más barato que la víctima; la fuerza bruta solo aumenta el costo de la caída."
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
            "No decir nada hasta que el sitio esté completamente operativo, para no darle señales al atacante ni comprometer a la empresa.",
            "Publicar que la empresa está sufriendo un ataque de hackers y que los datos de los clientes podrían estar comprometidos.",
            "Responder uno a uno los comentarios en redes, adaptando la explicación técnica según lo que pregunte cada persona."
          ],
          "explanations": [
            "Un mensaje corto, con compromiso de próxima actualización y guion único con atención a clientes, ocupa el espacio antes de que lo llene el rumor.",
            "El silencio prolongado no protege: multiplica las versiones inventadas y traslada toda la presión a atención a clientes sin respaldo.",
            "Afirmar un compromiso de datos que no existe genera un daño reputacional real y contradice la clasificación del incidente.",
            "Respuestas distintas a cada persona producen versiones contradictorias que después circulan como prueba de que la empresa oculta algo."
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
            "Desactivar todas las reglas de mitigación apenas baje el tráfico, para recuperar el rendimiento del sitio.",
            "Declarar el servicio restablecido en cuanto la página principal carga rápido, sin probar el proceso de pago.",
            "Dejar el sitio en modo degradado de forma indefinida por si el ataque vuelve, sin plazo ni fecha de revisión."
          ],
          "explanations": [
            "La reapertura gradual permite detectar una segunda ola con margen, y el negocio solo está recuperado cuando alguien logra pagar de punta a punta.",
            "Quitar las reglas de inmediato es exactamente lo que espera un atacante que pausó para medir la respuesta.",
            "Una portada rápida con la pasarela caída se ve como servicio normal y frustra a cada cliente que llega hasta el final.",
            "El modo degradado sin fecha se vuelve permanente y termina costando más ventas que el propio ataque."
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
            "Cerrar el tema porque el sitio volvió a operar y las ventas se recuperaron en buena parte durante el fin de semana.",
            "Concentrar el cierre en identificar y denunciar al atacante, y dejar las decisiones de inversión para más adelante.",
            "Traspasar la decisión de inversión a TI para que la resuelva dentro de su presupuesto actual."
          ],
          "explanations": [
            "Comparar el costo de la caída con el de la protección es una decisión de negocio, y el gesto hacia los clientes afectados también se define en este nivel.",
            "Cerrar por recuperación parcial de ventas deja intacta la exposición para la próxima campaña, que es cuando volverá a ocurrir.",
            "La denuncia corresponde y puede seguir en paralelo, pero no reduce en nada la probabilidad de que el próximo ataque tenga el mismo efecto.",
            "El presupuesto de TI no está dimensionado para una decisión de continuidad de ingresos; delegarla equivale a no tomarla."
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
            "Pedirle a Camila que cambie su contraseña cuando termine lo que está haciendo",
            "Reenviar el correo sospechoso al resto del área para que nadie más caiga",
            "Esperar el reporte automático del filtro de correo antes de abrir un caso"
          ],
          "explanations": [
            "Registrar y revisar accesos de inmediato responde la única pregunta que importa ahora: si el atacante ya entró. Todo lo demás depende de esa respuesta.",
            "Postergar el cambio de contraseña deja la cuenta usable justo en la ventana donde el atacante es más rápido: los primeros minutos.",
            "Reenviar el correo original lo hace circular más, y basta un clic distraído para multiplicar el incidente. La advertencia se hace sin adjuntar la muestra.",
            "El filtro no siempre marca un sitio de phishing creado esa misma mañana. Esperar su reporte regala tiempo sin ganar información."
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
            "Clasificarlo como bajo, porque por ahora hay una sola cuenta involucrada",
            "Dejarlo como evento en observación hasta confirmar si hubo una transferencia",
            "Clasificarlo como alto, pero postergar el aviso hasta reunir todas las evidencias"
          ],
          "explanations": [
            "La severidad no la define cuántas cuentas cayeron, sino a qué da acceso la que cayó. Con permisos de pago comprometidos en semana de cierre, es alta desde ya.",
            "Contar cuentas subestima el riesgo: una sola con acceso a pagos basta para un fraude que se ejecuta en minutos.",
            "Esperar la transferencia para clasificar es esperar el daño. La clasificación existe para movilizar al equipo antes de que ocurra.",
            "Clasificar alto y no avisar equivale a no clasificar: nadie se entera y la respuesta no arranca."
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
            "Cambiar la contraseña y avisarle a Camila por correo",
            "Bloquear el dominio del remitente en el filtro y seguir monitoreando",
            "Apagar el servicio de correo hasta entender el alcance completo"
          ],
          "explanations": [
            "Las tres acciones juntas cierran las tres puertas abiertas: la sesión viva, la credencial y la regla que sigue filtrando correo aunque la cuenta quede sana.",
            "Cambiar la contraseña no cierra una sesión ya establecida ni borra la regla de reenvío: el atacante sigue leyendo todo.",
            "Bloquear el dominio evita correos nuevos, pero no toca la sesión activa ni el reenvío que ya está operando dentro de la casilla.",
            "Apagar el correo de toda la empresa por una cuenta comprometida detiene la operación y logra el mismo efecto que buscaba el atacante."
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
            "Devolver el acceso ahora, ya que la contraseña quedó cambiada",
            "Restaurar el buzón completo desde el respaldo de la semana pasada",
            "Pedirle a Camila que revise ella misma la configuración de su casilla"
          ],
          "explanations": [
            "Delegaciones y aplicaciones con permiso concedido sobreviven a cualquier cambio de contraseña. Revisarlas es lo que cierra el incidente de verdad, no la clave nueva.",
            "La contraseña es solo una de las llaves. Devolver el acceso sin revisar la configuración reabre el mismo problema en silencio.",
            "Restaurar desde respaldo destruye el correo legítimo de la semana y no elimina permisos concedidos a una aplicación externa.",
            "Delegar la verificación en la usuaria afectada no da garantía técnica ni deja registro del estado en que quedó la cuenta."
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
            "Cerrar el ticket técnico sin más registro, ya que no hubo pérdida económica",
            "Mantener el caso abierto indefinidamente por si aparece algo más adelante",
            "Cerrar el caso y enviar a toda la empresa el detalle técnico del ataque"
          ],
          "explanations": [
            "El cierre formal deja trazabilidad de qué pasó y qué se hizo, y avisar a las casillas alcanzadas evita que el mismo correo cobre una segunda víctima mañana.",
            "Sin registro no hay aprendizaje ni evidencia ante una auditoría, y el incidente se repite igual la próxima vez.",
            "Un caso abierto sin criterio de cierre no aporta vigilancia: solo ensucia el registro y diluye la responsabilidad.",
            "Publicar el detalle técnico a toda la empresa entrega un manual al siguiente atacante y no es lo que el resto necesita saber."
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
            "Cambiar la contraseña de svc_admin al tiro y volver a dormir, total con eso el atacante queda afuera y el lunes se revisa con calma.",
            "Bloquear la IP de origen en el firewall perimetral y cerrar la alerta en Zabbix como incidente resuelto.",
            "Dejar constancia en el ticket del turno y esperar al lunes para levantarlo en la reunión de TI, porque a esta hora no hay nadie a quien molestar."
          ],
          "explanations": [
            "Un ingreso exitoso en una cuenta de administrador de dominio es un evento que activa el protocolo de inmediato, y la evidencia inicial (hora, IP, cuenta, secuencia) se pierde o se contamina apenas alguien empieza a tocar el sistema.",
            "Cambiar la clave sin escalar borra la oportunidad de ver qué hizo el atacante estando adentro, y no sirve de nada si ya dejó una segunda vía de acceso.",
            "Bloquear una IP frena solo ese origen: el atacante rota a otra en minutos, y cerrar la alerta hace que nadie más se entere de que hubo un ingreso exitoso.",
            "Un administrador de dominio comprometido a las 03:14 tiene toda la madrugada y el fin de semana para moverse; esperar 48 horas es regalarle el tiempo completo."
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
            "Clasificarlo como incidente medio porque no hay pérdida de datos, cifrado ni interrupción de servicio, y revisar el alcance completo el lunes con el equipo entero.",
            "Clasificarlo como falso positivo hasta confirmar con el proveedor de mantención si alguno de sus técnicos estaba trabajando de madrugada con esa cuenta.",
            "Clasificarlo como intento de fuerza bruta bloqueado, dado que la política de bloqueo de cuentas debería haber cortado los 47 intentos antes del ingreso."
          ],
          "explanations": [
            "Con una cuenta de administrador de dominio en manos ajenas, el alcance potencial es la totalidad del ambiente; la ausencia de daño visible suele significar reconocimiento en curso, no que no pasó nada.",
            "La severidad se mide por el alcance del acceso obtenido, no por el daño ya consumado; clasificar en medio retrasa las decisiones que solo dirección puede tomar.",
            "Consultar al proveedor es válido como verificación paralela, pero degradar la categoría mientras hay una sesión activa deja el incidente sin dueño durante horas.",
            "Hubo un ingreso exitoso después de los fallidos: eso descarta que el control haya funcionado y convierte el episodio en un compromiso, no en un intento frustrado."
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
            "Cambiar solo la contraseña de svc_admin y dejar la cuenta habilitada, para que las tareas de facturación sigan corriendo sin interrupción.",
            "Esperar a que termine el cierre de facturación de las 06:00 y recién ahí deshabilitar la cuenta, para no arriesgar el proceso del negocio.",
            "Apagar el controlador de dominio principal para cortar de raíz cualquier movimiento del atacante mientras se evalúan los pasos siguientes."
          ],
          "explanations": [
            "Deshabilitar y revocar los tickets corta el acceso de verdad, y coordinar en paralelo la cuenta de reemplazo evita que la contención se transforme en una caída del negocio.",
            "Cambiar la clave sin revocar los tickets Kerberos deja la sesión existente funcionando: el atacante no se entera del cambio y sigue adentro.",
            "Regalar noventa minutos a un administrador de dominio comprometido puede costar mucho más que un cierre de facturación atrasado.",
            "Apagar el controlador de dominio deja a toda la empresa sin autenticación el lunes, destruye evidencia en memoria y no garantiza que el atacante haya perdido persistencia."
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
            "Eliminar svc_backup2 y restablecer la operación normal, dejando la rotación masiva de credenciales agendada para el próximo ciclo de mantención.",
            "Restaurar el controlador de dominio desde el respaldo del viernes en la noche, con lo que la cuenta creada por el atacante desaparece sin más análisis.",
            "Dejar svc_backup2 habilitada pero monitoreada, para detectar al atacante si vuelve a usarla y así conseguir más información sobre su origen."
          ],
          "explanations": [
            "La recuperación solo es real cuando se elimina la persistencia, se invalidan las credenciales que el atacante pudo capturar y se cierra el hueco que permitió el ingreso, en ese orden y antes de reabrir.",
            "Postergar la rotación deja vivas las credenciales que el atacante pudo extraer con privilegios de administrador de dominio: la puerta queda abierta con otro nombre.",
            "Restaurar desde respaldo puede reponer también configuraciones comprometidas, borra evidencia y no toca las credenciales que el atacante ya conoce.",
            "Mantener deliberadamente una cuenta de administrador de dominio bajo control del atacante es una apuesta que no le corresponde tomar a una empresa en plena recuperación."
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
            "Felicitar al equipo por la respuesta, dar por cerrado el incidente y encargar a TI que resuelva los hallazgos cuando la carga operativa lo permita.",
            "Encargar una investigación para determinar quién fue responsable de que la contraseña llevara cuatro años sin rotar antes de decidir cualquier inversión.",
            "Contratar de inmediato una auditoría externa completa y suspender otras decisiones hasta tener su informe, que llegaría en unas ocho semanas."
          ],
          "explanations": [
            "El cierre de un incidente es una decisión de dirección: sin dueño, plata, plazo y una fecha de revisión, los hallazgos vuelven a quedar pendientes como ya ocurrió una vez.",
            "Delegar los hallazgos a la capacidad disponible de TI es exactamente el mecanismo por el que quedaron catorce meses sin resolver.",
            "Buscar un culpable individual por una falla de proceso enfría el reporte de incidentes futuros y no cierra ninguna de las tres brechas.",
            "Una auditoría externa puede ser útil después, pero usarla para congelar decisiones deja ocho semanas más de exposición en controles que ya se sabe que faltan."
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
            "Agendar la instalación del parche para la ventana de mantención del sábado y avisar por correo al equipo, que es el procedimiento habitual para actualizaciones.",
            "Instalar el parche de inmediato en producción sin avisar a nadie, porque la urgencia lo justifica y después se informa.",
            "Esperar unos días a que otras empresas instalen el parche primero, para no arriesgarse a que la actualización rompa el portal de facturas."
          ],
          "explanations": [
            "Exposición a internet más exploit público más explotación activa es la combinación que obliga a escalar en el momento, y revisar logs temprano permite saber si ya entraron antes de que se pierda la evidencia.",
            "El calendario de mantención está pensado para actualizaciones normales; aplicarlo a una vulnerabilidad explotada activamente regala cuatro días de exposición.",
            "La urgencia es real, pero parchar producción sin aviso ni respaldo puede dejar caído el canal de facturación de noventa proveedores y sin nadie preparado para responder.",
            "Con exploit público circulando, esperar no reduce el riesgo del parche y sí aumenta el de ser explotado: el orden de magnitud no es comparable."
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
            "Clasificarlo como riesgo alto pero con plazo de una semana, porque no hay evidencia de que la empresa haya sido atacada todavía.",
            "Clasificarlo como riesgo medio porque el portal no almacena datos personales ni información financiera sensible.",
            "Postergar la clasificación hasta que el fabricante publique una nota técnica que confirme si esta instalación específica es explotable."
          ],
          "explanations": [
            "La severidad se construye con exposición, facilidad de explotación y alcance posterior; aquí las tres están al máximo y el segmento compartido convierte al portal en puerta de entrada.",
            "La ausencia de evidencia de ataque no es evidencia de ausencia: con explotación masiva en curso, una semana es una eternidad.",
            "El valor del dato almacenado no es lo único que importa: lo que se compromete es un punto de entrada con visibilidad hacia el resto de la red.",
            "Esperar confirmaciones adicionales del fabricante mientras el exploit ya circula deja el sistema expuesto por razones de trámite."
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
            "Dejar el portal tal cual y ejecutar el parche recién cuando el proveedor confirme por escrito que la migración de base de datos no tiene riesgos.",
            "Bajar el portal por completo y de forma indefinida hasta tener tiempo para parchar con calma, avisando a los proveedores que envíen las facturas por correo.",
            "Instalar el parche directo en producción durante el horario de mayor uso, sin respaldo previo, para ganar tiempo antes que nada."
          ],
          "explanations": [
            "Reducir la superficie expuesta compra tiempo real en minutos y permite parchar sin la presión de estar bajo ataque, sin sacrificar la operación completa.",
            "Esperar una confirmación formal del proveedor mientras el servicio sigue expuesto a un exploit público mantiene el riesgo intacto por razones administrativas.",
            "Bajar el servicio de forma indefinida en semana de cierre traslada todo el costo al negocio cuando existían medidas intermedias de restricción de acceso.",
            "Parchar sin respaldo un sistema con migración de base de datos puede convertir un incidente de seguridad en una pérdida de datos irreversible."
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
            "Dar por cerrado el incidente porque el parche ya está aplicado y el portal está operando con normalidad.",
            "Reinstalar el servidor desde cero de inmediato, sin conservar copia de los logs ni de los archivos actuales, para partir limpio.",
            "Registrar el hallazgo del 12 de agosto en el ticket y dejar la revisión de compromiso agendada para la próxima ventana de mantención."
          ],
          "explanations": [
            "Parchar elimina la vulnerabilidad, no al intruso que pudo entrar antes; con un indicio de explotación previa hay que buscar persistencia y rotar los secretos que ese servidor conocía.",
            "Cerrar con un indicio de explotación previa sin verificar deja abierta la posibilidad de que el atacante siga adentro con acceso que ya no depende del exploit.",
            "Reinstalar sin preservar evidencia impide saber qué alcanzó el atacante y qué credenciales hay que rotar, además de borrar el rastro para siempre.",
            "Postergar la revisión días mantiene en producción un servidor posiblemente comprometido, que es justo el escenario que el parche no resuelve."
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
            "Felicitar la respuesta del equipo, cerrar el incidente y pedir que se repita el mismo criterio de rapidez la próxima vez que ocurra algo similar.",
            "Instruir que de ahora en adelante todo parche crítico se instale automáticamente apenas se publique, sin pruebas ni ventana, para no volver a discutirlo.",
            "Encargar a TI que redacte el procedimiento cuando termine el cierre de mes, sin definir responsable ni plazo formal."
          ],
          "explanations": [
            "Lo que falló no fue la reacción sino la ausencia de proceso; institucionalizarlo con dueño, plazos y recursos es una decisión que solo dirección puede tomar.",
            "Confiar en que la próxima vez habrá alguien disponible y decidido es depender de la suerte, no de una capacidad organizacional.",
            "Automatizar todo parche crítico sin pruebas ni ventana traslada el riesgo a la disponibilidad y termina generando excepciones informales que nadie controla.",
            "Un encargo sin responsable ni fecha es la forma habitual en que estas medidas quedan pendientes hasta el incidente siguiente."
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
            "Escribirle directamente por WhatsApp al técnico de Sitec para preguntarle si es él quien está conectado, y actuar según lo que responda.",
            "Desconectar la sesión y bloquear la cuenta de inmediato sin avisar a nadie, y dejar la explicación para la reunión de la mañana.",
            "Anotar la observación en la bitácora del turno y revisarla mañana con calma, ya que el acceso del proveedor está formalmente autorizado por contrato."
          ],
          "explanations": [
            "El patrón (sin ticket, origen anómalo, intentos de acceso fuera del alcance contratado) es suficiente para escalar, y la evidencia inicial es lo primero que se pierde al intervenir.",
            "Avisar al posible titular de una cuenta comprometida puede alertar al atacante si controla ese canal, y una respuesta por WhatsApp no es verificación.",
            "Cortar sin escalar ni registrar deja al incidente sin dueño, sin evidencia y sin nadie evaluando qué alcanzó a hacer la sesión durante cincuenta minutos.",
            "La autorización contractual cubre el acceso al sistema de bodegas, no intentos hacia Recursos Humanos de madrugada sin ticket; esperar hasta mañana regala la noche entera."
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
            "Clasificarlo como incidente del proveedor y traspasarle la gestión a Sitec, dejando el caso en espera de su informe.",
            "Clasificarlo como incidente bajo porque los intentos contra Recursos Humanos fallaron y no hubo acceso efectivo a la información.",
            "Clasificarlo como uso indebido de credenciales por parte de un funcionario del proveedor y derivarlo a la administración del contrato."
          ],
          "explanations": [
            "El acceso ocurre dentro de la red de la empresa y afecta datos propios: la responsabilidad frente a los titulares de esos datos no se traspasa junto con la cuenta.",
            "Delegar la gestión al proveedor deja la contención en manos de quien está comprometido y sin control sobre los tiempos de respuesta.",
            "Los intentos fallidos indican reconocimiento en curso y controles que aguantaron por ahora; la severidad se mide por lo que la sesión podría alcanzar, no solo por lo que ya logró.",
            "Asumir que es mal uso interno del proveedor descarta prematuramente el escenario de credencial robada, que es el que exige respuesta inmediata."
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
            "Esperar el informe forense definitivo antes de hacer cualquier gestión legal, para no comprometer a la empresa con declaraciones prematuras.",
            "Notificar de inmediato a los ciento ochenta trabajadores que sus datos fueron filtrados, para adelantarse a cualquier reclamo.",
            "Concentrar la acción en preparar el término anticipado del contrato con Sitec y el cobro de perjuicios, que es donde está la exposición de la empresa."
          ],
          "explanations": [
            "Las obligaciones legales corren con plazos propios que no esperan al informe forense, y el requerimiento formal al proveedor asegura la información y la posición contractual desde el primer día.",
            "Quedarse quieto hasta el informe final puede hacer perder plazos de notificación y la oportunidad de exigir evidencia al proveedor mientras aún existe.",
            "Comunicar una filtración no confirmada genera daño y alarma innecesarios, y compromete la posición de la empresa sobre hechos que todavía no están establecidos.",
            "La discusión contractual es legítima pero secundaria: primero están las obligaciones frente a los titulares de los datos y el aseguramiento de la evidencia."
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
            "Esperar hasta las 06:00 a que termine el proceso nocturno y el turno de noche, y recién ahí deshabilitar la cuenta del proveedor.",
            "Cambiar la contraseña de soporte_sitec y comunicarla al contacto de Sitec para que sigan trabajando con normalidad mientras se investiga.",
            "Cortar el enlace VPN completo con todos los proveedores externos y apagar el sistema de bodegas por precaución hasta tener claridad."
          ],
          "explanations": [
            "Cortar la sesión y la cuenta detiene el acceso sin tocar el sistema de bodegas, que sigue corriendo por su cuenta; el aviso al jefe de turno evita que la contención se lea como una falla.",
            "El proceso nocturno no depende de la sesión del proveedor: esperar cinco horas y media solo le da tiempo al intruso para encontrar un camino que sí funcione.",
            "Entregar una credencial nueva al proveedor antes de saber cómo se comprometió la anterior puede devolverle el acceso al mismo atacante.",
            "Apagar el sistema de bodegas y cortar a todos los proveedores es una respuesta desproporcionada que detiene la operación cuando bastaba con aislar una cuenta."
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
            "Reactivar la cuenta soporte_sitec con una contraseña nueva y compleja, dejando el resto de los cambios para cuando se renegocie el contrato.",
            "Mantener el acceso del proveedor cerrado de forma indefinida y pedirle que todo soporte se haga presencialmente en la oficina.",
            "Reactivar el acceso ahora tal como estaba para no frenar la operación, y aplicar los controles nuevos en la próxima ventana de mantención."
          ],
          "explanations": [
            "La recuperación es la única oportunidad real de corregir la causa: cuenta compartida, sin segundo factor y con permisos excesivos; reabrir con controles evita repetir el mismo incidente.",
            "Cambiar solo la contraseña deja intacta la cuenta compartida sin segundo factor y con acceso a Recursos Humanos, que es exactamente lo que permitió el episodio.",
            "Cerrar de forma indefinida un soporte que la operación necesita empuja a que alguien habilite un acceso paralelo sin control, que es peor.",
            "Reabrir igual que antes con la promesa de arreglarlo después es la manera más común de que los controles nunca se implementen."
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
            "Dar por cerrado el incidente destacando la buena reacción del equipo y pedir que se apliquen los mismos controles de Sitec a los demás proveedores cuando haya tiempo.",
            "Instruir el término inmediato del contrato con Sitec como señal hacia el resto de los proveedores.",
            "Delegar en TI la revisión de los catorce accesos y en legal la revisión de los contratos, sin plazo ni reporte formal, para no sobrecargar el comité."
          ],
          "explanations": [
            "El incidente expuso un riesgo estructural, no puntual; convertirlo en un programa con dueño, plazo y presupuesto es la única decisión que evita que se repita con otro proveedor.",
            "Aplicar los controles cuando haya tiempo deja trece accesos en la misma condición que provocó este incidente.",
            "Terminar el contrato castiga al proveedor que sí informó y no corrige ninguna de las debilidades propias que hicieron posible el alcance del incidente.",
            "Repartir tareas sin plazo ni reporte es delegar la responsabilidad sin conservar el control: el comité pierde visibilidad justo del riesgo que acaba de materializarse."
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
            "Llamar por teléfono a Rodrigo para preguntarle qué está haciendo con esos archivos a esa hora",
            "Cortarle la sesión y bloquear la cuenta al tiro, y recién mañana contarle a alguien lo que pasó",
            "Anotar la alerta en el turno y dejarla para que la revise el equipo el miércoles en la mañana"
          ],
          "explanations": [
            "La evidencia de una amenaza interna se pierde o se contamina en minutos: registrarla y escalarla por el canal formal protege el caso y le entrega la decisión a quien corresponde.",
            "Avisarle al sospechoso le da tiempo para borrar rastros, sacar el respaldo que le falta o preparar una versión; además expone a Camila a una conversación que no le toca dar.",
            "Actuar de más antes de escalar destruye la posibilidad de medir el alcance real y deja a la organización sin evidencia utilizable, aunque la intención sea buena.",
            "En doce horas el usuario puede terminar la copia, salir de la empresa y devolver el notebook formateado; la ventana de contención se cierra esta noche."
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
            "Marcarlo como falso positivo del DLP porque se trata de un empleado conocido y con acceso legítimo a esa carpeta",
            "Clasificarlo como incidente crítico y mandar un aviso a toda la empresa pidiendo que nadie use el servidor de archivos",
            "Dejar la clasificación pendiente hasta que TI termine el análisis forense completo del equipo"
          ],
          "explanations": [
            "La clasificación correcta activa las funciones que sí pueden resolver: legal define el marco, RR.HH. el vínculo laboral y dirección las consecuencias. La reserva evita alertar al involucrado.",
            "El acceso legítimo explica que pueda abrir los archivos, no que copie 1.842 en once minutos a un USB nueve días después de renunciar; ese es exactamente el patrón que el DLP existe para pillar.",
            "Difundirlo masivamente le avisa al involucrado, genera pánico interno y no aporta nada a la contención: nadie más está afectado.",
            "El análisis forense toma días y la clasificación es la que gatilla la respuesta; esperar equivale a no responder."
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
            "Enviar esa misma noche una carta de advertencia al trabajador exigiendo la devolución de la información",
            "Presentar de inmediato una denuncia penal con la alerta del DLP como único antecedente",
            "Recomendar esperar a ver si la información aparece publicada o en manos de la competencia antes de tomar cualquier acción"
          ],
          "explanations": [
            "Sin cadena de custodia la evidencia es impugnable y la empresa pierde tanto la vía laboral como la penal; definir el marco primero es lo que hace viable todo lo demás.",
            "Una carta esta noche le confirma al trabajador que está siendo monitoreado y le da tiempo para destruir el USB antes de cualquier diligencia.",
            "Denunciar con evidencia sin validar debilita el caso y expone a la empresa a una demanda por imputación indebida si el análisis después matiza los hechos.",
            "El daño de una fuga de contratos y precios se materializa cuando ya es irreversible; esperar la confirmación pública es renunciar a actuar."
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
            "Pedirle al jefe comercial que lo llame de manera informal para ver cómo reacciona y sacarle información",
            "Comentar la situación con el equipo comercial para saber si alguien notó algo raro en las últimas semanas",
            "Esperar al viernes, cuando venga a firmar el finiquito, y recién ahí plantearle el tema"
          ],
          "explanations": [
            "Los datos del vínculo laboral determinan qué accesos siguen vivos y qué se puede exigir; la entrevista con acta y con legal presente es la única que sostiene una consecuencia posterior.",
            "Una conversación informal contamina la evidencia, no queda registrada y le avisa al involucrado que hay una investigación en curso.",
            "Difundirlo en el equipo genera rumores, expone a la empresa a un problema de honra si la investigación no confirma y avisa al involucrado por rebote.",
            "El viernes el trabajador ya habrá tenido tres días más de acceso y la copia estará fuera del alcance de la empresa."
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
            "Eliminar la cuenta de dominio y el buzón de correo para asegurarse de que no pueda entrar más",
            "Cambiar solo la contraseña de la cuenta de dominio y revisar mañana el resto de los accesos",
            "Ir a buscar el notebook a su casa esta misma noche y formatearlo antes de devolverlo al inventario"
          ],
          "explanations": [
            "Deshabilitar preserva buzón, permisos y registros como evidencia; hacerlo simultáneo evita que un acceso olvidado deje la puerta abierta mientras se cierran las otras.",
            "Eliminar la cuenta borra el buzón y los permisos históricos, es decir, destruye justamente la evidencia que legal necesita para sostener el caso.",
            "Una contraseña nueva no cierra sesiones ya iniciadas ni toca el VPN, el token ni el correo del teléfono: el acceso sigue vivo toda la noche.",
            "Formatear el equipo elimina la prueba principal de la copia; el notebook debe recuperarse por el canal formal y preservarse tal cual está."
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
            "Dar el caso por recuperado porque el usuario ya no tiene acceso a ningún sistema de la empresa",
            "Restaurar el servidor de archivos completo desde el respaldo de la semana pasada para dejar todo en un estado limpio",
            "Bloquear preventivamente el acceso de las catorce personas a todas las carpetas hasta que alguien defina qué hacer"
          ],
          "explanations": [
            "Recuperar aquí es doble: saber qué información salió para dimensionar el daño y cerrar la causa raíz, que es el permiso heredado que nadie revocó.",
            "Cortar el acceso detiene la fuga pero no dice qué se llevó ni impide que el próximo empleado use el mismo permiso olvidado.",
            "Restaurar el servidor no recupera nada perdido, porque los archivos siguen ahí, y arriesga sobrescribir registros que forman parte de la evidencia.",
            "Un bloqueo masivo sin criterio frena la operación comercial y genera presión para revertirlo entero, incluidos los permisos que sí correspondía quitar."
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
            "Cerrar el caso con un mensaje a la organización recordando la importancia de la confianza y la confidencialidad",
            "Buscar al responsable interno de que ese permiso siguiera activo y aplicar una sanción como señal para el resto",
            "Delegar en TI la definición y ejecución de todas las mejoras, y revisar los avances cuando el equipo tenga algo que mostrar"
          ],
          "explanations": [
            "El cierre solo vale si deja decisiones tomadas y compromisos con nombre, fecha y plata; eso es lo único que la dirección puede entregar y que nadie más puede.",
            "Un mensaje sobre valores no revoca un permiso heredado ni cambia el proceso de desvinculación; el próximo caso se repite igual.",
            "Buscar culpables individuales por una falla de proceso garantiza que el próximo hallazgo se reporte tarde o no se reporte.",
            "Sin plazo, prioridad ni presupuesto, las mejoras compiten con la operación diaria y pierden; delegar sin decidir es postergar."
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
            "Reiniciar el servidor de base de datos para cortar la transferencia lo antes posible",
            "Bloquear la IP en el firewall y seguir el turno, dejando el reporte para el lunes en la mañana",
            "Escribir en el grupo de WhatsApp del área de TI preguntando si alguien programó una carga grande para el fin de semana"
          ],
          "explanations": [
            "La evidencia del flujo activo es efímera y el escalamiento de guardia existe precisamente para las 03:12; con eso seguridad puede clasificar y ordenar contención en minutos.",
            "Reiniciar borra sesiones, memoria y evidencia del acceso, y no impide que la conexión se reestablezca apenas el servicio vuelva.",
            "Bloquear la IP corta un canal y deja el resto abierto; sin escalamiento, nadie evalúa si hay datos personales comprometidos ni empiezan a correr las obligaciones con clientes.",
            "Un grupo informal no es canal de incidentes: nadie responde a esa hora, no queda registro formal y se pierde la ventana de reacción."
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
            "Clasificarlo como incidente medio de infraestructura, porque todavía no hay confirmación de que los datos hayan sido usados por un tercero",
            "Esperar a que TI complete el análisis forense del servidor antes de asignar severidad y avisar a alguien",
            "Clasificarlo como crítico y ordenar de inmediato el aviso a todos los clientes afectados por correo masivo"
          ],
          "explanations": [
            "El tipo de dato comprometido, no el uso posterior, define la severidad y gatilla las obligaciones legales y contractuales; la clasificación correcta despierta a quien tiene que decidir.",
            "El uso que le den los atacantes es irrelevante para la clasificación: los datos personales ya salieron y las obligaciones ya corren.",
            "El forense demora días y sin severidad asignada no se activa el comité, no se notifica y nadie contiene; la clasificación es una hipótesis fundada, no una certeza final.",
            "La severidad es correcta pero la notificación a clientes tiene forma, plazo y contenido que definen legal y comunicaciones; un correo masivo improvisado agrava el daño."
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
            "Esperar el conteo definitivo de registros afectados antes de evaluar cualquier obligación de notificación",
            "Instruir que no se documente nada por escrito mientras dure la investigación, para que no exista material que pueda usarse en contra de la empresa",
            "Delegar en el área comercial la comunicación con cada cliente, ya que son quienes tienen la relación directa"
          ],
          "explanations": [
            "Los plazos de notificación se cuentan desde que se toma conocimiento, no desde que el conteo es exacto; fijarlos temprano evita el incumplimiento y ordena todo lo demás.",
            "El conteo definitivo puede tardar semanas y el incumplimiento del plazo es una infracción autónoma, además del daño reputacional de avisar tarde.",
            "No documentar no protege: deja a la empresa sin poder acreditar que actuó con diligencia, que es justamente lo que se le va a exigir.",
            "La relación comercial no reemplaza el contenido legal de una notificación; mensajes distintos a cada cliente generan contradicciones que después se usan como prueba."
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
            "Apagar el servidor de inmediato para garantizar que la transferencia se detenga por completo",
            "Bloquear solo la IP destino y dejar el servidor operando normalmente para no afectar el portal de pedidos del lunes",
            "Restaurar el servidor desde el respaldo del viernes para volver a un estado conocido antes de que llegue el equipo en la mañana"
          ],
          "explanations": [
            "Aislar sin apagar corta la fuga y conserva memoria, sesiones y evidencia; rotar la credencial comprometida impide que el atacante vuelva por la misma puerta.",
            "Apagar destruye la evidencia en memoria y no impide el regreso: la credencial comprometida sigue siendo válida cuando el servidor vuelva.",
            "Bloquear una sola IP es cosmético: el atacante ya tiene credenciales válidas y cambia de destino en minutos.",
            "Restaurar sobrescribe la evidencia del acceso y reinstala el mismo estado vulnerable, con la credencial comprometida intacta."
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
            "Publicar de inmediato un comunicado en redes sociales asegurando que la situación está bajo control y que ningún dato de clientes fue afectado",
            "No decir nada hasta tener el informe forense final, y responder a cualquier consulta que llegue con un \"no tenemos información\"",
            "Dejar que cada ejecutivo comercial le explique a sus propios clientes lo que sabe, ya que ellos entienden mejor el contexto de cada cuenta"
          ],
          "explanations": [
            "Tener el mensaje listo y validado permite responder en minutos cuando el comité autorice, sin improvisar ni comprometer a la empresa con afirmaciones que después se caen.",
            "Afirmar que no hubo datos afectados cuando seguridad ya confirmó lo contrario convierte un incidente en un problema de credibilidad y en un riesgo legal adicional.",
            "El silencio absoluto cede el relato a terceros y a los foros; para el mediodía la versión pública la habrá escrito alguien de afuera.",
            "Varias voces producen versiones distintas del mismo hecho, y esas contradicciones son lo primero que reproducen los medios y los clientes molestos."
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
            "Reconectar el servidor original a la red, ya que la transferencia se detuvo y el acceso del atacante quedó bloqueado",
            "Postergar la reapertura del portal hasta que termine el informe forense completo, aunque tome una semana",
            "Reabrir el portal el lunes como si nada y dejar el endurecimiento de la cuenta de servicio para la planificación del próximo trimestre"
          ],
          "explanations": [
            "Reconstruir sobre una base verificada y con la causa raíz cerrada es lo único que evita que el mismo acceso se reutilice apenas el servicio vuelva a estar expuesto.",
            "El servidor original sigue conteniendo lo que el atacante dejó y su configuración vulnerable; reconectarlo es reabrir la misma puerta.",
            "Una semana sin portal de pedidos causa un daño operacional que el negocio no va a absorber y que la recuperación puede evitar sin sacrificar seguridad.",
            "Abrir con la credencial y el acceso remoto sin corregir garantiza un segundo incidente, esta vez con la empresa ya advertida y sin excusa."
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
            "Cerrar el incidente indicando que la respuesta fue exitosa, ya que el servicio se restableció y los clientes fueron notificados dentro de plazo",
            "Solicitar una investigación interna para determinar quién dejó pendiente el hallazgo del año pasado y aplicar las medidas disciplinarias correspondientes",
            "Encargarle al área de TI que priorice la remediación con los recursos que ya tiene y reportar el avance cuando esté listo"
          ],
          "explanations": [
            "El cierre ejecutivo vale por lo que compromete: sin responsable, plazo y plata, el hallazgo de este informe termina igual que el del año pasado.",
            "Declarar éxito sin corregir la causa raíz deja el mismo hallazgo abierto y con la empresa ya notificada, lo que agrava cualquier incidente siguiente.",
            "Personalizar la culpa de un hallazgo sin dueño ni presupuesto reproduce exactamente la condición que causó el incidente y desincentiva reportar.",
            "\"Con los recursos que ya tiene\" es la misma instrucción que dejó el hallazgo en prioridad media durante un año."
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
            "Apagar todos los servidores del datacenter para detener el cifrado lo antes posible",
            "Pedirle a Bárbara que cierre el archivo y reinicie su computador, y ver si eso detiene el problema",
            "Empezar a restaurar la carpeta de contabilidad desde el respaldo de anoche mientras el resto sigue trabajando normal"
          ],
          "explanations": [
            "Aislar sin apagar detiene la propagación y conserva la evidencia y las claves que puedan estar en memoria; escalar en paralelo activa a quien decide el resto.",
            "Apagar en masa corta la operación completa, destruye evidencia en memoria y no impide que el cifrado siga apenas los equipos vuelvan con la infección presente.",
            "Reiniciar el equipo no detiene un proceso que ya se propagó por la red y puede gatillar el cifrado de los archivos que aún estaban intactos.",
            "Restaurar sobre una red todavía infectada significa que los archivos recuperados se vuelven a cifrar y que además se pierde el respaldo bueno."
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
            "Clasificarlo como incidente alto de infraestructura y mantenerlo dentro de TI hasta saber cuántos servidores quedaron afectados",
            "Clasificarlo como crítico y comunicar de inmediato a toda la organización que la empresa fue víctima de un ataque de ransomware",
            "Esperar a que el proveedor de antivirus entregue su análisis antes de asignar severidad y activar a alguien"
          ],
          "explanations": [
            "El ransomware compromete continuidad, datos y posiblemente respaldos: eso es crisis desde el minuto uno y requiere decisiones que solo el comité puede tomar.",
            "Mantenerlo dentro de TI retrasa la decisión sobre respaldos, denuncia y comunicación, y esas horas son exactamente lo que determina el costo final.",
            "La severidad es correcta pero el anuncio masivo sin mensaje preparado dispara rumores, filtraciones a medios y llamadas de clientes antes de que exista una vocería.",
            "El proveedor puede tardar horas en responder y el cifrado avanza ahora; la clasificación se hace con lo que se sabe, no con lo que se confirmará después."
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
            "Entrar al chat de los atacantes para averiguar el monto y ganar tiempo mientras el equipo técnico evalúa las opciones",
            "Postergar el aviso a la aseguradora y la denuncia hasta tener el informe técnico completo de lo que fue afectado",
            "Descartar la denuncia para evitar que el caso tome estado público y afecte la reputación de la empresa"
          ],
          "explanations": [
            "El aviso a la aseguradora y la denuncia tienen plazos propios que corren desde ahora, y el contacto no autorizado con los atacantes puede dejar a la empresa sin cobertura.",
            "Cualquier interacción con los atacantes, aunque sea exploratoria, compromete la póliza y la posición negociadora, y debe hacerla un especialista autorizado.",
            "El informe técnico puede tardar días y el plazo de la póliza no se suspende; llegar tarde al aviso es perder la cobertura completa.",
            "No denunciar no evita la publicidad y sí elimina la vía penal, el apoyo especializado y un antecedente que la aseguradora suele exigir."
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
            "Mantener la VPN de las sucursales activa para no interrumpir la atención de clientes en regiones durante la tarde",
            "Conectar el respaldo semanal ahora mismo para verificar rápidamente que los archivos estén sanos",
            "Reinstalar el sistema operativo del servidor de contabilidad de inmediato para tenerlo disponible antes del cierre del día"
          ],
          "explanations": [
            "Cortar los caminos de propagación y sacar de línea el único respaldo sano es lo que define si mañana hay empresa o no; la cuenta de origen todavía puede tener sesión válida.",
            "La VPN es un camino directo a las sucursales: mantenerla activa cambia unas horas de atención por el cifrado de dos oficinas completas.",
            "Conectar el respaldo a una red infectada es la forma más rápida de perder lo único que permite recuperar; la verificación se hace en un entorno aislado.",
            "Reinstalar destruye la evidencia del vector de entrada y devuelve a producción un servidor que puede volver a cifrarse en minutos."
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
            "Publicar de inmediato un comunicado externo detallando el tipo de ataque, los sistemas afectados y el monto del rescate exigido",
            "Pedir por el grupo interno que nadie hable del tema ni comente nada, sin entregar información adicional",
            "Esperar a que los sistemas estén restablecidos para comunicar, tanto hacia adentro como hacia los clientes"
          ],
          "explanations": [
            "El vacío de información lo llena el rumor: un mensaje interno temprano con instrucciones concretas frena las filtraciones y ordena la conducta de doscientas personas.",
            "Detallar sistemas afectados y monto del rescate entrega información útil al atacante, condiciona la negociación y compromete a la empresa antes de tener certezas.",
            "Pedir silencio sin explicar nada aumenta la ansiedad y la filtración; la gente comparte igual, pero con información equivocada.",
            "Los clientes ya están notando la falla y el personal ya está grabando pantallas; esperar al restablecimiento significa comunicar cuando el relato ya lo escribió otro."
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
            "Restaurar todos los sistemas en paralelo sobre los servidores existentes para recuperar la operación completa el mismo día",
            "Devolver primero a producción el sistema que pida el gerente que insista más, y luego ir viendo el resto según las quejas",
            "Considerar la recuperación terminada apenas los archivos vuelvan a abrirse, y dejar la revisión del vector de entrada para más adelante"
          ],
          "explanations": [
            "Restaurar sobre equipos limpios y por criticidad evita la reinfección y permite recuperar primero lo que sostiene el negocio, con evidencia de que cada sistema volvió sano.",
            "Restaurar sobre los servidores comprometidos reintroduce el malware y quema el respaldo, que es un recurso de un solo uso si se contamina.",
            "Priorizar por presión y no por criticidad deja lo esencial para el final y multiplica el tiempo total de indisponibilidad.",
            "Si el vector de entrada sigue abierto, el mismo correo o la misma cuenta vuelven a cifrar todo, esta vez sin respaldo semanal disponible."
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
            "Cerrar el caso destacando la respuesta del equipo, ya que se recuperó la operación sin pagar el rescate",
            "Instruir que se despida o sancione a la persona que abrió el adjunto, para dejar claro el estándar frente al resto de la organización",
            "Pedirle a TI que proponga las mejoras y las vaya implementando dentro del presupuesto operacional existente"
          ],
          "explanations": [
            "El cierre ejecutivo sirve si deja decisiones documentadas y mejoras financiadas: doble factor, respaldos fuera de línea y filtros no se implementan solos.",
            "Celebrar la respuesta sin financiar las correcciones garantiza que el próximo correo con adjunto encuentre exactamente la misma empresa.",
            "Sancionar a quien abrió el adjunto asegura que la próxima persona no avise, y el incidente se detecte horas más tarde en vez de en diecinueve minutos.",
            "El presupuesto operacional ya estaba comprometido antes del incidente; sin recursos adicionales las mejoras se posponen hasta el siguiente ataque."
          ],
          "mismatchContext": "Documentar la decisión sobre el pago, asumir el riesgo y asignar presupuesto son atribuciones indelegables de dirección; ninguna otra función puede comprometer recursos ni cerrar formalmente la crisis.",
          "correctIndex": 0
        }
      ]
    }
  ]
};
