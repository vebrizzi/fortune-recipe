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

-- 6) "Libro di ricette": un codice che raggruppa le ricette utente e puo'
--    essere seguito da piu' dispositivi (per sincronizzare le ricette tra
--    dispositivi diversi senza login). Il device_id resta e continua a
--    registrare quale dispositivo ha creato la riga; il libro determina
--    chi la vede. Per le righe gia' esistenti il libro di default e' il
--    device_id stesso, cosi' non sparisce nulla dopo la migrazione.
alter table public.ricette_utente add column if not exists libro text;
update public.ricette_utente set libro = device_id where libro is null;
alter table public.ricette_utente alter column libro set not null;

create index if not exists ricette_utente_libro_idx
  on public.ricette_utente (libro);

-- 7) Nome e password (opzionale) per ogni libro. La password serve solo a
--    distinguere chi puo' scrivere ("collaborazione") da chi segue in
--    sola lettura: e' un cancelletto lato applicazione, non una vera
--    barriera crittografica lato database (le righe di ricette_utente
--    restano leggibili/scrivibili da chiunque conosca il codice, come
--    documentato sopra). La password non transita mai in chiaro verso il
--    client: viene hashata con pgcrypto dentro le funzioni sotto.
create table if not exists public.libri (
  codice text primary key,
  nome text not null default 'Il mio libro',
  password_hash text,
  created_at timestamptz not null default now()
);

alter table public.libri enable row level security;

-- Backfill: crea una riga "libri" per ogni codice gia' in uso da versioni
-- precedenti, cosi' chi aggiorna non perde l'elenco dei propri libri.
insert into public.libri (codice, nome)
select distinct libro, 'Il mio libro' from public.ricette_utente
where libro is not null
on conflict (codice) do nothing;

-- Nessun accesso diretto alla tabella dal client: si passa sempre dalle
-- funzioni sotto, cosi' l'hash della password non viene mai esposto.
revoke all on public.libri from anon, authenticated;

create or replace function public.crea_libro(p_codice text, p_nome text, p_password text default null)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.libri (codice, nome, password_hash)
  values (
    p_codice,
    coalesce(nullif(trim(p_nome), ''), 'Il mio libro'),
    case when p_password is null or trim(p_password) = '' then null
         else crypt(p_password, gen_salt('bf')) end
  )
  on conflict (codice) do nothing;
end;
$$;

create or replace function public.rinomina_libro(p_codice text, p_nome text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.libri set nome = coalesce(nullif(trim(p_nome), ''), nome)
  where codice = p_codice;
$$;

create or replace function public.verifica_password_libro(p_codice text, p_password text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select coalesce(
    (select password_hash is null or password_hash = crypt(p_password, password_hash)
     from public.libri where lower(codice) = lower(p_codice)),
    false
  );
$$;

-- Ricerca case-insensitive: i codici generati da questa versione sono
-- sempre maiuscoli, ma i libri "ereditati" da versioni precedenti hanno
-- codici minuscoli (erano UUID di dispositivo). Restituisce il codice
-- cosi' come e' salvato (non quello digitato), da riusare per le
-- query successive su ricette_utente.libro, che e' case-sensitive.
create or replace function public.libri_info(p_codici text[])
returns table(codice text, nome text, protetto boolean)
language sql
security definer
set search_path = public
as $$
  select codice, nome, (password_hash is not null) as protetto
  from public.libri
  where lower(codice) = any(select lower(c) from unnest(p_codici) as c);
$$;

grant execute on function public.crea_libro(text, text, text) to anon, authenticated;
grant execute on function public.rinomina_libro(text, text) to anon, authenticated;
grant execute on function public.verifica_password_libro(text, text) to anon, authenticated;
grant execute on function public.libri_info(text[]) to anon, authenticated;
