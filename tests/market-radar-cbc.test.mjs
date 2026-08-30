import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildCbcLiveOutput,
  normalizeCbcRows,
  parseCbcXlsx,
  parseCbcPeriod,
  parseMortgageAmount,
  parseMortgageRate,
} from "../scripts/market-radar/import-cbc-housing-finance.mjs";

const sourceConfig = await readFile(new URL("../src/lib/market-radar/sources/cbc-housing-finance.ts", import.meta.url), "utf8");
const loader = await readFile(new URL("../src/lib/market-radar/loadMarketRadarCbcData.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/components/MarketRadarPage.tsx", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../src/app/market-radar/page.tsx", import.meta.url), "utf8");
const methodology = await readFile(new URL("../docs/market-radar/cbc-housing-finance-methodology.md", import.meta.url), "utf8");
const officialWorkbook = new URL("../data/market-radar/raw/cbc/cbc-115-07.xlsx", import.meta.url);

const normalized = normalizeCbcRows([
  { rowNumber: 1, values: ["115 6", "57974", "2.299"] },
  { rowNumber: 2, values: ["7", "69109", "2.290"] },
  { rowNumber: 3, values: ["115年7月", "69109", "2.290"] },
  { rowNumber: 4, values: ["115 13", "50000", "2.3"] },
  { rowNumber: 5, values: ["115 8", "invalid", "2.1"] },
  { rowNumber: 6, values: ["115 9", "50000", "21"] },
], { sourcePublishedAt: "2026-08-21T00:00:00+08:00" });

test("CBC source config is Tier 1 official, primary and monthly", () => {
  for (const term of ["cbc-housing-finance", "中央銀行", "priority: \"official\"", "isPrimarySource: true", "expectedUpdateFrequency: \"monthly\"", "sourcePageUrl", "downloadUrl"]) assert.ok(sourceConfig.includes(term));
});

test("CBC period and numeric parsers preserve official monthly and unit semantics", () => {
  assert.deepEqual(parseCbcPeriod("115年7月"), { period: "2026-07", rocYear: 115 });
  assert.deepEqual(parseCbcPeriod("115 7"), { period: "2026-07", rocYear: 115 });
  assert.deepEqual(parseCbcPeriod("7", 115), { period: "2026-07", rocYear: 115 });
  assert.deepEqual(parseCbcPeriod("2026/7"), { period: "2026-07", rocYear: 115 });
  assert.equal(parseCbcPeriod("115年13月"), undefined);
  assert.equal(parseMortgageRate("2.185%"), 2.185);
  assert.equal(parseMortgageRate("21"), undefined);
  assert.equal(parseMortgageAmount("69,109"), 69109);
  assert.equal(parseMortgageAmount("-1"), undefined);
});

test("CBC XLSX parser can read the retained official workbook when it is available locally", { skip: !existsSync(officialWorkbook) }, async () => {
  const rows = parseCbcXlsx(await readFile(officialWorkbook));
  assert.ok(rows.length > 200);
  assert.ok(rows.some((row) => String(row.values[0]).trim() === "7" && row.values[1] === "69109" && Number(row.values[2]) === 2.29));
});

test("CBC normalizer rejects invalid records, de-duplicates periods and sorts history", () => {
  assert.equal(normalized.records.length, 2);
  assert.deepEqual(normalized.records.map((record) => record.period), ["2026-06", "2026-07"]);
  assert.deepEqual(normalized.records[1].unit, { mortgageRate: "percent", newMortgageAmount: "million-twd" });
  assert.equal(normalized.records[1].dataPeriodStart, "2026-07-01");
  assert.equal(normalized.records[1].dataPeriodEnd, "2026-07-31");
  assert.equal(normalized.quality.duplicateRows, 1);
  assert.equal(normalized.quality.missingPeriod, 1);
  assert.equal(normalized.quality.invalidAmount, 1);
  assert.equal(normalized.quality.invalidRate, 1);
});

test("CBC live output retains numeric facts and measures rate changes in percentage points", () => {
  const live = buildCbcLiveOutput(normalized, { generatedAt: "2026-08-31T00:00:00Z", sourcePublishedAt: "2026-08-21T00:00:00+08:00", verifiedAt: "2026-08-31T00:00:00+08:00" });
  assert.equal(live.status, "live");
  assert.equal(live.source.isMock, false);
  assert.equal(live.latest.period, "2026-07");
  assert.equal(live.latest.mortgageRate, 2.29);
  assert.equal(live.latest.newMortgageAmount, 69109);
  assert.equal(live.latest.mortgageRateChangePercentagePoints, -0.009);
  assert.equal(live.history.length, 2);
});

test("CBC loader and Finance Signal fail safely without pretending fixture data is live", () => {
  for (const term of ["loadMarketRadarCbcData", "房貸資料更新中", "status: \"updating\"", "existsSync", "isCbcLiveData"]) assert.ok(loader.includes(term));
  for (const term of ["FinanceSignal", "FINANCE SIGNAL", "房貸觀察", "官方資料 · LIVE", "mortgageRateChangePercentagePoints", "固定模板式"]) assert.ok(pageSource.includes(term));
  assert.match(routeSource, /loadMarketRadarCbcData/);
});

test("CBC methodology records source integrity and does not use LLM analysis", () => {
  for (const term of ["中央銀行", "年息百分比率", "新台幣百萬元", "百分點", "不使用 LLM", "Fact 與 Analysis", "資料期間"]) assert.ok(methodology.includes(term));
});
