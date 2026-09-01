import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const typesSource = await read("../src/lib/market-radar/report/types.ts");
const builderSource = await read("../src/lib/market-radar/report/buildMarketRadarReportSnapshot.ts");
const downloadContentSource = await read("../src/lib/market-radar/report/buildMarketRadarDownloadContent.ts");
const snapshotLoaderSource = await read("../src/lib/market-radar/report/loadMarketRadarReportSnapshot.ts");
const tokenSource = await read("../src/lib/market-radar/report/exportTokens.ts");
const spec = await read("../docs/market-radar/report-export-spec.md");
const printStyles = await read("../src/app/globals.css");
const packageSource = await read("../package.json");
const sample = JSON.parse(await read("./fixtures/market-radar/report-snapshot.json"));

test("snapshot contract has explicit report, coverage, source, fact and analysis boundaries", () => {
  for (const term of ["MarketRadarReportSnapshot", "reportId", "reportDate", "generatedAt", "dataCoverage", "keyTake", "highlights", "marketTemperature", "liveObservations", "moi", "cbc", "signals", "charts", "news", "keySentences", "sources", "methodology", "disclaimer", "branding", "exportVersion"]) assert.match(typesSource, new RegExp(term));
  assert.match(typesSource, /facts: readonly MarketRadarFact\[\]/);
  assert.match(typesSource, /analysis\?: MarketRadarAnalysis/);
  for (const term of ["MarketRadarPdfPage", "MarketRadarPngExportSpec", "MarketRadarPdfExportSpec"]) assert.match(typesSource, new RegExp(term));
});

test("report identity and source periods stay deterministic and separate", () => {
  assert.match(builderSource, /createMarketRadarReportId/);
  assert.match(builderSource, /market-radar-kaohsiung-\$\{isoReportDate\(reportDate\)\}/);
  assert.match(builderSource, /reportDate/);
  assert.match(builderSource, /period\(moi\.dataPeriodStart, moi\.dataPeriodEnd\)/);
  assert.match(builderSource, /period\(cbc\.dataPeriodStart, cbc\.dataPeriodEnd, cbc\.latest/);
  assert.equal(sample.reportId, "market-radar-kaohsiung-2026-09-01");
  assert.notEqual(sample.reportDate, sample.moi.dataPeriod.start);
  assert.notEqual(sample.reportDate, sample.cbc.dataPeriod.label);
});

test("current sample is honestly partial-live with independent coverage", () => {
  assert.equal(sample.status, "partial-live");
  assert.deepEqual(sample.dataCoverage, { moiLatest: "live", moiHistorical: "waiting", cbc: "live", priceMomentum: "waiting" });
  assert.equal(sample.keyTake.status, "fixture");
  assert.equal(sample.keyTake.isMock, true);
  assert.equal(sample.moi.status, "live");
  assert.equal(sample.cbc.status, "live");
});

test("official source metadata is complete and facts remain source referenced", () => {
  const official = sample.sources.filter((source) => source.isMock === false);
  assert.equal(official.length, 2);
  for (const source of official) for (const field of ["id", "publisher", "name", "publishedAt", "dataPeriodStart", "dataPeriodEnd", "retrievedAt", "verifiedAt"]) assert.ok(source[field], `${source.id} missing ${field}`);
  assert.equal(sample.moi.facts[0].value, 1040);
  assert.deepEqual(sample.moi.facts[0].sourceIds, ["moi-real-price-sales"]);
  assert.deepEqual(sample.cbc.facts[0].sourceIds, ["cbc-housing-finance"]);
});

test("snapshot builder provides live observations without changing numeric facts", () => {
  for (const term of ["buildLiveObservations", "內政部實價登錄資料已接入", "中央銀行最新月資料", "factIds", "sourceIds", "isMock: false"]) assert.match(builderSource, new RegExp(term));
  assert.equal(sample.liveObservations.length, 0);
  for (const term of ["loadMarketRadarReport", "loadMarketRadarLiveData", "loadMarketRadarCbcData", "loadMarketRadarAnalysis", "buildMarketRadarReportSnapshot"]) assert.match(snapshotLoaderSource, new RegExp(term));
});

test("PNG share cards and PDF naming stay deterministic while card count remains variable", () => {
  for (const term of ["MarketRadarExportBundle", "shareCards", "pdfFileName", "generatedAt", "exportVersion"]) assert.match(typesSource + builderSource, new RegExp(term));
  assert.ok(builderSource.includes("EX-Market-Radar-Kaohsiung-${snapshot.reportDate}-${card.id}.png"));
  assert.ok(builderSource.includes("pdfFileName: `EX-Market-Radar-Kaohsiung-${snapshot.reportDate}.pdf`"));
  assert.equal(sample.exportVersion, "1.0.0");
  assert.equal(sample.exportEligibility.canGeneratePng, true);
  assert.equal(sample.exportEligibility.canGeneratePdf, true);
  for (const term of ["share-01", "share-02", "share-03", "market-overview", "data-and-context", "client-guidance"]) assert.match(downloadContentSource, new RegExp(term));
});

test("PNG and PDF specs preserve dimensions, safe area, A4 and static rendering", () => {
  assert.match(tokenSource, /width: 1080/);
  assert.match(tokenSource, /height: 1920/);
  assert.match(tokenSource, /safeInsetX: 64/);
  assert.match(tokenSource, /safeInsetY: 72/);
  assert.match(tokenSource, /format: "A4"/);
  assert.match(tokenSource, /MARKET_RADAR_PNG_EXPORT_SPEC/);
  assert.match(tokenSource, /MARKET_RADAR_PDF_EXPORT_SPEC/);
  assert.match(tokenSource, /pageCount: "content-driven"/);
  for (const term of ["1080 × 1920", "9:16", "A4 portrait", "static", "hover", "tooltip", "animation", "PARTIAL LIVE"]) assert.match(spec, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(printStyles, /@media print/);
  assert.match(printStyles, /\.market-radar-export/);
});

test("Free and Pro share one report content contract and eligibility is not entitlement", () => {
  for (const term of ["one bundle", "Monthly NT\$40", "Annual NT\$360", "Historical WAITING", "does not expose a download API", "No Phase 2D-1B.0 function grants access"]) assert.match(spec, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(typesSource, /MarketRadarExportEligibility/);
  assert.match(builderSource, /canGeneratePng/);
  assert.match(builderSource, /canGeneratePdf/);
});

test("export test is part of the existing regression suite", () => {
  assert.match(packageSource, /tests\/market-radar-report-export\.test\.mjs/);
});
