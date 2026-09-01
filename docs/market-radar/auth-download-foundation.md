# Market Radar Auth + Download Foundation

## 1. Current static constraint

Market Radar is deployed as a GitHub Pages static export. The frontend can explain account and entitlement states, but it cannot securely authenticate a person, hold a trusted session, enforce a quota, issue protected download URLs, or receive payment webhooks.

Phase 2F-0 therefore provides a UI and domain-contract foundation only. It does not expose `data/market-radar/exports/`, turn an export into a public URL, or claim that a local mock is secure authentication.

## 2. Account states

`MembershipPlan` has three product states:

- `guest`: unauthenticated; complete-report download asks for login.
- `free`: authenticated in a future provider; one complete report may be unlocked per natural quarter.
- `pro`: authenticated with a valid Pro entitlement; prepared reports are not limited by the Free quarterly credit.

`AuthProviderAdapter` is the replacement boundary for a future identity provider. Its contract includes `getSession`, `signIn`, `signOut`, and `getAccountState`. Phase 2F-0 only includes a clearly named, in-memory local mock for the noindex account preview. It stores no password, access token, refresh token, or persistent session.

Possible future providers include Supabase Auth, Firebase Auth, Clerk, Auth0, or a custom identity backend. No provider is selected or integrated in this phase.

## 3. Quarterly Free credit

Natural quarters are deterministic:

- Q1: January–March
- Q2: April–June
- Q3: July–September
- Q4: October–December

`getCalendarQuarter(date)` and `getQuarterKey(date)` produce keys such as `2026-Q3`. `QuarterlyDownloadCreditState` is the future persistence contract: `quarterKey`, total/used/remaining credit counts, optional `unlockedReportId`, optional `unlockedAt`, and a mock marker.

One Free credit unlocks one `reportId`, not one file. That one report unlock includes the full PNG share-card bundle (one to three cards) and the PDF report. Credits never carry across quarters.

Phase 2F-0 deliberately does not persist, decrement, or consume a credit.

## 4. Entitlement evaluator

`evaluateMarketRadarDownloadEntitlement()` is a pure function. It receives the account, public report availability metadata, and quarterly credit state, then returns one state:

- `guest-login-required`
- `free-credit-available`
- `free-report-unlocked`
- `free-credit-exhausted`
- `pro-ready`
- `download-unavailable`

The evaluator only returns user-facing status, CTA text, and reasons. It does not create a download, mutate a credit, or inspect local export files.

## 5. Report availability and future download action

The public frontend uses `reportId`, report date, quarter key, and format availability metadata only. It never returns an absolute path, artifact hash, local directory, secret, or export URL.

`requestMarketRadarDownload({ reportId, format })` is deliberately a safe placeholder. In this phase it always returns `NOT_IMPLEMENTED` with `REQUIRES_BACKEND`. A future protected implementation needs a trusted identity session, server-side entitlement evaluation, an audit record, and a short-lived signed download response.

## 6. UX behavior

The public Market Radar page defaults to Guest because static HTML has no trusted account state.

- Guest: `本季免費下載完整報告` opens a login-required dialog. The dialog explains the benefit but never fakes login success.
- Free available: displays `FREE`, `1 / 1`, and a report-level unlock CTA.
- Free unlocked: labels the current report unlocked; PNG and PDF remain part of the same report unlock.
- Free exhausted: explains that the credit was used for a different report.
- Pro: displays `PRO` and unlimited prepared-report access; format controls still return the backend-required placeholder.

`/market-radar/account-preview/` is noindex and exists only to visually test those local mock states. It is not in public navigation and does not function as a production login page.

## 7. Security boundary

Do not place passwords, identity tokens, refresh tokens, protected artifact URLs, or entitlement authority in `localStorage`, static JSON, source files, or GitHub Pages. Do not attempt to secure a local output folder by hiding its path.

Real authentication, quarterly-credit persistence, payment, protected download links, and quota enforcement must be server-side in a later phase.

## 8. Future payment and download flow

1. Identity provider establishes a trusted session.
2. Backend reads the account plan and quarterly report unlock record.
3. Backend evaluates report-level entitlement atomically.
4. Free unlock is recorded once per report and quarter; Pro requires a verified active plan.
5. Backend returns short-lived, protected access to the PNG bundle and/or PDF.
6. Payment webhooks update the Pro entitlement only after verified provider events.

This flow keeps the existing local export engine separate from public delivery and preserves Market Radar source truthfulness.
