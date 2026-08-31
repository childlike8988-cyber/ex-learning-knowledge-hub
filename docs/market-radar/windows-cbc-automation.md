# Windows CBC Monthly Automation

## Why Windows Task Scheduler

This project is a static GitHub Pages site, while its approved CBC automation runs locally. Windows Task Scheduler replaces n8n and Docker: it invokes the project-owned PowerShell wrapper, which delegates official acquisition and CBC parsing to the existing Node scripts.

## Runtime and manual run

`scripts/market-radar/run-cbc-monthly.ps1` derives the repository root from its own location, checks `node` and `npm`, captures structured JSON from `run-cbc-monthly-cycle.mjs`, writes an ignored log and `data/market-radar/processed/cbc-last-run.json`.

Run manually:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\market-radar\run-cbc-monthly.ps1
```

`-DryRun` keeps the candidate path non-publishing. `-TestInvalidCbc` uses only a missing local candidate to verify `FAILED SAFE`; it does not contact the CBC website. `SKIPPED` and successful local publication exit `0`; failure exits `1`.

## Safety and Git boundary

The wrapper fingerprints `public/data/market-radar/live/cbc-housing-finance-latest.json` before and after every run. A `SKIPPED` result must leave the hash identical. It intentionally does not rewrite tracked `update-status.json` for a same-period local check, so Git remains clean; the ignored last-run JSON records the new attempt locally.

A future new-period publish remains inside the existing candidate, quality gate and atomic-write contract. After publish, typecheck, lint, tests and build must pass; failure calls the existing `rollback-cbc-live.mjs`. No wrapper or scheduled task runs `git add`, `git commit` or `git push`. Deployment remains a manual review step.

## Scheduled task

`install-cbc-scheduled-task.ps1` creates only `E.X Market Radar - CBC Monthly Refresh`, then disables it. It uses the interactive logged-on user, no stored password, no wake requirement, monthly triggers for days 21–28 at 08:30, missed-run catch-up, `IgnoreNew` multiple-instance protection and a 30-minute execution limit.

Use `show-cbc-scheduled-task.ps1` to read its state and `remove-cbc-scheduled-task.ps1` to remove only that exact task. The installer never enables the task. A later explicit activation phase is required before automatic scheduling.

## Runtime activation record

The initial manual check was performed with CBC LIVE and the detected official period both at `2026-07`. It returned `SKIPPED` with exit code `0`; the CBC LIVE SHA-256 value was unchanged. A controlled missing-candidate check returned `FAILED SAFE` with exit code `1` and also left CBC LIVE unchanged. The task was created in the `Disabled` state for manual review only. No n8n, Docker, Git commit or Git push is involved.

The Scheduled Task action uses a minimal local CMD shim because `schtasks.exe` has a 261-character action limit and the repository path contains spaces. The shim only starts the project-owned PowerShell wrapper; it contains no CBC acquisition, parsing, publishing or Git logic.

MOI latest and MOI historical automation remain disabled and are outside this CBC-only runtime boundary.
