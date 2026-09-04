#!/usr/bin/env node

import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const staticRoot = join(root, "out");
const defaultOutputRoot = join(root, "data", "market-radar", "exports");
const stagingRoot = join(root, "data", "market-radar", "staging", "export");
const logsRoot = join(root, "data", "market-radar", "logs");
const rendererVersion = "1.1.1";
const edgeCandidates = [process.env.MARKET_RADAR_BROWSER_PATH, "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"].filter(Boolean);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function option(name) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; }
function has(name) { return process.argv.includes(name); }
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function snapshotHash(snapshot) { return sha256(JSON.stringify(stable(snapshot))); }
function isoNow() { return new Date().toISOString(); }
function safeMessage(error) { return String(error?.message ?? error ?? "Export failed safely.").replaceAll(root, "<project>").replaceAll(/([A-Za-z]:)?[^\s]*market-radar[^\s]*/gi, "<local-path>"); }
function relativePath(path) { return relative(root, path).split(sep).join("/"); }
function assertInsideRoot(path) { if (relative(root, path).startsWith("..")) throw new Error("Export output must remain inside the project workspace."); }
function expectedFileNames(reportDate, cardId) { return { png: `EX-Market-Radar-Kaohsiung-${reportDate}-${cardId}.png`, pdf: `EX-Market-Radar-Kaohsiung-${reportDate}.pdf` }; }
function parseArgs() { const output = option("--output"); const outputRoot = output ? resolve(root, output) : defaultOutputRoot; assertInsideRoot(outputRoot); if (has("--png-only") && has("--pdf-only")) throw new Error("Choose only one of --png-only or --pdf-only."); return { outputRoot, reportDate: option("--report-date"), dryRun: has("--dry-run"), png: !has("--pdf-only"), pdf: !has("--png-only"), overwrite: has("--overwrite") }; }
function mime(path) { return ({ ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".woff2": "font/woff2" })[extname(path).toLowerCase()] ?? "application/octet-stream"; }

async function startStaticServer() {
  if (!existsSync(join(staticRoot, "market-radar", "report-preview", "index.html"))) throw new Error("Production static preview is missing. Run npm run build before exporting.");
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
      const clean = pathname.replace(/^\/+/, "");
      let filePath = resolve(staticRoot, clean || "index.html");
      assertInsideStatic(filePath);
      if (pathname.endsWith("/")) filePath = join(filePath, "index.html");
      const file = await readFile(filePath);
      response.writeHead(200, { "Content-Type": mime(filePath), "Cache-Control": "no-store" }); response.end(file);
    } catch { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Not found"); }
  });
  function assertInsideStatic(path) { if (relative(staticRoot, path).startsWith("..")) throw new Error("Invalid static path."); }
  await new Promise((resolveReady, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolveReady); });
  const address = server.address(); if (!address || typeof address === "string") throw new Error("Unable to allocate local export server.");
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function browserPath() { for (const candidate of edgeCandidates) { if (candidate && existsSync(candidate)) return candidate; } throw new Error("Microsoft Edge/Chromium runtime unavailable. Set MARKET_RADAR_BROWSER_PATH or install Microsoft Edge."); }
async function exportPayloadFromPreview(page, baseUrl, mode) {
  await page.goto(`${baseUrl}/market-radar/report-preview/?mode=${mode}`, { waitUntil: "load" });
  await page.locator('[data-export-ready="true"]').waitFor();
  await page.evaluate(async () => { await document.fonts.ready; });
  const raw = await page.locator("#market-radar-report-export-payload").textContent();
  if (!raw) throw new Error("Preview did not expose a report snapshot.");
  const payload = JSON.parse(raw);
  if (!payload?.snapshot?.reportId || !payload.snapshot?.exportEligibility || !Array.isArray(payload?.content?.shareCards)) throw new Error("Preview export payload is incomplete.");
  if (payload.content.shareCards.length < 1 || payload.content.shareCards.length > 3) throw new Error("Share card count must be between 1 and 3.");
  return payload;
}
async function validatePng(path) { const bytes = await readFile(path); if (bytes.length < 1024 || !bytes.subarray(0, 8).equals(pngSignature)) throw new Error("PNG validation failed."); const width = bytes.readUInt32BE(16); const height = bytes.readUInt32BE(20); if (width !== 1080 || height !== 1920) throw new Error(`PNG dimensions must be 1080×1920, received ${width}×${height}.`); return { fileName: basename(path), path: basename(path), width, height, sha256: sha256(bytes), sizeBytes: bytes.length }; }
async function validatePdf(path) { const bytes = await readFile(path); if (bytes.length < 2048 || !bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("PDF validation failed."); const text = bytes.toString("latin1"); const pageCount = (text.match(/\/Type\s*\/Page\b/g) ?? []).length; const mediaBox = text.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/); const width = Number(mediaBox?.[1]); const height = Number(mediaBox?.[2]); if (pageCount < 3 || pageCount > 8) throw new Error(`PDF page count must be 3–8, received ${pageCount}.`); if (!Number.isFinite(width) || !Number.isFinite(height) || Math.abs(width - 595.28) > 2 || Math.abs(height - 841.89) > 2) throw new Error("PDF must use A4 portrait geometry."); return { fileName: basename(path), path: basename(path), pageCount, widthPoints: width, heightPoints: height, textRenderer: "playwright-dom-print", sha256: sha256(bytes), sizeBytes: bytes.length }; }
async function writeLog(result) { await mkdir(logsRoot, { recursive: true }); const date = result.generatedAt.slice(0, 10); await writeFile(join(logsRoot, `report-export-${date}.log`), `${JSON.stringify({ reportId: result.reportId, snapshotHash: result.snapshotHash, rendererVersion, startedAt: result.startedAt, finishedAt: result.generatedAt, status: result.status, shareCards: result.pngs?.map((card) => ({ id: card.id, status: card.status })), pdf: result.pdf?.status, warnings: result.warnings, errors: result.errors })}\n`, { encoding: "utf8", flag: "a" }); }

