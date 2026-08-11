"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { platformNavigationItems } from "@/data/platform-navigation";

const rotationIntervalMs = 4800;

function getNextIndex(currentIndex: number, offset: number) {
  return (currentIndex + offset + platformNavigationItems.length) % platformNavigationItems.length;
}

export function InteractiveGlassNavigator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPrototypeOpen, setIsPrototypeOpen] = useState(false);
  const activeItem = platformNavigationItems[activeIndex];
  const previousItem = platformNavigationItems[getNextIndex(activeIndex, -1)];
  const nextItem = platformNavigationItems[getNextIndex(activeIndex, 1)];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => getNextIndex(current, 1));
      setIsPrototypeOpen(false);
    }, rotationIntervalMs);
    return () => window.clearInterval(timer);
  }, [paused, prefersReducedMotion]);

  function selectItem(index: number) {
    setActiveIndex(index);
    setIsPrototypeOpen(false);
  }

  return (
    <section className="platform-navigator" aria-label="平台導航中心" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="platform-navigator__neighbors" aria-hidden="true"><div className="platform-navigator__neighbor platform-navigator__neighbor--previous"><span>{previousItem.index}</span><b>{previousItem.titleEn}</b></div><div className="platform-navigator__neighbor platform-navigator__neighbor--next"><span>{nextItem.index}</span><b>{nextItem.titleEn}</b></div></div>
      <div className="platform-navigator__header"><div><p><i /> 平台導航中心</p><span>PLATFORM NAVIGATOR</span></div><span className="platform-navigator__progress" aria-label={`第 ${activeItem.index} 項，共 ${platformNavigationItems.length} 項`}>{activeItem.index} / {String(platformNavigationItems.length).padStart(2, "0")}</span></div>
      <div className="platform-navigator__content" aria-live="polite">
        <p className="platform-navigator__eyebrow">{activeItem.category}</p>
        <h2>{activeItem.titleZh}</h2>
        <p className="platform-navigator__english">{activeItem.titleEn}</p>
        <p className="platform-navigator__description">{activeItem.description}</p>
        <span className={`platform-navigator__status${activeItem.comingSoon ? " is-muted" : ""}`}>{activeItem.status}</span>
        {activeItem.href ? <Link href={activeItem.href} className="platform-navigator__cta">開啟入口 <span aria-hidden="true">↗</span></Link> : activeItem.id === "ai-video-center" ? <button type="button" aria-expanded={isPrototypeOpen} aria-controls="platform-navigator-prototype" className="platform-navigator__cta" onClick={() => setIsPrototypeOpen((current) => !current)}>查看原型 <span aria-hidden="true">↗</span></button> : <span className="platform-navigator__coming-soon">即將開放 · Coming Soon</span>}
        {isPrototypeOpen ? <div id="platform-navigator-prototype" role="status" className="platform-navigator__prototype"><strong>AI Video Center Prototype</strong><span>準備連接 E.X Galaxy UI</span></div> : null}
      </div>
      <div className="platform-navigator__footer"><div className="platform-navigator__dots" aria-label="切換平台入口">{platformNavigationItems.map((item, index) => <button type="button" className={index === activeIndex ? "is-active" : ""} aria-label={`切換至 ${item.titleZh}`} aria-pressed={index === activeIndex} onClick={() => selectItem(index)} key={item.id} />)}</div><div className="platform-navigator__controls"><button type="button" aria-label="上一個平台入口" onClick={() => selectItem(getNextIndex(activeIndex, -1))}>←</button><button type="button" aria-label="下一個平台入口" onClick={() => selectItem(getNextIndex(activeIndex, 1))}>→</button></div></div>
    </section>
  );
}
