-- Schema iniziale per l'app "Cosa mangio oggi?" (fortune-recipe)
-- Esegui questo script nell'SQL editor del progetto Supabase "fortunerecipe"
-- (jceaixxavftisrjbzyqk). E' scritto per essere idempotente: puoi
-- rilanciarlo senza effetti collaterali se qualche pezzo e' gia' presente.

create extension if not exists pgcrypto;

-- 1) Ricette standard (condivise, sola lettura pubblica lato client)
create table if not exists public.ricette_standard (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ingredienti text,
  procedimento text,
  pasto text[] not null default '{}',
  tag text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 2) Ricette personali per dispositivo (nessun login: isolamento solo
--    convenzionale lato applicazione tramite device_id)
create table if not exists public.ricette_utente (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  nome text not null,
  ingredienti text,
  procedimento text,
  pasto text[] not null default '{}',
  tag text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists ricette_utente_device_id_idx
  on public.ricette_utente (device_id);

-- 3) Impostazioni per dispositivo (es. "usa anche le ricette standard")
create table if not exists public.impostazioni_dispositivo (
  device_id text primary key,
  usa_ricette_standard boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 4) Se le tabelle esistevano gia' con "pasto" come testo singolo, le
--    converte in array (idempotente: non fa nulla se e' gia' un array).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ricette_standard'
      and column_name = 'pasto' and data_type <> 'ARRAY'
  ) then
    alter table public.ricette_standard
      alter column pasto type text[]
      using case when pasto is null then '{}'::text[] else array[pasto] end;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ricette_utente'
      and column_name = 'pasto' and data_type <> 'ARRAY'
  ) then
    alter table public.ricette_utente
      alter column pasto type text[]
      using case when pasto is null then '{}'::text[] else array[pasto] end;
  end if;
end $$;

alter table public.ricette_standard alter column pasto set default '{}';
alter table public.ricette_utente alter column pasto set default '{}';

-- 5) Row Level Security: policy aperte, filtrate per device_id solo lato
--    applicazione. Nota sulla sicurezza: chiunque conosca la chiave
--    pubblica puo' leggere/scrivere righe di qualunque device_id, non
--    solo il proprio. Per un'app di ricette personali senza login e' un
--    compromesso accettabile, ma non e' "privacy vera".
alter table public.ricette_standard enable row level security;
alter table public.ricette_utente enable row level security;
alter table public.impostazioni_dispositivo enable row level security;

drop policy if exists "ricette_standard_select" on public.ricette_standard;
create policy "ricette_standard_select" on public.ricette_standard
  for select using (true);

drop policy if exists "ricette_utente_all" on public.ricette_utente;
create policy "ricette_utente_all" on public.ricette_utente
  for all using (true) with check (true);

drop policy if exists "impostazioni_dispositivo_all" on public.impostazioni_dispositivo;
create policy "impostazioni_dispositivo_all" on public.impostazioni_dispositivo
  for all using (true) with check (true);

grant select, insert, update, delete on public.ricette_standard to anon, authenticated;
grant select, insert, update, delete on public.ricette_utente to anon, authenticated;
grant select, insert, update, delete on public.impostazioni_dispositivo to anon, authenticated;
