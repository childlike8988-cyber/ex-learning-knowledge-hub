import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import ts from "../node_modules/typescript/lib/typescript.js";
import {
  buildLiveOutput,
  normalizeMoiCsv,
  parseRocDate,
  pricePerSquareMeterToTenThousandPerPing,
  squareMetersToPing,
  validateMoiQualityGate,
} from "../scripts/market-radar/import-moi-real-price.mjs";

const historySource = await readFile(new URL("../src/lib/market-radar/moiHistoricalComparison.ts", import.meta.url), "utf8");
const historyCompiled = ts.transpileModule(historySource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { buildMoiHistoricalPeriod, compareMoiPeriods, findComparablePreviousPeriod, MOI_TRANSACTION_ACTIVITY_FLAT_THRESHOLD_PERCENT } = await import(`data:text/javascript;base64,${Buffer.from(historyCompiled).toString("base64")}`);

function period({ id, start, end, count, districts = [{ district: "左營區", transactionCount: count }] }) {
  return buildMoiHistoricalPeriod({ periodId: id, sourceId: "moi-real-price-sales", sourcePublishedAt: "2026-08-21", dataPeriodStart: start, dataPeriodEnd: end, transactionCount: count, districtTransactionCounts: districts, generatedAt: "2026-08-31T00:00:00Z", verifiedAt: "2026-08-31T00:00:00Z", retrievedAt: "2026-08-31T00:00:00Z", methodologyVersion: "moi-real-price-methodology-v1", schemaVersion: "moi-real-price-csv-v1", quality: { acceptedRows: count, rejectedRows: 0, duplicateRows: 0, districtCount: districts.length } });
}

const execFileAsync = promisify(execFile);
const fixturePath = new URL("./fixtures/moi-kaohsiung-sample.csv", import.meta.url);
const csv = await readFile(fixturePath, "utf8");
const normalized = normalizeMoiCsv(csv);

test("MOI source pipeline normalizes only verified Kaohsiung records and validates ROC dates", () => {
  assert.equal(parseRocDate("1150820"), "2026-08-20");
  assert.equal(parseRocDate("115/08/19"), "2026-08-19");
  assert.equal(parseRocDate("20260820"), "2026-08-20");
  assert.equal(parseRocDate("1151332"), undefined);
  assert.equal(normalized.metrics.transactionCount, 3);
  assert.deepEqual(normalized.metrics.districtTransactionCounts.map((item) => item.district).sort(), ["左營區", "楠梓區", "鳳山區"].sort());
  assert.ok(normalized.metrics.districtTransactionCounts.every((item) => item.transactionCount === 1));
  assert.equal(normalized.quality.rawRows, 7);
  assert.equal(normalized.quality.rejectedRows, 2);
  assert.equal(normalized.quality.duplicateRows, 1);
  assert.equal(normalized.quality.missingDistrict, 1);
  assert.equal(normalized.quality.missingTransactionDate, 1);
  assert.ok(normalized.transactions.every((transaction) => transaction.isLive && transaction.rawSourceId === "moi-real-price-sales"));
});

test("MOI output has official source metadata, live status and deterministic conversion utilities", () => {
  const output = buildLiveOutput(normalized, {
    generatedAt: "2026-08-30T10:00:00.000Z",
    sourcePublishedAt: "2026-08-29T00:00:00.000Z",
    dataPeriodStart: "2026-08-01",
    dataPeriodEnd: "2026-08-20",
    retrievedAt: "2026-08-30T09:00:00.000Z",
    verifiedAt: "2026-08-30T10:00:00.000Z",
  });
  assert.equal(output.status, "live");
  assert.equal(output.dataStatus, "live");
  assert.equal(output.source.priority, "official");
  assert.equal(output.source.isPrimarySource, true);
  assert.equal(output.source.isMock, false);
  assert.equal(output.retrievedAt, "2026-08-30T09:00:00.000Z");
  assert.equal(output.methodologyVersion, "moi-real-price-methodology-v1");
  assert.equal(output.quality.acceptedRows, 3);
  assert.equal(output.metrics.transactionCount, 3);
  assert.match(output.methodology.transactionCountDefinition, /去重/);
  assert.equal(squareMetersToPing(3.305785), 1);
  assert.equal(pricePerSquareMeterToTenThousandPerPing(100000), 33.05785);
});

test("MOI historical comparison uses raw counts only for equal-day official periods", () => {
  const previous = period({ id: "previous", start: "2026-07-21", end: "2026-07-30", count: 100 });
  const current = period({ id: "current", start: "2026-08-01", end: "2026-08-10", count: 106 });
  const comparison = compareMoiPeriods(current, previous);
  assert.equal(comparison.isComparable, true);
  assert.equal(comparison.comparisonMethod, "raw-count");
  assert.equal(comparison.direction, "up");
  assert.equal(comparison.confidence, "high");
  assert.equal(comparison.changePercent, 6);
});

test("MOI historical comparison normalizes unequal-day periods and protects zero baselines", () => {
  const previous = period({ id: "previous", start: "2026-07-21", end: "2026-07-31", count: 110, districts: [{ district: "左營區", transactionCount: 0 }] });
  const current = period({ id: "current", start: "2026-08-01", end: "2026-08-10", count: 120, districts: [{ district: "左營區", transactionCount: 12 }] });
  const comparison = compareMoiPeriods(current, previous);
  assert.equal(comparison.comparisonMethod, "daily-normalized");
  assert.equal(comparison.confidence, "medium");
  assert.equal(comparison.direction, "up");
  assert.equal(comparison.districtTransactionChanges[0].newActivity, true);
  assert.equal(comparison.districtTransactionChanges[0].changePercent, null);
});

test("MOI historical comparison rejects schema mismatch and selects the closest valid predecessor", () => {
  const previous = period({ id: "previous", start: "2026-07-21", end: "2026-07-30", count: 100 });
  const incompatible = { ...previous, periodId: "incompatible", dataPeriodEnd: "2026-07-31", schemaVersion: "other-schema" };
  const current = period({ id: "current", start: "2026-08-01", end: "2026-08-10", count: 102 });
  assert.equal(compareMoiPeriods(current, incompatible).isComparable, false);
  const found = findComparablePreviousPeriod(current, { status: "live", sourceId: "moi-real-price-sales", methodologyVersion: "moi-real-price-methodology-v1", periods: [previous, incompatible] });
  assert.equal(found.previousPeriodId, "previous");
  assert.equal(MOI_TRANSACTION_ACTIVITY_FLAT_THRESHOLD_PERCENT, 3);
});

test("MOI importer recognizes the official bilingual schema row and keeps a Kaohsiung-only file deterministic", () => {
  const actualSchema = [
    "鄉鎮市區,交易標的,交易年月日,總價元,編號",
    "The villages and towns urban district,transaction sign,transaction year month and day,total price NTD,serial number",
    "橋頭區,房地(土地+建物),1150803,12000000,MOI-001",
  ].join("\n");
  const imported = normalizeMoiCsv(actualSchema, { countyFile: true });
  assert.equal(imported.quality.rawRows, 1);
  assert.equal(imported.quality.acceptedRows, 1);
  assert.equal(imported.quality.rejectedRows, 0);
  assert.equal(imported.metrics.transactionCount, 1);
  assert.equal(imported.metrics.districtTransactionCounts[0].district, "橋頭區");
});

test("MOI quality gate requires usable rows, district coverage, valid data period and complete source metadata", () => {
  const accepted = validateMoiQualityGate({ acceptedRows: 1, districtCount: 1, missingDistrict: 0, rawRows: 1 }, { sourcePublishedAt: "2026-08-21", retrievedAt: "2026-08-31T04:31:23.000Z", verifiedAt: "2026-08-31T04:34:00.000Z", dataPeriodStart: "2026-08-01", dataPeriodEnd: "2026-08-10" });
  const rejected = validateMoiQualityGate({ acceptedRows: 0, districtCount: 0, missingDistrict: 1, rawRows: 1 }, { sourcePublishedAt: "", retrievedAt: "", verifiedAt: "", dataPeriodStart: "2026-08-10", dataPeriodEnd: "2026-08-01" });
  assert.equal(accepted.passed, true);
  assert.equal(rejected.passed, false);
  assert.equal(rejected.checks.acceptedRows, false);
  assert.equal(rejected.checks.validDataPeriod, false);
});

test("the checked-in MOI live slice is official, reconciled and ready for static output", async () => {
  const livePath = fileURLToPath(new URL("../public/data/market-radar/live/moi-real-price-latest.json", import.meta.url));
  const manifestPath = fileURLToPath(new URL("../data/market-radar/raw/moi/source-manifest.json", import.meta.url));
  assert.equal(existsSync(livePath), true);
  const live = JSON.parse(await readFile(livePath, "utf8"));
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(live.status, "live");
  assert.equal(live.sourceId, "moi-real-price-sales");
  assert.equal(live.source.isMock, false);
  assert.equal(manifest.scope, "kaohsiung");
  assert.equal(manifest.transactionType, "sale");
  assert.equal(manifest.officialFileName, "E_lvr_land_A.csv");
  assert.equal(live.metrics.districtTransactionCounts.reduce((sum, row) => sum + row.transactionCount, 0), live.metrics.transactionCount);
  assert.deepEqual(live.metrics.districtTransactionCounts, [...live.metrics.districtTransactionCounts].sort((left, right) => right.transactionCount - left.transactionCount || left.district.localeCompare(right.district, "zh-Hant")));
  for (const field of ["sourcePublishedAt", "dataPeriodStart", "dataPeriodEnd", "verifiedAt", "retrievedAt", "methodologyVersion"]) assert.ok(live[field]);
  const page = await readFile(new URL("../src/components/MarketRadarPage.tsx", import.meta.url), "utf8");
  assert.ok(page.includes("MOI LIVE OBSERVATION"));
  assert.ok(page.includes("本期高雄有效買賣登錄案件共"));
});

test("the import command writes isolated processed and live JSON without changing the source file", async () => {
  const temp = await mkdtemp(join(tmpdir(), "market-radar-moi-"));
  const processed = join(temp, "processed");
  const live = join(temp, "moi-real-price-latest.json");
  const script = fileURLToPath(new URL("../scripts/market-radar/import-moi-real-price.mjs", import.meta.url));
  await execFileAsync(process.execPath, [script, fileURLToPath(fixturePath), "--source-published-at", "2026-08-29T00:00:00.000Z", "--data-period-start", "2026-08-01", "--data-period-end", "2026-08-20", "--verified-at", "2026-08-30T10:00:00.000Z", "--out-dir", processed, "--live-output", live]);
  const quality = JSON.parse(await readFile(join(processed, "moi-real-price-quality.json"), "utf8"));
  const liveOutput = JSON.parse(await readFile(live, "utf8"));
  assert.equal(quality.acceptedRows, 3);
  assert.equal(quality.duplicateRows, 1);
  assert.equal(liveOutput.status, "live");
  assert.equal(liveOutput.metrics.transactionCount, 3);
});

test("the historical import mode appends a normalized period without overwriting latest output", async () => {
  const temp = await mkdtemp(join(tmpdir(), "market-radar-moi-history-"));
  const processed = join(temp, "processed");
  const history = join(temp, "moi-real-price-history.json");
  const script = fileURLToPath(new URL("../scripts/market-radar/import-moi-real-price.mjs", import.meta.url));
  await execFileAsync(process.execPath, [script, fileURLToPath(fixturePath), "--source-published-at", "2026-08-11", "--data-period-start", "2026-07-21", "--data-period-end", "2026-07-31", "--verified-at", "2026-08-31T10:00:00.000Z", "--out-dir", processed, "--history-output", history, "--period-id", "moi-2026-07-21-2026-07-31", "--history-only"]);
  const output = JSON.parse(await readFile(history, "utf8"));
  assert.equal(output.periods.length, 1);
  assert.equal(output.periods[0].dayCount, 11);
  assert.equal(existsSync(join(temp, "moi-real-price-latest.json")), false);
});

test("Live loader declares an updating fallback when no validated live JSON exists", async () => {
  const loader = await readFile(new URL("../src/lib/market-radar/loadMarketRadarLiveData.ts", import.meta.url), "utf8");
  for (const term of ["loadMarketRadarLiveData", "existsSync", "status: \"updating\"", "官方資料更新中", "Live JSON 尚未產製"]) assert.ok(loader.includes(term));
});

test("MOI history loader safely returns no baseline for missing or invalid history", async () => {
  const loader = await readFile(new URL("../src/lib/market-radar/loadMarketRadarMoiHistory.ts", import.meta.url), "utf8");
  for (const term of ["loadMarketRadarMoiHistory", "moi-real-price-history.json", "status !== \"live\"", "periods.every(isPeriod)"]) assert.ok(loader.includes(term));
});
