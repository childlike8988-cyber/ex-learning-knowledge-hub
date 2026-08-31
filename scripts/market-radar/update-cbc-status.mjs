#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { safeJsonWrite } from "./automation-utils.mjs";

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const outcome = option("--outcome");
if (!new Set(["success", "skipped", "failed"]).has(outcome)) throw new Error("Usage: node scripts/market-radar/update-cbc-status.mjs --outcome <success|skipped|failed> [--safe-message <text>]");
const statusPath = resolve(process.cwd(), "public/data/market-radar/update-status.json");
const livePath = resolve(process.cwd(), "public/data/market-radar/live/cbc-housing-finance-latest.json");
const current = existsSync(statusPath) ? JSON.parse(readFileSync(statusPath, "utf8")) : { sources: {} };
const live = existsSync(livePath) ? JSON.parse(readFileSync(livePath, "utf8")) : undefined;
const now = new Date().toISOString();
const previousCbc = current.sources?.cbc ?? { sourceId: "cbc-housing-finance" };
const safeMessage = option("--safe-message");
const cbc = outcome === "success" && live?.status === "live"
  ? { sourceId: "cbc-housing-finance", lastSuccessfulUpdateAt: now, lastAttemptAt: now, latestSourcePublishedAt: live.sourcePublishedAt, latestDataPeriodStart: live.dataPeriodStart, latestDataPeriodEnd: live.dataPeriodEnd, status: "live", freshness: live.freshness?.status ?? "normal" }
  : outcome === "skipped"
    ? { ...previousCbc, lastAttemptAt: now, status: previousCbc.status ?? "live" }
    : { ...previousCbc, lastAttemptAt: now, status: "failed", freshness: "aging" };
const next = {
  ...current,
  generatedAt: now,
  automationEnabled: false,
  automation: current.automation ?? {
    globalReady: true,
    jobs: { moiLatestRefresh: false, moiHistoryBackfill: false, cbcMonthlyRefresh: true },
  },
  overallStatus: outcome === "failed" ? "degraded" : current.overallStatus ?? "partial",
  safeMessage: safeMessage ?? (outcome === "success" ? "中央銀行資料已完成驗證與本機發布。" : outcome === "skipped" ? "中央銀行尚無較新的月資料；現行資料維持使用。" : "中央銀行資料更新檢查暫時失敗，現行資料仍可使用。"),
  sources: { ...current.sources, cbc },
};
await safeJsonWrite(statusPath, next);
process.stdout.write(`${JSON.stringify({ outcome, statusPath }, null, 2)}\n`);
