export type MarketTrend = "up" | "down" | "steady";
export type MarketRadarSourcePriority = "official" | "institutional" | "research" | "editorial";
export type MarketRadarSourceType = "government" | "public-record" | "institutional-report" | "research-report" | "editorial-reference";
export type MarketRadarExpectedUpdateFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "irregular";
export type MarketRadarFreshnessStatus = "fresh" | "normal" | "aging" | "stale";
export type MarketRadarImpactLevel = "low" | "medium" | "high";
export type MarketRadarDirection = "positive" | "neutral" | "negative" | "mixed";
export type MarketRadarAudience = "buyer" | "seller" | "agent" | "investor" | "homeowner";

export type MarketRadarSource = {
  id: string;
  name: string;
  publisher: string;
  type: MarketRadarSourceType;
  priority: MarketRadarSourcePriority;
  url?: string;
  publishedAt?: string;
  dataPeriodStart?: string;
  dataPeriodEnd?: string;
  verifiedAt?: string;
  retrievedAt?: string;
  expectedUpdateFrequency: MarketRadarExpectedUpdateFrequency;
  notes?: string;
  isPrimarySource: boolean;
  isMock: boolean;
};

export type MarketRadarFreshness = {
  status: MarketRadarFreshnessStatus;
  label: string;
  daysSincePublished?: number;
  daysSinceVerified?: number;
  expectedUpdateFrequency: MarketRadarExpectedUpdateFrequency;
};

export type MarketRadarDataPeriod = { start?: string; end?: string; label?: string };

export type MarketRadarFact = {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  comparison?: string;
  sourceIds: readonly string[];
  dataPeriod?: MarketRadarDataPeriod;
  isEstimated: boolean;
  isMock: boolean;
};

export type MarketRadarAnalysis = {
  summary: string;
  interpretation: string;
  impact: string;
  impactLevel: MarketRadarImpactLevel;
  direction: MarketRadarDirection;
  affectedAudience: readonly MarketRadarAudience[];
  confidence: "low" | "medium" | "high";
  notes?: string;
};

export type MarketRadarDetail = {
  id: string;
  category: string;
  title: string;
  summary: string;
  facts: readonly MarketRadarFact[];
  analysis: MarketRadarAnalysis;
  sources: readonly MarketRadarSource[];
  freshness: MarketRadarFreshness;
  isMock: boolean;
};

export type MarketRadarIndicator = {
  id: "transactionHeat" | "priceMomentum" | "negotiationSpace";
  label: string;
  value: string;
  trend: MarketTrend;
  detail: string;
  sourceIds: readonly string[];
  dataPeriod: MarketRadarDataPeriod;
  updatedAt?: string;
  analysis: MarketRadarAnalysis;
};

export type MarketRadarNewsItem = {
  id: string;
  category: "政策" | "房貸" | "實價" | "建案" | "區域";
  title: string;
  summary: string;
  sourceIds: readonly string[];
  publishedAt?: string;
  updatedAt?: string;
  detail: MarketRadarDetail;
  isMock: boolean;
};

export type MarketRadarChart = {
  id: "transaction-heat" | "price-momentum" | "district-comparison";
  dataStatus: "fixture" | "live";
  title: string;
  subtitle: string;
  chartType: "line" | "bar" | "comparison";
  xAxis?: { label?: string; labels: readonly string[] };
  yAxis?: { label?: string; unit?: string };
  series: readonly { id: string; label: string; values: readonly number[]; displayValues?: readonly string[] }[];
  dataPeriod: MarketRadarDataPeriod;
  sourceIds: readonly string[];
  analysis: MarketRadarAnalysis;
  detail: MarketRadarDetail;
  isMock: boolean;
};

export type MarketRadarDistrictHighlight = {
  id: string;
  district: string;
  headline: string;
  summary: string;
  signals: readonly string[];
  facts: readonly MarketRadarFact[];
  sourceIds: readonly string[];
  detail: MarketRadarDetail;
  isMock: boolean;
};

export type MarketRadarDailyKeyTake = {
  text: string;
  lineCount: 1 | 2 | 3;
  sourceIds: readonly string[];
  analysisBasis: string;
  isMock: boolean;
};

export type MarketRadarAccess = {
  freeQuarterlyDownloadsAllowed: number;
  freeQuarterlyDownloadsUsed: number;
  freeQuarterlyDownloadsRemaining: number;
  hasActiveMonthlySubscription: boolean;
  hasActiveAnnualSubscription: boolean;
};

export type MarketRadarPricing = { monthlyPrice: number; annualPrice: number; monthlyDurationDays: number; annualDurationDays: number; annualEquivalentMonthly: number };
export type MarketRadarFreePlan = { downloadsPerQuarter: number; includesPng: boolean; includesPdf: boolean; creditsCarryOver: boolean };
export type MarketRadarQuarter = { id: string; label: string; quarterStart: string; quarterEnd: string; nextQuarterLabel: string };

