import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/market-radar.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/components/MarketRadarPage.tsx", import.meta.url), "utf8");
const proSource = await readFile(new URL("../src/components/MarketRadarProSection.tsx", import.meta.url), "utf8");
const downloadSource = await readFile(new URL("../src/components/MarketRadarDownloadSection.tsx", import.meta.url), "utf8");
const entitlementSource = await readFile(new URL("../src/lib/market-radar/auth/entitlement.ts", import.meta.url), "utf8");
const quickNavigationSource = await readFile(new URL("../src/components/MarketRadarQuickNavigation.tsx", import.meta.url), "utf8");
const detailDrawerSource = await readFile(new URL("../src/components/MarketRadarDetailDrawer.tsx", import.meta.url), "utf8");
const stylesSource = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../src/app/market-radar/page.tsx", import.meta.url), "utf8");
const paymentDoc = await readFile(new URL("../docs/market-radar/payment-architecture.md", import.meta.url), "utf8");
const dataContractDoc = await readFile(new URL("../docs/market-radar/data-contract.md", import.meta.url), "utf8");
const loaderSource = await readFile(new URL("../src/lib/market-radar/loadMarketRadarReport.ts", import.meta.url), "utf8");
const fixtureSource = await readFile(new URL("../public/data/market-radar/2026-08-29.json", import.meta.url), "utf8");
const appDataSource = await readFile(new URL("../src/data/learning-apps.ts", import.meta.url), "utf8");
const fixture = JSON.parse(fixtureSource);

test("market radar keeps the quarterly Free credit and monthly / annual pricing centralized", () => {
  for (const term of ["MarketRadarFreePlan", "MarketRadarPricing", "freeQuarterlyDownloadsRemaining", "hasActiveMonthlySubscription", "hasActiveAnnualSubscription"]) assert.match(dataSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const term of ["\"monthlyPrice\": 40", "\"annualPrice\": 360", "\"downloadsPerQuarter\": 1", "\"includesPng\": true", "\"includesPdf\": true", "\"creditsCarryOver\": false", "\"2026-Q3\"", "\"PNG\", \"PDF\""]) assert.ok(fixtureSource.includes(term));
  assert.doesNotMatch(dataSource, /singlePrice/);
  assert.doesNotMatch(dataSource, /NT\$10/);
});

test("market radar route and report UI preserve the requested public sections", () => {
  for (const term of ["market-radar-hero__grid", "market-radar-hero__download", "market-key-take", "market-district-signals", "market-temperature", "market-public-charts", "market-updates", "market-key-sentences", "TODAY&apos;S KEY TAKE", "market-radar-daily-word__bookmark", "market-radar-daily-word__cityline", "今日一句", "今日市場溫度", "今日 3 大重點", "今天最值得知道的 3 句話", "今日快訊", "公開圖表"]) assert.ok(pageSource.includes(term));
  assert.ok(pageSource.indexOf('id="market-district-signals"') < pageSource.indexOf("<MarketTemperature"));
  assert.ok(pageSource.indexOf("<MarketTemperature") < pageSource.indexOf('id="market-public-charts"'));
  assert.ok(pageSource.indexOf('id="market-public-charts"') < pageSource.indexOf('id="market-updates"'));
  assert.ok(pageSource.indexOf('id="market-updates"') < pageSource.indexOf('id="market-key-sentences"'));
  assert.match(routeSource, /MarketRadarPage/);
  assert.match(routeSource, /loadMarketRadarLiveData/);
  assert.match(routeSource, /loadMarketRadarCbcData/);
  assert.match(pageSource, /LiveDistrictTransactionChart/);
  assert.match(pageSource, /FinanceSignal/);
  assert.match(pageSource, /官方資料 · LIVE/);
});

test("market radar offers semantic desktop and mobile quick navigation", () => {
  for (const term of ["QUICK NAVIGATION", "快速索引", "快速導覽", "aria-expanded", "aria-controls", "market-pro"]) assert.ok(quickNavigationSource.includes(term));
});

test("market radar models Guest, report-level Free and Pro download states without a real download", () => {
  for (const term of ["guest-login-required", "free-credit-available", "free-report-unlocked", "free-credit-exhausted", "pro-ready", "download-unavailable", "本季免費額度已使用", "NOT_IMPLEMENTED", "REQUIRES_BACKEND"]) assert.ok(downloadSource.includes(term) || entitlementSource.includes(term));
  assert.ok(entitlementSource.includes("本季已下載。下一次免費額度"));
});

test("market radar source contract keeps source times, priority, freshness, facts and analysis separate", () => {
  for (const term of ["MarketRadarSource", "publishedAt", "dataPeriodStart", "dataPeriodEnd", "verifiedAt", "retrievedAt", "MarketRadarSourcePriority", "expectedUpdateFrequency", "MarketRadarFreshness", "MarketRadarFact", "MarketRadarAnalysis", "sourceIds", "facts: readonly MarketRadarFact[]", "sources: readonly MarketRadarSource[]", "analysisBasis"]) assert.ok(dataSource.includes(term));
  assert.match(dataSource, /priority: MarketRadarSourcePriority/);
  assert.match(dataSource, /sourceIds: readonly string\[\]/);
  assert.match(dataSource, /chartType: "line" \| "bar" \| "comparison"/);
});

