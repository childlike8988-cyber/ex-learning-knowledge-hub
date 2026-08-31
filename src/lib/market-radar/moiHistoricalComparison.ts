import type { MarketRadarDistrictTransactionCount, MarketRadarMoiHistoricalPeriod, MarketRadarMoiHistoricalSeries, MarketRadarMoiPeriodComparison } from "@/lib/market-radar/sources/moi-real-price";

export const MOI_TRANSACTION_ACTIVITY_FLAT_THRESHOLD_PERCENT = 3;

function toDayCount(start: string, end: string): number | undefined {
  const startAt = Date.parse(`${start}T00:00:00Z`);
  const endAt = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt < startAt) return undefined;
  return Math.floor((endAt - startAt) / 86_400_000) + 1;
}

export function buildMoiHistoricalPeriod(input: {
  periodId: string;
  sourceId: "moi-real-price-sales";
  sourcePublishedAt: string;
  dataPeriodStart: string;
  dataPeriodEnd: string;
  transactionCount: number;
  districtTransactionCounts: readonly MarketRadarDistrictTransactionCount[];
  generatedAt: string;
  verifiedAt: string;
  retrievedAt: string;
  methodologyVersion: string;
  schemaVersion: string;
  quality: MarketRadarMoiHistoricalPeriod["quality"];
}): MarketRadarMoiHistoricalPeriod {
  const dayCount = toDayCount(input.dataPeriodStart, input.dataPeriodEnd);
  if (!dayCount) throw new Error("MOI history period has an invalid data range.");
  return { status: "live", ...input, dayCount, scope: "kaohsiung", transactionType: "sale" };
}

function periodBefore(current: MarketRadarMoiHistoricalPeriod, candidate: MarketRadarMoiHistoricalPeriod) {
  return candidate.dataPeriodEnd < current.dataPeriodStart;
}

export function compareMoiPeriods(current: MarketRadarMoiHistoricalPeriod, previous: MarketRadarMoiHistoricalPeriod): MarketRadarMoiPeriodComparison {
  const base = {
    current: { start: current.dataPeriodStart, end: current.dataPeriodEnd, dayCount: current.dayCount, transactionCount: current.transactionCount },
    previous: { start: previous.dataPeriodStart, end: previous.dataPeriodEnd, dayCount: previous.dayCount, transactionCount: previous.transactionCount },
    currentPeriodId: current.periodId,
    previousPeriodId: previous.periodId,
  } as const;
  if (!periodBefore(current, previous)) return { ...base, comparisonMethod: "unavailable", isComparable: false, reason: "前期資料期間必須早於本期。" };
  if (current.sourceId !== previous.sourceId || current.transactionType !== previous.transactionType || current.scope !== previous.scope) return { ...base, comparisonMethod: "unavailable", isComparable: false, reason: "資料來源、範圍或案件類型不一致。" };
  if (current.methodologyVersion !== previous.methodologyVersion || current.schemaVersion !== previous.schemaVersion) return { ...base, comparisonMethod: "unavailable", isComparable: false, reason: "匯入方法或官方 schema 版本不一致。" };
  if (current.quality.acceptedRows <= 0 || previous.quality.acceptedRows <= 0 || current.quality.districtCount <= 0 || previous.quality.districtCount <= 0) return { ...base, comparisonMethod: "unavailable", isComparable: false, reason: "其中一期資料品質未達可比較條件。" };
  const comparisonMethod = current.dayCount === previous.dayCount ? "raw-count" : "daily-normalized";
  const currentComparableValue = comparisonMethod === "raw-count" ? current.transactionCount : current.transactionCount / current.dayCount;
  const previousComparableValue = comparisonMethod === "raw-count" ? previous.transactionCount : previous.transactionCount / previous.dayCount;
  const change = currentComparableValue - previousComparableValue;
  const changePercent = previousComparableValue === 0 ? null : (change / previousComparableValue) * 100;
  const direction = changePercent === null ? "unavailable" : Math.abs(changePercent) < MOI_TRANSACTION_ACTIVITY_FLAT_THRESHOLD_PERCENT ? "flat" : changePercent >= MOI_TRANSACTION_ACTIVITY_FLAT_THRESHOLD_PERCENT ? "up" : "down";
  const previousByDistrict = new Map(previous.districtTransactionCounts.map((item) => [item.district, item.transactionCount]));
  const currentByDistrict = new Map(current.districtTransactionCounts.map((item) => [item.district, item.transactionCount]));
  const districtTransactionChanges = [...new Set([...currentByDistrict.keys(), ...previousByDistrict.keys()])].map((district) => {
    const currentCount = currentByDistrict.get(district) ?? 0;
    const previousCount = previousByDistrict.get(district) ?? 0;
    const currentDailyAverage = currentCount / current.dayCount;
    const previousDailyAverage = previousCount / previous.dayCount;
    const comparisonCurrent = comparisonMethod === "raw-count" ? currentCount : currentDailyAverage;
    const comparisonPrevious = comparisonMethod === "raw-count" ? previousCount : previousDailyAverage;
    const districtChange = comparisonCurrent - comparisonPrevious;
    const districtChangePercent = comparisonPrevious === 0 ? null : (districtChange / comparisonPrevious) * 100;
    const direction: "up" | "down" | "flat" | "unavailable" = districtChangePercent === null ? "unavailable" : Math.abs(districtChangePercent) < MOI_TRANSACTION_ACTIVITY_FLAT_THRESHOLD_PERCENT ? "flat" : districtChangePercent >= MOI_TRANSACTION_ACTIVITY_FLAT_THRESHOLD_PERCENT ? "up" : "down";
    return { district, currentCount, previousCount, ...(comparisonMethod === "daily-normalized" ? { currentDailyAverage, previousDailyAverage } : {}), change: districtChange, changePercent: districtChangePercent, newActivity: comparisonPrevious === 0 && comparisonCurrent > 0, direction };
  }).sort((left, right) => Math.abs(right.change) - Math.abs(left.change) || left.district.localeCompare(right.district, "zh-Hant"));
  return { ...base, comparisonMethod, isComparable: true, currentDailyAverage: current.transactionCount / current.dayCount, previousDailyAverage: previous.transactionCount / previous.dayCount, change, changePercent, direction, confidence: comparisonMethod === "raw-count" ? "high" : "medium", districtTransactionChanges };
}

export function findComparablePreviousPeriod(current: MarketRadarMoiHistoricalPeriod, history: MarketRadarMoiHistoricalSeries | undefined): MarketRadarMoiPeriodComparison | undefined {
  if (!history || history.status !== "live") return undefined;
  const candidates = history.periods.filter((period) => period.periodId !== current.periodId && periodBefore(current, period)).sort((left, right) => right.dataPeriodEnd.localeCompare(left.dataPeriodEnd));
  for (const candidate of candidates) {
    const comparison = compareMoiPeriods(current, candidate);
    if (comparison.isComparable) return comparison;
  }
  return undefined;
}
