import type { MarketRadarReportSnapshot } from "@/lib/market-radar/report/types";
import { MarketRadarPngShareCard } from "./MarketRadarDownloadContent";

/** Backward-compatible first share card; individual cards use MarketRadarPngShareCard. */
export function MarketRadarPngReport({ snapshot }: { snapshot: MarketRadarReportSnapshot }) {
  return <MarketRadarPngShareCard snapshot={snapshot} cardId="share-01" />;
}
