# Market Radar Identity Schema — Design Draft

Status: non-executed architecture artifact  
Target: Supabase Postgres  
Phase: 2F-1A

This is a schema contract, not an applied migration. Types and policies must be reviewed and tested in a disposable development project before production use.

## 1. Design rules

- `auth.users.id` is the initial provider identity key; application code exposes it as internal `userId`.
- Auth owns email, password credentials, provider identities, access tokens, refresh tokens and sessions.
- Product tables store only minimum profile, membership, report, entitlement and delivery data.
- Guest is not a database row.
- A Free credit unlocks a report bundle, never an individual PNG/PDF.
- The database derives quarter and authoritative time; the browser cannot set plan, credit, source or storage path.
- Mutable `used_credits` and `remaining_credits` columns are avoided while the rule is fixed at one credit.

## 2. Logical enums

```sql
-- Design pseudocode; not an applied migration.
membership_plan   = ('free', 'pro')
membership_status = ('active', 'past_due', 'cancelled', 'expired')
membership_source = ('system', 'operator', 'stripe', 'taiwan-provider')
report_status     = ('draft', 'published', 'withdrawn')
unlock_source     = ('free-quarterly', 'pro')
grant_status      = ('active', 'exhausted', 'expired', 'revoked')
download_format   = ('share-bundle', 'pdf', 'all')
```

Provider names are extensible text or a separate validated enum when a payment provider is actually selected. Do not ship speculative provider values as executable schema.

## 3. Profiles

```sql
profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

No email column is required. The account adapter reads a verified email from Auth claims. Initial profile information is optional; real name, phone, address and birthday are not collected.

## 4. Memberships

```sql
memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan membership_plan not null default 'free',
  status membership_status not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz null,
  source membership_source not null default 'system',
  external_customer_id text null,
  external_subscription_id text null,
  updated_at timestamptz not null default now(),
  check (expires_at is null or expires_at > started_at)
)
```

Add partial unique indexes for non-null external customer/subscription IDs after a provider is selected. The browser receives a safe projection without external IDs. New users receive Free membership through a trusted trigger/function, not a client insert.

Effective Pro access requires all of:

```text
plan = pro
status = active
expires_at is null OR expires_at > database now()
```

## 5. Report catalog

```sql
report_catalog (
  report_id text primary key,
  report_date date not null,
  status report_status not null default 'draft',
  snapshot_hash text not null,
  bundle_version text not null,
  renderer_version text not null,
  png_card_count smallint not null check (png_card_count between 1 and 3),
  has_pdf boolean not null,
  storage_prefix text not null unique,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'draft' and published_at is null)
    or (status in ('published', 'withdrawn') and published_at is not null)
  )
)
```

`storage_prefix` is private server metadata. Public catalog access uses a view containing only report ID/date/status/version/card count and publication time. The server verifies bundle hashes before changing `status` to `published`.

## 6. Report unlocks

```sql
report_unlocks (
  unlock_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id text not null references report_catalog(report_id),
  quarter_key text not null check (quarter_key ~ '^[0-9]{4}-Q[1-4]$'),
  entitlement_source unlock_source not null,
  unlocked_at timestamptz not null default now(),
  created_by text not null default 'unlock-report-rpc',
  unique (user_id, report_id, entitlement_source)
)

create unique index one_free_report_per_user_quarter
  on report_unlocks (user_id, quarter_key)
  where entitlement_source = 'free-quarterly';