async function main() {
  const options = parseArgs(); const startedAt = isoNow(); let server; let browser;
  const result = { status: "failed", reportId: undefined, outputDirectory: undefined, generatedAt: undefined, startedAt, rendererVersion, snapshotHash: undefined, pngs: [], pdf: undefined, bundle: undefined, warnings: [], errors: [] };
  try {
    server = await startStaticServer();
    browser = await chromium.launch({ executablePath: await browserPath(), headless: true, args: ["--disable-gpu", "--font-render-hinting=medium"] });
    const context = await browser.newContext({ viewport: { width: 1200, height: 2200 }, deviceScaleFactor: 1 }); const page = await context.newPage();
    const payload = await exportPayloadFromPreview(page, server.baseUrl, options.pdf && !options.png ? "pdf" : "share-01"); const { snapshot, content } = payload; const hash = snapshotHash(snapshot);
    result.reportId = snapshot.reportId; result.snapshotHash = hash; result.outputDirectory = relativePath(join(options.outputRoot, snapshot.reportId));
    if (options.reportDate && options.reportDate !== snapshot.reportDate) throw new Error("--report-date must match the snapshot reportDate; it cannot replace the report date.");
    if ((options.png && !snapshot.exportEligibility.canGeneratePng) || (options.pdf && !snapshot.exportEligibility.canGeneratePdf)) throw new Error(`Snapshot is not export eligible: ${(snapshot.exportEligibility.warnings ?? []).join(" ")}`);
    result.warnings.push(...(snapshot.exportEligibility.warnings ?? []));
    if (options.dryRun) { result.status = "dry-run"; result.generatedAt = isoNow(); result.pngs = options.png ? content.shareCards.map((card) => ({ id: card.id, role: card.role, status: "ready", fileName: expectedFileNames(snapshot.reportDate, card.id).png, width: 1080, height: 1920 })) : []; result.pdf = options.pdf ? { status: "ready", fileName: expectedFileNames(snapshot.reportDate, "share-01").pdf, format: "A4", orientation: "portrait" } : { status: "not-requested" }; return result; }
    const finalDirectory = join(options.outputRoot, snapshot.reportId);
    if (existsSync(finalDirectory) && !options.overwrite) { const previousBundlePath = join(finalDirectory, "bundle.json"); if (!existsSync(previousBundlePath)) throw new Error("Export directory already exists; use --overwrite only after review."); const previous = JSON.parse(await readFile(previousBundlePath, "utf8")); if (previous.snapshotHash !== hash || previous.exportVersion !== snapshot.exportVersion || previous.rendererVersion !== rendererVersion) throw new Error("Export directory contains a different snapshot/version; refusing to overwrite."); result.status = "success"; result.generatedAt = previous.generatedAt; result.pngs = previous.shareCards ?? []; result.pdf = previous.pdf; result.bundle = { fileName: "bundle.json", path: "bundle.json", reused: true }; return result; }
    const stage = join(stagingRoot, `${snapshot.reportId}-${Date.now()}`); await mkdir(stage, { recursive: true });
    if (options.png) { for (const card of content.shareCards) { const fileName = expectedFileNames(snapshot.reportDate, card.id).png; try { await page.goto(`${server.baseUrl}/market-radar/report-preview/?mode=${card.id}`, { waitUntil: "load" }); await page.locator('[data-export-ready="true"]').waitFor(); await page.evaluate(async () => { await document.fonts.ready; }); await page.locator(`[data-share-card-id="${card.id}"]`).screenshot({ path: join(stage, fileName), omitBackground: false, animations: "disabled" }); result.pngs.push({ id: card.id, role: card.role, status: "success", ...(await validatePng(join(stage, fileName))) }); } catch (error) { result.pngs.push({ id: card.id, role: card.role, status: "failed", safeMessage: safeMessage(error) }); result.errors.push(`${card.id} export failed safely.`); } } }
    if (options.pdf) { const fileName = expectedFileNames(snapshot.reportDate, "share-01").pdf; try { await page.goto(`${server.baseUrl}/market-radar/report-preview/?mode=pdf`, { waitUntil: "load" }); await page.locator('[data-export-ready="true"]').waitFor(); await page.evaluate(async () => { await document.fonts.ready; }); await page.emulateMedia({ media: "print" }); await page.pdf({ path: join(stage, fileName), format: "A4", printBackground: true, preferCSSPageSize: true }); result.pdf = { status: "success", ...(await validatePdf(join(stage, fileName))) }; } catch (error) { result.pdf = { status: "failed", safeMessage: safeMessage(error) }; result.errors.push("PDF export failed safely."); } } else result.pdf = { status: "not-requested" };
    const succeeded = result.pngs.filter((item) => item.status === "success").length + Number(result.pdf?.status === "success"); const requested = (options.png ? content.shareCards.length : 0) + Number(options.pdf); result.status = succeeded === requested ? "success" : succeeded > 0 ? "partial" : "failed"; result.generatedAt = isoNow();
    if (result.status === "failed") { await rm(stage, { recursive: true, force: true }); return result; }
    const bundle = { reportId: snapshot.reportId, reportType: "market-radar-download-content-layer", reportDate: snapshot.reportDate, generatedAt: result.generatedAt, exportVersion: snapshot.exportVersion, rendererVersion, snapshotHash: hash, status: result.status, shareCards: result.pngs, pdf: result.pdf };
    await writeFile(join(stage, "bundle.json"), `${JSON.stringify(bundle, null, 2)}\n`, "utf8"); await mkdir(dirname(finalDirectory), { recursive: true }); if (existsSync(finalDirectory)) await rm(finalDirectory, { recursive: true, force: true }); await rename(stage, finalDirectory); result.bundle = { fileName: "bundle.json", path: "bundle.json" }; return result;
  } catch (error) { result.errors.push(safeMessage(error)); result.generatedAt = isoNow(); return result;
  } finally { if (browser) await browser.close(); if (server) await new Promise((resolveClose) => server.server.close(resolveClose)); }
}

const result = await main(); if (!result.generatedAt) result.generatedAt = isoNow(); await writeLog(result); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); process.exitCode = result.status === "success" || result.status === "dry-run" ? 0 : result.status === "partial" ? 2 : 1;
