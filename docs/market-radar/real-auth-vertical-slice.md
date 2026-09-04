# Market Radar Real Auth Vertical Slice

Status: implementation contract
Phase: 2F-1B

## Scope

This slice connects the existing Market Radar account UI to **Supabase Auth** in a static Next.js export. It implements browser-session restoration, Google OAuth initiation, Email OTP verification, logout, a provider-neutral identity mapping, and a temporary authenticated **Free** presentation state.

It does not create a Supabase project, database table, membership record, quarterly credit record, report unlock, payment, protected file, signed URL, Storage upload, or download grant. A login does not authorize an export.

## Browser environment contract

Create a local ignored `.env.local` from `.env.example`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable browser key>
# Or, only for projects still using the legacy key name:
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon browser key>
```

Use one public browser key name. The application deliberately does not read, log, or ship a service-role key, database password, OAuth client secret, payment secret, refresh-token copy, or backend-only token. The URL and Supabase browser key are public client configuration; they do not authorize future report delivery.

If either required public variable is absent, the public Market Radar page remains available while account and download controls enter `unavailable` and remain fail-closed.

## Identity and session flow

```text
Static Market Radar UI
  -> Supabase browser SDK
  -> Supabase Auth session
  -> map Supabase User to IdentityUser
  -> AccountState { authenticated, plan: free }
  -> existing entitlement presentation evaluator
```

`IdentityUser` contains only `id`, optional display name, email, and avatar URL. Market Radar components do not consume a provider `User` object directly. The Supabase SDK owns its normal browser session persistence and refresh lifecycle; application code does not copy access or refresh tokens into localStorage, static JSON, logs, URLs, or source files.

On client startup, the UI begins as `loading`. It renders an account-checking state until `getSession()` returns or safely fails, so an existing session does not briefly flash a Guest download CTA. The resulting states are `guest`, `authenticated`, or `unavailable`.

Authenticated users map to **Free** only in this phase. Membership persistence remains unimplemented and browser state is never trusted for future Pro, credit, unlock, or protected-download decisions.

## Sign-in methods

### Google

The login dialog calls `signInWithOAuth({ provider: "google" })` and sends the browser to the exact callback route:

```text
https://<published-origin><base-path>/market-radar/auth/callback/
```

Register every local and production callback URL in Supabase Auth Redirect URLs and configure the Google provider in the Supabase dashboard. GitHub Pages remains only the static UI host; Supabase owns OAuth state and session issuance.

### Email OTP

The dialog first calls `signInWithOtp()` and then accepts a six-digit code through `verifyOtp({ type: "email" })`. Configure the Supabase email template to include the OTP token (for example `{{ .Token }}`) before expecting the six-digit path to work. Email delivery, anti-abuse limits and sender configuration remain Supabase project configuration, not frontend code.

## Static callback route

`/market-radar/auth/callback/` is a noindex, static-export-compatible page. It exchanges an OAuth PKCE `code` client-side when present, confirms a session, then returns to `/market-radar/`. The callback uses the existing `NEXT_PUBLIC_BASE_PATH` to support both a GitHub Pages project site and a root-domain deployment.

No callback handler, API route, server action, cookie, database, or secret is added to GitHub Pages.

## Logout and failure behavior

Logout delegates to `supabase.auth.signOut()` and then restores the safe Guest state. If Auth is unavailable, OAuth/OTP/logout returns a safe message; public market browsing continues, while account and download features do not claim access and remain disabled.

## Retained Phase 2F-0 boundaries

- The local mock adapter remains limited to the noindex account preview.
- `evaluateMarketRadarDownloadEntitlement()` remains pure presentation logic.
- `requestMarketRadarDownload()` still returns `NOT_IMPLEMENTED / REQUIRES_BACKEND`.
- Free uses one report-level quarterly unlock, covering all PNG cards plus PDF, but persistence and mutation are deferred.
- Pro pricing and actual membership are unchanged; no payment implementation exists.
- `data/market-radar/exports/` remains local and is never exposed by this static site.

## Before production acceptance

1. Provision separate Supabase development and production projects.
2. Add exact allowed origins and redirect URLs for localhost and the custom production domain.
3. Configure Google OAuth credentials inside Supabase only.
4. Configure an OTP email template and test the six-digit code on a disposable account.
5. Test session restore, logout, expired/invalid session, provider outage and mobile callback behavior.
6. Implement memberships, quarterly unlock persistence, RLS/RPC and protected delivery in later phases before enabling any actual download.

## Live Acceptance — 2026-09-03

Status: **BLOCKED — Supabase project configuration has not been supplied to this local environment.**

- No `.env.local` file was present, and no `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` was available in the process environment.
- No Supabase URL, public key, Google provider setting, Site URL, redirect allow-list, or OTP email template was guessed, created, or changed.
- The production target was subsequently migrated to `https://excreatorstudio.com/`; this historical blocked record does not describe the current production contract.
- The intended local callback is `http://localhost:3000/market-radar/auth/callback/` when development uses port 3000. Register the actual local port instead if it differs.
- With configuration absent, the client enters `unavailable`: public Market Radar remains browseable while account and download controls stay fail-closed. No Guest CTA is shown during session restoration.
- Google OAuth, Google cancellation, email OTP send/verify/resend/wrong-code, session restoration after a real login, new-tab restoration, logout against the provider, and GitHub Pages-origin callback remain **NOT TESTED** until a real configured Supabase project is available.
- No credentials, user data, session token, database row, membership, credit, report unlock, Storage object, download grant, payment, deployment, commit, or push was created by this acceptance attempt.

