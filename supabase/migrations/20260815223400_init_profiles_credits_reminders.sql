-- Shubh schema. SQL in repo only — do not apply to a live project from this branch.
-- No janam columns: never store naam, janam tithi, samay, or birth shehar.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  city text,
  language text,
  revenuecat_app_user_id text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Signed-in profile. city is current city, not birth place. No janam fields.';

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null
    check (kind in ('ask_consume', 'pack_grant', 'monthly_grant', 'monthly_reset')),
  amount integer not null,
  period_id text,
  store_txn_id text,
  created_at timestamptz not null default now()
);

comment on table public.credit_ledger is
  'Append-only Ask credit events. Remaining is derived. No remaining-count column.';

create index credit_ledger_user_created_idx
  on public.credit_ledger (user_id, created_at);

create unique index credit_ledger_pack_txn_idx
  on public.credit_ledger (user_id, store_txn_id)
  where kind = 'pack_grant' and store_txn_id is not null;

create table public.reminder_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  festival_push boolean not null default false,
  city text
);

comment on table public.reminder_prefs is
  'Festival push prefs. city is current city, not birth place.';

-- ---------------------------------------------------------------------------
-- RLS: own rows only
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.reminder_prefs enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy reminder_prefs_select_own
  on public.reminder_prefs
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy reminder_prefs_insert_own
  on public.reminder_prefs
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy reminder_prefs_update_own
  on public.reminder_prefs
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Ledger is readable; writes only via private server functions.
create policy credit_ledger_select_own
  on public.credit_ledger
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Server functions (private / security definer). Client never updates remaining.
-- ---------------------------------------------------------------------------

create or replace function private.consume_ask_credit(p_period_id text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  insert into public.credit_ledger (user_id, kind, amount, period_id)
  values (uid, 'ask_consume', -1, p_period_id);
end;
$$;

create or replace function private.grant_pack_credits(
  p_store_txn_id text,
  p_amount integer default 100
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_store_txn_id is null or length(trim(p_store_txn_id)) = 0 then
    raise exception 'store_txn_required';
  end if;
  if exists (
    select 1
    from public.credit_ledger
    where user_id = uid
      and kind = 'pack_grant'
      and store_txn_id = p_store_txn_id
  ) then
    return;
  end if;
  insert into public.credit_ledger (user_id, kind, amount, store_txn_id)
  values (uid, 'pack_grant', p_amount, p_store_txn_id);
end;
$$;

create or replace function private.grant_monthly_credits(p_period_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  insert into public.credit_ledger (user_id, kind, amount, period_id)
  values (uid, 'monthly_grant', 100, p_period_id);
end;
$$;

create or replace function private.reset_monthly_credits(p_period_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  insert into public.credit_ledger (user_id, kind, amount, period_id)
  values (uid, 'monthly_reset', 0, p_period_id);
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  insert into public.reminder_prefs (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Public wrappers (invoker) so PostgREST can call them. Logic stays private.
create or replace function public.consume_ask_credit(p_period_id text default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform private.consume_ask_credit(p_period_id);
end;
$$;

create or replace function public.grant_pack_credits(
  p_store_txn_id text,
  p_amount integer default 100
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform private.grant_pack_credits(p_store_txn_id, p_amount);
end;
$$;

create or replace function public.grant_monthly_credits(p_period_id text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform private.grant_monthly_credits(p_period_id);
end;
$$;

create or replace function public.reset_monthly_credits(p_period_id text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform private.reset_monthly_credits(p_period_id);
end;
$$;

revoke all on function public.consume_ask_credit(text) from public, anon;
revoke all on function public.grant_pack_credits(text, integer) from public, anon;
revoke all on function public.grant_monthly_credits(text) from public, anon;
revoke all on function public.reset_monthly_credits(text) from public, anon;

grant execute on function public.consume_ask_credit(text) to authenticated;
grant execute on function public.grant_pack_credits(text, integer) to authenticated;
grant execute on function public.grant_monthly_credits(text) to authenticated;
grant execute on function public.reset_monthly_credits(text) to authenticated;