test("market radar fixture is explicitly mock and drives the source-referenced report contract", () => {
  assert.equal(fixture.status, "fixture");
  assert.equal(fixture.isMock, true);
  assert.ok(Array.isArray(fixture.sources) && fixture.sources.length >= 2);
  assert.ok(fixture.sources.every((source) => source.isMock === true && source.publishedAt && source.verifiedAt && source.retrievedAt));
  assert.ok(fixture.districtHighlights.every((district) => district.sourceIds.length > 0 && district.detail.sourceIds.length > 0));
  assert.ok(fixture.newsItems.every((item) => item.sourceIds.length > 0 && item.detail.sourceIds.length > 0));
  assert.ok(fixture.publicCharts.every((chart) => chart.sourceIds.length > 0 && chart.series.length > 0));
  assert.ok(fixture.dailyKeyTake.sourceIds.length > 0);
  assert.equal(fixture.pricing.monthlyPrice, 40);
  assert.equal(fixture.pricing.annualPrice, 360);
});

test("fixture loader remains isolated while the public route uses the production snapshot", () => {
  for (const term of ["parseMarketRadarFixture", "loadMarketRadarReport", "marketRadarFallbackReport", "Unknown Market Radar source reference", "Fixture must remain marked as mock", "process.env.NODE_ENV !== \"production\""]) assert.ok(loaderSource.includes(term));
  assert.match(routeSource, /buildMarketRadarProductionReportSnapshot/);
  assert.match(routeSource, /buildMarketRadarProductionWebReport/);
  assert.doesNotMatch(routeSource, /loadMarketRadarReport|2026-08-29/);
  assert.doesNotMatch(routeSource, /marketRadarReport/);
});

test("market radar detail drawer distinguishes facts, analysis and source metadata without mock links", () => {
  for (const term of ["role=\"dialog\"", "aria-modal=\"true\"", "Escape", "MOCK DATA", "原始資訊", "Market Radar 解讀", "亦不構成投資或交易建議", "影響對象", "影響程度", "分析信心", "原始來源", "發布日期", "資料期間", "最後驗證", "取得時間", "target=\"_blank\"", "rel=\"noopener noreferrer\"", "Boolean(source.url) && !source.isMock", "Mock Source"]) assert.ok(detailDrawerSource.includes(term));
});

test("market radar news keeps its primary content column expandable across responsive layouts", () => {
  assert.match(stylesSource, /\.market-radar-news article \{ display: block; width: 100%; min-width: 0;/);
  assert.match(stylesSource, /\.market-radar-news article > button \{ display: grid; width: 100%; min-width: 0; grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(stylesSource, /grid-template-columns: auto minmax\(0, 1fr\) auto;/);
  assert.match(stylesSource, /word-break: normal; overflow-wrap: break-word;/);
  assert.ok(pageSource.includes("查看分析"));
});

test("market radar shows one quarterly Free report bundle and does not pretend payment is active", () => {
  for (const term of ["本季免費下載完整報告", "本季免費解鎖完整報告", "同一期 PNG 分享圖文 + PDF 完整報告", "1 Free Full Report Credit", "本季免費額度已使用"]) assert.ok(downloadSource.includes(term) || entitlementSource.includes(term));
  assert.match(proSource, /付款功能準備中/);
  assert.match(proSource, /Payment integration coming soon/);
  assert.match(proSource, /monthlyPrice/);
  assert.match(proSource, /annualPrice/);
  assert.doesNotMatch(proSource, /單次下載|singlePrice|NT\$10/);
});

test("payment architecture documents the paid access boundary without implementing it", () => {
  for (const term of ["NT$40", "NT$360", "每個自然季度", "PNG 快報 + PDF 完整報告", "不累積", "verified email", "QuarterlyDownloadUsage", "Cloudflare Worker", "D1 / KV", "Cloudflare R2", "24 小時有效", "最多 3 次"]) assert.ok(paymentDoc.includes(term));
  assert.ok(!paymentDoc.includes("單次下載："));
});

test("data contract documents source integrity, freshness, validation and Phase 2B flow", () => {
  for (const term of ["Tier 1", "Tier 2", "Tier 3", "Time fields", "MarketRadarFreshness", "Mock versus live", "Validation and fallback", "SOURCE INTEGRITY RULE", "Original numeric facts are never generated by an LLM", "Phase 2B", "Official Source → Fetcher or manual import", "n8n"]) assert.ok(dataContractDoc.includes(term));
});

test("the ecosystem includes Market Radar as an internal entry before Realty", () => {
  assert.match(appDataSource, /id: "market-radar"/);
  assert.match(appDataSource, /href: "\/market-radar\/"/);
  assert.ok(appDataSource.indexOf('id: "market-radar"') < appDataSource.indexOf('id: "realty-data-tools"'));
});
