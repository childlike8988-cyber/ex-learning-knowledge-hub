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
  const studioUrl = "https://excreatorstudio.github.io/ex-galaxy-ui/";
  const switchContent = <>
    <span className="ai-video-center-switch__power" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v8" /><path d="M7.3 5.7a8 8 0 1 0 9.4 0" /></svg></span>
    <span className="ai-video-center-switch__copy"><span>AI 影片製作</span><small>AI VIDEO STUDIO</small></span>
    {isPrimary ? <span className="ai-video-center-switch__meta"><span className="ai-video-center-switch__status">ENTER STUDIO</span><small className="ai-video-center-switch__capability">AI 生成・自動剪輯</small><small className="ai-video-center-switch__language">LANGUAGE｜🇺🇸 已支援 · 🇹🇼 尚未支援</small></span> : <span className="ai-video-center-switch__status">READY</span>}
  </>;

  return <div className={`ai-video-center-switch ai-video-center-switch--${mode}`}>
    {isPrimary ? <span className="ai-video-center-switch__housing" aria-hidden="true"><i /><i /><i /></span> : null}
    {isPrimary ? <a href={studioUrl} className="ai-video-center-switch__trigger" aria-label="進入 AI 影片製作工作室">{switchContent}</a> : <button type="button" aria-expanded={isOpen} aria-controls={prototypeId} onClick={() => setIsOpen((current) => !current)} className="ai-video-center-switch__trigger">{switchContent}</button>}
    {isOpen && !isPrimary ? <div id={prototypeId} role="status" className="ai-video-center-switch__prototype"><strong>AI Video Center Prototype</strong><span>準備連接 E.X Galaxy UI</span></div> : null}
  </div>;
}
