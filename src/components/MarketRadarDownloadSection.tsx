"use client";

import { useMemo, useState } from "react";
import type { MarketRadarReport } from "@/data/market-radar";
import { MarketRadarLoginRequiredDialog } from "@/components/MarketRadarLoginRequiredDialog";
import { evaluateMarketRadarDownloadEntitlement, requestMarketRadarDownload } from "@/lib/market-radar/auth/entitlement";
import { createLocalMockAccount, createLocalQuarterlyCreditState } from "@/lib/market-radar/auth/mock";
import { getMarketRadarReportAvailability } from "@/lib/market-radar/auth/reportAvailability";
import { useMarketRadarAuth } from "@/lib/market-radar/auth/useMarketRadarAuth";
import type { AccountState, MarketRadarDownloadFormat, QuarterlyDownloadCreditState } from "@/lib/market-radar/auth/types";

function ReportFormatIcon({ format }: { format: "PNG" | "PDF" }) {
  return <span className={`market-radar-download__format-icon market-radar-download__format-icon--${format.toLowerCase()}`} aria-hidden="true">
    {format === "PNG" ? <svg viewBox="0 0 24 24"><path d="M5.25 3.75h9.1l4.4 4.4v12.1H5.25z" /><path d="M14.25 3.75v4.5h4.5M7.9 15.8l2.15-2.35 1.72 1.7 2.25-2.7 2.05 3.35M9.15 9.75h.02" /></svg> : <svg viewBox="0 0 24 24"><path d="M5.25 3.75h9.1l4.4 4.4v12.1H5.25z" /><path d="M14.25 3.75v4.5h4.5M8.1 15.95h7.8M8.1 12.55h7.8" /></svg>}
  </span>;
}

type DownloadSectionProps = {
  report: MarketRadarReport;
  /** Used only by the noindex local account preview. */
  accountOverride?: AccountState;
  creditOverride?: QuarterlyDownloadCreditState;
};

function accountLabel(plan: AccountState["plan"]) {
  if (plan === "pro") return "PRO";
  if (plan === "free") return "FREE";
  return "GUEST";
}

function formatToRequest(format: "PNG" | "PDF"): MarketRadarDownloadFormat {
  return format === "PNG" ? "share-bundle" : "pdf";
}

