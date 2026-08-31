import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import {
  CBC_ALLOWED_DOMAINS,
  CBC_OFFICIAL_RELEASE_LISTING_PAGE,
  assertCbcOfficialUrl,
  checkCbcLatest,
  parseCbcReleaseListing,
  parseCbcReleasePage,
  validateCbcXlsxResponse,
} from "../scripts/market-radar/cbc-acquire-latest.mjs";
import { JOB_DEFINITIONS, validateCbcAutomationQuality } from "../scripts/market-radar/automation-utils.mjs";

const execFileAsync = promisify(execFile);
const runnerPath = fileURLToPath(new URL("../scripts/market-radar/run-update-job.mjs", import.meta.url));
const workflowPath = new URL("../automation/n8n/market-radar-cbc-monthly-refresh.json", import.meta.url);
const documentationPath = new URL("../docs/market-radar/cbc-monthly-automation.md", import.meta.url);
const releaseHtml = `<!doctype html><h1>115年7月五大銀行新承做放款平均利率</h1><p>發布日期：2026-08-21</p><a href="/tw/dl-227456-e03ab17dca544cd7811ead3e51d52b9d.html">1150821附表-五大銀行新承做放款金額與利率統計表XLSX</a>`;
const listingHtml = `<!doctype html><li><time>2026-08-21</time><a href="/tw/cp-302-192747-5edf4-1.html" title="115年7月五大銀行新承做放款平均利率">115年7月五大銀行新承做放款平均利率</a></li>`;

test("CBC official allowlist is restricted to Central Bank domains", () => {
  assert.deepEqual(CBC_ALLOWED_DOMAINS, ["www.cbc.gov.tw", "cbc.gov.tw"]);
  assert.equal(assertCbcOfficialUrl(CBC_OFFICIAL_RELEASE_LISTING_PAGE).hostname, "www.cbc.gov.tw");
});

test("an arbitrary attachment domain is rejected", () => {
  assert.throws(() => assertCbcOfficialUrl("https://example.com/cbc.xlsx"), /official allowlist/);
});

test("official release metadata yields the XLSX attachment and expected monthly period", () => {
  const metadata = parseCbcReleasePage(releaseHtml, "https://www.cbc.gov.tw/tw/cp-302-192747-5edf4-1.html");
  assert.equal(metadata.sourcePublishedAt, "2026-08-21");
  assert.equal(metadata.expectedDataPeriod, "2026-07");
  assert.match(metadata.downloadUrl, /^https:\/\/www\.cbc\.gov\.tw\//);
});

test("official listing detects the latest CBC mortgage release before reading its attachment", () => {
  const release = parseCbcReleaseListing(listingHtml);
  assert.equal(release.sourcePublishedAt, "2026-08-21");
  assert.match(release.releasePageUrl, /cp-302-192747/);
});

test("same official period is skipped before attachment download", async () => {
  const result = await checkCbcLatest({
    livePath: "public/data/market-radar/live/cbc-housing-finance-latest.json",
    fetchImpl: async (url) => new Response(String(url).includes("lp-302") ? listingHtml : releaseHtml, { status: 200 }),
  });
  assert.deepEqual({ status: result.status, changed: result.changed, currentPeriod: result.currentPeriod }, { status: "skipped", changed: false, currentPeriod: "2026-07" });
});

test("a future official period is exposed as a candidate", async () => {
  const futureHtml = releaseHtml.replace("115年7月", "115年8月");
  const futureListingHtml = listingHtml.replace(/115年7月/g, "115年8月").replace("192747", "192999");
  const result = await checkCbcLatest({
    livePath: "public/data/market-radar/live/cbc-housing-finance-latest.json",
    fetchImpl: async (url) => new Response(String(url).includes("lp-302") ? futureListingHtml : futureHtml, { status: 200 }),
  });
  assert.equal(result.status, "candidate");
  assert.equal(result.expectedDataPeriod, "2026-08");
});

test("attachment validation blocks empty or non-XLSX responses", () => {
  const response = new Response(Buffer.from("not-xlsx"), { status: 200, headers: { "content-type": "text/html", "content-disposition": "attachment; filename=bad.html" } });
  Object.defineProperty(response, "url", { value: "https://www.cbc.gov.tw/tw/dl-file.html" });
  assert.throws(() => validateCbcXlsxResponse({ response, bytes: Buffer.alloc(0), downloadUrl: "https://www.cbc.gov.tw/tw/dl-file.html" }), /empty/);
});

test("CBC candidate quality requires valid rate, amount, sorted unique history and rows", () => {
  const liveData = { latest: { period: "2026-08", mortgageRate: 2.29, newMortgageAmount: 69109 }, history: [{ period: "2026-07" }, { period: "2026-08" }] };
  assert.equal(validateCbcAutomationQuality({ quality: { acceptedRows: 2 }, liveData }).passed, true);
  assert.equal(validateCbcAutomationQuality({ quality: { acceptedRows: 2 }, liveData: { ...liveData, latest: { ...liveData.latest, mortgageRate: 20 } } }).passed, false);
  assert.equal(validateCbcAutomationQuality({ quality: { acceptedRows: 2 }, liveData: { ...liveData, history: [{ period: "2026-08" }, { period: "2026-07" }] } }).passed, false);
});

test("CBC and MOI latest are enabled while MOI historical automation remains disabled", () => {
  assert.equal(JOB_DEFINITIONS["cbc-monthly-refresh"].enabled, true);
  assert.equal(JOB_DEFINITIONS["moi-latest-refresh"].enabled, true);
  assert.equal(JOB_DEFINITIONS["moi-history-backfill"].enabled, false);
});

test("publish mode fails safe without a staged candidate and cannot touch live data", async () => {
  await assert.rejects(execFileAsync(process.execPath, [runnerPath, "cbc-monthly-refresh", "--publish", "--candidate", "missing-candidate.json", "--trigger", "scheduled"]), (error) => {
    const output = JSON.parse(error.stdout);
    assert.equal(output.status, "failed");
    assert.equal(output.published, false);
    return true;
  });
});

test("workflow remains inactive, credential-free and excludes Git operations", async () => {
  const workflow = JSON.parse(await readFile(workflowPath, "utf8"));
  assert.equal(workflow.active, false);
  assert.equal(JSON.stringify(workflow).includes("credentials"), false);
  assert.equal(JSON.stringify(workflow).match(/git (commit|push)/i), null);
});

test("workflow has manual, scheduled, dry-run, publish, status and validation stages", async () => {
  const workflow = JSON.parse(await readFile(workflowPath, "utf8"));
  const names = workflow.nodes.map((node) => node.name).join("|");
  for (const name of ["Manual Trigger", "Monthly Candidate Check", "Dry Run Official CBC Cycle", "Candidate Staged?", "Cycle Skipped?", "Publish Candidate", "Verify Local Build", "Rollback Known-Good CBC", "Record Safe Status", "Record Skipped Status", "Record Failed Safe Status"]) assert.ok(names.includes(name));
});

test("automation documentation preserves local publish and human Git boundary", async () => {
  const content = (await readFile(documentationPath, "utf8")).toLowerCase();
  for (const phrase of ["dry-run", "rollback", "sha-256", "n8n", "never creates a git commit", "same-period", "12 monthly records"]) assert.ok(content.includes(phrase));
});
