// "Ejercicios guardados": lista los resultados que «Guardar ejercicio» deja en este navegador
// (localStorage, ver report.js) y permite ver su resumen, bajar el informe en Word o el JSON,
// borrarlos e importar un JSON exportado (de otro navegador o computador).
// Los ejercicios guardados desde ahora traen el Word ya armado (informe_word); para los antiguos
// el Word se reconstruye con los datos del JSON (sectionsFromRecord).
// Todo el texto viene de datos guardados o de un archivo importado: siempre se escapa.
// Script clásico: window.TabletopSaved.init(deps) desde app.js.
window.TabletopSaved = (function(){
  // deps: {escapeHtml, showConfirmModal, loadSavedExercises, saveExercisesList}
  let deps = null;
  let overlay = null;
  const REPORT_DOC_CODE = 'INF-TT';
  const esc = s => deps.escapeHtml(s == null ? '' : String(s));
  const actTitle = t => String(t || '').replace(/^\s*acto\s+\d+\s*[·:\-–—]\s*/i, '').trim();
  const slug = s => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  const list = () => deps.loadSavedExercises().filter(r => r && r.tipo === 'tabletop-resultados');
  const savedAt = r => new Date(r.guardado_en || r.fecha || 0);
  function fmtDate(r){
    const d = savedAt(r);
    if(isNaN(d)) return r.fecha_legible || '—';
    return d.toLocaleDateString('es-CL', {day: '2-digit', month: 'short', year: 'numeric'}) + ' · ' +
      d.toLocaleTimeString('es-CL', {hour: '2-digit', minute: '2-digit'});
  }
  function gradeClass(pct){
    return pct >= 90 ? 'g-excelente' : pct >= 75 ? 'g-bueno' : pct >= 50 ? 'g-regular' : 'g-refuerzo';
  }
  function gradeChip(r){
    const c = r.calificacion || {};
    const pct = Number(c.porcentaje) || 0;
    return `<span class="sv-grade ${gradeClass(pct)}">${pct}%${c.etiqueta ? ` · ${esc(c.etiqueta)}` : ''}</span>`;
  }

  // ---------------- Word ----------------
  // Mismo informe que report.js, armado con los datos del JSON (para ejercicios guardados antes
  // de que se guardara el Word junto al resultado).
  function sectionsFromRecord(r){
    const p = text => ({type: 'p', runs: [{text: String(text)}]});
    const pb = (label, text) => ({type: 'p', runs: [{text: label + ' ', bold: true}, {text: String(text)}]});
    const ie = r.informe_ejecutivo || {};
    const c = r.calificacion || {};
    const sections = [];
    const parts = r.participantes || [];
    const hasPeople = parts.some(x => x.persona);
    sections.push({title: 'Contexto del ejercicio', blocks: [
      {type: 'table', header: true, rows: [['Dato', 'Detalle'],
        ['Escenario', r.escenario || '—'], ['Cliente', r.cliente || 'Sin registrar'], ['Facilitador', r.facilitador || 'Sin registrar'],
        ['Fecha', r.fecha_legible || '—'], ['Duración', r.duracion || '—'], ['Puntuación', `${c.porcentaje ?? '—'}% · ${c.etiqueta || ''}`]]},
      ...(parts.length ? [{type: 'heading', level: 3, text: 'Funciones que participaron'},
        {type: 'table', header: true, rows: [hasPeople ? ['Función', 'Empresa', 'Persona'] : ['Función', 'Empresa'],
          ...parts.map(x => hasPeople ? [x.funcion || '—', x.empresa || '—', x.persona || '—'] : [x.funcion || '—', x.empresa || '—'])]}] : [])
    ]});
    if(ie.resumen) sections.push({title: 'Resumen ejecutivo', blocks: [p(ie.resumen)]});
    const perf = r.desempeno_por_funcion || [];
    if(perf.length){
      sections.push({title: 'Desempeño por función', blocks: [{type: 'table', header: true, rows: [
        ['Función', 'Empresa', 'Actos', 'Función a la primera', 'Decisión a la primera', 'Respuestas incorrectas', 'Elegida por error'],
        ...perf.map(x => [x.funcion || '—', x.empresa || '—', String(x.actos ?? 0),
          x.actos ? `${x.identificada_a_la_primera} de ${x.actos}` : '—', x.actos ? `${x.decision_correcta_a_la_primera} de ${x.actos}` : '—',
          String(x.respuestas_incorrectas ?? 0), String(x.veces_elegida_sin_corresponderle ?? 0)])]}]});
    }
    if(ie.confusion_principal){
      const cp = ie.confusion_principal;
      sections.push({title: 'Patrones al asignar responsables', blocks: [p(`El patrón más marcado fue elegir a ${cp.se_eligio} cuando correspondía a ${cp.correspondia_a} (${cp.veces} ${cp.veces === 1 ? 'vez' : 'veces'}).`)]});
    }
    if(ie.porcentaje_primer_intento != null){
      sections.push({title: 'Primera respuesta correcta', blocks: [p(`El ${ie.porcentaje_primer_intento}% de las preguntas se resolvió al primer intento.${ie.etapa_mas_dificil ? ` La etapa más costosa fue ${ie.etapa_mas_dificil}.` : ''}`)]});
    }
    const fort = ie.fortalezas || [];
    sections.push({title: 'Fortalezas identificadas', blocks: fort.length
      ? [p(`${fort.length === 1 ? 'La etapa' : 'Las etapas'} de ${fort.join(', ')} se resolvieron sin errores de función ni reintentos.`)]
      : [p('Ninguna etapa quedó completamente libre de errores o reintentos.')]});
    const acts = r.detalle_actos || [];
    if(acts.length){
      const blocks = [];
      acts.forEach(a => {
        blocks.push({type: 'heading', level: 3, text: `Acto ${a.acto} · ${a.etapa || ''}${actTitle(a.titulo) ? ' · ' + actTitle(a.titulo) : ''}`});
        blocks.push(pb('Debía actuar:', a.debia_actuar || '—'));
        const wr = a.funciones_elegidas_por_error || [];
        blocks.push(pb('Función:', wr.length ? `✕ Antes se eligió a ${wr.join(', ')}` : '✓ Identificada a la primera'));
        const wo = a.respuestas_incorrectas || [];
        blocks.push(pb('Decisión:', wo.length ? `✕ ${wo.length} respuesta${wo.length === 1 ? '' : 's'} incorrecta${wo.length === 1 ? '' : 's'} antes de la correcta:` : '✓ Correcta a la primera'));
        wo.forEach(o => blocks.push({type: 'bullet', runs: [{text: String(o)}]}));
        if(a.decision_correcta) blocks.push(pb('Decisión correcta:', a.decision_correcta));
        if(a.explicacion) blocks.push(p(a.explicacion));
      });
      sections.push({title: 'Detalle acto por acto', blocks});
    }
    const recs = ie.recomendaciones || [];
    if(recs.length) sections.push({title: 'Recomendaciones', blocks: recs.map(t => ({type: 'bullet', runs: [{text: String(t)}]}))});
    const plan = ie.plan_de_accion || [];
    if(plan.length) sections.push({title: 'Plan de acción', blocks: [{type: 'table', header: true, rows: [['Acción', 'Responsable sugerido', 'Plazo'],
      ...plan.map(x => [x.accion || '', x.responsable || '', x.plazo || ''])]}]});
    const notes = r.acta && r.acta.notas_facilitador;
    if(notes) sections.push({title: 'Notas del facilitador', blocks: String(notes).split(/\n\s*\n|\n/).filter(t => t.trim()).map(t => p(t.trim()))});
    return sections;
  }
  function docxPayload(r){
    if(r.informe_word && Array.isArray(r.informe_word.sections)) return r.informe_word;
    const d = savedAt(r);
    const mmaaaa = isNaN(d) ? '' : `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return {
      meta: {
        docName: 'Informe de ejercicio tabletop', coverTitle: 'Informe de ejercicio tabletop',
        coverSubtitle: `${r.escenario || ''}${r.cliente ? ' · ' + r.cliente : ''}${r.fecha_legible ? ' · ' + r.fecha_legible : ''}`,
        version: '001', code: REPORT_DOC_CODE, issueDate: mmaaaa, company: r.cliente || 'TIBOX',
        authorRole: 'Facilitador del ejercicio (TIBOX)', approverRole: 'Facilitador del ejercicio', approverCompany: 'TIBOX'
      },
      sections: sectionsFromRecord(r),
      filename: `informe_tabletop_${slug(r.cliente || 'cliente')}_${slug(r.escenario || 'escenario')}.docx`
    };
  }
  function downloadWord(r){
    TibDocx.downloadReportDocx(docxPayload(r))
      .catch(err => { console.error(err); alert('No se pudo generar el Word del informe.'); });
  }
  function downloadJson(r){
    const copy = Object.assign({}, r);
    delete copy.informe_word;
    const blob = new Blob([JSON.stringify(copy, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tabletop-resultado_${slug(r.cliente || 'cliente')}_${slug(r.escenario || 'escenario')}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  async function remove(r){
    const ok = await deps.showConfirmModal({
      title: 'Borrar ejercicio',
      message: `¿Borrar el ejercicio <b>${esc(r.escenario)}</b>${r.cliente ? ` de <b>${esc(r.cliente)}</b>` : ''} (${esc(fmtDate(r))})? Esta acción no se puede deshacer. Si lo necesitas, descarga antes el Word o el JSON.`,
      confirmText: 'Borrar', cancelText: 'Cancelar'
    });
    if(!ok) return false;
    deps.saveExercisesList(deps.loadSavedExercises().filter(x => x.id !== r.id));
    return true;
  }

  // ---------------- importar ----------------
  async function importFile(file){
    let data;
    try{ data = JSON.parse(await file.text()); }
    catch(e){ return notify('No se pudo importar', 'El archivo no es un JSON válido.'); }
    const incoming = (Array.isArray(data) ? data : [data]).filter(r => r && typeof r === 'object' && r.tipo === 'tabletop-resultados');
    if(!incoming.length) return notify('No se pudo importar', 'El archivo no contiene resultados de un ejercicio tabletop.');
    const current = deps.loadSavedExercises();
    const sig = r => r.id || `${r.guardado_en || r.fecha}|${r.escenario}|${r.cliente}`;
    const known = new Set(current.map(sig));
    let added = 0;
    incoming.forEach(r => {
      if(known.has(sig(r))) return;
      if(!r.id) r.id = `exercise_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      if(!r.guardado_en) r.guardado_en = r.fecha || new Date().toISOString();
      current.push(r); known.add(sig(r)); added++;
    });
    if(added && !deps.saveExercisesList(current)) return notify('No se pudo importar', 'El navegador no permitió guardar (almacenamiento lleno o bloqueado).');
    renderList();
    notify('Importación lista', added
      ? `Se agregaron <b>${added}</b> ejercicio${added === 1 ? '' : 's'}.${incoming.length - added ? ` ${incoming.length - added} ya estaba${incoming.length - added === 1 ? '' : 'n'} guardado${incoming.length - added === 1 ? '' : 's'}.` : ''}`
      : 'Todos los ejercicios del archivo ya estaban guardados.');
  }
  function notify(title, message){
    return deps.showConfirmModal({title, message, confirmText: 'Entendido', cancelText: null});
  }

  // ---------------- ventana ----------------
  function close(){
    if(!overlay) return;
    overlay.remove(); overlay = null;
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){
    // Si hay una confirmación abierta encima, Escape la cierra a ella, no a esta ventana.
    if(e.key === 'Escape' && !document.querySelector('.modal-overlay:not(.sv-overlay)')) close();
  }
  function open(){
    close();
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay sv-overlay';
    overlay.innerHTML = `
      <div class="modal-box sv-box" role="dialog" aria-modal="true" aria-labelledby="svTitle">
        <div class="modal-head">
          <div>
            <div class="modal-title" id="svTitle">Ejercicios guardados</div>
            <div class="sv-sub">Guardados en este navegador. Si cambias de computador o borras los datos de navegación, se pierden: descarga el Word o el JSON de los que quieras conservar.</div>
          </div>
          <button class="modal-close-btn" id="svClose" aria-label="Cerrar">✕</button>
        </div>
        <div class="sv-body" id="svBody"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#svClose').addEventListener('click', close);
    overlay.addEventListener('mousedown', e => { if(e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
    renderList();
  }

  function renderList(){
    if(!overlay) return;
    const body = overlay.querySelector('#svBody');
    const items = list().sort((a, b) => savedAt(b) - savedAt(a));
    body.innerHTML = `
      <div class="sv-toolbar">
        <span class="sv-count">${items.length} ejercicio${items.length === 1 ? '' : 's'}</span>
        <label class="btn btn-sm sv-import">Importar JSON<input type="file" accept=".json,application/json" id="svImport" hidden></label>
      </div>
      ${items.length ? `<div class="sv-list">${items.map(r => `
        <div class="sv-row" data-id="${esc(r.id)}">
          <div class="sv-row-main">
            <div class="sv-row-date">${esc(fmtDate(r))}</div>
            <div class="sv-row-title">${esc(r.escenario || 'Ejercicio')}</div>
            <div class="sv-row-meta">${esc([r.cliente, r.facilitador, r.duracion ? `Duración ${r.duracion}` : ''].filter(Boolean).join(' · '))}</div>
          </div>
          ${gradeChip(r)}
          <div class="sv-row-actions">
            <button class="btn btn-sm btn-primary" data-act="view">Ver</button>
            <button class="btn btn-sm" data-act="word">Word</button>
            <button class="btn btn-sm" data-act="json">JSON</button>
            <button class="sv-del" data-act="del" title="Borrar" aria-label="Borrar ejercicio">✕</button>
          </div>
        </div>`).join('')}</div>`
      : `<div class="sv-empty">Todavía no hay ejercicios guardados en este navegador. Al terminar un ejercicio, usa <b>Guardar ejercicio</b> en el informe.</div>`}`;
    body.querySelector('#svImport').addEventListener('change', e => { const f = e.target.files[0]; if(f) importFile(f); e.target.value = ''; });
    body.querySelectorAll('.sv-row').forEach(row => {
      const r = items.find(x => String(x.id) === row.dataset.id);
      row.querySelectorAll('[data-act]').forEach(btn => btn.addEventListener('click', async () => {
        const act = btn.dataset.act;
        if(act === 'view') renderDetail(r);
        else if(act === 'word') downloadWord(r);
        else if(act === 'json') downloadJson(r);
        else if(act === 'del' && await remove(r)) renderList();
      }));
    });
  }

  function renderDetail(r){
    const body = overlay.querySelector('#svBody');
    const c = r.calificacion || {};
    const ie = r.informe_ejecutivo || {};
    const perf = r.desempeno_por_funcion || [];
    const plan = ie.plan_de_accion || [];
    const recs = ie.recomendaciones || [];
    const notes = r.acta && r.acta.notas_facilitador;
    body.innerHTML = `
      <div class="sv-toolbar">
        <button class="btn btn-sm" id="svBack">← Todos los ejercicios</button>
        <div class="sv-detail-actions">
          <button class="btn btn-sm btn-primary" id="svWord">Descargar Word</button>
          <button class="btn btn-sm" id="svJson">JSON</button>
          <button class="btn btn-sm sv-del-btn" id="svDel">Borrar</button>
        </div>
      </div>
      <div class="sv-detail">
        <div class="sv-detail-head">
          <div>
            <div class="sv-row-date">${esc(fmtDate(r))}</div>
            <div class="sv-detail-title">${esc(r.escenario || 'Ejercicio')}</div>
            <div class="sv-row-meta">${esc([r.cliente, r.facilitador ? `Facilitador: ${r.facilitador}` : ''].filter(Boolean).join(' · '))}</div>
          </div>
          ${gradeChip(r)}
        </div>
        <div class="sv-kpis">
          <div class="sv-kpi"><b>${esc(c.porcentaje ?? '—')}%</b><span>Nota</span></div>
          <div class="sv-kpi"><b>${esc(ie.porcentaje_primer_intento ?? '—')}%</b><span>Decisión a la primera</span></div>
          <div class="sv-kpi"><b>${esc(r.duracion || '—')}</b><span>Duración</span></div>
          <div class="sv-kpi"><b class="is-fn">${esc(r.errores_personaje ?? 0)}</b><span>Errores de función</span></div>
          <div class="sv-kpi"><b class="is-resp">${esc(r.errores_alternativas ?? 0)}</b><span>Errores de respuesta</span></div>
        </div>
        ${ie.resumen ? `<div class="sv-sec"><div class="fc-label">Resumen ejecutivo</div><p>${esc(ie.resumen)}</p></div>` : ''}
        ${perf.length ? `<div class="sv-sec"><div class="fc-label">Desempeño por función</div><div class="table-wrap"><table class="ptable sv-table">
          <thead><tr><th>Función</th><th>Empresa</th><th>Actos</th><th>Función a la primera</th><th>Decisión a la primera</th><th>Resp. incorrectas</th></tr></thead>
          <tbody>${perf.map(x => `<tr><td>${esc(x.funcion)}</td><td>${esc(x.empresa || '—')}</td><td>${esc(x.actos)}</td>
            <td>${x.actos ? `${esc(x.identificada_a_la_primera)} de ${esc(x.actos)}` : '—'}</td><td>${x.actos ? `${esc(x.decision_correcta_a_la_primera)} de ${esc(x.actos)}` : '—'}</td><td>${esc(x.respuestas_incorrectas)}</td></tr>`).join('')}</tbody>
        </table></div></div>` : ''}
        ${recs.length ? `<div class="sv-sec"><div class="fc-label">Recomendaciones</div><ul>${recs.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
        ${plan.length ? `<div class="sv-sec"><div class="fc-label">Plan de acción</div><div class="table-wrap"><table class="ptable sv-table">
          <thead><tr><th>Acción</th><th>Responsable sugerido</th><th>Plazo</th></tr></thead>
          <tbody>${plan.map(x => `<tr><td>${esc(x.accion)}</td><td>${esc(x.responsable)}</td><td>${esc(x.plazo)}</td></tr>`).join('')}</tbody>
        </table></div></div>` : ''}
        ${notes ? `<div class="sv-sec"><div class="fc-label">Notas del facilitador</div><p>${esc(notes)}</p></div>` : ''}
        <p class="sv-hint">El detalle acto por acto y el resto del informe están en el Word.</p>
      </div>`;
    body.querySelector('#svBack').addEventListener('click', renderList);
    body.querySelector('#svWord').addEventListener('click', () => downloadWord(r));
    body.querySelector('#svJson').addEventListener('click', () => downloadJson(r));
    body.querySelector('#svDel').addEventListener('click', async () => { if(await remove(r)) renderList(); });
    body.scrollTop = 0;
  }

  function init(d){
    deps = d;
    const btn = document.getElementById('savedExercisesBtn');
    if(btn) btn.addEventListener('click', open);
  }

  return {init, open};
})();
