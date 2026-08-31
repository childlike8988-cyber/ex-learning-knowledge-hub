#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, readFile } from "node:fs/promises";
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
} from "./automation-utils.mjs";

const execFileAsync = promisify(execFile);
const runnerDirectory = resolve(fileURLToPath(new URL(".", import.meta.url)));
const moiImporterPath = join(runnerDirectory, "import-moi-real-price.mjs");
const cbcImporterPath = join(runnerDirectory, "import-cbc-housing-finance.mjs");

function usage() {
  return "Usage: node scripts/market-radar/run-update-job.mjs <moi-latest-refresh|moi-history-backfill|cbc-monthly-refresh> --dry-run [--source-file <path> --source-published-at <ISO> --data-period-start <YYYY-MM-DD> --data-period-end <YYYY-MM-DD> --county-file] [--force]";
}

function readArguments(argv) {
  const [jobId, ...rest] = argv;
  const options = { dryRun: false, force: false, countyFile: false };
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === "--dry-run") { options.dryRun = true; continue; }
    if (value === "--force") { options.force = true; continue; }
    if (value === "--county-file") { options.countyFile = true; continue; }
    if (["--source-file", "--source-published-at", "--data-period-start", "--data-period-end"].includes(value)) {
      options[value.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = rest[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${value}\n${usage()}`);
  }
  if (!JOB_DEFINITIONS[jobId]) throw new Error(usage());
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
    return JSON.parse(await readFile(join(processedDirectory, "moi-real-price-quality.json"), "utf8"));
  }
  await execFileAsync(process.execPath, [cbcImporterPath, sourceFile, "--source-published-at", options.sourcePublishedAt, "--verified-at", verifiedAt, "--out-dir", processedDirectory, "--live-output", candidateLive]);
  return JSON.parse(await readFile(join(processedDirectory, "cbc-housing-finance-quality.json"), "utf8"));
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
  const stageDirectory = await mkdtemp(join(resolve(process.cwd(), "data/market-radar/staging"), `${jobId}-`));
  try {
    const quality = await runImporter({ jobId, sourceId: definition.sourceId, sourceFile, options, stageDirectory });
    const qualityPassed = definition.sourceId === "moi-real-price-sales" ? Boolean(quality.qualityGate?.passed) : Number(quality.acceptedRows) > 0;
    await safeJsonWrite(join(stageDirectory, "candidate-version.json"), { ...candidate, qualityStatus: qualityPassed ? "passed" : "failed", stagedAt: new Date().toISOString() });
    return result(jobId, definition.sourceId, startedAt, {
      status: qualityPassed ? "staged" : "failed",
      sourceVersionId: candidate.sourceVersionId,
      changed: qualityPassed,
      qualityPassed,
      warnings: qualityPassed ? ["Dry run completed source-specific parse and quality gate in ignored staging. Live JSON was not changed."] : [],
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
