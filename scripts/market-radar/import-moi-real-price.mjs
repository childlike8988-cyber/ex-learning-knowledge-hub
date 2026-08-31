#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SOURCE_ID = "moi-real-price-sales";
const SOURCE_URL = "https://plvr.land.moi.gov.tw/DownloadOpenData";
const CITY = "高雄市";
const PING_SQUARE_METERS = 3.305785;

function usage() {
  return `Usage:\n  node scripts/market-radar/import-moi-real-price.mjs <official-csv-path> --source-published-at <ISO> --data-period-start <YYYY-MM-DD> --data-period-end <YYYY-MM-DD> [--county-file] [--retrieved-at <ISO>] [--verified-at <ISO>] [--out-dir <path>] [--live-output <path>]\n\nUse --county-file only when the downloaded official CSV is confirmed to contain Kaohsiung City records exclusively. Otherwise the CSV must expose an official county/city column with the exact value 高雄市.`;
}

function readArguments(argv) {
  const options = { countyFile: false, outDir: "data/market-radar/processed", liveOutput: "public/data/market-radar/live/moi-real-price-latest.json", verifiedAt: new Date().toISOString() };
  let inputPath;
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--") && !inputPath) { inputPath = value; continue; }
    if (value === "--county-file") { options.countyFile = true; continue; }
    if (["--source-published-at", "--data-period-start", "--data-period-end", "--retrieved-at", "--verified-at", "--out-dir", "--live-output"].includes(value)) {
      options[value.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${value}`);
  }
  if (!inputPath || !options.sourcePublishedAt || !options.dataPeriodStart || !options.dataPeriodEnd) throw new Error(usage());
  return { inputPath: resolve(inputPath), options };
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"' && quoted && next === '"') { field += '"'; index += 1; continue; }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === "," && !quoted) { row.push(field); field = ""; continue; }
    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim().length > 0)) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += character;
  }
  row.push(field);
  if (row.some((value) => value.trim().length > 0)) rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return value.replace(/^\uFEFF/, "").trim().replace(/[\s\u3000]/g, "");
}

function findColumn(headers, candidates) {
  for (const candidate of candidates) {
    const index = headers.findIndex((header) => header === candidate);
    if (index >= 0) return index;
  }
  return -1;
}

function requiredColumn(headers, candidates, label) {
  const index = findColumn(headers, candidates);
  if (index < 0) throw new Error(`Official CSV is missing the required ${label} column. Accepted headers: ${candidates.join(", ")}`);
  return index;
}

function optionalColumn(headers, candidates) {
  return findColumn(headers, candidates);
}

function readCell(row, index) {
  return index < 0 ? "" : (row[index] ?? "").trim();
}

function parseNumber(value) {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized || !/^-?\d+(?:\.\d+)?$/.test(normalized)) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isoDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return date.toISOString().slice(0, 10);
}

export function parseRocDate(value) {
  const source = String(value ?? "").trim();
  if (!source) return undefined;
  const delimited = source.match(/^(\d{2,4})\D+(\d{1,2})\D+(\d{1,2})$/);
  if (delimited) {
    const rawYear = Number(delimited[1]);
    const year = rawYear >= 1911 ? rawYear : rawYear + 1911;
    return isoDate(year, Number(delimited[2]), Number(delimited[3]));
  }
  const digits = source.replace(/\D/g, "");
  if (/^(?:19|20)\d{6}$/.test(digits)) return isoDate(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)), Number(digits.slice(6, 8)));
  if (/^\d{6,7}$/.test(digits)) {
    const rocYearLength = digits.length - 4;
    const rocYear = Number(digits.slice(0, rocYearLength));
    return isoDate(rocYear + 1911, Number(digits.slice(rocYearLength, rocYearLength + 2)), Number(digits.slice(rocYearLength + 2)));
  }
  return undefined;
}

export function squareMetersToPing(squareMeters) {
  return squareMeters / PING_SQUARE_METERS;
}

export function pricePerSquareMeterToTenThousandPerPing(pricePerSquareMeter) {
  return (pricePerSquareMeter * PING_SQUARE_METERS) / 10_000;
}

function fingerprint(values) {
  let hash = 2166136261;
  for (const character of values.join("|") ) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `derived-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function isOfficialSchemaTranslationRow(row, column) {
  return /villages.*district/i.test(readCell(row, column.district))
    && /transaction.*year/i.test(readCell(row, column.transactionDate))
    && /total.*price/i.test(readCell(row, column.totalPrice));
}

function isValidDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T.+)?$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function validateMoiQualityGate(quality, metadata) {
  const checks = {
    acceptedRows: quality.acceptedRows > 0,
    districtCount: quality.districtCount > 0,
    districtCoverage: quality.missingDistrict !== quality.rawRows,
    validDataPeriod: isValidDate(metadata.dataPeriodStart) && isValidDate(metadata.dataPeriodEnd) && metadata.dataPeriodStart <= metadata.dataPeriodEnd,
    sourceMetadataComplete: isValidDate(metadata.sourcePublishedAt) && isValidDate(metadata.retrievedAt) && isValidDate(metadata.verifiedAt),
  };
  return { passed: Object.values(checks).every(Boolean), checks };
}

export function normalizeMoiCsv(csvText, { countyFile = false } = {}) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error("Official CSV contains no data rows.");
  const headers = rows[0].map(normalizeHeader);
  const column = {
    county: optionalColumn(headers, ["縣市", "縣市別", "交易縣市", "所在縣市"]),
    district: requiredColumn(headers, ["鄉鎮市區", "行政區", "district"], "district"),
    transactionDate: requiredColumn(headers, ["交易年月日", "交易日期", "transactionDate"], "transaction date"),
    transactionTarget: requiredColumn(headers, ["交易標的", "transactionTarget"], "transaction target"),
    totalPrice: requiredColumn(headers, ["總價元", "總價", "totalPrice"], "total price"),
    sourceRecordId: optionalColumn(headers, ["編號", "序號", "ID", "sourceRecordId"]),
    buildingType: optionalColumn(headers, ["建物型態", "建物現況格局", "buildingType"]),
    unitPrice: optionalColumn(headers, ["單價元平方公尺", "單價元/平方公尺", "unitPricePerSquareMeter"]),
    buildingArea: optionalColumn(headers, ["建物移轉總面積平方公尺", "建物移轉總面積", "buildingAreaSquareMeters"]),
    landArea: optionalColumn(headers, ["土地移轉總面積平方公尺", "土地移轉總面積", "landAreaSquareMeters"]),
    parkingPrice: optionalColumn(headers, ["車位總價元", "parkingPrice"]),
    completionDate: optionalColumn(headers, ["建築完成年月", "buildingCompletionDate"]),
    note: optionalColumn(headers, ["備註", "note"]),
  };
  if (column.county < 0 && !countyFile) throw new Error("Official county/city column was not found. Re-run only after confirming this is a Kaohsiung-exclusive official file, then pass --county-file.");

  const accepted = [];
  const rejected = [];
  const seen = new Set();
  let duplicateRows = 0;
  let missingTransactionDate = 0;
  let missingPrice = 0;
  let missingDistrict = 0;
  let skippedSchemaRows = 0;
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (isOfficialSchemaTranslationRow(row, column)) { skippedSchemaRows += 1; continue; }
    const district = readCell(row, column.district);
    const rawDate = readCell(row, column.transactionDate);
    const transactionDate = parseRocDate(rawDate);
    const totalPrice = parseNumber(readCell(row, column.totalPrice));
    const target = readCell(row, column.transactionTarget);
    const county = readCell(row, column.county);
    if (column.county >= 0 && county !== CITY) continue;
    if (!district) { missingDistrict += 1; rejected.push({ row: index + 1, reason: "missingDistrict" }); continue; }
    if (!transactionDate) { missingTransactionDate += 1; rejected.push({ row: index + 1, reason: "invalidTransactionDate" }); continue; }
    if (totalPrice === undefined || totalPrice < 0) { missingPrice += 1; rejected.push({ row: index + 1, reason: "invalidTotalPrice" }); continue; }
    if (!target) { rejected.push({ row: index + 1, reason: "missingTransactionTarget" }); continue; }
    const sourceRecordId = readCell(row, column.sourceRecordId) || fingerprint([district, transactionDate, target, String(totalPrice), readCell(row, column.buildingArea), readCell(row, column.landArea)]);
    if (seen.has(sourceRecordId)) { duplicateRows += 1; continue; }
    seen.add(sourceRecordId);
    const optionalNumber = (columnIndex) => parseNumber(readCell(row, columnIndex));
    const completionDate = parseRocDate(readCell(row, column.completionDate));
    accepted.push({
      id: `${SOURCE_ID}:${sourceRecordId}`,
      district,
      transactionDate,
      transactionTarget: target,
      ...(readCell(row, column.buildingType) ? { buildingType: readCell(row, column.buildingType) } : {}),
      totalPrice,
      ...(optionalNumber(column.unitPrice) !== undefined ? { unitPricePerSquareMeter: optionalNumber(column.unitPrice) } : {}),
      ...(optionalNumber(column.buildingArea) !== undefined ? { buildingAreaSquareMeters: optionalNumber(column.buildingArea) } : {}),
      ...(optionalNumber(column.landArea) !== undefined ? { landAreaSquareMeters: optionalNumber(column.landArea) } : {}),
      ...(optionalNumber(column.parkingPrice) !== undefined ? { parkingPrice: optionalNumber(column.parkingPrice) } : {}),
      ...(completionDate ? { buildingCompletionDate: completionDate } : {}),
      rawSourceId: SOURCE_ID,
      sourceRecordId,
      isLive: true,
    });
  }
  const counts = new Map();
  for (const transaction of accepted) counts.set(transaction.district, (counts.get(transaction.district) ?? 0) + 1);
  const districtTransactionCounts = [...counts.entries()].map(([district, transactionCount]) => ({ district, transactionCount })).sort((left, right) => right.transactionCount - left.transactionCount || left.district.localeCompare(right.district, "zh-Hant"));
  return {
    headers,
    transactions: accepted,
    metrics: { transactionCount: accepted.length, districtTransactionCounts },
    quality: {
      rawRows: rows.length - 1 - skippedSchemaRows,
      acceptedRows: accepted.length,
      rejectedRows: rejected.length,
      duplicateRows,
      districtCount: counts.size,
      missingTransactionDate,
      missingPrice,
      missingDistrict,
      excludedSpecialTransactions: false,
      warnings: [
        ...(skippedSchemaRows > 0 ? [`略過 ${skippedSchemaRows} 列官方雙語 schema 說明列。`] : []),
        "未套用額外特殊交易文字篩選；官方公開揭露資料本身的篩選狀態請以來源說明為準。",
        ...(column.sourceRecordId < 0 ? ["CSV 未提供可辨識的官方 record ID，使用可重現欄位指紋去重。"] : []),
      ],
      rejected,
    },
  };
}

