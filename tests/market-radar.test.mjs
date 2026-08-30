import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/market-radar.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/components/MarketRadarPage.tsx", import.meta.url), "utf8");
const proSource = await readFile(new URL("../src/components/MarketRadarProSection.tsx", import.meta.url), "utf8");
const downloadSource = await readFile(new URL("../src/components/MarketRadarDownloadSection.tsx", import.meta.url), "utf8");
const quickNavigationSource = await readFile(new URL("../src/components/MarketRadarQuickNavigation.tsx", import.meta.url), "utf8");
const detailDrawerSource = await readFile(new URL("../src/components/MarketRadarDetailDrawer.tsx", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../src/app/market-radar/page.tsx", import.meta.url), "utf8");
const paymentDoc = await readFile(new URL("../docs/market-radar/payment-architecture.md", import.meta.url), "utf8");
const appDataSource = await readFile(new URL("../src/data/learning-apps.ts", import.meta.url), "utf8");

test("market radar keeps the quarterly Free credit and monthly / annual pricing centralized", () => {
  for (const term of ["MarketRadarFreePlan", "MarketRadarPricing", "monthlyPrice: 40", "annualPrice: 360", "downloadsPerQuarter: 1", "includesPng: true", "includesPdf: true", "creditsCarryOver: false", "freeQuarterlyDownloadsRemaining: 1", "hasActiveMonthlySubscription", "hasActiveAnnualSubscription", "formats: [\"PNG\", \"PDF\"]", "2026-Q3"]) assert.match(dataSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(dataSource, /singlePrice/);
  assert.doesNotMatch(dataSource, /NT\$10/);
});

test("market radar route and report UI preserve the requested public sections", () => {
  for (const term of ["market-radar-hero__grid", "market-radar-hero__download", "market-key-take", "market-district-signals", "market-temperature", "market-public-charts", "market-updates", "market-key-sentences", "TODAY&apos;S KEY TAKE", "market-radar-daily-word__bookmark", "market-radar-daily-word__cityline", "高雄房市快報", "今日一句", "今日市場溫度", "今日 3 大重點", "今天最值得知道的 3 句話", "今日快訊", "公開圖表"]) assert.ok(pageSource.includes(term));
  assert.ok(pageSource.indexOf("今日 3 大重點") < pageSource.indexOf("今日市場溫度"));
  assert.ok(pageSource.indexOf("今日市場溫度") < pageSource.indexOf("公開圖表"));
  assert.ok(pageSource.indexOf("公開圖表") < pageSource.indexOf("今日快訊"));
  assert.ok(pageSource.indexOf("今日快訊") < pageSource.indexOf("今天最值得知道的 3 句話"));
  assert.match(routeSource, /MarketRadarPage/);
});

test("market radar offers semantic desktop and mobile quick navigation", () => {
  for (const term of ["QUICK NAVIGATION", "快速索引", "快速導覽", "aria-expanded", "aria-controls", "market-pro"]) assert.ok(quickNavigationSource.includes(term));
});

test("market radar models Free exhaustion and individual Pro format actions", () => {
  for (const term of ["freeQuarterlyDownloadsRemaining", "isFreeQuarterlyCreditExhausted", "hasActiveMonthlySubscription", "hasActiveAnnualSubscription", "canDownloadWithPro", "本季免費額度已使用", "disabled", "Pro 下載", "下載 ${download.format}"]) assert.ok(downloadSource.includes(term) || dataSource.includes(term));
  assert.ok(downloadSource.includes("本季已下載。下一次免費額度"));
});

test("market radar details keep source timing fields distinct and remain marked as Mock", () => {
  for (const term of ["MarketRadarDetail", "publishedAt", "dataPeriod", "verifiedAt", "detail: MarketRadarDetail", "districtHighlights", "newsItems", "publicCharts", "isMock: true"]) assert.ok(dataSource.includes(term));
  for (const term of ["role=\"dialog\"", "aria-modal=\"true\"", "Escape", "Mock Data", "資料資訊", "最後驗證時間", "目前為 Mock Data"]) assert.ok(detailDrawerSource.includes(term));
});

test("market radar shows one quarterly Free bundle and does not pretend payment is active", () => {
  for (const term of ["本季免費下載", "一次解鎖本期 PNG + PDF", "1 Free Full Report Credit", "本季免費額度已使用", "nextQuarterLabel"]) assert.ok(downloadSource.includes(term));
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

test("the ecosystem includes Market Radar as an internal entry before Realty", () => {
  assert.match(appDataSource, /id: "market-radar"/);
  assert.match(appDataSource, /href: "\/market-radar\/"/);
  assert.ok(appDataSource.indexOf('id: "market-radar"') < appDataSource.indexOf('id: "realty-data-tools"'));
});
