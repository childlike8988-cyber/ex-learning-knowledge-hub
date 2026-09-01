import type { Metadata } from "next";
import { MarketRadarReportPreview } from "@/components/market-radar/report/MarketRadarReportPreview";
import { buildMarketRadarDownloadContent } from "@/lib/market-radar/report/buildMarketRadarDownloadContent";
import { buildMarketRadarReportSnapshot } from "@/lib/market-radar/report/buildMarketRadarReportSnapshot";
import { loadMarketRadarAnalysis } from "@/lib/market-radar/loadMarketRadarAnalysis";
import { loadMarketRadarCbcData } from "@/lib/market-radar/loadMarketRadarCbcData";
import { loadMarketRadarLiveData } from "@/lib/market-radar/loadMarketRadarLiveData";
import { loadMarketRadarReport } from "@/lib/market-radar/loadMarketRadarReport";

export const metadata: Metadata = { title: "Market Radar Report Preview", robots: { index: false, follow: false } };

export default function MarketRadarReportPreviewRoute() { const moi = loadMarketRadarLiveData(); const cbc = loadMarketRadarCbcData(); const analysis = loadMarketRadarAnalysis(moi, cbc); const snapshot = buildMarketRadarReportSnapshot({ report: loadMarketRadarReport(), moi, cbc, analysis }); const content = buildMarketRadarDownloadContent(snapshot); const serializedSnapshot = JSON.stringify(snapshot).replace(/</g, "\\u003c"); const serializedPayload = JSON.stringify({ snapshot, content }).replace(/</g, "\\u003c"); return <><MarketRadarReportPreview snapshot={snapshot} content={content}/><script id="market-radar-report-snapshot" type="application/json" dangerouslySetInnerHTML={{ __html: serializedSnapshot }} /><script id="market-radar-report-export-payload" type="application/json" dangerouslySetInnerHTML={{ __html: serializedPayload }} /></>; }
