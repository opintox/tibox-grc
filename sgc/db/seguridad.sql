-- Seguridad del SGC: acceso solo con el login de TIBOX (Firebase Auth con TOTP), roles,
-- auditoría de cambios y validaciones. Ejecutar completo en Supabase → SQL Editor, DESPUÉS de
-- schema.sql. Se puede volver a correr sin romper nada (todo es "if not exists"/"or replace").
--
-- Requisitos previos:
--   * Supabase → Authentication → Third-party Auth → Firebase, project ID cosmic-roaming-walrus.
--   * Cada usuario de Firebase con el custom claim {"role":"authenticated"} (lo exige Supabase
--     para aceptar tokens de Firebase).
--   * Su correo agregado en usuarios_sgc (al final de este archivo).

-- ============ 1. Usuarios autorizados y su rol ============
-- Solo se administra desde el panel de Supabase (sin políticas: la app no puede leerla ni
-- escribirla). Solo correos @tibox.cl.
create table if not exists public.usuarios_sgc (
  email text primary key check (email = lower(email) and email like '%@tibox.cl'),
  rol text not null check (rol in ('lector','editor','admin')),
  creado timestamptz not null default now()
);
alter table public.usuarios_sgc enable row level security;
revoke all on public.usuarios_sgc from anon, authenticated;

-- Rol de la sesión actual, o null si no corresponde. Exige un token emitido por NUESTRO
-- proyecto de Firebase, con correo verificado, contraseña Y segundo factor TOTP — el mismo
-- criterio que el login del sitio y firestore.rules. security definer: puede leer
-- usuarios_sgc aunque la sesión no tenga permisos sobre esa tabla.
create or replace function public.sgc_rol() returns text
language sql stable security definer set search_path = public as $$
  select u.rol from public.usuarios_sgc u
  where (auth.jwt()->>'iss') = 'https://securetoken.google.com/cosmic-roaming-walrus'
    and (auth.jwt()->>'aud') = 'cosmic-roaming-walrus'
    and (auth.jwt()->>'email_verified') = 'true'
    and (auth.jwt()->'firebase'->>'sign_in_provider') = 'password'
    and (auth.jwt()->'firebase'->>'sign_in_second_factor') = 'totp'
    and u.email = lower(auth.jwt()->>'email')
$$;
revoke all on function public.sgc_rol() from public, anon;
grant execute on function public.sgc_rol() to authenticated;

-- ============ 2. Privilegios mínimos por tabla y columna ============
-- anon (la clave pública) no toca nada. authenticated solo lo que la app realmente usa: los
-- catálogos (dominios, requerimientos) son de solo lectura, y de entregables solo se pueden
-- editar los campos que edita la app (nunca aspecto, requerimiento ni orden).
revoke all on public.dominios, public.requerimientos, public.entregables, public.personas, public.snapshots from anon;
revoke all on public.dominios, public.requerimientos, public.entregables, public.personas, public.snapshots from authenticated;

grant select on public.dominios, public.requerimientos, public.entregables, public.personas, public.snapshots to authenticated;
grant update (evidencia, responsable, estado, org, org_manual, updated_at) on public.entregables to authenticated;
grant insert (nombre, org), update (nombre, org), delete on public.personas to authenticated;
grant insert (fecha, etiqueta, data), update (fecha, etiqueta, data) on public.snapshots to authenticated;

-- ============ 3. Políticas RLS ============
drop policy if exists sgc_leer on public.dominios;
drop policy if exists sgc_leer on public.requerimientos;
drop policy if exists sgc_leer on public.entregables;
drop policy if exists sgc_editar on public.entregables;
drop policy if exists sgc_leer on public.personas;
drop policy if exists sgc_crear on public.personas;
drop policy if exists sgc_editar on public.personas;
drop policy if exists sgc_borrar on public.personas;
drop policy if exists sgc_leer on public.snapshots;
drop policy if exists sgc_crear_hoy on public.snapshots;
drop policy if exists sgc_editar_hoy on public.snapshots;

create policy sgc_leer on public.dominios       for select to authenticated using (public.sgc_rol() is not null);
create policy sgc_leer on public.requerimientos for select to authenticated using (public.sgc_rol() is not null);

create policy sgc_leer   on public.entregables for select to authenticated using (public.sgc_rol() is not null);
create policy sgc_editar on public.entregables for update to authenticated
  using (public.sgc_rol() in ('editor','admin')) with check (public.sgc_rol() in ('editor','admin'));

create policy sgc_leer   on public.personas for select to authenticated using (public.sgc_rol() is not null);
create policy sgc_crear  on public.personas for insert to authenticated with check (public.sgc_rol() in ('editor','admin'));
create policy sgc_editar on public.personas for update to authenticated
  using (public.sgc_rol() in ('editor','admin')) with check (public.sgc_rol() in ('editor','admin'));
create policy sgc_borrar on public.personas for delete to authenticated using (public.sgc_rol() = 'admin');

-- Snapshots: la de hoy (fecha UTC, igual que la app) se puede crear o reemplazar; las de días
-- anteriores quedan congeladas — son la evidencia de avance y nadie las puede reescribir ni
-- borrar desde la app.
create policy sgc_leer on public.snapshots for select to authenticated using (public.sgc_rol() is not null);
create policy sgc_crear_hoy on public.snapshots for insert to authenticated
  with check (public.sgc_rol() in ('editor','admin') and fecha = current_date);
