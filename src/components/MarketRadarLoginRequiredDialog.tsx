"use client";

import { useEffect, useRef } from "react";

export function MarketRadarLoginRequiredDialog({ open, onClose, onLoginUnavailable }: { open: boolean; onClose(): void; onLoginUnavailable(): void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const firstButton = dialogRef.current?.querySelector<HTMLButtonElement>("button");
    firstButton?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return <div className="market-radar-auth-dialog__backdrop" role="presentation" onMouseDown={onClose}>
    <div ref={dialogRef} className="market-radar-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="market-radar-auth-dialog-title" aria-describedby="market-radar-auth-dialog-description" onMouseDown={(event) => event.stopPropagation()}>
      <p className="market-radar-kicker">ACCOUNT REQUIRED</p>
      <h2 id="market-radar-auth-dialog-title">下載完整報告需先登入</h2>
      <p id="market-radar-auth-dialog-description">Free 會員每季可免費解鎖 1 份完整報告，包含 PNG 分享圖文與 PDF 深度報告。</p>
      <p className="market-radar-auth-dialog__boundary">正式登入服務尚未接入；此頁不會建立假帳號、session 或下載連結。</p>
      <div className="market-radar-auth-dialog__actions"><button type="button" onClick={onLoginUnavailable}>登入／建立帳號</button><button type="button" className="market-radar-auth-dialog__later" onClick={onClose}>稍後再說</button></div>
    </div>
  </div>;
}
