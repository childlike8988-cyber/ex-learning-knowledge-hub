import type { MarketRadarHealthStatus, MarketRadarSourceRefreshState } from "@/lib/market-radar/automation/types";

export function buildMarketRadarHealthStatus(input: {
  moiLatest: MarketRadarSourceRefreshState;
  moiHistory: MarketRadarSourceRefreshState;
  cbc: MarketRadarSourceRefreshState;
  lastBuildAt: string;
}): MarketRadarHealthStatus {
  const primarySourcesLive = input.moiLatest.status === "live" && input.cbc.status === "live";
  const historyReady = input.moiHistory.status === "live";
  return {
    overall: primarySourcesLive ? (historyReady ? "healthy" : "partial") : "degraded",
    sources: { moiLatest: input.moiLatest, moiHistory: input.moiHistory, cbc: input.cbc },
    analysis: primarySourcesLive && historyReady ? "ready" : primarySourcesLive ? "partial" : "degraded",
    lastBuildAt: input.lastBuildAt,
  };
}
