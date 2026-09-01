"use client";

import { useEffect, useState } from "react";
import { buildMarketRadarDownloadContent, type MarketRadarDownloadContent, type MarketRadarShareCardId } from "@/lib/market-radar/report/buildMarketRadarDownloadContent";
import type { MarketRadarReportSnapshot } from "@/lib/market-radar/report/types";
import { MarketRadarPngShareCard } from "./MarketRadarDownloadContent";
import { MarketRadarPdfReport } from "./MarketRadarPdfReport";

type PreviewMode = MarketRadarShareCardId | "pdf";

export function MarketRadarReportPreview({ snapshot, content = buildMarketRadarDownloadContent(snapshot) }: { snapshot: MarketRadarReportSnapshot; content?: MarketRadarDownloadContent }) {
  const [mode, setMode] = useState<PreviewMode>(content.shareCards[0]?.id ?? "pdf");
  const [actualSize, setActualSize] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("mode");
    const normalized = requested === "png" ? "share-01" : requested;
    if (normalized === "pdf" || content.shareCards.some((card) => card.id === normalized)) {
      setMode(normalized as PreviewMode);
      setExportMode(true);
    }
  }, [content.shareCards]);
  return <section className={`market-radar-report-preview${actualSize ? " market-radar-report-preview--actual" : ""}${exportMode ? " market-radar-report-preview--export-mode" : ""}`} data-export-ready={exportMode ? "true" : "false"} data-share-card-count={content.shareCards.length}>
    <div className="market-radar-report-preview__toolbar"><div><p>INTERNAL REPORT PREVIEW</p><h1>Market Radar Export Renderer</h1></div><div role="group" aria-label="Preview format">{content.shareCards.map((card, index) => <button key={card.id} type="button" data-active={mode === card.id} onClick={() => setMode(card.id)}>Share {index + 1}</button>)}<button type="button" data-active={mode === "pdf"} onClick={() => setMode("pdf")}>PDF A4</button><button type="button" onClick={() => setActualSize((value) => !value)}>{actualSize ? "Fit Width" : "Actual Size"}</button></div></div>
    <div className="market-radar-report-preview__stage">{mode === "pdf" ? <MarketRadarPdfReport snapshot={snapshot}/> : <MarketRadarPngShareCard snapshot={snapshot} content={content} cardId={mode}/>}</div>
  </section>;
}
