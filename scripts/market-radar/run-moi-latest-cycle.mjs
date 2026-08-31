#!/usr/bin/env node

import { copyFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { acquireMoiLatest, checkMoiLatest } from "./moi-acquire-latest.mjs";

const execFileAsync = promisify(execFile);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const runnerPath = join(scriptDirectory, "run-update-job.mjs");
function option(name) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; }
function trigger() { const value = option("--trigger") ?? "manual"; if (!new Set(["manual", "scheduled", "webhook"]).has(value)) throw new Error("Invalid trigger."); return value; }
async function runner(args) { const { stdout } = await execFileAsync(process.execPath, [runnerPath, ...args]); return JSON.parse(stdout); }

async function main() {
  const selectedTrigger = trigger();
  const availability = await checkMoiLatest();
  if (!availability.changed) return { ...availability, job: { status: "skipped", changed: false, published: false, qualityPassed: true } };
  const acquisition = await acquireMoiLatest();
  const dryRun = await runner(["moi-latest-refresh", "--dry-run", "--source-file", acquisition.rawFilePath, "--source-published-at", acquisition.sourcePublishedAt, "--data-period-start", acquisition.expectedDataPeriodStart, "--data-period-end", acquisition.expectedDataPeriodEnd, "--county-file", "--trigger", selectedTrigger]);
  const candidatePath = dryRun.warnings.find((item) => String(item).startsWith("candidatePath="))?.slice("candidatePath=".length);
  const stableCandidatePath = resolve("data/market-radar/staging/moi/moi-real-price-candidate.json");
  if (dryRun.status !== "staged" || !candidatePath) return { status: dryRun.status, changed: dryRun.changed, source: acquisition, job: dryRun };
  await mkdir(dirname(stableCandidatePath), { recursive: true }); await copyFile(candidatePath, stableCandidatePath);
  if (!process.argv.includes("--publish")) return { status: "staged", changed: true, source: acquisition, candidatePath: stableCandidatePath, job: dryRun };
  const published = await runner(["moi-latest-refresh", "--publish", "--candidate", stableCandidatePath, "--trigger", selectedTrigger]);
  return { status: published.status, changed: published.changed, source: acquisition, candidatePath: stableCandidatePath, job: published };
}
main().then((value) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
