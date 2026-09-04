-- Publication review seed only. This migration does not activate a report or
-- expose a bundle; activation remains a deliberate post-gate operation.
insert into public.report_catalog (report_id, report_date, is_active)
values ('market-radar-kaohsiung-2026-09-01', date '2026-09-01', false)
on conflict (report_id) do nothing;
