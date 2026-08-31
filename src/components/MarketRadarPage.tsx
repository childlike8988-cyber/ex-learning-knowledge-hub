"use client";

import { useState } from "react";
import type { MarketRadarAnalysisResult, MarketRadarChart, MarketRadarDetail, MarketRadarReport, MarketRadarSignalDirection } from "@/data/market-radar";
import { MarketRadarDownloadSection } from "@/components/MarketRadarDownloadSection";
import { MarketRadarDetailDrawer } from "@/components/MarketRadarDetailDrawer";
import { MarketRadarProSection } from "@/components/MarketRadarProSection";
import { MarketRadarQuickNavigation } from "@/components/MarketRadarQuickNavigation";
import type { MarketRadarCbcLiveData } from "@/lib/market-radar/sources/cbc-housing-finance";
import type { MarketRadarMoiLiveData } from "@/lib/market-radar/sources/moi-real-price";

function TrendMark({ trend }: { trend: "up" | "down" | "steady" | MarketRadarSignalDirection }) {
  return <span className={`market-radar-trend market-radar-trend--${trend}`} aria-hidden="true">{trend === "up" ? "↑" : trend === "down" ? "↓" : trend === "flat" || trend === "steady" ? "→" : trend === "mixed" ? "↔" : "·"}</span>;
}

function signalStatusLabel(status: "live" | "partial" | "fixture" | "unavailable") {
  return status === "live" ? "LIVE" : status === "partial" ? "PARTIAL" : status === "fixture" ? "MOCK" : "WAITING";
}

function signalValue(signal: MarketRadarAnalysisResult["signals"][number]) {
  if (signal.status !== "live") return "資料待補";
  if (signal.id === "financing-environment") return signal.direction === "down" ? "利率 ↓" : signal.direction === "up" ? "利率 ↑" : signal.direction === "flat" ? "利率 →" : "已更新";
  if (signal.direction === "unavailable") return "基準待補";
  return signal.direction === "up" ? "↑" : signal.direction === "down" ? "↓" : signal.direction === "flat" ? "→" : "↔";
}

function MarketTemperature({ analysis, onOpenDetail }: { analysis: MarketRadarAnalysisResult; onOpenDetail: (detail: MarketRadarDetail) => void }) {
  const temperature = analysis.marketTemperature;
  return <><section className="market-radar-temperature" id="market-temperature" aria-labelledby="temperature"><div><p className="market-radar-kicker">MARKET STATUS · {signalStatusLabel(temperature.dataStatus)}</p><h2 id="temperature">今日市場溫度 <span>{temperature.label}</span></h2><p>{temperature.description}</p><button type="button" className="market-radar-detail-trigger" onClick={() => onOpenDetail(temperature.detail)}>查看資料基礎 <span aria-hidden="true">→</span></button></div><div className="market-radar-indicators">{analysis.signals.map((item) => <article key={item.id} data-status={item.status}><p>{item.label} <TrendMark trend={item.direction} /></p><strong>{signalValue(item)}</strong><span>{item.analysis.summary}</span><small>{signalStatusLabel(item.status)}</small><i className={`market-radar-meter market-radar-meter--${item.direction}`} /></article>)}</div></section><aside className="market-radar-data-coverage" aria-label="Market Radar 資料涵蓋"><p>資料涵蓋 <small>DATA COVERAGE</small></p><span data-status={analysis.dataCoverage.moi}>內政部 <b>{analysis.dataCoverage.moi === "live" ? "● LIVE" : "○ 待更新"}</b></span><span data-status={analysis.dataCoverage.cbc}>中央銀行 <b>{analysis.dataCoverage.cbc === "live" ? "● LIVE" : "○ 待更新"}</b></span></aside></>;
}

function PublicChart({ chart, onOpenDetail }: { chart: MarketRadarChart; onOpenDetail: (detail: MarketRadarDetail) => void }) {
  const series = chart.series[0];
  const labels = chart.xAxis?.labels ?? [];
  const maximum = Math.max(...(series?.values ?? [1]), 1);
  return <article className={`market-radar-chart market-radar-chart--${chart.dataStatus}`}><div className="market-radar-chart__heading"><div><p>{chart.title}</p><span>{chart.subtitle}</span></div>{chart.dataStatus === "live" ? <b className="market-radar-live-badge"><i aria-hidden="true" />官方資料 · LIVE</b> : <b>PUBLIC</b>}</div><div className={`market-radar-chart__plot market-radar-chart__plot--${chart.id}`} aria-label={`${chart.title} 展示圖表`}>{series?.values.map((value, index) => <div className="market-radar-chart__bar" key={`${series.id}-${labels[index] ?? index}`}><i style={{ height: `${Math.max((value / maximum) * 100, 5)}%` }} /><small>{series.displayValues?.[index] ?? labels[index] ?? `#${index + 1}`}</small><span>{series.displayValues ? labels[index] : undefined}</span></div>)}</div><button type="button" className="market-radar-detail-trigger" onClick={() => onOpenDetail(chart.detail)}>查看分析 <span aria-hidden="true">→</span></button></article>;
}

