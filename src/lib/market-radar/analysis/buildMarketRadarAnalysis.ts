import type {
  MarketRadarAnalysis,
  MarketRadarAnalysisResult,
  MarketRadarDataCoverage,
  MarketRadarDetail,
  MarketRadarFact,
  MarketRadarFreshness,
  MarketRadarSignal,
  MarketRadarSignalDirection,
  MarketRadarSignalLevel,
  MarketRadarSource,
} from "@/data/market-radar";
import type { MarketRadarCbcLiveData } from "@/lib/market-radar/sources/cbc-housing-finance";
import type { MarketRadarMoiLiveData } from "@/lib/market-radar/sources/moi-real-price";
import { buildMoiHistoricalPeriod, findComparablePreviousPeriod } from "@/lib/market-radar/moiHistoricalComparison";
import type { MarketRadarMoiHistoricalSeries } from "@/lib/market-radar/sources/moi-real-price";

export const MARKET_RADAR_ANALYSIS_RULE_VERSION = "1.1.0";
const RATE_DIRECTION_THRESHOLD_PERCENTAGE_POINTS = 0.005;
const ANALYSIS_DISCLAIMER = "Market Radar 解讀係依公開資料整理之分析，不代表原始資料來源立場，亦不構成投資或交易建議。";

function unavailableFreshness(): MarketRadarFreshness {
  return { status: "aging", label: "資料待補", expectedUpdateFrequency: "irregular" };
}

function analysis(summary: string, interpretation: string, direction: MarketRadarAnalysis["direction"], confidence: MarketRadarAnalysis["confidence"], impact = "目前僅作資料狀態與閱讀限制說明。", impactLevel: MarketRadarAnalysis["impactLevel"] = "low"): MarketRadarAnalysis {
  return { summary, interpretation, impact, impactLevel, direction, affectedAudience: ["buyer", "seller", "agent", "investor"], confidence, notes: `${ANALYSIS_DISCLAIMER} Rule: ${MARKET_RADAR_ANALYSIS_RULE_VERSION}` };
}

function dataPeriod(start?: string, end?: string, label?: string) {
  return { ...(start ? { start } : {}), ...(end ? { end } : {}), ...(label ? { label } : {}) };
}

function uniqueSources(signals: readonly MarketRadarSignal[]): readonly MarketRadarSource[] {
  return [...new Map(signals.flatMap((signal) => signal.sources).map((source) => [source.id, source])).values()];
}

function uniqueFacts(signals: readonly MarketRadarSignal[]): readonly MarketRadarFact[] {
  return signals.flatMap((signal) => signal.facts);
}

function signal(id: MarketRadarSignal["id"], label: string, status: MarketRadarSignal["status"], direction: MarketRadarSignalDirection, level: MarketRadarSignalLevel, confidence: MarketRadarSignal["confidence"], facts: readonly MarketRadarFact[], sources: readonly MarketRadarSource[], valueAnalysis: MarketRadarAnalysis, generatedAt: string): MarketRadarSignal {
  return { id, label, status, direction, level, confidence, factIds: facts.map((fact) => fact.id), sourceIds: sources.map((source) => source.id), facts, sources, analysis: valueAnalysis, generatedAt, dataStatus: status };
}

function currentMoiPeriod(moi: MarketRadarMoiLiveData) {
  if (moi.status !== "live" || !moi.quality || typeof moi.metrics.transactionCount !== "number" || !moi.dataPeriodStart || !moi.dataPeriodEnd || !moi.sourcePublishedAt || !moi.generatedAt || !moi.verifiedAt || !moi.retrievedAt || !moi.methodologyVersion) return undefined;
  return buildMoiHistoricalPeriod({ periodId: `moi-${moi.dataPeriodStart}-${moi.dataPeriodEnd}`, sourceId: moi.sourceId, sourcePublishedAt: moi.sourcePublishedAt, dataPeriodStart: moi.dataPeriodStart, dataPeriodEnd: moi.dataPeriodEnd, transactionCount: moi.metrics.transactionCount, districtTransactionCounts: moi.metrics.districtTransactionCounts, generatedAt: moi.generatedAt, verifiedAt: moi.verifiedAt, retrievedAt: moi.retrievedAt, methodologyVersion: moi.methodologyVersion, schemaVersion: "moi-real-price-csv-v1", quality: moi.quality });
}

