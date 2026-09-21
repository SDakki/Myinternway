-- Ejecuta este script completo en Supabase > SQL Editor (una sola vez).
-- Crea la tabla de perfiles, la sincroniza con auth.users y protege el acceso con RLS.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  pais_origen text,
  cv_url text,
  foto_url text,
  estado_solicitud text not null default 'pendiente'
    check (estado_solicitud in ('pendiente', 'en_revision', 'aceptado', 'rechazado')),
  confirmado boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada persona solo puede ver y editar su propio perfil.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Crea automáticamente la fila de perfil apenas alguien se registra
-- (toma nombre y país de los metadatos que manda registro.js).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, pais_origen, confirmado)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    new.raw_user_meta_data->>'pais_origen',
    new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Marca el perfil como confirmado en cuanto el usuario confirma su correo.
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles set confirmado = true where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update on auth.users
  for each row execute function public.handle_user_confirmed();

-- Vista para ti: en Supabase Studio ejecuta
--   select * from public.profiles where confirmado = true;
-- para ver solo a las personas ya confirmadas y elegirlas para pasantías.
