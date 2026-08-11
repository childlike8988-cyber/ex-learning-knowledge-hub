"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creatorLearningNavigatorItems } from "@/data/creator-learning-navigator";

const rotationIntervalMs = 4500;

function getNextIndex(currentIndex: number, offset: number) {
  return (currentIndex + offset + creatorLearningNavigatorItems.length) % creatorLearningNavigatorItems.length;
}

export function CreatorLearningNavigator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setInterval(() => setActiveIndex((current) => getNextIndex(current, 1)), rotationIntervalMs);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const item = creatorLearningNavigatorItems[activeIndex];

  return <section aria-label="教學導航中心" className="creator-learning-navigator">
    <div className="creator-learning-navigator__header"><div><p>教學導航中心</p><span>LEARNING HUB</span></div><span className="creator-learning-navigator__progress" aria-label={`第 ${item.index} 項，共 ${creatorLearningNavigatorItems.length} 項`}>{item.index} / {String(creatorLearningNavigatorItems.length).padStart(2, "0")}</span></div>
    <div className="creator-learning-navigator__content" aria-live="polite"><p className="creator-learning-navigator__eyebrow">{item.index} · {item.englishTitle}</p><h2>{item.title}</h2><p>{item.description}</p>{item.href ? <Link href={item.href} className="creator-learning-navigator__link">開始學習 <span aria-hidden="true">→</span></Link> : <span className="creator-learning-navigator__coming-soon">即將開放 · Coming Soon</span>}</div>
    <div className="creator-learning-navigator__footer"><div className="creator-learning-navigator__dots" aria-label="選擇教學主題">{creatorLearningNavigatorItems.map((navigationItem, index) => <button type="button" className={index === activeIndex ? "is-active" : ""} aria-label={`顯示 ${navigationItem.title}`} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)} key={navigationItem.id} />)}</div><div className="creator-learning-navigator__controls"><button type="button" aria-label="上一項教學主題" onClick={() => setActiveIndex((current) => getNextIndex(current, -1))}>←</button><button type="button" aria-label="下一項教學主題" onClick={() => setActiveIndex((current) => getNextIndex(current, 1))}>→</button></div></div>
  </section>;
}
