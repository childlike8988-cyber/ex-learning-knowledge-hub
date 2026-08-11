"use client";

import { useState } from "react";

export function AIVideoCenterSwitch() {
  const [isOpen, setIsOpen] = useState(false);

  return <div className="ai-video-center-switch">
    <button type="button" aria-expanded={isOpen} aria-controls="ai-video-center-prototype" onClick={() => setIsOpen((current) => !current)} className="ai-video-center-switch__trigger">
      <span className="ai-video-center-switch__power" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v8" /><path d="M7.3 5.7a8 8 0 1 0 9.4 0" /></svg></span>
      <span className="ai-video-center-switch__copy"><span>AI影音中心</span><small>AI VIDEO CENTER</small></span>
      <span className="ai-video-center-switch__status">READY</span>
    </button>
    {isOpen ? <div id="ai-video-center-prototype" role="status" className="ai-video-center-switch__prototype"><strong>AI Video Center Prototype</strong><span>準備連接 E.X Galaxy UI</span></div> : null}
  </div>;
}
