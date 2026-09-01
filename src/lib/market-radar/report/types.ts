import type {
  MarketRadarAnalysis,
  MarketRadarChart,
  MarketRadarFact,
  MarketRadarNewsItem,
  MarketRadarSignal,
  MarketRadarSource,
} from "@/data/market-radar";

export { MARKET_RADAR_EXPORT_VERSION } from "./exportTokens";

/** Public status of one report snapshot. It describes the export, not a login or entitlement state. */
export type MarketRadarReportStatus = "live" | "partial-live" | "fixture" | "archived";

export type MarketRadarReportDataStatus = "live" | "fixture" | "waiting" | "unavailable";

export type MarketRadarReportDataCoverage = {
  moiLatest: "live" | "unavailable";
  moiHistorical: "ready" | "waiting";
  cbc: "live" | "unavailable";
  priceMomentum: "live" | "waiting" | "unavailable";
};

export type MarketRadarReportKeyTake = {
  text: string;
  status: "live" | "fixture" | "unavailable";
  sourceIds: readonly string[];
  basisFactIds: readonly string[];
  basisSignalIds: readonly string[];
  isMock: boolean;
};

export type MarketRadarReportHighlight = {
  id: string;
  label: string;
  title: string;
  summary: string;
  facts: readonly MarketRadarFact[];
  analysis?: MarketRadarAnalysis;
  sourceIds: readonly string[];
  status: MarketRadarReportDataStatus;
  isMock: boolean;
};

export type MarketRadarReportFactGroup = {
  status: MarketRadarReportDataStatus;
  facts: readonly MarketRadarFact[];
  sourceIds: readonly string[];
  dataPeriod?: { start?: string; end?: string; label?: string };
};

export type MarketRadarReportMoiSection = MarketRadarReportFactGroup & {
  historicalStatus: "ready" | "waiting";
};

export type MarketRadarReportCbcSection = MarketRadarReportFactGroup & {
  historyPeriods?: number;
};

export type MarketRadarReportObservation = {
  id: string;
  label: string;
  text: string;
  status: "live" | "fixture" | "waiting";
  sourceIds: readonly string[];
  factIds: readonly string[];
  dataPeriod?: { start?: string; end?: string; label?: string };
  isMock: boolean;
};

export type MarketRadarReportTemperature = {
  label: string;
  description: string;
  dataStatus: "live" | "partial" | "fixture" | "unavailable";
  confidence: "low" | "medium" | "high";
  basisSignalIds: readonly string[];
  sourceIds: readonly string[];
  analysis?: MarketRadarAnalysis;
};

export type MarketRadarReportSentence = {
  text: string;
  status: "live" | "fixture";
  sourceIds: readonly string[];
  isMock: boolean;
};

export type MarketRadarReportMethodology = {
  version: string;
  summary: string;
  references: readonly string[];
  limitations: readonly string[];
};

export type MarketRadarReportDisclaimer = {
  analysis: string;
  sourceTiming: string;
  noInvestmentAdvice: string;
};

export type MarketRadarReportBranding = {
  publisher: "E.X CREATOR STUDIO";
  product: "E.X MARKET RADAR";
  title: string;
  footer: string;
};

export type MarketRadarExportEligibility = {
  canGeneratePng: boolean;
  canGeneratePdf: boolean;
  warnings: readonly string[];
};

/**
 * A single immutable input for the web, PNG renderer and PDF renderer.
 * Numeric facts remain nested under `moi`/`cbc`; interpretation remains under signals and analysis.
 */
export type MarketRadarReportSnapshot = {
  reportId: string;
  reportDate: string;
  generatedAt: string;
  locale: "zh-TW";
  market: { country: "TW"; city: "Kaohsiung"; label: string };
  status: MarketRadarReportStatus;
  dataCoverage: MarketRadarReportDataCoverage;
  keyTake: MarketRadarReportKeyTake;
  highlights: readonly MarketRadarReportHighlight[];
  marketTemperature: MarketRadarReportTemperature;
  liveObservations: readonly MarketRadarReportObservation[];
  moi: MarketRadarReportMoiSection;
  cbc: MarketRadarReportCbcSection;
  signals: readonly MarketRadarSignal[];
  charts: readonly MarketRadarChart[];
  news: readonly MarketRadarNewsItem[];
  keySentences: readonly MarketRadarReportSentence[];
  sources: readonly MarketRadarSource[];
  methodology: MarketRadarReportMethodology;
  disclaimer: MarketRadarReportDisclaimer;
  branding: MarketRadarReportBranding;
  exportVersion: string;
  exportEligibility: MarketRadarExportEligibility;
};

export type MarketRadarExportBundle = {
  reportId: string;
  pngFileName: string;
  pdfFileName: string;
  generatedAt: string;
  exportVersion: string;
};

export type MarketRadarPngExportSpec = {
  width: 1080;
  height: 1920;
  aspectRatio: "9:16";
  safeInsetX: 64;
  safeInsetY: 72;
  maxPrimaryCharts: 1;
};

export type MarketRadarPdfPage = {
  pageId: "cover" | "overview" | "moi" | "cbc" | "signals" | "sources";
  title: string;
  sections: readonly string[];
  format: "A4";
  orientation: "portrait";
};

export type MarketRadarPdfExportSpec = {
  format: "A4";
  orientation: "portrait";
  pages: readonly MarketRadarPdfPage[];
};

export type MarketRadarReportSnapshotInput = {
  report: import("@/data/market-radar").MarketRadarReport;
  moi: import("@/lib/market-radar/sources/moi-real-price").MarketRadarMoiLiveData;
  cbc: import("@/lib/market-radar/sources/cbc-housing-finance").MarketRadarCbcLiveData;
  analysis: import("@/data/market-radar").MarketRadarAnalysisResult;
  generatedAt?: string;
};
