import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import {
  AUTOMATION_ENABLED,
  JOB_DEFINITIONS,
  buildPublicUpdateStatus,
  canPublishCandidate,
  createSourceVersion,
  isCandidateNewer,
  safeJsonWrite,
  sha256File,
} from "../scripts/market-radar/automation-utils.mjs";

const execFileAsync = promisify(execFile);
const automationTypes = await readFile(new URL("../src/lib/market-radar/automation/types.ts", import.meta.url), "utf8");
const automationConfig = await readFile(new URL("../src/lib/market-radar/automation/config.ts", import.meta.url), "utf8");
const healthSource = await readFile(new URL("../src/lib/market-radar/automation/health.ts", import.meta.url), "utf8");
const contract = await readFile(new URL("../docs/market-radar/automation-update-contract.md", import.meta.url), "utf8");
const runnerPath = fileURLToPath(new URL("../scripts/market-radar/run-update-job.mjs", import.meta.url));
const moiFixturePath = fileURLToPath(new URL("./fixtures/moi-kaohsiung-sample.csv", import.meta.url));

const liveMoi = { status: "live", generatedAt: "2026-08-31T00:00:00Z", sourcePublishedAt: "2026-08-21", dataPeriodStart: "2026-08-01", dataPeriodEnd: "2026-08-10", freshness: { status: "normal" } };
const liveCbc = { status: "live", generatedAt: "2026-08-31T00:00:00Z", sourcePublishedAt: "2026-08-21", dataPeriodStart: "2026-07-01", dataPeriodEnd: "2026-07-31", freshness: { status: "normal" } };

test("automation contract defines update job, refresh, source version, runner and health schemas", () => {
  for (const term of ["MarketRadarUpdateJob", "MarketRadarSourceRefreshState", "MarketRadarSourceVersion", "MarketRadarUpdateJobResult", "MarketRadarAutomationRunner", "MarketRadarHealthStatus", "idle", "published", "dryRun"]) assert.ok(automationTypes.includes(term));
  assert.ok(healthSource.includes("buildMarketRadarHealthStatus"));
});

test("global automation remains disabled while MOI latest and CBC jobs are explicitly enabled", () => {
  assert.equal(AUTOMATION_ENABLED, false);
  assert.equal(automationConfig.includes("MARKET_RADAR_AUTOMATION_ENABLED = false"), true);
  assert.deepEqual(Object.keys(JOB_DEFINITIONS), ["moi-latest-refresh", "moi-history-backfill", "cbc-monthly-refresh"]);
  assert.equal(JOB_DEFINITIONS["moi-latest-refresh"].enabled, true);
  assert.equal(JOB_DEFINITIONS["moi-history-backfill"].enabled, false);
  assert.equal(JOB_DEFINITIONS["cbc-monthly-refresh"].enabled, true);
});

test("source refresh state is represented by the public status contract", () => {
  const status = buildPublicUpdateStatus({ generatedAt: "2026-08-31T00:00:00Z", moiLatest: liveMoi, cbcLatest: liveCbc, moiHistoryReady: false });
  for (const key of ["lastSuccessfulUpdateAt", "latestSourcePublishedAt", "latestDataPeriodStart", "latestDataPeriodEnd", "status", "freshness"]) assert.ok(key in status.sources.moiLatest);
});

test("update manifest contract is public, safe and automation-disabled", () => {
  const status = buildPublicUpdateStatus({ generatedAt: "2026-08-31T00:00:00Z", moiLatest: liveMoi, cbcLatest: liveCbc, moiHistoryReady: false });
  assert.deepEqual(Object.keys(status.sources), ["moiLatest", "moiHistory", "cbc"]);
  assert.equal(status.automationEnabled, false);
});

test("MOI latest refresh job is enabled while its scheduler remains a separate boundary", () => {
  assert.deepEqual(JOB_DEFINITIONS["moi-latest-refresh"], { sourceId: "moi-real-price-sales", enabled: true, purpose: "latest" });
});

test("MOI history backfill job stays separate and disabled", () => {
  assert.deepEqual(JOB_DEFINITIONS["moi-history-backfill"], { sourceId: "moi-real-price-sales", enabled: false, purpose: "history" });
});

test("CBC monthly refresh is the only enabled job", () => {
  assert.deepEqual(JOB_DEFINITIONS["cbc-monthly-refresh"], { sourceId: "cbc-housing-finance", enabled: true, purpose: "monthly" });
});

test("source version uses deterministic SHA-256 provenance and skips duplicates or older candidates", async () => {
  const temp = await mkdtemp(join(tmpdir(), "market-radar-automation-hash-"));
  const file = join(temp, "official.csv");
  await writeFile(file, "official data\n", "utf8");
  const hash = await sha256File(file);
  assert.equal(hash, await sha256File(file));
  const current = createSourceVersion({ sourceId: "moi-real-price-sales", filePath: file, fileHash: hash, publishedAt: "2026-08-21", dataPeriodStart: "2026-08-01", dataPeriodEnd: "2026-08-10", retrievedAt: "2026-08-31T00:00:00Z", methodologyVersion: "moi-real-price-methodology-v1" });
  assert.match(current.sourceVersionId, /^moi-real-price-sales:2026-08-21:2026-08-01\/2026-08-10:[a-f0-9]{64}$/);
  assert.equal(isCandidateNewer(current, current).reason, "duplicate-source-version");
  const old = { ...current, sourceVersionId: "old", publishedAt: "2026-08-11" };
  assert.equal(isCandidateNewer(old, current).reason, "source-not-newer");
});