function buildTransactionActivity(moi: MarketRadarMoiLiveData, history: MarketRadarMoiHistoricalSeries | undefined, generatedAt: string): MarketRadarSignal {
  if (moi.status !== "live" || !moi.source || typeof moi.metrics.transactionCount !== "number") {
    return signal("transaction-activity", "成交熱度", "unavailable", "unavailable", "unavailable", "low", [], [], analysis("尚未取得可驗證的內政部成交資料。", "成交熱度將在至少兩個可比較的官方資料期存在後，才判斷方向。", "neutral", "low"), generatedAt);
  }
  const period = dataPeriod(moi.dataPeriodStart, moi.dataPeriodEnd, moi.dataPeriodStart && moi.dataPeriodEnd ? `${moi.dataPeriodStart} ～ ${moi.dataPeriodEnd}` : "官方資料期間");
  const facts: MarketRadarFact[] = [{ id: `moi-transaction-count-${moi.dataPeriodStart ?? "latest"}`, label: "高雄市有效成交紀錄", value: moi.metrics.transactionCount, unit: "件", sourceIds: [moi.source.id], dataPeriod: period, isEstimated: false, isMock: false }];
  const current = currentMoiPeriod(moi);
  const comparison = current ? findComparablePreviousPeriod(current, history) : undefined;
  if (!comparison || !comparison.isComparable || comparison.changePercent === undefined || comparison.changePercent === null || !comparison.direction || comparison.direction === "unavailable") {
    return signal("transaction-activity", "成交熱度", "live", "unavailable", "unavailable", "medium", facts, [moi.source], analysis("已有官方成交資料，尚需歷史基準判斷趨勢。", "單一資料期成交件數不能直接判定市場熱度或方向。", "neutral", "medium"), generatedAt);
  }
  const direction: MarketRadarSignalDirection = comparison.direction;
  const previousPeriod = { start: comparison.previous.start, end: comparison.previous.end, label: `${comparison.previous.start} ～ ${comparison.previous.end}` };
  facts.push({ id: `moi-transaction-count-previous-${comparison.previousPeriodId}`, label: "前期有效成交紀錄", value: comparison.previous.transactionCount, unit: "件", comparison: `本期 ${comparison.comparisonMethod === "daily-normalized" ? "日均" : "件數"}較前期 ${comparison.changePercent >= 0 ? "+" : ""}${comparison.changePercent.toFixed(1)}%`, sourceIds: [moi.source.id], dataPeriod: previousPeriod, isEstimated: false, isMock: false });
  facts.push({ id: `moi-period-days-current-${comparison.currentPeriodId}`, label: "本期資料天數", value: comparison.current.dayCount, unit: "日", sourceIds: [moi.source.id], dataPeriod: period, isEstimated: false, isMock: false });
  facts.push({ id: `moi-period-days-previous-${comparison.previousPeriodId}`, label: "前期資料天數", value: comparison.previous.dayCount, unit: "日", sourceIds: [moi.source.id], dataPeriod: previousPeriod, isEstimated: false, isMock: false });
  if (comparison.comparisonMethod === "daily-normalized") {
    facts.push({ id: `moi-daily-average-current-${comparison.currentPeriodId}`, label: "本期日均登錄件數", value: Number(comparison.currentDailyAverage?.toFixed(2)), unit: "件／日", sourceIds: [moi.source.id], dataPeriod: period, isEstimated: false, isMock: false });
    facts.push({ id: `moi-daily-average-previous-${comparison.previousPeriodId}`, label: "前期日均登錄件數", value: Number(comparison.previousDailyAverage?.toFixed(2)), unit: "件／日", sourceIds: [moi.source.id], dataPeriod: previousPeriod, isEstimated: false, isMock: false });
  }
  const summary = direction === "up" ? "與前一可比較資料期相比，實價登錄案件活動增加。" : direction === "down" ? "與前一可比較資料期相比，實價登錄案件活動減少。" : "與前一可比較資料期相比，實價登錄案件活動變化有限。";
  const confidence = comparison.confidence ?? "low";
  return signal("transaction-activity", "成交熱度", "live", direction, direction === "up" ? "high" : direction === "down" ? "low" : "neutral", confidence, facts, [moi.source], analysis(summary, `比較方式：${comparison.comparisonMethod === "daily-normalized" ? "資料期間天數不同，使用日均登錄件數標準化比較。" : "資料期間天數相同，使用原始登錄件數比較。"} 成交件數反映已揭露登錄樣本量，不等同即時市場需求或買氣。`, direction === "up" ? "positive" : direction === "down" ? "negative" : "neutral", confidence, "應搭配資料發布落差、區域與產品條件判讀。", "medium"), generatedAt);
}

