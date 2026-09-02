# Market Radar Real Identity Architecture

Status: architecture decision only  
Phase: 2F-1A  
Decision date: 2026-09-02  
Decision confidence: HIGH

This document selects the production identity and entitlement architecture for Market Radar. It does not provision a backend, install a provider SDK, create credentials, change the current Auth UI, or make local report artifacts public.

## 1. Decision

**RECOMMENDED: Supabase Auth + Supabase Postgres + Edge Functions + private Supabase Storage for the first public beta.**

The deciding requirement is not sign-in alone. Market Radar needs an atomic rule—one Free report unlock per natural quarter—plus durable report history, trusted Pro membership, protected bundle delivery, and future payment webhooks. Supabase provides a coherent first-party path from Auth identity to Postgres transactions and Row Level Security (RLS), trusted Edge Functions, and private object storage.

The current static Next.js export remains the public frontend. Supabase becomes the external identity and authorization authority; GitHub Pages never becomes a security boundary.

Official capability references:

- [Supabase Auth](https://supabase.com/docs/guides/auth) supports Google, email password, magic link and OTP, and integrates Auth JWTs with Postgres RLS.
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) scopes browser-visible rows with `auth.uid()`.
- [Private Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals) require authenticated access or a time-limited signed URL.
- [Edge Function authentication](https://supabase.com/docs/guides/functions/auth) provides a trusted function boundary for user JWT validation and secret-only operations.
- [Redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls) supports exact production callback paths and separate local callbacks.

### Why this is the best fit

1. Postgres constraints and transactions express the Free-quarter invariant directly and safely.
2. RLS lets the static browser read only its own safe rows without making the browser trusted.
3. Edge Functions can own unlock mutation, payment webhook verification, grant creation, and signed delivery.
4. Private Storage is sufficient for a beta and avoids introducing a second cloud on day one.
5. A provider-neutral `IdentityUser` and the existing `AuthProviderAdapter` prevent Market Radar domain logic from depending on Supabase user objects.
6. Postgres tables can later serve AI Learning progress, workspace preferences, and other E.X products without turning identity metadata into the domain database.

### Important qualification

Supabase browser sessions are access/refresh-token sessions. In a pure static SPA, the JavaScript client must be able to restore them; there is no GitHub Pages server capable of issuing an HttpOnly application cookie. That is an accepted beta trade-off, not equivalent to server-cookie isolation. The mitigation is provider-managed session storage, short access-token lifetime, strict CSP and dependency hygiene, no custom token copies, and server-side validation on every protected operation. If the risk profile later requires HttpOnly cookies, the authenticated shell should move behind a BFF-capable host while public Market Radar content may remain static.

## 2. Provider comparison

Ratings are specific to this product and its first-beta constraints.

| Criterion | Supabase | Firebase | Clerk | Auth0 | Custom identity/backend |
| --- | --- | --- | --- | --- | --- |
| Static SPA / GitHub Pages | Strong browser client; external backend | Strong browser client; external backend | Strong SPA SDK and hosted components | Strong SPA/OIDC SDK | Possible, but every flow must be built |
| Google sign-in | Native provider | Native provider | Native provider | Native social connection | Must integrate and secure OAuth |
| Email sign-in | OTP, magic link, password | Email link/password | Email code/link/password | OTP/password; magic-link limitations vary by login mode | Must build mail, anti-abuse and recovery |
| Session restoration | Provider JWT + refresh session | Mature browser persistence | Managed browser sessions | SPA token/session SDK | Full responsibility |
| Stable user ID | Auth UUID | Firebase UID | Clerk user ID | Auth0 `sub` | Must design and migrate |
| Domain database | Native Postgres | Firestore is native, document-oriented | None; external DB required | None; external DB required | Must select and operate |
| Row authorization | Native Postgres RLS | Firestore/Storage Security Rules | External backend authorization | External API authorization | Must implement |
| Quarterly entitlement persistence | Natural relational fit | Feasible with transaction documents | Requires external DB | Requires external DB | Feasible but costly |
| Atomic one-per-quarter rule | Transaction + partial unique index | Transaction on a deterministic document | External DB transaction | External DB transaction | Must build correctly |
| Webhook/function boundary | Edge Functions + secrets | Cloud Functions; billing account needed for full backend/storage path | Webhooks plus a separate backend | Actions/hooks plus a separate API/database | Full responsibility |
| Protected object storage | Private Storage + RLS/signed URL | Cloud Storage + Rules; Blaze plan required | External storage required | External storage required | External storage required |
| Protected download authorization | One Edge Function can validate Auth, DB entitlement and Storage grant | Feasible across Auth, Firestore transaction, Function and Storage Rules | Requires Clerk plus external API, DB and storage | Requires Auth0 plus external API, DB and storage | Must design every layer |
| Small-scale suitability | Strong; integrated free tier, with free-project inactivity caveat | Auth/Firestore generous; Storage requires Blaze billing | Excellent auth UX; extra DB/storage still needed | Strong free auth tier; extra DB/storage still needed | Poor for first beta |
| Local development | CLI/local stack available; SQL migrations | Emulator suite is mature | Good auth development mode; DB remains separate | Good tenant/SPA tooling; API remains separate | Highest setup burden |
| Operational complexity | Low-medium | Medium | Medium because of split authority | Medium-high because of split authority | High |
| Vendor lock-in | Medium; Postgres data is portable, Auth/Storage APIs are not | Medium-high around Firestore/Rules | Medium-high identity/session coupling | Medium identity coupling | Low vendor lock-in, high implementation lock-in |
| Future shared E.X identity | Good single user pool and custom OIDC path | Good across apps in one Firebase project | Strong cross-app auth, but domain data remains separate | Strong identity/SSO platform | Potentially ideal only after substantial work |
| Migration difficulty | Medium; exportable relational domain data | Medium-high document/schema migration | Medium; identity export plus external DB | Medium; identity export plus external DB | High from day one |

Supporting comparison evidence:

- Firebase supports Google/email Auth and browser persistence, Firestore transactions, and Security Rules. However, [Cloud Storage for Firebase now requires the Blaze plan](https://firebase.google.com/docs/storage/web/start), and the entitlement model is less direct than a relational partial unique constraint. See [Firebase Auth persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence), [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions), and [Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions).
- Clerk offers excellent hosted auth UX, Google/email methods, sessions, and webhooks. Its own guidance notes that application data often needs an external database and webhook synchronization can be eventually consistent. See [Clerk JavaScript quickstart](https://clerk.com/docs/js-frontend/getting-started/quickstart) and [data synchronization guidance](https://clerk.com/docs/guides/development/webhooks/syncing).
- Auth0 is strong for SPA/OIDC and API authorization, including social and email OTP. It is identity infrastructure, not the entitlement database or report store, so this product would still need a second backend stack. See [Auth0 SPA + API architecture](https://auth0.com/docs/get-started/architecture-scenarios/spa-api) and [passwordless methods](https://auth0.com/docs/authenticate/passwordless/authentication-methods).
- A custom identity backend gives maximum control, but password lifecycle, OAuth correctness, session revocation, account linking, abuse prevention, mail delivery and operational security are disproportionate for the first public beta.

### Rejected alternatives

- **Firebase:** viable second choice, especially for a mobile-first product. Rejected here because report entitlements, membership history, publication catalog, payment idempotency and partial uniqueness fit Postgres more cleanly; protected Storage also requires Blaze billing.
- **Clerk:** best rapid-login UX option. Rejected because a separate durable database, mutation API and object store would still be required, increasing authority boundaries and eventual-consistency risk.
- **Auth0:** strong identity and enterprise federation. Rejected because it solves identity/API access but not the product's relational entitlement and storage needs, raising cost and operational surface for the beta.
- **Custom:** deferred. It offers no beta advantage large enough to justify owning authentication security and availability.

## 3. Static hosting boundary

What remains on GitHub Pages:

- public Market Radar facts, analysis and app shell;
- login/account UI and auth client bootstrap;
- public report catalog metadata that is safe to disclose;
- the existing pure download-entitlement presentation evaluator.

What must run outside GitHub Pages:

- identity authority and session issuance;
- membership and entitlement database;
- atomic report unlock mutation;
- payment webhook validation;
- private report bundle storage;
- short-lived download-grant issuance and request counting;
- trusted logs and security audit data.

```text
GitHub Pages / static Next.js export
├─ Public Market Radar (works without Auth)
├─ Auth client + loading / guest / authenticated UI
└─ Pure presentation evaluator
          │ user JWT
          ▼
Supabase Auth
          │ stable provider subject mapped to internal userId
          ▼
Supabase Edge Functions + Postgres
├─ profiles
├─ memberships
├─ report_catalog
├─ report_unlocks
├─ derived quarterly entitlement state
└─ download_grants / optional download_events
          │ short-lived server-issued retrieval authorization
          ▼
Private Supabase Storage
└─ approved report bundles only
```

Public browsing does not call the auth backend as a prerequisite. If Auth or the database is unavailable, Market Radar remains readable; account/download features show a temporary unavailable state.

## 4. Stable identity boundary

Domain services consume an internal shape, not a raw Supabase user:

```ts
type IdentityUser = {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
};
```

For the first implementation, `userId` maps 1:1 to the Supabase Auth UUID. The mapping is owned by the production adapter. Domain tables reference `user_id`; they do not contain passwords, refresh tokens, Google tokens, or provider session objects.

Email remains in Supabase Auth and is read from verified identity claims when needed. It is not duplicated in `profiles` merely for convenience.

## 5. Minimum production data model

The detailed design is in [identity-schema.md](./identity-schema.md).

| Object | Purpose | Decision |
| --- | --- | --- |
| `profiles` | Minimal display information keyed by Auth UUID | Required |
| `memberships` | Trusted current Free/Pro state and payment linkage | Required |
| `report_catalog` | Authoritative list of approved downloadable bundles | Required |
| `report_unlocks` | Durable report-level Free unlock and Pro access audit | Required |
| `quarterly_entitlements` | Projection of fixed product rule and Free unlock rows | Derived view/function, not a mutable table in v1 |
| `download_grants` | Hashed, expiring, request-limited delivery authorization | Required in Phase 2F-2 |
| `download_events` | Append-only retrieval audit | Optional for beta, recommended in hardening |

The fixed `totalCredits = 1` rule belongs in trusted product configuration. `usedCredits` and `remainingCredits` are derived from `report_unlocks`; storing three mutable counters would invite drift. If variable promotional credits are introduced later, add an explicit credit-grant ledger rather than retrofitting client-written counters.

Guest is never stored as a membership. A new authenticated user receives a Free membership by trusted database/function logic.

## 6. Membership trust

`memberships` is the source of truth for plan and status. The frontend may display the result but cannot write it.

- Free is active by default for a valid account.
- Pro is effective only when `plan = pro`, `status = active`, and the trusted time falls before `expires_at` when an expiry exists.
- `past_due`, `cancelled`, and `expired` do not authorize new Pro downloads. A separately recorded Free report unlock remains valid for that report.
- Payment provider/webhook identifiers are private backend data and are not necessary in the public account response.
- A payment success redirect never changes membership. Only a verified, idempotent webhook or authorized operator action may do so.

## 7. Quarterly entitlement and report unlock

The natural quarter is calculated server-side in the product timezone `Asia/Taipei`, producing keys such as `2026-Q3`. Client-supplied quarter keys are ignored for mutation.

One Free row in `report_unlocks` means that report is unlocked as a bundle:

- all one-to-three share PNG files;
- the PDF full report;
- any allowed format request (`share-bundle`, `pdf`, `all`) after unlock.

No file-level credit rows are created.

Recommended constraints:

- unique `(user_id, report_id, entitlement_source)` for idempotent same-source unlock recording;
- partial unique `(user_id, quarter_key) WHERE entitlement_source = 'free-quarterly'` to prevent more than one Free report per quarter;
- no global unique `(user_id, report_id)`, because a Pro audit record and a later Free durable unlock have different semantics;
- `report_id` must resolve to a published `report_catalog` row; storage paths never come from the browser.

### Atomic unlock operation

Use one trusted Postgres function/RPC inside a transaction:

1. Resolve `auth.uid()`; unauthenticated requests fail.
2. Resolve the requested `report_id` from `report_catalog`; require `published` and a valid bundle.
3. Read the current membership using database time.
4. If Pro is active, record an idempotent Pro access row and return access. The row is audit history; it does not grant access after Pro expires.
5. Otherwise attempt the Free insert with the server-derived quarter.
6. If the same Free report row already exists, return `free-report-unlocked` without another mutation.
7. If the quarter's partial unique constraint conflicts with another report, return `free-credit-exhausted`.
8. Return a structured result; never grant access because of a client-provided plan or stale counter.

The database constraint is the final concurrency guard. Two tabs racing to unlock different reports cannot both commit a Free row for the same quarter.

## 8. RLS and authorization principles

All domain tables enable RLS. Public browser access uses only the publishable key and the user's JWT.

Authenticated users may read:

- their own safe profile fields;
- their own safe membership projection;
- their own report unlocks and quarterly entitlement projection;
- published, non-sensitive report catalog metadata.

Authenticated users may not:

- set `plan = pro` or membership status;
- grant credits or insert arbitrary unlocks;
- choose `entitlement_source` or `quarter_key`;
- read or modify another user's rows;
- read storage prefixes, token hashes, payment identifiers, internal errors, or service metadata;
- directly create signed URLs.

Critical writes run through authenticated Edge Functions or narrow database functions. Secret/service-role keys remain in the function environment and bypass RLS only for explicit, validated operations. Supabase warns that secret/service-role keys bypass RLS and must never be used in a browser.

## 9. Session architecture

The future frontend state is a three-stage union:

```text
loading -> guest | authenticated
```

The page does not render a Guest download CTA until the initial provider session restoration has completed. This prevents a signed-in user seeing a Guest flash.

For the static beta:

- use Supabase's browser client and PKCE-capable OAuth flow;
- store only the public project URL and publishable key in the frontend;
- let the provider SDK own access/refresh session persistence and rotation;
- do not copy tokens into application keys, React state logs, analytics, query parameters or static JSON;
- do not request or retain Google provider access tokens because Market Radar only needs identity;
- use a strict Content Security Policy, trusted dependencies, HTTPS and short-lived Auth access tokens;
- validate the session again in every protected Edge Function.

The service-role/secret key, payment secret, mail secret and storage-signing authority exist only in managed backend secret storage.

## 10. Login flows

### Google

```text
Guest selects Google sign-in
-> Supabase Auth OAuth endpoint
-> Google consent/sign-in
-> Supabase callback validates provider response
-> exact static callback route receives the authorization result
-> Supabase client restores/exchanges the session
-> production AuthProviderAdapter maps IdentityUser
-> account state and entitlement are fetched
```

Required configuration in Phase 2F-1B:

- Google Authorized JavaScript Origin = the exact production site origin;
- Google Authorized Redirect URI = the Supabase project callback URL;
- Supabase Site URL = the canonical E.X site URL;
- Supabase Redirect URL allowlist = the exact static route, for example `/auth/callback/`, plus explicit local development URLs;
- the callback route must be emitted by static export and use the correct GitHub Pages base path if the site is project-hosted rather than custom-domain hosted.

No OAuth credential is placed in the repository. The Google client secret is configured only in the provider dashboard.

### Email

**First-version recommendation: six-digit email OTP.**

OTP avoids password storage/recovery policy and is more resilient than a magic link when a user requests mail in one browser but opens it in another. It adds one copy/paste step, which is acceptable for the beta. Magic link can be evaluated later; password login should wait until the product has a clear need for password recovery and credential support operations.

Apply provider rate limits, neutral responses that do not reveal whether an account exists, verified redirect/origin configuration, and a short OTP expiry.

## 11. Account response

The minimal account endpoint/function returns only:

- `IdentityUser` safe fields;
- `plan` and effective membership status;
- current `quarterKey`;
- derived total/used/remaining Free credits;
- current report unlock ID when applicable.

The account UI needs only avatar/name/email when present, Free/Pro, quarterly status, and logout. Phone, address, birthday and legal name are not required.

## 12. Report catalog and artifact boundaries

An authoritative `report_catalog` is required. Without it, the delivery function would be forced to trust a forged `reportId` or infer availability from an object path.

Minimum catalog fields:

- deterministic `report_id` and `report_date`;
- `status` (`draft`, `published`, `withdrawn`);
- `snapshot_hash`, `bundle_version`, and safe artifact counts;
- private `storage_prefix`;
- `published_at` and timestamps.

The catalog is populated only during controlled publication after report QA. Draft and withdrawn reports are not downloadable.

```text
Generation
local snapshot -> PNG/PDF engine -> validated local bundle

Publication
manual quality gate -> upload private bundle -> verify hashes -> publish catalog row

Delivery
authenticated request -> entitlement transaction -> download grant -> private file retrieval
```

Automation may later generate candidates after MOI/CBC updates, but automatic public publication remains disabled until a separate approval and quality gate are designed.

## 13. Protected storage recommendation

**First beta: private Supabase Storage bucket.**

This keeps identity, RLS, metadata, functions and storage in one operational boundary. Store only approved bundles under a server-resolved prefix such as `<report_id>/<bundle_version>/`; never expose the local `data/market-radar/exports/` path or copy it into GitHub Pages.

Cloudflare R2 is a sensible later optimization if report egress cost, global delivery, or storage independence becomes material. Introducing it now would require a second credential, upload pipeline, authorization integration and failure domain without proving a need.

## 14. Protected download architecture

```text
Authenticated browser
-> request(reportId, format) with Supabase user JWT
-> Edge Function verifies session
-> server resolves published report catalog row
-> server checks active Pro OR atomically creates/reads Free report unlock
-> server creates a hashed download_grant
-> browser receives opaque grant token (not a credit)
-> delivery function validates token, user/report/format/expiry/request budget
-> transaction increments request count
-> function returns a very short-lived Storage signed URL or streams the object
-> private Storage serves the approved artifact
```

The report credit and download token are separate:

- **Credit/unlock:** durable product entitlement selecting one report for a Free user in a quarter.
- **Grant/token:** temporary delivery authorization for files belonging to an already authorized report.

A grant may live up to approximately 24 hours, but the Storage signed URL issued after each validated request should be much shorter (for example, minutes). Supabase signed URLs remain usable until expiry and do not enforce a request count by themselves, so the request limit belongs in `download_grants`, enforced transactionally by the delivery function. Store only a hash of the opaque grant token.

The request budget should be derived from the bundle contents and a small retry allowance, not interpreted as additional Free credits. A three-card PNG bundle plus PDF still consumes one report unlock.

## 15. Payment readiness

Future payment integration connects only at a trusted function/webhook boundary:

```text
Payment provider webhook
-> verify signature
-> deduplicate provider event ID
-> map external customer/subscription to user_id
-> update membership in one transaction
-> account response reflects effective Pro state
```

Monthly NT$40 and annual NT$360 remain product configuration. Stripe or a Taiwan-compatible provider can implement the webhook contract later. The browser success page is informational and never upgrades membership.

## 16. Failure behavior

| Failure | Public browsing | Account/download behavior | Security result |
| --- | --- | --- | --- |
| Auth provider unavailable | Remains usable | Show account service unavailable; no login/download | Fail closed |
| Database unavailable | Remains usable | Do not infer plan or credit from cache | Fail closed |
| Membership lookup fails | Remains usable | No Pro access | Fail closed |
| Credit lookup/unlock fails | Remains usable | Do not consume or grant; offer retry | Fail closed |
| Storage unavailable | Remains usable | Preserve unlock; delivery temporarily unavailable | No public fallback URL |
| Grant creation fails | Remains usable | No token/URL returned | Fail closed |
| Publication/hash validation fails | Existing public page remains | Catalog stays draft/previous known-good | No invalid bundle |

Stale client account state may be shown as cached display only, clearly marked refreshing; it cannot authorize a protected operation.

## 17. Threat review

| Threat | Mitigation |
| --- | --- |
| Client plan tampering | Membership read from trusted database at protected request time; client plan is display-only |
| Credit replay | Idempotent RPC plus partial unique Free-quarter constraint |
| Double-unlock race | Single database transaction; unique constraint is final arbiter |
| Public file URL leakage | Private bucket; short-lived post-authorization signed URLs or function streaming |
| Token replay | High-entropy opaque token, stored hash, expiry, user/report/format binding, transactional request counter, revocation status |
| Cross-user access | `auth.uid()` ownership checks, RLS, grant ownership and server-side catalog resolution |
| Service-role secret leakage | Managed function secrets only; never browser, static JSON, logs or Git |
| Forged reportId/path traversal | Resolve only published catalog IDs; never concatenate client paths |
| Expired membership | Evaluate trusted database time on each Pro request; Pro audit row is not durable access |
| Stale client entitlement | Revalidate in function/RPC; frontend evaluator cannot grant files |
| XSS/session theft in static SPA | Strict CSP, minimized third-party scripts, dependency review, no custom token copies, short Auth access token; future BFF option |
| Payment webhook replay | Signature validation and unique provider event ID before membership mutation |

## 18. Future E.X identity compatibility

One Supabase Auth user pool can later provide stable IDs for the Learning Hub, Market Radar, AI Learning Station and selected E.X products. Each product should keep its own domain tables and authorization rules while referencing the same internal `user_id`.

Cross-domain SSO is not assumed. A shared session across unrelated origins needs a deliberate central auth domain, OIDC design, or reauthentication flow. This phase does not merge E.X Galaxy or AI Video Generator authentication.

The existing Galaxy pattern—short-lived opaque Bearer token, exact-origin/window `postMessage`, backend validation, no shared signing secret, no URL token—remains untouched. A future bridge could map a verified Galaxy subject to the same internal identity registry or use Supabase custom OIDC, but only after a separate threat model and migration plan.

## 19. Migration from Phase 2F-0

Retain the working pure UI/domain layer:

| Current contract | Production connection |
| --- | --- |
| `AuthProviderAdapter` | Add a Supabase adapter implementing session restore, sign-in, sign-out and safe account fetch; extend `signIn` with an optional Google/email-OTP method parameter rather than replacing the boundary |
| `AuthSession` | Add a `supabase` provider tag and map provider session to `loading`, `guest`, or authenticated `IdentityUser`; provider tokens stay inside adapter/SDK |
| `AccountState` | Populate from authenticated identity plus trusted membership response |
| `getQuarterKey()` | Keep for display/tests; backend independently derives the authoritative quarter in `Asia/Taipei` |
| `QuarterlyDownloadCreditState` | Populate from derived unlock projection, not local counters |
| `evaluateMarketRadarDownloadEntitlement()` | Keep as presentation logic; protected function repeats authoritative checks |
| `requestMarketRadarDownload()` | Replace placeholder with API client in Phase 2F-2; never return a local path |

The local mock adapter remains restricted to noindex development preview and is excluded from production account authority.

## 20. Implementation sequence

### Phase 2F-1B — Real Auth vertical slice

- provision separate development and production Supabase projects;
- add browser adapter, explicit `loading` state, Google and email OTP;
- emit a static callback route and verify exact origins/redirects;
- create minimal profile and default Free membership provisioning;
- no protected report delivery yet.

### Phase 2F-1C — Membership and quarterly persistence

- apply reviewed schema/RLS migrations;
- implement safe account-state query;
- implement and concurrency-test the atomic Free unlock RPC;
- keep payment provider mocked/administrative until webhook work is authorized.

### Phase 2F-2 — Report publication, unlock and protected download

- create private bucket and controlled bundle publication;
- populate `report_catalog` only after hash/quality checks;
- create grant/delivery functions and request limits;
- connect existing download UI to protected requests.

### Phase 2F-3 — Hardening and audit

- token revocation, event audit, abuse limits and security logging;
- payment webhook idempotency and membership reconciliation;
- CSP/session review, cross-device/concurrency tests, backup/recovery drills;
- assess whether storage should remain Supabase or move to R2.

## 21. Explicit non-implementation

Phase 2F-1A installs no provider SDK, contains no project URL/key, creates no Supabase project, database, bucket, Edge Function, OAuth client, email template, payment integration, download token, public artifact, commit, push, deployment or release.
