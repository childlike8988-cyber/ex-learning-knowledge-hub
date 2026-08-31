#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  AUTOMATION_ENABLED,
  JOB_DEFINITIONS,
  createSourceVersion,
  isCandidateNewer,
  sha256File,
  safeJsonWrite,
  validateCbcAutomationQuality,
  validateMoiAutomationQuality,
} from "./automation-utils.mjs";

const execFileAsync = promisify(execFile);
const runnerDirectory = resolve(fileURLToPath(new URL(".", import.meta.url)));
const moiImporterPath = join(runnerDirectory, "import-moi-real-price.mjs");
const cbcImporterPath = join(runnerDirectory, "import-cbc-housing-finance.mjs");

function usage() {
  return "Usage: node scripts/market-radar/run-update-job.mjs <job-id> --dry-run --source-file <path> --source-published-at <ISO> [--data-period-start <YYYY-MM-DD> --data-period-end <YYYY-MM-DD> --county-file] | cbc-monthly-refresh --publish --candidate <candidate-path> [--trigger manual|scheduled]";
}

function readArguments(argv) {
  const [jobId, ...rest] = argv;
  const options = { dryRun: false, publish: false, force: false, countyFile: false, trigger: "manual" };
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === "--dry-run") { options.dryRun = true; continue; }
    if (value === "--publish") { options.publish = true; continue; }
    if (value === "--force") { options.force = true; continue; }
    if (value === "--county-file") { options.countyFile = true; continue; }
    if (["--source-file", "--source-published-at", "--data-period-start", "--data-period-end", "--candidate", "--trigger"].includes(value)) {
      options[value.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = rest[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${value}\n${usage()}`);
  }
  if (!JOB_DEFINITIONS[jobId]) throw new Error(usage());
  if (options.trigger !== "manual" && options.trigger !== "scheduled" && options.trigger !== "webhook") throw new Error("Invalid trigger.");
  if (options.trigger !== "manual" && options.force) throw new Error("Force is permitted only for a manual trigger.");
  return { jobId, options };
}

function readExistingPublishedVersion(jobId, sourceId) {
  if (jobId === "moi-history-backfill") return undefined;
  const fileName = sourceId === "moi-real-price-sales" ? "moi-real-price-latest.json" : "cbc-housing-finance-latest.json";
  const filePath = resolve(process.cwd(), "public/data/market-radar/live", fileName);
  if (!existsSync(filePath)) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    return typeof parsed.sourcePublishedAt === "string" ? { sourceVersionId: parsed.sourceVersionId, publishedAt: parsed.sourcePublishedAt } : undefined;
  } catch { return undefined; }
}

async function runImporter({ jobId, sourceId, sourceFile, options, stageDirectory }) {
  const processedDirectory = join(stageDirectory, "processed");
  const candidateLive = join(stageDirectory, `${sourceId}-candidate.json`);
  const verifiedAt = new Date().toISOString();
  if (sourceId === "moi-real-price-sales") {
    const command = [moiImporterPath, sourceFile, "--source-published-at", options.sourcePublishedAt, "--data-period-start", options.dataPeriodStart, "--data-period-end", options.dataPeriodEnd, "--verified-at", verifiedAt, "--out-dir", processedDirectory];
    if (options.countyFile) command.push("--county-file");
    if (jobId === "moi-history-backfill") {
      command.push("--history-only", "--history-output", join(stageDirectory, "moi-real-price-history-candidate.json"), "--period-id", `moi-${options.dataPeriodStart}-${options.dataPeriodEnd}`);
    } else command.push("--live-output", candidateLive);
    await execFileAsync(process.execPath, command);
    return { quality: JSON.parse(await readFile(join(processedDirectory, "moi-real-price-quality.json"), "utf8")), candidateLivePath: candidateLive };
  }
  await execFileAsync(process.execPath, [cbcImporterPath, sourceFile, "--source-published-at", options.sourcePublishedAt, "--verified-at", verifiedAt, "--out-dir", processedDirectory, "--live-output", candidateLive]);
  return { quality: JSON.parse(await readFile(join(processedDirectory, "cbc-housing-finance-quality.json"), "utf8")), candidateLivePath: candidateLive };
}

export async function publishCbcCandidate(candidatePath, options, startedAt) {
  const definition = JOB_DEFINITIONS["cbc-monthly-refresh"];
  if (!definition.enabled) return result("cbc-monthly-refresh", definition.sourceId, startedAt, { status: "skipped", errors: ["CBC job is disabled"] });
  if (!candidatePath || !existsSync(candidatePath)) return result("cbc-monthly-refresh", definition.sourceId, startedAt, { status: "failed", errors: ["candidate file not found; live data was preserved"] });
  let candidate;
  try { candidate = JSON.parse(await readFile(candidatePath, "utf8")); } catch { return result("cbc-monthly-refresh", definition.sourceId, startedAt, { status: "failed", errors: ["candidate file is invalid; live data was preserved"] }); }
  const qualityGate = validateCbcAutomationQuality({ quality: candidate?.quality, liveData: candidate?.liveData });
  if (candidate?.sourceId !== "cbc-housing-finance" || candidate?.qualityPassed !== true || !candidate?.sourceVersion?.sourceVersionId || !qualityGate.passed) {
    return result("cbc-monthly-refresh", definition.sourceId, startedAt, { status: "failed", errors: ["candidate did not pass metadata, schema or quality validation; live data was preserved"] });
  }
  const current = readExistingPublishedVersion("cbc-monthly-refresh", definition.sourceId);
  const newer = isCandidateNewer(candidate.sourceVersion, current, options.force);
  if (!newer.eligible) return result("cbc-monthly-refresh", definition.sourceId, startedAt, { status: "skipped", sourceVersionId: candidate.sourceVersion.sourceVersionId, warnings: [newer.reason] });
  const livePath = resolve(process.cwd(), "public/data/market-radar/live/cbc-housing-finance-latest.json");
  const backupPath = resolve(process.cwd(), "data/market-radar/backups/cbc-housing-finance-known-good.json");
  if (existsSync(livePath)) {
    await mkdir(resolve(process.cwd(), "data/market-radar/backups"), { recursive: true });
    await copyFile(livePath, backupPath);
  }
  await safeJsonWrite(livePath, { ...candidate.liveData, sourceVersionId: candidate.sourceVersion.sourceVersionId });
  return result("cbc-monthly-refresh", definition.sourceId, startedAt, {
    status: "published", sourceVersionId: candidate.sourceVersion.sourceVersionId, changed: true, published: true, qualityPassed: true,
    candidateDataPeriod: { start: candidate.liveData.dataPeriodStart, end: candidate.liveData.dataPeriodEnd },
  });
}

export async function publishMoiCandidate(candidatePath, options, startedAt) {
  const definition = JOB_DEFINITIONS["moi-latest-refresh"];
  if (!definition.enabled) return result("moi-latest-refresh", definition.sourceId, startedAt, { status: "skipped", errors: ["MOI latest job is disabled"] });
  if (!candidatePath || !existsSync(candidatePath)) return result("moi-latest-refresh", definition.sourceId, startedAt, { status: "failed", errors: ["candidate file not found; MOI live data was preserved"] });
  let candidate;
  try { candidate = JSON.parse(await readFile(candidatePath, "utf8")); } catch { return result("moi-latest-refresh", definition.sourceId, startedAt, { status: "failed", errors: ["candidate file is invalid; MOI live data was preserved"] }); }
  const currentPath = resolve(process.cwd(), "public/data/market-radar/live/moi-real-price-latest.json");
  let previousLive;
  try { previousLive = JSON.parse(await readFile(currentPath, "utf8")); } catch { /* no current data is permitted only for first verified publish */ }
  const qualityGate = validateMoiAutomationQuality({ quality: candidate?.quality, liveData: candidate?.liveData, previousQuality: previousLive?.quality });
  if (candidate?.sourceId !== "moi-real-price-sales" || candidate?.qualityPassed !== true || !candidate?.sourceVersion?.sourceVersionId || !qualityGate.passed) return result("moi-latest-refresh", definition.sourceId, startedAt, { status: "failed", errors: ["candidate did not pass MOI metadata, schema or quality validation; live data was preserved"], warnings: qualityGate.warnings ?? [] });
  if (!options.force && previousLive?.dataPeriodEnd && candidate.liveData.dataPeriodEnd <= previousLive.dataPeriodEnd) {
    return result("moi-latest-refresh", definition.sourceId, startedAt, {
      status: "skipped",
      qualityPassed: true,
      safeMessage: "Candidate MOI data period is not newer than the current LIVE period.",
      previousDataPeriod: { start: previousLive.dataPeriodStart, end: previousLive.dataPeriodEnd },
      candidateDataPeriod: { start: candidate.liveData.dataPeriodStart, end: candidate.liveData.dataPeriodEnd },
    });
  }
  const newer = isCandidateNewer(candidate.sourceVersion, readExistingPublishedVersion("moi-latest-refresh", definition.sourceId), options.force);
  if (!newer.eligible) return result("moi-latest-refresh", definition.sourceId, startedAt, { status: "skipped", sourceVersionId: candidate.sourceVersion.sourceVersionId, warnings: [newer.reason] });
  if (previousLive) { await mkdir(resolve(process.cwd(), "data/market-radar/backups"), { recursive: true }); await copyFile(currentPath, resolve(process.cwd(), "data/market-radar/backups/moi-real-price-known-good.json")); }
  await safeJsonWrite(currentPath, { ...candidate.liveData, sourceVersionId: candidate.sourceVersion.sourceVersionId });
  return result("moi-latest-refresh", definition.sourceId, startedAt, { status: "published", changed: true, published: true, qualityPassed: true, sourceVersionId: candidate.sourceVersion.sourceVersionId, candidateDataPeriod: { start: candidate.liveData.dataPeriodStart, end: candidate.liveData.dataPeriodEnd } });
}

function result(jobId, sourceId, startedAt, overrides) {
  return {
    jobId,
    sourceId,
    status: "failed",
    changed: false,
    published: false,
    qualityPassed: false,
    warnings: [],
    errors: [],
    durationMs: Date.now() - startedAt,
    ...overrides,
  };
}

async function main() {
  const { jobId, options } = readArguments(process.argv.slice(2));
  const definition = JOB_DEFINITIONS[jobId];
  const startedAt = Date.now();
  if (options.publish) return jobId === "cbc-monthly-refresh" ? publishCbcCandidate(options.candidate, options, startedAt) : jobId === "moi-latest-refresh" ? publishMoiCandidate(options.candidate, options, startedAt) : result(jobId, definition.sourceId, startedAt, { status: "skipped", errors: ["Publish mode is not available for MOI historical backfill."] });
  if (!options.sourceFile) {
    return result(jobId, definition.sourceId, startedAt, {
      status: "failed",
      errors: ["source acquisition not configured"],
      warnings: ["Automation readiness mode never guesses official URLs or downloads files."],
    });
  }
  const sourceFile = resolve(options.sourceFile);
  if (!existsSync(sourceFile)) {
    return result(jobId, definition.sourceId, startedAt, { status: "failed", errors: ["manual source file not found"] });
  }
  const requiresPeriod = definition.sourceId === "moi-real-price-sales";
  if (!options.sourcePublishedAt || (requiresPeriod && (!options.dataPeriodStart || !options.dataPeriodEnd))) {
    return result(jobId, definition.sourceId, startedAt, { status: "failed", errors: ["source metadata is incomplete"], warnings: ["No parser or publish step ran."] });
  }
  const fileHash = await sha256File(sourceFile);
  const candidate = createSourceVersion({
    sourceId: definition.sourceId,
    filePath: sourceFile,
    fileHash,
    publishedAt: options.sourcePublishedAt,
    dataPeriodStart: options.dataPeriodStart,
    dataPeriodEnd: options.dataPeriodEnd,
    retrievedAt: new Date().toISOString(),
    methodologyVersion: definition.sourceId === "moi-real-price-sales" ? "moi-real-price-methodology-v1" : "cbc-housing-finance-methodology-v1",
  });
  const newer = isCandidateNewer(candidate, readExistingPublishedVersion(jobId, definition.sourceId), options.force);
  if (!newer.eligible) {
    return result(jobId, definition.sourceId, startedAt, { status: "skipped", sourceVersionId: candidate.sourceVersionId, warnings: [newer.reason] });
  }
  if (!options.dryRun || AUTOMATION_ENABLED) {
    return result(jobId, definition.sourceId, startedAt, {
      status: "skipped",
      sourceVersionId: candidate.sourceVersionId,
      errors: ["automation is disabled; live publish is not available in readiness mode"],
      candidateDataPeriod: { start: options.dataPeriodStart, end: options.dataPeriodEnd },
    });
  }
  await mkdir(resolve(process.cwd(), "data/market-radar/staging"), { recursive: true });
  const stageDirectory = await mkdtemp(join(resolve(process.cwd(), "data/market-radar/staging"), `${jobId}-`));
  try {
    const imported = await runImporter({ jobId, sourceId: definition.sourceId, sourceFile, options, stageDirectory });
    const { quality } = imported;
    const liveData = jobId === "moi-history-backfill" ? undefined : JSON.parse(await readFile(imported.candidateLivePath, "utf8"));
    const qualityGate = jobId === "moi-history-backfill"
      ? { passed: Boolean(quality.qualityGate?.passed), checks: quality.qualityGate?.checks }
      : definition.sourceId === "moi-real-price-sales"
      ? validateMoiAutomationQuality({ quality, liveData })
      : validateCbcAutomationQuality({ quality, liveData });
    const qualityPassed = qualityGate.passed;
    const finalizedCandidate = liveData ? createSourceVersion({ ...candidate, dataPeriodStart: liveData.dataPeriodStart, dataPeriodEnd: liveData.dataPeriodEnd }) : candidate;
    const candidatePath = join(stageDirectory, "candidate.json");
    await safeJsonWrite(candidatePath, { sourceId: definition.sourceId, sourceVersion: finalizedCandidate, qualityPassed, quality, qualityChecks: qualityGate.checks, liveData, stagedAt: new Date().toISOString() });
    return result(jobId, definition.sourceId, startedAt, {
      status: qualityPassed ? "staged" : "failed",
      sourceVersionId: finalizedCandidate.sourceVersionId,
      changed: qualityPassed,
      qualityPassed,
      warnings: qualityPassed ? ["Dry run completed source-specific parse and quality gate in ignored staging. Live JSON was not changed.", `candidatePath=${candidatePath}`] : [],
      errors: qualityPassed ? [] : ["quality gate failed; live data was preserved"],
      candidateDataPeriod: { start: options.dataPeriodStart, end: options.dataPeriodEnd },
    });
  } catch {
    return result(jobId, definition.sourceId, startedAt, {
      status: "failed",
      sourceVersionId: candidate.sourceVersionId,
      errors: ["source processing failed; live data was preserved"],
      candidateDataPeriod: { start: options.dataPeriodStart, end: options.dataPeriodEnd },
    });
  }
}

main().then((output) => {
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (output.status === "failed") process.exitCode = 1;
}).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