function buildFinancingEnvironment(cbc: MarketRadarCbcLiveData, generatedAt: string): MarketRadarSignal {
  if (cbc.status !== "live" || !cbc.source || !cbc.latest || typeof cbc.latest.mortgageRate !== "number") {
    return signal("financing-environment", "融資環境", "unavailable", "unavailable", "unavailable", "low", [], [], analysis("尚未取得可驗證的中央銀行房貸資料。", "房貸資料未通過驗證時，不以 Fixture 取代官方月資料。", "neutral", "low"), generatedAt);
  }
  const period = dataPeriod(cbc.dataPeriodStart, cbc.dataPeriodEnd, cbc.latest.period);
  const change = cbc.latest.mortgageRateChangePercentagePoints;
  const direction: MarketRadarSignalDirection = change === undefined ? "unavailable" : change > RATE_DIRECTION_THRESHOLD_PERCENTAGE_POINTS ? "up" : change < -RATE_DIRECTION_THRESHOLD_PERCENTAGE_POINTS ? "down" : "flat";
  const facts: MarketRadarFact[] = [{ id: `cbc-mortgage-rate-${cbc.latest.period}`, label: "新承做購屋貸款利率", value: cbc.latest.mortgageRate, unit: "％", comparison: change === undefined ? undefined : `較前期 ${change >= 0 ? "+" : ""}${change.toFixed(3)} 個百分點`, sourceIds: [cbc.source.id], dataPeriod: period, isEstimated: false, isMock: false }];
  if (typeof cbc.latest.newMortgageAmount === "number") facts.push({ id: `cbc-mortgage-amount-${cbc.latest.period}`, label: "新承做購屋貸款金額", value: cbc.latest.newMortgageAmount, unit: " 百萬元", sourceIds: [cbc.source.id], dataPeriod: period, isEstimated: false, isMock: false });
  const interpretation = direction === "down" ? "最新購屋貸款利率較前期小幅下降，融資成本略有緩和，但單月變化不足以單獨判斷房市方向。" : direction === "up" ? "最新購屋貸款利率較前期上升，購屋融資成本略增，仍需搭配成交量與價格資料判讀。" : "最新購屋貸款利率與前期差異有限，融資環境整體變化不大。";
  return signal("financing-environment", "融資環境", "live", direction, "neutral", "high", facts, [cbc.source], analysis("中央銀行五大銀行新承做購屋貸款資料已接入。", interpretation, "neutral", "high", "房貸利率反映融資成本，不是房價指標。", "medium"), generatedAt);
}

function buildPriceMomentum(generatedAt: string): MarketRadarSignal {
  return signal("price-momentum", "價格動能", "unavailable", "unavailable", "unavailable", "low", [], [], analysis("尚待正式價格序列。", "未取得可比較的官方價格指標前，不顯示價格方向或以 Fixture 箭頭替代。", "neutral", "low"), generatedAt);
}

function temperatureDetail(signals: readonly MarketRadarSignal[], generatedAt: string, label: string, description: string, dataStatus: "live" | "partial" | "unavailable", confidence: "low" | "medium" | "high"): MarketRadarDetail {
  const liveSignals = signals.filter((item) => item.status === "live");
  return { id: "market-radar-temperature-analysis", category: dataStatus === "live" ? "MULTI-SOURCE · LIVE" : dataStatus === "partial" ? "PARTIAL LIVE" : "WAITING", title: "今日市場溫度｜資料基礎", summary: description, facts: uniqueFacts(liveSignals), analysis: analysis("市場溫度由已接入的官方訊號依規則產生。", "未達雙來源、可比較條件時，不宣稱完整房市溫度。", "neutral", confidence, "資料涵蓋度與來源時間需個別閱讀。", "low"), sources: uniqueSources(liveSignals), freshness: liveSignals[0]?.sources[0]?.expectedUpdateFrequency ? { status: "normal", label: dataStatus === "partial" ? "部分資料已更新" : "官方資料已更新", expectedUpdateFrequency: liveSignals[0].sources[0].expectedUpdateFrequency } : unavailableFreshness(), isMock: false };
}