```

The partial index is the concurrency invariant. It does not constrain Pro rows. A Pro row is an access/audit record only; it does not preserve access after Pro expires. A Free row is the durable report-level unlock.

Do not accept `quarter_key`, `entitlement_source`, `unlocked_at`, or `created_by` from a browser mutation. The trusted unlock function derives them.

## 7. Quarterly entitlement projection

Do not create a mutable `quarterly_entitlements` table for the fixed one-credit rule. The account function projects:

```text
quarterKey       = trusted current quarter in Asia/Taipei
totalCredits     = 1
usedCredits      = count of own free-quarterly unlock rows in quarter (0 or 1)
remainingCredits = 1 - usedCredits
unlockedReportId = report_id from that row, if present
unlockedAt       = unlocked_at from that row, if present
```

This maps directly to the existing `QuarterlyDownloadCreditState` while avoiding counter drift.

If future plans introduce bonus or purchased credits, add an append-only `credit_grants` ledger and derive totals from grants minus report unlocks. Do not add an administrator-editable counter to the browser API.

## 8. Download grants

Required when protected delivery is implemented:

```sql
download_grants (
  grant_id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id text not null references report_catalog(report_id),
  format download_format not null,
  max_requests smallint not null check (max_requests > 0),
  request_count smallint not null default 0 check (request_count >= 0),
  expires_at timestamptz not null,
  status grant_status not null default 'active',
  created_at timestamptz not null default now(),
  last_used_at timestamptz null,
  check (expires_at > created_at),
  check (request_count <= max_requests)
)
```

Only a cryptographic hash of the opaque grant token is stored. A raw token is returned once over HTTPS. A trusted delivery function atomically verifies status/expiry/ownership/format and increments `request_count` before returning a minutes-long Storage signed URL or streaming a file.

Grant expiry may be up to approximately 24 hours. Storage signed URLs should be much shorter because they cannot enforce the database request budget after issuance.

## 9. Download events

Optional for the beta, recommended in Phase 2F-3:

```sql
download_events (
  event_id bigint generated always as identity primary key,
  request_id uuid not null unique,
  grant_id uuid null references download_grants(grant_id),
  user_id uuid null references auth.users(id) on delete set null,
  report_id text not null,
  format download_format not null,
  outcome text not null,
  occurred_at timestamptz not null default now(),
  safe_error_code text null
)
```

This table is append-only and backend-only. Avoid raw IP addresses, user agents, URLs, tokens and stack traces unless a later privacy/security review establishes a necessary retention policy. A salted/rotating IP-derived abuse key could be considered separately.

## 10. Payment event idempotency

When payment is implemented, add a private backend-only event table:

```text
payment_webhook_events
- provider
- provider_event_id (unique)
- event_type
- received_at
- processed_at
- outcome
```

The verified event and membership mutation occur idempotently. A browser checkout redirect never writes `memberships`.

## 11. RLS matrix

| Object | User SELECT | User INSERT/UPDATE/DELETE | Trusted function/service |
| --- | --- | --- | --- |
| `profiles` | Own row | Only explicitly safe display fields, or function-mediated | Full scoped administration |
| `memberships` | Own safe view/projection | None | Webhook/operator only |
| `report_catalog` | Published safe view | None | Publication pipeline only |
| `report_unlocks` | Own rows | None | Atomic unlock function only |
| `download_grants` | No direct table access | None | Grant/delivery functions only |
| `download_events` | None by default | None | Delivery/audit service only |

Baseline ownership predicate:

```sql
auth.uid() is not null and auth.uid() = user_id
```

RLS is enabled on every exposed table. Backend functions accept a user JWT, derive the caller from `auth.uid()`, and never trust a body `user_id`.

## 12. Atomic unlock RPC contract

Conceptual signature:

```text
unlock_market_radar_report(p_report_id text)
returns {
  outcome,
  report_id,
  quarter_key,
  entitlement_source,
  unlocked_at
}
```

Allowed outcomes:

- `pro-authorized`
- `free-unlocked`
- `free-already-unlocked`
- `free-credit-exhausted`
- `report-unavailable`
- `membership-unavailable`

Transaction outline:

1. Require authenticated `auth.uid()`.
2. Lock/read the current membership and published catalog row.
3. Derive the quarter from database time in `Asia/Taipei`.
4. For active Pro, upsert the Pro audit row and return.
5. For Free, return existing same-report Free row if present.
6. Insert `free-quarterly`; allow the partial unique index to arbitrate races.
7. On unique conflict, re-read: same report means idempotent success; different report means exhausted.
8. Never create a grant in the same response unless protected delivery validation also succeeds.

The implementation must test two concurrent sessions attempting both the same report and different reports.

## 13. Safe API projections

### Account state

```ts
type ProductionAccountState = {
  identity: IdentityUser;
  membership: { plan: "free" | "pro"; status: string; expiresAt?: string };
  quarter: {
    quarterKey: string;
    totalCredits: 1;
    usedCredits: 0 | 1;
    remainingCredits: 0 | 1;
    unlockedReportId?: string;
    unlockedAt?: string;
  };
};
```

### Public report availability

```ts
type PublishedReportCatalogItem = {
  reportId: string;
  reportDate: string;
  status: "published";
  bundleVersion: string;
  pngCardCount: 1 | 2 | 3;
  hasPdf: boolean;
  publishedAt: string;
};
```

Neither response contains storage prefixes, file paths, token hashes, payment IDs, secrets or absolute local paths.

## 14. Migration and rollback rule

Schema changes must be versioned SQL migrations only after Phase 2F-1B selects real project environments. Each migration needs a disposable-project test, RLS test under anonymous/authenticated/service roles, and rollback/forward-fix note. No design pseudocode in this file is authorized for production execution.