## Google OAuth Live Acceptance — 2026-09-03

Status: local live authentication confirmed by the configured project operator.

- A real Supabase project is configured locally with a public publishable key; no credential value is recorded here.
- Google provider is enabled. Local Google authentication, F5 session restore, new-tab/revisit restoration, logout, `IdentityUser` mapping, and the temporary authenticated Free state were confirmed on `http://localhost:3000`.
- Callback construction is deterministic: it uses the **origin of the browser initiating login**, then appends the configured deployment base path and `/market-radar/auth/callback/`. Localhost therefore stays localhost; it never infers the production origin.
- For the root deployment, the configured base path is empty. The production contract is therefore exactly `https://excreatorstudio.com/market-radar/auth/callback/`, without a legacy repository segment.
- The callback stores an OAuth code only in local function scope, removes it from the visible URL before exchange, and has an in-component single-processing guard for React effect re-entry. Failure shows a safe retry link without rendering a code, token, or provider error.
- The current code change has not been deployed. A fresh GitHub Pages-origin OAuth acceptance remains required after a separately authorized deployment.
- Membership, quarterly credit, report unlock, Pro authority, payment, Storage, signed URL, and protected download remain unimplemented.

References: [Supabase Auth](https://supabase.com/docs/guides/auth), [social login](https://supabase.com/docs/guides/auth/social-login), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), and [JavaScript Auth methods](https://supabase.com/docs/reference/javascript/auth).

## Production domain migration — 2026-09-04

The primary public origin is now `https://excreatorstudio.com/`.

- Production Market Radar: `https://excreatorstudio.com/market-radar/`
- Production application callback: `https://excreatorstudio.com/market-radar/auth/callback/`
- Local application callback: `http://localhost:3000/market-radar/auth/callback/`
- Google provider callback: `https://flgaeuxxvujtgptixmbo.supabase.co/auth/v1/callback`

The browser callback helper always uses the origin that initiated sign-in, then appends the root-deployment path. It produces the localhost callback during local development and the custom-domain callback in production; it neither infers the production origin locally nor adds a legacy repository path.

### Provider configuration checklist

Supabase **Authentication → URL Configuration** must use `https://excreatorstudio.com/` as Site URL and allow the production and local application callbacks above. Retain `https://excreatorstudio.github.io/market-radar/auth/callback/` temporarily as a rollback redirect until custom-domain production acceptance passes.

Google Cloud OAuth client **E.X Market Radar** must authorize JavaScript origins `https://excreatorstudio.com` and `http://localhost:3000`. Its provider redirect URI remains the Supabase callback above; the application callback must not be added as a Google provider redirect URI.

The GitHub Pages workflow reads only GitHub Actions Variables named `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and, only when required for compatibility, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. These are public browser configuration values; no service-role key, database password, or OAuth provider secret is ever placed in the static build.

### Acceptance status

The custom-domain public page and HTTPS were reachable on 2026-09-04. Production Google OAuth, session restore, new-tab restoration, logout, and logout-plus-refresh remain pending until the Supabase and Google dashboard entries above are confirmed and the workflow build with those public variables is deployed. Protected download, membership persistence, quarterly credits, payment, Storage, and Pro authority remain unimplemented.
