import type { MarketRadarAnalysisResult } from "@/data/market-radar";
import { buildMarketRadarAnalysis } from "@/lib/market-radar/analysis/buildMarketRadarAnalysis";
import type { MarketRadarCbcLiveData } from "@/lib/market-radar/sources/cbc-housing-finance";
import type { MarketRadarMoiLiveData } from "@/lib/market-radar/sources/moi-real-price";

/** Build-time only: all inputs are validated local Live JSON or safe updating fallbacks. */
export function loadMarketRadarAnalysis(moi: MarketRadarMoiLiveData, cbc: MarketRadarCbcLiveData): MarketRadarAnalysisResult {
  try {
    return buildMarketRadarAnalysis(moi, cbc);
  } catch {
    return buildMarketRadarAnalysis(
      { ...moi, status: "updating", dataStatus: "updating", source: undefined, metrics: { districtTransactionCounts: [] } },
      { ...cbc, status: "updating", dataStatus: "updating", source: undefined, latest: undefined, history: [] },
    );
  }
}
