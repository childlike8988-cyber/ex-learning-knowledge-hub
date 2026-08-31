# Windows MOI Latest Automation

## Scope and source

This local-only job checks the Ministry of the Interior Open Data page at `https://plvr.land.moi.gov.tw/DownloadOpenData`. It accepts only the official `plvr.land.moi.gov.tw` or `lvr.land.moi.gov.tw` domains, and only the active Kaohsiung real-estate sale mapping `E_lvr_land_A` after verifying the official page row, transaction type and batch period.

MOI latest refresh and MOI historical backfill are separate. This workflow never imports historical ZIP files and leaves the historical baseline `WAITING`.

## Flow

Official active dataset page → metadata cross-check → official CSV acquisition → existing `import-moi-real-price.mjs` → dry-run candidate → quality gate → atomic local publish. The candidate must have a newer verified period, matching filename, UTF-8 bilingual schema, non-empty reconciled district metrics and a non-anomalous rejected-row ratio.

The official page publishes static batches around the 1st, 11th and 21st. The runner derives the expected publication date from the verified ten-day period; it never treats the page retrieval time as a source publication date.

## Runtime and safety

`run-moi-latest.ps1` logs to ignored `data/market-radar/logs/` and writes ignored `moi-last-run.json`. `SKIPPED` and successful local publication exit `0`; `FAILED SAFE` exits `1`. A skip must preserve the MOI LIVE SHA-256. A failed metadata, schema, quality, network or post-publish build check preserves or restores `moi-real-price-latest.json` through `rollback-moi-live.mjs`.

The Windows task `E.X Market Radar - MOI Latest Refresh` is installed disabled in this phase. It has monthly 1–3, 11–13 and 21–23 triggers at 08:30; uses an interactive logged-on account, `IgnoreNew`, a 30-minute limit, missed-run catch-up and no wake requirement.

No runtime script runs Git add, Git commit or Git push. A local publish remains subject to manual deployment review. CBC automation is not modified.

## Initial local validation

On 2026-08-31, the official MOI active-batch metadata identified the Kaohsiung sale file as `E_lvr_land_A.csv`, covering 2026-08-01 through 2026-08-10. That is the same period as the current local LIVE JSON, so the normal manual run and dry run both returned `skipped` with exit code 0. The LIVE JSON SHA-256 remained unchanged. A local invalid-candidate test returned `failed` with exit code 1 and also left the LIVE JSON unchanged.

The scheduler task is installed disabled during this phase. Job enablement means the code contract may run; it does not mean the Windows schedule is active.
