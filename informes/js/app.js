// Generador de Informes: portada, ficha documental, contenido editable y descarga en Word.
// Todo se guarda en el navegador (localStorage, prefijo "tbxinf_"); nada sale del equipo.
const $=id=>document.getElementById(id);
const ASSETS={base:"assets/portada-base.jpg",logo:"assets/logo-tibox-encabezado.png",tpl:"assets/plantilla-informe.docx"};
const LS="tbxinf_";
const fetchBytes=url=>fetch(url).then(r=>{if(!r.ok)throw new Error("no se pudo cargar "+url);return r.arrayBuffer()}).then(b=>new Uint8Array(b));
const store={get(k,d){try{const v=localStorage.getItem(LS+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(LS+k,JSON.stringify(v));return true}catch(e){return false}}};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- pasos ---------- */
document.querySelectorAll(".steps button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".steps button").forEach(x=>x.setAttribute("aria-selected",x===b?"true":"false"));
  ["v1","v2","v3","v4"].forEach(v=>$(v).hidden=v!==b.dataset.v);
  if(b.dataset.v==="v4")renderChecklist();
  if(b.dataset.v==="v2")renderFicha();
  window.scrollTo({top:0});
}));

/* ---------- estado ---------- */
// Valores iniciales neutros: el repositorio es público, así que aquí no van datos de clientes.
const hoy=new Date(),mesAnio=String(hoy.getMonth()+1).padStart(2,"0")+"/"+hoy.getFullYear();
const DEF={titulo:"",subtitulo:"",
  area:"",proceso:"Confección y emisión de documentos",version:"001",codigo:"",fecha:mesAnio,
  gen:{nombre:"",cargo:""},rev:{nombre:"",cargo:""},apr:{nombre:"",cargo:""},
  intro:"Toda modificación a este documento debe ser aprobada antes de su distribución.",
  cambios:[{version:"001",fecha:"",descripcion:"Emisión inicial del documento.",elaborado:"TIBOX",aprobado:""}],
  firmas:[{nombre:"",cargo:""},{nombre:"",cargo:""}],
  incCambios:true,incFirmas:true,headerSimple:false,ocultarCodigo:false,soloTibox:false};
const meta=Object.assign(JSON.parse(JSON.stringify(DEF)),store.get("meta",{}));
const EXAMPLE=[
  {tipo:"h1",texto:"Objetivo"},
  {tipo:"p",texto:"Este es un **ejemplo** de cómo queda el contenido con el formato de la plantilla. Pega tu texto a la izquierda, presiona «Clasificar texto» y este ejemplo se reemplaza."},
  {tipo:"h1",texto:"Alcance"},
  {tipo:"p",texto:"El alcance de este documento comprende:"},
  {tipo:"lista",items:["La información de la organización, cualquiera sea su formato o ubicación;","Los sistemas, aplicaciones y servicios utilizados para procesarla."]},
  {tipo:"h1",texto:"Roles y responsabilidades"},
  {tipo:"tabla",filas:[["Rol","Responsabilidades"],["Gerencia General","Aprobar el documento y proporcionar dirección para su cumplimiento."],["Encargado de TI","Mantener y proponer actualizaciones; coordinar su implementación."]]},
  {tipo:"p",texto:"**Confidencialidad:** acceso únicamente para personas, procesos o entidades autorizadas."}
];
let trozos=null; // trozos del clasificador (paso 3), ver CLASIFICADOR
let blocks=store.get("blocks",null);let isExample=!blocks;if(!blocks)blocks=JSON.parse(JSON.stringify(EXAMPLE));
let clientLogo=null; // {bytes,w,h,url}
let coverLogo=null;  // {url,w,h,size,img}
// Normaliza un logo a PNG de máx. 900 px de ancho
function loadLogo(file){return new Promise((res,rej)=>{const r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{
    const c=document.createElement("canvas");const k=Math.min(1,900/im.naturalWidth);c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);res({url:c.toDataURL("image/png"),w:c.width,h:c.height})};
    im.onerror=()=>rej(new Error("formato no soportado"));im.src=r.result};
  r.onerror=rej;r.readAsDataURL(file)})}
let images=store.get("imgs",{})||{};
let imgSeq=Object.keys(images).reduce((m,k)=>Math.max(m,parseInt(k.replace(/\D/g,""),10)||0),0);
function saveImages(){
  const used=new Set(blocks.filter(b=>b.tipo==="imagen").map(b=>b.ref));
  const draftRefs=($("draft")?$("draft").value:"").match(/\[\[IMG:(\w+)\]\]/g)||[];
  draftRefs.forEach(r=>used.add(r.slice(6,-2)));
  (trozos||[]).forEach(t=>{if(t.tipo==="imagen")used.add(t.ref)});
  Object.keys(images).forEach(k=>{if(!used.has(k))delete images[k]});
  // Si no cabe (el navegador guarda ~5 MB), se conserva lo que ya estaba guardado y se avisa:
  // las imágenes siguen en la página y entran al Word mientras la pestaña siga abierta.
  if(!store.set("imgs",images))setStatus("Las imágenes superan lo que el navegador puede guardar: siguen en el documento, pero descarga el Word antes de cerrar o recargar esta pestaña.",true);
}
function save(){store.set("meta",meta);store.set("blocks",isExample?null:blocks);saveImages()}
// Normaliza una imagen (cualquier formato que el navegador lea) a PNG o JPEG de máx. 2000 px
function addImage(src){return new Promise(res=>{
  const im=new Image();
  im.onload=()=>{
    const k=Math.min(1,2000/Math.max(im.naturalWidth,im.naturalHeight));
    const w=Math.max(1,Math.round(im.naturalWidth*k)),h=Math.max(1,Math.round(im.naturalHeight*k));
    const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");
    const jpg=/^data:image\/jpe?g/i.test(src);
    if(jpg){g.fillStyle="#fff";g.fillRect(0,0,w,h)}
    g.drawImage(im,0,0,w,h);
    let url;try{url=jpg?c.toDataURL("image/jpeg",0.9):c.toDataURL("image/png")}catch(e){res(null);return}
    const id="img"+(++imgSeq);images[id]={url,ext:jpg?"jpg":"png",w,h};res(id);
  };
  im.onerror=()=>res(null);im.src=src;
})}
let saveT;function saveSoon(){clearTimeout(saveT);saveT=setTimeout(save,400)}

/* campos simples */
const FIELDS=["titulo","subtitulo","area","proceso","version","codigo","fecha","intro","gen_nombre","gen_cargo","rev_nombre","rev_cargo","apr_nombre","apr_cargo","f1_nombre","f1_cargo","f2_nombre","f2_cargo"];
const getF=k=>{let m;if((m=k.match(/^(gen|rev|apr)_(\w+)$/)))return meta[m[1]][m[2]];if((m=k.match(/^f([12])_(\w+)$/)))return meta.firmas[m[1]-1][m[2]];return meta[k]};
const setF=(k,v)=>{let m;if((m=k.match(/^(gen|rev|apr)_(\w+)$/)))meta[m[1]][m[2]]=v;else if((m=k.match(/^f([12])_(\w+)$/)))meta.firmas[m[1]-1][m[2]]=v;else meta[k]=v};
FIELDS.forEach(k=>{const el=$("m_"+k);if(!el)return;el.value=getF(k)||"";
  el.addEventListener("input",()=>{setF(k,el.value);saveSoon();if(k==="titulo"||k==="subtitulo")drawCover();renderFicha()})});