function LiveDistrictTransactionChart({ liveData, onOpenDetail }: { liveData: MarketRadarMoiLiveData; onOpenDetail: (detail: MarketRadarDetail) => void }) {
  if (liveData.status !== "live" || !liveData.source) {
    return <article className="market-radar-chart market-radar-chart--updating"><div className="market-radar-chart__heading"><div><p>區域成交件數比較</p><span>內政部不動產實價登錄</span></div><b className="market-radar-live-badge market-radar-live-badge--updating">資料更新中</b></div><div className="market-radar-chart__empty"><strong>等待官方批次資料</strong><p>{liveData.warning ?? "Live 資料更新中。"}</p></div></article>;
  }

  const rows = liveData.metrics.districtTransactionCounts.slice(0, 4);
  const dataPeriod = { start: liveData.dataPeriodStart, end: liveData.dataPeriodEnd, label: `${liveData.dataPeriodStart} ～ ${liveData.dataPeriodEnd}` };
  const detail: MarketRadarDetail = {
    id: "moi-live-district-transaction-counts",
    category: "官方資料 · LIVE",
    title: "區域成交件數比較",
    summary: "高雄市本期實價登錄買賣案件的各行政區成交件數比較。",
    facts: [
      { id: "moi-transaction-count", label: "高雄市有效成交紀錄", value: liveData.metrics.transactionCount ?? 0, unit: "件", sourceIds: [liveData.source.id], dataPeriod, isEstimated: false, isMock: false },
      { id: "moi-district-count", label: "納入統計行政區", value: liveData.metrics.districtTransactionCounts.length, unit: "區", sourceIds: [liveData.source.id], dataPeriod, isEstimated: false, isMock: false },
    ],
    analysis: {
      summary: "本圖顯示目前資料期間內各行政區登錄案件數差異。",
      interpretation: "成交件數反映登錄樣本量，不等同即時市場買氣。",
      impact: "適合作為高雄各區已揭露登錄樣本的初步比較，不宜單獨解讀為即時成交熱度。",
      impactLevel: "medium",
      direction: "neutral",
      affectedAudience: ["buyer", "seller", "agent", "investor"],
      confidence: "high",
      notes: "本段為 Market Radar 根據公開資料整理之分析，不代表原始來源立場。",
    },
    sources: [liveData.source],
    freshness: liveData.freshness,
    isMock: false,
  };
  const chart: MarketRadarChart = {
    id: "district-comparison",
    dataStatus: "live",
    title: "區域成交件數比較",
    subtitle: `${dataPeriod.label} · 登錄件數前四區`,
    chartType: "comparison",
    xAxis: { label: "行政區", labels: rows.map((row) => row.district) },
    yAxis: { label: "成交件數" },
    series: [{ id: "moi-district-transaction-counts", label: "成交件數", values: rows.map((row) => row.transactionCount), displayValues: rows.map((row) => `${row.transactionCount} 件`) }],
    dataPeriod,
    sourceIds: [liveData.source.id],
    analysis: detail.analysis,
    detail,
    isMock: false,
  };
  return <PublicChart chart={chart} onOpenDetail={onOpenDetail} />;
}

