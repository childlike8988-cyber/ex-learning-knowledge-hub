"use client";

import { useState } from "react";
import type { MarketRadarReport } from "@/data/market-radar";

export function MarketRadarProSection({ report }: { report: MarketRadarReport }) {
  const [message, setMessage] = useState<string | null>(null);
  const isUnlocked = report.access.hasPurchasedCurrentReport || report.access.hasActiveAnnualSubscription;

  function showPaymentNotice(plan: "single" | "annual" | "download") {
    const label = plan === "single" ? "單次解鎖" : plan === "annual" ? "年度訂閱" : "Pro 下載";
    setMessage(`${label}的付款功能準備中。Payment integration coming soon.`);
  }

  return <section className="market-radar-pro" aria-labelledby="market-radar-pro">
    <div className="market-radar-pro__intro"><p className="market-radar-kicker">會員專屬內容 · MARKET RADAR PRO</p><h2 id="market-radar-pro">{report.proContent.title}</h2><p>{report.proContent.description}</p></div>
    <ul className="market-radar-pro__benefits" aria-label="Market Radar Pro 包含內容">{report.proContent.benefits.map((benefit) => <li key={benefit}>✓ {benefit}</li>)}</ul>
    <div className="market-radar-pricing" aria-label="Market Radar Pro 方案">
      <article className="market-radar-price-card"><p>單次下載</p><strong>NT${report.pricing.singlePrice} <small>/ 本期</small></strong><span>解鎖本期完整分析與下載預留。</span><button type="button" onClick={() => showPaymentNotice("single")}>單次解鎖</button></article>
      <article className="market-radar-price-card market-radar-price-card--annual"><p>年度訂閱</p><strong>NT${report.pricing.annualPrice} <small>/ 年</small></strong><span>全年無限下載 · {report.pricing.annualDurationDays} 天有效 · 平均 NT${report.pricing.annualEquivalentMonthly} / 月</span><button type="button" onClick={() => showPaymentNotice("annual")}>訂閱 Market Radar Pro</button></article>
    </div>
    <div className="market-radar-downloads" aria-label="Market Radar Pro 下載項目">{report.downloads.map((download) => <article key={download.id}><span>{download.format}</span><div><h3>{download.title}</h3><p>{download.description}</p></div><button type="button" disabled={isUnlocked} onClick={() => showPaymentNotice("download")}>{isUnlocked ? "下載" : "Pro content"}</button></article>)}</div>
    {message && <p className="market-radar-payment-note" role="status">{message}</p>}
  </section>;
}
