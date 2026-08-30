"use client";

import { useState } from "react";
import { resolveMarketRadarAccess, type MarketRadarAccess, type MarketRadarReport } from "@/data/market-radar";

function ReportFormatIcon({ format }: { format: "PNG" | "PDF" }) {
  return <span className={`market-radar-download__format-icon market-radar-download__format-icon--${format.toLowerCase()}`} aria-hidden="true">
    {format === "PNG" ? <svg viewBox="0 0 24 24"><path d="M5.25 3.75h9.1l4.4 4.4v12.1H5.25z" /><path d="M14.25 3.75v4.5h4.5M7.9 15.8l2.15-2.35 1.72 1.7 2.25-2.7 2.05 3.35M9.15 9.75h.02" /></svg> : <svg viewBox="0 0 24 24"><path d="M5.25 3.75h9.1l4.4 4.4v12.1H5.25z" /><path d="M14.25 3.75v4.5h4.5M8.1 15.95h7.8M8.1 12.55h7.8" /></svg>}
  </span>;
}

export function MarketRadarDownloadSection({ report, accessOverride }: { report: MarketRadarReport; accessOverride?: Partial<MarketRadarAccess> }) {
  const [message, setMessage] = useState<string | null>(null);
  const access = { ...report.access, ...accessOverride };
  const downloadAccess = resolveMarketRadarAccess(access);
  const { hasActiveProSubscription: hasPro, hasFreeQuarterlyCredit: hasFreeCredit, isFreeQuarterlyCreditExhausted: usedCredit } = downloadAccess;

  function showDownloadNotice() {
    if (hasPro) {
      setMessage("Pro 下載功能準備中。正式上線後將提供本期 PNG + PDF 的暫時下載連結。");
      return;
    }

    if (hasFreeCredit) {
      setMessage("本季免費下載功能準備中。正式上線後，1 次 credit 會解鎖同一期 PNG + PDF。 ");
    }
  }

  function showProDownloadNotice(format: "PNG" | "PDF") {
    if (hasPro) {
      setMessage(`${format} Pro 下載功能準備中。正式上線後將提供暫時下載連結。`);
      return;
    }
    setMessage("需要 Market Radar Pro 訂閱，才能在免費額度使用後下載個別 PNG 或 PDF。");
    document.getElementById("market-pro")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <section className="market-radar-download" aria-labelledby="download-today">
    <div className="market-radar-download__heading"><div><p className="market-radar-kicker">DOWNLOAD TODAY&apos;S REPORT</p><h2 id="download-today">下載今日快報</h2><p>先使用本季免費額度；本期完整報告會一併提供 PNG 快報與 PDF 完整報告。</p></div><span className="market-radar-download__quarter">{report.currentQuarter.id}</span></div>
    <div className="market-radar-download__credit" data-state={hasPro ? "pro" : usedCredit ? "used" : "available"}><div><p>{hasPro ? "Market Radar Pro" : "本季免費下載"}</p><strong>{hasPro ? "無限下載" : usedCredit ? "已使用" : `${access.freeQuarterlyDownloadsRemaining} / ${report.freePlan.downloadsPerQuarter} 次可用`}</strong><span>{hasPro ? "訂閱期間不消耗免費季度 credit。" : usedCredit ? `本季已下載。下一次免費額度：${report.currentQuarter.nextQuarterLabel} 開放。` : "一次解鎖本期 PNG + PDF。"}</span></div>{usedCredit ? <button type="button" disabled>本季免費額度已使用</button> : <button type="button" onClick={showDownloadNotice}>{hasPro ? "下載本期 PNG + PDF" : "本季免費下載完整報告"}</button>}</div>
    <div className="market-radar-download__formats" aria-label="完整報告格式與用途">{report.downloads.map((download) => <article key={download.id}><ReportFormatIcon format={download.format} /><div><h3>{download.title}</h3><p>{download.description}</p></div>{(usedCredit || hasPro) && <button type="button" className="market-radar-download__format-action" onClick={() => showProDownloadNotice(download.format)}>{hasPro ? `下載 ${download.format}` : `Pro 下載 ${download.format}`}</button>}</article>)}</div>
    <div className="market-radar-download__uses" aria-label="快報用途"><p>這份快報可用於：</p>{["開發客戶", "客戶溝通", "屋主說明", "社群分享", "房市話題開場"].map((use) => <span key={use}>{use}</span>)}</div>
    <p className="market-radar-download__footnote">1 Free Full Report Credit ＝ 同一期 PNG + PDF；免費額度依自然季度計算，未使用不累積。</p>
    {message && <p className="market-radar-payment-note" role="status">{message}</p>}
  </section>;
}
