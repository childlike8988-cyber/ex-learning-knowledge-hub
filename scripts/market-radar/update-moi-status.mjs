#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { safeJsonWrite } from "./automation-utils.mjs";
const outcome = process.argv[process.argv.indexOf("--outcome") + 1];
if (!new Set(["success", "skipped", "failed"]).has(outcome)) throw new Error("Usage: --outcome <success|skipped|failed>");
const statusPath = resolve(process.cwd(), "public/data/market-radar/update-status.json"); const livePath = resolve(process.cwd(), "public/data/market-radar/live/moi-real-price-latest.json");
const current = existsSync(statusPath) ? JSON.parse(readFileSync(statusPath, "utf8")) : { sources: {} }; const live = existsSync(livePath) ? JSON.parse(readFileSync(livePath, "utf8")) : undefined; const now = new Date().toISOString(); const prior = current.sources?.moiLatest ?? { sourceId: "moi-real-price-sales" };
const moiLatest = outcome === "success" && live?.status === "live" ? { sourceId: "moi-real-price-sales", lastSuccessfulUpdateAt: now, lastAttemptAt: now, latestSourcePublishedAt: live.sourcePublishedAt, latestDataPeriodStart: live.dataPeriodStart, latestDataPeriodEnd: live.dataPeriodEnd, status: "live", freshness: live.freshness?.status ?? "normal" } : outcome === "skipped" ? { ...prior, lastAttemptAt: now, status: prior.status ?? "live" } : { ...prior, lastAttemptAt: now, status: "failed", freshness: "aging" };
await safeJsonWrite(statusPath, { ...current, generatedAt: now, automationEnabled: false, automation: { globalReady: true, jobs: { moiLatestRefresh: true, moiHistoryBackfill: false, cbcMonthlyRefresh: true } }, overallStatus: outcome === "failed" ? "degraded" : "partial", safeMessage: outcome === "success" ? "內政部最新高雄市買賣批次已完成驗證與本機發布。" : outcome === "skipped" ? "內政部尚無較新的高雄市買賣批次；現行資料維持使用。" : "內政部資料更新檢查暫時失敗，現行資料仍可使用。", sources: { ...current.sources, moiLatest } });
process.stdout.write(`${JSON.stringify({ outcome, statusPath }, null, 2)}\n`);
