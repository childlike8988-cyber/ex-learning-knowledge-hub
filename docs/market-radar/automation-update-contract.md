# Market Radar Automation Update Contract

## Purpose and boundary

Phase 2D-0 establishes a deterministic, automation-ready contract only. `automationEnabled` is `false`; there is no scheduler, webhook, n8n workflow, runtime data fetch, payment, authentication, or LLM analysis.

The update sequence is:

```text
Official source → Acquire → Raw storage → Metadata validation → Parse → Normalize
→ Quality gate → Compare existing version → Stage candidate → Publish live JSON
→ Rebuild analysis → Health check → Activate
```

Failure at any stage preserves the previous known-good `public/data/market-radar/live/*.json`. An invalid candidate must never clear live data or be labelled LIVE.

## Jobs and triggers

| Job | Source | Future purpose | Enabled now |
| --- | --- | --- | --- |
| `moi-latest-refresh` | MOI real price | Check a newer official Kaohsiung sale batch | No |
| `moi-history-backfill` | MOI real price | Import a separately verified preceding period | No |
| `cbc-monthly-refresh` | Central Bank | Check a newer monthly housing-finance release | No |

Allowed future triggers are `manual`, `scheduled`, and `webhook`. Each job records a lifecycle state: `idle`, `checking`, `downloading`, `validating`, `processing`, `staged`, `published`, `failed`, or `skipped`.

## Acquire and raw storage

Automation may only acquire an official, source-configured URL after its metadata can be verified. This phase deliberately does not configure acquisition URLs in the runner.

Raw source files remain ignored under `data/market-radar/raw/`. Candidate files and intermediate output belong under ignored `data/market-radar/staging/`; public static data must never read from staging.

## Metadata, parser, and quality rules

Source-specific importers remain the only location for parsers, normalizers, quality gates, and analysis inputs. n8n must not duplicate those rules in nodes.

- MOI: verify official source, scope, sale transaction type, source publication date, data period, schema, and methodology compatibility.
- CBC: verify official attachment, source publication date, monthly period, source unit, and parser schema.
- Invalid metadata or schema: stop and retain the prior live data.
- Quality failure: stop and retain the prior live data.

## Versioning and idempotency

Every candidate has a deterministic `sourceVersionId`:

```text
sourceId : sourcePublishedAt : dataPeriodStart/dataPeriodEnd : SHA-256(raw file)
```

The SHA-256 supports provenance and duplicate detection. A duplicate version is skipped. A candidate older than the known published version is skipped unless a future explicit `force` operation is audited. Repeated imports of one version may not append duplicate MOI history periods or publish duplicate events.

## Candidate, publish, rollback

Candidates must remain staged until all conditions pass:

1. metadata valid;
2. schema valid;
3. quality gate passed;
4. source is newer, or explicitly force-approved.

Future publish writes a temporary JSON file, validates it, then atomically replaces the target live JSON. Before replacement, preserve only the prior known-good version metadata needed for rollback under `data/market-radar/backups/`; do not create unbounded backups.

If post-publish validation fails, restore the prior known-good version. Known-good means it previously passed the relevant quality gate.

## Dry run and manual file mode

`node scripts/market-radar/run-update-job.mjs <job-id> --dry-run` never publishes live JSON. Without a file, it safely returns `source acquisition not configured`.

`--source-file` allows a local official file supplied by an operator or future automation. In this readiness phase, dry run validates supplied provenance metadata, calculates deterministic SHA-256, invokes the existing source-specific importer into ignored staging, and records its quality result. It intentionally never publishes to `public/data/market-radar/live/`.

## Public status and health

`public/data/market-radar/update-status.json` exposes only safe status: source identity, latest published source period, last successful update, freshness, overall state, and `automationEnabled: false`. It excludes local paths, raw file hashes, stack traces, internal errors, and credentials.

`MarketRadarHealthStatus` separates MOI latest, MOI history, CBC, analysis readiness, and last build time. MOI history waiting is a planned data-coverage state, not a failure of MOI latest.

## Logging, retry, and notifications

Future jobs log: started, source checked, metadata validation, quality outcome, publish outcome, and finished. Internal logs may retain `info`, `warning`, and `error`; public status receives only a safe message.

- Metadata mismatch: stop; no aggressive retry.
- Temporary download error: bounded retry may be configured later.
- Invalid schema or quality failure: stop for manual review.
- Monthly CBC data is evaluated against its expected monthly cadence, not whether it was released today.

Future notifications may announce successful publish, schema mismatch, quality-gate failure, or source freshness concern. Phase 2D-0 sends nothing.

## Future n8n contract

n8n is an orchestrator only: schedule → check official source → download → call Market Radar runner → read result → notify success/failure. It does not hold parsers, quality gates, or analysis rules.

Illustrative safe payload:

```json
{
  "jobId": "moi-latest-refresh",
  "sourceId": "moi-real-price-sales",
  "triggeredAt": "2026-08-31T00:00:00Z",
  "dryRun": true,
  "sourceFile": "operator-supplied-path-only",
  "sourcePublishedAt": "2026-08-21",
  "expectedPeriod": { "start": "2026-08-01", "end": "2026-08-10" }
}
```

No secret, credential, or raw internal error belongs in the payload.
