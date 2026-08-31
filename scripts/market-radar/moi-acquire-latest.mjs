#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const MOI_ALLOWED_DOMAINS = Object.freeze(["plvr.land.moi.gov.tw", "lvr.land.moi.gov.tw"]);
export const MOI_OPEN_DATA_PAGE = "https://plvr.land.moi.gov.tw/DownloadOpenData";
export const MOI_ACTIVE_DATASET_PAGE = "https://plvr.land.moi.gov.tw/Download_ajax_active";
export const MOI_KAOHSIUNG_SALE_DATASET = Object.freeze({ city: "高雄市", datasetCode: "E_lvr_land_A", transactionType: "sale", scope: "kaohsiung" });

export function assertMoiOfficialUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !MOI_ALLOWED_DOMAINS.includes(url.hostname)) throw new Error("MOI URL is outside the official allowlist.");
  return url;
}

function isoDate(year, month, day) {
  const result = new Date(Date.UTC(year, month - 1, day));
  return result.getUTCFullYear() === year && result.getUTCMonth() === month - 1 && result.getUTCDate() === day ? result.toISOString().slice(0, 10) : undefined;
}

export function parseMoiRocDate(value) {
  const match = String(value ?? "").match(/(\d{2,3})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (!match) return undefined;
  return isoDate(Number(match[1]) + 1911, Number(match[2]), Number(match[3]));
}

export function expectedMoiPublicationDate(periodEnd) {
  const match = String(periodEnd).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3]);
  if (day <= 10) return isoDate(year, month, 21);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  if (day <= 20) return isoDate(nextYear, nextMonth, 1);
  return isoDate(nextYear, nextMonth, 11);
}

export function parseMoiActiveDataset(html, sourcePageUrl = MOI_ACTIVE_DATASET_PAGE) {
  assertMoiOfficialUrl(sourcePageUrl);
  const content = String(html ?? "");
  const period = content.match(/登記日期\s*(\d{2,3}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日)\s*至\s*(\d{2,3}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日)\s*之買賣案件/);
  if (!period) throw new Error("MOI active page did not provide a verifiable sale data period.");
  const expectedDataPeriodStart = parseMoiRocDate(period[1]);
  const expectedDataPeriodEnd = parseMoiRocDate(period[2]);
  const kaohsiungRow = [...content.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].find((row) => /高雄市/.test(row[1]) && /landTypeA/.test(row[1]));
  const datasetCode = kaohsiungRow?.[1].match(/<input\b[^>]*value=["']([^"']+)["'][^>]*class=["'][^"']*landTypeA[^"']*["'][^>]*>/i)?.[1];
  if (!expectedDataPeriodStart || !expectedDataPeriodEnd || datasetCode !== MOI_KAOHSIUNG_SALE_DATASET.datasetCode) throw new Error("MOI Kaohsiung sale dataset mapping is missing or mismatched.");
  const sourcePublishedAt = expectedMoiPublicationDate(expectedDataPeriodEnd);
  if (!sourcePublishedAt) throw new Error("MOI official batch publication date could not be derived from the verified batch period.");
  return {
    sourcePageUrl,
    officialFileName: `${datasetCode}.csv`,
    datasetCode,
    sourcePublishedAt,
    expectedDataPeriodStart,
    expectedDataPeriodEnd,
    scope: MOI_KAOHSIUNG_SALE_DATASET.scope,
    transactionType: MOI_KAOHSIUNG_SALE_DATASET.transactionType,
    downloadUrl: new URL(`/Download?fileName=${encodeURIComponent(`${datasetCode}.csv`.toLowerCase())}`, sourcePageUrl).toString(),
  };
}

export function validateMoiCsvResponse({ response, bytes, metadata }) {
  assertMoiOfficialUrl(metadata.downloadUrl); assertMoiOfficialUrl(response.url || metadata.downloadUrl);
  if (!response.ok) throw new Error(`MOI download failed with HTTP ${response.status}.`);
  if (!bytes.length) throw new Error("MOI download is empty.");
  const disposition = response.headers.get("content-disposition") ?? "";
  const responseFileName = decodeURIComponent(disposition.match(/filename=["']?([^;"'\r\n]+)/i)?.[1]?.trim() ?? "");
  if (responseFileName.toLowerCase() !== metadata.officialFileName.toLowerCase()) throw new Error("MOI response filename does not match the official Kaohsiung sale dataset metadata.");
  const csv = bytes.toString("utf8");
  const [header = "", schema = ""] = csv.split(/\r?\n/, 3);
  if (!/鄉鎮市區/.test(header) || !/交易標的/.test(header) || !/交易年月日/.test(header) || !/總價元/.test(header) || !/編號/.test(header)) throw new Error("MOI CSV schema is missing required official columns.");
  if (!/villages.*district/i.test(schema) || !/transaction.*year/i.test(schema)) throw new Error("MOI CSV bilingual schema row is missing or changed.");
  return { contentType: response.headers.get("content-type") ?? "", byteLength: bytes.length, responseFileName, sha256: createHash("sha256").update(bytes).digest("hex") };
}

export async function inspectMoiLatest({ activeDatasetPage = MOI_ACTIVE_DATASET_PAGE, fetchImpl = fetch } = {}) {
  assertMoiOfficialUrl(activeDatasetPage);
  const response = await fetchImpl(activeDatasetPage, { redirect: "follow" });
  if (!response.ok) throw new Error(`MOI active dataset page failed with HTTP ${response.status}.`);
  return parseMoiActiveDataset(await response.text(), activeDatasetPage);
}

export async function checkMoiLatest({ livePath = "public/data/market-radar/live/moi-real-price-latest.json", fetchImpl = fetch } = {}) {
  const metadata = await inspectMoiLatest({ fetchImpl });
  let current;
  try { current = JSON.parse(await readFile(resolve(livePath), "utf8")); } catch { /* missing live is a candidate */ }
  const sameOrOlder = current?.dataPeriodEnd && metadata.expectedDataPeriodEnd <= current.dataPeriodEnd;
  if (sameOrOlder) return { status: "skipped", changed: false, currentPeriod: { start: current.dataPeriodStart, end: current.dataPeriodEnd }, candidatePeriod: { start: metadata.expectedDataPeriodStart, end: metadata.expectedDataPeriodEnd }, ...metadata };
  return { status: "candidate", changed: true, currentPeriod: current ? { start: current.dataPeriodStart, end: current.dataPeriodEnd } : undefined, candidatePeriod: { start: metadata.expectedDataPeriodStart, end: metadata.expectedDataPeriodEnd }, ...metadata };
}

export async function acquireMoiLatest({ rawDirectory = "data/market-radar/raw/moi", fetchImpl = fetch } = {}) {
  const metadata = await inspectMoiLatest({ fetchImpl });
  const response = await fetchImpl(metadata.downloadUrl, { redirect: "follow" });
  const bytes = Buffer.from(await response.arrayBuffer());
  const attachment = validateMoiCsvResponse({ response, bytes, metadata });
  const directory = resolve(rawDirectory); await mkdir(directory, { recursive: true });
  const rawFilePath = resolve(directory, `${metadata.sourcePublishedAt}-${attachment.responseFileName}`);
  await writeFile(rawFilePath, bytes);
  return { ...metadata, ...attachment, rawFilePath, retrievedAt: new Date().toISOString() };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const checkOnly = process.argv.includes("--check");
  (checkOnly ? checkMoiLatest() : acquireMoiLatest()).then((value) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