test("candidate publishing requires metadata, schema, quality and a newer source", () => {
  assert.equal(canPublishCandidate({ metadataValid: true, schemaValid: true, qualityPassed: true, isNewer: true }), true);
  assert.equal(canPublishCandidate({ metadataValid: false, schemaValid: true, qualityPassed: true, isNewer: true }), false);
  assert.equal(canPublishCandidate({ metadataValid: true, schemaValid: true, qualityPassed: false, isNewer: true }), false);
});

test("an explicit future force flag is the only override for an older candidate", () => {
  const candidate = { sourceVersionId: "older", publishedAt: "2026-08-11" };
  const current = { sourceVersionId: "current", publishedAt: "2026-08-21" };
  assert.deepEqual(isCandidateNewer(candidate, current, true), { eligible: true, reason: "force" });
});

test("metadata-invalid candidates are blocked before publishing", () => {
  assert.equal(canPublishCandidate({ metadataValid: false, schemaValid: true, qualityPassed: true, isNewer: true }), false);
});

test("quality-gate failures are blocked before publishing", () => {
  assert.equal(canPublishCandidate({ metadataValid: true, schemaValid: true, qualityPassed: false, isNewer: true }), false);
});

test("a fully validated newer candidate is publish-eligible in the future contract", () => {
  assert.equal(canPublishCandidate({ metadataValid: true, schemaValid: true, qualityPassed: true, isNewer: true }), true);
});

test("safe JSON write is atomic-at-target and public status excludes internal errors", async () => {
  const temp = await mkdtemp(join(tmpdir(), "market-radar-automation-json-"));
  const destination = join(temp, "status.json");
  await safeJsonWrite(destination, { ready: true });
  assert.deepEqual(JSON.parse(await readFile(destination, "utf8")), { ready: true });
  const status = buildPublicUpdateStatus({ generatedAt: "2026-08-31T00:00:00Z", moiLatest: liveMoi, cbcLatest: liveCbc, moiHistoryReady: false });
  assert.equal(status.automationEnabled, false);
  assert.deepEqual(status.automation.jobs, { moiLatestRefresh: true, moiHistoryBackfill: false, cbcMonthlyRefresh: true });
  assert.equal(status.overallStatus, "partial");
  assert.equal(status.sources.moiHistory.status, "waiting");
  assert.equal(JSON.stringify(status).includes("stack"), false);
  assert.equal(JSON.stringify(status).includes("C:\\\\"), false);
});

test("waiting history does not fail MOI latest or CBC in public health status", () => {
  const status = buildPublicUpdateStatus({ generatedAt: "2026-08-31T00:00:00Z", moiLatest: liveMoi, cbcLatest: liveCbc, moiHistoryReady: false });
  assert.equal(status.sources.moiLatest.status, "live");
  assert.equal(status.sources.cbc.status, "live");
  assert.equal(status.sources.moiHistory.status, "waiting");
});

test("CBC refresh failure does not erase the retained MOI latest refresh state", () => {
  const status = buildPublicUpdateStatus({ generatedAt: "2026-08-31T00:00:00Z", moiLatest: liveMoi, cbcLatest: undefined, moiHistoryReady: false });
  assert.equal(status.sources.moiLatest.status, "live");
  assert.equal(status.sources.cbc.status, "waiting");
  assert.equal(status.overallStatus, "degraded");
});

test("runner fails safely without source acquisition and dry-run never publishes", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [runnerPath, "moi-latest-refresh", "--dry-run"]),
    (error) => {
      const output = JSON.parse(error.stdout);
      assert.equal(output.status, "failed");
      assert.equal(output.published, false);
      assert.match(output.errors[0], /source acquisition not configured/);
      return true;
    },
  );
});

test("manual file dry run stages a candidate without publishing live JSON", async () => {
  const { stdout } = await execFileAsync(process.execPath, [runnerPath, "moi-history-backfill", "--dry-run", "--source-file", moiFixturePath, "--source-published-at", "2026-08-11", "--data-period-start", "2026-07-21", "--data-period-end", "2026-07-31", "--county-file"]);
  const output = JSON.parse(stdout);
  assert.equal(output.status, "staged");
  assert.equal(output.published, false);
  assert.equal(output.qualityPassed, true);
});

test("automation documentation defines staging, rollback, retries and future n8n boundary", () => {
  const normalized = contract.toLowerCase();
  for (const term of ["candidate", "rollback", "idempotency", "sha-256", "dry run", "quality gate", "n8n", "source acquisition not configured", "temporary json", "metadata mismatch"]) assert.ok(normalized.includes(term));
});

test("public update status is present for static export", () => {
  assert.equal(existsSync(fileURLToPath(new URL("../public/data/market-radar/update-status.json", import.meta.url))), true);
});