function FinanceSignal({ data, onOpenDetail }: { data: MarketRadarCbcLiveData; onOpenDetail: (detail: MarketRadarDetail) => void }) {
  if (data.status !== "live" || !data.source || !data.latest) {
    return <section className="market-radar-finance-signal market-radar-finance-signal--updating" aria-labelledby="finance-signal"><div><p className="market-radar-kicker">FINANCE SIGNAL</p><h2 id="finance-signal">房貸觀察</h2><p>房貸資料更新中</p></div><span>中央銀行 Live 資料尚未通過驗證時，不以 Fixture 取代官方月資料。</span></section>;
  }
  const period = { start: data.dataPeriodStart, end: data.dataPeriodEnd, label: data.latest.period };
  const change = data.latest.mortgageRateChangePercentagePoints;
  const mortgageRate = data.latest.mortgageRate === undefined ? "—" : `${data.latest.mortgageRate.toFixed(3)}%`;
  const amount = data.latest.newMortgageAmount === undefined ? "—" : `${data.latest.newMortgageAmount.toLocaleString("zh-TW")} 百萬元`;
  const detail: MarketRadarDetail = {
    id: "cbc-live-housing-finance",
    category: "官方資料 · LIVE",
    title: "五大銀行購屋貸款觀察",
    summary: "中央銀行發布的五大銀行新承做購屋貸款月資料。",
    facts: [
      { id: "cbc-mortgage-rate", label: "新承做購屋貸款利率", value: data.latest.mortgageRate ?? "—", unit: "％", comparison: change === undefined ? undefined : `較前期 ${change > 0 ? "+" : ""}${change.toFixed(3)} 個百分點`, sourceIds: [data.source.id], dataPeriod: period, isEstimated: false, isMock: false },
      { id: "cbc-mortgage-amount", label: "新承做購屋貸款金額", value: data.latest.newMortgageAmount ?? "—", unit: " 百萬元", sourceIds: [data.source.id], dataPeriod: period, isEstimated: false, isMock: false },
    ],
    analysis: {
      summary: "房貸利率反映近期購屋融資成本環境。",
      interpretation: "單月利率變化不應單獨解讀為房價漲跌訊號。",
      impact: "可搭配交易量與區域資料觀察融資成本環境，避免以單一指標判斷整體房市方向。",
      impactLevel: "medium",
      direction: "neutral",
      affectedAudience: ["buyer", "seller", "agent", "investor"],
      confidence: "high",
      notes: "本段為固定模板式 Market Radar 解讀，不使用 LLM 生成。",
    },
    sources: [data.source],
    freshness: data.freshness,
    isMock: false,
  };
  return <section className="market-radar-finance-signal" aria-labelledby="finance-signal"><div className="market-radar-finance-signal__heading"><div><p className="market-radar-kicker">FINANCE SIGNAL</p><h2 id="finance-signal">房貸觀察</h2></div><b className="market-radar-live-badge"><i aria-hidden="true" />官方資料 · LIVE</b></div><button type="button" onClick={() => onOpenDetail(detail)} aria-label="查看中央銀行五大銀行購屋貸款資料詳情"><dl><div><dt>新承做購屋貸款利率</dt><dd>{mortgageRate}</dd><small>{change === undefined ? "本期官方月資料" : `較前期 ${change > 0 ? "+" : ""}${change.toFixed(3)} 個百分點`}</small></div><div><dt>新承做購屋貸款金額</dt><dd>{amount}</dd><small>官方單位：新台幣百萬元</small></div></dl><footer><span>{data.latest.period} · {data.source.publisher}</span><span>查看來源與解讀 →</span></footer></button></section>;
}

