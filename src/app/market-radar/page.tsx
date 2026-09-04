import type { Metadata } from "next";
import { MarketRadarPage } from "@/components/MarketRadarPage";
import { loadMarketRadarCbcData } from "@/lib/market-radar/loadMarketRadarCbcData";
import { loadMarketRadarAnalysis } from "@/lib/market-radar/loadMarketRadarAnalysis";
import { loadMarketRadarLiveData } from "@/lib/market-radar/loadMarketRadarLiveData";
import { buildMarketRadarProductionReportSnapshot } from "@/lib/market-radar/report/buildMarketRadarProductionReportSnapshot";
import { buildMarketRadarProductionWebReport } from "@/lib/market-radar/report/buildMarketRadarProductionWebReport";

export const metadata: Metadata = {
  title: "E.X MARKET RADAR｜高雄房市快報",
  description: "給房產從業者與關注高雄房市的人，快速掌握市場變化。",
};

export default function MarketRadarRoute() {
  const liveData = loadMarketRadarLiveData();
  const cbcData = loadMarketRadarCbcData();
  const analysis = loadMarketRadarAnalysis(liveData, cbcData);
  const snapshot = buildMarketRadarProductionReportSnapshot({ moi: liveData, cbc: cbcData, analysis });
  return <MarketRadarPage report={buildMarketRadarProductionWebReport(snapshot)} liveData={liveData} cbcData={cbcData} analysis={analysis} />;
}
