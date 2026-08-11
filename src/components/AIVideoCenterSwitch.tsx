"use client";

import { useState } from "react";

type AIVideoCenterSwitchMode = "primary" | "secondary";

type AIVideoCenterSwitchProps = {
  mode?: AIVideoCenterSwitchMode;
};

export function AIVideoCenterSwitch({ mode = "secondary" }: AIVideoCenterSwitchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prototypeId = `ai-video-center-prototype-${mode}`;
  const isPrimary = mode === "primary";

  return <div className={`ai-video-center-switch ai-video-center-switch--${mode}`}>
    {isPrimary ? <span className="ai-video-center-switch__housing" aria-hidden="true"><i /><i /><i /></span> : null}
    <button type="button" aria-expanded={isOpen} aria-controls={prototypeId} onClick={() => setIsOpen((current) => !current)} className="ai-video-center-switch__trigger">
      <span className="ai-video-center-switch__power" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v8" /><path d="M7.3 5.7a8 8 0 1 0 9.4 0" /></svg></span>
      <span className="ai-video-center-switch__copy"><span>AI影音中心</span><small>AI VIDEO CENTER</small></span>
      <span className="ai-video-center-switch__status">{isPrimary ? "PROTOTYPE READY" : "READY"}</span>
    </button>
    {isPrimary ? <p className="ai-video-center-switch__summary">AI 影片製作 × 自動剪輯 × 語音</p> : null}
    {isOpen ? <div id={prototypeId} role="status" className="ai-video-center-switch__prototype"><strong>AI Video Center Prototype</strong><span>準備連接 E.X Galaxy UI</span></div> : null}
  </div>;
}
