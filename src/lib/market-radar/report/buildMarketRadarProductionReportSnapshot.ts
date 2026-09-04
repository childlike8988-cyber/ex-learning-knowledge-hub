import type { MarketRadarAnalysisResult, MarketRadarFact, MarketRadarSource } from "@/data/market-radar";
import type { MarketRadarCbcLiveData } from "@/lib/market-radar/sources/cbc-housing-finance";
import type { MarketRadarMoiLiveData } from "@/lib/market-radar/sources/moi-real-price";
import { createMarketRadarReportId } from "./buildMarketRadarReportSnapshot";
import { MARKET_RADAR_EXPORT_VERSION } from "./exportTokens";
import type { MarketRadarReportSnapshot } from "./types";

/**
 * First report that may enter the controlled publication review. This is the
 * publication date, not a substitute for either official source data period.
 */
export const MARKET_RADAR_FIRST_PRODUCTION_REPORT_DATE = "2026-09-01" as const;

export type MarketRadarPublicationGate = {
  passed: boolean;
  gates: Readonly<Record<"numericFactsSourced" | "noFixtureFacts" | "factAnalysisSeparated" | "truthfulCoverage" | "catalogMetadataValid", boolean>>;
  warnings: readonly string[];
};

function period(start?: string, end?: string, label?: string) {
  return { ...(start ? { start } : {}), ...(end ? { end } : {}), ...(label ? { label } : {}) };
}

function liveSource(value: MarketRadarSource | undefined): value is MarketRadarSource {
  return Boolean(value && value.isMock === false && value.id && value.publishedAt && value.dataPeriodStart && value.dataPeriodEnd && value.retrievedAt && value.verifiedAt);
}

function fact(id: string, label: string, value: number, unit: string, source: MarketRadarSource, dataPeriod: ReturnType<typeof period>, comparison?: string): MarketRadarFact {
  return { id, label, value, unit, ...(comparison ? { comparison } : {}), sourceIds: [source.id], dataPeriod, isEstimated: false, isMock: false };
}

function noFixtureNumericFacts(snapshot: MarketRadarReportSnapshot): boolean {
  const groups = [snapshot.moi.facts, snapshot.cbc.facts, ...snapshot.signals.map((signal) => signal.facts)];
  return groups.flat().every((item) => item.isMock === false && item.sourceIds.length > 0);
}

/**
 * Publication-only contract. It deliberately omits the legacy page fixture,
 * fixture editorial, mock charts, and unsupported trend claims.
 */
