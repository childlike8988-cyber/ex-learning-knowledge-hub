import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "../node_modules/typescript/lib/typescript.js";

const sourcePath = new URL("../src/lib/market-radar/analysis/buildMarketRadarAnalysis.ts", import.meta.url);
const analysisSource = await readFile(sourcePath, "utf8");
const comparisonSource = await readFile(new URL("../src/lib/market-radar/moiHistoricalComparison.ts", import.meta.url), "utf8");
const comparisonCompiled = ts.transpileModule(comparisonSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const comparisonUrl = `data:text/javascript;base64,${Buffer.from(comparisonCompiled).toString("base64")}`;
const compiled = ts.transpileModule(analysisSource.replace('from "@/lib/market-radar/moiHistoricalComparison"', `from "${comparisonUrl}"`), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { buildMarketRadarAnalysis, MARKET_RADAR_ANALYSIS_RULE_VERSION, marketRadarAnalysisDisclaimer } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const pageSource = await readFile(new URL("../src/components/MarketRadarPage.tsx", import.meta.url), "utf8");
const drawerSource = await readFile(new URL("../src/components/MarketRadarDetailDrawer.tsx", import.meta.url), "utf8");
const documentation = await readFile(new URL("../docs/market-radar/multi-source-analysis.md", import.meta.url), "utf8");

const source = (id, publisher) => ({ id, name: `${publisher} 官方資料`, publisher, type: "government", priority: "official", url: "https://example.invalid/official", publishedAt: "2026-08-21T00:00:00+08:00", dataPeriodStart: "2026-07-01", dataPeriodEnd: "2026-07-31", verifiedAt: "2026-08-31T00:00:00+08:00", retrievedAt: "2026-08-31T00:00:00+08:00", expectedUpdateFrequency: "monthly", isPrimarySource: true, isMock: false });
const moiSource = source("moi-real-price-sales", "內政部地政司");
const cbcSource = source("cbc-housing-finance", "中央銀行");

function moiLive({ current = 100, previous } = {}) {
  return { status: "live", dataStatus: "live", sourceId: "moi-real-price-sales", generatedAt: "2026-08-31T00:00:00Z", sourcePublishedAt: "2026-08-21T00:00:00+08:00", dataPeriodStart: "2026-07-01", dataPeriodEnd: "2026-07-31", verifiedAt: "2026-08-31T00:00:00+08:00", retrievedAt: "2026-08-31T00:00:00+08:00", methodologyVersion: "moi-real-price-methodology-v1", source: moiSource, freshness: { status: "normal", label: "官方資料", expectedUpdateFrequency: "irregular" }, metrics: { transactionCount: current, ...(previous === undefined ? {} : { previousTransactionCount: previous }), districtTransactionCounts: [] }, quality: { acceptedRows: current, rejectedRows: 0, duplicateRows: 0, districtCount: 1 }, methodology: { transactionCountDefinition: "record", kaohsiungFilter: "高雄市", excludedSpecialTransactions: false, notes: [] } };
}

function moiHistory(previousCount = 100, previousStart = "2026-06-01", previousEnd = "2026-06-30") {
  return { status: "live", sourceId: "moi-real-price-sales", methodologyVersion: "moi-real-price-methodology-v1", periods: [{ periodId: `moi-${previousStart}-${previousEnd}`, status: "live", sourceId: "moi-real-price-sales", sourcePublishedAt: "2026-07-01T00:00:00+08:00", dataPeriodStart: previousStart, dataPeriodEnd: previousEnd, dayCount: 30, transactionCount: previousCount, districtTransactionCounts: [], generatedAt: "2026-08-01T00:00:00Z", verifiedAt: "2026-08-01T00:00:00Z", retrievedAt: "2026-08-01T00:00:00Z", methodologyVersion: "moi-real-price-methodology-v1", schemaVersion: "moi-real-price-csv-v1", scope: "kaohsiung", transactionType: "sale", quality: { acceptedRows: previousCount, rejectedRows: 0, duplicateRows: 0, districtCount: 1 } }] };
}

function moiUpdating() {
  return { status: "updating", dataStatus: "updating", sourceId: "moi-real-price-sales", freshness: { status: "aging", label: "更新中", expectedUpdateFrequency: "irregular" }, metrics: { districtTransactionCounts: [] }, methodology: { transactionCountDefinition: "", kaohsiungFilter: "", excludedSpecialTransactions: false, notes: [] } };
}

function cbcLive(change = -0.009) {
  return { status: "live", dataStatus: "live", sourceId: "cbc-housing-finance", generatedAt: "2026-08-31T00:00:00Z", sourcePublishedAt: "2026-08-21T00:00:00+08:00", dataPeriodStart: "2026-07-01", dataPeriodEnd: "2026-07-31", verifiedAt: "2026-08-31T00:00:00+08:00", source: cbcSource, freshness: { status: "normal", label: "官方資料", expectedUpdateFrequency: "monthly" }, latest: { period: "2026-07", mortgageRate: 2.29, newMortgageAmount: 69109, mortgageRateChangePercentagePoints: change }, history: [], methodology: { notes: [] } };
}

function cbcUpdating() {
  return { status: "updating", dataStatus: "updating", sourceId: "cbc-housing-finance", freshness: { status: "aging", label: "更新中", expectedUpdateFrequency: "monthly" }, history: [], methodology: { notes: [] } };
}

function signal(result, id) { return result.signals.find((item) => item.id === id); }

test("CBC rate up, down, flat and threshold use percentage points", () => {
  assert.equal(signal(buildMarketRadarAnalysis(moiUpdating(), cbcLive(0.006)), "financing-environment").direction, "up");
  assert.equal(signal(buildMarketRadarAnalysis(moiUpdating(), cbcLive(-0.006)), "financing-environment").direction, "down");
  assert.equal(signal(buildMarketRadarAnalysis(moiUpdating(), cbcLive(0.005)), "financing-environment").direction, "flat");
});

test("MOI unavailable does not manufacture transaction direction", () => {
  const result = buildMarketRadarAnalysis(moiUpdating(), cbcLive());
  assert.equal(signal(result, "transaction-activity").status, "unavailable");
  assert.equal(signal(result, "transaction-activity").direction, "unavailable");
});

test("single live source yields a partial market temperature", () => {
  const cbcOnly = buildMarketRadarAnalysis(moiUpdating(), cbcLive());
  const moiOnly = buildMarketRadarAnalysis(moiLive(), cbcUpdating());
  assert.equal(cbcOnly.marketTemperature.dataStatus, "partial");
  assert.equal(moiOnly.marketTemperature.dataStatus, "partial");
  assert.match(cbcOnly.marketTemperature.description, /融資環境/);
});

test("missing MOI history does not claim a fake transaction trend", () => {
  const result = buildMarketRadarAnalysis(moiLive(), cbcLive());
  assert.equal(signal(result, "transaction-activity").status, "live");
  assert.equal(signal(result, "transaction-activity").direction, "unavailable");
  assert.equal(signal(result, "financing-environment").status, "live");
  assert.equal(signal(result, "price-momentum").status, "unavailable");
  assert.equal(result.marketTemperature.dataStatus, "partial");
  assert.match(result.marketTemperature.description, /僅有一期資料/);
  assert.equal(result.dailyKeyTake, undefined);
});

test("price momentum remains unavailable without a formal price series", () => {
  const result = buildMarketRadarAnalysis(moiUpdating(), cbcLive());
  assert.equal(signal(result, "price-momentum").status, "unavailable");
  assert.match(signal(result, "price-momentum").analysis.summary, /價格序列/);
});

test("two official live sources can produce a deterministic combined key take", () => {
  const result = buildMarketRadarAnalysis(moiLive({ current: 90, previous: 100 }), cbcLive(-0.006), moiHistory(100));
  assert.equal(result.dataCoverage.moi, "live");
  assert.equal(result.dataCoverage.cbc, "live");
  assert.equal(result.dailyKeyTake?.dataStatus, "live");
  assert.match(result.dailyKeyTake?.text ?? "", /成交活動仍偏弱/);
  assert.deepEqual(result.dailyKeyTake?.basisSignalIds, ["transaction-activity", "financing-environment"]);
});

test("combined analysis preserves facts, sources and rule version", () => {
  const result = buildMarketRadarAnalysis(moiLive({ current: 90, previous: 100 }), cbcLive(0.006), moiHistory(100));
  assert.equal(result.ruleVersion, MARKET_RADAR_ANALYSIS_RULE_VERSION);
  assert.ok(signal(result, "transaction-activity").factIds.length > 0);
  assert.deepEqual(signal(result, "financing-environment").sourceIds, ["cbc-housing-finance"]);
  assert.equal(result.marketTemperature.detail.sources.length, 2);
});

test("historical MOI baseline enables transaction direction while keeping Market Temperature partial", () => {
  const result = buildMarketRadarAnalysis(moiLive({ current: 120 }), cbcLive(-0.009), moiHistory(100));
  const transaction = signal(result, "transaction-activity");
  assert.equal(transaction.direction, "up");
  assert.equal(transaction.confidence, "medium");
  assert.equal(result.dataCoverage.moiHistory, "ready");
  assert.equal(result.dataCoverage.priceMomentum, "waiting");
  assert.equal(result.marketTemperature.dataStatus, "partial");
  assert.equal(result.dailyKeyTake?.dataStatus, "live");
  assert.equal(result.ruleVersion, "1.1.0");
});

test("missing historical MOI input keeps the official latest period live without a fabricated direction", () => {
  const result = buildMarketRadarAnalysis(moiLive({ current: 110 }), cbcLive(-0.009));
  assert.equal(signal(result, "transaction-activity").status, "live");
  assert.equal(signal(result, "transaction-activity").direction, "unavailable");
  assert.equal(result.dataCoverage.moiHistory, "waiting");
  assert.equal(result.marketTemperature.dataStatus, "partial");
});

test("partial CBC analysis keeps the fixture key take in the page and adds an observation", () => {
  for (const term of ["analysis.dailyKeyTake ?", "CBC LIVE OBSERVATION", "financeObservation", "dataStatus === \"live\" ? \"LIVE BASIS\" : \"FIXTURE\""]) assert.ok(pageSource.includes(term));
});

test("drawer keeps facts and each source's own metadata separate", () => {
  for (const term of ["detail.facts.map", "detail.sources.map", "發布日期、資料期間、驗證時間", "亦不構成投資或交易建議"]) assert.ok(drawerSource.includes(term));
});

test("documentation preserves fact-analysis separation, partial live and restricted future LLM role", () => {
  for (const term of ["Fact versus Analysis", "Partial Live", "ruleVersion", "LLM 不可修改 numeric facts", "correlation 不代表 causation", "不構成投資或交易建議"]) assert.ok(documentation.includes(term));
  assert.match(marketRadarAnalysisDisclaimer, /不構成投資或交易建議/);
});