function buildTemperature(coverage: MarketRadarDataCoverage, signals: readonly MarketRadarSignal[], generatedAt: string) {
  const transaction = signals.find((item) => item.id === "transaction-activity")!;
  const financing = signals.find((item) => item.id === "financing-environment")!;
  const liveSignalCount = signals.filter((item) => item.status === "live").length;
  let label = "資料建立中";
  let description = "目前尚未有足夠的可比較官方資料。";
  let dataStatus: "live" | "partial" | "unavailable" = liveSignalCount > 0 ? "partial" : "unavailable";
  let confidence: "low" | "medium" | "high" = "low";
  if (coverage.cbc === "live" && coverage.moi === "unavailable") description = "目前融資環境已接入中央銀行資料；成交與價格趨勢仍待官方資料完成。";
  if (coverage.cbc === "live" && coverage.moi === "live" && transaction.direction === "unavailable") description = "內政部與中央銀行官方資料已接入；內政部目前僅有一期資料，成交趨勢與價格序列仍待建立。";
  if (coverage.cbc === "live" && coverage.moi === "live" && transaction.direction !== "unavailable") {
    dataStatus = "partial";
    confidence = "medium";
    if (transaction.direction === "down" && financing.direction === "up") { label = "偏冷"; description = "成交活動轉弱，同時融資成本上升，買方決策環境偏保守。"; }
    else if (transaction.direction === "up" && financing.direction === "flat") { label = "偏熱"; description = "成交活動回升，融資環境變化有限，市場交易動能相對改善。"; }
    else { label = "中性"; description = "成交活動與融資環境皆具可比較官方資料；價格動能資料尚待建立。"; }
  }
  return { label, description, confidence, dataStatus, basisSignalIds: signals.filter((item) => item.status === "live").map((item) => item.id), detail: temperatureDetail(signals, generatedAt, label, description, dataStatus, confidence) };
}

function buildDailyKeyTake(signals: readonly MarketRadarSignal[]) {
  const transaction = signals.find((item) => item.id === "transaction-activity")!;
  const financing = signals.find((item) => item.id === "financing-environment")!;
  if (transaction.status !== "live" || financing.status !== "live" || transaction.direction === "unavailable" || financing.direction === "unavailable" || transaction.confidence === "low" || financing.confidence === "low") return undefined;
  let text: string;
  if (transaction.direction === "down" && financing.direction === "up") text = "成交活動轉弱，同時融資成本上升，\n買方決策環境偏保守。";
  else if (transaction.direction === "down" && financing.direction === "down") text = "成交活動仍偏弱，但房貸利率略有緩和，\n後續需觀察買方是否回流。";
  else if (transaction.direction === "up" && financing.direction === "flat") text = "成交活動回升，融資環境變化有限，\n市場交易動能相對改善。";
  else text = "成交與融資訊號已接入，\n仍需搭配正式價格序列持續觀察。";
  return { text, basisFactIds: [...transaction.factIds, ...financing.factIds], basisSignalIds: [transaction.id, financing.id], dataStatus: "live" as const };
}

export function buildMarketRadarAnalysis(moi: MarketRadarMoiLiveData, cbc: MarketRadarCbcLiveData, history?: MarketRadarMoiHistoricalSeries): MarketRadarAnalysisResult {
  const generatedAt = [moi.generatedAt, cbc.generatedAt].filter((value): value is string => typeof value === "string").sort().at(-1) ?? "";
  const dataCoverage: MarketRadarDataCoverage = { moi: moi.status === "live" ? "live" : "unavailable", moiHistory: history?.status === "live" && history.periods.length > 0 ? "ready" : "waiting", cbc: cbc.status === "live" ? "live" : "unavailable", priceMomentum: "waiting" };
  const signals = [buildTransactionActivity(moi, history, generatedAt), buildFinancingEnvironment(cbc, generatedAt), buildPriceMomentum(generatedAt)];
  const marketTemperature = buildTemperature(dataCoverage, signals, generatedAt);
  const dailyKeyTake = buildDailyKeyTake(signals);
  const warnings = [
    ...(dataCoverage.moi === "unavailable" ? ["內政部成交資料尚待官方批次檔完成匯入。"] : []),
    "成交件數不等於市場需求；實價登錄具有申報與發布時間差。",
    "房貸利率與新承做金額不是房價指標，且不得單獨推論房價方向。",
  ];
  return { generatedAt, ruleVersion: MARKET_RADAR_ANALYSIS_RULE_VERSION, dataCoverage, signals, marketTemperature, ...(dailyKeyTake ? { dailyKeyTake } : {}), warnings };
}

export const marketRadarAnalysisDisclaimer = ANALYSIS_DISCLAIMER;
