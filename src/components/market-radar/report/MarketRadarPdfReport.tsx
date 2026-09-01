import type { MarketRadarReportSnapshot } from "@/lib/market-radar/report/types";
import type { ReactNode } from "react";
import { buildMarketRadarDownloadContent } from "@/lib/market-radar/report/buildMarketRadarDownloadContent";
import { MarketRadarDownloadDataContext, MarketRadarDownloadEditorial, MarketRadarDownloadGuidance, MarketRadarDownloadKeySentences, MarketRadarDownloadOverview } from "./MarketRadarDownloadContent";
import { MarketRadarDisclaimer, MarketRadarKeyTake, MarketRadarObservations, MarketRadarReportFooter, MarketRadarReportHeader, MarketRadarSourceMeta } from "./MarketRadarReportPrimitives";

function Page({ children, label }: { children: ReactNode; label: string }) { return <section className="market-radar-export__page" data-page={label}>{children}</section>; }

/** A4 deep report: sections are content-driven rather than a fixed web-page printout. */
export function MarketRadarPdfReport({ snapshot }: { snapshot: MarketRadarReportSnapshot }) {
  const content = buildMarketRadarDownloadContent(snapshot);
  const hasDataContext = content.shareCards.some((card) => card.id === "share-02");
  const hasGuidance = content.shareCards.some((card) => card.id === "share-03");
  return <article className="market-radar-export market-radar-export--pdf" aria-label="Market Radar PDF report preview">
    <Page label="executive-summary"><MarketRadarReportHeader snapshot={snapshot}/><MarketRadarKeyTake snapshot={snapshot}/><MarketRadarDownloadOverview snapshot={snapshot} content={content}/><MarketRadarReportFooter snapshot={snapshot}/></Page>
    {hasDataContext && <Page label="official-data-context"><MarketRadarDownloadDataContext snapshot={snapshot} content={content}/><MarketRadarObservations snapshot={snapshot}/><MarketRadarDownloadEditorial snapshot={snapshot}/></Page>}
    {hasGuidance && <Page label="client-guidance-sources"><MarketRadarDownloadGuidance snapshot={snapshot} content={content}/><MarketRadarDownloadKeySentences snapshot={snapshot}/><section className="market-radar-download__methodology"><span>METHODOLOGY & STATUS</span><p>{content.methodologyNote}</p><p>Historical Baseline 與 Price Momentum 目前為 WAITING；本報告不以單期案件數製作趨勢或價格結論。</p></section><MarketRadarSourceMeta snapshot={snapshot}/><MarketRadarDisclaimer snapshot={snapshot}/><MarketRadarReportFooter snapshot={snapshot}/></Page>}
  </article>;
}