/* ---------- PORTADA ---------- */
const PAGE_W=1272,PAGE_H=1647,W=333,H=385,S=0.577,R=40;
const POSXY=[[364,404],[462,342.5],[574,284]];
const panels=[0,1,2].map(()=>({img:null,zoom:1,ox:0,oy:0}));
const base=new Image();
function shapePath(g,x,y,grow){
  const w=W+(grow||0),h=H+(grow||0);
  const p=[[x,y],[x+w,y+w*S],[x+w,y+w*S+h],[x,y+h]];
  g.beginPath();g.moveTo(x,y+h/2);
  for(let k=0;k<4;k++){const a=p[k],b=p[(k+1)%4];g.arcTo(a[0],a[1],b[0],b[1],R)}
  g.closePath();
}
function wrapLines(g,t,max){const words=t.split(/\s+/);const out=[];let cur="";words.forEach(w=>{const n=cur?cur+" "+w:w;if(g.measureText(n).width>max&&cur){out.push(cur);cur=w}else cur=n});if(cur)out.push(cur);return out}
function renderCover(g,scale,withText,preview){
  g.setTransform(scale,0,0,scale,0,0);g.imageSmoothingQuality="high";
  g.fillStyle="#fff";g.fillRect(0,0,PAGE_W,PAGE_H);
  if(!base.naturalWidth)return;
  g.drawImage(base,0,0,PAGE_W,PAGE_H);
  panels.forEach((p,i)=>{
    const [x,y]=POSXY[i],bw=W,bh=H+W*S;g.save();
    if(p.img){
      shapePath(g,x-2,y-2,4);g.clip();
      const im=p.img,sc=Math.max(bw/im.naturalWidth,bh/im.naturalHeight)*p.zoom;
      const dw=im.naturalWidth*sc,dh=im.naturalHeight*sc,ex=(dw-bw)/2,ey=(dh-bh)/2;
      g.drawImage(im,x-ex-ex*p.ox,y-ey-ey*p.oy,dw,dh);
    }else{shapePath(g,x,y);g.clip();g.drawImage(base,0,0,PAGE_W,PAGE_H)}
    g.restore();
  });
  if(meta.soloTibox){
    // borra la franja superior (logo + línea) y vuelve a poner el logo de TIBOX al centro
    const sx=base.naturalWidth/PAGE_W,lx=345,ly=76,lw=260,lh=51;
    g.fillStyle="#fff";g.fillRect(320,45,720,120);
    g.drawImage(base,lx*sx,ly*sx,lw*sx,lh*sx,(PAGE_W-lw)/2,ly,lw,lh);
  }
  // logo de la empresa: a la derecha de la línea divisoria (x≈647), centrado con el logo de TIBOX (y≈101)
  else if(coverLogo&&coverLogo.img.naturalWidth){
    const k=coverLogo.size||1,maxW=300*k,maxH=66*k;
    const r=Math.min(maxW/coverLogo.w,maxH/coverLogo.h);const w=coverLogo.w*r,h=coverLogo.h*r;
    g.drawImage(coverLogo.img,692,101-h/2,w,h);
  }else if(preview){
    g.save();g.setLineDash([8,6]);g.strokeStyle="#c3cbd4";g.lineWidth=2;g.strokeRect(692,68,250,66);
    g.fillStyle="#9aa5b1";g.font='600 18px "Titillium Web", "Segoe UI", Arial, sans-serif';g.textAlign="center";g.textBaseline="middle";
    g.fillText("Logo de la empresa",817,101);g.restore();
  }
  if(withText){
    // misma ubicación que el título real del Word (Cambria 16 pt, bajada en cursiva 11 pt)
    const cx=PAGE_W/2;g.textAlign="center";g.textBaseline="alphabetic";let y=1011;
    g.font='700 33px Cambria, Caladea, Georgia, serif';g.fillStyle="#000";
    wrapLines(g,(meta.titulo||"").toUpperCase(),913).forEach(l=>{g.fillText(l,cx,y);y+=40});
    y+=0;g.font='italic 400 23px Cambria, Caladea, Georgia, serif';g.fillStyle="#777";
    if(meta.subtitulo)wrapLines(g,meta.subtitulo,913).forEach(l=>{g.fillText(l,cx,y);y+=28});
  }
}
const cv=$("cv");
function drawCover(){cv.width=PAGE_W;cv.height=PAGE_H;renderCover(cv.getContext("2d"),1,true,true)}
function bigCover(withText){const c=document.createElement("canvas");const sc=2550/PAGE_W;c.width=2550;c.height=3302;renderCover(c.getContext("2d"),sc,withText);return c}
function origThumb(i){const c=document.createElement("canvas");c.width=W;c.height=H+W*S;const g=c.getContext("2d");
  shapePath(g,0,0);g.clip();g.drawImage(base,-POSXY[i][0],-POSXY[i][1],PAGE_W,PAGE_H);return c.toDataURL()}
const PN=[["Izquierdo","atrás"],["Central","medio"],["Derecho","adelante"]];
panels.forEach((p,i)=>{
  const el=document.createElement("div");el.className="panel";
  el.innerHTML=`<img class="thumb" id="th${i}" alt="">
  <div style="display:flex;flex-direction:column;gap:5px;min-width:0">
    <strong>${PN[i][0]}<span>${PN[i][1]}</span></strong>
    <div class="row"><label class="btn small">Cambiar<input type="file" id="pf${i}" accept="image/*"></label>
    <button class="small" id="pr${i}" hidden>Original</button></div>
    <div class="sl" aria-disabled="true"><label for="pz${i}">Zoom</label><input type="range" id="pz${i}" min="1" max="3" step="0.01" value="1" disabled></div>
    <div class="sl" aria-disabled="true"><label for="px${i}">Horizontal</label><input type="range" id="px${i}" min="-1" max="1" step="0.01" value="0" disabled></div>
    <div class="sl" aria-disabled="true"><label for="py${i}">Vertical</label><input type="range" id="py${i}" min="-1" max="1" step="0.01" value="0" disabled></div>
  </div>`;
  $("panels").appendChild(el);
  const th=el.querySelector("#th"+i),rb=el.querySelector("#pr"+i);
  const sl=["pz","px","py"].map(k=>el.querySelector("#"+k+i));
  const enable=on=>{sl.forEach(s=>{s.disabled=!on;s.parentElement.setAttribute("aria-disabled",on?"false":"true")});rb.hidden=!on};
  // la imagen del panel (reducida a 1600 px) y su encuadre quedan guardados en el navegador
  const savePanel=()=>{
    if(!p.img){try{localStorage.removeItem(LS+"panel"+i)}catch(e){}return}
    if(!store.set("panel"+i,{url:p.url,zoom:p.zoom,ox:p.ox,oy:p.oy}))coverMsg(`La imagen del panel ${PN[i][0].toLowerCase()} es muy pesada para guardarla: se verá hasta que recargues la página.`);
  };
  const setImg=(url,z,ox,oy,persist)=>{const im=new Image();
    im.onload=()=>{Object.assign(p,{img:im,url,zoom:z,ox,oy});sl[0].value=z;sl[1].value=ox;sl[2].value=oy;th.src=url;enable(true);drawCover();if(persist)savePanel()};
    im.onerror=()=>coverMsg("No pude leer esa imagen. Usa una en PNG o JPG.");im.src=url};
  el.querySelector("#pf"+i).addEventListener("change",async e=>{
    const f=e.target.files[0];e.target.value="";if(!f)return;
    const url=await shrinkToJpeg(await readURL(f),1600);
    if(url)setImg(url,1,0,0,true);else coverMsg("No pude leer esa imagen. Usa una en PNG o JPG.");
  });
  rb.addEventListener("click",()=>{p.img=null;p.url=null;th.src=origThumb(i);enable(false);drawCover();savePanel()});
  [["zoom",0],["ox",1],["oy",2]].forEach(([k,j])=>{sl[j].addEventListener("input",e=>{p[k]=+e.target.value;drawCover()});sl[j].addEventListener("change",savePanel)});
  const saved=store.get("panel"+i,null);if(saved&&saved.url)setImg(saved.url,saved.zoom||1,saved.ox||0,saved.oy||0,false);
});
function coverMsg(t){const s=$("coverStatus");s.textContent=t;s.classList.add("err");clearTimeout(coverMsg.t);coverMsg.t=setTimeout(()=>{s.textContent=""},8000)}
// Reduce una imagen a máx. `max` px y la pasa a JPEG; null si el navegador no la puede leer
function shrinkToJpeg(src,max){return new Promise(res=>{const im=new Image();
  im.onload=()=>{const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));
    const c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
    const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",0.88))};
  im.onerror=()=>res(null);im.src=src})}
