import type { MarketRadarReportSnapshot } from "./types";
import { buildMarketRadarProductionReportSnapshot } from "./buildMarketRadarProductionReportSnapshot";
import { loadMarketRadarAnalysis } from "@/lib/market-radar/loadMarketRadarAnalysis";
import { loadMarketRadarCbcData } from "@/lib/market-radar/loadMarketRadarCbcData";
import { loadMarketRadarLiveData } from "@/lib/market-radar/loadMarketRadarLiveData";

/** Build-time adapter for future report routes; it performs no network request or entitlement check. */
export function loadMarketRadarReportSnapshot(): MarketRadarReportSnapshot {
  const moi = loadMarketRadarLiveData();
  const cbc = loadMarketRadarCbcData();
  return buildMarketRadarProductionReportSnapshot({ moi, cbc, analysis: loadMarketRadarAnalysis(moi, cbc) });
}
