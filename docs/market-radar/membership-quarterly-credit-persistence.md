# Market Radar Membership + Quarterly Credit Persistence

## Scope and current acceptance level

Phase 2F-1C moves membership and quarterly report-unlock decisions from browser mock state into Supabase Postgres. It adds schema, RLS, trusted RPCs, client adapters, and fail-closed UI integration. It does **not** add payment, report file delivery, Supabase Storage, signed URLs, download grants, or Pro purchase.

The migration is generated in `supabase/migrations/202609040001_market_radar_memberships_and_unlocks.sql`. Until that migration is deliberately applied and the live gates are executed, the production database status is **DB_MIGRATION_MANUAL_REQUIRED**.

## Schema

### `memberships`

- One row per authenticated `auth.users.id`; Guest is never persisted.
- `plan` is `free` or `pro`.
- `status` is `active`, `inactive`, or `expired`.
- Pro is effective only when the row is active, `starts_at <= now()`, and `ends_at` is either null or in the future.
- The browser may read only its own row and cannot insert, update, delete, or self-upgrade.

A trusted `auth.users` trigger creates an active Free row for new users. The migration also performs an idempotent backfill for existing users missing a row. `ON CONFLICT DO NOTHING` preserves every existing row, including valid Pro memberships.

### `report_catalog`

- Contains canonical `market-radar-kaohsiung-YYYY-MM-DD` report IDs.
- Derives `quarter_key` from trusted `report_date` in the database.
- A composite catalog foreign key prevents an unlock row from pairing a report with a different quarter.
- Only active catalog entries are readable by ordinary clients and eligible for unlock.
- The 2026-08-29 development fixture is seeded with `is_active = false`; it must not be activated until its bundle passes the publication gate.

### `report_unlocks`

- Each row is a report-level Free quarterly unlock, not a file download.
- `unique(user_id, report_id)` prevents duplicate unlocks of one report.
- A partial unique index on `(user_id, quarter_key)` where `unlock_type = 'free_quarterly'` enforces at most one Free report per natural quarter.
- PNG share cards and the PDF use the same `report_id`; they never consume separate credits.
- No mutable `used_credits` or `remaining_credits` counter is stored. Both values are derived from unlock rows.

## Quarter definition

`market_radar_quarter_key(report_date)` derives `YYYY-Q1` through `YYYY-Q4` from the catalog date. The RPC never trusts a client-supplied quarter, so changing a request payload cannot bypass the quarterly unique rule.

## Authoritative RPC flow

`ensure_market_radar_membership()` idempotently ensures a missing Free row and returns only an effective membership projection.

`get_market_radar_entitlement(report_id)` validates the authenticated user, active catalog report, current membership status and database time, then derives one of:

- `free_credit_available`
- `free_report_unlocked`
- `free_credit_exhausted`
- `pro_ready`
- `download_unavailable`

`unlock_market_radar_report(report_id)` is the single mutation boundary:

1. Use `auth.uid()`; no `user_id` argument is accepted.
2. Validate an active canonical report in `report_catalog`.
3. Evaluate membership using database time.
4. Return `pro_ready` without inserting a Free unlock for effective Pro.
5. Return `already_unlocked` for the same report.
6. Attempt one Free unlock insert with both unique constraints active.
7. Return `unlocked` to the winner or deterministically map the conflicting row to `already_unlocked` / `credit_exhausted`.

The functions use `SECURITY DEFINER`, an explicit empty `search_path`, schema-qualified objects, no caller-provided user ID, and execute grants only for the authenticated role.

## Concurrency guarantee

The database partial unique index—not a browser pre-check—is the final concurrency guard. Two tabs racing for different reports in the same quarter cannot both insert. One transaction wins; the other observes the committed unique conflict and returns `credit_exhausted`. The companion procedure in `supabase/tests/market_radar_membership_acceptance.sql` must be run with two live sessions before claiming live concurrency acceptance.

## UI state mapping

| Trusted state | Download state |
| --- | --- |
| Guest | `guest-login-required` |
| Free, no unlock this quarter | `free-credit-available` |
| Free, current report already unlocked | `free-report-unlocked` |
| Free, another report unlocked this quarter | `free-credit-exhausted` |
| Effective Pro | `pro-ready` |
| Auth, DB, RLS, malformed response, or catalog failure | `download-unavailable` |

React components consume `MarketRadarEntitlementProvider` through `useMarketRadarEntitlement`. They do not query raw tables or infer Pro from local state. The existing pure download-state evaluator remains the presentation mapper.

## Failure behavior

Membership timeout, network failure, RLS rejection, inactive report, malformed RPC response, or invalid membership period all fail closed. Public Market Radar content remains readable, but unlock and download actions are disabled. An error never defaults to Pro, unlocked, or Free-credit-available.

## Manual migration and live acceptance

1. Review the migration in a non-production Supabase environment.
2. Apply it with the project’s approved Supabase CLI workflow or paste the exact migration into Supabase SQL Editor. Do not expose the database password or service-role key to the frontend.
3. Keep the seeded fixture inactive. Insert/activate only a quality-approved report catalog entry.
4. Run `supabase/tests/market_radar_membership_acceptance.sql` inventory checks.
5. Execute the live Free, refresh, new-tab, same-report, different-report, next-quarter, two-session concurrency, and authorized Pro gates.
6. Record evidence without user email, UUID, session token, or secret.

## Payment and delivery boundary

Future verified payment webhooks may update `memberships`; a browser success redirect must never set Pro. Future protected delivery must separately validate the current session, effective membership/report unlock, and private report object. Unlocking grants report entitlement; a later short-lived download authorization only transports files and does not consume another credit.
