import type { Metadata } from "next";
import { MarketRadarAuthStatePreview } from "@/components/MarketRadarAuthStatePreview";
import { loadMarketRadarReport } from "@/lib/market-radar/loadMarketRadarReport";

export const metadata: Metadata = {
  title: "Market Radar Auth Preview",
  description: "Internal local preview for Market Radar account and download state contracts.",
  robots: { index: false, follow: false },
};

export default function MarketRadarAccountPreviewRoute() {
  return <main className="market-radar-auth-preview-page"><MarketRadarAuthStatePreview report={loadMarketRadarReport()} /></main>;
}
