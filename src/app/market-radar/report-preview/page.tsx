import type { Metadata } from "next";
import { MarketRadarReportPreview } from "@/components/market-radar/report/MarketRadarReportPreview";
import { buildMarketRadarReportSnapshot } from "@/lib/market-radar/report/buildMarketRadarReportSnapshot";
import { loadMarketRadarAnalysis } from "@/lib/market-radar/loadMarketRadarAnalysis";
import { loadMarketRadarCbcData } from "@/lib/market-radar/loadMarketRadarCbcData";
import { loadMarketRadarLiveData } from "@/lib/market-radar/loadMarketRadarLiveData";
import { loadMarketRadarReport } from "@/lib/market-radar/loadMarketRadarReport";

export const metadata: Metadata = { title: "Market Radar Report Preview", robots: { index: false, follow: false } };

export default function MarketRadarReportPreviewRoute() { const moi = loadMarketRadarLiveData(); const cbc = loadMarketRadarCbcData(); const analysis = loadMarketRadarAnalysis(moi, cbc); const snapshot = buildMarketRadarReportSnapshot({ report: loadMarketRadarReport(), moi, cbc, analysis }); return <MarketRadarReportPreview snapshot={snapshot}/>; }
