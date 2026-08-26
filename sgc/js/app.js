const STATES   = ['Pendiente','En proceso','Listo'];
const STCOLOR  = {'Pendiente':'#F87171','En proceso':'#FDBA74','Listo':'#4ADE80'};
const STBG_DK  = {'Pendiente':'rgba(248,113,113,0.16)','En proceso':'rgba(253,186,116,0.16)','Listo':'rgba(74,222,128,0.16)'};
const STWEIGHT = {'Pendiente':0,'En proceso':0.5,'Listo':1};
function getBg(st){return STBG_DK[st]||STBG_DK['Pendiente'];}
// Aclara un color hacia blanco un % dado, para asegurar legibilidad de texto sobre fondo oscuro
function lightenForDark(hex,amt){
  const h=(hex||'#7C8AAE').replace('#','');
  const r=parseInt(h.substring(0,2),16),g=parseInt(h.substring(2,4),16),b=parseInt(h.substring(4,6),16);
  const mix=(c)=>Math.round(c+(255-c)*amt);
  return 'rgb('+mix(r)+','+mix(g)+','+mix(b)+')';
}

let DATA = null;
let COMPARE_PREV = null;
let COMPARE_CURRENT = null;
let fDom='all', fSt='all', fSearch='', fOrg='all';
let chartInstances = {};

function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);}

// TABS
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('.sidebar-section').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
  document.getElementById('page-'+b.dataset.tab).classList.add('on');
  const sec=document.getElementById('sidebar-'+b.dataset.tab);
  if(sec)sec.classList.add('on');
  if(b.dataset.tab==='dash') renderDashboard();
}));

// DOM CHIPS
function buildDomChips(){
  const el=document.getElementById('domChips');
  el.innerHTML='<button class="chip on" data-df="all">Todos</button>';
  Object.values(DATA.dominios).forEach(d=>{
    const btn=document.createElement('button');
    btn.className='chip';btn.dataset.df=d.id;
    btn.textContent=d.emoji+' '+d.code;
    el.appendChild(btn);
  });
  el.querySelectorAll('[data-df]').forEach(c=>c.addEventListener('click',()=>{
    el.querySelectorAll('[data-df]').forEach(x=>x.classList.remove('on'));
    c.classList.add('on');
    // Solo marca selección; el filtro se aplica al presionar "Filtrar Dominio"
  }));
}

// BOTÓN: Filtrar por Dominio
document.getElementById('btnFiltrarDominio').addEventListener('click',function(){
  const activeChip=document.querySelector('#domChips .chip.on');
  fDom=activeChip?activeChip.dataset.df:'all';
  applyFilters();
  syncFormFromFilters();
});

// BUILD TABLE
// Arma el resumen de estados de un grupo de dominio (chips con punto de color, solo estados presentes)
function resumenGrupo(entregables){
  const cnt={'Pendiente':0,'En proceso':0,'Listo':0};
  entregables.forEach(e=>cnt[e.estado||'Pendiente']++);
  return STATES.filter(s=>cnt[s]).map(s=>
    '<span class="gs-chip"><span class="dot" style="background:'+STCOLOR[s]+'"></span>'+cnt[s]+' '+s+'</span>'
  ).join('');
}

// Recalcula y redibuja los chips de resumen del encabezado de un grupo (tras cambiar un estado inline)
function refrescarResumenGrupo(domId){
  const entregables=[];
  DATA.requerimientos.filter(r=>r.dominioId===domId).forEach(req=>req.entregables.forEach(e=>entregables.push(e)));
  const el=document.querySelector('#tbody tr.group-row[data-dom="'+domId+'"] .group-summary');
  if(el) el.innerHTML=resumenGrupo(entregables);
}

