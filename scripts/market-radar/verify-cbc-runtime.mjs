#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const livePath = resolve(root, "public/data/market-radar/live/cbc-housing-finance-latest.json");
const updateStatusPath = resolve(root, "public/data/market-radar/update-status.json");

if (!existsSync(livePath) || !existsSync(updateStatusPath)) {
  process.stdout.write(`${JSON.stringify({ ok: false, safeMessage: "CBC runtime files are unavailable." })}\n`);
  process.exitCode = 1;
} else {
  const rawLive = readFileSync(livePath);
  const live = JSON.parse(rawLive.toString("utf8"));
  const status = JSON.parse(readFileSync(updateStatusPath, "utf8"));
  const period = live?.latest?.period;
  const statusPeriod = status?.sources?.cbc?.latestDataPeriodStart?.slice(0, 7);
  const ok = live?.status === "live" && typeof period === "string" && (!statusPeriod || statusPeriod === period);
  process.stdout.write(`${JSON.stringify({ ok, livePathExists: true, updateStatusExists: true, period, statusPeriod, sha256: createHash("sha256").update(rawLive).digest("hex"), safeMessage: ok ? "CBC runtime files are consistent." : "CBC runtime files require review." })}\n`);
  if (!ok) process.exitCode = 1;
}
