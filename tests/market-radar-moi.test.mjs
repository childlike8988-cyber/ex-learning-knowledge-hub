import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import {
  buildLiveOutput,
  normalizeMoiCsv,
  parseRocDate,
  pricePerSquareMeterToTenThousandPerPing,
  squareMetersToPing,
} from "../scripts/market-radar/import-moi-real-price.mjs";

const execFileAsync = promisify(execFile);
const fixturePath = new URL("./fixtures/moi-kaohsiung-sample.csv", import.meta.url);
const csv = await readFile(fixturePath, "utf8");
const normalized = normalizeMoiCsv(csv);

test("MOI source pipeline normalizes only verified Kaohsiung records and validates ROC dates", () => {
  assert.equal(parseRocDate("1150820"), "2026-08-20");
  assert.equal(parseRocDate("115/08/19"), "2026-08-19");
  assert.equal(parseRocDate("20260820"), "2026-08-20");
  assert.equal(parseRocDate("1151332"), undefined);
  assert.equal(normalized.metrics.transactionCount, 3);
  assert.deepEqual(normalized.metrics.districtTransactionCounts.map((item) => item.district).sort(), ["左營區", "楠梓區", "鳳山區"].sort());
  assert.ok(normalized.metrics.districtTransactionCounts.every((item) => item.transactionCount === 1));
  assert.equal(normalized.quality.rawRows, 7);
  assert.equal(normalized.quality.rejectedRows, 2);
  assert.equal(normalized.quality.duplicateRows, 1);
  assert.equal(normalized.quality.missingDistrict, 1);
  assert.equal(normalized.quality.missingTransactionDate, 1);
  assert.ok(normalized.transactions.every((transaction) => transaction.isLive && transaction.rawSourceId === "moi-real-price-sales"));
});

test("MOI output has official source metadata, live status and deterministic conversion utilities", () => {
  const output = buildLiveOutput(normalized, {
    generatedAt: "2026-08-30T10:00:00.000Z",
    sourcePublishedAt: "2026-08-29T00:00:00.000Z",
    dataPeriodStart: "2026-08-01",
    dataPeriodEnd: "2026-08-20",
    verifiedAt: "2026-08-30T10:00:00.000Z",
  });
  assert.equal(output.status, "live");
  assert.equal(output.dataStatus, "live");
  assert.equal(output.source.priority, "official");
  assert.equal(output.source.isPrimarySource, true);
  assert.equal(output.source.isMock, false);
  assert.equal(output.metrics.transactionCount, 3);
  assert.match(output.methodology.transactionCountDefinition, /去重/);
  assert.equal(squareMetersToPing(3.305785), 1);
  assert.equal(pricePerSquareMeterToTenThousandPerPing(100000), 33.05785);
});

test("the import command writes isolated processed and live JSON without changing the source file", async () => {
  const temp = await mkdtemp(join(tmpdir(), "market-radar-moi-"));
  const processed = join(temp, "processed");
  const live = join(temp, "moi-real-price-latest.json");
  const script = fileURLToPath(new URL("../scripts/market-radar/import-moi-real-price.mjs", import.meta.url));
  await execFileAsync(process.execPath, [script, fileURLToPath(fixturePath), "--source-published-at", "2026-08-29T00:00:00.000Z", "--data-period-start", "2026-08-01", "--data-period-end", "2026-08-20", "--verified-at", "2026-08-30T10:00:00.000Z", "--out-dir", processed, "--live-output", live]);
  const quality = JSON.parse(await readFile(join(processed, "moi-real-price-quality.json"), "utf8"));
  const liveOutput = JSON.parse(await readFile(live, "utf8"));
  assert.equal(quality.acceptedRows, 3);
  assert.equal(quality.duplicateRows, 1);
  assert.equal(liveOutput.status, "live");
  assert.equal(liveOutput.metrics.transactionCount, 3);
});

test("Live loader declares an updating fallback when no validated live JSON exists", async () => {
  const loader = await readFile(new URL("../src/lib/market-radar/loadMarketRadarLiveData.ts", import.meta.url), "utf8");
  for (const term of ["loadMarketRadarLiveData", "existsSync", "status: \"updating\"", "官方資料更新中", "Live JSON 尚未產製"]) assert.ok(loader.includes(term));
});
