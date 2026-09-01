# Market Radar Report Export Engine

## Download Content Layer Phase 1

The normal Market Radar web page remains a concise browsing surface. Downloads
are a separate, Snapshot-derived presentation layer: the same official facts,
coverage and rule-based analysis feed both surfaces, while the downloads add
source context, interpretation boundaries and client-facing communication notes.

### PNG share card bundle

Each bundle contains one to three standalone 1080 × 1920 PNG cards. The
current partial-live baseline has all three roles:

1. `share-01` — market overview: state, key indicators, top observations and
   a compact disclosure.
2. `share-02` — data and context: MOI/CBC facts, the district chart and
   interpretation limits.
3. `share-03` — client guidance: neutral buyer/seller discussion points and a
   watch-next list.

Cards are generated only when the required live facts exist. A WAITING source
is compressed into a status note and never expanded into empty filler. Fixture
key takes or editorial content always retain a `FIXTURE` label.

### PDF deep report

The A4 PDF is content-driven, not a fixed-page website printout. The current
baseline produces an executive-summary page, an official-data/context page and
a client-guidance/sources page. A future snapshot with insufficient data may
contain fewer sections; a richer valid snapshot may add pages up to the engine
validation limit. Every page remains sourced from the same Snapshot.

### Bundle metadata

`bundle.json` records the report identity, report type, Snapshot hash, export
and renderer versions, per-card role/filename/dimensions/checksum, plus PDF
metadata. Paths are filenames relative to the bundle only. It never records a
local absolute path, credential, entitlement or download URL.

### Truthfulness

`LIVE`, `PARTIAL LIVE`, `WAITING` and `FIXTURE` are presentation requirements,
not cosmetic labels. Download-specific wording is rule-based and cannot change
numeric facts, create a historical comparison, infer price momentum, or turn a
fixture into live analysis.

## Architecture

`MarketRadarReportSnapshot` is the only report-data input. The static internal preview route builds that snapshot at build time, serializes it as internal preview metadata, and renders either the PNG or PDF-specific React layout. The local CLI captures those layouts with Playwright Core and the installed Microsoft Edge runtime.

No renderer reads MOI or CBC JSON directly. Numeric facts, status labels, source metadata and Fixture disclosure are rendered from the same snapshot used by both export formats.

The deeper PDF may include existing editorial context and three key sentences only when each section is visibly marked `FIXTURE`; these sections never become Live analysis. `WAITING` remains a compact availability note rather than a substitute trend or price conclusion.

## Local generation

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\market-radar\export-report.ps1
```

The PowerShell wrapper runs a production static build first, then calls:

```powershell
node .\scripts\market-radar\export-report.mjs
```

Optional flags are `--dry-run`, `--png-only`, `--pdf-only`, `--output <relative-directory>`, `--report-date <snapshot-date>`, and `--overwrite`.

`--report-date` validates the immutable Snapshot date; it cannot relabel a report. The default output is `data/market-radar/exports/<reportId>/`.

## Renderer and validation

- `playwright-core` uses an already installed local Microsoft Edge executable. The project does not download a browser at export time.
- PNG is captured only from `.market-radar-export--png`, with device scale factor 1 and validated as a non-transparent 1080 × 1920 PNG.
- PDF is printed only from `.market-radar-export--pdf`, uses CSS `@page A4 portrait`, `printBackground`, and `preferCSSPageSize`. It remains DOM/PDF text rather than a PNG wrapped in PDF.
- Both files share a canonical SHA-256 `snapshotHash`. The bundle records export version, renderer version, file hashes, size, relative filenames, and PDF page geometry.

## Safety and failure handling

Exports are written to `data/market-radar/staging/export/` first. Validation passes before the staged directory is atomically renamed into the ignored final export directory. A failed file never appears as a final artifact. A PNG-only or PDF-only failure produces a `partial` bundle only when the other requested artifact passed.

An existing report directory is reused only when snapshot hash, export version, and renderer version all match. A different snapshot is never silently overwritten; `--overwrite` is an explicit local operator action.

`--dry-run` validates Snapshot eligibility, browser readiness and deterministic filenames without producing PNG or PDF output. Logs are written locally to `data/market-radar/logs/report-export-YYYY-MM-DD.log`; bundles never include absolute Windows paths, credentials or stack traces.

## Boundaries

Generated reports are ignored by Git and are not copied to `public/`. This engine has no download route, Auth, Free Credit deduction, subscription entitlement, payment integration, LLM generation, Git commit, or Git push. A later entitlement layer may consume `bundle.json` after authorization.
