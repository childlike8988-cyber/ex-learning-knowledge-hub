import type {
  MarketRadarFact,
  MarketRadarSource,
} from "@/data/market-radar";
import type { MarketRadarCbcLiveData } from "@/lib/market-radar/sources/cbc-housing-finance";
import type { MarketRadarMoiLiveData } from "@/lib/market-radar/sources/moi-real-price";
import {
  type MarketRadarExportBundle,
  type MarketRadarExportEligibility,
  type MarketRadarReportDataStatus,
  type MarketRadarReportObservation,
  type MarketRadarReportSnapshot,
  type MarketRadarReportSnapshotInput,
} from "./types";

import { MARKET_RADAR_EXPORT_VERSION } from "./exportTokens";
import { buildMarketRadarDownloadContent } from "./buildMarketRadarDownloadContent";
export { MARKET_RADAR_EXPORT_VERSION } from "./exportTokens";

const ANALYSIS_DISCLAIMER = "Market Radar 解讀係依公開資料整理之分析，不代表原始資料來源立場，亦不構成投資或交易建議。";
const SOURCE_TIMING_DISCLAIMER = "實價登錄具有申報與揭露時間差；報告日期、資料發布日、統計期間與驗證時間分開記錄。";

function isoReportDate(value: string): string {
  const match = value.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!match) throw new Error("Market Radar report date must be YYYY-MM-DD or YYYY.MM.DD");
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

export function createMarketRadarReportId(reportDate: string): string {
  return `market-radar-kaohsiung-${isoReportDate(reportDate)}`;
}

function period(start?: string, end?: string, label?: string) {
  return { ...(start ? { start } : {}), ...(end ? { end } : {}), ...(label ? { label } : {}) };
}

function uniqueSources(...groups: readonly (readonly MarketRadarSource[])[]): readonly MarketRadarSource[] {
  return [...new Map(groups.flat().map((source) => [source.id, source])).values()];
}

function liveSource(value: MarketRadarSource | undefined): value is MarketRadarSource {
  return Boolean(value && value.isMock === false && value.id);
}

function officialSources(moi: MarketRadarMoiLiveData, cbc: MarketRadarCbcLiveData): readonly MarketRadarSource[] {
  return [moi.source, cbc.source].filter(liveSource);
}

function fact(id: string, label: string, value: string | number, unit: string | undefined, source: MarketRadarSource, dataPeriod: ReturnType<typeof period>): MarketRadarFact {
  return { id, label, value, ...(unit ? { unit } : {}), sourceIds: [source.id], dataPeriod, isEstimated: false, isMock: false };
}

function buildMoiFacts(moi: MarketRadarMoiLiveData): readonly MarketRadarFact[] {
  if (moi.status !== "live" || !moi.source || moi.source.isMock || typeof moi.metrics.transactionCount !== "number") return [];
  return [fact(`moi-transaction-count-${moi.dataPeriodStart ?? "latest"}`, "高雄市有效實價登錄買賣案件", moi.metrics.transactionCount, "件", moi.source, period(moi.dataPeriodStart, moi.dataPeriodEnd))];
}

function buildCbcFacts(cbc: MarketRadarCbcLiveData): readonly MarketRadarFact[] {
  if (cbc.status !== "live" || !cbc.source || cbc.source.isMock || !cbc.latest) return [];
  const result: MarketRadarFact[] = [];
  const dataPeriod = period(cbc.dataPeriodStart, cbc.dataPeriodEnd, cbc.latest.period);
  if (typeof cbc.latest.mortgageRate === "number") result.push(fact(`cbc-mortgage-rate-${cbc.latest.period}`, "五大銀行新承做購屋貸款利率", cbc.latest.mortgageRate, "％", cbc.source, dataPeriod));
  if (typeof cbc.latest.newMortgageAmount === "number") result.push(fact(`cbc-mortgage-amount-${cbc.latest.period}`, "新承做購屋貸款金額", cbc.latest.newMortgageAmount, "百萬元", cbc.source, dataPeriod));
  return result;
}

function buildLiveObservations(moi: MarketRadarMoiLiveData, cbc: MarketRadarCbcLiveData, moiFacts: readonly MarketRadarFact[], cbcFacts: readonly MarketRadarFact[]): readonly MarketRadarReportObservation[] {
  const observations: MarketRadarReportObservation[] = [];
  if (moiFacts.length > 0 && moi.source) {
    observations.push({
      id: "moi-live-observation",
      label: "MOI LIVE OBSERVATION",
      text: `內政部實價登錄資料已接入，本期高雄有效買賣登錄案件共 ${moiFacts[0].value} 件。`,
      status: "live",
      sourceIds: [moi.source.id],
      factIds: moiFacts.map((item) => item.id),
      dataPeriod: period(moi.dataPeriodStart, moi.dataPeriodEnd),
      isMock: false,
    });
  }
  if (cbcFacts.length > 0 && cbc.source && cbc.latest) {
    const rate = cbc.latest.mortgageRate;
    const amount = cbc.latest.newMortgageAmount;
    const measures = [typeof rate === "number" ? `購屋貸款利率 ${rate}%` : "", typeof amount === "number" ? `新承做貸款金額 ${amount} 百萬元` : ""].filter(Boolean).join("；");
    observations.push({
      id: "cbc-live-observation",
      label: "CBC LIVE OBSERVATION",
      text: `中央銀行最新月資料：${measures}。`,
      status: "live",
      sourceIds: [cbc.source.id],
      factIds: cbcFacts.map((item) => item.id),
      dataPeriod: period(cbc.dataPeriodStart, cbc.dataPeriodEnd, cbc.latest.period),
      isMock: false,
    });
  }
  return observations;
}

