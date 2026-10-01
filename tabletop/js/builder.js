// Constructor de escenarios: en vez de editar a mano la plantilla Word, un cuestionario paso a
// paso en su propia pantalla (#screen-builder) que termina generando el mismo .docx que lee
// TibDocx.parseScenarioDocxFile (ver docx.js), o registra el escenario directo en la sesión
// ("Usar ahora"). Separado de app.js porque es una herramienta aparte con su propio estado; lo
// único que necesita de app.js entra por init(deps) (ver el final de app.js).
window.TabletopBuilder = (function(){
  // deps: {escapeHtml, checkIcon, useScenario(data)} — useScenario registra el escenario armado
  // en la sesión, lo deja seleccionado y vuelve a la configuración.
  let deps = null;
  function escapeHtml(s){ return deps.escapeHtml(s); }

  const BUILDER_STEPS = ['Datos', 'Funciones', 'Etapas y actos', 'Revisar y generar'];
  const BUILDER_EXTRA_ROLES = [['legal','Legal'], ['comunicaciones','Comunicaciones'], ['rrhh','RRHH'], ['direccion','Dirección']];
  const BUILDER_LETTERS = ['A','B','C','D'];
  let builderState = null;
  let builderStep = 1;

  function freshBuilderState(){
    return {name:'', blurb:'', target:'', intro:'', roleMode:'standard', extraRoleKeys:[], customRoles:[], stages:[]};
  }
  function newRoleKey(){ return 'rol_' + Math.random().toString(36).slice(2, 8); }
  function freshBuilderQuestion(){
    return {target:'', title:'', meta:[], situation:'', options:['','','',''], explanations:['','','',''], correctIndex:0, mismatchContext:''};
  }
  // Lista de funciones disponibles para elegir como "quién responde" en un acto — según el modo
  // de funciones elegido en el paso 2 (estándar + adicionales marcadas, o la lista propia).
  function builderRoleList(){
    if(builderState.roleMode === 'custom') return builderState.customRoles;
    return ['seguridad', 'ti', ...builderState.extraRoleKeys].map(k => ({key:k, name: ROLE_NAMES[k]}));
  }
  function builderIsCustomRoles(){ return builderState.roleMode === 'custom'; }

  function builderValidate(){
    const errors = [];
    const s = builderState;
    if(!s.name.trim()) errors.push('Falta el nombre del escenario.');
    const roles = builderRoleList();
    if(builderIsCustomRoles() && roles.length === 0) errors.push('Agrega al menos una función propia.');
    if(builderIsCustomRoles() && roles.some(r => !r.name.trim())) errors.push('Hay una función propia sin nombre.');
    if(s.stages.length === 0) errors.push('Agrega al menos una etapa.');
    s.stages.forEach((st, si) => {
      const stageLabel = st.stage.trim() || `Etapa ${si + 1}`;
      if(!st.stage.trim()) errors.push(`La etapa ${si + 1} no tiene nombre.`);
      if(st.questions.length === 0){ errors.push(`La etapa "${stageLabel}" no tiene ningún acto.`); return; }
      st.questions.forEach((q, qi) => {
        const missing = [];
        if(!q.target || !roles.some(r => r.key === q.target)) missing.push('función que responde');
        if(!q.title.trim()) missing.push('título');
        if(!q.situation.trim()) missing.push('situación');
        if(q.options.some(o => !o.trim())) missing.push('las 4 alternativas');
        if(q.explanations.some(e => !e.trim())) missing.push('las 4 explicaciones');
        if(missing.length) errors.push(`Etapa "${stageLabel}", acto ${qi + 1}: falta ${missing.join(', ')}.`);
      });
    });
    return errors;
  }

  function builderToDocxScenario(){
    const s = builderState;
    const isCustom = builderIsCustomRoles();
    const roleNames = {};
    if(isCustom) s.customRoles.forEach(r => { roleNames[r.key] = r.name; });
    return {
      name: s.name.trim(), blurb: s.blurb.trim(), target: s.target.trim(), intro: s.intro.trim(),
      roleNames: isCustom ? roleNames : undefined,
      customRoleList: isCustom ? s.customRoles : null,
      extraRoleKeys: isCustom ? [] : s.extraRoleKeys,
      stages: s.stages
    };
  }
  function builderToRegisterData(){
    const s = builderState;
    const isCustom = builderIsCustomRoles();
    return {
      name: s.name.trim(), blurb: s.blurb.trim(), target: s.target.trim(), intro: s.intro.trim(),
      customStages: s.stages.map(st => st.stage),
      customRoles: isCustom ? s.customRoles : null,
      extraRoleKeys: isCustom ? [] : s.extraRoleKeys,
      stages: s.stages
    };
  }

  function openBuilder(){
    builderState = freshBuilderState();
    builderStep = 1;
    TabletopScreens.show('builder');
    renderBuilder();
  }
  function closeBuilder(){
    TabletopScreens.show('setup', {scroll: false});
  }

  function renderBuilderStepper(){
    document.getElementById('builderStepper').innerHTML = BUILDER_STEPS.map((label, i) => {
      const n = i + 1;
      const done = n < builderStep;
      const active = n === builderStep;
      const cls = ['wizard-step-item', done ? 'done' : '', active ? 'active' : ''].filter(Boolean).join(' ');
      return `<div class="${cls}"><span class="wizard-step-n">${done ? deps.checkIcon : n}</span><span class="wizard-step-label">${escapeHtml(label)}</span></div>`;
    }).join('');
  }

  function builderStep1Html(){
    const s = builderState;
    return `
      <div class="builder-step">
        <div class="field-row">
          <label>Nombre del escenario</label>
          <input type="text" id="bldName" value="${escapeHtml(s.name)}" placeholder="Ej: Ataque al proveedor de nómina">
        </div>
        <div class="field-row">
          <label>Descripción corta (se muestra en la tarjeta de selección)</label>
          <input type="text" id="bldBlurb" value="${escapeHtml(s.blurb)}" placeholder="Una frase que resuma el ataque">
        </div>
        <div class="field-row">
          <label>Activo u objetivo principal afectado</label>
          <input type="text" id="bldTarget" value="${escapeHtml(s.target)}" placeholder="Ej: Servidor de nómina">
        </div>
        <div class="field-row" style="margin-bottom:0;">
          <label>Introducción (se muestra en pantalla antes de la primera etapa)</label>
          <textarea id="bldIntro" style="min-height:120px;" placeholder="Presenta la organización, el momento en que ocurre el ejercicio y qué se busca practicar, sin adelantar lo que va a pasar. Deja una línea en blanco entre párrafos.">${escapeHtml(s.intro)}</textarea>
        </div>
      </div>`;
  }
  function wireBuilderStep1(){
    document.getElementById('bldName').addEventListener('input', e => { builderState.name = e.target.value; });
    document.getElementById('bldBlurb').addEventListener('input', e => { builderState.blurb = e.target.value; });
    document.getElementById('bldTarget').addEventListener('input', e => { builderState.target = e.target.value; });
    document.getElementById('bldIntro').addEventListener('input', e => { builderState.intro = e.target.value; });
  }

  function builderStep2Html(){
    const s = builderState;
    return `
      <div class="builder-step">
        <div class="builder-role-mode">
          <button type="button" class="builder-mode-btn${s.roleMode === 'standard' ? ' active' : ''}" data-mode="standard">Organigrama estándar</button>
          <button type="button" class="builder-mode-btn${s.roleMode === 'custom' ? ' active' : ''}" data-mode="custom">Funciones propias</button>
        </div>
        ${s.roleMode === 'standard' ? `
          <p class="builder-hint">Seguridad y TI participan siempre. Marca qué otras funciones participan en este escenario.</p>
          <div class="builder-role-checks">
            ${BUILDER_EXTRA_ROLES.map(([k, name]) => `
              <label class="builder-role-check">
                <input type="checkbox" data-extra-role="${k}" ${s.extraRoleKeys.includes(k) ? 'checked' : ''}>
                ${escapeHtml(name)}
              </label>`).join('')}
          </div>
        ` : `
          <p class="builder-hint">Define las funciones propias de este ejercicio (ej. "Encargado Regulatorio", "Team Leader del cliente") — se usarán en vez de Seguridad/TI/Legal/Comunicaciones/RRHH/Dirección.</p>
          <div class="builder-role-list" id="bldCustomRoleList">
            ${s.customRoles.map((r, i) => `
              <div class="builder-role-item">
                <input type="text" data-role-i="${i}" value="${escapeHtml(r.name)}" placeholder="Nombre de la función">
                <button type="button" class="pc-empresa-remove" data-remove-role="${i}" aria-label="Quitar función">×</button>
              </div>`).join('') || '<p class="builder-hint">Todavía no agregaste ninguna función.</p>'}
          </div>
          <button type="button" class="btn btn-sm" id="bldAddRole">+ Agregar función</button>
        `}
      </div>`;
  }
  function wireBuilderStep2(){
    document.querySelectorAll('.builder-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => { builderState.roleMode = btn.dataset.mode; renderBuilder(); });
    });
    if(builderState.roleMode === 'standard'){
      document.querySelectorAll('[data-extra-role]').forEach(cb => {
        cb.addEventListener('change', e => {
          const k = cb.dataset.extraRole;
          if(e.target.checked){ if(!builderState.extraRoleKeys.includes(k)) builderState.extraRoleKeys.push(k); }
          else { builderState.extraRoleKeys = builderState.extraRoleKeys.filter(x => x !== k); }
        });
      });
    } else {
      document.querySelectorAll('[data-role-i]').forEach(inp => {
        inp.addEventListener('input', e => { builderState.customRoles[parseInt(inp.dataset.roleI, 10)].name = e.target.value; });
      });
      document.querySelectorAll('[data-remove-role]').forEach(btn => {
        btn.addEventListener('click', () => { builderState.customRoles.splice(parseInt(btn.dataset.removeRole, 10), 1); renderBuilder(); });
      });
      const addBtn = document.getElementById('bldAddRole');
      if(addBtn) addBtn.addEventListener('click', () => { builderState.customRoles.push({key: newRoleKey(), name: ''}); renderBuilder(); });
    }
  }

  function builderStep3Html(){
    const s = builderState;
    return `
      <div class="builder-step">
        <p class="builder-hint">Agrega las etapas del incidente en el orden en que se juegan y, dentro de cada una, uno o más actos (preguntas).</p>
        <div class="builder-stage-list" id="bldStageList">
          ${s.stages.map((st, si) => builderStageCardHtml(st, si)).join('') || '<p class="builder-hint">Todavía no agregaste ninguna etapa.</p>'}
        </div>
        <button type="button" class="btn btn-sm" id="bldAddStage">+ Agregar etapa</button>
      </div>`;
  }
  function builderStageCardHtml(st, si){
    const roles = builderRoleList();
    return `
      <div class="builder-stage-card">
        <div class="builder-stage-head">
          <span class="builder-stage-n">${si + 1}</span>
          <input type="text" data-stage-i="${si}" value="${escapeHtml(st.stage)}" placeholder="Nombre de la etapa (ej: Detección)">
          <button type="button" class="pc-empresa-remove" data-remove-stage="${si}" aria-label="Quitar etapa">×</button>
        </div>
        <div class="builder-act-list">
          ${st.questions.map((q, qi) => builderActRowHtml(q, si, qi, roles)).join('') || '<p class="builder-hint" style="margin:0;">Sin actos todavía.</p>'}
        </div>
        <button type="button" class="btn btn-sm" data-add-act="${si}">+ Agregar acto</button>
      </div>`;
  }
  function builderActRowHtml(q, si, qi, roles){
    const role = roles.find(r => r.key === q.target);
    const complete = !!(q.target && role && q.title.trim() && q.situation.trim() && q.options.every(o => o.trim()) && q.explanations.every(e => e.trim()));
    return `
      <div class="builder-act-row${complete ? '' : ' is-incomplete'}">
        <span class="builder-act-title">${escapeHtml(q.title || `Acto ${qi + 1} (sin título)`)}</span>
        <span class="builder-act-target">${escapeHtml(role ? role.name : 'sin función')}</span>
        ${complete ? '' : '<span class="builder-act-incomplete-tag">Incompleto</span>'}
        <button type="button" class="btn btn-sm" data-edit-act="${si}:${qi}">Editar</button>
        <button type="button" class="pc-empresa-remove" data-remove-act="${si}:${qi}" aria-label="Quitar acto">×</button>
      </div>`;
  }
  function wireBuilderStep3(){
    document.querySelectorAll('[data-stage-i]').forEach(inp => {
      inp.addEventListener('input', e => { builderState.stages[parseInt(inp.dataset.stageI, 10)].stage = e.target.value; });
    });
    document.querySelectorAll('[data-remove-stage]').forEach(btn => {
      btn.addEventListener('click', () => { builderState.stages.splice(parseInt(btn.dataset.removeStage, 10), 1); renderBuilder(); });
    });
    document.querySelectorAll('[data-add-act]').forEach(btn => {
      btn.addEventListener('click', () => openActEditor(parseInt(btn.dataset.addAct, 10), null));
    });
    document.querySelectorAll('[data-edit-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [si, qi] = btn.dataset.editAct.split(':').map(Number);
        openActEditor(si, qi);
      });
    });
    document.querySelectorAll('[data-remove-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [si, qi] = btn.dataset.removeAct.split(':').map(Number);
        builderState.stages[si].questions.splice(qi, 1);
        renderBuilder();
      });
    });
    const addStageBtn = document.getElementById('bldAddStage');
    if(addStageBtn) addStageBtn.addEventListener('click', () => { builderState.stages.push({stage:'', questions:[]}); renderBuilder(); });
  }

  // ---- editor de acto: modal ancho sobre la pantalla del constructor ----
  let closeActEditorFn = null;
  function closeActEditor(){ if(closeActEditorFn) closeActEditorFn(); }
  function openActEditor(si, qi){
    closeActEditor();
    const isNew = qi == null;
    const q = isNew ? freshBuilderQuestion() : JSON.parse(JSON.stringify(builderState.stages[si].questions[qi]));
    const roles = builderRoleList();
    const stageLabel = builderState.stages[si].stage || `Etapa ${si + 1}`;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box builder-act-modal" role="dialog" aria-modal="true" aria-labelledby="actModalTitle">
        <div class="modal-head">
          <div class="modal-title" id="actModalTitle">${isNew ? 'Nuevo acto' : 'Editar acto'} — ${escapeHtml(stageLabel)}</div>
          <button class="modal-close-btn" id="actModalClose" aria-label="Cerrar">✕</button>
        </div>
        <div class="builder-step">
          <div class="builder-act-grid">
            <div class="field-row" style="margin-bottom:0;">
              <label>Función que responde</label>
              <select id="actTarget">
                <option value="">— Elegir —</option>
                ${roles.map(r => `<option value="${escapeHtml(r.key)}" ${q.target === r.key ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}
              </select>
            </div>
            <div class="field-row" style="margin-bottom:0;">
              <label>Título del acto</label>
              <input type="text" id="actTitle" value="${escapeHtml(q.title)}" placeholder='Ej: Acto 1 · El correo del banco'>
            </div>
          </div>
          <div class="field-row" style="margin-bottom:0;">
            <label>Contexto (opcional — hora, día, canal, sistema, separados por coma)</label>
            <input type="text" id="actMeta" value="${escapeHtml((q.meta || []).join(', '))}" placeholder="Ej: 09:12, martes, Teams, Microsoft 365">
          </div>
          <div class="field-row" style="margin-bottom:0;">
            <label>Situación (uno o más párrafos)</label>
            <textarea id="actSituation" placeholder="Describe la situación que el equipo debe resolver: quién, qué pasó, qué se sabe y qué no todavía." style="min-height:120px;">${escapeHtml(q.situation)}</textarea>
          </div>
          <div>
            <label>Alternativas (marca la correcta)</label>
            <div class="builder-opt-list">
              ${BUILDER_LETTERS.map((letter, i) => `
                <div class="builder-opt-row${q.correctIndex === i ? ' is-correct' : ''}" data-opt-row="${i}">
                  <div class="builder-opt-head">
                    <span class="builder-opt-letter">${letter}</span>
                    <label class="builder-opt-correct-label"><input type="radio" name="actCorrect" value="${i}" ${q.correctIndex === i ? 'checked' : ''}> Correcta</label>
                  </div>
                  <textarea data-opt-text="${i}" placeholder="Texto de la alternativa ${letter}">${escapeHtml(q.options[i] || '')}</textarea>
                  <textarea data-opt-exp="${i}" style="margin-top:8px;" placeholder="Por qué es correcta / incorrecta">${escapeHtml(q.explanations[i] || '')}</textarea>
                </div>`).join('')}
            </div>
          </div>
          <div class="field-row" style="margin-bottom:0;">
            <label>Por qué le corresponde a esta función (y no a otra)</label>
            <textarea id="actMismatch" placeholder="Ej: el aislamiento y escalamiento son de TI porque es quien tiene acceso a la red y ve el incidente primero.">${escapeHtml(q.mismatchContext)}</textarea>
          </div>
        </div>
        <div class="modal-actions" style="margin-top:18px;">
          <button class="btn" id="actModalCancel">Cancelar</button>
          <button class="btn-cta" id="actModalSave">Guardar acto</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    function readForm(){
      q.target = document.getElementById('actTarget').value;
      q.title = document.getElementById('actTitle').value.trim();
      q.meta = document.getElementById('actMeta').value.split(',').map(s => s.trim()).filter(Boolean);
      q.situation = document.getElementById('actSituation').value.trim();
      q.mismatchContext = document.getElementById('actMismatch').value.trim();
      overlay.querySelectorAll('[data-opt-text]').forEach(t => { q.options[parseInt(t.dataset.optText, 10)] = t.value.trim(); });
      overlay.querySelectorAll('[data-opt-exp]').forEach(t => { q.explanations[parseInt(t.dataset.optExp, 10)] = t.value.trim(); });
      const checked = overlay.querySelector('input[name="actCorrect"]:checked');
      q.correctIndex = checked ? parseInt(checked.value, 10) : 0;
    }
    function save(){
      readForm();
      if(isNew) builderState.stages[si].questions.push(q);
      else builderState.stages[si].questions[qi] = q;
      closeActEditor();
      renderBuilder();
    }
    overlay.querySelectorAll('input[name="actCorrect"]').forEach(r => {
      r.addEventListener('change', () => {
        overlay.querySelectorAll('.builder-opt-row').forEach(row => row.classList.remove('is-correct'));
        overlay.querySelector(`[data-opt-row="${r.value}"]`).classList.add('is-correct');
      });
    });
    function onKey(e){ if(e.key === 'Escape') closeActEditor(); }
    overlay.querySelector('#actModalSave').addEventListener('click', save);
    overlay.querySelector('#actModalCancel').addEventListener('click', closeActEditor);
    overlay.querySelector('#actModalClose').addEventListener('click', closeActEditor);
    overlay.addEventListener('mousedown', e => { if(e.target === overlay) closeActEditor(); });
    document.addEventListener('keydown', onKey);
    closeActEditorFn = () => { overlay.remove(); document.removeEventListener('keydown', onKey); closeActEditorFn = null; };
  }

  function builderStep4Html(){
    const s = builderState;
    const roles = builderRoleList();
    const errors = builderValidate();
    const totalActs = s.stages.reduce((n, st) => n + st.questions.length, 0);
    return `
      <div class="builder-step">
        <div class="builder-summary">
          <div class="builder-summary-card">
            <div class="builder-summary-label">Escenario</div>
            <div style="font-size:var(--fs-md); font-weight:700;">${escapeHtml(s.name || '(sin nombre)')}</div>
            <p class="builder-hint" style="margin-top:6px;">${escapeHtml(s.blurb || '(sin descripción)')}</p>
          </div>
          <div class="builder-summary-card">
            <div class="builder-summary-label">Funciones (${roles.length})</div>
            <p class="builder-hint">${roles.map(r => escapeHtml(r.name || '(sin nombre)')).join(', ') || '—'}</p>
          </div>
          <div class="builder-summary-card">
            <div class="builder-summary-label">Etapas y actos (${totalActs} en total)</div>
            ${s.stages.map(st => `<div class="builder-summary-stage">— <b>${escapeHtml(st.stage || '(sin nombre)')}</b> · ${st.questions.length} acto${st.questions.length === 1 ? '' : 's'}</div>`).join('') || '<p class="builder-hint">Sin etapas.</p>'}
          </div>
        </div>
        ${errors.length ? `
          <div class="builder-errors">
            <div class="builder-errors-title">⚠ Falta completar esto antes de generar:</div>
            ${errors.map(e => `<div>• ${escapeHtml(e)}</div>`).join('')}
          </div>
        ` : `
          <div class="builder-ok-banner">✓ Todo listo — el escenario está completo.</div>
          <div class="builder-final-actions">
            <button type="button" class="btn" id="bldDownloadBtn">Descargar Word</button>
            <button type="button" class="btn btn-cta" id="bldUseNowBtn">Usar ahora en esta sesión →</button>
          </div>
        `}
      </div>`;
  }
  function wireBuilderStep4(){
    const dl = document.getElementById('bldDownloadBtn');
    if(dl) dl.addEventListener('click', () => { TibDocx.downloadScenarioDocx(builderToDocxScenario()); });
    const use = document.getElementById('bldUseNowBtn');
    if(use) use.addEventListener('click', () => deps.useScenario(builderToRegisterData()));
  }

  function renderBuilder(){
    renderBuilderStepper();
    const body = document.getElementById('builderStepBody');
    if(builderStep === 1){ body.innerHTML = builderStep1Html(); wireBuilderStep1(); }
    else if(builderStep === 2){ body.innerHTML = builderStep2Html(); wireBuilderStep2(); }
    else if(builderStep === 3){ body.innerHTML = builderStep3Html(); wireBuilderStep3(); }
    else { body.innerHTML = builderStep4Html(); wireBuilderStep4(); }
    document.getElementById('builderPrevBtn').disabled = builderStep === 1;
    const nextBtn = document.getElementById('builderNextBtn');
    nextBtn.style.display = builderStep === 4 ? 'none' : '';
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function init(d){
    deps = d;
    document.getElementById('openBuilderBtn').addEventListener('click', e => { e.preventDefault(); openBuilder(); });
    document.getElementById('builderBackBtn').addEventListener('click', closeBuilder);
    document.getElementById('builderPrevBtn').addEventListener('click', () => { if(builderStep > 1){ builderStep--; renderBuilder(); } });
    document.getElementById('builderNextBtn').addEventListener('click', () => { if(builderStep < 4){ builderStep++; renderBuilder(); } });
  }

  return {init};
})();
