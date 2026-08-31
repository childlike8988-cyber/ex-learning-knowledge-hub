#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { safeJsonWrite } from "./automation-utils.mjs";
const backupPath = resolve(process.cwd(), "data/market-radar/backups/moi-real-price-known-good.json");
const livePath = resolve(process.cwd(), "public/data/market-radar/live/moi-real-price-latest.json");
if (!existsSync(backupPath)) throw new Error("No known-good MOI backup is available; live data was not changed.");
const backup = JSON.parse(readFileSync(backupPath, "utf8"));
if (backup?.status !== "live" || backup?.sourceId !== "moi-real-price-sales") throw new Error("Known-good MOI backup is invalid; live data was not changed.");
await safeJsonWrite(livePath, backup);
process.stdout.write(`${JSON.stringify({ restored: true, livePath }, null, 2)}\n`);
