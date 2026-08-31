#!/usr/bin/env node

import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { acquireCbcLatest, checkCbcLatest } from "./cbc-acquire-latest.mjs";

const execFileAsync = promisify(execFile);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const runnerPath = join(scriptDirectory, "run-update-job.mjs");

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function selectedTrigger() {
  const value = option("--trigger") ?? "manual";
  if (!new Set(["manual", "scheduled", "webhook"]).has(value)) throw new Error("Invalid trigger.");
  return value;
}

async function runRunner(argumentsList) {
  const { stdout } = await execFileAsync(process.execPath, [runnerPath, ...argumentsList]);
  return JSON.parse(stdout);
}

async function main() {
  const trigger = selectedTrigger();
  const candidatePath = option("--candidate");
  if (process.argv.includes("--publish")) {
    if (!candidatePath) throw new Error("Publish requires --candidate <candidate-path>.");
    return runRunner(["cbc-monthly-refresh", "--publish", "--candidate", resolve(candidatePath), "--trigger", trigger]);
  }

  const availability = await checkCbcLatest({});
  if (!availability.changed) return { ...availability, job: { status: "skipped", changed: false, published: false } };

  const acquisition = await acquireCbcLatest({});
  const job = await runRunner([
    "cbc-monthly-refresh",
    "--dry-run",
    "--source-file", acquisition.rawFilePath,
    "--source-published-at", acquisition.sourcePublishedAt,
    "--trigger", trigger,
  ]);
  return {
    status: job.status,
    changed: job.changed,
    source: {
      sourcePageUrl: acquisition.sourcePageUrl,
      downloadUrl: acquisition.downloadUrl,
      officialFileName: acquisition.officialFileName,
      sourcePublishedAt: acquisition.sourcePublishedAt,
      expectedDataPeriod: acquisition.expectedDataPeriod,
      retrievedAt: acquisition.retrievedAt,
      sha256: acquisition.sha256,
    },
    job,
  };
}

main().then((output) => process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
