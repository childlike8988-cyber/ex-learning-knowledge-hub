import type { Metadata } from "next";
import { MarketRadarPage } from "@/components/MarketRadarPage";
import { loadMarketRadarReport } from "@/lib/market-radar/loadMarketRadarReport";

export const metadata: Metadata = {
  title: "E.X MARKET RADAR｜高雄房市快報",
  description: "給房產從業者與關注高雄房市的人，快速掌握市場變化。",
};

export default function MarketRadarRoute() {
  return <MarketRadarPage report={loadMarketRadarReport()} />;
}