base.onload=()=>{drawCover();panels.forEach((p,i)=>{if(!p.img)$("th"+i).src=origThumb(i)})};
base.src=ASSETS.base;
if(document.fonts)document.fonts.ready.then(drawCover);

/* ---------- FICHA ---------- */
function hdrHTML(){
  return `<table class="hdr"><tr><td class="lg" rowspan="2"><img src="${clientLogo?clientLogo.url:ASSETS.logo}" alt="Logo"></td><td class="c">${esc(meta.area)}</td><td rowspan="2" style="width:28%"><b>Versión:</b> ${esc(meta.version)}<br>${meta.headerSimple&&meta.ocultarCodigo?"":`<b>Código:</b> ${esc(meta.codigo)}<br>`}<b>Fecha emisión:</b> ${esc(meta.fecha)}</td></tr>
  <tr><td class="c"><b>${esc(meta.proceso)}</b></td></tr>
  <tr><td colspan="3" class="c"><b>${esc((meta.titulo||"").toUpperCase())}</b></td></tr>
  ${meta.headerSimple?"":`<tr><td><div class="c"><b>Generado por:</b></div><b>Nombre:</b> ${esc(meta.gen.nombre)}<br><b>Cargo:</b> ${esc(meta.gen.cargo)}</td>
  <td><div class="c"><b>Revisado por</b></div><b>Nombre:</b> ${esc(meta.rev.nombre)}<br><b>Cargo:</b> ${esc(meta.rev.cargo)}</td>
  <td><div class="c"><b>Aprobado por:</b></div><b>Nombre:</b> ${esc(meta.apr.nombre)}<br><b>Cargo:</b> ${esc(meta.apr.cargo)}</td></tr>`}</table>`;
}
function renderFicha(){
  const ic=meta.incCambios!==false,ifi=meta.incFirmas!==false;
  $("cambiosBox").classList.toggle("off",!ic);$("firmasBox").classList.toggle("off",!ifi);
  $("incCambios").checked=ic;$("incFirmas").checked=ifi;
  $("respBox").hidden=!!meta.headerSimple;
  $("codRow").hidden=!meta.headerSimple;$("incCodigo").checked=!meta.ocultarCodigo;
  $("m_codigo").disabled=!!(meta.headerSimple&&meta.ocultarCodigo);$("m_codigo").parentElement.style.opacity=$("m_codigo").disabled?.45:"";
  document.querySelector(`input[name="hdrTipo"][value="${meta.headerSimple?"simple":"completa"}"]`).checked=true;
  let html=hdrHTML();
  if(ic)html+=`<div style="font:700 19px var(--serif);color:#000;margin-bottom:12px">Control de cambios.</div>
  <p style="text-align:justify;margin:0 0 14px">${esc(meta.intro)}</p>
  <table class="ctl"><tr><th>Versión</th><th>Fecha</th><th>Descripción</th><th>Elaborado por</th><th>Aprobado por</th></tr>
  ${meta.cambios.map(c=>`<tr><td>${esc(c.version)}</td><td>${esc(c.fecha)}</td><td>${esc(c.descripcion)}</td><td>${esc(c.elaborado)}</td><td>${esc(c.aprobado)}</td></tr>`).join("")}</table>`;
  if(ifi)html+=`<div class="firm" style="margin-top:${ic?56:180}px">${meta.firmas.map(f=>`<div>_______________________<br><br><b>${esc(f.nombre)}</b><br>${esc(f.cargo)}<br><span style="font-size:11.5px">Fecha: ____ / ____ / ______</span></div>`).join("")}</div>`;
  if(!ic&&!ifi)html+=`<p class="empty" style="padding:40px 10px">Sin control de cambios ni firmas: el índice va directo después de la portada.</p>`;
  $("fichaPrev").innerHTML=html;
  const ph=$("paper").querySelector(".hdrslot");if(ph)ph.innerHTML=hdrHTML();
}
function renderCambios(){
  const host=$("cambios");host.innerHTML="";
  meta.cambios.forEach((c,i)=>{
    const d=document.createElement("fieldset");
    d.innerHTML=`<legend>Versión ${i+1}</legend>
    <div class="cambio"><label class="f">Versión<input type="text" data-k="version"></label><label class="f">Fecha<input type="text" data-k="fecha"></label><label class="f">Descripción<input type="text" data-k="descripcion"></label></div>
    <div class="cambio2"><label class="f">Elaborado por<input type="text" data-k="elaborado"></label><label class="f">Aprobado por<input type="text" data-k="aprobado"></label>${meta.cambios.length>1?'<button class="small" data-del>Quitar</button>':''}</div>`;
    d.querySelectorAll("input").forEach(inp=>{inp.value=c[inp.dataset.k]||"";inp.addEventListener("input",()=>{c[inp.dataset.k]=inp.value;saveSoon();renderFicha()})});
    const del=d.querySelector("[data-del]");if(del)del.addEventListener("click",()=>{meta.cambios.splice(i,1);save();renderCambios();renderFicha()});
    host.appendChild(d);
  });
}
$("incCodigo").addEventListener("change",e=>{meta.ocultarCodigo=!e.target.checked;save();renderFicha()});
document.querySelectorAll('input[name="hdrTipo"]').forEach(r=>r.addEventListener("change",()=>{meta.headerSimple=r.value==="simple";save();renderFicha()}));
$("incCambios").addEventListener("change",e=>{meta.incCambios=e.target.checked;save();renderFicha()});
$("incFirmas").addEventListener("change",e=>{meta.incFirmas=e.target.checked;save();renderFicha()});
$("addCambio").addEventListener("click",()=>{const last=meta.cambios[meta.cambios.length-1]||{};
  const nv=String((parseInt(last.version,10)||0)+1).padStart(3,"0");
  meta.cambios.push({version:nv,fecha:"",descripcion:"",elaborado:last.elaborado||"",aprobado:last.aprobado||""});save();renderCambios();renderFicha()});
// logo propio de la tabla documental (sin él va el de TIBOX); queda guardado en el navegador
function saveHeaderLogo(){
  const own=clientLogo&&!clientLogo.fromCover&&!clientLogo.fromTibox;
  try{if(own)store.set("headerlogo",{url:clientLogo.url,w:clientLogo.w,h:clientLogo.h});else localStorage.removeItem(LS+"headerlogo")}catch(e){}
}
function fichaMsg(t){const s=$("fichaStatus");s.textContent=t;s.classList.toggle("err",!!t)}
$("logoFile").addEventListener("change",async e=>{
  const f=e.target.files[0];e.target.value="";if(!f)return;
  try{const d=await loadLogo(f);clientLogo={url:d.url,bytes:dataBytes(d.url),w:d.w,h:d.h};$("logoReset").hidden=false;fichaMsg("");saveHeaderLogo();renderFicha()}
  catch(err){fichaMsg("No pude leer ese archivo. Usa un logo en PNG, JPG o SVG.")}
});
$("logoReset").addEventListener("click",()=>{clientLogo=null;$("logoReset").hidden=true;saveHeaderLogo();renderFicha()});
{const s=store.get("headerlogo",null);if(s&&s.url){clientLogo={url:s.url,bytes:dataBytes(s.url),w:s.w,h:s.h};$("logoReset").hidden=false}}

