import type { MarketRadarChart, MarketRadarReport } from "@/data/market-radar";
import { MarketRadarProSection } from "@/components/MarketRadarProSection";

function TrendMark({ trend }: { trend: "up" | "down" | "steady" }) {
  return <span className={`market-radar-trend market-radar-trend--${trend}`} aria-hidden="true">{trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}</span>;
}

function PublicChart({ chart }: { chart: MarketRadarChart }) {
  return <article className="market-radar-chart"><div className="market-radar-chart__heading"><div><p>{chart.title}</p><span>{chart.subtitle}</span></div><b>PUBLIC</b></div><div className={`market-radar-chart__plot market-radar-chart__plot--${chart.id}`} aria-label={`${chart.title} 展示圖表`}>{chart.values.map((value, index) => <div className="market-radar-chart__bar" key={chart.labels[index]}><i style={{ height: `${value}%` }} /><small>{chart.labels[index]}</small></div>)}</div></article>;
}

export function MarketRadarPage({ report }: { report: MarketRadarReport }) {
  return <div className="market-radar-page"><div className="market-radar-page__texture" aria-hidden="true" />
    <section className="market-radar-hero" aria-labelledby="market-radar-title"><div className="market-radar-container"><div className="market-radar-hero__meta"><span>E.X MARKET RADAR</span><b>MOCK DATA · MVP</b></div><p className="market-radar-kicker">Kaohsiung Housing Brief</p><h1 id="market-radar-title">高雄房市快報</h1><p className="market-radar-hero__date">{report.date}｜{report.updatedAt}</p><p className="market-radar-hero__summary">{report.summary}</p><p className="market-radar-hero__notice">本頁為 UI 與 Mock Data 展示，不代表即時市場資訊或投資建議。</p></div></section>
    <div className="market-radar-container market-radar-content">
      <section className="market-radar-daily-word" aria-labelledby="daily-word"><p className="market-radar-kicker">FREE BRIEF · TODAY</p><h2 id="daily-word">今日一句</h2><blockquote>高雄房市持續量縮，<br />但不同區域的買氣開始明顯分化。</blockquote></section>
      <section className="market-radar-temperature" aria-labelledby="temperature"><div><p className="market-radar-kicker">MARKET TEMPERATURE</p><h2 id="temperature">今日市場溫度 <span>{report.marketTemperature.label}</span></h2><p>{report.marketTemperature.description}</p></div><div className="market-radar-indicators">{report.marketTemperature.indicators.map((indicator) => <article key={indicator.id}><p>{indicator.label} <TrendMark trend={indicator.trend} /></p><strong>{indicator.value}</strong><span>{indicator.detail}</span><i className={`market-radar-meter market-radar-meter--${indicator.trend}`} /></article>)}</div></section>
      <section className="market-radar-section" aria-labelledby="district-highlights"><div className="market-radar-section__heading"><div><p className="market-radar-kicker">DISTRICT SIGNALS</p><h2 id="district-highlights">今日 3 大重點</h2></div><span>Free Brief</span></div><div className="market-radar-districts">{report.districtHighlights.map((item) => <article key={item.district}><p>{item.district}</p><h3>{item.headline}</h3><span>{item.note}</span></article>)}</div></section>
      <section className="market-radar-takeaways" aria-labelledby="key-takeaways"><div><p className="market-radar-kicker">WHAT MATTERS TODAY</p><h2 id="key-takeaways">今天最值得知道的 3 句話</h2><span>給房產從業者與關注市場的人</span></div><ol>{report.keyTakeaways.map((takeaway, index) => <li key={takeaway}><b>0{index + 1}</b><p>{takeaway}</p></li>)}</ol></section>
      <section className="market-radar-section" aria-labelledby="market-news"><div className="market-radar-section__heading"><div><p className="market-radar-kicker">DAILY SIGNALS</p><h2 id="market-news">今日快訊</h2></div><span>Mock source</span></div><div className="market-radar-news">{report.newsItems.map((item) => <article key={item.id}><span>{item.category}</span><div><h3>{item.title}</h3><p>{item.summary}</p><small>{item.source} · {item.updatedAt}</small></div></article>)}</div></section>
      <section className="market-radar-section" aria-labelledby="public-charts"><div className="market-radar-section__heading"><div><p className="market-radar-kicker">OPEN DATA VIEW</p><h2 id="public-charts">公開圖表</h2></div><span>Mock visualization</span></div><div className="market-radar-charts">{report.publicCharts.map((chart) => <PublicChart chart={chart} key={chart.id} />)}</div></section>
      <MarketRadarProSection report={report} />
      <aside className="market-radar-disclaimer"><strong>資料使用提醒</strong><p>現階段所有市場數字、快訊、圖表與報告內容均為 Mock Data。未來將以日期型 JSON 資料來源取代展示資料，並在發布前完成資料校對。</p></aside>
    </div>
  </div>;
}
