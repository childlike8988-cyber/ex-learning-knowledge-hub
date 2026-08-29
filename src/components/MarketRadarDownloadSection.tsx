"use client";

import { useState } from "react";
import { hasFreeQuarterlyCredit, hasMarketRadarProAccess, type MarketRadarReport } from "@/data/market-radar";

export function MarketRadarDownloadSection({ report }: { report: MarketRadarReport }) {
  const [message, setMessage] = useState<string | null>(null);
  const hasPro = hasMarketRadarProAccess(report);
  const hasFreeCredit = hasFreeQuarterlyCredit(report);
  const usedCredit = !hasFreeCredit && !hasPro;

  function showDownloadNotice() {
    if (hasPro) {
      setMessage("Pro 下載功能準備中。正式上線後將提供本期 PNG + PDF 的暫時下載連結。");
      return;
    }

    if (hasFreeCredit) {
      setMessage("本季免費下載功能準備中。正式上線後，1 次 credit 會解鎖同一期 PNG + PDF。 ");
    }
  }

  return <section className="market-radar-download" aria-labelledby="download-today">
    <div className="market-radar-download__heading"><div><p className="market-radar-kicker">DOWNLOAD TODAY&apos;S REPORT</p><h2 id="download-today">下載今日快報</h2><p>先使用本季免費額度；本期完整報告會一併提供 PNG 快報與 PDF 完整報告。</p></div><span className="market-radar-download__quarter">{report.currentQuarter.id}</span></div>
    <div className="market-radar-download__credit" data-state={hasPro ? "pro" : usedCredit ? "used" : "available"}><div><p>{hasPro ? "Market Radar Pro" : usedCredit ? "本季免費下載額度已使用" : "本季免費下載"}</p><strong>{hasPro ? "無限下載" : `${report.access.freeQuarterlyDownloadsRemaining} / ${report.freePlan.downloadsPerQuarter} 次可用`}</strong><span>{hasPro ? "訂閱期間不消耗免費季度 credit。" : usedCredit ? `下一次免費額度：${report.currentQuarter.nextQuarterLabel} 開放` : "一次解鎖本期 PNG + PDF。"}</span></div>{usedCredit ? <a href="#market-radar-pro">查看 Market Radar Pro</a> : <button type="button" onClick={showDownloadNotice}>{hasPro ? "下載本期 PNG + PDF" : "本季免費下載完整報告"}</button>}</div>
    <div className="market-radar-download__formats" aria-label="完整報告格式與用途">{report.downloads.map((download) => <article key={download.id}><span>{download.format}</span><div><h3>{download.title}</h3><p>{download.description}</p></div></article>)}</div>
    <div className="market-radar-download__uses" aria-label="快報用途"><p>這份快報可用於：</p>{["開發客戶", "客戶溝通", "屋主說明", "社群分享", "房市話題開場"].map((use) => <span key={use}>{use}</span>)}</div>
    <p className="market-radar-download__footnote">1 Free Full Report Credit ＝ 同一期 PNG + PDF；免費額度依自然季度計算，未使用不累積。</p>
    {message && <p className="market-radar-payment-note" role="status">{message}</p>}
  </section>;
}
