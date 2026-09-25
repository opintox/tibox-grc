-- Esquema de base de datos para "Cumplimiento CIP" (sgc).
-- Ejecutar completo en Supabase: Project → SQL Editor → New query → pegar y correr.
--
-- Reemplaza la carpeta de JSON por 4 tablas que reflejan la misma estructura
-- que ya usaba el JSON exportado (dominios > requerimientos > entregables,
-- más la lista de personas). No cambia el modelo de datos, solo dónde vive.

create table if not exists dominios (
  id text primary key,
  code text not null,
  name text not null,
  emoji text,
  color text,
  orden integer not null default 0
);

create table if not exists requerimientos (
  id text primary key,
  dominio_id text not null references dominios(id) on delete cascade,
  codigo text not null,
  descripcion text default '',
  orden integer not null default 0
);

-- La unidad editable de la app: cada fila de la tabla de "Requerimientos".
create table if not exists entregables (
  id text primary key,
  requerimiento_id text not null references requerimientos(id) on delete cascade,
  aspecto text default '',
  evidencia text not null default '',
  responsable text not null default '',
  estado text not null default 'Pendiente' check (estado in ('Pendiente','En proceso','Listo')),
  periodicidad text default '',
  org text not null default 'sin-asignar' check (org in ('tibox','quintero','sin-asignar')),
  org_manual boolean not null default false,
  orden integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists personas (
  nombre text primary key,
  org text not null check (org in ('tibox','quintero','sin-asignar'))
);

-- "Fotos" del estado completo en una fecha, para "Comparar avances". Se crean
-- con el botón "📸 Guardar snapshot" (una por día: si ya existe una para hoy,
-- se sobrescribe). Guarda el mismo shape {dominios, requerimientos, personas}
-- que ya usa el resto de la app, así que compararlas no requiere lógica nueva.
create table if not exists snapshots (
  fecha date primary key,
  etiqueta text,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_requerimientos_dominio on requerimientos(dominio_id);
create index if not exists idx_entregables_requerimiento on entregables(requerimiento_id);

-- Deja las tablas listas para sincronización en vivo entre usuarios (Realtime).
-- La app todavía no se suscribe a estos cambios (guarda al editar, pero otro
-- usuario recién ve el cambio al recargar) — esto lo deja preparado para
-- cuando se agregue esa mejora, sin otra migración de esquema.
alter publication supabase_realtime add table dominios, requerimientos, entregables, personas, snapshots;

-- RLS: la seguridad real la dan estas políticas, no el hecho de que la anon
-- key esté oculta (es pública por diseño en Supabase).
alter table dominios enable row level security;
alter table requerimientos enable row level security;
alter table entregables enable row level security;
alter table personas enable row level security;
alter table snapshots enable row level security;

-- Las antiguas políticas "acceso publico" (using (true) para la clave anon) dejaban leer,
-- modificar y borrar todo a cualquiera, porque la anon key está en sgc/js/db.js dentro de un
-- repo público. Con RLS habilitado y sin políticas, la clave anon no ve ni escribe nada. Si se
-- reactiva el SGC, primero hay que agregar login y crear políticas "to authenticated" que
-- limiten por auth.uid() / auth.jwt() ->> 'email'.
drop policy if exists "dominios acceso publico" on dominios;
drop policy if exists "requerimientos acceso publico" on requerimientos;
drop policy if exists "entregables acceso publico" on entregables;
drop policy if exists "personas acceso publico" on personas;
drop policy if exists "snapshots acceso publico" on snapshots;
