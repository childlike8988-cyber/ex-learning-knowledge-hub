import type { MarketRadarReportSnapshot, MarketRadarReportStatus } from "@/lib/market-radar/report/types";
import { formatDate, formatDateRange, formatNumber, formatPercent, formatTwdAmount } from "@/lib/market-radar/report/formatters";

type Snapshot = MarketRadarReportSnapshot;

export function MarketRadarStatusBadge({ status }: { status: MarketRadarReportStatus | "waiting" | "fixture" | "unavailable" }) {
  const label = status === "partial-live" ? "PARTIAL LIVE" : status === "live" ? "LIVE" : status === "fixture" ? "FIXTURE" : "WAITING";
  return <span className={`market-radar-export__badge market-radar-export__badge--${status}`}>{label}</span>;
}

export function MarketRadarReportHeader({ snapshot, compact = false }: { snapshot: Snapshot; compact?: boolean }) {
  return <header className={`market-radar-export__header${compact ? " market-radar-export__header--compact" : ""}`}><p>{snapshot.branding.product}</p><div><h1>{snapshot.branding.title}</h1><span>KAOHSIUNG HOUSING BRIEF</span></div><dl><div><dt>REPORT DATE</dt><dd>{formatDate(snapshot.reportDate)}</dd></div><div><dt>DATA STATUS</dt><dd><MarketRadarStatusBadge status={snapshot.status} /></dd></div></dl></header>;
}

export function MarketRadarKeyTake({ snapshot }: { snapshot: Snapshot }) {
  if (snapshot.keyTake.status === "unavailable") return <section className="market-radar-export__key-take market-radar-export__key-take--unavailable"><div className="market-radar-export__section-label"><span>TODAY&apos;S KEY TAKE</span><MarketRadarStatusBadge status="waiting" /></div><p>今日一句待可比較的歷史基準建立後再提供；本期不以單一期案件數推導市場趨勢。</p></section>;
  return <section className="market-radar-export__key-take"><div className="market-radar-export__section-label"><span>TODAY&apos;S KEY TAKE</span>{snapshot.keyTake.status === "fixture" && <MarketRadarStatusBadge status="fixture" />}</div><blockquote>“{snapshot.keyTake.text}”</blockquote></section>;
}

export function MarketRadarHighlights({ snapshot }: { snapshot: Snapshot }) {
  return <section className="market-radar-export__highlights"><div className="market-radar-export__section-label"><span>DISTRICT SIGNALS</span><strong>今日 3 大重點</strong></div><div>{snapshot.highlights.slice(0, 3).map((item, index) => <article key={item.id}><small>0{index + 1} · {item.label}</small><h2>{item.title}</h2><p>{item.summary}</p></article>)}</div></section>;
}

export function MarketRadarTemperature({ snapshot }: { snapshot: Snapshot }) {
  const labels = ["transaction-activity", "financing-environment", "price-momentum"] as const;
  return <section className="market-radar-export__temperature"><div className="market-radar-export__section-label"><span>MARKET TEMPERATURE</span><MarketRadarStatusBadge status={snapshot.marketTemperature.dataStatus === "partial" ? "partial-live" : snapshot.marketTemperature.dataStatus === "live" ? "live" : "waiting"} /></div><h2>{snapshot.marketTemperature.label}</h2><p>{snapshot.marketTemperature.description}</p><div className="market-radar-export__signal-list">{labels.map((id) => { const signal = snapshot.signals.find((value) => value.id === id); return <div key={id}><span>{signal?.label ?? "資料待更新"}</span><b>{signal?.direction === "unavailable" ? "資料待建立" : signal?.direction === "up" ? "↑" : signal?.direction === "down" ? "↓" : signal?.direction === "flat" ? "→" : "—"}</b><small>{signal?.status === "live" ? "LIVE" : signal?.status === "partial" ? "PARTIAL" : "WAITING"}</small></div>; })}</div></section>;
}

