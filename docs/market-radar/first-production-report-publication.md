# First Production Market Radar Report Publication Gate

## Candidate edition

The first publication-review candidate is `market-radar-kaohsiung-2026-09-01`.
Its edition date is **2026-09-01** (`2026-Q3`). This is intentionally not the
legacy `2026-08-29` fixture edition: the current MOI batch was officially
published on 2026-09-01, so assigning it to an earlier report date would make
the report timeline misleading.

The legacy `market-radar-kaohsiung-2026-08-29` record remains a development
fixture and must stay inactive in `report_catalog`.

## Minimum first-publication content

The production snapshot contains only:

- MOI official Kaohsiung sale facts: the validated transaction count and the
  top district transaction-count chart.
- CBC official housing-finance facts: mortgage rate, rate change in percentage
  points, and new mortgage amount.
- Existing deterministic, rule-based analysis of the above facts.
- Compact `WAITING` disclosures for MOI Historical and Price Momentum.

The following legacy sections are deliberately omitted rather than relabelled:

- Fixture 今日一句; production shows an editorial-unavailable message instead.
- Fixture district highlights, fixture news, fixture charts, and fixture key
  sentences.

`PARTIAL LIVE` remains visible. It is not a publication blocker when the
limitations are present, but it is never upgraded to `LIVE` merely because two
official sources are available.

## Publication contract

`buildMarketRadarProductionReportSnapshot.ts` is the dedicated production
builder. It consumes validated MOI/CBC live data plus the existing rules-based
analysis. It never reads the legacy fixture report and does not use an LLM.

Every numeric fact has a non-mock `sourceId`. Facts remain in `moi.facts`,
`cbc.facts`, and `signals[].facts`; interpretation remains in the analysis
objects. Web preview, PNG share cards, and PDF are rendered from this one
snapshot, with one report ID and one report date.

## Publication gate

The gate evaluates:

1. Numeric facts are source-referenced and non-mock.
2. No fixture fact, mock source, fixture editorial, or fixture chart remains.
3. Facts and analysis stay separate.
4. `PARTIAL LIVE` and both `WAITING` coverages remain truthful.
5. The canonical ID, edition date, and catalog-quarter contract agree.
6. PNG and PDF export eligibility are both true.

Passing the code-level gate permits a **review recommendation** only. It does
not mutate Supabase or make reports public. Renderer version `1.1.1` records
the compact production-share layout used for this candidate.

## Catalog and activation boundary

`202609040002_seed_first_production_market_radar_report.sql` prepares the
candidate catalog row as:

| report_id | report_date | quarter_key | is_active |
| --- | --- | --- | --- |
| `market-radar-kaohsiung-2026-09-01` | `2026-09-01` | `2026-Q3` | `false` |

The migration is not applied by the application. After source review, export
smoke, and controlled publication review all pass, an authorized operator may
activate the exact catalog row in Supabase. Activation still does not deliver
files: protected storage and download delivery remain a later phase.

## Non-goals

This gate does not change the legacy public Market Radar fixture page, Supabase
production data, membership schema, OAuth, payment, storage, or download
delivery. Generated PNG/PDF artifacts remain local and ignored by Git.