export function MarketRadarPage({ report, liveData, cbcData, analysis }: { report: MarketRadarReport; liveData: MarketRadarMoiLiveData; cbcData: MarketRadarCbcLiveData; analysis: MarketRadarAnalysisResult }) {
  const [activeDetail, setActiveDetail] = useState<MarketRadarDetail | null>(null);
  const dailyKeyTake = analysis.dailyKeyTake ? { ...report.dailyKeyTake, ...analysis.dailyKeyTake, sourceIds: analysis.signals.filter((signal) => analysis.dailyKeyTake?.basisSignalIds.includes(signal.id)).flatMap((signal) => signal.sourceIds), isMock: false } : report.dailyKeyTake;
  const dailyLines = dailyKeyTake.text.split("\n");
  const financeObservation = !analysis.dailyKeyTake ? analysis.signals.find((signal) => signal.id === "financing-environment" && signal.status === "live") : undefined;

  return <div className="market-radar-page"><div className="market-radar-page__texture" aria-hidden="true" />
    <section className="market-radar-hero" aria-labelledby="market-radar-title"><div className="market-radar-container market-radar-hero__grid"><div className="market-radar-hero__content"><div className="market-radar-hero__meta"><span>E.X MARKET RADAR</span><b>MOCK DATA · MVP</b></div><p className="market-radar-kicker">Kaohsiung Housing Brief</p><h1 id="market-radar-title">{report.title}</h1><p className="market-radar-hero__date"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.25" /><path d="M12 7.5v4.85l3.25 1.85" /></svg><span>{report.date}｜{report.updatedAtLabel}</span></p><p className="market-radar-hero__summary">{report.summary}</p><p className="market-radar-hero__notice">本頁為 UI 與 Mock Data 展示，不代表即時市場資訊或投資建議。</p><svg className="market-radar-hero__skyline" viewBox="0 0 500 270" aria-hidden="true"><path d="M0 247h38v-42h26v42h30v-76h25v76h23V40h8v207h36v-58h34v58h30v-97h38v97h29v-55h34v55h34v-81h32v81h31v-45h41v45h55" /><path d="M0 254h500" /></svg></div><div className="market-radar-hero__download"><MarketRadarDownloadSection report={report} /></div></div></section>
    <div className="market-radar-container market-radar-content">
      <MarketRadarQuickNavigation />
      <section className="market-radar-daily-word" id="market-key-take" aria-labelledby="daily-word"><span className="market-radar-daily-word__bookmark" aria-hidden="true">✦</span><div className="market-radar-daily-word__copy"><p className="market-radar-kicker">TODAY&apos;S KEY TAKE · {dailyKeyTake.dataStatus === "live" ? "LIVE BASIS" : "FIXTURE"}</p><h2 id="daily-word">今日一句</h2><span className="market-radar-daily-word__quote-mark" aria-hidden="true">“</span><blockquote data-lines={dailyKeyTake.lineCount}>{dailyLines.map((line, index) => <span key={`${line}-${index}`}>{line}{index < dailyLines.length - 1 && <br />}</span>)}</blockquote>{financeObservation && <p className="market-radar-live-observation"><b>CBC LIVE OBSERVATION</b><span>{financeObservation.analysis.interpretation}</span></p>}</div><svg className="market-radar-daily-word__cityline" viewBox="0 0 620 112" aria-hidden="true"><path d="M0 98h56V75h34V50h24v48h34V27h36v71h28V62h44v36h36V42h46v56h48V20h20v78h38V58h42v40h50V71h42v27h54" fill="none" /><path d="M0 104h620" fill="none" /></svg></section>
      <section className="market-radar-section" id="market-district-signals" aria-labelledby="district-highlights"><div className="market-radar-section__heading"><div><p className="market-radar-kicker">DISTRICT SIGNALS</p><h2 id="district-highlights">今日 3 大重點</h2></div><span>Free Brief</span></div><div className="market-radar-districts">{report.districtHighlights.map((item) => <article key={item.id}><p>{item.district}</p><h3>{item.headline}</h3><span>{item.summary}</span><button type="button" className="market-radar-detail-trigger" onClick={() => setActiveDetail(item.detail)}>查看區域分析 <span aria-hidden="true">→</span></button></article>)}</div></section>
      <MarketTemperature analysis={analysis} onOpenDetail={setActiveDetail} />
      <FinanceSignal data={cbcData} onOpenDetail={setActiveDetail} />
      <section className="market-radar-section" id="market-public-charts" aria-labelledby="public-charts"><div className="market-radar-section__heading"><div><p className="market-radar-kicker">OPEN DATA VIEW</p><h2 id="public-charts">公開圖表</h2></div><span>Fixture + official data</span></div><div className="market-radar-charts">{report.publicCharts.filter((chart) => chart.id !== "district-comparison").map((chart) => <PublicChart chart={chart} key={chart.id} onOpenDetail={setActiveDetail} />)}<LiveDistrictTransactionChart liveData={liveData} onOpenDetail={setActiveDetail} /></div></section>
      <section className="market-radar-section" id="market-updates" aria-labelledby="market-news"><div className="market-radar-section__heading"><div><p className="market-radar-kicker">DAILY SIGNALS</p><h2 id="market-news">今日快訊</h2></div><span>Mock source</span></div><div className="market-radar-news">{report.newsItems.map((item) => <article key={item.id}><button type="button" aria-label={`查看${item.title}詳細資訊`} onClick={() => setActiveDetail(item.detail)}><span>{item.category}</span><span><strong>{item.title}</strong><small>{item.summary}</small><em>{item.detail.sources[0]?.name ?? "Source pending"} · {item.updatedAt ?? item.publishedAt ?? "—"}</em></span><b><span>查看分析</span><span aria-hidden="true">→</span></b></button></article>)}</div></section>
      <section className="market-radar-takeaways" id="market-key-sentences" aria-labelledby="key-takeaways"><div><p className="market-radar-kicker">WHAT MATTERS TODAY</p><h2 id="key-takeaways">今天最值得知道的 3 句話</h2><span>給房產從業者與關注市場的人</span></div><ol>{report.keyTakeaways.map((takeaway, index) => <li key={takeaway}><b>0{index + 1}</b><p>{takeaway}</p></li>)}</ol></section>
      <MarketRadarProSection report={report} />
      <aside className="market-radar-disclaimer"><strong>資料使用提醒</strong><p>標示「官方資料 · LIVE」的區塊來自已驗證官方來源；其餘市場數字、快訊、圖表與報告內容仍可能為 Mock Data。頁面不代表即時市場資訊或投資建議。</p></aside>
    </div>
    <MarketRadarDetailDrawer detail={activeDetail} onClose={() => setActiveDetail(null)} />
  </div>;
}
