"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketRadarAuthController } from "@/lib/market-radar/auth/useMarketRadarAuth";

type LoginDialogProps = {
  open: boolean;
  auth: Pick<MarketRadarAuthController, "status" | "safeMessage" | "signInWithGoogle" | "requestEmailOtp" | "verifyEmailOtp">;
  onClose(): void;
  onAuthenticated(): void;
};

export function MarketRadarLoginRequiredDialog({ open, auth, onClose, onAuthenticated }: LoginDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"start" | "otp">("start");
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

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

  useEffect(() => {
    if (open) return;
    setStep("start");
    setOtp("");
    setMessage(undefined);
    setPending(false);
  }, [open]);

  if (!open) return null;

  async function beginGoogleSignIn() {
    setPending(true);
    const result = await auth.signInWithGoogle();
    setMessage(result.safeMessage);
    setPending(false);
    if (result.status === "authenticated") onAuthenticated();
  }

  async function sendOtp() {
    setPending(true);
    const result = await auth.requestEmailOtp(email);
    setMessage(result.safeMessage);
    setPending(false);
    if (result.status === "otp-sent") setStep("otp");
  }

  async function confirmOtp() {
    setPending(true);
    const result = await auth.verifyEmailOtp(email, otp);
    setMessage(result.safeMessage);
    setPending(false);
    if (result.status === "authenticated") {
      onAuthenticated();
      onClose();
    }
  }

  return <div className="market-radar-auth-dialog__backdrop" role="presentation" onMouseDown={onClose}>
    <div ref={dialogRef} className="market-radar-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="market-radar-auth-dialog-title" aria-describedby="market-radar-auth-dialog-description" onMouseDown={(event) => event.stopPropagation()}>
      <p className="market-radar-kicker">ACCOUNT REQUIRED</p>
      <h2 id="market-radar-auth-dialog-title">下載完整報告需先登入</h2>
      <p id="market-radar-auth-dialog-description">Free 會員每季可免費解鎖 1 份完整報告，包含 PNG 分享圖文與 PDF 深度報告。</p>
      {auth.status === "unavailable" ? <p className="market-radar-auth-dialog__boundary" role="status">{auth.safeMessage ?? "登入服務暫時無法使用；帳戶與下載功能已安全停用。"}</p> : <>
        <p className="market-radar-auth-dialog__boundary">登入後會由安全會員資料庫確認 Free / Pro 與本季額度；正式檔案傳輸仍未接入。</p>
        {step === "start" ? <div className="market-radar-auth-dialog__form">
          <button type="button" onClick={() => void beginGoogleSignIn()} disabled={pending || auth.status === "loading"}>{pending ? "處理中…" : "使用 Google 登入"}</button>
          <span>或使用 Email 驗證碼</span>
          <label>Email<input type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" disabled={pending} /></label>
          <button type="button" className="market-radar-auth-dialog__email-action" onClick={() => void sendOtp()} disabled={pending || !email.includes("@")}>寄送 6 位數驗證碼</button>
        </div> : <div className="market-radar-auth-dialog__form">
          <label>6 位數驗證碼<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" disabled={pending} /></label>
          <button type="button" onClick={() => void confirmOtp()} disabled={pending || otp.length !== 6}>{pending ? "驗證中…" : "確認登入"}</button>
          <button type="button" className="market-radar-auth-dialog__later" onClick={() => setStep("start")} disabled={pending}>使用其他 Email</button>
        </div>}
        {message && <p className="market-radar-auth-dialog__message" role="status">{message}</p>}
      </>}
      <div className="market-radar-auth-dialog__actions"><button type="button" className="market-radar-auth-dialog__later" onClick={onClose} disabled={pending}>稍後再說</button></div>
    </div>
  </div>;
}
