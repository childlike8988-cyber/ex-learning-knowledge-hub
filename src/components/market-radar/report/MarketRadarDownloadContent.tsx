import { buildMarketRadarDownloadContent, type MarketRadarDownloadContent, type MarketRadarShareCardId } from "@/lib/market-radar/report/buildMarketRadarDownloadContent";
import type { MarketRadarReportSnapshot } from "@/lib/market-radar/report/types";
import { MarketRadarCbcSection, MarketRadarDisclaimer, MarketRadarKeyTake, MarketRadarMoiSection, MarketRadarObservations, MarketRadarReportFooter, MarketRadarSourceMeta, MarketRadarStatusBadge, MarketRadarTemperature } from "./MarketRadarReportPrimitives";

type Props = { snapshot: MarketRadarReportSnapshot; content?: MarketRadarDownloadContent };

function statusLabel(status: "live" | "waiting" | "fixture" | "unavailable") { return status === "live" ? "LIVE" : status === "fixture" ? "FIXTURE" : "WAITING"; }

export function MarketRadarDownloadOverview({ snapshot, content }: Props) {
  const model = content ?? buildMarketRadarDownloadContent(snapshot);
  return <><section className="market-radar-download__intro"><div><span>MARKET STATE</span><MarketRadarStatusBadge status={snapshot.status}/></div><h2>{snapshot.market.label}房市資料概覽</h2><p>{model.marketState}</p></section><MarketRadarTemperature snapshot={snapshot}/><section className="market-radar-download__facts"><div className="market-radar-export__section-label"><span>TOP OBSERVATIONS</span><small>官方資料優先</small></div>{model.dataContext.slice(0, 3).map((item) => <article key={item.label}><b>{item.label}</b><span data-status={item.status}>{statusLabel(item.status)}</span><p>{item.text}</p></article>)}</section><section className="market-radar-download__boundary"><span>READING BOUNDARY</span><p>目前可確認本期案件與融資環境；歷史交易基準及價格動能仍待建立，因此不以單一期案件數判斷市場升溫或降溫。</p></section></>;
}

export function MarketRadarDownloadDataContext({ snapshot, content }: Props) {
  void content;
  return <><MarketRadarMoiSection snapshot={snapshot} chart/><MarketRadarCbcSection snapshot={snapshot}/></>;
}

export function MarketRadarDownloadGuidance({ snapshot, content }: Props) {
  const model = content ?? buildMarketRadarDownloadContent(snapshot);
  return <><section className="market-radar-download__intro market-radar-download__intro--compact"><div><span>CLIENT CONVERSATION</span><MarketRadarStatusBadge status={snapshot.status}/></div><h2>買方、賣方與下一期觀察</h2><p>以下為公開資料脈絡整理，不構成個別投資、交易或法律建議。</p></section><section className="market-radar-download__guidance"><article><span>BUYER PERSPECTIVE</span><h3>買方可先確認</h3><ul>{model.buyerPoints.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>SELLER PERSPECTIVE</span><h3>賣方可先準備</h3><ul>{model.sellerPoints.map((item) => <li key={item}>{item}</li>)}</ul></article></section><section className="market-radar-download__watch"><span>WHAT TO WATCH NEXT</span><ol>{model.watchNext.map((item) => <li key={item}>{item}</li>)}</ol></section><section className="market-radar-download__boundary"><span>CONVERSATION BOUNDARY</span><p>{model.methodologyNote}</p></section></>;
}

/** Download-only editorial context remains visibly separate from official facts. */
export function MarketRadarDownloadEditorial({ snapshot }: { snapshot: MarketRadarReportSnapshot }) {
  const items = snapshot.news.slice(0, 3);
  if (!items.length) return null;
  return <section className="market-radar-export__editorial"><div className="market-radar-export__section-label"><span>EDITORIAL CONTEXT</span><MarketRadarStatusBadge status="fixture"/></div>{items.map((item) => <article key={item.id}><b>FIXTURE</b><strong>{item.category}｜{item.title}</strong><p>{item.summary}</p></article>)}</section>;
}

export function MarketRadarDownloadKeySentences({ snapshot }: { snapshot: MarketRadarReportSnapshot }) {
  const sentences = snapshot.keySentences.slice(0, 3);
  if (!sentences.length) return null;
  return <section className="market-radar-export__sentences"><div className="market-radar-export__section-label"><span>3 KEY SENTENCES</span><MarketRadarStatusBadge status="fixture"/></div>{sentences.map((item, index) => <p key={`${index}-${item.text}`}><b>0{index + 1}</b><span>{item.text}</span><small>FIXTURE</small></p>)}</section>;
}

export function MarketRadarPngShareCard({ snapshot, cardId, content }: Props & { cardId: MarketRadarShareCardId }) {
  const model = content ?? buildMarketRadarDownloadContent(snapshot);
  const card = model.shareCards.find((item) => item.id === cardId);
  if (!card) return null;
  const body = cardId === "share-01" ? <MarketRadarDownloadOverview snapshot={snapshot} content={model}/> : cardId === "share-02" ? <MarketRadarDownloadDataContext snapshot={snapshot} content={model}/> : <MarketRadarDownloadGuidance snapshot={snapshot} content={model}/>;
  return <article className="market-radar-export market-radar-export--png market-radar-export--share" data-share-card-id={card.id} data-card-role={card.role} aria-label={`Market Radar ${card.title} 分享卡`}><div className="market-radar-export__safe-area"><section className="market-radar-download__card-title"><div className="market-radar-download__masthead"><span>{snapshot.branding.product}</span><span>{snapshot.reportDate.replaceAll("-", ".")} <MarketRadarStatusBadge status={snapshot.status}/></span></div><span>SHARE CARD · {card.id.slice(-2)}</span><h1>{card.title}</h1><p>{card.summary}</p></section>{body}{cardId === "share-01" && <><MarketRadarKeyTake snapshot={snapshot}/><MarketRadarObservations snapshot={snapshot}/></>}<section className="market-radar-download__compact-status"><MarketRadarStatusBadge status={snapshot.status}/><span>MOI {snapshot.dataCoverage.moiLatest.toUpperCase()} · CBC {snapshot.dataCoverage.cbc.toUpperCase()} · HISTORICAL {snapshot.dataCoverage.moiHistorical.toUpperCase()}</span></section><MarketRadarSourceMeta snapshot={snapshot} compact/><MarketRadarDisclaimer snapshot={snapshot}/><MarketRadarReportFooter snapshot={snapshot}/></div></article>;
}