/* logo de la empresa en la portada */
function setCoverLogo(data,keepSize){
  if(!data){coverLogo=null}else{const img=new Image();coverLogo={url:data.url,w:data.w,h:data.h,size:keepSize||data.size||1,img};img.onload=drawCover;img.src=data.url}
  $("clThumb").hidden=!coverLogo;if(coverLogo)$("clThumb").src=coverLogo.url;
  $("coverLogoDel").hidden=$("clSizeRow").hidden=$("clSyncRow").hidden=!coverLogo;
  if(coverLogo)$("clSize").value=coverLogo.size;
  if(coverLogo)$("clSync").checked=coverLogo.sync!==false&&data.sync!==false;
  if(coverLogo)coverLogo.sync=$("clSync").checked;
  syncHeaderLogo();drawCover();
}
const TIBOX_HDR={url:ASSETS.logo,w:265,h:55,fromTibox:true};
function syncHeaderLogo(){
  if(clientLogo&&clientLogo.fromTibox&&!meta.soloTibox){clientLogo=null;$("logoReset").hidden=true}
  if(meta.soloTibox){if(!clientLogo||clientLogo.fromCover||clientLogo.fromTibox){clientLogo=Object.assign({bytes:null},TIBOX_HDR);$("logoReset").hidden=false}}
  else if(coverLogo&&coverLogo.sync){clientLogo={url:coverLogo.url,bytes:dataBytes(coverLogo.url),w:coverLogo.w,h:coverLogo.h,fromCover:true};$("logoReset").hidden=false}
  else if(clientLogo&&clientLogo.fromCover){clientLogo=null;$("logoReset").hidden=true}
  renderFicha();const ph=$("paper").querySelector(".hdrslot");if(ph)ph.innerHTML=hdrHTML();
}
function renderLogoModo(){
  document.querySelector(`input[name="logoModo"][value="${meta.soloTibox?"solo":"cliente"}"]`).checked=true;
  $("clBox").hidden=!!meta.soloTibox;
}
document.querySelectorAll('input[name="logoModo"]').forEach(r=>r.addEventListener("change",()=>{meta.soloTibox=r.value==="solo";save();renderLogoModo();syncHeaderLogo();drawCover()}));
function saveCoverLogo(){try{if(coverLogo)store.set("coverlogo",{url:coverLogo.url,w:coverLogo.w,h:coverLogo.h,size:coverLogo.size,sync:coverLogo.sync});else localStorage.removeItem(LS+"coverlogo")}catch(e){}}
$("coverLogoFile").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
  try{const d=await loadLogo(f);setCoverLogo(Object.assign(d,{sync:$("clSync").checked}));saveCoverLogo()}
  catch(err){alertCover("No pude leer ese archivo. Usa un logo en PNG, JPG o SVG.")}});
$("coverLogoDel").addEventListener("click",()=>{setCoverLogo(null);saveCoverLogo()});
$("clSize").addEventListener("input",e=>{if(coverLogo){coverLogo.size=+e.target.value;drawCover();saveCoverLogo()}});
$("clSync").addEventListener("change",e=>{if(coverLogo){coverLogo.sync=e.target.checked;syncHeaderLogo();saveCoverLogo()}});
function alertCover(t){const p=$("clSizeRow").parentElement.querySelector(".hint");p.textContent=t;p.style.color="var(--danger)";
  setTimeout(()=>{p.textContent="Va arriba, a la derecha de la línea junto al logo de TIBOX.";p.style.color=""},5000)}
// la ficha: subir un logo ahí desvincula el de la portada
$("logoFile").addEventListener("change",()=>{if(coverLogo&&coverLogo.sync){coverLogo.sync=false;$("clSync").checked=false;saveCoverLogo()}},true);
{const s=store.get("coverlogo",null);if(s&&s.url)setCoverLogo(s,s.size)}
renderLogoModo();if(meta.soloTibox){syncHeaderLogo();drawCover()}

/* ---------- HOJA EDITABLE ---------- */
const toHTML=s=>esc(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>");
function fromEl(el){
  const c=el.cloneNode(true);
  c.querySelectorAll("b,strong").forEach(b=>b.replaceWith("**"+b.textContent+"**"));
  c.querySelectorAll("br").forEach(b=>b.replaceWith(" "));
  return c.textContent.replace(/\s+/g," ").replace(/\*\*\s*\*\*/g,"").trim();
}
const TYPES_ALL=["imagen"];
const TYPES=[["h1","Sección (I, II…)"],["h2","Subtítulo"],["h3","Subtítulo menor"],["p","Párrafo"],["lista","Viñetas"],["numerada","Numerada"],["tabla","Tabla"],["nota","Recuadro"]];
function convert(b,t){
  const txt=b.texto!=null?b.texto:(b.items?b.items.join("\n"):(b.filas||[]).map(r=>r.join(" | ")).join("\n"));
  if(t==="lista"||t==="numerada")return{tipo:t,items:b.items||txt.split(/\n+/).filter(Boolean)};
  if(t==="tabla")return{tipo:t,filas:b.filas||txt.split(/\n+/).filter(Boolean).map(l=>l.split(/\s*\|\s*|\t/))};
  return{tipo:t,texto:txt.replace(/\n+/g," ")};
}
function touch(){if(isExample){isExample=false;const bd=$("paper").querySelector(".badge");if(bd)bd.remove()}saveSoon()}
function renderPaper(){
  const P=$("paper");P.innerHTML="";
  const hs=document.createElement("div");hs.className="hdrslot";hs.innerHTML=hdrHTML();P.appendChild(hs);
  if(isExample){const bd=document.createElement("div");bd.className="badge";bd.textContent="Ejemplo";P.appendChild(bd)}
  if(!blocks.length){const e=document.createElement("div");e.className="empty";e.textContent="Aún no hay contenido. Pega tu texto a la izquierda y presiona «Clasificar texto».";P.appendChild(e)}
  blocks.forEach((b,i)=>{
    const w=document.createElement("div");w.className="blk";
    const tools=document.createElement("div");tools.className="tools";
    const sel=document.createElement("select");
    if(b.tipo==="imagen"){
      sel.setAttribute("aria-label","Tamaño de la imagen");
      [["100","Ancho completo"],["75","75 %"],["50","50 %"],["35","35 %"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;sel.appendChild(o)});
      sel.value=String(b.ancho||100);sel.addEventListener("change",()=>{b.ancho=+sel.value;touch();renderPaper()});
    }else{
      sel.setAttribute("aria-label","Tipo de bloque");
      TYPES.forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;sel.appendChild(o)});sel.value=b.tipo;
      sel.addEventListener("change",()=>{blocks[i]=convert(b,sel.value);touch();renderPaper()});
    }
    const up=document.createElement("button");up.textContent="↑";up.title="Subir";up.disabled=i===0;
    up.addEventListener("click",()=>{[blocks[i-1],blocks[i]]=[blocks[i],blocks[i-1]];touch();renderPaper()});
    const del=document.createElement("button");del.textContent="Quitar";
    del.addEventListener("click",()=>{blocks.splice(i,1);touch();renderPaper()});
    const dn=document.createElement("button");dn.textContent="↓";dn.title="Bajar";dn.disabled=i===blocks.length-1;
    dn.addEventListener("click",()=>{[blocks[i+1],blocks[i]]=[blocks[i],blocks[i+1]];touch();renderPaper()});
    tools.append(sel,up,dn,del);w.appendChild(tools);
    let el;
    if(["h1","h2","h3","p","nota"].includes(b.tipo)){
      const tag={h1:"h3",h2:"h4",h3:"h5",p:"p",nota:"div"}[b.tipo],cls={h1:"x1",h2:"x2",h3:"x3",p:"xp",nota:"xnote"}[b.tipo];
      el=document.createElement(tag);el.className=cls;
      const span=document.createElement("span");span.contentEditable="true";span.innerHTML=toHTML(b.texto);span.style.flex="1";
      if(b.tipo==="h1"){el.appendChild(span)}else{el=Object.assign(el,{});el.contentEditable="true";el.innerHTML=toHTML(b.texto)}
      const src=b.tipo==="h1"?span:el;
      src.addEventListener("input",()=>{b.texto=fromEl(src);touch()});
    }else if(b.tipo==="lista"||b.tipo==="numerada"){
      el=document.createElement(b.tipo==="lista"?"ul":"ol");el.className=b.tipo==="lista"?"xl":"xn";el.contentEditable="true";
      el.innerHTML=(b.items||[]).map(t=>`<li>${toHTML(t)}</li>`).join("")||"<li></li>";
      el.addEventListener("input",()=>{b.items=[...el.querySelectorAll("li")].map(fromEl).filter(Boolean);touch()});
    }else if(b.tipo==="imagen"){
      el=document.createElement("figure");el.className="xi";const im=images[b.ref];
      if(im){const img=document.createElement("img");img.src=im.url;img.alt=b.texto||"Imagen del documento";img.style.width=Math.min(100,(b.ancho||100))+"%";
        img.style.maxWidth=Math.round(im.w)+"px";el.appendChild(img)}
      else{const m=document.createElement("div");m.className="missing";m.textContent="Imagen no disponible: vuelve a subir el borrador o reemplázala.";el.appendChild(m)}
      const cap=document.createElement("figcaption");cap.contentEditable="true";cap.innerHTML=toHTML(b.texto||"");
      cap.addEventListener("input",()=>{b.texto=fromEl(cap);touch()});el.appendChild(cap);
      const rep=document.createElement("label");rep.className="btn";
      rep.innerHTML='Reemplazar<input type="file" accept="image/*">';
      rep.querySelector("input").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;const id=await addImage(await readURL(f));
        if(id){b.ref=id;touch();save();renderPaper()}else setStatus("No pude leer esa imagen. Prueba con PNG o JPG.",true)});
      tools.insertBefore(rep,del);
    }else if(b.tipo==="tabla"){
      el=document.createElement("table");el.className="xt";
      (b.filas||[]).forEach((r,ri)=>{const tr=el.insertRow();r.forEach((c,ci)=>{const td=tr.insertCell();td.contentEditable="true";td.innerHTML=toHTML(c);
        td.addEventListener("input",()=>{b.filas[ri][ci]=fromEl(td);touch()})})});
      const add=document.createElement("button");add.textContent="+ fila";
      add.addEventListener("click",()=>{b.filas=b.filas||[];const n=b.filas.length?Math.max(1,...b.filas.map(r=>r.length)):2;b.filas.push(Array(n).fill(""));touch();renderPaper()});
      tools.insertBefore(add,del);
    }
    w.appendChild(el);P.appendChild(w);
  });
  const add=document.createElement("div");add.className="addrow";
  const ib=document.createElement("label");ib.className="btn";
  ib.innerHTML='+ Imagen<input type="file" accept="image/*" multiple>';
  ib.querySelector("input").addEventListener("change",async e=>{
    for(const f of e.target.files){const id=await addImage(await readURL(f));if(id){if(isExample){blocks=[];isExample=false}blocks.push({tipo:"imagen",ref:id,texto:""})}
      else setStatus("No pude leer "+f.name+". Prueba con PNG o JPG.",true)}
    save();renderPaper()});
  [["h1","+ Sección"],["p","+ Párrafo"],["lista","+ Viñetas"],["tabla","+ Tabla"]].forEach(([t,l])=>{
    const b=document.createElement("button");b.textContent=l;
    b.addEventListener("click",()=>{if(isExample){blocks=[];isExample=false}
      blocks.push(t==="lista"?{tipo:t,items:["Nuevo punto"]}:t==="tabla"?{tipo:t,filas:[["Columna 1","Columna 2"],["",""]]}:{tipo:t,texto:t==="h1"?"Nueva sección":"Nuevo párrafo"});
      saveSoon();renderPaper()});add.appendChild(b)});
  add.appendChild(ib);
  P.appendChild(add);
}