function dataStatus(isMock: boolean, status: string): MarketRadarReportDataStatus {
  if (status === "waiting" || status === "unavailable") return status;
  return isMock ? "fixture" : "live";
}

function buildEligibility(snapshot: Omit<MarketRadarReportSnapshot, "exportEligibility">): MarketRadarExportEligibility {
  const officialMetadataComplete = snapshot.sources.some((source) => !source.isMock && source.publishedAt && source.dataPeriodStart && source.dataPeriodEnd && source.retrievedAt && source.verifiedAt);
  const warnings = [
    ...(snapshot.status === "partial-live" ? ["本報告含有尚待補齊的資料涵蓋，輸出必須保留 PARTIAL LIVE 標示。"] : []),
    ...(snapshot.keyTake.status === "fixture" ? ["今日一句為 Fixture，不能視為雙來源 Live Key Take。"] : []),
    ...(officialMetadataComplete ? [] : ["至少需要一個具有完整時間 metadata 的官方來源。"]),
  ];
  const canGenerate = Boolean(snapshot.reportId && snapshot.reportDate && snapshot.disclaimer.analysis && officialMetadataComplete);
  return { canGeneratePng: canGenerate, canGeneratePdf: canGenerate, warnings };
}

export function validateMarketRadarReportSnapshot(snapshot: unknown): { valid: boolean; errors: readonly string[] } {
  const value = snapshot as Partial<MarketRadarReportSnapshot> | null;
  const errors: string[] = [];
  if (!value || typeof value !== "object") return { valid: false, errors: ["Snapshot must be an object."] };
  for (const field of ["reportId", "reportDate", "generatedAt", "locale", "status", "dataCoverage", "keyTake", "moi", "cbc", "signals", "charts", "news", "sources", "methodology", "disclaimer", "branding", "exportVersion"]) {
    if (!(field in value)) errors.push(`Missing snapshot field: ${field}`);
  }
  if (!Array.isArray(value.sources) || value.sources.length === 0) errors.push("Snapshot must include sources.");
  const official = Array.isArray(value.sources) && value.sources.some((source) => source && typeof source === "object" && source.isMock === false && typeof source.publishedAt === "string" && typeof source.dataPeriodStart === "string" && typeof source.dataPeriodEnd === "string" && typeof source.retrievedAt === "string" && typeof source.verifiedAt === "string");
  if (!official) errors.push("Snapshot needs one official source with complete time metadata.");
  if (!value.disclaimer || typeof value.disclaimer.analysis !== "string" || value.disclaimer.analysis.length === 0) errors.push("Snapshot disclaimer is required.");
  return { valid: errors.length === 0, errors };
}

export function getMarketRadarExportEligibility(snapshot: MarketRadarReportSnapshot): MarketRadarExportEligibility {
  const validation = validateMarketRadarReportSnapshot(snapshot);
  if (!validation.valid) return { canGeneratePng: false, canGeneratePdf: false, warnings: validation.errors };
  return buildEligibility(snapshot);
}

export function createMarketRadarExportBundle(snapshot: MarketRadarReportSnapshot): MarketRadarExportBundle {
  const eligibility = getMarketRadarExportEligibility(snapshot);
  if (!eligibility.canGeneratePng || !eligibility.canGeneratePdf) throw new Error(`Market Radar snapshot is not exportable: ${eligibility.warnings.join(" ")}`);
  return {
    reportId: snapshot.reportId,
    shareCards: buildMarketRadarDownloadContent(snapshot).shareCards.map((card) => ({ id: card.id, role: card.role, fileName: `EX-Market-Radar-Kaohsiung-${snapshot.reportDate}-${card.id}.png` })),
    pdfFileName: `EX-Market-Radar-Kaohsiung-${snapshot.reportDate}.pdf`,
    generatedAt: snapshot.generatedAt,
    exportVersion: snapshot.exportVersion,
  };
}