export function buildMarketRadarProductionReportSnapshot({ moi, cbc, analysis }: { moi: MarketRadarMoiLiveData; cbc: MarketRadarCbcLiveData; analysis: MarketRadarAnalysisResult }): MarketRadarReportSnapshot {
  if (moi.status !== "live" || !liveSource(moi.source) || typeof moi.metrics.transactionCount !== "number" || !moi.dataPeriodStart || !moi.dataPeriodEnd) {
    throw new Error("Production report requires validated MOI live data.");
  }
  if (cbc.status !== "live" || !liveSource(cbc.source) || !cbc.latest || !cbc.dataPeriodStart || !cbc.dataPeriodEnd) {
    throw new Error("Production report requires validated CBC live data.");
  }

  const moiFact = fact(`moi-transaction-count-${moi.dataPeriodStart}`, "高雄市有效實價登錄買賣案件", moi.metrics.transactionCount, "件", moi.source, period(moi.dataPeriodStart, moi.dataPeriodEnd));
  const cbcPeriod = period(cbc.dataPeriodStart, cbc.dataPeriodEnd, cbc.latest.period);
  const cbcFacts: MarketRadarFact[] = [];
  if (typeof cbc.latest.mortgageRate === "number") cbcFacts.push(fact(`cbc-mortgage-rate-${cbc.latest.period}`, "五大銀行新承做購屋貸款利率", cbc.latest.mortgageRate, "％", cbc.source, cbcPeriod, typeof cbc.latest.mortgageRateChangePercentagePoints === "number" ? `較前期 ${cbc.latest.mortgageRateChangePercentagePoints >= 0 ? "+" : ""}${cbc.latest.mortgageRateChangePercentagePoints.toFixed(3)} 個百分點` : undefined));
  if (typeof cbc.latest.newMortgageAmount === "number") cbcFacts.push(fact(`cbc-mortgage-amount-${cbc.latest.period}`, "新承做購屋貸款金額", cbc.latest.newMortgageAmount, "百萬元", cbc.source, cbcPeriod));

  const reportDate = MARKET_RADAR_FIRST_PRODUCTION_REPORT_DATE;
  const snapshotWithoutEligibility: Omit<MarketRadarReportSnapshot, "exportEligibility"> = {
    reportId: createMarketRadarReportId(reportDate),
    reportDate,
    generatedAt: [moi.generatedAt, cbc.generatedAt, analysis.generatedAt].filter((value): value is string => typeof value === "string").sort().at(-1) ?? reportDate,
    locale: "zh-TW",
    market: { country: "TW", city: "Kaohsiung", label: "高雄" },
    status: "partial-live",
    dataCoverage: { moiLatest: "live", moiHistorical: analysis.dataCoverage.moiHistory, cbc: "live", priceMomentum: analysis.dataCoverage.priceMomentum },
    keyTake: { text: "本期尚無可由完整趨勢基準支撐的今日一句。", status: "unavailable", sourceIds: [], basisFactIds: [], basisSignalIds: [], isMock: false },
    highlights: [],
    marketTemperature: {
      label: analysis.marketTemperature.label,
      description: analysis.marketTemperature.description,
      dataStatus: analysis.marketTemperature.dataStatus,
      confidence: analysis.marketTemperature.confidence,
      basisSignalIds: analysis.marketTemperature.basisSignalIds,
      sourceIds: analysis.signals.filter((signal) => signal.status === "live").flatMap((signal) => signal.sourceIds),
      analysis: analysis.marketTemperature.detail.analysis,
    },
    liveObservations: [
      { id: "moi-live-observation", label: "MOI LIVE OBSERVATION", text: `本期高雄有效買賣登錄案件共 ${moiFact.value} 件。`, status: "live", sourceIds: [moi.source.id], factIds: [moiFact.id], dataPeriod: period(moi.dataPeriodStart, moi.dataPeriodEnd), isMock: false },
      { id: "cbc-live-observation", label: "CBC LIVE OBSERVATION", text: `中央銀行 ${cbc.latest.period} 月資料已接入；房貸利率與新承做金額僅作融資環境觀察。`, status: "live", sourceIds: [cbc.source.id], factIds: cbcFacts.map((item) => item.id), dataPeriod: cbcPeriod, isMock: false },
    ],
    moi: { status: "live", facts: [moiFact], sourceIds: [moi.source.id], dataPeriod: period(moi.dataPeriodStart, moi.dataPeriodEnd), historicalStatus: analysis.dataCoverage.moiHistory, districtTransactionCounts: [...moi.metrics.districtTransactionCounts].sort((a, b) => b.transactionCount - a.transactionCount || a.district.localeCompare(b.district, "zh-Hant")).slice(0, 8) },
    cbc: { status: "live", facts: cbcFacts, sourceIds: [cbc.source.id], dataPeriod: cbcPeriod, historyPeriods: cbc.history.length },
    signals: analysis.signals,
    charts: [],
    news: [],
    keySentences: [],
    sources: [moi.source, cbc.source],
    methodology: { version: `${moi.methodologyVersion ?? "moi-real-price-methodology-v1"}+cbc-housing-finance-methodology-v1`, summary: "本報告只使用已驗證的官方事實與既有規則式分析；沒有正式來源的內容不列入報告。", references: ["docs/market-radar/moi-real-price-methodology.md", "docs/market-radar/cbc-housing-finance-methodology.md"], limitations: ["實價登錄案件數不等同即時買氣。", "房貸利率與新承做金額不是房價指標。", "歷史基準與價格動能尚待建立，不產生趨勢結論。"] },
    disclaimer: { analysis: "Market Radar 解讀係依公開資料整理之分析，不代表原始資料來源立場，亦不構成投資或交易建議。", sourceTiming: "實價登錄具有申報與揭露時間差。", noInvestmentAdvice: "本報告不構成投資、交易或個別房產決策建議。" },
    branding: { publisher: "E.X CREATOR STUDIO", product: "E.X MARKET RADAR", title: "高雄房市快報", footer: "Generated by E.X Market Radar" },
    exportVersion: MARKET_RADAR_EXPORT_VERSION,
  };
  const officialMetadataComplete = snapshotWithoutEligibility.sources.every((source) => liveSource(source));
  const canGenerate = officialMetadataComplete && cbcFacts.length > 0;
  return { ...snapshotWithoutEligibility, exportEligibility: { canGeneratePng: canGenerate, canGeneratePdf: canGenerate, warnings: ["本報告為 PARTIAL LIVE：MOI Historical 與 Price Momentum 維持 WAITING，未產生趨勢或價格結論。"] } };
}

export function evaluateMarketRadarProductionPublicationGate(snapshot: MarketRadarReportSnapshot): MarketRadarPublicationGate {
  const numericFactsSourced = noFixtureNumericFacts(snapshot);
  const noFixtureFacts = snapshot.sources.every((source) => !source.isMock) && snapshot.highlights.every((item) => !item.isMock) && snapshot.keySentences.every((item) => !item.isMock) && snapshot.news.every((item) => !item.isMock);
  const factAnalysisSeparated = Boolean(snapshot.moi.facts.length && snapshot.cbc.facts.length && snapshot.marketTemperature.analysis && snapshot.signals.every((signal) => signal.facts.every((item) => item.sourceIds.length > 0)));
  const truthfulCoverage = snapshot.status === "partial-live" && snapshot.dataCoverage.moiHistorical === "waiting" && snapshot.dataCoverage.priceMomentum === "waiting" && snapshot.signals.find((signal) => signal.id === "price-momentum")?.status === "unavailable";
  const catalogMetadataValid = snapshot.reportId === createMarketRadarReportId(snapshot.reportDate) && snapshot.reportDate === MARKET_RADAR_FIRST_PRODUCTION_REPORT_DATE;
  const gates = { numericFactsSourced, noFixtureFacts, factAnalysisSeparated, truthfulCoverage, catalogMetadataValid };
  return { passed: Object.values(gates).every(Boolean) && snapshot.exportEligibility.canGeneratePng && snapshot.exportEligibility.canGeneratePdf, gates, warnings: snapshot.exportEligibility.warnings };
}