/* ---------- LECTURA DEL BORRADOR ---------- */
const readURL=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
async function htmlToMd(html){
  const d=document.createElement("div");d.innerHTML=html;const out=[];
  // cada imagen pasa a una línea propia [[IMG:id]] en el lugar donde estaba
  let lost=0;const last=new Map();
  for(const img of [...d.querySelectorAll("img")]){
    let top=img;while(top.parentNode&&top.parentNode!==d)top=top.parentNode;
    const id=img.src?await addImage(img.src):null;img.remove();
    if(!id){lost++;continue}
    const mark=document.createElement("p");mark.textContent="[[IMG:"+id+"]]";
    (last.get(top)||top).after(mark);last.set(top,mark);
  }
  for(const top of last.keys())if(top.isConnected&&!top.textContent.trim()&&!top.querySelector("img"))top.remove();
  htmlToMd.lost=lost;
  const inline=n=>{const c=n.cloneNode(true);c.querySelectorAll("strong,b").forEach(b=>b.replaceWith("**"+b.textContent.trim()+"**"));return c.textContent.replace(/\s+/g," ").trim()};
  [...d.children].forEach(n=>{
    const t=n.tagName;
    if(/^H[1-6]$/.test(t))out.push("#".repeat(Math.min(3,+t[1]))+" "+inline(n));
    else if(t==="UL"||t==="OL")[...n.querySelectorAll("li")].forEach((li,k)=>out.push((t==="UL"?"- ":(k+1)+". ")+inline(li)));
    else if(t==="TABLE")[...n.querySelectorAll("tr")].forEach(tr=>out.push("| "+[...tr.children].map(inline).join(" | ")+" |"));
    else{const s=inline(n);if(s)out.push(s)}
    out.push("");
  });
  return out.join("\n").replace(/\n{3,}/g,"\n\n").trim();
}
function setStatus(t,err){$("status").textContent=t;$("status").classList.toggle("err",!!err)}
$("draftFile").addEventListener("change",async e=>{
  const f=e.target.files[0];if(!f)return;$("fileName").textContent=f.name;setStatus("Leyendo "+f.name+"…");
  try{
    if(/\.docx$/i.test(f.name)){
      if(!window.mammoth)throw new Error("no se pudo cargar el lector de Word");
      const r=await mammoth.convertToHtml({arrayBuffer:await f.arrayBuffer()});
      $("draft").value=await htmlToMd(r.value);
    }else $("draft").value=await f.text();
    const n=($("draft").value.match(/\[\[IMG:\w+\]\]/g)||[]).length;
    setStatus("Borrador cargado"+(n?` con ${n} ${n>1?"imágenes":"imagen"} (marcadas como [[IMG:…]] en el texto)`:"")+". Ahora presiona «Clasificar texto»."+
      (htmlToMd.lost?` ${htmlToMd.lost} imagen(es) venían en un formato que el navegador no puede leer (por ejemplo EMF); agrégalas con «+ Imagen».`:""));
    saveImages();
  }catch(err){setStatus("No pude leer el archivo: "+err.message,true)}
  e.target.value="";store.set("draft",$("draft").value);
});
$("draft").value=store.get("draft","");
$("draft").addEventListener("input",()=>store.set("draft",$("draft").value));

