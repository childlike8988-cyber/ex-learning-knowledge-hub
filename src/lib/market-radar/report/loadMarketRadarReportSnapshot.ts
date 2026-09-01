import type { MarketRadarReportSnapshot } from "./types";
import { buildMarketRadarReportSnapshot } from "./buildMarketRadarReportSnapshot";
import { loadMarketRadarAnalysis } from "@/lib/market-radar/loadMarketRadarAnalysis";
import { loadMarketRadarCbcData } from "@/lib/market-radar/loadMarketRadarCbcData";
import { loadMarketRadarLiveData } from "@/lib/market-radar/loadMarketRadarLiveData";
import { loadMarketRadarReport } from "@/lib/market-radar/loadMarketRadarReport";

/** Build-time adapter for future report routes; it performs no network request or entitlement check. */
export function loadMarketRadarReportSnapshot(): MarketRadarReportSnapshot {
  const report = loadMarketRadarReport();
  const moi = loadMarketRadarLiveData();
  const cbc = loadMarketRadarCbcData();
  return buildMarketRadarReportSnapshot({ report, moi, cbc, analysis: loadMarketRadarAnalysis(moi, cbc) });
}