export function MarketRadarDownloadSection({ report, accountOverride, creditOverride }: DownloadSectionProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const auth = useMarketRadarAuth({ enabled: !accountOverride });
  const availability = useMemo(() => getMarketRadarReportAvailability(report), [report]);
  const usePreviewOverride = Boolean(accountOverride);
  const isLoading = !usePreviewOverride && auth.status === "loading";
  const authUnavailable = !usePreviewOverride && auth.status === "unavailable";
  const account = accountOverride ?? auth.account ?? createLocalMockAccount("guest");
  const credit = creditOverride ?? (account.authenticated ? { quarterKey: availability.quarterKey, totalCredits: 1, usedCredits: 0, remainingCredits: 1, isMock: false } : createLocalQuarterlyCreditState(availability.quarterKey));
  const entitlement = evaluateMarketRadarDownloadEntitlement({ account, report: availability, quarterState: credit });
  const canRequestFormats = !isLoading && !authUnavailable && (entitlement.canAccessReport || entitlement.canDownloadUnlimited);
  const usedLabel = credit.remainingCredits > 0 ? `${credit.remainingCredits} / ${credit.totalCredits}` : "0 / 1";

  function requestDownload(format: MarketRadarDownloadFormat) {
    if (isLoading || authUnavailable) return;
    if (entitlement.requiresLogin) {
      setLoginPromptOpen(true);
      return;
    }
    const result = requestMarketRadarDownload({ reportId: entitlement.reportId, format });
    setMessage(result.safeMessage);
  }

  function requestPrimaryAction() {
    if (entitlement.status !== "free-credit-exhausted") requestDownload("all");
  }

  const creditTitle = isLoading ? "正在確認帳戶狀態" : authUnavailable ? "登入服務暫時無法使用" : entitlement.status === "free-credit-exhausted" ? "本季已使用免費額度" : entitlement.status === "free-report-unlocked" ? "已解鎖本期報告" : account.plan === "pro" ? "完整報告下載" : account.plan === "free" ? "本季免費額度" : "完整報告下載";
  const creditValue = isLoading ? "確認中…" : authUnavailable ? "暫停帳戶功能" : account.plan === "pro" ? "不限季度免費額度" : account.plan === "guest" ? "先登入" : usedLabel;
  const creditReason = isLoading ? "Session restore 完成前不會顯示訪客下載 CTA。" : authUnavailable ? (auth.safeMessage ?? "公開 Market Radar 仍可瀏覽；登入與下載已安全停用。") : account.authenticated && !account.session.isMock ? "已登入。此輪暫以 Free 顯示；會員與季度額度尚未持久化。" : entitlement.reason;

  return <section className="market-radar-download" aria-labelledby="download-today">
    <div className="market-radar-download__heading"><div><p className="market-radar-kicker">DOWNLOAD TODAY&apos;S REPORT</p><h2 id="download-today">下載今日快報</h2><p>PNG 提供 1–3 張可直接轉發客戶的分享圖文；PDF 提供完整深度市場報告。</p></div><span className="market-radar-download__quarter">{availability.quarterKey}</span></div>
    <div className="market-radar-download__account" aria-label="目前帳戶下載狀態" aria-busy={isLoading}><span>{isLoading ? "CHECKING" : authUnavailable ? "UNAVAILABLE" : accountLabel(account.plan)}</span><div><p>{isLoading ? "正在恢復安全 session，尚未判定訪客狀態。" : authUnavailable ? "公開內容可瀏覽；帳戶與下載功能目前安全停用。" : account.plan === "guest" ? "訪客狀態：登入後可查看本季 Free 或 Pro 權益。" : account.plan === "free" ? `${account.session.user?.displayName ?? account.session.user?.email ?? "已登入帳戶"} · Free（會員權益尚未持久化）` : "Pro 狀態：正式權益將由未來安全帳戶服務驗證。"}</p>{!usePreviewOverride && auth.status === "authenticated" && <button type="button" onClick={() => void auth.signOut().then((result) => setMessage(result.safeMessage))}>登出</button>}</div></div>
    <div className="market-radar-download__credit" data-state={isLoading ? "loading" : authUnavailable ? "unavailable" : entitlement.status}><div><p>{creditTitle}</p><strong>{creditValue}</strong><span>{creditReason}</span></div><button type="button" disabled={isLoading || authUnavailable || entitlement.status === "free-credit-exhausted" || entitlement.status === "download-unavailable"} onClick={requestPrimaryAction}>{isLoading ? "正在確認…" : authUnavailable ? "登入服務暫不可用" : entitlement.ctaLabel}</button></div>
    <div className="market-radar-download__formats" aria-label="完整報告格式與用途">{report.downloads.map((download) => <article key={download.id}><ReportFormatIcon format={download.format} /><div><h3>{download.title}</h3><p>{download.description}</p></div>{canRequestFormats && <button type="button" className="market-radar-download__format-action" onClick={() => requestDownload(formatToRequest(download.format))}>{account.plan === "pro" ? `下載 ${download.format}` : `取得 ${download.format}`}</button>}</article>)}</div>
    <div className="market-radar-download__uses" aria-label="快報用途"><p>這份快報可用於：</p>{["開發客戶", "客戶溝通", "屋主說明", "社群分享", "房市話題開場"].map((use) => <span key={use}>{use}</span>)}</div>
    <p className="market-radar-download__footnote">1 Free Full Report Credit ＝ 同一期 PNG 分享圖文 + PDF 完整報告；免費額度依自然季度計算，未使用不累積。</p>
    {message && <p className="market-radar-payment-note" role="status">{message}</p>}
    <MarketRadarLoginRequiredDialog open={loginPromptOpen} auth={auth} onClose={() => setLoginPromptOpen(false)} onAuthenticated={() => setMessage("登入完成。此輪先以 Free 顯示；季度額度與正式下載尚未啟用。")} />
  </section>;
}
