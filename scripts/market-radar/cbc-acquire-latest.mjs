#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const CBC_ALLOWED_DOMAINS = Object.freeze(["www.cbc.gov.tw", "cbc.gov.tw"]);
export const CBC_OFFICIAL_RELEASE_LISTING_PAGE = "https://www.cbc.gov.tw/tw/lp-302-1.html";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function assertCbcOfficialUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !CBC_ALLOWED_DOMAINS.includes(url.hostname)) throw new Error("CBC attachment URL is outside the official allowlist.");
  return url;
}

export function rocMonthToPeriod(value) {
  const match = String(value ?? "").match(/(?:本\()?\s*(\d{2,3})\s*\)?年\s*(\d{1,2})\s*月/);
  if (!match) return undefined;
  const year = Number(match[1]) + 1911;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return undefined;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}`;
}

export function parseCbcReleaseListing(html, sourceListingPageUrl = CBC_OFFICIAL_RELEASE_LISTING_PAGE) {
  const entries = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((item) => {
      const publishedAt = item[1].match(/<time[^>]*>\s*(\d{4}-\d{2}-\d{2})\s*<\/time>/i)?.[1];
      const link = [...item[1].matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*title=["']([^"']*五大銀行新承做放款平均利率[^"']*)["'][^>]*>/gi)].at(0);
      return publishedAt && link ? { sourcePublishedAt: publishedAt, releasePageUrl: new URL(link[1], sourceListingPageUrl).toString(), title: link[2] } : undefined;
    })
    .filter(Boolean);
  const latest = entries.at(0);
  if (!latest) throw new Error("CBC official release listing has no eligible mortgage release.");
  assertCbcOfficialUrl(latest.releasePageUrl);
  return { sourceListingPageUrl, ...latest };
}

export function parseCbcReleasePage(html, sourcePageUrl) {
  const plainText = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ");
  const publishedAt = plainText.match(/發布日期\s*[:：]\s*(\d{4}-\d{2}-\d{2})/)?.[1];
  const title = html.match(/<h[1-3][^>]*>\s*([^<]+?)\s*<\/h[1-3]>/i)?.[1]?.trim() ?? plainText.match(/(\d{2,3})年\s*(\d{1,2})月五大銀行新承做放款平均利率/)?.[0];
  const attachment = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({ href: match[1], label: match[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(), title: match[0].match(/\btitle=["']([^"']+)["']/i)?.[1] }))
    .find((item) => /XLSX/i.test(item.label) || /\.xlsx$/i.test(item.title ?? ""));
  if (!publishedAt || !title || !attachment) throw new Error("CBC release page metadata or XLSX attachment is unavailable.");
  const downloadUrl = new URL(attachment.href, sourcePageUrl).toString();
  assertCbcOfficialUrl(downloadUrl);
  const expectedPeriod = rocMonthToPeriod(title);
  if (!expectedPeriod) throw new Error("CBC release period could not be determined from the official title.");
  return { sourcePageUrl, downloadUrl, sourcePublishedAt: publishedAt, expectedDataPeriod: expectedPeriod, attachmentLabel: attachment.label, officialFileName: attachment.title };
}

export function validateCbcXlsxResponse({ response, bytes, downloadUrl }) {
  assertCbcOfficialUrl(downloadUrl);
  assertCbcOfficialUrl(response.url || downloadUrl);
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const disposition = response.headers.get("content-disposition") ?? "";
  const officialFileName = disposition.match(/filename\*?=(?:UTF-8''|"?)([^;"\r\n]+)/i)?.[1]?.trim();
  const isZip = bytes.length >= 4 && bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  if (!response.ok) throw new Error(`CBC download failed with HTTP ${response.status}.`);
  if (bytes.length === 0) throw new Error("CBC download is empty.");
  if (!contentType.includes(XLSX_MIME)) throw new Error("CBC attachment content type is not XLSX.");
  if (!officialFileName?.toLowerCase().endsWith(".xlsx")) throw new Error("CBC attachment filename is not XLSX.");
  if (!isZip) throw new Error("CBC attachment is not a valid XLSX ZIP container.");
  return { officialFileName: decodeURIComponent(officialFileName), contentType, byteLength: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

export async function inspectCbcLatestRelease({ sourceListingPageUrl = CBC_OFFICIAL_RELEASE_LISTING_PAGE, fetchImpl = fetch }) {
  assertCbcOfficialUrl(sourceListingPageUrl);
  const listingResponse = await fetchImpl(sourceListingPageUrl, { redirect: "follow" });
  if (!listingResponse.ok) throw new Error(`CBC release listing failed with HTTP ${listingResponse.status}.`);
  const listing = parseCbcReleaseListing(await listingResponse.text(), sourceListingPageUrl);
  const pageResponse = await fetchImpl(listing.releasePageUrl, { redirect: "follow" });
  if (!pageResponse.ok) throw new Error(`CBC release page failed with HTTP ${pageResponse.status}.`);
  const metadata = parseCbcReleasePage(await pageResponse.text(), listing.releasePageUrl);
  if (metadata.sourcePublishedAt !== listing.sourcePublishedAt) throw new Error("CBC listing and release-page published dates do not match.");
  return { ...metadata, sourceListingPageUrl: listing.sourceListingPageUrl, releasePageUrl: listing.releasePageUrl };
}

export async function acquireCbcLatest({ sourceListingPageUrl = CBC_OFFICIAL_RELEASE_LISTING_PAGE, rawDirectory = "data/market-radar/raw/cbc", fetchImpl = fetch }) {
  const metadata = await inspectCbcLatestRelease({ sourceListingPageUrl, fetchImpl });
  const attachmentResponse = await fetchImpl(metadata.downloadUrl, { redirect: "follow" });
  const bytes = Buffer.from(await attachmentResponse.arrayBuffer());
  const attachment = validateCbcXlsxResponse({ response: attachmentResponse, bytes, downloadUrl: metadata.downloadUrl });
  const directory = resolve(rawDirectory);
  await mkdir(directory, { recursive: true });
  const outputPath = resolve(directory, attachment.officialFileName);
  await writeFile(outputPath, bytes);
  return { ...metadata, ...attachment, retrievedAt: new Date().toISOString(), rawFilePath: outputPath };
}

export async function checkCbcLatest({ sourceListingPageUrl = CBC_OFFICIAL_RELEASE_LISTING_PAGE, livePath = "public/data/market-radar/live/cbc-housing-finance-latest.json", fetchImpl = fetch }) {
  const metadata = await inspectCbcLatestRelease({ sourceListingPageUrl, fetchImpl });
  let currentPeriod;
  try { currentPeriod = JSON.parse(await readFile(resolve(livePath), "utf8"))?.latest?.period; } catch { /* missing live data is handled as a candidate */ }
  if (currentPeriod && metadata.expectedDataPeriod <= currentPeriod) {
    return { status: "skipped", changed: false, currentPeriod, ...metadata };
  }
  return { status: "candidate", changed: true, currentPeriod, ...metadata };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const checkOnly = process.argv.includes("--check");
  (checkOnly ? checkCbcLatest({}) : acquireCbcLatest({})).then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
