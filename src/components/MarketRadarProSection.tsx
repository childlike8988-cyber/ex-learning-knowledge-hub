"use client";

import { useState } from "react";
import type { MarketRadarReport } from "@/data/market-radar";

export function MarketRadarProSection({ report }: { report: MarketRadarReport }) {
  const [message, setMessage] = useState<string | null>(null);

  function showPaymentNotice(plan: "monthly" | "annual") {
    const label = plan === "monthly" ? "月訂閱" : "年訂閱";
    setMessage(`${label}的付款功能準備中。Payment integration coming soon.`);
  }

  return <section className="market-radar-pro" id="market-pro" aria-labelledby="market-radar-pro">
    <div className="market-radar-pro__intro"><p className="market-radar-kicker">會員專屬內容 · MARKET RADAR PRO</p><h2 id="market-radar-pro">{report.proContent.title}</h2><p>{report.proContent.description}</p></div>
    <div className="market-radar-plan-summary" aria-label="Free 與 Pro 簡要差異"><article><p>FREE</p><strong>免費瀏覽</strong><span>每季 1 次 PNG + PDF 完整報告下載</span></article><article><p>PRO</p><strong>無限下載</strong><span>PNG / PDF / Charts、完整分析與歷史報告</span></article></div>
    <ul className="market-radar-pro__benefits" aria-label="Market Radar Pro 包含內容">{report.proContent.benefits.map((benefit) => <li key={benefit}>✓ {benefit}</li>)}</ul>
    <div className="market-radar-pricing" aria-label="Market Radar Pro 方案">
      <article className="market-radar-price-card"><p>Market Radar Pro Monthly</p><strong>NT${report.pricing.monthlyPrice} <small>/ 月</small></strong><span>{report.pricing.monthlyDurationDays} 天有效 · 訂閱期間 Market Radar Pro 無限下載。</span><button type="button" onClick={() => showPaymentNotice("monthly")}>月訂閱</button></article>
      <article className="market-radar-price-card market-radar-price-card--annual"><b className="market-radar-price-card__badge">推薦 · BEST VALUE</b><p>Market Radar Pro Annual</p><strong>NT${report.pricing.annualPrice} <small>/ 年</small></strong><span>{report.pricing.annualDurationDays} 天有效 · 全年無限下載 · 平均 NT${report.pricing.annualEquivalentMonthly} / 月</span><button type="button" onClick={() => showPaymentNotice("annual")}>年訂閱</button></article>
    </div>
    <div className="market-radar-downloads" aria-label="Market Radar Pro 報告格式">{report.downloads.map((download) => <article key={download.id}><span>{download.format}</span><div><h3>{download.title}</h3><p>{download.description}</p></div></article>)}</div>
    {message && <p className="market-radar-payment-note" role="status">{message}</p>}
  </section>;
}
