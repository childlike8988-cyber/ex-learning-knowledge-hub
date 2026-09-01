"use client";

import { useMemo, useState } from "react";
import type { MarketRadarReport } from "@/data/market-radar";
import { MarketRadarDownloadSection } from "@/components/MarketRadarDownloadSection";
import { MARKET_RADAR_LOCAL_AUTH_STATE_LABEL, createLocalMockAccount, createLocalQuarterlyCreditState } from "@/lib/market-radar/auth/mock";
import { getMarketRadarReportAvailability } from "@/lib/market-radar/auth/reportAvailability";

type PreviewState = "guest" | "free" | "free-unlocked" | "free-used" | "pro";

const states: readonly { id: PreviewState; label: string; description: string }[] = [
  { id: "guest", label: "Guest", description: "登入前只顯示登入需求，不建立 session。" },
  { id: "free", label: "Free available", description: "本季剩餘 1 次完整報告解鎖額度。" },
  { id: "free-unlocked", label: "Free unlocked", description: "同一期 PNG 與 PDF 共用一次已解鎖報告。" },
  { id: "free-used", label: "Free used", description: "本季額度已用於另一份報告。" },
  { id: "pro", label: "Pro", description: "Pro 不受季度免費額度限制。" },
];

export function MarketRadarAuthStatePreview({ report }: { report: MarketRadarReport }) {
  const [selected, setSelected] = useState<PreviewState>("guest");
  const availability = useMemo(() => getMarketRadarReportAvailability(report), [report]);
  const state = states.find((item) => item.id === selected) ?? states[0];
  const account = createLocalMockAccount(selected === "pro" ? "pro" : selected === "guest" ? "guest" : "free");
  const credit = createLocalQuarterlyCreditState(availability.quarterKey, selected === "free-unlocked" ? { used: true, unlockedReportId: availability.reportId } : selected === "free-used" ? { used: true } : {});

  return <section className="market-radar-auth-preview" aria-labelledby="market-radar-auth-preview-title">
    <div><p className="market-radar-kicker">{MARKET_RADAR_LOCAL_AUTH_STATE_LABEL}</p><h1 id="market-radar-auth-preview-title">Auth + Download state preview</h1><p>此頁僅供本機／開發驗證。按鈕只切換記憶體中的展示資料，沒有登入、帳戶、權限或檔案下載。</p></div>
    <div className="market-radar-auth-preview__controls" aria-label="本機帳戶狀態選擇">{states.map((item) => <button type="button" key={item.id} data-active={item.id === selected} onClick={() => setSelected(item.id)} aria-pressed={item.id === selected}><strong>{item.label}</strong><span>{item.description}</span></button>)}</div>
    <p className="market-radar-auth-preview__selection" role="status">目前預覽：{state.label} · {state.description}</p>
    <MarketRadarDownloadSection report={report} accountOverride={account} creditOverride={credit} />
  </section>;
}