export function MarketRadarMoiSection({ snapshot, chart = false }: { snapshot: Snapshot; chart?: boolean }) {
  const count = snapshot.moi.facts[0];
  return <section className="market-radar-export__moi"><div className="market-radar-export__section-label"><span>MOI MARKET ACTIVITY</span><MarketRadarStatusBadge status={snapshot.moi.status} /></div><h2>高雄各行政區實價登錄案件數</h2><p className="market-radar-export__period">資料期間：{formatDateRange(snapshot.moi.dataPeriod?.start, snapshot.moi.dataPeriod?.end, snapshot.moi.dataPeriod?.label)}</p><div className="market-radar-export__metric"><span>本期有效登錄案件</span><strong>{formatNumber(count?.value)}</strong><small>{count?.unit ?? "件"}</small></div>{chart && <MarketRadarPrimaryChart snapshot={snapshot} />}<p className="market-radar-export__interpretation">案件數代表已完成申報並進入公開資料的交易紀錄，不等同即時市場詢問度或買氣。</p></section>;
}

export function MarketRadarPrimaryChart({ snapshot }: { snapshot: Snapshot }) {
  const max = Math.max(...snapshot.moi.districtTransactionCounts.map((item) => item.transactionCount), 1);
  return <figure className="market-radar-export__chart"><figcaption>高雄各行政區實價登錄案件數 <small>最多 8 區 · 非買氣排行</small></figcaption><div>{snapshot.moi.districtTransactionCounts.map((item) => <article key={item.district}><span>{item.district}</span><i><b style={{ height: `${Math.max(9, (item.transactionCount / max) * 100)}%` }} /></i><strong>{formatNumber(item.transactionCount)}</strong></article>)}</div></figure>;
}

export function MarketRadarCbcSection({ snapshot }: { snapshot: Snapshot }) {
  const rate = snapshot.cbc.facts.find((item) => item.id.includes("mortgage-rate"));
  const amount = snapshot.cbc.facts.find((item) => item.id.includes("mortgage-amount"));
  const financing = snapshot.signals.find((item) => item.id === "financing-environment");
  return <section className="market-radar-export__cbc"><div className="market-radar-export__section-label"><span>CBC FINANCE SIGNAL</span><MarketRadarStatusBadge status={snapshot.cbc.status} /></div><h2>房貸觀察</h2><p className="market-radar-export__period">資料期間：{formatDateRange(snapshot.cbc.dataPeriod?.start, snapshot.cbc.dataPeriod?.end, snapshot.cbc.dataPeriod?.label)}</p><div className="market-radar-export__two-metrics"><article><span>購屋貸款利率</span><strong>{formatPercent(rate?.value)}</strong><small>{financing?.analysis.interpretation ?? "資料待更新"}</small></article><article><span>新承做購屋貸款金額</span><strong>{formatTwdAmount(amount?.value, amount?.unit)}</strong><small>中央銀行月度官方統計</small></article></div></section>;
}

export function MarketRadarObservations({ snapshot }: { snapshot: Snapshot }) {
  return <section className="market-radar-export__observations"><div className="market-radar-export__section-label"><span>LIVE OBSERVATIONS</span></div>{snapshot.liveObservations.slice(0, 3).map((item) => <article key={item.id}><MarketRadarStatusBadge status={item.status}/><p>{item.text}</p></article>)}</section>;
}

export function MarketRadarSourceMeta({ snapshot, compact = false }: { snapshot: Snapshot; compact?: boolean }) {
  return <section className={`market-radar-export__sources${compact ? " market-radar-export__sources--compact" : ""}`}><div className="market-radar-export__section-label"><span>SOURCES</span></div>{snapshot.sources.filter((source) => !source.isMock).map((source) => <article key={source.id}><strong>{source.publisher}</strong><span>{source.name}</span><dl><div><dt>發布</dt><dd>{formatDate(source.publishedAt)}</dd></div><div><dt>資料期間</dt><dd>{formatDateRange(source.dataPeriodStart, source.dataPeriodEnd)}</dd></div>{!compact && <><div><dt>取得</dt><dd>{source.retrievedAt ?? "資料待更新"}</dd></div><div><dt>驗證</dt><dd>{source.verifiedAt ?? "資料待更新"}</dd></div></>}</dl></article>)}</section>;
}

export function MarketRadarDisclaimer({ snapshot }: { snapshot: Snapshot }) { return <aside className="market-radar-export__disclaimer"><p>{snapshot.disclaimer.analysis}</p><p>{snapshot.disclaimer.sourceTiming}</p></aside>; }

export function MarketRadarReportFooter({ snapshot }: { snapshot: Snapshot }) { return <footer className="market-radar-export__footer"><span>{snapshot.branding.publisher}</span><b>{snapshot.branding.product}</b><small>{snapshot.branding.footer}</small></footer>; }
