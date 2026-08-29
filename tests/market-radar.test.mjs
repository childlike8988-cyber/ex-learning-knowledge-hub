import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/market-radar.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/components/MarketRadarPage.tsx", import.meta.url), "utf8");
const proSource = await readFile(new URL("../src/components/MarketRadarProSection.tsx", import.meta.url), "utf8");
const downloadSource = await readFile(new URL("../src/components/MarketRadarDownloadSection.tsx", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../src/app/market-radar/page.tsx", import.meta.url), "utf8");
const paymentDoc = await readFile(new URL("../docs/market-radar/payment-architecture.md", import.meta.url), "utf8");
const appDataSource = await readFile(new URL("../src/data/learning-apps.ts", import.meta.url), "utf8");

test("market radar keeps the quarterly Free credit and monthly / annual pricing centralized", () => {
  for (const term of ["MarketRadarFreePlan", "MarketRadarPricing", "monthlyPrice: 40", "annualPrice: 360", "downloadsPerQuarter: 1", "includesPng: true", "includesPdf: true", "creditsCarryOver: false", "freeQuarterlyDownloadsRemaining: 1", "hasActiveMonthlySubscription", "hasActiveAnnualSubscription", "formats: [\"PNG\", \"PDF\"]", "2026-Q3"]) assert.match(dataSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(dataSource, /singlePrice/);
  assert.doesNotMatch(dataSource, /NT\$10/);
});

test("market radar route and report UI preserve the requested public sections", () => {
  for (const term of ["高雄房市快報", "今日一句", "今日市場溫度", "今日 3 大重點", "今天最值得知道的 3 句話", "今日快訊", "公開圖表"]) assert.ok(pageSource.includes(term));
  assert.match(routeSource, /MarketRadarPage/);
});

test("market radar shows one quarterly Free bundle and does not pretend payment is active", () => {
  for (const term of ["本季免費下載", "一次解鎖本期 PNG + PDF", "1 Free Full Report Credit", "本季免費下載額度已使用", "nextQuarterLabel"]) assert.ok(downloadSource.includes(term));
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
