// ============ CONEXIÓN A SUPABASE ============
// 1. Crea un proyecto gratis en https://supabase.com
// 2. Corre sgc/db/schema.sql en Project → SQL Editor
// 3. Reemplaza estos dos valores por los de Project Settings → API
//    (Project URL y "anon public" key).
const SUPABASE_URL = 'https://tufpwziickeigrbfeqvh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dq539tPOsWsn3fqT_l47Rg_oaByj9W6';

// La anon key es pública por diseño (viaja en el navegador de cualquiera que
// abra la página): la seguridad la dan las políticas RLS de schema.sql, no
// el hecho de que esta clave esté "escondida" en el código.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function dbOk(r){ if(r.error) throw r.error; return r; }

// ---- Lectura: arma el mismo shape {dominios, requerimientos, personas} que
// antes venía del JSON, para no tener que tocar el resto de app.js ----
async function dbCargarTodo(){
  const [dominiosRes, reqRes, entRes, persRes] = await Promise.all([
    sb.from('dominios').select('*').order('orden'),
    sb.from('requerimientos').select('*').order('orden'),
    sb.from('entregables').select('*').order('orden'),
    sb.from('personas').select('*')
  ]);
  [dominiosRes, reqRes, entRes, persRes].forEach(dbOk);

  const dominios={};
  dominiosRes.data.forEach(d=>{
    dominios[d.id]={id:d.id, code:d.code, name:d.name, emoji:d.emoji, color:d.color};
  });

  const entPorReq={};
  entRes.data.forEach(e=>{
    (entPorReq[e.requerimiento_id]=entPorReq[e.requerimiento_id]||[]).push({
      id:e.id, aspecto:e.aspecto||'', evidencia:e.evidencia||'', responsable:e.responsable||'',
      estado:e.estado||'Pendiente', periodicidad:e.periodicidad||'',
      org:e.org||'sin-asignar', orgManual:!!e.org_manual
    });
  });

  const requerimientos=reqRes.data.map(r=>({
    id:r.id, dominioId:r.dominio_id, codigo:r.codigo, descripcion:r.descripcion||'',
    entregables: entPorReq[r.id]||[]
  }));

  const personas=persRes.data.map(p=>({nombre:p.nombre, org:p.org}));

  return {dominios, requerimientos, personas};
}

// ---- Escritura: cada mutación se guarda de inmediato (no hay botón "Guardar
// todo"). Usan UPDATE, no UPSERT: las filas siempre existen ya porque vienen
// de dbCargarTodo(), y así no hace falta reenviar columnas NOT NULL como
// requerimiento_id que un UPSERT sí exigiría si tuviera que insertar. ----
function dbGuardarEntregable(e){
  return sb.from('entregables').update({
    evidencia:e.evidencia||'', responsable:e.responsable||'', estado:e.estado||'Pendiente',
    org:e.org||'sin-asignar', org_manual:!!e.orgManual, updated_at:new Date().toISOString()
  }).eq('id', e.id).then(dbOk);
}

// Tras agregar/editar/borrar una persona, enrichOrg() recalcula en memoria el
// org de todos los entregables sin orgManual. Esto persiste esos cambios.
function dbSincronizarOrgs(){
  const cambios=[];
  DATA.requerimientos.forEach(req=>req.entregables.forEach(e=>{
    if(e.orgManual) return;
    cambios.push({id:e.id, org:e.org});
  }));
  if(!cambios.length) return Promise.resolve();
  return Promise.all(cambios.map(c=>sb.from('entregables').update({org:c.org}).eq('id', c.id)))
    .then(rs=>rs.forEach(dbOk));
}

function dbGuardarPersona(p){
  return sb.from('personas').upsert({nombre:p.nombre, org:p.org}).then(dbOk);
}

function dbEliminarPersona(nombre){
  return sb.from('personas').delete().eq('nombre', nombre).then(dbOk);
}

// ---- Snapshots: "fotos" del estado completo para "Comparar avances" ----
// Se guarda el mismo shape {dominios, requerimientos, personas} que usa
// loadData(), armado a partir del DATA que ya está en memoria (no hace falta
// leer nada de nuevo de la base).
function dbGuardarSnapshot(etiqueta){
  const dominios={};
  Object.values(DATA.dominios).forEach(d=>{ dominios[d.id]=d; });
  const data={dominios, requerimientos:DATA.requerimientos, personas:DATA.personas};
  const fecha=new Date().toISOString().slice(0,10);
  return sb.from('snapshots').upsert({fecha, etiqueta:etiqueta||null, data}, {onConflict:'fecha'}).then(dbOk);
}

// Lista de fechas disponibles para elegir en "Comparar avances" (sin traer el
// jsonb completo de cada una, para que el combo cargue rápido).
async function dbListarSnapshots(){
  const r=await sb.from('snapshots').select('fecha, etiqueta').order('fecha', {ascending:false});
  dbOk(r);
  return r.data;
}

async function dbObtenerSnapshot(fecha){
  const r=await sb.from('snapshots').select('data').eq('fecha', fecha).single();
  dbOk(r);
  return r.data.data;
}
