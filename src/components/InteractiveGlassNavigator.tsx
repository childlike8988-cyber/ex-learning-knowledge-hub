"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { creatorGateways } from "@/data/creator-platform";

export function InteractiveGlassNavigator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeGateway = creatorGateways[activeIndex];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % creatorGateways.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div className="glass-navigator" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="glass-navigator__topline"><span className="glass-navigator__live"><i /> LIVE NAVIGATOR</span><span>{paused ? "PAUSED" : "AUTO / 05"}</span></div>
      <Link href={activeGateway.href} className="glass-navigator__card" aria-live="polite">
        <span className="glass-navigator__reflection" aria-hidden="true" />
        <span className="glass-navigator__eyebrow">{activeGateway.eyebrow}</span>
        <span className="glass-navigator__title">{activeGateway.title}</span>
        <span className="glass-navigator__description">{activeGateway.description}</span>
        <span className="glass-navigator__detail">{activeGateway.detail}<b aria-hidden="true">↗</b></span>
      </Link>
      <div className="glass-navigator__footer"><span>FEATURED GATEWAY</span><div className="glass-navigator__dots" aria-label="選擇創作入口">{creatorGateways.map((gateway, index) => <button type="button" key={gateway.id} aria-label={`切換至 ${gateway.title}`} aria-current={index === activeIndex} onClick={() => setActiveIndex(index)}><i /></button>)}</div></div>
    </div>
  );
}
