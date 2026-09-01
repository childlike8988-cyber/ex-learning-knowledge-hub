import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(`${root}${path}`, "utf8");
const png = read("src/components/market-radar/report/MarketRadarPngReport.tsx");
const pdf = read("src/components/market-radar/report/MarketRadarPdfReport.tsx");
const preview = read("src/components/market-radar/report/MarketRadarReportPreview.tsx");
const route = read("src/app/market-radar/report-preview/page.tsx");
const primitives = read("src/components/market-radar/report/MarketRadarReportPrimitives.tsx");
const css = read("src/app/globals.css");
const formatters = read("src/lib/market-radar/report/formatters.ts");

test("internal report preview is static, noindex and kept outside global navigation", () => {
  assert.equal(existsSync(`${root}src/app/market-radar/report-preview/page.tsx`), true);
  assert.match(route, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false/);
  assert.match(route, /buildMarketRadarReportSnapshot/);
  assert.equal(read("src/components/Header.tsx").includes("report-preview"), false);
  assert.equal(/cookies\(|headers\(|fetch\(/.test(route), false);
});

test("PNG renderer is a fixed 1080 by 1920 snapshot-only report with one MOI primary chart", () => {
  assert.match(png, /MarketRadarPngReport/);
  assert.match(png, /MarketRadarPrimaryChart|MarketRadarMoiSection snapshot=\{snapshot\} chart/);
  assert.match(css, /market-radar-export--png\s*\{\s*width:\s*1080px;\s*height:\s*1920px/);
  assert.match(css, /padding:\s*72px 64px/);
  assert.match(primitives, /最多 8 區 · 非買氣排行/);
  assert.equal(/loadMarketRadarLiveData|loadMarketRadarCbcData|fetch\(/.test(png), false);
});

test("renderer disclosures keep fixture, partial live and waiting data explicit", () => {
  assert.match(primitives, /FIXTURE/);
  assert.match(primitives, /PARTIAL LIVE/);
  assert.match(pdf, /MOI HISTORICAL <b>WAITING<\/b>/);
  assert.match(pdf, /PRICE MOMENTUM <b>WAITING<\/b>/);
  assert.match(primitives, /不等同即時市場詢問度或買氣/);
});

test("PDF renderer has an A4 portrait six-page model with sources and disclaimer", () => {
  assert.match(pdf, /MarketRadarPdfReport/);
  for (const page of ["cover", "overview", "moi", "cbc", "signals", "sources"]) assert.match(pdf, new RegExp(`label="${page}"`));
  assert.match(pdf, /MarketRadarSourceMeta/);
  assert.match(pdf, /MarketRadarDisclaimer/);
  assert.match(css, /@page \{ size: A4 portrait; margin: 0; \}/);
  assert.match(css, /break-inside: avoid/);
});

test("report primitives render all numeric and source data from the snapshot contract", () => {
  for (const component of ["MarketRadarReportHeader", "MarketRadarStatusBadge", "MarketRadarKeyTake", "MarketRadarHighlights", "MarketRadarTemperature", "MarketRadarMoiSection", "MarketRadarCbcSection", "MarketRadarObservations", "MarketRadarSourceMeta", "MarketRadarDisclaimer", "MarketRadarReportFooter"]) assert.match(primitives, new RegExp(`function ${component}`));
  for (const formatter of ["formatNumber", "formatPercent", "formatTwdAmount", "formatDateRange"]) assert.match(formatters, new RegExp(`function ${formatter}`));
  assert.match(primitives, /retrievedAt/);
  assert.match(primitives, /verifiedAt/);
  assert.equal(/loadMarketRadarLiveData|loadMarketRadarCbcData|fetch\(/.test(primitives), false);
});

test("preview controls are print-safe and do not expose download or auth behavior", () => {
  assert.match(preview, /PNG 9:16/);
  assert.match(preview, /PDF A4/);
  assert.match(preview, /Fit Width/);
  assert.match(preview, /Actual Size/);
  assert.match(css, /market-radar-report-preview__toolbar \{ display: none !important; \}/);
  assert.equal(/download=|下載|auth|login/i.test(`${preview}\n${png}\n${pdf}`), false);
});