export function buildLiveOutput(normalized, metadata) {
  const source = {
    id: SOURCE_ID,
    name: "內政部不動產實價登錄",
    publisher: "內政部地政司",
    type: "public-record",
    priority: "official",
    url: SOURCE_URL,
    publishedAt: metadata.sourcePublishedAt,
    dataPeriodStart: metadata.dataPeriodStart,
    dataPeriodEnd: metadata.dataPeriodEnd,
    verifiedAt: metadata.verifiedAt,
    retrievedAt: metadata.retrievedAt,
    expectedUpdateFrequency: "irregular",
    notes: "官方 Open Data 為批次靜態資料；實價登錄具有申報與發布時間差，非即時成交行情。",
    isPrimarySource: true,
    isMock: false,
  };
  return {
    status: "live",
    dataStatus: "live",
    sourceId: SOURCE_ID,
    generatedAt: metadata.generatedAt,
    sourcePublishedAt: metadata.sourcePublishedAt,
    dataPeriodStart: metadata.dataPeriodStart,
    dataPeriodEnd: metadata.dataPeriodEnd,
    verifiedAt: metadata.verifiedAt,
    retrievedAt: metadata.retrievedAt,
    methodologyVersion: "moi-real-price-methodology-v1",
    source,
    freshness: { status: "normal", label: "官方批次資料已驗證", expectedUpdateFrequency: "irregular" },
    metrics: normalized.metrics,
    methodology: {
      transactionCountDefinition: "一筆通過必要欄位驗證且去重後的官方實價登錄買賣 record，計為一筆成交紀錄。",
      kaohsiungFilter: "若 CSV 具官方縣市欄位，以完全等於「高雄市」篩選；若無該欄位，僅接受明確標記為高雄市專屬的官方檔案。",
      excludedSpecialTransactions: false,
      notes: ["實價登錄具有申報與發布時間差，非即時成交行情。", "本階段僅發布成交件數與行政區成交件數，不發布平均或中位數價格。"],
    },
  };
}

