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
2. Add exact allowed origins and redirect URLs for local and published GitHub Pages paths.
3. Configure Google OAuth credentials inside Supabase only.
4. Configure an OTP email template and test the six-digit code on a disposable account.
5. Test session restore, logout, expired/invalid session, provider outage and mobile callback behavior.
6. Implement memberships, quarterly unlock persistence, RLS/RPC and protected delivery in later phases before enabling any actual download.

References: [Supabase Auth](https://supabase.com/docs/guides/auth), [social login](https://supabase.com/docs/guides/auth/social-login), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), and [JavaScript Auth methods](https://supabase.com/docs/reference/javascript/auth).
