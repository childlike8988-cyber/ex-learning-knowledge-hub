import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(`${root}${path}`, "utf8");
const exporter = read("scripts/market-radar/export-report.mjs");
const wrapper = read("scripts/market-radar/export-report.ps1");
const gitignore = read(".gitignore");

test("export engine has a local CLI, Windows wrapper and ignored output/staging boundaries", () => {
  for (const path of ["scripts/market-radar/export-report.mjs", "scripts/market-radar/export-report.ps1", "docs/market-radar/report-export-engine.md", "data/market-radar/exports/README.md"]) assert.equal(existsSync(`${root}${path}`), true);
  assert.match(gitignore, /data\/market-radar\/exports\/\*/);
  assert.match(exporter, /data", "market-radar", "staging", "export/);
  assert.match(wrapper, /npm\.cmd run build/);
});

test("export engine uses production preview, Playwright Core and the shared snapshot only", () => {
  assert.match(exporter, /from "playwright-core"/);
  assert.match(exporter, /market-radar\/report-preview\/\?mode=/);
  assert.match(exporter, /market-radar-report-export-payload/);
  assert.match(exporter, /snapshotHash/);
  assert.equal(/loadMarketRadarLiveData|loadMarketRadarCbcData|fetch\(/.test(exporter), false);
});

test("PNG and PDF contracts validate deterministic geometry and DOM print rendering", () => {
  assert.match(exporter, /width !== 1080 \|\| height !== 1920/);
  assert.match(exporter, /omitBackground: false/);
  assert.match(exporter, /format: "A4", printBackground: true, preferCSSPageSize: true/);
  assert.match(exporter, /pageCount < 3 \|\| pageCount > 8/);
  assert.match(exporter, /textRenderer: "playwright-dom-print"/);
  assert.match(exporter, /MARKET_RADAR_BROWSER_PATH/);
});

test("bundle output is relative, versioned, atomic and cannot silently overwrite a different snapshot", () => {
  assert.match(exporter, /rendererVersion = "1\.1\.0"/);
  assert.match(exporter, /EX-Market-Radar-Kaohsiung-\$\{reportDate\}-\$\{cardId\}\.png/);
  assert.match(exporter, /EX-Market-Radar-Kaohsiung-\$\{reportDate\}\.pdf/);
  assert.match(exporter, /previous\.snapshotHash !== hash/);
  assert.match(exporter, /await rename\(stage, finalDirectory\)/);
  assert.match(exporter, /path: basename\(path\)/);
  assert.match(exporter, /reportType: "market-radar-download-content-layer"/);
  assert.match(exporter, /shareCards: result\.pngs/);
  assert.equal(/git\s+(add|commit|push)|credential|password/i.test(exporter), false);
});

test("dry-run, partial and failure contracts produce structured safe results with correct exit codes", () => {
  assert.match(exporter, /status = "dry-run"/);
  assert.ok(exporter.indexOf('if (options.dryRun)') < exporter.indexOf('if (existsSync(finalDirectory) && !options.overwrite)'), "dry-run must not reuse or overwrite an existing bundle");
  assert.match(exporter, /result\.status = succeeded === requested \? "success" : succeeded > 0 \? "partial" : "failed"/);
  assert.match(exporter, /result\.status === "success" \|\| result\.status === "dry-run" \? 0 : result\.status === "partial" \? 2 : 1/);
  assert.match(wrapper, /ConvertFrom-Json/);
  assert.equal(/git\s+(add|commit|push)/i.test(wrapper), false);
});
