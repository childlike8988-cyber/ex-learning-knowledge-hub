#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { safeJsonWrite } from "./automation-utils.mjs";

const backupPath = resolve(process.cwd(), "data/market-radar/backups/cbc-housing-finance-known-good.json");
const livePath = resolve(process.cwd(), "public/data/market-radar/live/cbc-housing-finance-latest.json");
if (!existsSync(backupPath)) throw new Error("No known-good CBC backup is available; live data was not changed.");
const backup = JSON.parse(readFileSync(backupPath, "utf8"));
if (backup?.status !== "live" || backup?.sourceId !== "cbc-housing-finance") throw new Error("Known-good CBC backup is invalid; live data was not changed.");
await safeJsonWrite(livePath, backup);
process.stdout.write(`${JSON.stringify({ restored: true, livePath }, null, 2)}\n`);
