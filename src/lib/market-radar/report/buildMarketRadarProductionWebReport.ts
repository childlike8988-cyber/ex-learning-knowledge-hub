import type { MarketRadarReport } from "@/data/market-radar";
import type { MarketRadarReportSnapshot } from "./types";

const freePlan: MarketRadarReport["freePlan"] = {
  downloadsPerQuarter: 1,
  includesPng: true,
  includesPdf: true,
  creditsCarryOver: false,
};

const pricing: MarketRadarReport["pricing"] = {
  monthlyPrice: 40,
  annualPrice: 360,
  monthlyDurationDays: 30,
  annualDurationDays: 365,
  annualEquivalentMonthly: 30,
};

/**
 * Compatibility view model for the existing public page.
 * The factual identity and content come only from the production snapshot;
 * no legacy fixture section is copied into the public route.
 */
export function buildMarketRadarProductionWebReport(snapshot: MarketRadarReportSnapshot): MarketRadarReport {
  const reportDateDisplay = snapshot.reportDate.replaceAll("-", ".");
  const keyTakeLines = snapshot.keyTake.text.split("\n").slice(0, 3);
  const lineCount = Math.max(1, keyTakeLines.length) as 1 | 2 | 3;

  return {
    id: snapshot.reportId,
    status: "live",
    isMock: false,
    date: reportDateDisplay,
    updatedAt: snapshot.generatedAt,
    updatedAtLabel: snapshot.status === "partial-live" ? "PARTIAL LIVE" : "LIVE",
    title: snapshot.branding.title,
    subtitle: "Kaohsiung Housing Brief",
    summary: snapshot.marketTemperature.description,
    sources: snapshot.sources,
    freshness: {
      status: "fresh",
      label: "官方資料已驗證",
      expectedUpdateFrequency: "irregular",
    },
    marketTemperature: {
      label: snapshot.marketTemperature.label,
      description: snapshot.marketTemperature.description,
      indicators: [],
      sourceIds: snapshot.marketTemperature.sourceIds,
      dataPeriod: {},
      updatedAt: snapshot.generatedAt,
    },
    dailyKeyTake: {
      text: keyTakeLines.join("\n"),
      lineCount,
      sourceIds: snapshot.keyTake.sourceIds,
      basisFactIds: snapshot.keyTake.basisFactIds,
      basisSignalIds: snapshot.keyTake.basisSignalIds,
      dataStatus: snapshot.keyTake.status,
      analysisBasis: snapshot.keyTake.status === "unavailable" ? "Production snapshot: insufficient verified trend basis" : "Production snapshot",
      isMock: false,
    },
    districtHighlights: [],
    keyTakeaways: snapshot.keySentences.filter((item) => !item.isMock).map((item) => item.text),
    newsItems: snapshot.news.filter((item) => !item.isMock),
    publicCharts: snapshot.charts.filter((item) => !item.isMock),
    proContent: {
      title: "MARKET RADAR PRO",
      description: "完整報告下載與歷史報告服務；付款功能尚未啟用。",
      benefits: ["PNG 分享圖文", "PDF 深度報告", "同一期完整報告共用一次解鎖"],
    },
    freePlan,
    currentQuarter: {
      id: `${snapshot.reportDate.slice(0, 4)}-Q${Math.floor((Number(snapshot.reportDate.slice(5, 7)) - 1) / 3) + 1}`,
      label: "本季免費下載額度",
      quarterStart: "",
      quarterEnd: "",
      nextQuarterLabel: "下一自然季度",
    },
    downloadBundle: {
      id: "current-full-report",
      reportId: snapshot.reportId,
      title: "本期完整報告",
      formats: ["PNG", "PDF"],
      freeCreditCost: 1,
    },
    downloads: [
      { id: "brief-png", title: "PNG 分享圖文", description: "1–3 張可直接轉發客戶的市場圖文。", format: "PNG", access: "full-report" },
      { id: "analysis-pdf", title: "PDF 完整報告", description: "包含官方資料、分析脈絡、來源與限制。", format: "PDF", access: "full-report" },
    ],
    pricing,
    access: {
      freeQuarterlyDownloadsAllowed: 1,
      freeQuarterlyDownloadsUsed: 0,
      freeQuarterlyDownloadsRemaining: 1,
      hasActiveMonthlySubscription: false,
      hasActiveAnnualSubscription: false,
    },
  };
}
