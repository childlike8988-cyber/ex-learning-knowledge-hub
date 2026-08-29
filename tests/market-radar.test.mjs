import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/market-radar.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/components/MarketRadarPage.tsx", import.meta.url), "utf8");
const proSource = await readFile(new URL("../src/components/MarketRadarProSection.tsx", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../src/app/market-radar/page.tsx", import.meta.url), "utf8");
const paymentDoc = await readFile(new URL("../docs/market-radar/payment-architecture.md", import.meta.url), "utf8");
const appDataSource = await readFile(new URL("../src/data/learning-apps.ts", import.meta.url), "utf8");

test("market radar keeps mock report data and the Free / Pro model centralized", () => {
  for (const term of ["MarketRadarReport", "2026-08-29.json", "singlePrice: 30", "annualPrice: 360", "hasPurchasedCurrentReport", "hasActiveAnnualSubscription", "Mock source placeholder"]) assert.match(dataSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("market radar route and report UI preserve the requested public sections", () => {
  for (const term of ["高雄房市快報", "今日一句", "今日市場溫度", "今日 3 大重點", "今天最值得知道的 3 句話", "今日快訊", "公開圖表"]) assert.ok(pageSource.includes(term));
  assert.match(routeSource, /MarketRadarPage/);
});

test("market radar does not pretend that payment or downloads are available", () => {
  assert.match(proSource, /付款功能準備中/);
  assert.match(proSource, /Payment integration coming soon/);
  assert.match(proSource, /Pro content/);
});

test("payment architecture documents the paid access boundary without implementing it", () => {
  for (const term of ["NT$30", "NT$360", "365 天", "Cloudflare Worker", "D1 / KV", "Cloudflare R2", "24 小時有效", "最多 3 次"]) assert.ok(paymentDoc.includes(term));
});

test("the ecosystem includes Market Radar as an internal entry before Realty", () => {
  assert.match(appDataSource, /id: "market-radar"/);
  assert.match(appDataSource, /href: "\/market-radar\/"/);
  assert.ok(appDataSource.indexOf('id: "market-radar"') < appDataSource.indexOf('id: "realty-data-tools"'));
});
