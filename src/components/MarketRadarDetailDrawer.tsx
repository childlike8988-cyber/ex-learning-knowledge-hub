"use client";

import { useEffect, useRef } from "react";
import type { MarketRadarDetail } from "@/data/market-radar";

type MarketRadarDetailDrawerProps = {
  detail: MarketRadarDetail | null;
  onClose: () => void;
};

export function MarketRadarDetailDrawer({ detail, onClose }: MarketRadarDetailDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!detail) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [detail, onClose]);

  if (!detail) return null;

  return <div className="market-radar-detail-drawer__backdrop" onMouseDown={onClose}>
    <aside className="market-radar-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="market-radar-detail-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="market-radar-detail-drawer__header"><div><p className="market-radar-kicker">{detail.category}</p><h2 id="market-radar-detail-title">{detail.title}</h2></div><button ref={closeButtonRef} type="button" aria-label="關閉詳細資訊" onClick={onClose}>×</button></div>
      {detail.isMock && <p className="market-radar-detail-drawer__mock">MOCK DATA · 目前為介面與資料結構展示</p>}
      <p className="market-radar-detail-drawer__summary">{detail.summary}</p>
      <section><h3>資訊摘要</h3><p>{detail.analysis.summary}</p></section>
      <section><h3>Market Radar 解讀</h3><p>{detail.analysis.impact}</p></section>
      <section className="market-radar-detail-drawer__impact"><div><h3>影響對象</h3><p>{detail.analysis.affectedAudience.join("、")}</p></div><div><h3>影響程度</h3><strong>{detail.analysis.impactLevel}</strong></div></section>
      <section className="market-radar-detail-drawer__source"><h3>資料資訊</h3><dl><div><dt>來源</dt><dd>{detail.source.name}</dd></div><div><dt>發布日期</dt><dd>{detail.source.publishedAt ?? "—"}</dd></div><div><dt>資料期間</dt><dd>{detail.source.dataPeriod ?? "—"}</dd></div><div><dt>最後驗證時間</dt><dd>{detail.source.verifiedAt ?? "—"}</dd></div></dl><button type="button" disabled>{detail.isMock ? "目前為 Mock Data" : "查看原始資料"}</button></section>
    </aside>
  </div>;
}
