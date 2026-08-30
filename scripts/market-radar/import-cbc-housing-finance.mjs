#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inflateRawSync } from "node:zlib";

const SOURCE_ID = "cbc-housing-finance";
const SOURCE_PAGE_URL = "https://www.cbc.gov.tw/tw/cp-302-192747-5edf4-1.html";

function usage() {
  return `Usage:\n  node scripts/market-radar/import-cbc-housing-finance.mjs <official-xlsx-path> --source-published-at <ISO> [--verified-at <ISO>] [--out-dir <path>] [--live-output <path>]\n\nThe XLSX must be the official Central Bank attachment titled 五大銀行新承做放款金額與利率統計表. The importer reads the worksheet directly and never modifies the source file.`;
}

function readArguments(argv) {
  const options = {
    outDir: "data/market-radar/processed",
    liveOutput: "public/data/market-radar/live/cbc-housing-finance-latest.json",
    verifiedAt: new Date().toISOString(),
  };
  let inputPath;
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--") && !inputPath) { inputPath = value; continue; }
    if (["--source-published-at", "--verified-at", "--out-dir", "--live-output"].includes(value)) {
      options[value.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${value}`);
  }
  if (!inputPath || !options.sourcePublishedAt) throw new Error(usage());
  return { inputPath: resolve(inputPath), options };
}

function xmlDecode(value) {
  return value.replace(/&#(x[\da-fA-F]+|\d+);/g, (_, code) => String.fromCodePoint(code.startsWith("x") ? Number.parseInt(code.slice(1), 16) : Number(code)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function findZipEnd(buffer) {
  for (let offset = Math.max(0, buffer.length - 65_557); offset <= buffer.length - 22; offset += 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("Invalid XLSX archive: end of central directory not found.");
}

function readZipEntries(buffer) {
  const end = findZipEnd(buffer);
  const centralDirectoryOffset = buffer.readUInt32LE(end + 16);
  const entries = new Map();
  let offset = centralDirectoryOffset;
  while (offset < buffer.length && buffer.readUInt32LE(offset) === 0x02014b50) {
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    entries.set(name, { compression, compressedSize, localOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function readZipText(buffer, entries, name) {
  const entry = entries.get(name);
  if (!entry) throw new Error(`Invalid XLSX archive: ${name} is missing.`);
  if (buffer.readUInt32LE(entry.localOffset) !== 0x04034b50) throw new Error(`Invalid XLSX archive: local header for ${name} is invalid.`);
  const nameLength = buffer.readUInt16LE(entry.localOffset + 26);
  const extraLength = buffer.readUInt16LE(entry.localOffset + 28);
  const compressed = buffer.subarray(entry.localOffset + 30 + nameLength + extraLength, entry.localOffset + 30 + nameLength + extraLength + entry.compressedSize);
  if (entry.compression === 0) return compressed.toString("utf8");
  if (entry.compression === 8) return inflateRawSync(compressed).toString("utf8");
  throw new Error(`Unsupported XLSX compression method ${entry.compression} for ${name}.`);
}

function extractText(xml) {
  return xmlDecode([...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((match) => match[1].replace(/<[^>]+>/g, "")).join(""));
}

function columnNumber(reference) {
  const letters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase();
  if (!letters) return -1;
  return [...letters].reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0) - 1;
}

export function parseCbcXlsx(buffer) {
  const entries = readZipEntries(buffer);
  const sharedStringsXml = readZipText(buffer, entries, "xl/sharedStrings.xml");
  const sharedStrings = [...sharedStringsXml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map((match) => extractText(match[1]));
  const sheetXml = readZipText(buffer, entries, "xl/worksheets/sheet1.xml");
  const rows = [];
  for (const rowMatch of sheetXml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const values = [];
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1];
      const reference = attributes.match(/\br="([A-Z]+\d+)"/)?.[1];
      const type = attributes.match(/\bt="([^"]+)"/)?.[1];
      const index = columnNumber(reference ?? "");
      if (index < 0) continue;
      const value = cellMatch[2].match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? (type === "inlineStr" ? extractText(cellMatch[2]) : "");
      values[index] = type === "s" ? (sharedStrings[Number(value)] ?? "") : xmlDecode(value);
    }
    rows.push({ rowNumber: Number(rowMatch[1]), values });
  }
  return rows;
}

function monthPeriod(year, month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return undefined;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}`;
}

export function parseCbcPeriod(value, activeRocYear) {
  const compact = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!compact) return undefined;
  const rocNamed = compact.match(/^(\d{2,3})年\s*(\d{1,2})月$/);
  const rocSpaced = compact.match(/^(\d{2,3})\s+(\d{1,2})$/);
  const western = compact.match(/^(\d{4})[\/.\-年]\s*(\d{1,2})(?:月)?$/);
  const monthOnly = compact.match(/^(\d{1,2})$/);
  if (rocNamed || rocSpaced) {
    const [, rocYear, month] = rocNamed ?? rocSpaced;
    const period = monthPeriod(Number(rocYear) + 1911, Number(month));
    return period ? { period, rocYear: Number(rocYear) } : undefined;
  }
  if (western) {
    const period = monthPeriod(Number(western[1]), Number(western[2]));
    return period ? { period, rocYear: Number(western[1]) - 1911 } : undefined;
  }
  if (monthOnly && activeRocYear !== undefined) {
    const period = monthPeriod(activeRocYear + 1911, Number(monthOnly[1]));
    return period ? { period, rocYear: activeRocYear } : undefined;
  }
  return undefined;
}

export function parseMortgageRate(value) {
  const text = String(value ?? "").replace(/[%,\s]/g, "");
  const parsed = Number(text);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 20 ? parsed : undefined;
}

export function parseMortgageAmount(value) {
  const text = String(value ?? "").replace(/[,$\s]/g, "");
  const parsed = Number(text);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function normalizeCbcRows(rows, metadata = {}) {
  const records = [];
  const rejected = [];
  const seen = new Set();
  let activeRocYear;
  let duplicateRows = 0;
  let missingPeriod = 0;
  let missingMortgageRate = 0;
  let missingMortgageAmount = 0;
  let invalidRate = 0;
  let invalidAmount = 0;
  let rawRows = 0;
  for (const row of rows) {
    const [periodCell, amountCell, rateCell] = row.values;
    if (!periodCell && !amountCell && !rateCell) continue;
    const parsedPeriod = parseCbcPeriod(periodCell, activeRocYear);
    if (!parsedPeriod?.period) {
      const periodText = String(periodCell ?? "").replace(/\s+/g, " ").trim();
      const resemblesMonthlyPeriod = /^\d{2,4}(?:\s+|年|[/.\-])\d{1,2}(?:月)?$/.test(periodText) || (activeRocYear !== undefined && /^\d{1,2}$/.test(periodText));
      if (resemblesMonthlyPeriod) { rawRows += 1; missingPeriod += 1; rejected.push({ row: row.rowNumber, reason: "invalidPeriod" }); }
      continue;
    }
    rawRows += 1;
    activeRocYear = parsedPeriod.rocYear;
    const mortgageRate = parseMortgageRate(rateCell);
    const newMortgageAmount = parseMortgageAmount(amountCell);
    if (mortgageRate === undefined) { if (String(rateCell ?? "").trim()) invalidRate += 1; else missingMortgageRate += 1; rejected.push({ row: row.rowNumber, reason: String(rateCell ?? "").trim() ? "invalidMortgageRate" : "missingMortgageRate" }); continue; }
    if (newMortgageAmount === undefined) { if (String(amountCell ?? "").trim()) invalidAmount += 1; else missingMortgageAmount += 1; rejected.push({ row: row.rowNumber, reason: String(amountCell ?? "").trim() ? "invalidMortgageAmount" : "missingMortgageAmount" }); continue; }
    const sourceRecordId = `sheet1-row-${row.rowNumber}`;
    if (seen.has(parsedPeriod.period)) { duplicateRows += 1; continue; }
    seen.add(parsedPeriod.period);
    records.push({
      id: `${SOURCE_ID}:${sourceRecordId}`,
      period: parsedPeriod.period,
      mortgageRate,
      newMortgageAmount,
      unit: { mortgageRate: "percent", newMortgageAmount: "million-twd" },
      sourceId: SOURCE_ID,
      sourceRecordId,
      publishedAt: metadata.sourcePublishedAt,
      dataPeriodStart: `${parsedPeriod.period}-01`,
      dataPeriodEnd: `${parsedPeriod.period}-${new Date(Date.UTC(Number(parsedPeriod.period.slice(0, 4)), Number(parsedPeriod.period.slice(5, 7)), 0)).getUTCDate().toString().padStart(2, "0")}`,
      isLive: true,
    });
  }
  const history = records.sort((left, right) => left.period.localeCompare(right.period));
  return {
    records: history,
    quality: {
      rawRows,
      acceptedRows: history.length,
      rejectedRows: rejected.length,
      duplicateRows,
      missingPeriod,
      missingMortgageRate,
      missingMortgageAmount,
      invalidRate,
      invalidAmount,
      warnings: ["僅擷取官方 XLSX 的購屋貸款金額（新台幣百萬元）與利率（年息百分比率）欄位。", "單月利率變化以百分點表示，不推導房價方向。"],
      rejected,
    },
  };
}

export function buildCbcLiveOutput(normalized, metadata) {
  const latest = normalized.records.at(-1);
  if (!latest) throw new Error("No valid CBC monthly mortgage records were found.");
  const previous = normalized.records.at(-2);
  const history = normalized.records.slice(-12).map((record) => ({ period: record.period, mortgageRate: record.mortgageRate, newMortgageAmount: record.newMortgageAmount }));
  return {
    status: "live",
    dataStatus: "live",
    sourceId: SOURCE_ID,
    generatedAt: metadata.generatedAt,
    sourcePublishedAt: metadata.sourcePublishedAt,
    dataPeriodStart: latest.dataPeriodStart,
    dataPeriodEnd: latest.dataPeriodEnd,
    verifiedAt: metadata.verifiedAt,
    source: {
      id: SOURCE_ID,
      name: "中央銀行房貸與購屋貸款統計",
      publisher: "中央銀行",
      type: "government",
      priority: "official",
      url: SOURCE_PAGE_URL,
      publishedAt: metadata.sourcePublishedAt,
      dataPeriodStart: latest.dataPeriodStart,
      dataPeriodEnd: latest.dataPeriodEnd,
      verifiedAt: metadata.verifiedAt,
      retrievedAt: metadata.generatedAt,
      expectedUpdateFrequency: "monthly",
      notes: "五大銀行新承做購屋貸款資料；金額單位為新台幣百萬元，利率為年息百分比率。",
      isPrimarySource: true,
      isMock: false,
    },
    freshness: { status: "normal", label: "官方月資料已驗證", expectedUpdateFrequency: "monthly" },
    latest: {
      period: latest.period,
      mortgageRate: latest.mortgageRate,
      newMortgageAmount: latest.newMortgageAmount,
      ...(previous?.mortgageRate !== undefined ? { mortgageRateChangePercentagePoints: Number((latest.mortgageRate - previous.mortgageRate).toFixed(3)) } : {}),
    },
    history,
    methodology: { notes: ["以最新有效月資料為 Finance Signal。", "利率月變動為百分點，不是相對百分比。", "房貸利率反映近期購屋融資成本環境；單月變化不應單獨解讀為房價漲跌訊號。"] },
  };
}

async function main() {
  const { inputPath, options } = readArguments(process.argv.slice(2));
  if (!inputPath.toLowerCase().endsWith(".xlsx")) throw new Error("This Phase 2C-1 importer accepts the official XLSX attachment only.");
  const workbook = await readFile(inputPath);
  const normalized = normalizeCbcRows(parseCbcXlsx(workbook), { sourcePublishedAt: options.sourcePublishedAt });
  const generatedAt = new Date().toISOString();
  const metadata = { generatedAt, sourcePublishedAt: options.sourcePublishedAt, verifiedAt: options.verifiedAt };
  const liveOutput = buildCbcLiveOutput(normalized, metadata);
  const outDir = resolve(options.outDir);
  const liveOutputPath = resolve(options.liveOutput);
  const quality = { ...normalized.quality, sourceId: SOURCE_ID, sourceFile: basename(inputPath), generatedAt, dataPeriodStart: liveOutput.dataPeriodStart, dataPeriodEnd: liveOutput.dataPeriodEnd };
  await mkdir(outDir, { recursive: true });
  await mkdir(dirname(liveOutputPath), { recursive: true });
  await writeFile(resolve(outDir, "cbc-housing-finance-normalized.json"), `${JSON.stringify(normalized.records, null, 2)}\n`, "utf8");
  await writeFile(resolve(outDir, "cbc-housing-finance-quality.json"), `${JSON.stringify(quality, null, 2)}\n`, "utf8");
  await writeFile(liveOutputPath, `${JSON.stringify(liveOutput, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ latest: liveOutput.latest, acceptedRows: quality.acceptedRows, qualityPath: resolve(outDir, "cbc-housing-finance-quality.json"), liveOutputPath }, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