async function main() {
  const { inputPath, options } = readArguments(process.argv.slice(2));
  const csvText = await readFile(inputPath, "utf8");
  const normalized = normalizeMoiCsv(csvText, { countyFile: options.countyFile });
  const generatedAt = new Date().toISOString();
  const metadata = { generatedAt, sourcePublishedAt: options.sourcePublishedAt, dataPeriodStart: options.dataPeriodStart, dataPeriodEnd: options.dataPeriodEnd, retrievedAt: options.retrievedAt ?? generatedAt, verifiedAt: options.verifiedAt };
  const outputDirectory = resolve(options.outDir);
  const liveOutputPath = resolve(options.liveOutput);
  const quality = { ...normalized.quality, sourceId: SOURCE_ID, sourceFile: basename(inputPath), generatedAt, sourcePublishedAt: options.sourcePublishedAt, retrievedAt: metadata.retrievedAt, verifiedAt: options.verifiedAt, dataPeriodStart: options.dataPeriodStart, dataPeriodEnd: options.dataPeriodEnd };
  quality.qualityGate = validateMoiQualityGate(quality, metadata);
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(dirname(liveOutputPath), { recursive: true });
  await writeFile(resolve(outputDirectory, "moi-real-price-normalized.json"), `${JSON.stringify(normalized.transactions, null, 2)}\n`, "utf8");
  await writeFile(resolve(outputDirectory, "moi-real-price-quality.json"), `${JSON.stringify(quality, null, 2)}\n`, "utf8");
  if (!quality.qualityGate.passed) throw new Error(`MOI quality gate failed: ${JSON.stringify(quality.qualityGate.checks)}`);
  await writeFile(liveOutputPath, `${JSON.stringify(buildLiveOutput(normalized, metadata), null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ transactionCount: normalized.metrics.transactionCount, districtCount: normalized.metrics.districtTransactionCounts.length, qualityPath: resolve(outputDirectory, "moi-real-price-quality.json"), liveOutputPath }, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
