"use client";

import { useState } from "react";

const navigationItems = [
  ["market-key-take", "今日一句"],
  ["market-district-signals", "三大重點"],
  ["market-temperature", "市場溫度"],
  ["market-public-charts", "公開圖表"],
  ["market-updates", "今日快訊"],
  ["market-key-sentences", "3 句話"],
  ["market-pro", "Market Radar Pro"],
] as const;

export function MarketRadarQuickNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  function handleNavigate() {
    setIsOpen(false);
  }

  return <nav className="market-radar-quick-navigation" aria-label="Market Radar 快速索引">
    <div className="market-radar-quick-navigation__desktop"><p className="market-radar-kicker">QUICK NAVIGATION</p><span>快速索引</span><ol>{navigationItems.map(([id, label], index) => <li key={id}><a href={`#${id}`}><b>{String(index + 1).padStart(2, "0")}</b>{label}</a></li>)}</ol></div>
    <div className="market-radar-quick-navigation__mobile"><button type="button" aria-expanded={isOpen} aria-controls="market-radar-mobile-navigation" onClick={() => setIsOpen((value) => !value)}>快速導覽 <span aria-hidden="true">{isOpen ? "▴" : "▾"}</span></button>{isOpen && <ol id="market-radar-mobile-navigation">{navigationItems.map(([id, label]) => <li key={id}><a href={`#${id}`} onClick={handleNavigate}>{label}</a></li>)}</ol>}</div>
  </nav>;
}