function stripRoman(t){return t.replace(/^\s*(?:[IVXLC]+|\d+)[.)-]\s+/,"")}
/* ---------- CLASIFICADOR ---------- */
// El texto pegado se corta en trozos (una línea = un trozo, salvo líneas cortadas a la mitad de
// una frase) y cada uno trae un tipo propuesto. La persona corrige el tipo, el orden y los cortes,
// y recién ahí se arma la hoja. Los trozos se guardan para no perder el trabajo al recargar.
const CT=[["h1","Título"],["h2","Subtítulo"],["p","Párrafo"],["li","Viñeta"],["ni","Numerada"]];
const CT_TXT=CT.map(c=>c[0]);
trozos=store.get("trozos",null);
const capital=l=>l.charAt(0)+l.slice(1).toLowerCase();
function aTrozos(md){
  const out=[];let prev=null;
  const lines=md.replace(/\r/g,"").split("\n");
  // la línea siguiente empieza en minúscula: la frase continúa, así que esta no es un título
  const sigue=k=>/^[a-záéíóúñü(«"]/.test((lines[k+1]||"").trim());
  lines.forEach((raw,k)=>{
    const l=raw.trim();if(!l){prev=null;return}let m;
    if((m=l.match(/^\[\[IMG:(\w+)\]\]$/))){prev={tipo:"imagen",ref:m[1],texto:""};out.push(prev);return}
    if(/^\|.*\|$/.test(l)){const cells=l.slice(1,-1).split("|").map(x=>x.trim());if(cells.every(c=>/^:?-+:?$/.test(c)))return;
      if(prev&&prev.tipo==="tabla")prev.filas.push(cells);else{prev={tipo:"tabla",filas:[cells]};out.push(prev)}return}
    if(prev&&prev.tipo==="imagen"&&!prev.texto&&/^(figura|fig\.|imagen|gráfico|grafico|diagrama)\s*\d*[.:-]/i.test(l)&&l.length<200){prev.texto=l;prev=null;return}
    if((m=l.match(/^(#{1,3})\s+(.*)/))){out.push({tipo:m[1].length===1?"h1":"h2",texto:m[1].length===1?stripRoman(m[2]):m[2]});prev=null;return}
    if((m=l.match(/^[-*•·]\s+(.*)/))){prev={tipo:"li",texto:m[1]};out.push(prev);return}
    if((m=l.match(/^[IVXLC]+\.\s+(.{2,80})$/))&&!/[.;:,]$/.test(m[1])){out.push({tipo:"h1",texto:m[1]});prev=null;return}
    if((m=l.match(/^\d+\.\d+(?:\.\d+)*\.?\s+(.{2,80})$/))&&!/[.;:,]$/.test(m[1])){out.push({tipo:"h2",texto:m[1]});prev=null;return}
    if((m=l.match(/^\d+[.)]\s+(.*)/))){prev={tipo:"ni",texto:m[1]};out.push(prev);return}
    if(l.length<80&&!/[.,;:]$/.test(l)&&l===l.toUpperCase()&&/[A-ZÁÉÍÓÚÑ]/.test(l)){out.push({tipo:"h1",texto:stripRoman(capital(l))});prev=null;return}
    // línea cortada a la mitad de una frase: sigue el trozo anterior
    if(prev&&["p","li","ni"].includes(prev.tipo)&&!/[.:;?!]$/.test(prev.texto)&&/^[a-záéíóúñü(«"]/.test(l)){prev.texto+=" "+l;return}
    // línea corta, sin punto final y con mayúscula inicial: probablemente un título
    if(l.length<70&&l.split(/\s+/).length<=8&&!/[.,;:]$/.test(l)&&/^[A-ZÁÉÍÓÚÑ¿]/.test(l)&&!sigue(k)){out.push({tipo:"h1",texto:stripRoman(l)});prev=null;return}
    prev={tipo:"p",texto:l};out.push(prev);
  });
  return out;
}
function trozosABloques(){
  const out=[];
  trozos.filter(t=>!t.quitado).forEach(t=>{
    if(t.tipo==="tabla"){out.push({tipo:"tabla",filas:t.filas});return}
    if(t.tipo==="imagen"){out.push({tipo:"imagen",ref:t.ref,texto:(t.texto||"").trim()});return}
    const tx=String(t.texto||"").replace(/\s+/g," ").trim();if(!tx)return;
    if(t.tipo==="li"||t.tipo==="ni"){const tp=t.tipo==="li"?"lista":"numerada",last=out[out.length-1];
      if(last&&last.tipo===tp)last.items.push(tx);else out.push({tipo:tp,items:[tx]});return}
    out.push({tipo:t.tipo,texto:t.tipo==="h1"?stripRoman(tx):tx});
  });
  return out;
}
let clSaveT;const saveTrozos=()=>{clearTimeout(clSaveT);clSaveT=setTimeout(()=>store.set("trozos",trozos),300)};
function clMsg(t,err){$("clStatus").textContent=t;$("clStatus").classList.toggle("err",!!err)}
function clAbrir(abierto){$("clasif").hidden=!abierto;$("paper").hidden=abierto}
function clContar(){
  const v=trozos.filter(t=>!t.quitado),n=k=>v.filter(t=>t.tipo===k).length,q=trozos.length-v.length;
  const pl=(k,s)=>k+" "+s+(k===1?"":/[aeiouáéíóú]$/.test(s)?"s":"es");
  $("clCount").textContent=[pl(trozos.length,"trozo"),pl(n("h1"),"título"),pl(n("h2"),"subtítulo"),pl(n("p"),"párrafo")]
    .concat(n("li")+n("ni")?[pl(n("li")+n("ni"),"viñeta")]:[],q?[pl(q,"quitado")]:[]).join(" · ");
  const hay=!isExample&&blocks.length>0;$("clAppend").hidden=!hay;$("clApply").textContent=hay?"Reemplazar el informe":"Pasar al informe";
}
let clDrag=null;
function renderClasif(foco){
  const L=$("clList");L.innerHTML="";
  trozos.forEach((t,i)=>{
    const row=document.createElement("div");row.className="tz tz-"+t.tipo+(t.quitado?" off":"");
    const bar=document.createElement("div");bar.className="tzbar";
    const h=document.createElement("span");h.className="tzh";h.textContent="⋮⋮";h.title="Arrastra para mover";h.draggable=true;
    h.addEventListener("dragstart",e=>{clDrag=i;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(i));e.dataTransfer.setDragImage(row,20,20);row.classList.add("dragging")});
    h.addEventListener("dragend",()=>{clDrag=null;row.classList.remove("dragging");L.querySelectorAll(".drop-up,.drop-dn").forEach(r=>r.classList.remove("drop-up","drop-dn"))});
    row.addEventListener("dragover",e=>{if(clDrag===null)return;e.preventDefault();const r=row.getBoundingClientRect(),abajo=e.clientY>r.top+r.height/2;row.classList.toggle("drop-dn",abajo);row.classList.toggle("drop-up",!abajo)});
    row.addEventListener("dragleave",()=>row.classList.remove("drop-up","drop-dn"));
    row.addEventListener("drop",e=>{e.preventDefault();if(clDrag===null)return;const r=row.getBoundingClientRect();let to=i+(e.clientY>r.top+r.height/2?1:0);
      const [m]=trozos.splice(clDrag,1);if(clDrag<to)to--;trozos.splice(to,0,m);clDrag=null;saveTrozos();renderClasif(to)});
    bar.appendChild(h);
    const num=document.createElement("span");num.className="tzn";num.textContent=i+1;bar.appendChild(num);
    const texto=CT_TXT.includes(t.tipo),prevTexto=i>0&&CT_TXT.includes(trozos[i-1].tipo);
    if(texto){
      const g=document.createElement("div");g.className="tzpills";g.setAttribute("role","radiogroup");g.setAttribute("aria-label","Tipo del trozo "+(i+1));
      CT.forEach(([v,l],k)=>{const b=document.createElement("button");b.type="button";b.textContent=l;b.title=l+" (Alt+"+(k+1)+")";
        b.setAttribute("role","radio");b.setAttribute("aria-checked",String(t.tipo===v));b.className=t.tipo===v?"on":"";
        b.addEventListener("click",()=>clTipo(i,v));g.appendChild(b)});
      bar.appendChild(g);
    }else{const tag=document.createElement("span");tag.className="tztag";tag.textContent=t.tipo==="tabla"?"Tabla":"Imagen";bar.appendChild(tag)}
    const acc=document.createElement("div");acc.className="tzacc";
    const mk=(txt,title,fn,dis)=>{const b=document.createElement("button");b.type="button";b.textContent=txt;b.title=title;b.disabled=!!dis;b.addEventListener("click",fn);acc.appendChild(b);return b};
    mk("Unir ↑","Unir con el trozo de arriba",()=>clUnir(i),!(texto&&prevTexto));
    if(texto)mk("Cortar","Cortar en dos donde está el cursor (Ctrl+Enter)",()=>clCortar(i));
    mk(t.quitado?"Recuperar":"Quitar",t.quitado?"Volver a incluir este trozo":"No incluir este trozo (Alt+0)",()=>clQuitar(i));
    bar.appendChild(acc);row.appendChild(bar);
    if(texto){
      const ta=document.createElement("textarea");ta.className="tzt";ta.value=t.texto;ta.rows=1;ta.setAttribute("aria-label","Texto del trozo "+(i+1));
      const fit=()=>{ta.style.height="auto";ta.style.height=ta.scrollHeight+2+"px"};
      // el botón «Cortar» necesita saber dónde estaba el cursor antes de que el clic le quite el foco
      const marca=()=>{t._pos=ta.selectionStart};
      ta.addEventListener("input",()=>{t.texto=ta.value;fit();marca();saveTrozos()});
      ta.addEventListener("keyup",marca);ta.addEventListener("click",marca);
      ta.addEventListener("keydown",e=>clTecla(e,i,ta));
      row.appendChild(ta);requestAnimationFrame(fit);
    }else if(t.tipo==="imagen"){
      const f=document.createElement("div");f.className="tzimg";const im=images[t.ref];
      if(im){const img=document.createElement("img");img.src=im.url;img.alt="";f.appendChild(img)}
      const cap=document.createElement("input");cap.type="text";cap.placeholder="Pie de imagen (opcional)";cap.value=t.texto||"";cap.setAttribute("aria-label","Pie de la imagen");
      cap.addEventListener("input",()=>{t.texto=cap.value;saveTrozos()});cap.addEventListener("keydown",e=>clTecla(e,i,null));f.appendChild(cap);row.appendChild(f);
    }else{
      const tb=document.createElement("div");tb.className="tztab";
      tb.textContent=(t.filas||[]).slice(0,3).map(r=>r.join("  ·  ")).join("\n")+((t.filas||[]).length>3?`\n… ${t.filas.length} filas en total`:"");row.appendChild(tb);
    }
    L.appendChild(row);
  });
  clContar();
  if(foco!=null){const r=L.children[Math.max(0,Math.min(foco,L.children.length-1))];if(r){const el=r.querySelector("textarea,input")||r.querySelector("button");if(el){el.focus({preventScroll:true});r.scrollIntoView({block:"nearest"})}}}
}
function clTipo(i,v){trozos[i].tipo=v;trozos[i].quitado=false;saveTrozos();renderClasif(i)}
function clQuitar(i){trozos[i].quitado=!trozos[i].quitado;saveTrozos();renderClasif(i)}
function clMover(i,d){const j=i+d;if(j<0||j>=trozos.length)return;[trozos[i],trozos[j]]=[trozos[j],trozos[i]];saveTrozos();renderClasif(j)}
function clUnir(i){const a=trozos[i-1],b=trozos[i];a.texto=(a.texto.trim()+" "+b.texto.trim()).trim();trozos.splice(i,1);saveTrozos();renderClasif(i-1);clMsg("Trozos unidos.")}
function clCortar(i,pos){
  const t=trozos[i];if(pos==null)pos=t._pos;
  const a=pos==null?"":t.texto.slice(0,pos).trim(),b=pos==null?"":t.texto.slice(pos).trim();
  if(!a||!b){clMsg("Haz clic dentro del texto, justo donde quieres cortarlo, y vuelve a presionar «Cortar».",true);return}
  t.texto=a;delete t._pos;trozos.splice(i+1,0,{tipo:"p",texto:b});saveTrozos();renderClasif(i+1);clMsg("Trozo cortado en dos: la segunda parte quedó como párrafo.");
}
function clTecla(e,i,ta){
  if(e.altKey&&/^[0-5]$/.test(e.key)){e.preventDefault();if(e.key==="0")clQuitar(i);else if(CT_TXT.includes(trozos[i].tipo))clTipo(i,CT[+e.key-1][0]);return}
  if(e.altKey&&(e.key==="ArrowUp"||e.key==="ArrowDown")){e.preventDefault();clMover(i,e.key==="ArrowUp"?-1:1);return}
  if(ta&&e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();clCortar(i,ta.selectionStart)}
}
$("goClasif").addEventListener("click",()=>{
  const md=$("draft").value.trim();if(!md){setStatus("Primero sube o pega el texto.",true);return}
  if(trozos&&trozos.length&&!$("clasif").hidden&&!confirm("Ya estás clasificando un texto. ¿Empezar de nuevo con el texto de la izquierda? Se pierden los cambios de la clasificación actual."))return;
  trozos=aTrozos(md);store.set("trozos",trozos);clAbrir(true);renderClasif();clMsg("");
  setStatus("Revisa la clasificación a la derecha y presiona «"+$("clApply").textContent+"».");
  $("clasif").scrollIntoView({block:"start",behavior:"smooth"});
});
function clTerminar(agregar){
  const nuevos=trozosABloques();if(!nuevos.length){clMsg("No queda nada para pasar: todos los trozos están quitados o vacíos.",true);return}
  if(agregar&&!isExample)blocks.push(...nuevos);else blocks=nuevos;
  isExample=false;trozos=null;store.set("trozos",null);save();clAbrir(false);renderPaper();
  setStatus("Listo: "+nuevos.length+" bloques "+(agregar?"agregados al final del informe":"en el informe")+". Puedes seguir editándolos en la hoja.");
}
$("clApply").addEventListener("click",()=>clTerminar(false));
$("clAppend").addEventListener("click",()=>clTerminar(true));
$("clCancel").addEventListener("click",()=>{trozos=null;store.set("trozos",null);clAbrir(false);setStatus("Clasificación cancelada. El informe no cambió.")});
if(trozos&&trozos.length){clAbrir(true);renderClasif()}
// Limpiar contenido: deja el paso 3 en blanco (texto pegado, clasificación e informe). La portada
// y la ficha no se tocan; las imágenes que quedan sin uso se borran solas en saveImages().
$("goLimpiar").addEventListener("click",()=>{
  const hay=$("draft").value.trim()||(trozos&&trozos.length)||(!isExample&&blocks.length);
  if(!hay){setStatus("No hay contenido que limpiar.");return}
  if(!confirm("¿Borrar el texto pegado y todo el contenido del informe? La portada y la ficha del documento se mantienen. Esto no se puede deshacer."))return;
  $("draft").value="";store.set("draft","");$("fileName").textContent="Word (.docx) o texto";
  trozos=null;store.set("trozos",null);clAbrir(false);clMsg("");
  blocks=[];isExample=false;save();renderPaper();
  setStatus("Contenido borrado. Pega un texto nuevo para empezar.");
});

/* ---------- ALIMENTADOR ---------- */
// Se elige el tipo, se escribe y cada pieza se suma al final del informe.
const FEED={
  h1:{label:"Texto del título",hint:"Sale numerado en romanos (I., II., III.) y entra solo al índice.",ph:"Ej: Objetivo"},
  h2:{label:"Texto del subtítulo",hint:"Va dentro de la sección anterior.",ph:"Ej: Alcance de la revisión"},
  p:{label:"Texto del párrafo",hint:"Deja una línea en blanco para separar párrafos. **texto** sale en negrita.",ph:"Escribe o pega el párrafo…"},
  lista:{label:"Puntos de la lista",hint:"Un punto por línea.",ph:"Primer punto\nSegundo punto"},
  imagen:{label:"Pie de imagen (opcional)",hint:"La imagen se agrega a ancho completo; luego puedes achicarla en la hoja.",ph:"Ej: Figura 1. Diagrama de red"}
};
const fdTipo=()=>document.querySelector('input[name="fdTipo"]:checked').value;
let fdFile=null;
function fdSet(){
  const t=fdTipo(),c=FEED[t];
  $("fdLabel").textContent=c.label;$("fdHint").textContent=c.hint;$("fdTexto").placeholder=c.ph;
  $("fdImgRow").hidden=t!=="imagen";$("fdTexto").classList.toggle("short",t==="h1"||t==="h2"||t==="imagen");
}
document.querySelectorAll('input[name="fdTipo"]').forEach(r=>r.addEventListener("change",()=>{fdSet();$("fdStatus").textContent="";$("fdTexto").focus()}));
$("fdImg").addEventListener("change",e=>{fdFile=e.target.files[0]||null;$("fdImgName").textContent=fdFile?fdFile.name:"PNG o JPG"});
function fdMsg(t,err){$("fdStatus").textContent=t;$("fdStatus").classList.toggle("err",!!err)}
async function fdAdd(){
  const t=fdTipo(),txt=$("fdTexto").value.replace(/\r/g,"").trim();let nuevos=[];
  if(t==="imagen"){
    if(!fdFile){fdMsg("Primero elige la imagen.",true);return}
    const id=await addImage(await readURL(fdFile));
    if(!id){fdMsg("No pude leer esa imagen. Prueba con PNG o JPG.",true);return}
    nuevos=[{tipo:"imagen",ref:id,texto:txt.replace(/\s+/g," ")}];
  }else{
    if(!txt){fdMsg("Escribe el texto antes de agregarlo.",true);return}
    if(t==="h1")nuevos=[{tipo:"h1",texto:stripRoman(txt.replace(/\s+/g," "))}];
    else if(t==="h2")nuevos=[{tipo:"h2",texto:txt.replace(/\s+/g," ")}];
    else if(t==="p")nuevos=txt.split(/\n\s*\n/).map(s=>({tipo:"p",texto:s.replace(/\s+/g," ").trim()})).filter(b=>b.texto);
    else nuevos=[{tipo:"lista",items:txt.split("\n").map(s=>s.replace(/^\s*[-*•·]\s*/,"").trim()).filter(Boolean)}];
  }
  if(isExample){blocks=[];isExample=false}
  blocks.push(...nuevos);save();renderPaper();
  // se marca y se muestra lo recién agregado
  const all=$("paper").querySelectorAll(".blk");const last=all[all.length-1];
  if(last){for(let i=all.length-nuevos.length;i<all.length;i++)all[i].classList.add("nuevo");last.scrollIntoView({block:"nearest",behavior:"smooth"})}
  const nombre={h1:"Título",h2:"Subtítulo",p:nuevos.length>1?nuevos.length+" párrafos":"Párrafo",lista:"Lista",imagen:"Imagen"}[t];
  fdMsg(nombre+(nuevos.length>1?" agregados":t==="imagen"||t==="lista"?" agregada":" agregado")+" al final del informe.");
  $("fdTexto").value="";fdFile=null;$("fdImg").value="";$("fdImgName").textContent="PNG o JPG";
  // después de un título o subtítulo, lo habitual es escribir un párrafo
  if(t==="h1"||t==="h2"){document.querySelector('input[name="fdTipo"][value="p"]').checked=true;fdSet()}
  $("fdTexto").focus();
}
$("fdAdd").addEventListener("click",fdAdd);
$("fdTexto").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();fdAdd()}});
fdSet();

/* ---------- DESCARGAR ---------- */
const sinCod=()=>!!(meta.headerSimple&&meta.ocultarCodigo);
// campos de la ficha que quedan vacíos (las firmas solo cuentan si se incluyen)
const pend=()=>[meta.area,meta.proceso].concat(meta.headerSimple?[]:[meta.gen.nombre,meta.gen.cargo,meta.rev.nombre,meta.rev.cargo,meta.apr.nombre,meta.apr.cargo],
  meta.incFirmas!==false?meta.firmas.flatMap(f=>[f.nombre,f.cargo]):[]).filter(v=>!String(v||"").trim()).length;
function renderChecklist(){
  const items=[
    [panels.some(p=>p.img),panels.some(p=>p.img)?"Portada con imágenes nuevas":"Portada con las imágenes originales"],
    meta.soloTibox?[true,"Portada solo con TIBOX, centrado"]:[!!coverLogo,coverLogo?"Portada con logo de la empresa":"Portada sin logo de la empresa (opcional)"],
    [!!meta.titulo,meta.titulo?"Título: "+meta.titulo:"Falta el título"],
    [!!((sinCod()||meta.codigo)&&meta.version&&meta.fecha),`${sinCod()?"Sin código":"Código "+(meta.codigo||"—")} · versión ${meta.version||"—"} · ${meta.fecha||"sin fecha"}`],
    [!pend(),pend()?`Quedan ${pend()} ${pend()>1?"campos vacíos":"campo vacío"} en la ficha del documento`:"Ficha del documento completa"],
    [true,meta.headerSimple?("Encabezado con tabla simple"+(meta.ocultarCodigo?", sin código":"")):"Encabezado con tabla completa"],
    [true,[meta.incCambios!==false?"con control de cambios":"sin control de cambios",meta.incFirmas!==false?"con firmas":"sin firmas"].join(", ").replace(/^./,c=>c.toUpperCase())],
    [!isExample&&blocks.length>0,!isExample&&blocks.length?`Contenido: ${blocks.filter(b=>b.tipo==="h1").length} secciones, ${blocks.length} bloques, ${blocks.filter(b=>b.tipo==="imagen").length} imágenes`:"Aún muestra el contenido de ejemplo"],
    ...(blocks.some(b=>b.tipo==="imagen"&&!images[b.ref])?[[false,"Hay imágenes no disponibles: reemplázalas en el paso 3"]]:[]),
  ];
  $("checklist").innerHTML=items.map(([ok,t])=>`<li class="${ok?"ok":"no"}"><i>${ok?"✓":"–"}</i><span>${esc(t)}</span></li>`).join("");
  if(!$("fname").dataset.touched)$("fname").value=[sinCod()?"":meta.codigo,meta.titulo].filter(Boolean).join(" ").replace(/[\\/:*?"<>|]/g,"").slice(0,90)||"Documento TIBOX";
}
$("fname").addEventListener("input",()=>$("fname").dataset.touched="1");
function dataBytes(url){const b=atob(url.split(",")[1]);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
const jpegBytes=c=>new Promise(res=>c.toBlob(async b=>res(new Uint8Array(await b.arrayBuffer())),"image/jpeg",0.9));
async function saveFile(filename,blob){
  if(!(blob instanceof Blob))blob=new Blob([blob]);
  const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),4000);
}
function dlErr(e){return e&&e.code==="declined"?"Descarga cancelada.":e&&e.code==="rate_limited"?"Ya hay una descarga esperando confirmación.":"No se pudo descargar ("+((e&&(e.code||e.message))||"error")+")."}
$("dlDocx").addEventListener("click",async()=>{
  const st=$("dlStatus");st.classList.remove("err");
  if(!window.JSZip){st.textContent="No se pudo cargar el generador de Word. Recarga la página.";st.classList.add("err");return}
  $("dlDocx").disabled=true;st.textContent="Armando el Word…";
  try{
    const imgs={};blocks.filter(b=>b.tipo==="imagen"&&images[b.ref]).forEach(b=>{const im=images[b.ref];imgs[b.ref]={bytes:dataBytes(im.url),ext:im.ext,w:im.w,h:im.h}});
    // sin logo propio, la tabla documental lleva el de TIBOX
    const logo=clientLogo&&clientLogo.bytes?clientLogo:{bytes:await fetchBytes(ASSETS.logo),w:TIBOX_HDR.w,h:TIBOX_HDR.h};
    const zip=await buildFromTemplate(JSZip,await fetchBytes(ASSETS.tpl),PARTS,{meta,blocks,images:imgs,cover:await jpegBytes(bigCover(false)),logo});
    const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE"});
    await saveFile(($("fname").value.trim()||"Documento TIBOX")+".docx",blob);
    st.textContent="Word descargado.";
  }catch(e){st.textContent=dlErr(e);st.classList.add("err")}
  finally{$("dlDocx").disabled=false}
});
function pngName(){return ("Portada "+($("fname").value.trim()||"TIBOX")).replace(/[\\/:*?"<>|.]+/g," ").replace(/\s+/g," ").trim().slice(0,120)+".png"}
$("dlPng").addEventListener("click",async()=>{
  const st=$("dlStatus");st.classList.remove("err");$("pngBox").hidden=true;
  $("dlPng").disabled=true;st.textContent="Preparando la portada…";
  let blob=null;
  try{
    blob=await new Promise((res,rej)=>bigCover(true).toBlob(b=>b?res(b):rej(new Error("no se pudo generar la imagen")),"image/png"));
    const bytes=new Uint8Array(await blob.arrayBuffer());
    await saveFile(pngName(),bytes);
    st.textContent="Portada descargada.";
  }catch(e){
    if(e&&e.code==="declined"){st.textContent="Descarga cancelada."}
    else if(blob){showPng(blob);st.textContent="El guardado automático no respondió. Abajo tienes la portada: clic derecho sobre ella › «Guardar imagen como…», o «Copiar imagen».";}
    else{st.textContent=dlErr(e);st.classList.add("err")}
  }finally{$("dlPng").disabled=false}
});
function showPng(blob){
  const r=new FileReader();r.onload=()=>{$("pngImg").src=r.result;$("pngBox").hidden=false};r.readAsDataURL(blob);
  $("pngCopy").onclick=async()=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);$("pngCopy").textContent="Copiada ✓"}catch(e){$("pngCopy").textContent="No se pudo copiar"}};
}

renderCambios();renderFicha();renderPaper();drawCover();
