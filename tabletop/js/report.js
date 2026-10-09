// Resultados e informe del ejercicio: nota, panel de resultados, informe ejecutivo (con
// contexto, desempeño por función y detalle acto por acto), acta y exportaciones (JSON, Word
// y PDF por impresión). Separado de app.js porque solo LEE el resultado del juego: app.js le
// entrega una foto de la sesión con show(ctx) y las funciones que necesita con init(deps)
// (ver el final de app.js).
window.TabletopReport = (function(){
  // deps: {escapeHtml, fmtElapsed, roleMetaFor, stagesFor, sessionRoleKeys, roleCompanyFor,
  //   showConfirmModal, loadSavedExercises, saveExercisesList, onClose}
  let deps = null;
  // Código del informe en el encabezado del Word (formato SGSI). Cambiar acá si el sistema de
  // gestión le asigna uno definitivo.
  const REPORT_DOC_CODE = 'INF-TT';
  // Foto de la sesión que se está informando (ver show).
  let gameState = null, participants = [], clientName = '', facilitatorName = '';
  const escapeHtml = s => deps.escapeHtml(s);
  const fmtElapsed = ms => deps.fmtElapsed(ms);
  const roleMetaFor = id => deps.roleMetaFor(id);
  const stagesFor = id => deps.stagesFor(id);
  const sessionRoleKeys = id => deps.sessionRoleKeys(id);
  const roleCompanyFor = (k, id) => deps.roleCompanyFor(k, id);
  const showConfirmModal = opts => deps.showConfirmModal(opts);
  const loadSavedExercises = () => deps.loadSavedExercises();
  const saveExercisesList = list => deps.saveExercisesList(list);

  function roleLabelWithName(roleKey){
    return roleMetaFor(gameState.scenarioId).names[roleKey];
  }

  function buildExecutiveReport(){
    const mistakes = gameState.characterMistakes;
    const attempts = gameState.answerAttemptLog;

    // --- análisis de confusiones de personaje ---
    const confusionCounts = {};
    mistakes.forEach(m => {
      const key = m.chosenRole + '→' + m.targetRole;
      if(!confusionCounts[key]) confusionCounts[key] = {chosenRole:m.chosenRole, targetRole:m.targetRole, count:0, stages:new Set()};
      confusionCounts[key].count++;
      confusionCounts[key].stages.add(m.stage);
    });
    const confusionList = Object.values(confusionCounts).sort((a,b) => b.count - a.count);

    const mistakesByStage = {};
    mistakes.forEach(m => { mistakesByStage[m.stage] = (mistakesByStage[m.stage]||0) + 1; });

    // --- análisis de intentos por pregunta (¿acertaron a la primera?) ---
    const attemptsByStage = {};
    attempts.forEach(a => {
      if(!attemptsByStage[a.stage]) attemptsByStage[a.stage] = {total:0, firstTry:0, sumAttempts:0, maxAttempts:0};
      const d = attemptsByStage[a.stage];
      d.total++; d.sumAttempts += a.attempts; d.maxAttempts = Math.max(d.maxAttempts, a.attempts);
      if(a.attempts === 1) d.firstTry++;
    });
    const totalAnswered = attempts.length;
    const firstTryTotal = attempts.filter(a => a.attempts === 1).length;
    const firstTryPct = totalAnswered ? Math.round((firstTryTotal / totalAnswered) * 100) : 100;

    let worstStage = null, worstRate = 101;
    Object.entries(attemptsByStage).forEach(([stage, d]) => {
      const rate = (d.firstTry / d.total) * 100;
      if(rate < worstRate){ worstRate = rate; worstStage = stage; }
    });

    // --- fortalezas: etapas sin ningún error, de ningún tipo ---
    const scenarioStages = stagesFor(gameState.scenarioId);
    const strengths = scenarioStages.filter(s => {
      const noCharMistakes = !mistakesByStage[s];
      const noRetries = !attemptsByStage[s] || attemptsByStage[s].firstTry === attemptsByStage[s].total;
      return noCharMistakes && noRetries;
    });

    const parts = [];

    // 1. Resumen ejecutivo
    const totalIssues = mistakes.length + attempts.reduce((s,a) => s + (a.attempts - 1), 0);
    let resumen;
    if(totalIssues === 0){
      resumen = `El ejercicio se completó sin un solo tropiezo: cada función identificó correctamente su rol y acertó la acción esperada al primer intento en las ${gameState.totalQuestions} preguntas. Es el mejor escenario posible antes de una auditoría o un incidente real.`;
    } else if(firstTryPct >= 85 && mistakes.length <= 1){
      resumen = `El desempeño general fue sólido. El equipo identificó con claridad quién debía actuar en cada momento, con solo puntos aislados de duda que no comprometen la lectura global del ejercicio.`;
    } else if(firstTryPct >= 60){
      resumen = `El ejercicio mostró un desempeño mixto: hubo tramos resueltos con seguridad y otros donde el grupo necesitó más de un intento o dudó sobre quién debía tomar la acción. Es un resultado normal para una primera corrida, pero identifica puntos concretos a reforzar antes de la próxima.`;
    } else {
      resumen = `El ejercicio evidenció dificultades recurrentes tanto en identificar quién debía responder como en dar con la acción correcta a la primera. Esto no es necesariamente un mal resultado — es exactamente el tipo de brecha que un tabletop está diseñado para sacar a la luz antes de que ocurra un incidente real.`;
    }
    parts.push({title:'Resumen ejecutivo', html:`<p>${resumen}</p>`});

    // 2. Patrones de asignación de responsables
    let asignacionHtml = '';
    if(mistakes.length === 0){
      asignacionHtml = `<p>No se registró ninguna confusión de responsables durante el ejercicio: cada vez que se necesitó una acción, el grupo identificó de inmediato a la función correcta.</p>`;
    } else {
      const top = confusionList[0];
      // Nombres de función/etapa escapados: en un escenario importado desde Word pueden venir
      // de "FUNCIÓN DEL ESCENARIO"/"ETAPA" tal cual las escribió quien armó el documento —
      // mismo criterio de escape que el resto de la pantalla del juego (renderStage, etc.),
      // que este informe no venía aplicando.
      const chosenName = escapeHtml(roleLabelWithName(top.chosenRole));
      const targetName = escapeHtml(roleLabelWithName(top.targetRole));
      const stageWord = top.stages.size > 1
        ? `las etapas de ${[...top.stages].map(escapeHtml).join(', ')}`
        : `la etapa de ${escapeHtml([...top.stages][0])}`;
      let topSentence;
      if(top.count >= 3){
        topSentence = `El patrón más marcado fue confundir a <b>${chosenName}</b> con <b>${targetName}</b> — ocurrió ${top.count} veces, principalmente en ${stageWord}. Vale la pena revisar con el grupo la diferencia entre ambas funciones antes del próximo ejercicio.`;
      } else if(top.count === 2){
        topSentence = `Se repitió al menos dos veces la confusión entre <b>${chosenName}</b> y <b>${targetName}</b> (en ${stageWord}), lo que sugiere que el límite entre ambas funciones no está del todo interiorizado.`;
      } else {
        topSentence = `Se registró una confusión puntual entre <b>${chosenName}</b> y <b>${targetName}</b> en ${stageWord} — aislada, no parece ser un patrón sistemático.`;
      }
      asignacionHtml = `<p>${topSentence}</p>`;
      if(confusionList.length > 1){
        const others = confusionList.slice(1, 3).map(c => `${escapeHtml(roleLabelWithName(c.chosenRole))} → ${escapeHtml(roleLabelWithName(c.targetRole))} (${c.count}×)`).join(', ');
        asignacionHtml += `<p>Otras confusiones registradas, con menor frecuencia: ${others}.</p>`;
      }
    }
    parts.push({title:'Patrones al asignar responsables', html:asignacionHtml});

    // 3. Primera respuesta correcta
    let primerIntentoHtml;
    if(totalAnswered === 0){
      primerIntentoHtml = `<p>No hay datos suficientes de respuestas para analizar.</p>`;
    } else if(firstTryPct >= 90){
      primerIntentoHtml = `<p>El <b>${firstTryPct}%</b> de las preguntas se resolvieron a la primera, sin necesidad de reintentar. Es un indicador fuerte de que el equipo no solo sabe quién actúa, sino también qué acción corresponde en cada momento.</p>`;
    } else if(firstTryPct >= 65){
      primerIntentoHtml = `<p>El <b>${firstTryPct}%</b> de las preguntas se resolvieron al primer intento. La etapa donde más costó dar con la acción correcta fue <b>${escapeHtml(worstStage)}</b>, con un ${Math.round(worstRate)}% de aciertos inmediatos — conviene revisarla con el grupo en la revisión posterior (hot-wash).</p>`;
    } else {
      primerIntentoHtml = `<p>Solo el <b>${firstTryPct}%</b> de las preguntas se resolvieron al primer intento, lo que indica que buena parte del ejercicio se resolvió por descarte más que por certeza. <b>${escapeHtml(worstStage)}</b> fue la etapa más costosa, con apenas ${Math.round(worstRate)}% de aciertos inmediatos.</p>`;
    }
    parts.push({title:'Primera respuesta correcta', html:primerIntentoHtml});

    // 4. Fortalezas
    let fortalezasHtml;
    if(strengths.length === scenarioStages.length){
      fortalezasHtml = `<p>Todas las etapas del ejercicio se resolvieron sin errores de ningún tipo — un resultado excelente y poco común en una primera corrida.</p>`;
    } else if(strengths.length > 0){
      fortalezasHtml = `<p>${strengths.length === 1 ? 'La etapa' : 'Las etapas'} de <b>${strengths.map(escapeHtml).join(', ')}</b> se resolvieron sin errores de función ni reintentos — un buen punto de partida que vale la pena reconocer con el equipo.</p>`;
    } else {
      fortalezasHtml = `<p>Ninguna etapa quedó completamente libre de errores o reintentos, aunque eso es información igual de valiosa: señala que el refuerzo debe ser transversal, no puntual.</p>`;
    }
    parts.push({title:'Fortalezas identificadas', html:fortalezasHtml});

    // 5. Recomendaciones
    const recs = [];
    const planAccion = [];
    if(confusionList.length > 0){
      const top = confusionList[0];
      // recs[] se inserta como <li> sin re-escapar (ver más abajo), así que acá también hay
      // que escapar los nombres antes de interpolarlos. planAccion en cambio SÍ se escapa al
      // volcarse en la tabla (más abajo), así que ahí puede ir el texto plano.
      recs.push(`Reforzar con ${escapeHtml(roleLabelWithName(top.chosenRole))} y ${escapeHtml(roleLabelWithName(top.targetRole))} la diferencia entre sus responsabilidades, idealmente con ejemplos concretos del propio incidente simulado.`);
      planAccion.push({accion:`Reforzar la diferencia de responsabilidades entre ${roleLabelWithName(top.chosenRole)} y ${roleLabelWithName(top.targetRole)} con ejemplos del propio ejercicio`, responsable:`${roleLabelWithName(top.chosenRole)} y ${roleLabelWithName(top.targetRole)}`, plazo:'15 días'});
    }
    if(worstStage && worstRate < 85){
      recs.push(`Revisar el procedimiento de la etapa de <b>${escapeHtml(worstStage)}</b> con el equipo — fue donde más costó identificar la acción correcta a la primera.`);
      planAccion.push({accion:`Revisar el procedimiento y las decisiones de la etapa de ${worstStage} con todo el equipo`, responsable:'Equipo completo', plazo:'15 días'});
    }
    if(totalIssues === 0){
      recs.push(`Con este resultado, el equipo está en condiciones de intentar un escenario más exigente o un ejercicio operacional real como siguiente paso.`);
      planAccion.push({accion:'Programar un escenario más exigente o un ejercicio operacional real como siguiente paso', responsable: facilitatorName || 'Facilitador', plazo:'30 días'});
    } else if(recs.length === 0){
      recs.push(`Repetir este mismo escenario en unas semanas para confirmar que los puntos de duda se resolvieron con la práctica.`);
      planAccion.push({accion:'Repetir este mismo escenario para confirmar que los puntos de duda se resolvieron con la práctica', responsable: facilitatorName || 'Facilitador', plazo:'30 días'});
    }
    recs.push(`Documentar este resultado como línea base — el valor real de repetir el ejercicio está en comparar contra esta primera corrida.`);
    planAccion.push({accion:'Documentar este resultado como línea base para comparar contra la próxima corrida', responsable: facilitatorName || 'Facilitador', plazo:'7 días'});
    parts.push({title:'Recomendaciones', html:`<ul class="report-recs">${recs.map(r => `<li>${r}</li>`).join('')}</ul>`});

    const planHtml = `<div class="table-wrap"><table class="ptable plan-table">
      <thead><tr><th>Acción</th><th>Responsable sugerido</th><th>Plazo</th></tr></thead>
      <tbody>${planAccion.map(p => `<tr><td>${escapeHtml(p.accion)}</td><td>${escapeHtml(p.responsable)}</td><td><span class="plazo-chip">${escapeHtml(p.plazo)}</span></td></tr>`).join('')}</tbody>
    </table></div>`;
    parts.push({title:'Plan de acción', html:planHtml});

    return {parts, plain: {
      resumen, firstTryPct, worstStage, worstRate: worstStage ? Math.round(worstRate) : null,
      confusionTop: confusionList[0] || null, strengths, recomendaciones: recs.map(r => r.replace(/<\/?b>/g,'')),
      planAccion
    }};
  }

  // ---------------- secciones adicionales del informe ----------------
  // Contexto del escenario, desempeño por función y detalle acto por acto. Devuelven partes con
  // el mismo formato que buildExecutiveReport ({title, html}); el HTML usa solo p, b, ul/li, h4 y
  // tablas .ptable, que es lo que sabe convertir reportElementToDocBlocks para el Word.
  function reportTable(head, rows){
    return `<div class="table-wrap"><table class="ptable report-table">
      <thead><tr>${head.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  }

  function buildReportContextPart(info){
    const id = gameState.scenarioId;
    const rm = roleMetaFor(id);
    const stages = stagesFor(id);
    const intro = (SCENARIO_INTROS[id] || '').trim();
    const hasPeople = Object.keys(gameState.personByRole || {}).length > 0;
    const meta = [
      ['Escenario', info.scenarioName],
      ['Cliente', clientName || 'Sin registrar'],
      ['Facilitador', facilitatorName || 'Sin registrar'],
      ['Fecha', info.fecha],
      ['Duración', info.duration],
      ['Puntuación', `${info.accuracy}% · ${info.gradeLabel}`],
      ['Objetivo (activo afectado)', SCENARIO_TARGETS[id] || '—'],
      ['Etapas', stages.join(' → ')]
    ];
    const roleRows = sessionRoleKeys(gameState.scenarioId).map(k => {
      const row = [rm.names[k], roleCompanyFor(k, gameState.scenarioId)];
      if(hasPeople) row.push(gameState.personByRole[k] || '—');
      return row;
    });
    const html = reportTable(['Dato', 'Detalle'], meta)
      + (intro ? intro.split(/\n\s*\n/).filter(t => t.trim()).map(t => `<p>${escapeHtml(t.trim())}</p>`).join('') : '')
      + `<h4>Funciones que participaron</h4>`
      + reportTable(hasPeople ? ['Función', 'Empresa', 'Persona'] : ['Función', 'Empresa'], roleRows);
    return {title: 'Contexto del ejercicio', html};
  }

  function buildPerformanceByRole(){
    const rm = roleMetaFor(gameState.scenarioId);
    const hasPeople = Object.keys(gameState.personByRole || {}).length > 0;
    const rows = sessionRoleKeys(gameState.scenarioId).map(k => {
      const own = gameState.actLog.filter(a => a.target === k);
      const roleFirst = own.filter(a => a.wrongRoles.length === 0).length;
      const decisionFirst = own.filter(a => a.wrongOptions.length === 0).length;
      const wrongAnswers = own.reduce((n, a) => n + a.wrongOptions.length, 0);
      const chosenByMistake = gameState.actLog.reduce((n, a) => n + a.wrongRoles.filter(r => r === k).length, 0);
      return {k, name: rm.names[k], company: roleCompanyFor(k, gameState.scenarioId), person: (gameState.personByRole || {})[k] || '',
              acts: own.length, roleFirst, decisionFirst, wrongAnswers, chosenByMistake};
    });
    return {rows, hasPeople};
  }
  function buildPerformancePart(){
    const {rows, hasPeople} = buildPerformanceByRole();
    const head = ['Función', 'Empresa'].concat(hasPeople ? ['Persona'] : [],
      ['Actos', 'Función a la primera', 'Decisión a la primera', 'Respuestas incorrectas', 'Elegida por error']);
    const tableRows = rows.map(r => [r.name, r.company].concat(hasPeople ? [r.person || '—'] : [],
      [String(r.acts), r.acts ? `${r.roleFirst} de ${r.acts}` : '—', r.acts ? `${r.decisionFirst} de ${r.acts}` : '—',
       String(r.wrongAnswers), String(r.chosenByMistake)]));
    // Lectura rápida: la función con más respuestas incorrectas en sus propios actos.
    const worst = rows.filter(r => r.wrongAnswers > 0).sort((a, b) => b.wrongAnswers - a.wrongAnswers)[0];
    const note = worst
      ? `<p>La función con más dudas al decidir fue <b>${escapeHtml(worst.name)}</b>, con ${worst.wrongAnswers} respuesta${worst.wrongAnswers === 1 ? '' : 's'} incorrecta${worst.wrongAnswers === 1 ? '' : 's'} en ${worst.acts === 1 ? 'su acto' : `sus ${worst.acts} actos`}. Es la primera candidata a reforzar.</p>`
      : `<p>Ninguna función eligió una respuesta incorrecta en los actos que le correspondían.</p>`;
    return {title: 'Desempeño por función', html: note + reportTable(head, tableRows)};
  }

  // Muchos escenarios ya titulan sus actos "Acto 1 · …": se quita ese prefijo para no repetirlo.
  const actTitle = t => String(t || '').replace(/^\s*acto\s+\d+\s*[·:\-–—]\s*/i, '').trim();

  function buildActsPart(){
    const rm = roleMetaFor(gameState.scenarioId);
    const html = gameState.actLog.map((a, i) => {
      const target = `${rm.names[a.target] || a.target}${roleCompanyFor(a.target, gameState.scenarioId) ? ` (${roleCompanyFor(a.target, gameState.scenarioId)})` : ''}`;
      const roleLine = a.wrongRoles.length
        ? `✕ Antes se eligió a ${a.wrongRoles.map(r => rm.names[r] || r).join(', ')}`
        : '✓ Identificada a la primera';
      const decisionLine = a.wrongOptions.length
        ? `✕ ${a.wrongOptions.length} respuesta${a.wrongOptions.length === 1 ? '' : 's'} incorrecta${a.wrongOptions.length === 1 ? '' : 's'} antes de la correcta:`
        : '✓ Correcta a la primera';
      return `<div class="report-act">
        <h4>Acto ${i + 1} · ${escapeHtml(a.stage)}${actTitle(a.title) ? ` · ${escapeHtml(actTitle(a.title))}` : ''}</h4>
        <p><b>Debía actuar:</b> ${escapeHtml(target)}</p>
        <p><b>Función:</b> ${escapeHtml(roleLine)}</p>
        <p><b>Decisión:</b> ${escapeHtml(decisionLine)}</p>
        ${a.wrongOptions.length ? `<ul>${a.wrongOptions.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>` : ''}
        <p><b>Decisión correcta:</b> ${escapeHtml(a.correctOption)}</p>
        ${a.explanation ? `<p class="report-act-why">${escapeHtml(a.explanation)}</p>` : ''}
      </div>`;
    }).join('');
    return {title: 'Detalle acto por acto', html: html || '<p>No hay actos registrados.</p>'};
  }

  // Convierte una sección del informe en pantalla a bloques que TibDocx.downloadReportDocx sabe
  // escribir: párrafos (con negritas), viñetas, subtítulos y tablas.
  function reportElementToDocBlocks(container){
    const blocks = [];
    const runsOf = node => {
      const runs = [];
      (function walk(n, bold){
        n.childNodes.forEach(c => {
          if(c.nodeType === 3){ if(c.textContent) runs.push({text: c.textContent.replace(/\s+/g, ' '), bold}); }
          else if(c.nodeType === 1) walk(c, bold || c.tagName === 'B' || c.tagName === 'STRONG');
        });
      })(node, false);
      if(runs.length){ runs[0].text = runs[0].text.replace(/^\s+/, ''); runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, ''); }
      return runs;
    };
    (function walk(el){
      el.childNodes.forEach(n => {
        if(n.nodeType !== 1) return;
        const tag = n.tagName;
        if(tag === 'P') blocks.push({type: 'p', runs: runsOf(n)});
        else if(tag === 'H4') blocks.push({type: 'heading', level: 3, text: n.textContent.trim()});
        else if(tag === 'LI') blocks.push({type: 'bullet', runs: runsOf(n)});
        else if(tag === 'TABLE'){
          const rows = [...n.querySelectorAll('tr')].map(tr => [...tr.children].map(td => td.textContent.trim()));
          blocks.push({type: 'table', rows, header: !!n.querySelector('thead')});
        }
        else walk(n);
      });
    })(container);
    return blocks;
  }

  // Nota del ejercicio a partir de los contadores del juego (sin tocar la pantalla).
  function computeScore(){
    const duration = gameState.startTime ? fmtElapsed(new Date() - gameState.startTime) : '00:00';
    const total = gameState.totalQuestions;
    const wrongA = gameState.wrongAnswerCount;
    const wrongC = gameState.wrongCharacterCount;
    // La nota debe reflejar ambos tipos de error: elegir mal el personaje (quien responde)
    // es tan relevante para un tabletop como elegir mal la alternativa de respuesta.
    const precision = total > 0 ? Math.round((total / (total + wrongA + wrongC)) * 100) : 0;
    const elapsedSeconds = gameState.startTime ? Math.max(0, Math.round((new Date() - gameState.startTime) / 1000)) : 0;
    // El tiempo aporta una penalización moderada: 1 punto por cada 2 minutos, con un máximo de 10.
    const timePenalty = Math.min(10, Math.floor(elapsedSeconds / 120));
    const accuracy = Math.max(0, precision - timePenalty);

    let gradeClass, gradeLabel, message;
    if(accuracy >= 90){
      gradeClass = 'grade-excelente'; gradeLabel = 'Excelente';
      message = 'El grupo respondió con muy pocos errores. El ejercicio validó que el equipo conoce bien su rol en este escenario.';
    } else if(accuracy >= 75){
      gradeClass = 'grade-bueno'; gradeLabel = 'Bueno';
      message = 'Buen desempeño general, con algunos puntos de duda. Conviene revisar en la revisión posterior (hot-wash) las preguntas donde hubo más de un intento y observar el efecto del tiempo sobre el resultado.';
    } else if(accuracy >= 50){
      gradeClass = 'grade-regular'; gradeLabel = 'Regular';
      message = 'Hubo varias dudas durante el ejercicio. Esto es útil — señala en qué partes del procedimiento el equipo necesita más claridad antes de un incidente real.';
    } else {
      gradeClass = 'grade-refuerzo'; gradeLabel = 'Necesita refuerzo';
      message = 'El número de errores sugiere que el procedimiento no está suficientemente interiorizado por el equipo. Recomendable repetir el ejercicio después de reforzar los roles y el plan.';
    }
    return {duration, total, wrongA, wrongC, precision, elapsedSeconds, timePenalty, accuracy, gradeClass, gradeLabel, message};
  }

  // ctx: foto de la sesión que acaba de terminar — {gameState, participants, clientName,
  // facilitatorName}. El informe solo la lee; nunca modifica el estado del juego.
  function show(ctx){
    ({gameState, participants, clientName, facilitatorName} = ctx);
    TabletopScreens.show('results', {scroll: false});

    // animación de entrada escalonada (respeta prefers-reduced-motion vía la regla global)
    const enterEls = document.querySelectorAll('#screen-results .results-enter');
    enterEls.forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });

    const scenarioMeta = SCENARIOS.find(s => s.id === gameState.scenarioId);
    const resultsRoleMeta = roleMetaFor(gameState.scenarioId);
    const resultsStages = stagesFor(gameState.scenarioId);
    const {duration, total, wrongA, wrongC, precision, elapsedSeconds, timePenalty, accuracy, gradeClass, gradeLabel, message} = computeScore();

    document.getElementById('reportScenarioName').textContent = `Informe · ${scenarioMeta.name}${clientName ? ' · ' + clientName : ''}`;
    document.getElementById('gradeBadge').className = `kpi-card kpi-card-score ${gradeClass}`;
    document.getElementById('gradePct').textContent = accuracy + '%';
    document.getElementById('gradeLabel').textContent = gradeLabel;
    document.getElementById('gradeMeta').textContent = `Precisión ${precision}% · −${timePenalty} pts por tiempo`;
    document.getElementById('resDuration').textContent = duration;
    document.getElementById('resTotal').textContent = total;
    document.getElementById('resWrongAnswers').textContent = wrongA;
    document.getElementById('resWrongChars').textContent = wrongC;
    // KPI superiores: la nota ya está en la primera tarjeta, así que la segunda muestra qué
    // parte de las decisiones salió a la primera (se completa más abajo, junto con el informe).
    document.getElementById('kpiDuration').textContent = duration;
    document.getElementById('kpiWrongChars').textContent = wrongC;
    document.getElementById('kpiWrongAnswers').textContent = wrongA;

    // Dona de 3 colores proporcional a preguntas respondidas / errores de alternativa / errores de
    // personaje (misma base que el % de la nota final), armada con 3 círculos SVG superpuestos.
    const donutTotal = total + wrongA + wrongC;
    document.getElementById('resDonutTotal').textContent = donutTotal;
    const circumference = 339.3; // 2 * PI * 54, coincide con el radio del círculo del SVG
    const correctLen = (total / donutTotal) * circumference;
    const altLen = (wrongA / donutTotal) * circumference;
    const charLen = (wrongC / donutTotal) * circumference;
    document.getElementById('resDonutCorrect').setAttribute('stroke-dasharray', `${correctLen} ${circumference}`);
    document.getElementById('resDonutAlt').setAttribute('stroke-dasharray', `${altLen} ${circumference}`);
    document.getElementById('resDonutAlt').setAttribute('transform', `rotate(${-90 + (correctLen / circumference) * 360} 66 66)`);
    document.getElementById('resDonutChar').setAttribute('stroke-dasharray', `${charLen} ${circumference}`);
    document.getElementById('resDonutChar').setAttribute('transform', `rotate(${-90 + ((correctLen + altLen) / circumference) * 360} 66 66)`);

    const stageChartEl = document.getElementById('resStageChart');
    const stageBarMax = Math.max(1, ...resultsStages.map(s => {
      const st = gameState.stageStats[s];
      return st ? Math.max(st.wrongAnswers, st.wrongCharacters) : 0;
    }));
    stageChartEl.innerHTML = resultsStages.map((stageName, idx) => {
      const stat = gameState.stageStats[stageName];
      if(!stat) return '';
      return `
        <div class="stage-chart-block results-enter" style="animation-delay:${0.24 + idx * 0.06}s;">
          <div class="stage-chart-label">${escapeHtml(stageName)} <span>(${stat.questions} pregunta${stat.questions === 1 ? '' : 's'})</span></div>
          <div class="mini-bar-row">
            <span class="mini-bar-label">Función</span>
            <div class="mini-bar-track"><div class="mini-bar-fill is-function" style="width:${Math.min(100, (stat.wrongCharacters / stageBarMax) * 100)}%;"></div></div>
            <span class="mini-bar-val">${stat.wrongCharacters}</span>
          </div>
          <div class="mini-bar-row">
            <span class="mini-bar-label">Respuesta</span>
            <div class="mini-bar-track"><div class="mini-bar-fill is-response" style="width:${Math.min(100, (stat.wrongAnswers / stageBarMax) * 100)}%;"></div></div>
            <span class="mini-bar-val">${stat.wrongAnswers}</span>
          </div>
        </div>`;
    }).join('');
    document.getElementById('resultsMessage').textContent = message;

    const report = buildExecutiveReport();
    document.getElementById('kpiFirstTryPct').textContent = report.plain.firstTryPct + '%';
    const reportEl = document.getElementById('executiveReport');
    // Orden del informe: contexto → resumen → desempeño por función → patrones/primera
    // respuesta/fortalezas → detalle acto por acto → recomendaciones → plan de acción.
    const reportParts = [buildReportContextPart({
      scenarioName: scenarioMeta.name, duration, accuracy, gradeLabel,
      fecha: new Date().toLocaleDateString('es-CL', {day:'2-digit', month:'long', year:'numeric'})
    })];
    report.parts.forEach(p => {
      if(p.title === 'Recomendaciones') reportParts.push(buildActsPart());
      reportParts.push(p);
      if(p.title === 'Resumen ejecutivo') reportParts.push(buildPerformancePart());
    });
    reportEl.innerHTML = reportParts.map(p => `
      <div class="report-section">
        <div class="report-section-title">${escapeHtml(p.title)}</div>
        ${p.html}
      </div>`).join('');

    const activeParticipants = participants.filter(p => p.checked);
    const nowDate = new Date();
    const fechaLegible = nowDate.toLocaleDateString('es-CL', {day:'2-digit', month:'long', year:'numeric'});

    // ---- llenar el bloque de acta ----
    document.getElementById('actaFecha').textContent = fechaLegible;
    document.getElementById('actaFacilitador').textContent = facilitatorName || 'Sin registrar';
    document.getElementById('actaCliente').textContent = clientName || 'Sin registrar';
    document.getElementById('actaParticipantes').textContent = `${activeParticipants.length} de ${resultsRoleMeta.keys.length} funciones`;
    document.getElementById('actaNotes').value = '';

    function buildResultsExport(){
      return {
        tipo: 'tabletop-resultados', version: 1,
        cliente: clientName || null,
        facilitador: facilitatorName || null,
        escenario: scenarioMeta.name,
        fecha: nowDate.toISOString(),
        fecha_legible: fechaLegible,
        duracion: duration,
        calificacion: { porcentaje: accuracy, etiqueta: gradeLabel, precision, penalizacion_tiempo: timePenalty, segundos: elapsedSeconds },
        total_preguntas: total,
        errores_alternativas: wrongA,
        errores_personaje: wrongC,
        desglose_por_etapa: resultsStages.map(stageName => ({
          etapa: stageName, ...gameState.stageStats[stageName]
        })),
        informe_ejecutivo: {
          resumen: report.plain.resumen,
          porcentaje_primer_intento: report.plain.firstTryPct,
          etapa_mas_dificil: report.plain.worstStage,
          confusion_principal: report.plain.confusionTop ? {
            se_eligio: roleLabelWithName(report.plain.confusionTop.chosenRole),
            correspondia_a: roleLabelWithName(report.plain.confusionTop.targetRole),
            veces: report.plain.confusionTop.count
          } : null,
          fortalezas: report.plain.strengths,
          recomendaciones: report.plain.recomendaciones,
          plan_de_accion: report.plain.planAccion
        },
        acta: {
          participantes_confirmados: activeParticipants.length,
          notas_facilitador: document.getElementById('actaNotes').value || null
        },
        participantes: activeParticipants.map(p => ({
          funcion: resultsRoleMeta.names[p.roleKey], empresa: p.empresa || null,
          persona: (gameState.personByRole || {})[p.roleKey] || null
        })),
        desempeno_por_funcion: buildPerformanceByRole().rows.map(r => ({
          funcion: r.name, empresa: r.company || null, persona: r.person || null, actos: r.acts,
          identificada_a_la_primera: r.roleFirst, decision_correcta_a_la_primera: r.decisionFirst,
          respuestas_incorrectas: r.wrongAnswers, veces_elegida_sin_corresponderle: r.chosenByMistake
        })),
        detalle_actos: gameState.actLog.map((a, i) => ({
          acto: i + 1, etapa: a.stage, titulo: a.title, debia_actuar: resultsRoleMeta.names[a.target] || a.target,
          funciones_elegidas_por_error: a.wrongRoles.map(r => resultsRoleMeta.names[r] || r),
          respuestas_incorrectas: a.wrongOptions, decision_correcta: a.correctOption, explicacion: a.explanation
        }))
      };
    }

    // Informe completo como Word: cada sección en pantalla (#executiveReport) se convierte a
    // bloques de documento (ver reportElementToDocBlocks), más las notas del acta.
    // Contenido del Word (meta + secciones + nombre de archivo). Se usa para descargarlo ahora y
    // también se guarda con «Guardar ejercicio», para poder bajar el mismo Word después desde
    // "Ejercicios guardados" (ver saved.js).
    function buildReportDocxPayload(){
      const sections = [...reportEl.querySelectorAll('.report-section')].map(sec => {
        const clone = sec.cloneNode(true);
        const titleEl = clone.querySelector('.report-section-title');
        const title = titleEl ? titleEl.textContent.trim() : '';
        if(titleEl) titleEl.remove();
        return {title, blocks: reportElementToDocBlocks(clone)};
      });
      const notes = document.getElementById('actaNotes').value.trim();
      if(notes) sections.push({title: 'Notas del facilitador', blocks: notes.split(/\n\s*\n|\n/).filter(t => t.trim()).map(t => ({type: 'p', runs: [{text: t.trim()}]}))});
      // Formato SGSI (ver docx.js): encabezado, portada, control de cambios y aprobación.
      const mmaaaa = `${String(nowDate.getMonth() + 1).padStart(2, '0')}/${nowDate.getFullYear()}`;
      return {
        meta: {
          docName: 'Informe de ejercicio tabletop',
          coverTitle: 'Informe de ejercicio tabletop',
          coverSubtitle: `${scenarioMeta.name}${clientName ? ' · ' + clientName : ''} · ${fechaLegible}`,
          version: '001',
          code: REPORT_DOC_CODE,
          issueDate: mmaaaa,
          company: clientName || 'TIBOX',
          authorRole: 'Facilitador del ejercicio (TIBOX)',
          approverRole: 'Facilitador del ejercicio',
          approverCompany: 'TIBOX'
        },
        sections,
        filename: `informe_tabletop_${(clientName || 'cliente').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${scenarioMeta.id}.docx`
      };
    }
    function downloadReportDocx(){
      TibDocx.downloadReportDocx(buildReportDocxPayload())
        .catch(err => { console.error(err); alert('No se pudo generar el Word del informe.'); });
    }

    // PDF: la ventana de impresión del navegador ("Guardar como PDF"). Las notas del acta se
    // copian a un bloque solo-impresión porque un <textarea> no se imprime completo.
    function printReport(){
      const notes = document.getElementById('actaNotes').value.trim();
      const printNotes = document.getElementById('actaNotesPrint');
      printNotes.textContent = notes;
      printNotes.classList.toggle('hidden', !notes);
      window.print();
    }

    document.getElementById('downloadReportDocxBtn').onclick = downloadReportDocx;
    document.getElementById('printReportBtn').onclick = printReport;

    function downloadResults(){
      const jsonStr = JSON.stringify(buildResultsExport(), null, 2);
      const blob = new Blob([jsonStr], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `tabletop-resultado_${(clientName || 'cliente').toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${scenarioMeta.id}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    document.getElementById('downloadResultsBtn').onclick = downloadResults;
    document.getElementById('downloadResultsBtnBottom').onclick = downloadResults;
    document.getElementById('copyResultsBtn').onclick = () => {
      const btn = document.getElementById('copyResultsBtn'); const orig = btn.textContent;
      if(!navigator.clipboard || !navigator.clipboard.writeText){
        btn.textContent = 'No disponible en este navegador'; setTimeout(() => btn.textContent = orig, 2000);
        return;
      }
      navigator.clipboard.writeText(JSON.stringify(buildResultsExport(), null, 2)).then(() => {
        btn.textContent = 'Copiado ✓'; setTimeout(() => btn.textContent = orig, 1500);
      }).catch(() => {
        btn.textContent = 'No se pudo copiar'; setTimeout(() => btn.textContent = orig, 2000);
      });
    };

    // «Guardar ejercicio»: persiste el resultado en localStorage (no depende de que el facilitador
    // recuerde descargar el JSON) y con eso da por cerrado el ejercicio, volviendo a la configuración.
    document.getElementById('saveExerciseBtn').onclick = () => {
      const record = buildResultsExport();
      record.id = `exercise_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      record.guardado_en = new Date().toISOString();
      record.informe_word = buildReportDocxPayload();
      const list = loadSavedExercises();
      list.push(record);
      if(!saveExercisesList(list)){
        showConfirmModal({
          title: 'No se pudo guardar',
          message: 'El navegador no permitió guardar el ejercicio (almacenamiento lleno o bloqueado). Descarga los resultados (JSON) o el informe en Word antes de cerrar.',
          confirmText: 'Entendido', cancelText: null
        });
        return;
      }
      showConfirmModal({
        title: 'Ejercicio guardado',
        message: `El resultado de <b>${escapeHtml(scenarioMeta.name)}</b>${clientName ? ` para <b>${escapeHtml(clientName)}</b>` : ''} quedó guardado en este navegador (${list.length} ejercicio${list.length === 1 ? '' : 's'} guardado${list.length === 1 ? '' : 's'} en total). Puedes verlo cuando quieras en <b>Ejercicios guardados</b>, en el primer paso de la configuración.`,
        confirmText: 'Cerrar y volver a la configuración', cancelText: null
      }).then(closeExerciseToSetup);
    };
  }

  // Cierra el ejercicio y vuelve a la configuración (lo que haya que reactivar ahí lo hace app.js).
  function closeExerciseToSetup(){
    TabletopScreens.show('setup', {scroll: false});
    deps.onClose();
  }

  function init(d){
    deps = d;
    document.getElementById('goToReportBtn').addEventListener('click', () => TabletopScreens.show('report'));
    document.getElementById('backToResultsBtn').addEventListener('click', () => TabletopScreens.show('results'));
    document.getElementById('backFromResultsBtn').addEventListener('click', closeExerciseToSetup);
  }

  return {init, show};
})();
