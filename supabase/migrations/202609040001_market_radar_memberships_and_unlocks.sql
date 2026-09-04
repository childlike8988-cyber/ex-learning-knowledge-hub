-- Phase 2F-1C: authoritative Market Radar memberships and report-level unlocks.
-- This migration is intentionally independent from payment and protected file delivery.

create or replace function public.market_radar_quarter_key(p_date date)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select extract(year from p_date)::integer::text
    || '-Q'
    || ((extract(month from p_date)::integer - 1) / 3 + 1)::integer::text;
$$;

create table if not exists public.memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'inactive', 'expired')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memberships_valid_period check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.report_catalog (
  report_id text primary key,
  report_date date not null,
  quarter_key text generated always as (public.market_radar_quarter_key(report_date)) stored,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint report_catalog_report_quarter_unique unique (report_id, quarter_key),
  constraint report_catalog_canonical_id check (
    report_id = 'market-radar-kaohsiung-' || report_date::text
  )
);

create table if not exists public.report_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id text not null,
  quarter_key text not null check (quarter_key ~ '^[0-9]{4}-Q[1-4]$'),
  unlock_type text not null check (unlock_type = 'free_quarterly'),
  created_at timestamptz not null default now(),
  constraint report_unlocks_user_report_unique unique (user_id, report_id),
  constraint report_unlocks_catalog_period_fk
    foreign key (report_id, quarter_key)
    references public.report_catalog(report_id, quarter_key)
    on delete restrict
);

create unique index if not exists report_unlocks_free_user_quarter_unique
  on public.report_unlocks (user_id, quarter_key)
  where unlock_type = 'free_quarterly';

alter table public.memberships enable row level security;
alter table public.report_catalog enable row level security;
alter table public.report_unlocks enable row level security;

drop policy if exists memberships_select_own on public.memberships;
create policy memberships_select_own
  on public.memberships for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists report_catalog_select_active on public.report_catalog;
create policy report_catalog_select_active
  on public.report_catalog for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists report_unlocks_select_own on public.report_unlocks;
create policy report_unlocks_select_own
  on public.report_unlocks for select
  to authenticated
  using (user_id = auth.uid());

revoke insert, update, delete on public.memberships from anon, authenticated;
revoke insert, update, delete on public.report_catalog from anon, authenticated;
revoke insert, update, delete on public.report_unlocks from anon, authenticated;
grant select on public.memberships to authenticated;
grant select on public.report_catalog to anon, authenticated;
grant select on public.report_unlocks to authenticated;

create or replace function public.handle_new_user_market_radar_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.memberships (user_id, plan, status, starts_at)
  values (new.id, 'free', 'active', now())
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_market_radar_membership on auth.users;
create trigger on_auth_user_created_market_radar_membership
  after insert on auth.users
  for each row execute function public.handle_new_user_market_radar_membership();

-- Generic and idempotent backfill: existing authoritative rows, including Pro, are untouched.
insert into public.memberships (user_id, plan, status, starts_at)
select users.id, 'free', 'active', now()
from auth.users as users
left join public.memberships as membership on membership.user_id = users.id
where membership.user_id is null
on conflict (user_id) do nothing;

create or replace function public.ensure_market_radar_membership()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_membership public.memberships%rowtype;
  v_effective_plan text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  insert into public.memberships (user_id, plan, status, starts_at)
  values (v_user_id, 'free', 'active', now())
  on conflict (user_id) do nothing;

  select * into strict v_membership
  from public.memberships
  where user_id = v_user_id;

  if v_membership.status = 'active'
    and v_membership.starts_at <= now()
    and (v_membership.ends_at is null or v_membership.ends_at > now()) then
    v_effective_plan := v_membership.plan;
  end if;

  return jsonb_build_object(
    'effective_plan', v_effective_plan,
    'membership_status', v_membership.status,
    'starts_at', v_membership.starts_at,
    'ends_at', v_membership.ends_at
  );
end;
$$;

