# E.X MARKET RADAR Report Export Specification

## Scope

This document defines the future report contract only. Phase 2D-1B.0 does not expose a download API, consume a Free Credit, check Auth, process payment, or publish a downloadable PNG/PDF. Existing Market Radar UI, pricing, credit rules and automation are unchanged.

## Report Snapshot

`MarketRadarReportSnapshot` in `src/lib/market-radar/report/types.ts` is the single deterministic input for web, PNG and PDF renderers. `buildMarketRadarReportSnapshot.ts` combines the current report fixture, validated MOI/CBC Live slices and the rule-based analysis result. Renderers must consume this snapshot instead of reimplementing source or analysis logic.

Required top-level fields:

`reportId`, `reportDate`, `generatedAt`, `locale`, `market`, `status`, `dataCoverage`, `keyTake`, `highlights`, `marketTemperature`, `liveObservations`, `moi`, `cbc`, `signals`, `charts`, `news`, `keySentences`, `sources`, `methodology`, `disclaimer`, `branding`, and `exportVersion`.

The status values are `live`, `partial-live`, `fixture` and `archived`. The current snapshot is `partial-live`: MOI latest and CBC are Live, while MOI historical and Price Momentum remain waiting. Two Live sources do not imply complete market coverage.

## Identity and time fields

`createMarketRadarReportId()` produces `market-radar-kaohsiung-YYYY-MM-DD`, for example `market-radar-kaohsiung-2026-09-01`. It is deterministic and does not use a random UUID.

`reportDate` is the report edition date. It is not a source publication date or a statistical period. Each `MarketRadarSource` keeps its own `publishedAt`, `dataPeriodStart`, `dataPeriodEnd`, `retrievedAt` and `verifiedAt`. MOI and CBC periods remain separate in `snapshot.moi.dataPeriod` and `snapshot.cbc.dataPeriod`.

## Fact versus Analysis

Numeric and source-derived values stay in `moi.facts`, `cbc.facts`, chart series and signal facts. Interpretations stay in `signals`, `marketTemperature.analysis` and the optional Live Key Take. The builder never asks an LLM to generate, fill, round or alter numeric values. A renderer may format a number, but may not create a new market fact.

`keyTake.status` is `fixture` while the Historical Baseline is waiting. MOI and CBC observations remain separately marked `live`. Fixture highlights, news, charts and key sentences retain their own `isMock` state.

## Data coverage

The snapshot records `moiLatest`, `moiHistorical`, `cbc` and `priceMomentum` independently. Coverage must be printed faithfully in an export, for example:

`MOI LIVE · CBC LIVE · Historical WAITING · Price Momentum WAITING`.

Historical WAITING is not an export blocker when an official source with complete metadata is present.

## PNG v1

PNG is a social / LINE / client-communication brief, fixed at **1080 × 1920 px, 9:16**. Safe area: at least 64 px left/right and 72 px top/bottom. Important text, source labels and numbers must remain inside the safe area.

Recommended deterministic order:

1. E.X MARKET RADAR / 高雄房市快報 / Kaohsiung Housing Brief
2. Report date and `PARTIAL LIVE` status
3. 今日一句
4. 今日 3 大重點
5. 市場溫度
6. One primary chart, preferably MOI 區域實價登錄案件數比較
7. MOI core transaction fact and CBC finance observation
8. Two or three Live Observations
9. Source summary, timing fields and disclaimer
10. E.X CREATOR STUDIO footer

PNG must not include all districts, all news, or the complete methodology. The primary chart label must say `實價登錄案件數`; it must never say `買氣排名`, `熱門區排名` or `最熱行政區`.

Typography tokens are defined in `exportTokens.ts`: brand, report title, key take, section title, metric, body, source and disclaimer. They are explicit export values and do not depend on a browser viewport.

## PDF v1

PDF is a complete reading / client explanation / owner briefing / archive format. The page model is **A4 portrait**, with a normal range of four to six pages; pages are not padded only to reach a number.

Suggested page flow:

- P1: Cover, edition date, coverage summary, 今日一句 and `PARTIAL LIVE`.
- P2: 今日 3 大重點, 市場溫度 and Data Coverage.
- P3: MOI valid registered transaction count, period, leading-district chart and the `案件數 ≠ 即時買氣` explanation.
- P4: CBC mortgage rate, period, change in percentage points, amount and source.
- P5: Public charts, market signals and selected daily signals.
- P6 (or the final page): 3 key sentences, source metadata, short methodology and disclaimer.

The PDF is not a PNG wrapped in a PDF container. It has an A4-specific layout and may include a full district appendix when a later product decision requires it. Full methodology remains on the website and in `docs/`; the report carries only a short summary.

## Naming and bundle

ASCII filenames are deterministic:

- `EX-Market-Radar-Kaohsiung-YYYY-MM-DD.png`
- `EX-Market-Radar-Kaohsiung-YYYY-MM-DD.pdf`

`MarketRadarExportBundle` binds both files to one `reportId`, one `generatedAt` and one `exportVersion`. A Free Credit consumes one bundle, not one PNG plus one PDF. Monthly NT$40 and Annual NT$360 affect future access only; they do not change report content in this phase.

`MARKET_RADAR_EXPORT_VERSION` is currently `1.0.0`. A layout contract change may bump it to `1.1.0`; the same report edition may have multiple export versions.

## Eligibility and safety gates

`getMarketRadarExportEligibility()` requires a valid snapshot, a report identity/date, a disclaimer and at least one non-Mock official source with complete publication, period, retrieval and verification metadata. Invalid snapshots return `canGeneratePng = false` and `canGeneratePdf = false` with safe warnings.

Eligibility is intentionally independent of payment, Auth and quarterly credit state. No Phase 2D-1B.0 function grants access, decrements a credit or exposes a file URL.

## Source presentation

The source section must show source name, publisher, source type, publication date, statistical period, retrieval time and verification time when available. Source fields are never collapsed into one generic “official” label. Mock sources are shown as `Mock Source / 目前為資料架構展示`; only a non-Mock source with a confirmed URL may become an external link with `target="_blank"` and `rel="noopener noreferrer"`.

## Disclaimer and fixture handling

Every export includes:

`Market Radar 解讀係依公開資料整理之分析，不代表原始資料來源立場，亦不構成投資或交易建議。`

It also states that real-price registration has a reporting / disclosure delay. Fixture sections retain `fixture` / `isMock` labels. A Fixture 今日一句 must not be visually or semantically promoted to a Live Key Take.

## Rendering and print safety

The first implementation path is a deterministic HTML/CSS report layout reused by both renderers, with a dedicated A4 print layout rather than a browser screenshot. `@media print` rules are scoped to `.market-radar-export` so the existing on-screen Market Radar page is unaffected. Export charts are static: no hover, tooltip or animation is required.

The report component boundary is reserved under `src/components/market-radar/report/` for future `Header`, `KeyTake`, `Highlights`, `Temperature`, `MoiSection`, `CbcSection`, `Sources` and `Disclaimer` components. No public route or download component is added in this phase.

Decorative imagery, if ever added, may come from an image generator, but all dates, rates, amounts, counts, source labels and report text must be emitted by the deterministic renderer.

## Future data flow

`Official Facts → Structured Analysis → Report Snapshot → Web / PNG Renderer / PDF Renderer`.

The existing Free / Pro rule remains: Free receives one natural-quarter full-report bundle; Pro receives the same report content during an active subscription. Entitlement and payment remain outside this specification.