create policy sgc_editar_hoy on public.snapshots for update to authenticated
  using (public.sgc_rol() in ('editor','admin') and fecha = current_date)
  with check (public.sgc_rol() in ('editor','admin') and fecha = current_date);

-- ============ 4. Validaciones ============
-- "not valid": se exigen en cada escritura nueva sin revisar (ni bloquear) los datos que ya
-- existen. dominios.color se inserta en un atributo style= de la página.
alter table public.dominios drop constraint if exists dominios_color_hex;
alter table public.dominios add constraint dominios_color_hex
  check (color is null or color ~ '^#[0-9A-Fa-f]{6}$') not valid;
alter table public.entregables drop constraint if exists entregables_largos;
alter table public.entregables add constraint entregables_largos
  check (length(evidencia) <= 4000 and length(responsable) <= 150) not valid;
alter table public.personas drop constraint if exists personas_nombre_largo;
alter table public.personas add constraint personas_nombre_largo
  check (length(nombre) between 1 and 150) not valid;
alter table public.snapshots drop constraint if exists snapshots_tamano;
alter table public.snapshots add constraint snapshots_tamano
  check (coalesce(length(etiqueta), 0) <= 200 and pg_column_size(data) <= 5000000) not valid;

-- ============ 5. Trazabilidad ============
-- Quién y cuándo editó cada entregable (lo pone la base, no el navegador), y un registro de
-- cada cambio con el valor anterior y el nuevo. Solo admin puede leer el registro.
alter table public.entregables add column if not exists updated_by text;

create or replace function public.sgc_marcar_edicion() returns trigger
language plpgsql set search_path = public as $$
begin
  if (new.evidencia, new.responsable, new.estado, new.org, new.org_manual)
     is distinct from (old.evidencia, old.responsable, old.estado, old.org, old.org_manual) then
    new.updated_at := now();
    new.updated_by := auth.jwt()->>'email';
  else
    -- sin cambios reales (ej. la resincronización de organizaciones): no se toca la marca
    new.updated_at := old.updated_at;
    new.updated_by := old.updated_by;
  end if;
  return new;
end $$;

drop trigger if exists sgc_marcar_edicion on public.entregables;
create trigger sgc_marcar_edicion before update on public.entregables
  for each row execute function public.sgc_marcar_edicion();

create table if not exists public.sgc_auditoria (
  id bigint generated always as identity primary key,
  tabla text not null,
  fila text,
  accion text not null,
  usuario text,
  en timestamptz not null default now(),
  antes jsonb,
  despues jsonb
);
alter table public.sgc_auditoria enable row level security;
revoke all on public.sgc_auditoria from anon, authenticated;
grant select on public.sgc_auditoria to authenticated;
drop policy if exists sgc_auditoria_admin on public.sgc_auditoria;
create policy sgc_auditoria_admin on public.sgc_auditoria for select to authenticated
  using (public.sgc_rol() = 'admin');

-- security definer: escribe en sgc_auditoria aunque la sesión no tenga permiso sobre ella.
-- De los snapshots no se copia el jsonb completo (ya queda en la tabla y es grande).
create or replace function public.sgc_auditar() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  a jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) - 'data' end;
  d jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) - 'data' end;
begin
  insert into public.sgc_auditoria(tabla, fila, accion, usuario, antes, despues)
  values (tg_table_name,
          coalesce(d->>'id', d->>'nombre', d->>'fecha', a->>'id', a->>'nombre', a->>'fecha'),
          tg_op, auth.jwt()->>'email', a, d);
  return null;
end $$;

drop trigger if exists sgc_auditar_ins_del on public.entregables;
drop trigger if exists sgc_auditar_upd on public.entregables;
create trigger sgc_auditar_ins_del after insert or delete on public.entregables
  for each row execute function public.sgc_auditar();
create trigger sgc_auditar_upd after update on public.entregables
  for each row when (old.* is distinct from new.*) execute function public.sgc_auditar();

drop trigger if exists sgc_auditar_ins_del on public.personas;
drop trigger if exists sgc_auditar_upd on public.personas;
create trigger sgc_auditar_ins_del after insert or delete on public.personas
  for each row execute function public.sgc_auditar();
create trigger sgc_auditar_upd after update on public.personas
  for each row when (old.* is distinct from new.*) execute function public.sgc_auditar();

drop trigger if exists sgc_auditar_ins_del on public.snapshots;
drop trigger if exists sgc_auditar_upd on public.snapshots;
create trigger sgc_auditar_ins_del after insert or delete on public.snapshots
  for each row execute function public.sgc_auditar();
create trigger sgc_auditar_upd after update on public.snapshots
  for each row when (old.* is distinct from new.*) execute function public.sgc_auditar();

-- ============ 6. Usuarios ============
-- Agregar una línea por persona. Roles: 'lector' (solo ver), 'editor' (editar entregables y
-- personas, guardar snapshots), 'admin' (además borrar personas y ver la auditoría).
insert into public.usuarios_sgc (email, rol) values
  ('opinto@tibox.cl', 'admin')
on conflict (email) do update set rol = excluded.rol;