export function buildMarketRadarReportSnapshot(input: MarketRadarReportSnapshotInput): MarketRadarReportSnapshot {
  const reportDate = isoReportDate(input.report.date);
  const generatedAt = input.generatedAt ?? input.analysis.generatedAt ?? input.report.updatedAt;
  const moiFacts = buildMoiFacts(input.moi);
  const cbcFacts = buildCbcFacts(input.cbc);
  const sources = uniqueSources(input.report.sources, officialSources(input.moi, input.cbc));
  const coverage = input.analysis.dataCoverage;
  const status = input.report.status === "fallback" ? "fixture" : input.analysis.signals.every((signal) => signal.status === "live") && coverage.moiHistory === "ready" && coverage.priceMomentum !== "waiting" ? "live" : sources.some((source) => source.isMock === false) ? "partial-live" : "fixture";
  const liveKeyTake = input.analysis.dailyKeyTake;
  const keyTake: MarketRadarReportSnapshot["keyTake"] = liveKeyTake
    ? { text: liveKeyTake.text, status: "live", sourceIds: [...new Set(input.analysis.signals.flatMap((signal) => signal.sourceIds))], basisFactIds: liveKeyTake.basisFactIds, basisSignalIds: liveKeyTake.basisSignalIds, isMock: false }
    : { text: input.report.dailyKeyTake.text, status: input.report.dailyKeyTake.isMock ? "fixture" : "unavailable", sourceIds: input.report.dailyKeyTake.sourceIds, basisFactIds: input.report.dailyKeyTake.basisFactIds, basisSignalIds: input.report.dailyKeyTake.basisSignalIds, isMock: input.report.dailyKeyTake.isMock };
  const highlights = input.report.districtHighlights.map((item) => ({ id: item.id, label: item.district, title: item.headline, summary: item.summary, facts: item.facts, analysis: item.detail.analysis, sourceIds: item.sourceIds, status: dataStatus(item.isMock, item.isMock ? "fixture" : "live"), isMock: item.isMock }));
  const snapshotWithoutEligibility: Omit<MarketRadarReportSnapshot, "exportEligibility"> = {
    reportId: createMarketRadarReportId(reportDate),
    reportDate,
    generatedAt,
    locale: "zh-TW",
    market: { country: "TW", city: "Kaohsiung", label: "高雄" },
    status,
    dataCoverage: { moiLatest: coverage.moi, moiHistorical: coverage.moiHistory, cbc: coverage.cbc, priceMomentum: coverage.priceMomentum },
    keyTake,
    highlights,
    marketTemperature: { label: input.analysis.marketTemperature.label, description: input.analysis.marketTemperature.description, dataStatus: input.analysis.marketTemperature.dataStatus, confidence: input.analysis.marketTemperature.confidence, basisSignalIds: input.analysis.marketTemperature.basisSignalIds, sourceIds: input.analysis.signals.filter((signal) => signal.status === "live").flatMap((signal) => signal.sourceIds), analysis: input.analysis.marketTemperature.detail.analysis },
    liveObservations: buildLiveObservations(input.moi, input.cbc, moiFacts, cbcFacts),
    moi: { status: moiFacts.length > 0 ? "live" : "unavailable", facts: moiFacts, sourceIds: moiFacts.flatMap((item) => item.sourceIds), dataPeriod: period(input.moi.dataPeriodStart, input.moi.dataPeriodEnd), historicalStatus: coverage.moiHistory, districtTransactionCounts: [...(input.moi.metrics.districtTransactionCounts ?? [])].sort((a, b) => b.transactionCount - a.transactionCount || a.district.localeCompare(b.district, "zh-Hant")).slice(0, 8) },
    cbc: { status: cbcFacts.length > 0 ? "live" : "unavailable", facts: cbcFacts, sourceIds: cbcFacts.flatMap((item) => item.sourceIds), dataPeriod: period(input.cbc.dataPeriodStart, input.cbc.dataPeriodEnd, input.cbc.latest?.period), historyPeriods: input.cbc.history.length },
    signals: input.analysis.signals,
    charts: input.report.publicCharts,
    news: input.report.newsItems,
    keySentences: input.report.keyTakeaways.map((text) => ({ text, status: "fixture", sourceIds: input.report.dailyKeyTake.sourceIds, isMock: true })),
    sources,
    methodology: { version: `${input.moi.methodologyVersion ?? "moi-real-price-methodology-v1"}+cbc-housing-finance-methodology-v1`, summary: "本快報由已驗證的官方事實與規則式分析組成；未接入的內容保留 Fixture 標示。", references: ["docs/market-radar/moi-real-price-methodology.md", "docs/market-radar/cbc-housing-finance-methodology.md"], limitations: ["實價登錄案件數不等同即時買氣。", "房貸利率不是房價指標。", "歷史基準未完成時不產生趨勢結論。"] },
    disclaimer: { analysis: ANALYSIS_DISCLAIMER, sourceTiming: SOURCE_TIMING_DISCLAIMER, noInvestmentAdvice: "本報告不構成投資、交易或個別房產決策建議。" },
    branding: { publisher: "E.X CREATOR STUDIO", product: "E.X MARKET RADAR", title: "高雄房市快報", footer: "Generated by E.X Market Radar" },
    exportVersion: MARKET_RADAR_EXPORT_VERSION,
  };
  return { ...snapshotWithoutEligibility, exportEligibility: buildEligibility(snapshotWithoutEligibility) };
}
