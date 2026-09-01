"use client";

import { useState } from "react";
import type { MarketRadarReportSnapshot } from "@/lib/market-radar/report/types";
import { MarketRadarPdfReport } from "./MarketRadarPdfReport";
import { MarketRadarPngReport } from "./MarketRadarPngReport";

export function MarketRadarReportPreview({ snapshot }: { snapshot: MarketRadarReportSnapshot }) { const [mode, setMode] = useState<"png" | "pdf">("png"); const [actualSize, setActualSize] = useState(false); return <section className={`market-radar-report-preview${actualSize ? " market-radar-report-preview--actual" : ""}`}><div className="market-radar-report-preview__toolbar"><div><p>INTERNAL REPORT PREVIEW</p><h1>Market Radar Export Renderer</h1></div><div role="group" aria-label="Preview format"><button type="button" data-active={mode === "png"} onClick={() => setMode("png")}>PNG 9:16</button><button type="button" data-active={mode === "pdf"} onClick={() => setMode("pdf")}>PDF A4</button><button type="button" onClick={() => setActualSize((value) => !value)}>{actualSize ? "Fit Width" : "Actual Size"}</button></div></div><div className="market-radar-report-preview__stage">{mode === "png" ? <MarketRadarPngReport snapshot={snapshot}/> : <MarketRadarPdfReport snapshot={snapshot}/>}</div></section>; }
