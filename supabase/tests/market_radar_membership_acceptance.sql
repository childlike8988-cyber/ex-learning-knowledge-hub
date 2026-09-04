-- Phase 2F-1C manual SQL acceptance contract.
-- Run only in a disposable/local Supabase project after applying the migration.
-- It intentionally contains no real user UUID, email, token, or production mutation.

-- Schema and constraint inventory (read-only).
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('memberships', 'report_catalog', 'report_unlocks')
order by tablename;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'report_unlocks'
order by indexname;

select proname, prosecdef, proconfig
from pg_proc
join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
where pg_namespace.nspname = 'public'
  and proname in (
    'ensure_market_radar_membership',
    'get_market_radar_entitlement',
    'unlock_market_radar_report'
  )
order by proname;

-- Authenticated acceptance calls (use the Supabase client or SQL session with a
-- disposable auth context; never substitute a client-supplied user_id):
-- select public.ensure_market_radar_membership();
-- select public.get_market_radar_entitlement('market-radar-kaohsiung-2099-01-15');
-- select public.unlock_market_radar_report('market-radar-kaohsiung-2099-01-15');

-- Concurrency acceptance requires two authenticated sessions for the SAME Free
-- user and two active catalog reports in the SAME quarter.
-- Session A and Session B must issue these at the same time:
--   A: select public.unlock_market_radar_report('market-radar-kaohsiung-2099-01-15');
--   B: select public.unlock_market_radar_report('market-radar-kaohsiung-2099-02-15');
-- Expected: exactly one `unlocked`; the other is `credit_exhausted`.
-- Then repeat the winning report. Expected: `already_unlocked` and still one row.
-- Verify without relying on a stored counter:
-- select user_id, quarter_key, count(*)
-- from public.report_unlocks
-- where unlock_type = 'free_quarterly'
-- group by user_id, quarter_key
-- having count(*) > 1;
-- Expected: zero rows.

