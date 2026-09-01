#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { reconcileMoiLatestUpdateStatus, safeJsonWrite } from "./automation-utils.mjs";
const outcome = process.argv[process.argv.indexOf("--outcome") + 1];
if (!new Set(["success", "skipped", "failed"]).has(outcome)) throw new Error("Usage: --outcome <success|skipped|failed>");
const statusPath = resolve(process.cwd(), "public/data/market-radar/update-status.json"); const livePath = resolve(process.cwd(), "public/data/market-radar/live/moi-real-price-latest.json");
const current = existsSync(statusPath) ? JSON.parse(readFileSync(statusPath, "utf8")) : { sources: {} }; const live = existsSync(livePath) ? JSON.parse(readFileSync(livePath, "utf8")) : undefined; const now = new Date().toISOString();
await safeJsonWrite(statusPath, reconcileMoiLatestUpdateStatus({ current, liveData: live, outcome, now }));
process.stdout.write(`${JSON.stringify({ outcome, statusPath }, null, 2)}\n`);
