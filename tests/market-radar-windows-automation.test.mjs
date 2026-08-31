import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const wrapper = readFileSync(new URL("../scripts/market-radar/run-cbc-monthly.ps1", import.meta.url), "utf8");
const installer = readFileSync(new URL("../scripts/market-radar/install-cbc-scheduled-task.ps1", import.meta.url), "utf8");
const showTask = readFileSync(new URL("../scripts/market-radar/show-cbc-scheduled-task.ps1", import.meta.url), "utf8");
const removeTask = readFileSync(new URL("../scripts/market-radar/remove-cbc-scheduled-task.ps1", import.meta.url), "utf8");
const verifier = readFileSync(new URL("../scripts/market-radar/verify-cbc-runtime.mjs", import.meta.url), "utf8");
const documentation = readFileSync(new URL("../docs/market-radar/windows-cbc-automation.md", import.meta.url), "utf8");
const gitignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");

test("Windows CBC wrapper, task shim, verifier and task helpers exist", () => {
  for (const path of ["scripts/market-radar/run-cbc-monthly.ps1", "scripts/market-radar/run-cbc-monthly-task.cmd", "scripts/market-radar/verify-cbc-runtime.mjs", "scripts/market-radar/install-cbc-scheduled-task.ps1", "scripts/market-radar/show-cbc-scheduled-task.ps1", "scripts/market-radar/remove-cbc-scheduled-task.ps1"]) assert.equal(existsSync(`${root}${path}`), true);
});

test("wrapper derives project root and guards node/npm before execution", () => {
  for (const term of ["$PSScriptRoot", "Split-Path -Parent", "Get-Command node", "Get-Command npm", "Node.js runtime unavailable"]) assert.ok(wrapper.includes(term));
});

test("wrapper reads structured JSON instead of matching console text", () => {
  for (const term of ["ConvertFrom-Json", "jobId", "qualityPassed", "previousPeriod", "candidatePeriod", "safeMessage"]) assert.ok(wrapper.includes(term));
});

test("skip and controlled failure have explicit safe exit contracts", () => {
  assert.ok(wrapper.includes("$Status -in @('skipped', 'published', 'staged')"));
  assert.ok(wrapper.includes("$TestInvalidCbc"));
  assert.ok(wrapper.includes("failed safely"));
});

test("dry run does not publish and only uses the existing CBC cycle", () => {
  assert.ok(wrapper.includes("[switch]$DryRun"));
  assert.ok(wrapper.includes("run-cbc-monthly-cycle.mjs"));
  assert.equal(wrapper.includes("git push"), false);
  assert.equal(wrapper.includes("git commit"), false);
});

test("runtime wrapper fingerprints CBC LIVE and checks skipped immutability", () => {
  for (const term of ["Get-FileHash -Algorithm SHA256", "$HashBefore", "$HashAfter", "SKIPPED result changed CBC LIVE unexpectedly"]) assert.ok(wrapper.includes(term));
});

test("logs and local last-run artifacts are isolated from Git", () => {
  assert.ok(gitignore.includes("data/market-radar/logs/*"));
  assert.ok(wrapper.includes("cbc-last-run.json"));
  assert.ok(wrapper.includes("cbc-monthly-"));
});

test("scheduled task name is scoped and installer leaves it disabled", () => {
  for (const term of ["E.X Market Radar - CBC Monthly Refresh", "schtasks.exe", "Disable-ScheduledTask", "run-cbc-monthly-task.cmd"]) assert.ok(installer.includes(term));
});

test("scheduled task uses the interactive user, eight monthly dates and safe settings", () => {
  for (const term of ["schtasks.exe", "foreach ($Day in 22..28)", "/D 21", "/ST 08:30", "/IT", "-MultipleInstances IgnoreNew", "-ExecutionTimeLimit (New-TimeSpan -Minutes 30)", "-StartWhenAvailable"]) assert.ok(installer.includes(term));
});

test("task helpers are read-only scoped status and targeted removal only", () => {
  assert.ok(showTask.includes("Get-ScheduledTaskInfo"));
  assert.ok(removeTask.includes("Unregister-ScheduledTask -TaskName $TaskName"));
  assert.equal(removeTask.includes("Get-ScheduledTask |"), false);
});

test("CBC verifier is read-only and validates live/status period consistency", () => {
  for (const term of ["cbc-housing-finance-latest.json", "update-status.json", "sha256", "statusPeriod"]) assert.ok(verifier.includes(term));
  assert.equal(verifier.includes("writeFile"), false);
});

test("Windows automation documentation retains manual deployment and MOI boundary", () => {
  for (const term of ["Windows Task Scheduler", "MOI", "git commit", "git push", "disabled", "rollback-cbc-live.mjs"]) assert.ok(documentation.includes(term));
});
