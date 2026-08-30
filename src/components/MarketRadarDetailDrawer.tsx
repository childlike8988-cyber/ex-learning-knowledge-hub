"use client";

import { useEffect, useRef } from "react";
import type { MarketRadarAudience, MarketRadarDetail, MarketRadarImpactLevel, MarketRadarSource, MarketRadarSourcePriority } from "@/data/market-radar";

type MarketRadarDetailDrawerProps = { detail: MarketRadarDetail | null; onClose: () => void };

const audienceLabels: Record<MarketRadarAudience, string> = { buyer: "買方", seller: "賣方", agent: "房仲", investor: "投資人", homeowner: "屋主" };
const impactLabels: Record<MarketRadarImpactLevel, string> = { low: "低", medium: "中", high: "高" };
const priorityLabels: Record<MarketRadarSourcePriority, { zh: string; en: string }> = {
  official: { zh: "官方資料", en: "Official" },
  institutional: { zh: "機構資料", en: "Institutional" },
  research: { zh: "研究資料", en: "Research" },
  editorial: { zh: "市場參考", en: "Editorial" },
};

function formatTime(value?: string) {
  if (!value) return null;
  const [date, time] = value.split("T");
  return `${date.replaceAll("-", ".")}${time ? ` ${time.slice(0, 5)}` : ""}`;
}

function formatDataPeriod(source: MarketRadarSource) {
  if (source.dataPeriodStart && source.dataPeriodEnd) return `${formatTime(source.dataPeriodStart)} ～ ${formatTime(source.dataPeriodEnd)}`;
  return formatTime(source.dataPeriodStart) ?? formatTime(source.dataPeriodEnd) ?? null;
}

function SourceMetadata({ source }: { source: MarketRadarSource }) {
  const priority = priorityLabels[source.priority];
  const period = formatDataPeriod(source);
  const canOpenSource = Boolean(source.url) && !source.isMock;
  return <article className="market-radar-detail-drawer__source-card">
    <div className="market-radar-detail-drawer__source-heading"><div><span className={`market-radar-detail-drawer__source-badge market-radar-detail-drawer__source-badge--${source.priority}`}>{priority.zh}<small>{priority.en}</small></span><strong>{source.name}</strong><p>{source.publisher} · {source.type}</p></div>{source.isPrimarySource && <em>PRIMARY</em>}</div>
    <dl>
      {source.publishedAt && <div><dt>發布日期</dt><dd>{formatTime(source.publishedAt)}</dd></div>}
      {period && <div><dt>資料期間</dt><dd>{period}</dd></div>}
      {source.verifiedAt && <div><dt>最後驗證</dt><dd>{formatTime(source.verifiedAt)}</dd></div>}
      {source.retrievedAt && <div><dt>取得時間</dt><dd>{formatTime(source.retrievedAt)}</dd></div>}
    </dl>
    {source.notes && <p className="market-radar-detail-drawer__source-note">{source.notes}</p>}
    {canOpenSource ? <a href={source.url} target="_blank" rel="noopener noreferrer">查看原始來源 <span aria-hidden="true">↗</span></a> : <button type="button" disabled>{source.isMock ? "Mock Source · 目前為資料架構展示" : "原始來源暫無連結"}</button>}
  </article>;
}

export function MarketRadarDetailDrawer({ detail, onClose }: MarketRadarDetailDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!detail) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [detail, onClose]);

  if (!detail) return null;

  return <div className="market-radar-detail-drawer__backdrop" onMouseDown={onClose}>
    <aside className="market-radar-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="market-radar-detail-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="market-radar-detail-drawer__header"><div><p className="market-radar-kicker">{detail.category}</p><h2 id="market-radar-detail-title">{detail.title}</h2></div><button ref={closeButtonRef} type="button" aria-label="關閉詳細資訊" onClick={onClose}>×</button></div>
      {detail.isMock && <p className="market-radar-detail-drawer__mock">MOCK DATA · 目前為介面與資料結構展示</p>}
      <p className="market-radar-detail-drawer__summary">{detail.summary}</p>
      <section className="market-radar-detail-drawer__facts"><h3>原始資訊</h3>{detail.facts.length > 0 ? <dl>{detail.facts.map((fact) => <div key={fact.id}><dt>{fact.label}</dt><dd><strong>{fact.value}{fact.unit ?? ""}</strong>{fact.comparison && <span>{fact.comparison}</span>}{fact.isEstimated && <em>估計值</em>}{fact.isMock && <small>Fixture</small>}</dd></div>)}</dl> : <p>目前沒有可驗證的原始資訊。</p>}</section>
      <section><h3>Market Radar 解讀</h3><p>{detail.analysis.summary}</p><p>{detail.analysis.interpretation}</p><p className="market-radar-detail-drawer__analysis-note">本段為 Market Radar 根據公開資料整理之分析，不代表原始來源立場。</p></section>
      <section className="market-radar-detail-drawer__impact"><div><h3>影響對象</h3><p>{detail.analysis.affectedAudience.map((audience) => <span key={audience}>{audienceLabels[audience]}</span>)}</p></div><div><h3>影響程度</h3><strong>{impactLabels[detail.analysis.impactLevel]}</strong><small>分析信心：{detail.analysis.confidence === "high" ? "高" : detail.analysis.confidence === "medium" ? "中" : "低"}</small></div></section>
      <section className="market-radar-detail-drawer__sources"><h3>原始來源</h3><p>發布日期、資料期間、驗證時間皆依原始資料分別保存。</p><div>{detail.sources.map((source) => <SourceMetadata key={source.id} source={source} />)}</div></section>
    </aside>
  </div>;
}