export type MarketRadarReport = {
  id: string;
  status: "fixture" | "live" | "fallback";
  isMock: boolean;
  date: string;
  updatedAt: string;
  updatedAtLabel: string;
  title: string;
  subtitle: string;
  summary: string;
  sources: readonly MarketRadarSource[];
  freshness: MarketRadarFreshness;
  marketTemperature: { label: string; description: string; indicators: readonly MarketRadarIndicator[]; sourceIds: readonly string[]; dataPeriod: MarketRadarDataPeriod; updatedAt?: string };
  dailyKeyTake: MarketRadarDailyKeyTake;
  districtHighlights: readonly MarketRadarDistrictHighlight[];
  keyTakeaways: readonly string[];
  newsItems: readonly MarketRadarNewsItem[];
  publicCharts: readonly MarketRadarChart[];
  proContent: { title: string; description: string; benefits: readonly string[] };
  freePlan: MarketRadarFreePlan;
  currentQuarter: MarketRadarQuarter;
  downloadBundle: { id: "current-full-report"; reportId: string; title: string; formats: readonly ["PNG", "PDF"]; freeCreditCost: number };
  downloads: readonly { id: "brief-png" | "analysis-pdf"; title: string; description: string; format: "PNG" | "PDF"; access: "full-report" }[];
  pricing: MarketRadarPricing;
  access: MarketRadarAccess;
};

export const marketRadarFallbackReport: MarketRadarReport = {
  id: "market-radar-fallback", status: "fallback", isMock: true, date: "—", updatedAt: "", updatedAtLabel: "資料暫時無法取得", title: "高雄房市快報", subtitle: "Kaohsiung Housing Brief", summary: "目前正在等待可驗證的資料 Fixture。頁面骨架與下載方案仍可安全顯示。", sources: [],
  freshness: { status: "stale", label: "資料暫時無法取得", expectedUpdateFrequency: "irregular" },
  marketTemperature: { label: "待更新", description: "來源資料尚未通過驗證。", indicators: [], sourceIds: [], dataPeriod: {} },
  dailyKeyTake: { text: "資料暫時無法取得，\n請稍後再試。", lineCount: 2, sourceIds: [], analysisBasis: "Fallback state", isMock: true },
  districtHighlights: [], keyTakeaways: [], newsItems: [], publicCharts: [],
  proContent: { title: "MARKET RADAR PRO", description: "訂閱方案資訊維持可見；正式資料仍需來源驗證。", benefits: [] },
  freePlan: { downloadsPerQuarter: 1, includesPng: true, includesPdf: true, creditsCarryOver: false },
  currentQuarter: { id: "—", label: "季度免費下載額度", quarterStart: "", quarterEnd: "", nextQuarterLabel: "資料恢復後顯示" },
  downloadBundle: { id: "current-full-report", reportId: "market-radar-fallback", title: "本期完整報告", formats: ["PNG", "PDF"], freeCreditCost: 1 },
  downloads: [
    { id: "brief-png", title: "PNG 快報", description: "適合 LINE、社群分享、客戶溝通與快速轉傳。", format: "PNG", access: "full-report" },
    { id: "analysis-pdf", title: "PDF 完整報告", description: "適合完整閱讀、客戶說明、提案、市場簡報與留存。", format: "PDF", access: "full-report" },
  ],
  pricing: { monthlyPrice: 40, annualPrice: 360, monthlyDurationDays: 30, annualDurationDays: 365, annualEquivalentMonthly: 30 },
  access: { freeQuarterlyDownloadsAllowed: 1, freeQuarterlyDownloadsUsed: 0, freeQuarterlyDownloadsRemaining: 1, hasActiveMonthlySubscription: false, hasActiveAnnualSubscription: false },
};

export function hasFreeQuarterlyCredit(report: MarketRadarReport): boolean { return resolveMarketRadarAccess(report.access).hasFreeQuarterlyCredit; }
export function hasMarketRadarProAccess(report: MarketRadarReport): boolean { return resolveMarketRadarAccess(report.access).hasActiveProSubscription; }
export function resolveMarketRadarAccess(access: MarketRadarAccess) {
  const hasActiveProSubscription = access.hasActiveMonthlySubscription || access.hasActiveAnnualSubscription;
  const hasFreeQuarterlyCredit = access.freeQuarterlyDownloadsRemaining > 0;
  return { hasActiveProSubscription, hasFreeQuarterlyCredit, canDownloadWithPro: hasActiveProSubscription, canDownloadCurrentFullReport: hasActiveProSubscription || hasFreeQuarterlyCredit, isFreeQuarterlyCreditExhausted: !hasActiveProSubscription && !hasFreeQuarterlyCredit };
}
export function canDownloadMarketRadarReport(report: MarketRadarReport): boolean { return resolveMarketRadarAccess(report.access).canDownloadCurrentFullReport; }
