# CBC Monthly Automation

## Scope

Phase 2D-1A enables only `cbc-monthly-refresh`. `moi-latest-refresh` and `moi-history-backfill` remain disabled. The automation updates local static data only; it never creates a Git commit or pushes GitHub Pages. `run-cbc-monthly-cycle.mjs` is the local handoff command used by n8n: it safely skips an unchanged month, or acquires and dry-runs a verified new attachment.

## Official source and acquisition

The only allowed release page and attachment domains are `www.cbc.gov.tw` and `cbc.gov.tw`. The acquisition step reads the official release page, identifies its XLSX attachment and obtains: source page URL, attachment URL, official filename, release date, expected monthly period and retrieval time. It rejects an unexpected domain, HTTP failure, empty file, non-XLSX MIME type, non-XLSX filename or invalid XLSX ZIP signature. SHA-256 is recorded for provenance and duplicate detection.

## Safe two-step execution

1. n8n checks the official release page.
2. If the period is unchanged, it records `SKIPPED`; it does not download or publish.
3. For a newer period, it acquires the official XLSX and invokes `cbc-monthly-refresh --dry-run` with the verified file and metadata.
4. The existing CBC importer parses, normalizes and stages a candidate in ignored `data/market-radar/staging/`.
5. The candidate must pass metadata/schema/quality checks: accepted rows, valid month, mortgage rate `0 < rate < 20`, non-negative amount, sorted history and unique periods.
6. Only a newer, non-duplicate source version may be published with `--publish`.

`sourceVersionId` is deterministic: `sourceId + sourcePublishedAt + dataPeriod + SHA-256`. Scheduled runs cannot force publication. A manual force is intentionally reserved for a future explicit operator path.

## Publish, rollback and history

Publish stores the current known-good CBC JSON under ignored `data/market-radar/backups/`, then uses atomic temporary-file rename to replace `public/data/market-radar/live/cbc-housing-finance-latest.json`. The importer retains the newest 12 monthly records in deterministic chronological order. If post-publish typecheck, lint, tests or build fails, `rollback-cbc-live.mjs` restores the known-good JSON and the public update status reports a safe failure. Failure never deletes or truncates the current LIVE JSON.

## n8n responsibility

n8n owns schedule, process orchestration and a safe success/skipped/failed notification. Parser, validation, quality rules, candidate comparison and publish logic remain in this repository. The workflow source is `automation/n8n/market-radar-cbc-monthly-refresh.json`; it contains no credential, token or automatic Git operation. It starts inactive and must be imported and manually tested in the local n8n environment before activation.

Suggested schedule: check once per day only during the 20th–28th of each month at 16:30 local time. Same-period checks are `SKIPPED`, so even a daily candidate window cannot republish a month.

## Manual recovery and notifications

Use the manual trigger first. Validate: same-period skip, a controlled newer candidate dry-run, and invalid-schema failure. Notification text must contain only `SUCCESS`, `SKIPPED` or `FAILED`, the safe data period and high-level summary. Never send local paths, stack traces, raw responses or credentials. Existing Telegram test credentials may be connected in local n8n; this workflow deliberately does not create a new credential.

The resulting boundary is: local n8n → local repository/live JSON → local checks/build → human-reviewed Git commit/push → GitHub Pages. GitHub Pages itself never runs the automation.
