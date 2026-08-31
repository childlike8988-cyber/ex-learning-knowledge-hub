import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MOI_REAL_PRICE_SOURCE_ID, type MarketRadarMoiHistoricalPeriod, type MarketRadarMoiHistoricalSeries } from "@/lib/market-radar/sources/moi-real-price";

const historyPath = join(process.cwd(), "public", "data", "market-radar", "live", "moi-real-price-history.json");

function isPeriod(value: unknown): value is MarketRadarMoiHistoricalPeriod {
  if (!value || typeof value !== "object") return false;
  const period = value as Partial<MarketRadarMoiHistoricalPeriod>;
  return period.status === "live"
    && period.sourceId === MOI_REAL_PRICE_SOURCE_ID
    && typeof period.periodId === "string"
    && typeof period.dataPeriodStart === "string"
    && typeof period.dataPeriodEnd === "string"
    && typeof period.dayCount === "number" && period.dayCount > 0
    && typeof period.transactionCount === "number"
    && Array.isArray(period.districtTransactionCounts)
    && typeof period.methodologyVersion === "string"
    && typeof period.schemaVersion === "string"
    && period.scope === "kaohsiung"
    && period.transactionType === "sale";
}

export function loadMarketRadarMoiHistory(): MarketRadarMoiHistoricalSeries | undefined {
  if (!existsSync(historyPath)) return undefined;
  try {
    const parsed: unknown = JSON.parse(readFileSync(historyPath, "utf8"));
    if (!parsed || typeof parsed !== "object") return undefined;
    const history = parsed as Partial<MarketRadarMoiHistoricalSeries>;
    if (history.status !== "live" || history.sourceId !== MOI_REAL_PRICE_SOURCE_ID || typeof history.methodologyVersion !== "string" || !Array.isArray(history.periods) || !history.periods.every(isPeriod)) return undefined;
    return { status: "live", sourceId: MOI_REAL_PRICE_SOURCE_ID, methodologyVersion: history.methodologyVersion, periods: [...history.periods].sort((left, right) => left.dataPeriodStart.localeCompare(right.dataPeriodStart)) };
  } catch {
    return undefined;
  }
}
