import Link from "next/link";

export function AiLearningStationEntry() {
  return <section className="ai-learning-home-entry" aria-labelledby="ai-learning-home-entry-title"><Link href="/ai-learning/" className="ai-learning-home-entry__link"><span className="ai-learning-home-entry__grid" aria-hidden="true" /><span className="ai-learning-home-entry__orbit" aria-hidden="true"><i /><i /><i /></span><div className="ai-learning-home-entry__copy"><p className="ai-learning-eyebrow">NEW / AI LEARNING STATION</p><h2 id="ai-learning-home-entry-title">AI 學習站</h2><p className="ai-learning-home-entry__tagline">理解邏輯，把執行交給 AI。</p><span className="ai-learning-home-entry__brief">從網站、API、資料庫到 AI，<br />用視覺化課程理解系統如何真正運作。</span><span className="ai-learning-home-entry__cta">探索學習站 <b aria-hidden="true">→</b></span></div><div className="ai-learning-home-entry__preview"><span>LEARNING MAP / PREVIEW</span><strong>CONCEPT → PRACTICE</strong><div><i>Classroom</i><i>AI TA</i><i>Skill Tree</i></div><small>hover / tap to enter</small></div></Link></section>;
}