create or replace function public.get_market_radar_entitlement(p_report_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_membership public.memberships%rowtype;
  v_report public.report_catalog%rowtype;
  v_unlock public.report_unlocks%rowtype;
  v_effective_plan text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  insert into public.memberships (user_id, plan, status, starts_at)
  values (v_user_id, 'free', 'active', now())
  on conflict (user_id) do nothing;

  select * into v_membership from public.memberships where user_id = v_user_id;
  select * into v_report from public.report_catalog where report_id = p_report_id and is_active = true;

  if v_report.report_id is null then
    return jsonb_build_object('status', 'download_unavailable', 'report_id', p_report_id);
  end if;

  if v_membership.status = 'active'
    and v_membership.starts_at <= now()
    and (v_membership.ends_at is null or v_membership.ends_at > now()) then
    v_effective_plan := v_membership.plan;
  end if;

  if v_effective_plan is null then
    return jsonb_build_object('status', 'download_unavailable', 'report_id', p_report_id);
  end if;

  select * into v_unlock
  from public.report_unlocks
  where user_id = v_user_id
    and quarter_key = v_report.quarter_key
    and unlock_type = 'free_quarterly'
  limit 1;

  return jsonb_build_object(
    'status', case
      when v_effective_plan = 'pro' then 'pro_ready'
      when v_unlock.report_id = v_report.report_id then 'free_report_unlocked'
      when v_unlock.report_id is not null then 'free_credit_exhausted'
      else 'free_credit_available'
    end,
    'report_id', v_report.report_id,
    'quarter_key', v_report.quarter_key,
    'effective_plan', v_effective_plan,
    'membership_status', v_membership.status,
    'starts_at', v_membership.starts_at,
    'ends_at', v_membership.ends_at,
    'total_credits', 1,
    'used_credits', case when v_unlock.report_id is null then 0 else 1 end,
    'remaining_credits', case when v_unlock.report_id is null then 1 else 0 end,
    'unlocked_report_id', v_unlock.report_id,
    'unlocked_at', v_unlock.created_at
  );
end;
$$;

create or replace function public.unlock_market_radar_report(p_report_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_membership public.memberships%rowtype;
  v_report public.report_catalog%rowtype;
  v_unlock public.report_unlocks%rowtype;
  v_effective_plan text;
  v_inserted boolean;
begin
  if v_user_id is null then
    return jsonb_build_object(
      'status', 'unauthenticated', 'report_id', p_report_id,
      'remaining_credit', null, 'unlimited', false
    );
  end if;

  insert into public.memberships (user_id, plan, status, starts_at)
  values (v_user_id, 'free', 'active', now())
  on conflict (user_id) do nothing;

  select * into v_membership from public.memberships where user_id = v_user_id;
  select * into v_report from public.report_catalog where report_id = p_report_id and is_active = true;

  if v_report.report_id is null then
    return jsonb_build_object(
      'status', 'invalid_report', 'report_id', p_report_id,
      'remaining_credit', null, 'unlimited', false
    );
  end if;

  if v_membership.status = 'active'
    and v_membership.starts_at <= now()
    and (v_membership.ends_at is null or v_membership.ends_at > now()) then
    v_effective_plan := v_membership.plan;
  end if;

  if v_effective_plan is null then
    return jsonb_build_object(
      'status', 'membership_unavailable', 'report_id', v_report.report_id,
      'quarter_key', v_report.quarter_key,
      'remaining_credit', null, 'unlimited', false
    );
  end if;

  if v_effective_plan = 'pro' then
    return jsonb_build_object(
      'status', 'pro_ready', 'report_id', v_report.report_id,
      'quarter_key', v_report.quarter_key,
      'remaining_credit', null, 'unlimited', true
    );
  end if;

  select * into v_unlock
  from public.report_unlocks
  where user_id = v_user_id and report_id = v_report.report_id;

  if v_unlock.report_id is not null then
    return jsonb_build_object(
      'status', 'already_unlocked', 'report_id', v_report.report_id,
      'quarter_key', v_report.quarter_key,
      'remaining_credit', 0, 'unlimited', false
    );
  end if;

  insert into public.report_unlocks (user_id, report_id, quarter_key, unlock_type)
  values (v_user_id, v_report.report_id, v_report.quarter_key, 'free_quarterly')
  on conflict do nothing
  returning true into v_inserted;

  if coalesce(v_inserted, false) then
    return jsonb_build_object(
      'status', 'unlocked', 'report_id', v_report.report_id,
      'quarter_key', v_report.quarter_key,
      'remaining_credit', 0, 'unlimited', false
    );
  end if;

  -- A competing request won either the report-level or quarter-level unique key.
  select * into v_unlock
  from public.report_unlocks
  where user_id = v_user_id
    and quarter_key = v_report.quarter_key
    and unlock_type = 'free_quarterly'
  limit 1;

  return jsonb_build_object(
    'status', case when v_unlock.report_id = v_report.report_id then 'already_unlocked' else 'credit_exhausted' end,
    'report_id', v_report.report_id,
    'quarter_key', v_report.quarter_key,
    'remaining_credit', 0,
    'unlimited', false
  );
end;
$$;

revoke all on function public.market_radar_quarter_key(date) from public;
revoke all on function public.handle_new_user_market_radar_membership() from public;
revoke all on function public.ensure_market_radar_membership() from public, anon;
revoke all on function public.get_market_radar_entitlement(text) from public, anon;
revoke all on function public.unlock_market_radar_report(text) from public, anon;
grant execute on function public.ensure_market_radar_membership() to authenticated;
grant execute on function public.get_market_radar_entitlement(text) to authenticated;
grant execute on function public.unlock_market_radar_report(text) to authenticated;

-- The current 2026-08-29 page is a development fixture. Seed its canonical ID
-- inactive so forged IDs are rejected without pretending a public bundle exists.
insert into public.report_catalog (report_id, report_date, is_active)
values ('market-radar-kaohsiung-2026-08-29', date '2026-08-29', false)
on conflict (report_id) do nothing;