function buildTable(){
  const tbody=document.getElementById('tbody');
  let h='';
  // Agrupa los requerimientos por dominio, respetando el orden en que aparecen
  const porDominio={},ordenDominios=[];
  DATA.requerimientos.forEach(req=>{
    if(!porDominio[req.dominioId]){porDominio[req.dominioId]=[];ordenDominios.push(req.dominioId);}
    porDominio[req.dominioId].push(req);
  });
  ordenDominios.forEach(domId=>{
    const dom=DATA.dominios[domId];
    const reqs=porDominio[domId];
    const entregablesGrupo=[];
    reqs.forEach(req=>req.entregables.forEach(e=>entregablesGrupo.push(e)));
    h+='<tr class="group-row" data-dom="'+domId+'"><td colspan="6"><div class="group-head">'
      +'<span class="group-dot" style="background:'+dom.color+'"></span>'
      +'<span class="group-code" style="color:'+lightenForDark(dom.color,.35)+'">'+dom.emoji+' '+dom.code+'</span>'
      +'<span class="group-name">'+dom.name+'</span>'
      +'<span class="group-summary">'+resumenGrupo(entregablesGrupo)+'</span>'
    +'</div></td></tr>';
    let n=0;
    reqs.forEach(req=>{
      req.entregables.forEach(e=>{
        n++;
        const st=e.estado||'Pendiente';
        const srch=[e.aspecto,e.evidencia,e.responsable,req.descripcion,dom.name,req.codigo].join(' ').toLowerCase().replace(/"/g,'');
        h+='<tr class="data-row" data-dom="'+domId+'" data-req="'+req.id+'" data-st="'+st+'" data-org="'+(e.org||'sin-asignar')+'" data-search="'+srch+'">'
          +'<td class="rnum">'+n+'</td>'
          +'<td class="req-code">'+req.codigo+'</td>'
          +'<td class="aspecto-cell">'+esc(e.aspecto||'—')+'</td>'
          +'<td class="evidencia-cell">'+esc(e.evidencia||'—')+'</td>'
          +'<td class="resp-cell">'+celdaResponsable(e)+'</td>'
          +'<td><select class="stsel" data-eid="'+e.id+'" style="border-color:'+STCOLOR[st]+';background:'+getBg(st)+';color:'+STCOLOR[st]+';font-weight:700">'
            +STATES.map(s=>'<option'+(st===s?' selected':'')+'>'+s+'</option>').join('')
          +'</select>'
          +'<div class="cell-sub">'+(e.periodicidad||'—')+'</div></td>'
          +'</tr>';
      });
    });
  });
  tbody.innerHTML=h;
  tbody.querySelectorAll('.stsel').forEach(sel=>sel.addEventListener('change',()=>{
    const eid=sel.dataset.eid;
    const e=findE(eid);
    if(e) e.estado=sel.value;
    const row=sel.closest('tr');row.dataset.st=sel.value;
    sel.style.borderColor=STCOLOR[sel.value];sel.style.background=getBg(sel.value);sel.style.color=STCOLOR[sel.value];
    refrescarResumenGrupo(row.dataset.dom);
    updateSummary();applyFilters();
    if(e) dbGuardarEntregable(e).catch(err=>toast('❌ No se pudo guardar: '+err.message));
  }));
  tbody.querySelectorAll('tr').forEach(tr=>{
    tr.addEventListener('click',function(ev){
      if(ev.target.closest('select'))return; // el cambio de estado se maneja aparte
      const sel=this.querySelector('.stsel');
      if(!sel)return;
      abrirEdicionModal(sel.dataset.eid);
    });
  });
}

// Abre el modal y lo precarga con el entregable clickeado en la tabla
function abrirEdicionModal(eid){
  abrirEdicion(eid);
  document.getElementById('editModalOverlay').classList.add('show');
}
function cerrarEdicionModal(){
  document.getElementById('editModalOverlay').classList.remove('show');
}

// Muestra la descripción completa del requerimiento en el modal (la columna se oculta en la tabla)
function mostrarDescripcionReq(req){
  const el=document.getElementById('fReqDescFull');
  if(!el)return;
  if(!req||!req.descripcion){el.textContent='';el.classList.remove('show');return;}
  el.textContent=req.descripcion;
  el.classList.add('show');
}

// Precarga el formulario con los datos del entregable (dominio, requerimiento, aspecto, evidencia, etc.)
function abrirEdicion(eid){
  const req=DATA.requerimientos.find(r=>r.entregables.some(x=>x.id===eid));
  if(!req)return;
  const e=req.entregables.find(x=>x.id===eid);
  if(!e)return;

  const fDomEl=document.getElementById('fDomSel');
  const fReqEl=document.getElementById('fReqSel');
  const fAspEl=document.getElementById('fAspSel');
  const fEv=document.getElementById('fEvidencia');
  const fRsp=document.getElementById('fResponsable');
  const fEst=document.getElementById('fEstado');
  const fOrgEl=document.getElementById('fOrg');

  // Dominio -> Requerimiento (sin filtrar por estado, para asegurar que el entregable clickeado siempre aparezca)
  fDomEl.value=req.dominioId;
  fReqEl.innerHTML='<option value="">— Seleccionar requerimiento —</option>';
  DATA.requerimientos.filter(r=>r.dominioId===req.dominioId).forEach(r=>{
    const o=document.createElement('option');o.value=r.id;
    o.textContent=r.codigo+' · '+r.descripcion.slice(0,60)+(r.descripcion.length>60?'…':'');
    fReqEl.appendChild(o);
  });
  fReqEl.disabled=false;
  fReqEl.value=req.id;
  mostrarDescripcionReq(req);

  // Aspecto
  fAspEl.innerHTML='<option value="">— Seleccionar aspecto —</option>';
  req.entregables.forEach(en=>{
    const o=document.createElement('option');o.value=en.id;
    const stBadge=(en.estado||'Pendiente')==='Listo'?'✅ ':((en.estado||'Pendiente')==='En proceso'?'🔄 ':'⏳ ');
    o.textContent=stBadge+en.aspecto;
    fAspEl.appendChild(o);
  });
  fAspEl.disabled=false;
  fAspEl.value=eid;

  // Campos
  fEv.value=e.evidencia||'';
  fRsp.value=e.responsable||'';
  fEst.value=e.estado||'Pendiente';
  fOrgManual=(e.orgManual===true);
  fOrgEl.value=e.org||'sin-asignar';
  marcarOrgManual();
  syncAspectoUI();
  fEst.style.borderColor=STCOLOR[fEst.value];fEst.style.background=getBg(fEst.value);fEst.style.color=STCOLOR[fEst.value];fEst.style.fontWeight='700';
  clearMsg();
}

// Cerrar el modal: click en la ✕, click fuera del formulario, o tecla Esc
document.getElementById('modalCloseBtn').addEventListener('click',cerrarEdicionModal);
document.getElementById('editModalOverlay').addEventListener('click',function(ev){
  if(ev.target===this)cerrarEdicionModal();
});
document.addEventListener('keydown',function(ev){
  if(ev.key==='Escape'&&document.getElementById('editModalOverlay').classList.contains('show'))cerrarEdicionModal();
  if(ev.key==='Escape'&&document.getElementById('personasModalOverlay').classList.contains('show'))setPersonasOpen(false);
});

// Celda de responsable: nombre arriba, organización debajo
function orgPill(org){
  const o=org||'sin-asignar';
  return '<span class="org-pill org-'+o+'">'+ORG_LABEL[o]+'</span>';
}
function celdaResponsable(e){
  return '<span class="resp-pill">'+esc(e.responsable||'—')+'</span>'
    +'<div class="cell-sub">'+orgPill(e.org)
    +(e.orgManual===true?'<span class="org-manual">manual</span>':'')+'</div>';
}

// FILTERS
function applyFilters(){
  if(!DATA)return;
  let vis=0;
  const tot=DATA.requerimientos.reduce((a,r)=>a+r.entregables.length,0);
  const visPorGrupo={};
  document.querySelectorAll('#tbody tr.data-row').forEach(tr=>{
    const ok=(fDom==='all'||tr.dataset.dom===fDom)&&
             (fSt==='all'||tr.dataset.st===fSt)&&
             (fOrg==='all'||tr.dataset.org===fOrg)&&
             (!fSearch||tr.dataset.search.includes(fSearch));
    tr.style.display=ok?'':'none';
    if(ok){vis++;visPorGrupo[tr.dataset.dom]=true;}
  });
  // Oculta el encabezado de un grupo de dominio cuando ninguna de sus filas quedó visible
  document.querySelectorAll('#tbody tr.group-row').forEach(tr=>{
    tr.style.display=visPorGrupo[tr.dataset.dom]?'':'none';
  });
  document.getElementById('countBar').textContent='Mostrando '+vis+' de '+tot+' entregables';
}

// FILTRO ORGANIZACIÓN
document.querySelectorAll('[data-of]').forEach(c=>c.addEventListener('click',()=>{
  document.querySelectorAll('[data-of]').forEach(x=>x.classList.remove('on'));
  c.classList.add('on');fOrg=c.dataset.of;applyFilters();
}));

document.querySelectorAll('[data-sf]').forEach(c=>c.addEventListener('click',()=>{
  document.querySelectorAll('[data-sf]').forEach(x=>x.classList.remove('on'));
  c.classList.add('on');fSt=c.dataset.sf;applyFilters();
  syncFormFromFilters();
}));
document.getElementById('searchInput').addEventListener('input',function(){fSearch=this.value.toLowerCase().trim();applyFilters();});

// SUMMARY
function updateSummary(){
  if(!DATA)return;
  const cnt={'Pendiente':0,'En proceso':0,'Listo':0};
  DATA.requerimientos.forEach(r=>r.entregables.forEach(e=>cnt[e.estado||'Pendiente']++));
  document.getElementById('summary').innerHTML=STATES.map(s=>'<span><span class="sdot" style="background:'+STCOLOR[s]+'"></span>'+cnt[s]+' '+s+'</span>').join('');
}


// SYNC FORM FROM FILTERS
function syncFormFromFilters(){
  const fDomEl=document.getElementById('fDomSel');
  const fReqEl=document.getElementById('fReqSel');
  const fAspEl=document.getElementById('fAspSel');
  if(!fDomEl)return;

  // Sync domain
  if(fDom!=='all'){
    if(fDomEl.value!==fDom){
      fDomEl.value=fDom;
      // Trigger cascade: populate requerimientos
      fReqEl.innerHTML='<option value="">— Seleccionar requerimiento —</option>';
      fAspEl.innerHTML='<option value="">— Primero selecciona requerimiento —</option>';
      fReqEl.disabled=false;fAspEl.disabled=true;
      DATA.requerimientos.filter(r=>r.dominioId===fDom).forEach(r=>{
        const o=document.createElement('option');o.value=r.id;
        o.textContent=r.codigo+' · '+r.descripcion.slice(0,60)+(r.descripcion.length>60?'…':'');
        fReqEl.appendChild(o);
      });
      // If only one req, auto-select it
      const reqs=DATA.requerimientos.filter(r=>r.dominioId===fDom);
      if(reqs.length===1){
        fReqEl.value=reqs[0].id;fReqEl.dispatchEvent(new Event('change'));
      }
    } else {
      // Domain same, but estado changed — refresh aspecto list if req selected
      if(fReqEl.value) fReqEl.dispatchEvent(new Event('change'));
    }
  } else {
    // All domains — reset form domain selector
    fDomEl.value='';
    fReqEl.innerHTML='<option value="">— Primero selecciona dominio —</option>';
    fAspEl.innerHTML='<option value="">— Primero selecciona requerimiento —</option>';
    fReqEl.disabled=true;fAspEl.disabled=true;
    mostrarDescripcionReq(null);
  }

  syncAspectoUI();

  // Update form header to show active filters
  const badge=document.getElementById('formFilterBadge');
  if(badge){
    const parts=[];
    if(fDom!=='all')parts.push(DATA.dominios[fDom]?.code||fDom);
    if(fSt!=='all')parts.push(fSt);
    badge.textContent=parts.length?'· Filtro activo: '+parts.join(' + '):'';
    badge.style.color='#0EA5E9';
  }
}

// FORM CASCADE
function initForm(){
  const fDomEl=document.getElementById('fDomSel');
  const fReqEl=document.getElementById('fReqSel');
  const fAspEl=document.getElementById('fAspSel');
  const fEv=document.getElementById('fEvidencia');
  const fRsp=document.getElementById('fResponsable');
  const fEst=document.getElementById('fEstado');
  const fOrg=document.getElementById('fOrg');

  initAspectoUI();
  fDomEl.innerHTML='<option value="">— Seleccionar —</option>';
  Object.values(DATA.dominios).forEach(d=>{
    const o=document.createElement('option');o.value=d.id;o.textContent=d.emoji+' '+d.code+' · '+d.name;fDomEl.appendChild(o);
  });

  fDomEl.onchange=function(){
    fReqEl.innerHTML='<option value="">— Seleccionar requerimiento —</option>';
    fAspEl.innerHTML='<option value="">— Primero selecciona requerimiento —</option>';
    fReqEl.disabled=!this.value;fAspEl.disabled=true;clearMsg();syncAspectoUI();
    mostrarDescripcionReq(null);
    if(!this.value)return;
    DATA.requerimientos.filter(r=>r.dominioId===this.value).forEach(r=>{
      const o=document.createElement('option');o.value=r.id;
      o.textContent=r.codigo+' · '+r.descripcion.slice(0,60)+(r.descripcion.length>60?'…':'');
      fReqEl.appendChild(o);
    });
  };

  fReqEl.onchange=function(){
    fAspEl.innerHTML='<option value="">— Seleccionar aspecto —</option>';
    fAspEl.disabled=!this.value;clearMsg();
    if(!this.value){mostrarDescripcionReq(null);return;}
    const req=DATA.requerimientos.find(r=>r.id===this.value);
    if(!req)return;
    mostrarDescripcionReq(req);
    const filtered=req.entregables.filter(e=>fSt==='all'||(e.estado||'Pendiente')===fSt);
    const toShow=filtered.length?filtered:req.entregables;
    if(filtered.length===0&&fSt!=='all'){
      const info=document.createElement('option');
      info.disabled=true;info.textContent='⚠️ Sin entregables con estado "'+fSt+'" en este req.';
      fAspEl.appendChild(info);
    }
    toShow.forEach(e=>{
      const o=document.createElement('option');o.value=e.id;
      const stBadge=(e.estado||'Pendiente')==='Listo'?'✅ ':((e.estado||'Pendiente')==='En proceso'?'🔄 ':'⏳ ');
      o.textContent=stBadge+e.aspecto;
      fAspEl.appendChild(o);
    });
    fAspEl.disabled=false;
    syncAspectoUI();
  };

  fAspEl.onchange=function(){
    clearMsg();if(!this.value)return;
    const e=findE(this.value);if(!e)return;
    fEv.value=e.evidencia||'';fRsp.value=e.responsable||'';fEst.value=e.estado||'Pendiente';
    fOrgManual = (e.orgManual===true);
    fOrg.value = e.org || 'sin-asignar';
    marcarOrgManual();
    syncAspectoUI();
    fEst.style.borderColor=STCOLOR[fEst.value];fEst.style.background=getBg(fEst.value);fEst.style.color=STCOLOR[fEst.value];fEst.style.fontWeight='700';
  };

  fEst.onchange=function(){this.style.borderColor=STCOLOR[this.value];this.style.background=getBg(this.value);this.style.color=STCOLOR[this.value];this.style.fontWeight='700';};

  // La organización sigue al responsable, salvo que la hayas elegido tú.
  fRsp.oninput=function(){ if(!fOrgManual) refreshFormOrg(); };
  fOrg.onchange=function(){ fOrgManual=true; marcarOrgManual(); };

  document.getElementById('fGuardar').onclick=function(){
    const eid=fAspEl.value;
    if(!eid){showMsg('⚠️ Selecciona un aspecto primero.','#F59E0B');return;}
    const e=findE(eid);if(!e)return;
    e.evidencia=fEv.value.trim();e.responsable=fRsp.value.trim();e.estado=fEst.value;
    if(fOrgManual){ e.org=fOrg.value; e.orgManual=true; }
    else { delete e.orgManual; e.org=calcOrg(e.responsable); fOrg.value=e.org; }
    const sel=document.querySelector('.stsel[data-eid="'+eid+'"]');
    if(sel){
      const row=sel.closest('tr');
      sel.value=fEst.value;sel.style.borderColor=STCOLOR[fEst.value];sel.style.background=getBg(fEst.value);sel.style.color=STCOLOR[fEst.value];
      row.dataset.st=fEst.value;
      row.dataset.org=e.org;
      row.cells[5].textContent=e.evidencia||'—';
      row.cells[6].innerHTML=celdaResponsable(e);
      row.style.background='rgba(14,165,233,.10)';setTimeout(()=>row.style.background='',1200);
    }
    updateSummary();applyFilters();renderPersonas();
    dbGuardarEntregable(e).catch(err=>toast('❌ No se pudo guardar: '+err.message));
    const sinClasificar = e.responsable && e.org==='sin-asignar' && !e.orgManual;
    if(sinClasificar){
      setPersonasOpen(true);
      const inp=document.getElementById('pNombre');
      if(inp && !inp.value.trim()) inp.value=e.responsable;
    }
    toast(sinClasificar
      ? '⚠️ Guardado, pero "'+e.responsable+'" no está en Personas (queda Sin Asignar)'
      : '✅ '+req_name(eid)+' actualizado');
    cerrarEdicionModal();
  };

  document.getElementById('fLimpiar').onclick=function(){
    fDomEl.value='';fReqEl.innerHTML='<option value="">— Primero selecciona dominio —</option>';
    fAspEl.innerHTML='<option value="">— Primero selecciona requerimiento —</option>';
    fReqEl.disabled=true;fAspEl.disabled=true;
    fEv.value='';fRsp.value='';fEst.value='Pendiente';
    fOrg.value='sin-asignar';fOrgManual=false;marcarOrgManual();syncAspectoUI();
    fEst.style.borderColor='var(--br)';fEst.style.background='var(--sur)';clearMsg();
    cerrarEdicionModal();
  };
}

// Organización: por defecto se deduce del responsable; si la eliges tú, se conserva.
let fOrgManual=false;

function refreshFormOrg(){
  const fOrgEl=document.getElementById('fOrg');
  const fRspEl=document.getElementById('fResponsable');
  if(!fOrgEl||!fRspEl) return;
  fOrgEl.value=calcOrg(fRspEl.value);
  marcarOrgManual();
}
function marcarOrgManual(){
  const fOrgEl=document.getElementById('fOrg');
  if(fOrgEl) fOrgEl.classList.toggle('manual', !!fOrgManual);
}

// ---- Desplegable multilínea para "Aspecto a Mejorar" ----
// El <select> nativo sigue existiendo (oculto) y guarda el valor; encima se
// dibuja una lista propia que sí puede mostrar el enunciado completo.
function syncAspectoUI(){
  const sel=document.getElementById('fAspSel');
  const btn=document.getElementById('aspBtn');
  const menu=document.getElementById('aspMenu');
  if(!sel||!btn||!menu) return;
  btn.disabled=sel.disabled;
  const opts=Array.prototype.slice.call(sel.options);
  const cur=sel.value;
  const elegida=opts.filter(function(o){return o.value===cur;})[0];
  btn.textContent = (elegida && elegida.value)
      ? elegida.textContent
      : (opts.length ? opts[0].textContent : '—');
  btn.classList.toggle('ph', !(elegida && elegida.value));

  let h='';
  opts.forEach(function(o){
    if(o.disabled){ h+='<div class="asp-opt-dis">'+esc(o.textContent)+'</div>'; return; }
    if(!o.value) return;
    h+='<div class="asp-opt'+(o.value===cur?' sel':'')+'" data-v="'+esc(o.value)+'">'+esc(o.textContent)+'</div>';
  });
  menu.innerHTML = h || '<div class="asp-opt-dis">Sin aspectos para este requerimiento.</div>';
  menu.querySelectorAll('.asp-opt').forEach(function(d){
    d.addEventListener('click',function(){
      sel.value=d.dataset.v;
      cerrarAspMenu();
      sel.dispatchEvent(new Event('change'));
    });
  });
}
function abrirAspMenu(){
  const m=document.getElementById('aspMenu');
  if(!m) return;
  m.classList.add('open');
  const s=m.querySelector('.asp-opt.sel');
  if(s) m.scrollTop = Math.max(0, s.offsetTop - 60);
}
function cerrarAspMenu(){
  const m=document.getElementById('aspMenu');
  if(m) m.classList.remove('open');
}
// Cierre del desplegable de "Aspecto a Mejorar": se registra una sola vez a nivel de
// documento (los elementos #aspBtn/#aspMenu viven toda la vida de la página, no hace
// falta re-registrar estos listeners cada vez que se recarga un JSON).
document.addEventListener('click',function(ev){
  const menu=document.getElementById('aspMenu');
  const btn=document.getElementById('aspBtn');
  if(!menu||!btn) return;
  if(!menu.contains(ev.target) && ev.target!==btn) cerrarAspMenu();
});
document.addEventListener('keydown',function(ev){
  if(ev.key==='Escape') cerrarAspMenu();
});
function initAspectoUI(){
  const btn=document.getElementById('aspBtn');
  const menu=document.getElementById('aspMenu');
  if(!btn||!menu) return;
  btn.onclick=function(ev){
    ev.stopPropagation();
    if(btn.disabled) return;
    if(menu.classList.contains('open')) cerrarAspMenu(); else abrirAspMenu();
  };
  syncAspectoUI();
}

function req_name(eid){
  for(const req of DATA.requerimientos)for(const e of req.entregables)if(e.id===eid)return req.codigo;return '';
}
function findE(eid){
  for(const req of DATA.requerimientos)for(const e of req.entregables)if(e.id===eid)return e;return null;
}
function showMsg(txt,color){const el=document.getElementById('fMsg');el.textContent=txt;el.style.color=color;el.style.display='block';setTimeout(()=>el.style.display='none',3000);}
function clearMsg(){const el=document.getElementById('fMsg');el.style.display='none';}

// DASHBOARD
function getChartColors(){
  return {
    gridColor: 'rgba(255,255,255,0.08)',
    tickColor: '#7C8AAE',
    textColor: '#EAF0FF',
  };
}

function destroyChart(id){if(chartInstances[id]){chartInstances[id].destroy();delete chartInstances[id];}}

// Estado seleccionado en el filtro del gráfico de dos tortas
let respStFilter='all';
let dashResp='all';
let dashOrg='all';
function respMatch(e){
  if(dashOrg!=='all' && (e.org||'sin-asignar')!==dashOrg) return false;
  if(dashResp!=='all' && (e.responsable||'').trim()!==dashResp) return false;
  return true;
}

// Plugin: dibuja el total (y una etiqueta pequeña) en el hueco central de la dona
const centerTotalPlugin={
  id:'centerTotal',
  afterDatasetsDraw:function(chart, args, opts){
    if(!opts || opts.value==null) return;
    const ctx=chart.ctx;
    const area=chart.chartArea;
    const cx=(area.left+area.right)/2;
    const cy=(area.top+area.bottom)/2;
    // Tamaño relativo al diámetro para que escale con la dona
    const diam=Math.min(area.right-area.left, area.bottom-area.top);
    const numSize=Math.max(18, Math.min(42, Math.round(diam*0.18)));
    const lblSize=Math.max(10, Math.round(numSize*0.32));
    ctx.save();
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillStyle=opts.color || '#EAF0FF';
    ctx.font='800 '+numSize+'px system-ui, -apple-system, "Segoe UI", Ubuntu, sans-serif';
    ctx.fillText(String(opts.value), cx, cy - lblSize*0.6);
    ctx.font='600 '+lblSize+'px system-ui, -apple-system, "Segoe UI", Ubuntu, sans-serif';
    ctx.fillStyle=opts.subColor || opts.color || '#B7C2D0';
    ctx.fillText(opts.label || 'total', cx, cy + numSize*0.55);
    ctx.restore();
  }
};

// Paleta cíclica para las porciones (evita usar naranja/azul de la marca)
const PIE_PAL=['#8B5CF6','#EC4899','#14B8A6','#F59E0B','#3B82F6','#EF4444','#10B981',
               '#A855F7','#FB923C','#06B6D4','#84CC16','#D946EF','#0EA5E9','#F43F5E'];

function renderAspectosPorResp(){
  if(!DATA) return;
  const cc=getChartColors();
  // Contar entregables por responsable dentro de cada organización, aplicando filtro
  const acc={quintero:{}, tibox:{}};
  DATA.requerimientos.forEach(function(req){
    req.entregables.forEach(function(e){
      if(respStFilter!=='all' && (e.estado||'Pendiente')!==respStFilter) return;
      if(!respMatch(e)) return;
      const nom=(e.responsable||'').trim();
      if(!nom) return;
      const o=e.org||'sin-asignar';
      if(o!=='quintero' && o!=='tibox') return;
      acc[o][nom]=(acc[o][nom]||0)+1;
    });
  });

  function dibujar(canvasId, emptyId, chartKey, data){
    const filas=Object.keys(data).map(function(k){return {n:k, v:data[k]};})
      .sort(function(a,b){ if(b.v!==a.v) return b.v-a.v; return a.n.localeCompare(b.n,'es'); });
    const total=filas.reduce(function(a,b){return a+b.v;},0);
    // Calcula tamaños según el espacio real de la tarjeta y el nº de items
    const cvs=document.getElementById(canvasId);
    const wrap=cvs ? cvs.parentElement : null;
    const wrapH=wrap ? wrap.getBoundingClientRect().height : 320;
    const n=filas.length;
    // Cada item de leyenda necesita ~fontSize*1.6 de alto. Ajustamos font para que quepan todos.
    let fontSize=13;
    if(n>0){
      const altoUtil=wrapH-24;               // menos padding vertical
      const idealFont=Math.floor((altoUtil/(n*1.7)-2)*1.2);
      fontSize=Math.max(10, Math.min(13, idealFont));
    }
    const legendPad=fontSize<=11 ? 2 : (fontSize<=12 ? 3 : 5);
    const boxSize=Math.max(10, fontSize);

    destroyChart(chartKey);
    const empty=document.getElementById(emptyId);
    const canvas=document.getElementById(canvasId);
    if(!filas.length){
      if(empty) empty.style.display='flex';
      if(canvas) canvas.style.display='none';
      return;
    }
    if(empty) empty.style.display='none';
    if(canvas) canvas.style.display='';
    chartInstances[chartKey]=new Chart(canvas,{
      type:'doughnut',
      data:{
        labels:filas.map(function(f){return f.n;}),
        datasets:[{
          data:filas.map(function(f){return f.v;}),
          backgroundColor:filas.map(function(_,i){return PIE_PAL[i%PIE_PAL.length];}),
          borderWidth:2, borderColor:'#101B36'
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false, cutout:'58%', radius:'80%',
        layout:{padding:{top:8, bottom:8, left:8, right:8}},
        plugins:{
          legend:{position:'right', align:'center', labels:{
            color:cc.textColor, font:{size:fontSize}, padding:legendPad, boxWidth:boxSize, boxHeight:boxSize,
            generateLabels:function(chart){
              const ds=chart.data.datasets[0];
              return chart.data.labels.map(function(l,i){
                const v=ds.data[i];
                const p=total?Math.round(v/total*100):0;
                return {text:l+'  '+v+' ('+p+'%)',
                  fillStyle:ds.backgroundColor[i], strokeStyle:ds.backgroundColor[i],
                  lineWidth:0, fontColor:cc.textColor, hidden:false, index:i};
              });
            }
          }},
          tooltip:{callbacks:{label:function(ctx){
            const p=total?Math.round(ctx.raw/total*100):0;
            return ctx.label+': '+ctx.raw+' ('+p+'%)';
          }}},
          datalabels:{
            color:'#fff', font:{size:11, weight:'800'},
            formatter:function(v){ return (total && v/total>=0.05) ? Math.round(v/total*100)+'%' : ''; }
          },
          centerTotal:{ value:total, label:'aspectos',
            color:'#FFFFFF', subColor:cc.tickColor }
        }
      },
      plugins:[ChartDataLabels, centerTotalPlugin]
    });
  }

  dibujar('chartAspQ','emptyQ','aspRespQ',acc.quintero);
  dibujar('chartAspT','emptyT','aspRespT',acc.tibox);
}

// Botones del filtro (una sola vez, delegado)
document.addEventListener('click', function(ev){
  const btn=ev.target.closest('#respStFilter button');
  if(!btn) return;
  document.querySelectorAll('#respStFilter button').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  respStFilter=btn.dataset.st;
  renderAspectosPorResp();
  // El filtro también afecta a los gráficos de barras del dashboard
  if(document.getElementById('page-dash').classList.contains('on')) renderDashboard();
});

// Filtros por organización y responsable: afectan a TODO el dashboard (barras y tortas).
// El de responsable es condicional: sus opciones dependen de la organización elegida.
document.addEventListener('change', function(ev){
  if(ev.target.id==='dashOrgSel'){
    dashOrg=ev.target.value;
    renderDashboard();
    return;
  }
  if(ev.target.id==='dashRespSel'){
    dashResp=ev.target.value;
    renderDashboard();
  }
});

// Recalcula el tamaño de fuente/torta al cambiar el tamaño de la ventana
let __respResizeTimer=null;
window.addEventListener('resize', function(){
  if(!DATA) return;
  if(!document.getElementById('page-dash').classList.contains('on')) return;
  clearTimeout(__respResizeTimer);
  __respResizeTimer=setTimeout(renderAspectosPorResp, 180);
});

function renderDashboard(){
  if(!DATA)return;
  const cc=getChartColors();

  // ── Filtro por organización: conserva la selección actual ──
  const orgSel=document.getElementById('dashOrgSel');
  if(orgSel){
    dashOrg = orgSel.value || 'all';
  }

  // ── Filtro por responsable (condicional a la organización elegida): repuebla el
  //    select con solo los responsables de esa organización, conservando la selección
  //    actual si sigue siendo válida ──
  const dashSel=document.getElementById('dashRespSel');
  if(dashSel){
    const prev=dashSel.value||'all';
    const nombres=responsablesEnDatos(DATA, dashOrg);
    dashSel.innerHTML='<option value="all">Todos los responsables</option>'
      +nombres.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join('');
    dashSel.value = nombres.includes(prev) ? prev : 'all';
    dashResp = dashSel.value;
  }

  // ── Totales por estado ──
  const cnt={'Pendiente':0,'En proceso':0,'Listo':0};
  let tot=0,wsum=0;
  DATA.requerimientos.forEach(r=>r.entregables.forEach(e=>{
    if(!respMatch(e)) return;
    const st=e.estado||'Pendiente';cnt[st]++;wsum+=STWEIGHT[st];tot++;
  }));
  const pct=tot?Math.round(wsum/tot*100):0;

  // ── Entregables por Estado (torta) ──
  destroyChart('estado');
  const estKeys=['Listo','En proceso','Pendiente'];
  const estLabels=['Completados','En Proceso','Pendientes'];
  const estColors=estKeys.map(s=>STCOLOR[s]);
  chartInstances['estado']=new Chart(document.getElementById('chartEstado'),{
    type:'doughnut',
    data:{
      labels:estLabels,
      datasets:[{
        data:estKeys.map(s=>cnt[s]),
        backgroundColor:estColors,
        borderWidth:2, borderColor:'#101B36'
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'58%', radius:'80%',
      layout:{padding:{top:8, bottom:8, left:8, right:8}},
      plugins:{
        legend:{position:'bottom', align:'center', labels:{
          color:cc.textColor, font:{size:11}, padding:6, boxWidth:11, boxHeight:11,
          generateLabels:function(chart){
            const ds=chart.data.datasets[0];
            return chart.data.labels.map(function(l,i){
              const v=ds.data[i];
              const p=tot?Math.round(v/tot*100):0;
              return {text:l+': '+v+' ('+p+'%)',
                fillStyle:ds.backgroundColor[i], strokeStyle:ds.backgroundColor[i],
                lineWidth:0, fontColor:cc.textColor, hidden:false, index:i};
            });
          }
        }},
        tooltip:{callbacks:{label:function(ctx){
          const p=tot?Math.round(ctx.raw/tot*100):0;
          return ctx.label+': '+ctx.raw+' ('+p+'%)';
        }}},
        datalabels:{
          color:'#fff', font:{size:11, weight:'800'},
          formatter:function(v){ return (tot && v/tot>=0.05) ? Math.round(v/tot*100)+'%' : ''; }
        },
        centerTotal:{ value:tot, label:'entregables', color:'#FFFFFF', subColor:cc.tickColor }
      }
    },
    plugins:[ChartDataLabels, centerTotalPlugin]
  });

  // ── Stacked bars ──
  destroyChart('stacked');
  const doms=Object.values(DATA.dominios);
  const stackedData=doms.map(d=>{
    const c={'Pendiente':0,'En proceso':0,'Listo':0};
    DATA.requerimientos.filter(r=>r.dominioId===d.id).forEach(r=>r.entregables.forEach(e=>{ if(respMatch(e)) c[e.estado||'Pendiente']++; }));
    return c;
  });
  // Cuando hay un filtro de estado, solo mostramos ese estado en las barras
  const estadosMostrar = respStFilter==='all' ? STATES : STATES.filter(x=>x===respStFilter);
  chartInstances['stacked']=new Chart(document.getElementById('chartStacked'),{
    type:'bar',
    data:{labels:doms.map(d=>d.code),datasets:estadosMostrar.map(s=>({label:s,data:doms.map((_,i)=>stackedData[i][s]),backgroundColor:STCOLOR[s],borderRadius:4,stack:'s'}))},
    options:{
      responsive:true,maintainAspectRatio:false,
      layout:{padding:{top:30,bottom:24,left:36,right:36}},
      scales:{x:{stacked:true,grid:{display:false},ticks:{color:cc.tickColor,font:{size:13}}},y:{stacked:true,grid:{color:cc.gridColor},ticks:{color:cc.tickColor,font:{size:13}}}},
      plugins:{
        legend:{position:'bottom',labels:{color:cc.textColor,font:{size:12},padding:9}},
        datalabels:{
          color:'#fff',font:{size:11,weight:'700'},
          formatter:(v)=>v>0?v:'',
          anchor:'center',align:'center'
        }
      }
    },
    plugins:[ChartDataLabels]
  });

  // ── Aspectos por Responsable (dos tortas, filtro por estado) ──
  renderAspectosPorResp();

  // ── Avance por Dominio: actual o comparado ──
  destroyChart('org');
  const avanceActual=avancePorDominio(DATA);
  const avanceAnterior=COMPARE_PREV ? avancePorDominio(COMPARE_PREV.data) : null;
  const avanceKeys=Object.keys(avanceActual);
  const avanceLabels=avanceKeys.map(function(k){return avanceActual[k].code;});
  const datasets=[];
  if(avanceAnterior){
    datasets.push({label:'Anterior · '+COMPARE_PREV.label,data:avanceKeys.map(function(k){return avanceAnterior[k]?avanceAnterior[k].listo:0;}),backgroundColor:'#FFFFFF',borderColor:'#FFFFFF',borderWidth:1,borderRadius:4});
  }
  datasets.push({label:(COMPARE_CURRENT?'Actual · '+COMPARE_CURRENT.label:'Avance actual'),data:avanceKeys.map(function(k){return avanceActual[k].listo;}),backgroundColor:'#4ADE80',borderColor:'#4ADE80',borderWidth:1,borderRadius:4});
  const chartTitle=document.getElementById('compareChartTitle');
  const chartSub=document.getElementById('compareChartSub');
  if(chartTitle)chartTitle.textContent=avanceAnterior?'Avance por Dominio · Comparación':'Avance por Dominio';
  if(chartSub)chartSub.textContent=avanceAnterior?'Cantidad de entregables listos por corte':'Cantidad de entregables listos por dominio';
  chartInstances['org']=new Chart(document.getElementById('chartOrg'),{
    type:'bar',
    data:{
      labels:avanceLabels,
      datasets:datasets
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      layout:{padding:{top:46,bottom:24,left:28,right:28}},
      scales:{
        x:{grid:{display:false},ticks:{color:cc.tickColor,font:{size:13,weight:'600'},padding:9}},
        y:{grid:{color:cc.gridColor},ticks:{color:cc.tickColor,font:{size:13}},beginAtZero:true,precision:0}
      },
      plugins:{
        legend:{display:!!avanceAnterior,position:'bottom',labels:{color:cc.textColor,font:{size:12},padding:9}},
        tooltip:{titleFont:{size:14},bodyFont:{size:13},footerFont:{size:12},callbacks:{label:function(ctx){
          return ctx.dataset.label+': '+ctx.raw+' listos';
        }}},
        datalabels:{
          color:'#FFFFFF',
          font:{size:10,weight:'400'},
          anchor:'end',
          align:'top',
          offset:3,
          clip:false,
          formatter:function(v,ctx){
            if(v===0)return '';
            return String(v);
          }
        }
      }
    },
    plugins:[ChartDataLabels]
  });
}

function avancePorDominio(data){
  const out={};
  Object.values(data.dominios||{}).forEach(function(d){out[d.id]={code:d.code,total:0,listo:0};});
  (data.requerimientos||[]).forEach(function(req){
    const row=out[req.dominioId];
    if(!row)return;
    (req.entregables||[]).forEach(function(e){
      const org=e.org||'sin-asignar';
      if(dashOrg!=='all' && org!==dashOrg)return;
      if(dashResp!=='all' && (e.responsable||'').trim()!==dashResp)return;
      row.total++;
      if((e.estado||'Pendiente')==='Listo')row.listo++;
    });
  });
  return out;
}

// LOAD DATA
// CLASIFICACIÓN ORGANIZACIÓN
// La organización de un entregable se deriva de su responsable, usando el
// listado de personas (DATA.personas). Ese listado viaja en el JSON exportado.
const ORG_LABEL = {'tibox':'TIBOX','quintero':'Quintero','sin-asignar':'Sin Asignar'};
const ORGS = ['tibox','quintero','sin-asignar'];

// Semilla original: sólo se usa la primera vez, cuando el JSON aún no trae personas.
const TIBOX_SEED = new Set(['Mesa de Ayuda TIBOX','Omar Pinto','Claudio Barrera','Diever Ramírez','Diever Ramirez','Mesa de Ayuda']);

function normNombre(n){
  return (n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/\s+/g,' ').trim();
}

function personaIndex(){
  const idx={};
  ((DATA&&DATA.personas)||[]).forEach(p=>{ idx[normNombre(p.nombre)]=p.org; });
  return idx;
}

function calcOrg(resp, idx){
  const r=(resp||'').trim();
  if(!r) return 'sin-asignar';
  const map = idx || personaIndex();
  const found = map[normNombre(r)];
  return found || 'sin-asignar';
}

// Responsables presentes en los datos (texto tal cual, sin repetir).
// org: opcional, restringe la lista a los responsables de esa organización ('all' = todos).
function responsablesEnDatos(data, org){
  const vistos={}, out=[];
  ((data||DATA).requerimientos||[]).forEach(req=>{
    (req.entregables||[]).forEach(e=>{
      const r=(e.responsable||'').trim();
      if(!r) return;
      if(org && org!=='all' && (e.org||'sin-asignar')!==org) return;
      const k=normNombre(r);
      if(!vistos[k]){ vistos[k]=1; out.push(r); }
    });
  });
  return out.sort((a,b)=>a.localeCompare(b,'es'));
}

// Primera carga de un JSON sin listado: se arma con la regla anterior,
// así la clasificación no cambia respecto de lo que ya se veía.
function seedPersonas(data){
  if(Array.isArray(data.personas)) return data;
  const lista = responsablesEnDatos(data).map(n=>({
    nombre:n,
    org: TIBOX_SEED.has(n) ? 'tibox' : 'quintero'
  }));
  // Personas TIBOX ya conocidas que todavía no tienen entregables asignados:
  // se conservan en la lista para no perderlas.
  const yaEstan = {};
  lista.forEach(p=>{ yaEstan[normNombre(p.nombre)]=1; });
  ['Omar Pinto','Claudio Barrera','Diever Ramírez','Mesa de Ayuda TIBOX'].forEach(n=>{
    if(!yaEstan[normNombre(n)]){ lista.push({nombre:n, org:'tibox'}); yaEstan[normNombre(n)]=1; }
  });
  lista.sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
  data.personas = lista;
  return data;
}

function enrichOrg(data){
  const idx={};
  ((data.personas)||[]).forEach(p=>{ idx[normNombre(p.nombre)]=p.org; });
  (data.requerimientos||[]).forEach(req=>{
    (req.entregables||[]).forEach(e=>{
      // Si la organización se forzó a mano en el formulario, se respeta.
      if(e.orgManual===true){ if(!e.org) e.org='sin-asignar'; return; }
      e.org=calcOrg(e.responsable, idx);
    });
  });
  return data;
}

// ---- Recalcular y refrescar vistas tras cambiar el listado de personas ----
function syncRowOrgs(){
  const map={};
  DATA.requerimientos.forEach(r=>r.entregables.forEach(e=>{map[e.id]=e;}));
  document.querySelectorAll('#tbody tr').forEach(tr=>{
    const sel=tr.querySelector('.stsel');
    if(!sel) return;
    const e=map[sel.dataset.eid];
    if(!e) return;
    tr.dataset.org = e.org || 'sin-asignar';
    const celda=tr.querySelector('.resp-cell');
    if(celda) celda.innerHTML = celdaResponsable(e);
  });
}
function aplicarCambioPersonas(){
  enrichOrg(DATA);
  syncRowOrgs();
  applyFilters();
  renderPersonas();
  refreshFormOrg();
  if(document.getElementById('page-dash').classList.contains('on')) renderDashboard();
  // enrichOrg() puede haber recalculado el org de varios entregables (los que
  // no tienen orgManual): se persisten para que la base de datos no quede
  // desincronizada con lo que ahora se ve en pantalla.
  dbSincronizarOrgs().catch(err=>toast('❌ No se pudo sincronizar organizaciones: '+err.message));
}

// ---- Conteo de entregables por persona ----
function conteoPorResponsable(){
  const c={};
  DATA.requerimientos.forEach(r=>r.entregables.forEach(e=>{
    const k=normNombre(e.responsable);
    if(k) c[k]=(c[k]||0)+1;
  }));
  return c;
}

// ---- Página Personas ----
function renderPersonas(){
  if(!DATA) return;
  const tbody=document.getElementById('pTbody');
  if(!tbody) return;
  const personas=DATA.personas||[];
  const conteo=conteoPorResponsable();

  let h='';
  personas.forEach((p,i)=>{
    const n=conteo[normNombre(p.nombre)]||0;
    h+='<tr>'
      +'<td class="rnum">'+(i+1)+'</td>'
      +'<td style="font-weight:600">'+esc(p.nombre)+'</td>'
      +'<td><select class="stsel p-org-sel" data-nombre="'+esc(p.nombre)+'">'
        +ORGS.map(o=>'<option value="'+o+'"'+(p.org===o?' selected':'')+'>'+ORG_LABEL[o]+'</option>').join('')
      +'</select></td>'
      +'<td>'+(n>0
          ? '<span class="per-badge">'+n+'</span>'
          : '<span class="p-hint">0 · el nombre no coincide con ningún responsable</span>')
      +'</td>'
      +'<td><button class="btn-mini btn-del p-del" data-nombre="'+esc(p.nombre)+'">Eliminar</button></td>'
      +'</tr>';
  });
  tbody.innerHTML = h || '<tr><td colspan="5" style="color:var(--mu);font-size:0.76rem;padding:16px 12px">Aún no hay personas en la lista. Agrega la primera con el formulario de arriba.</td></tr>';

  tbody.querySelectorAll('.p-org-sel').forEach(sel=>sel.addEventListener('change',()=>{
    const p=(DATA.personas||[]).find(x=>normNombre(x.nombre)===normNombre(sel.dataset.nombre));
    if(!p) return;
    p.org=sel.value;
    aplicarCambioPersonas();
    dbGuardarPersona(p).catch(err=>toast('❌ No se pudo guardar: '+err.message));
    toast('✅ '+p.nombre+' → '+ORG_LABEL[p.org]);
  }));
  tbody.querySelectorAll('.p-del').forEach(btn=>btn.addEventListener('click',()=>{
    const nombre=btn.dataset.nombre;
    if(!confirm('¿Quitar a "'+nombre+'" de la lista?\n\nSus entregables quedarán como Sin Asignar.')) return;
    DATA.personas=(DATA.personas||[]).filter(x=>normNombre(x.nombre)!==normNombre(nombre));
    dbEliminarPersona(nombre).catch(err=>toast('❌ No se pudo eliminar: '+err.message));
    aplicarCambioPersonas();
    toast('🗑️ '+nombre+' eliminado de la lista');
  }));

  // Resumen
  const porOrg={};
  ORGS.forEach(o=>porOrg[o]=personas.filter(p=>p.org===o).length);
  document.getElementById('pCount').textContent =
    personas.length+' personas · '+ORG_LABEL['tibox']+': '+porOrg['tibox']
    +' · '+ORG_LABEL['quintero']+': '+porOrg['quintero']
    +' · '+ORG_LABEL['sin-asignar']+': '+porOrg['sin-asignar'];

  // Encabezado plegado: resumen + aviso si falta clasificar a alguien
  const idx=personaIndex();
  const faltan=responsablesEnDatos(DATA).filter(r=>!idx[normNombre(r)]).length;
  const badge=document.getElementById('pBadge');
  if(badge){
    badge.innerHTML = personas.length+' personas · TIBOX '+porOrg['tibox']
      +' · Quintero '+porOrg['quintero']
      + (faltan ? ' · <b>⚠️ '+faltan+' sin clasificar</b>' : '');
  }

  renderSinClasificar();
}

// Responsables que aparecen en los entregables pero no están en la lista
function renderSinClasificar(){
  const cont=document.getElementById('pSinClasificar');
  if(!cont) return;
  const idx=personaIndex();
  const faltantes=responsablesEnDatos(DATA).filter(r=>!idx[normNombre(r)]);
  if(!faltantes.length){ cont.innerHTML=''; return; }
  const conteo=conteoPorResponsable();
  let h='<div class="p-warn"><div class="p-warn-h">⚠️ '+faltantes.length+' responsable(s) sin organización asignada</div>';
  faltantes.forEach(r=>{
    h+='<div class="p-warn-row">'
      +'<span class="p-name">'+esc(r)+'</span>'
      +'<span class="per-badge">'+(conteo[normNombre(r)]||0)+' entregables</span>'
      +'<button class="btn-mini p-quick" data-nombre="'+esc(r)+'" data-org="tibox">→ TIBOX</button>'
      +'<button class="btn-mini p-quick" data-nombre="'+esc(r)+'" data-org="quintero">→ Quintero</button>'
      +'</div>';
  });
  h+='</div>';
  cont.innerHTML=h;
  cont.querySelectorAll('.p-quick').forEach(btn=>btn.addEventListener('click',()=>{
    agregarPersona(btn.dataset.nombre, btn.dataset.org, true);
  }));
}

function agregarPersona(nombre, org, silencioso){
  nombre=(nombre||'').trim();
  if(!nombre){ showPMsg('⚠️ Escribe un nombre.','#F59E0B'); return false; }
  DATA.personas=DATA.personas||[];
  const ya=DATA.personas.find(p=>normNombre(p.nombre)===normNombre(nombre));
  if(ya){
    if(ya.org===org){ showPMsg('⚠️ "'+nombre+'" ya está en la lista como '+ORG_LABEL[org]+'.','#F59E0B'); return false; }
    ya.org=org;
    aplicarCambioPersonas();
    dbGuardarPersona(ya).catch(err=>toast('❌ No se pudo guardar: '+err.message));
    toast('✅ '+ya.nombre+' → '+ORG_LABEL[org]);
    return true;
  }
  DATA.personas.push({nombre:nombre, org:org});
  DATA.personas.sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
  aplicarCambioPersonas();
  dbGuardarPersona({nombre:nombre, org:org}).catch(err=>toast('❌ No se pudo guardar: '+err.message));
  if(!silencioso) showPMsg('✅ "'+nombre+'" agregado a '+ORG_LABEL[org]+'.','#10B981');
  toast('✅ '+nombre+' agregado a '+ORG_LABEL[org]);
  return true;
}

function showPMsg(txt,color){
  const el=document.getElementById('pMsg');
  if(!el) return;
  el.textContent=txt;el.style.color=color;el.style.display='block';
  setTimeout(()=>el.style.display='none',3500);
}

function setPersonasOpen(abrir){
  const ov=document.getElementById('personasModalOverlay');
  if(!ov) return;
  ov.classList.toggle('show', !!abrir);
}

function initPersonasForm(){
  const btn=document.getElementById('pAgregar');
  const inp=document.getElementById('pNombre');
  const sel=document.getElementById('pOrg');
  const openBtn=document.getElementById('btnResponsables');
  const closeBtn=document.getElementById('personasCloseBtn');
  const overlay=document.getElementById('personasModalOverlay');
  if(openBtn) openBtn.onclick=function(){ setPersonasOpen(true); };
  if(closeBtn) closeBtn.onclick=function(){ setPersonasOpen(false); };
  // Asignación directa (no addEventListener): initPersonasForm() se vuelve a llamar
  // cada vez que se carga un JSON, y el overlay es el mismo elemento durante toda la
  // vida de la página — con addEventListener se irían acumulando listeners duplicados.
  if(overlay) overlay.onclick=function(ev){ if(ev.target===overlay) setPersonasOpen(false); };
  if(!btn) return;
  btn.onclick=function(){
    if(agregarPersona(inp.value, sel.value, false)) inp.value='';
  };
  inp.onkeydown=function(ev){ if(ev.key==='Enter') btn.click(); };
}

function esc(t){
  return String(t==null?'':t)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function loadData(imported){
  DATA=enrichOrg(seedPersonas(imported));
  buildDomChips();buildTable();updateSummary();applyFilters();initForm();
  initPersonasForm();renderPersonas();refreshFormOrg();
}

// ============ IMPORTAR JSON (migración / restauración de respaldos) ============
function leerJson(file){
  return new Promise(function(resolve,reject){
    if(!file){reject(new Error('Falta seleccionar un archivo'));return;}
    const reader=new FileReader();
    reader.onload=function(e){
      try{
        const data=JSON.parse(e.target.result);
        if(!data.requerimientos || !data.dominios) throw new Error('El JSON no contiene la estructura CIP esperada');
        resolve(data);
      }catch(err){reject(err);}
    };
    reader.onerror=function(){reject(new Error('No se pudo leer el archivo'));};
    reader.readAsText(file);
  });
}

document.getElementById('btnImportarJSON').addEventListener('click',function(){
  document.getElementById('importarJSONInput').click();
});
document.getElementById('importarJSONInput').addEventListener('change',async function(ev){
  const file=ev.target.files[0];
  ev.target.value='';
  if(!file)return;
  try{
    const data=await leerJson(file);
    await dbImportarJSON(data);
    toast('✅ '+file.name+' importado a la base de datos');
    loadData(await dbCargarTodo());
  }catch(err){
    toast('❌ '+err.message);
  }
});

// ============ GUARDAR SNAPSHOT ============
document.getElementById('btnGuardarSnapshot').addEventListener('click',async function(){
  if(!DATA){toast('No hay datos');return;}
  try{
    await dbGuardarSnapshot();
    toast('📸 Snapshot de hoy guardado');
  }catch(err){
    toast('❌ No se pudo guardar el snapshot: '+err.message);
  }
});

// ---- Mini calendario: un widget de mes navegable donde solo se pueden
// clickear los días que tienen snapshot guardado. Guarda su propio estado
// (mes que se está mostrando, fechas disponibles, fecha elegida) en el
// propio elemento del DOM (el._cal), así se puede tener uno por cada campo. ----
const MESES_ES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DOW_ES=['L','M','M','J','V','S','D'];

function crearMiniCalendario(el, onSelect){
  el.innerHTML=
      '<div class="mini-cal-head">'
        +'<button type="button" class="mini-cal-nav" data-dir="-1">‹</button>'
        +'<span class="mini-cal-month"></span>'
        +'<button type="button" class="mini-cal-nav" data-dir="1">›</button>'
      +'</div>'
      +'<div class="mini-cal-dow">'+DOW_ES.map(d=>'<span>'+d+'</span>').join('')+'</div>'
      +'<div class="mini-cal-grid"></div>';
  const state={cursor:new Date(), disponibles:new Set(), seleccion:null, onSelect:onSelect};
  el._cal=state;
  el.querySelectorAll('.mini-cal-nav').forEach(btn=>btn.addEventListener('click',function(){
    state.cursor=new Date(state.cursor.getFullYear(), state.cursor.getMonth()+Number(this.dataset.dir), 1);
    pintarMiniCalendario(el);
  }));
  el.querySelector('.mini-cal-grid').addEventListener('click',function(ev){
    const d=ev.target.closest('.mini-cal-day.has-snapshot');
    if(!d)return;
    state.seleccion=d.dataset.fecha;
    pintarMiniCalendario(el);
    if(state.onSelect) state.onSelect(state.seleccion);
  });
}

function pintarMiniCalendario(el){
  const state=el._cal;
  const y=state.cursor.getFullYear(), m=state.cursor.getMonth();
  el.querySelector('.mini-cal-month').textContent=MESES_ES[m]+' '+y;

  const fechas=[...state.disponibles].sort();
  const minYm=fechas.length?fechas[0].slice(0,7):null;
  const maxYm=fechas.length?fechas[fechas.length-1].slice(0,7):null;
  const cursorYm=y+'-'+String(m+1).padStart(2,'0');
  el.querySelectorAll('.mini-cal-nav').forEach(btn=>{
    const dir=Number(btn.dataset.dir);
    btn.disabled = dir<0 ? (!minYm || cursorYm<=minYm) : (!maxYm || cursorYm>=maxYm);
  });

  const offset=(new Date(y,m,1).getDay()+6)%7; // lunes=0 como primer día de la semana
  const diasEnMes=new Date(y,m+1,0).getDate();

  let h='';
  for(let i=0;i<offset;i++) h+='<span class="mini-cal-day empty"></span>';
  for(let dia=1;dia<=diasEnMes;dia++){
    const fecha=y+'-'+String(m+1).padStart(2,'0')+'-'+String(dia).padStart(2,'0');
    const disponible=state.disponibles.has(fecha);
    const sel=fecha===state.seleccion;
    h+='<button type="button" class="mini-cal-day'+(disponible?' has-snapshot':'')+(sel?' selected':'')+'"'
      +(disponible?' data-fecha="'+fecha+'"':' disabled')+'>'+dia+'</button>';
  }
  el.querySelector('.mini-cal-grid').innerHTML=h;
}

// Posiciona el calendario en el mes de "fecha" y la deja seleccionada.
function irAFecha(el, fecha){
  const [y,m]=fecha.split('-').map(Number);
  el._cal.cursor=new Date(y, m-1, 1);
  el._cal.seleccion=fecha;
  pintarMiniCalendario(el);
}

// ============ COMPARAR AVANCES ============
// Las dos fechas a comparar salen de la tabla "snapshots" (creadas con
// "📸 Guardar snapshot"). "Fecha actual" también permite elegir el estado
// vivo de la base de datos, con el check "🔴 En vivo (ahora)".
let SNAPSHOTS_CACHE=[];
// Siempre se muestra la fecha en formato calendario (ej. "25 ago 2026"), no la
// etiqueta cruda que pueda traer el snapshot (ej. el nombre de un archivo importado).
function formatearFechaSnapshot(s){
  const d=new Date(s.fecha+'T00:00:00');
  if(isNaN(d.getTime())) return s.fecha;
  return d.toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'});
}

const calPrev=document.getElementById('calPrev');
const calCurrent=document.getElementById('calCurrent');
crearMiniCalendario(calPrev,function(){ actualizarEstadoComparador(); });
crearMiniCalendario(calCurrent,function(){ actualizarEstadoComparador(); });
calCurrent.classList.toggle('disabled', document.getElementById('compareUsarEnVivo').checked);

function actualizarEstadoComparador(){
  const enVivo=document.getElementById('compareUsarEnVivo').checked;
  const btnRun=document.getElementById('btnRunCompare');
  btnRun.disabled = !calPrev._cal.seleccion || (!enVivo && !calCurrent._cal.seleccion);
}

async function abrirComparador(){
  document.getElementById('compareModal').classList.add('show');
  const status=document.getElementById('compareFileStatus');
  const btnRun=document.getElementById('btnRunCompare');
  btnRun.disabled=true;
  status.textContent='Cargando fechas guardadas…';
  try{
    SNAPSHOTS_CACHE=await dbListarSnapshots();
    if(!SNAPSHOTS_CACHE.length){
      status.textContent='⚠️ Todavía no hay ningún snapshot guardado. Usa "📸 Guardar snapshot" primero.';
      return;
    }
    const fechas=SNAPSHOTS_CACHE.map(s=>s.fecha).sort(); // asc: [0]=más antigua, [ultima]=más reciente
    const disponibles=new Set(fechas);
    [calPrev,calCurrent].forEach(el=>{ el._cal.disponibles=disponibles; });
    irAFecha(calPrev, fechas.length>1?fechas[fechas.length-2]:fechas[fechas.length-1]);
    irAFecha(calCurrent, fechas[fechas.length-1]);
    status.textContent=fechas.length+' fecha'+(fechas.length===1?'':'s')+' guardada'+(fechas.length===1?'':'s')+' ('+formatearFechaSnapshot({fecha:fechas[0]})+' a '+formatearFechaSnapshot({fecha:fechas[fechas.length-1]})+')';
    actualizarEstadoComparador();
  }catch(err){
    status.textContent='❌ '+err.message;
  }
}
document.getElementById('compareUsarEnVivo').addEventListener('change',function(){
  calCurrent.classList.toggle('disabled', this.checked);
  actualizarEstadoComparador();
});
function cerrarComparador(){document.getElementById('compareModal').classList.remove('show');}
document.getElementById('btnCompare').addEventListener('click',abrirComparador);
document.getElementById('btnCloseCompare').addEventListener('click',cerrarComparador);
document.getElementById('compareModal').addEventListener('click',function(ev){if(ev.target===this)cerrarComparador();});

document.getElementById('btnRunCompare').addEventListener('click',async function(){
  const prevFecha=calPrev._cal.seleccion;
  const usarEnVivo=document.getElementById('compareUsarEnVivo').checked;
  const currFecha=usarEnVivo?null:calCurrent._cal.seleccion;
  const prevInfo=SNAPSHOTS_CACHE.find(s=>s.fecha===prevFecha);
  if(!prevFecha||!prevInfo){toast('⚠️ Elige una fecha anterior');return;}
  if(!usarEnVivo && !currFecha){toast('⚠️ Elige una fecha actual (o marca "en vivo")');return;}
  try{
    const prevData=await dbObtenerSnapshot(prevFecha);
    COMPARE_PREV={data:prevData, label:formatearFechaSnapshot(prevInfo)};

    if(currFecha){
      const currInfo=SNAPSHOTS_CACHE.find(s=>s.fecha===currFecha);
      const currData=await dbObtenerSnapshot(currFecha);
      COMPARE_CURRENT={data:currData, label:formatearFechaSnapshot(currInfo)};
    }else{
      COMPARE_CURRENT=null; // "actual" = estado vivo de la base de datos
    }
    cerrarComparador();
    toast('✅ Comparando '+COMPARE_PREV.label+' vs '+(COMPARE_CURRENT?COMPARE_CURRENT.label:'ahora'));
    if(document.getElementById('page-dash').classList.contains('on')) renderDashboard();
  }catch(err){toast('❌ '+err.message);}
});

// EXPORT
document.getElementById('btnExport').addEventListener('click',function(){
  if(!DATA){toast('No hay datos');return;}
  const out=Object.assign({},DATA,{exportado:new Date().toISOString()});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'}));
  a.download='CIP_Quintero_'+new Date().toISOString().slice(0,10)+'.json';a.click();
  toast('✅ JSON exportado');
});

// ============ EXPORTAR A EXCEL (.xlsx nativo, sin librerías externas) ============
const CRC_TABLA=(function(){
  const t=new Uint32Array(256);
  for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}
  return t;
})();
function crc32(u8){
  let c=0xFFFFFFFF;
  for(let i=0;i<u8.length;i++) c=CRC_TABLA[(c^u8[i])&0xFF]^(c>>>8);
  return (c^0xFFFFFFFF)>>>0;
}
// Empaqueta los archivos en un ZIP sin comprimir (método "store"), que es
// exactamente lo que un .xlsx necesita por dentro.
function zipStore(archivos){
  const enc=new TextEncoder(), trozos=[], centro=[];
  let off=0;
  archivos.forEach(function(f){
    const nom=enc.encode(f.name), datos=f.data, crc=crc32(datos), len=datos.length;
    const lh=new Uint8Array(30+nom.length), dv=new DataView(lh.buffer);
    dv.setUint32(0,0x04034b50,true); dv.setUint16(4,20,true); dv.setUint16(6,0,true);
    dv.setUint16(8,0,true); dv.setUint16(10,0,true); dv.setUint16(12,0,true);
    dv.setUint32(14,crc,true); dv.setUint32(18,len,true); dv.setUint32(22,len,true);
    dv.setUint16(26,nom.length,true); dv.setUint16(28,0,true);
    lh.set(nom,30);
    trozos.push(lh,datos);
    centro.push({nom:nom,crc:crc,len:len,off:off});
    off+=lh.length+len;
  });
  const iniCentro=off;
  centro.forEach(function(c){
    const ch=new Uint8Array(46+c.nom.length), dv=new DataView(ch.buffer);
    dv.setUint32(0,0x02014b50,true); dv.setUint16(4,20,true); dv.setUint16(6,20,true);
    dv.setUint16(8,0,true); dv.setUint16(10,0,true); dv.setUint16(12,0,true); dv.setUint16(14,0,true);
    dv.setUint32(16,c.crc,true); dv.setUint32(20,c.len,true); dv.setUint32(24,c.len,true);
    dv.setUint16(28,c.nom.length,true); dv.setUint16(30,0,true); dv.setUint16(32,0,true);
    dv.setUint16(34,0,true); dv.setUint16(36,0,true); dv.setUint32(38,0,true);
    dv.setUint32(42,c.off,true);
    ch.set(c.nom,46);
    trozos.push(ch); off+=ch.length;
  });
  const fin=new Uint8Array(22), dv=new DataView(fin.buffer);
  dv.setUint32(0,0x06054b50,true); dv.setUint16(8,centro.length,true); dv.setUint16(10,centro.length,true);
  dv.setUint32(12,off-iniCentro,true); dv.setUint32(16,iniCentro,true);
  trozos.push(fin);
  return new Blob(trozos,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function xmlEsc(t){
  return String(t==null?'':t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function colLetra(i){
  let s='';
  i=i+1;
  while(i>0){ const r=(i-1)%26; s=String.fromCharCode(65+r)+s; i=Math.floor((i-1)/26); }
  return s;
}
// Filas visibles según los filtros activos
function filasParaExportar(){
  const porId={};
  DATA.requerimientos.forEach(function(r){
    r.entregables.forEach(function(e){ porId[e.id]={req:r,e:e}; });
  });
  const out=[];
  document.querySelectorAll('#tbody tr').forEach(function(tr){
    if(tr.style.display==='none') return;
    const sel=tr.querySelector('.stsel'); if(!sel) return;
    const par=porId[sel.dataset.eid]; if(!par) return;
    out.push({req:par.req, e:par.e, dom:DATA.dominios[par.req.dominioId]});
  });
  return out;
}
function nombreArchivoExcel(){
  const limpia=function(t){ return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,''); };
  const p=['CIP_Quintero'];
  if(fDom!=='all' && DATA.dominios[fDom]) p.push(limpia(DATA.dominios[fDom].code));
  if(fOrg!=='all') p.push(limpia(ORG_LABEL[fOrg]));
  if(fSt!=='all') p.push(limpia(fSt));
  if(fSearch) p.push('Busqueda');
  const d=new Date();
  const dosDig=function(x){ return (x<10?'0':'')+x; };
  p.push(d.getFullYear()+'-'+dosDig(d.getMonth()+1)+'-'+dosDig(d.getDate()));
  return p.join('_')+'.xlsx';
}
function exportarExcel(){
  if(!DATA){ toast('No hay datos'); return; }
  const filas=filasParaExportar();
  if(!filas.length){ toast('⚠️ No hay filas visibles para exportar'); return; }

  const cab=['N°','CIP','Nombre del CIP','Requerimiento','Descripción del Requerimiento',
             'Aspecto a Mejorar','Evidencia','Responsable','Organización','Estado','Periodicidad'];
  const anchos=[6,11,34,14,42,70,40,24,14,13,18];

  const datos=filas.map(function(f,i){
    return [ i+1,
      f.dom?f.dom.code:'', f.dom?f.dom.name:'',
      f.req.codigo, f.req.descripcion,
      f.e.aspecto||'', f.e.evidencia||'', f.e.responsable||'',
      ORG_LABEL[f.e.org||'sin-asignar'],
      f.e.estado||'Pendiente', f.e.periodicidad||'' ];
  });

  const ultima=colLetra(cab.length-1);
  const totalFilas=datos.length+1;

  let sd='<row r="1" ht="20" customHeight="1">';
  cab.forEach(function(t,i){
    sd+='<c r="'+colLetra(i)+'1" s="1" t="inlineStr"><is><t>'+xmlEsc(t)+'</t></is></c>';
  });
  sd+='</row>';
  datos.forEach(function(fila,ri){
    const r=ri+2;
    sd+='<row r="'+r+'">';
    fila.forEach(function(v,ci){
      const ref=colLetra(ci)+r;
      if(ci===0) sd+='<c r="'+ref+'" s="2"><v>'+v+'</v></c>';
      else sd+='<c r="'+ref+'" s="2" t="inlineStr"><is><t xml:space="preserve">'+xmlEsc(v)+'</t></is></c>';
    });
    sd+='</row>';
  });

  let cols='<cols>';
  anchos.forEach(function(w,i){ cols+='<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>'; });
  cols+='</cols>';

  const hoja='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    +'<dimension ref="A1:'+ultima+totalFilas+'"/>'
    +'<sheetViews><sheetView tabSelected="1" workbookViewId="0">'
    +'<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
    +'<selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>'
    +'<sheetFormatPr defaultRowHeight="15"/>'
    +cols
    +'<sheetData>'+sd+'</sheetData>'
    +'<autoFilter ref="A1:'+ultima+totalFilas+'"/>'
    +'</worksheet>';

  const estilos='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    +'<fonts count="2">'
    +'<font><sz val="11"/><color theme="1"/><name val="Calibri"/></font>'
    +'<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'
    +'</fonts>'
    +'<fills count="3">'
    +'<fill><patternFill patternType="none"/></fill>'
    +'<fill><patternFill patternType="gray125"/></fill>'
    +'<fill><patternFill patternType="solid"><fgColor rgb="FFF97316"/><bgColor indexed="64"/></patternFill></fill>'
    +'</fills>'
    +'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
    +'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    +'<cellXfs count="3">'
    +'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
    +'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'
    +'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'
    +'</cellXfs>'
    +'<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
    +'</styleSheet>';

  const libro='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
    +'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    +'<sheets><sheet name="Entregables" sheetId="1" r:id="rId1"/></sheets>'
    +'<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'
    +'Entregables!$A$1:$'+ultima+'$'+totalFilas+'</definedName></definedNames>'
    +'</workbook>';

  const tipos='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    +'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    +'<Default Extension="xml" ContentType="application/xml"/>'
    +'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    +'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
    +'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
    +'</Types>';

  const relsRaiz='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    +'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
    +'</Relationships>';

  const relsLibro='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    +'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
    +'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    +'</Relationships>';

  const enc=new TextEncoder();
  const blob=zipStore([
    {name:'[Content_Types].xml', data:enc.encode(tipos)},
    {name:'_rels/.rels', data:enc.encode(relsRaiz)},
    {name:'xl/workbook.xml', data:enc.encode(libro)},
    {name:'xl/_rels/workbook.xml.rels', data:enc.encode(relsLibro)},
    {name:'xl/styles.xml', data:enc.encode(estilos)},
    {name:'xl/worksheets/sheet1.xml', data:enc.encode(hoja)}
  ]);

  const nombre=nombreArchivoExcel();
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=nombre;
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); },2000);
  toast('✅ Excel exportado · '+datos.length+' entregables');
}
document.getElementById('btnExcel').addEventListener('click',exportarExcel);

// LIMPIAR DATOS (Evidencia / Responsable / Estado)
document.getElementById('btnClearAll').addEventListener('click',function(){
  if(!DATA){toast('No hay datos');return;}
  const ok=confirm('¿Limpiar Evidencia, Responsable y Estado de TODOS los entregables ('+DATA.requerimientos.reduce((a,r)=>a+r.entregables.length,0)+')?\n\nEsta acción no se puede deshacer (puedes exportar antes como respaldo).');
  if(!ok)return;
  DATA.requerimientos.forEach(req=>{
    req.entregables.forEach(ent=>{
      ent.evidencia='';
      ent.responsable='';
      ent.estado='Pendiente';
      delete ent.orgManual;
    });
  });
  enrichOrg(DATA);
  buildDomChips();buildTable();updateSummary();applyFilters();initForm();
  renderPersonas();refreshFormOrg();
  dbLimpiarTodosLosEntregables().catch(err=>toast('❌ No se pudo limpiar en la base de datos: '+err.message));
  toast('🧹 Datos limpiados · ahora puedes exportar el JSON');
});

// INIT: carga los datos vivos desde la base de datos al abrir la página.
dbCargarTodo().then(function(data){
  loadData(data);
}).catch(function(err){
  toast('❌ No se pudo conectar a la base de datos: '+err.message);
  console.error(err);
});
