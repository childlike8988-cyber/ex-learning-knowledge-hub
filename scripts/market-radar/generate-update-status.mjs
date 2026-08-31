#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildPublicUpdateStatus, safeJsonWrite } from "./automation-utils.mjs";

function readJsonIfPresent(filePath) {
  if (!existsSync(filePath)) return undefined;
  try { return JSON.parse(readFileSync(filePath, "utf8")); } catch { return undefined; }
}

const root = resolve(process.cwd());
const liveDirectory = resolve(root, "public/data/market-radar/live");
const outputPath = resolve(root, "public/data/market-radar/update-status.json");
const moiLatest = readJsonIfPresent(resolve(liveDirectory, "moi-real-price-latest.json"));
const cbcLatest = readJsonIfPresent(resolve(liveDirectory, "cbc-housing-finance-latest.json"));
const moiHistory = readJsonIfPresent(resolve(liveDirectory, "moi-real-price-history.json"));

const status = buildPublicUpdateStatus({
  generatedAt: new Date().toISOString(),
  moiLatest,
  cbcLatest,
  moiHistoryReady: moiHistory?.status === "live" && Array.isArray(moiHistory.periods) && moiHistory.periods.length > 1,
});

await safeJsonWrite(outputPath, status);
process.stdout.write(`${JSON.stringify({ outputPath, overallStatus: status.overallStatus, automationEnabled: status.automationEnabled }, null, 2)}\n`);
