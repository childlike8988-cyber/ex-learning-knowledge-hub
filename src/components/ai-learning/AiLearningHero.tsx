import Link from "next/link";

export function AiLearningHero() {
  return <section className="ai-learning-hero" aria-labelledby="ai-learning-title">
    <div className="ai-learning-hero__aurora" aria-hidden="true" />
    <div className="ai-learning-hero__circuit" aria-hidden="true"><i /><i /><i /><i /><b /><b /><b /></div>
    <div className="ai-learning-container ai-learning-hero__inner">
      <div className="ai-learning-hero__copy">
        <p className="ai-learning-eyebrow">E.X LEARNING &amp; KNOWLEDGE HUB · 01</p>
        <p className="ai-learning-hero__kicker">AI LEARNING STATION</p>
        <h1 id="ai-learning-title">理解邏輯，<span>把執行交給 AI。</span></h1>
        <p className="ai-learning-hero__english">Understand the Logic.<br />Let AI Handle the Execution.</p>
        <p className="ai-learning-hero__description">不只是學會下指令，而是先看懂系統怎麼運作，再知道哪些工作可以放心交給 AI。</p>
        <div className="ai-learning-hero__actions"><Link href="/ai-learning/classroom/" className="ai-learning-button ai-learning-button--primary">進入 Classroom <span aria-hidden="true">→</span></Link><Link href="/ai-learning/skill-tree/" className="ai-learning-button ai-learning-button--ghost">查看能力地圖</Link></div>
        <div className="ai-learning-hero__status" aria-label="學習站內容狀態"><span><i />STATIC COURSE PROTOTYPE</span><span>ZH-TW FIRST</span><span>NO AI REQUEST YET</span></div>
      </div>
      <div className="ai-learning-hero__visual" aria-label="AI Learning Station concept map" role="img">
        <div className="ai-learning-hero__orb" aria-hidden="true"><span className="ai-learning-hero__orb-core">AI</span><i /><i /><i /></div>
        <div className="ai-learning-hero__panel ai-learning-hero__panel--top"><span>COURSE CONTEXT</span><strong>HOW WEB WORKS</strong><small>7 MICRO-LESSONS</small></div>
        <div className="ai-learning-hero__panel ai-learning-hero__panel--bottom"><span>HUMAN JUDGMENT</span><strong>FACTS · BOUNDARIES · PRACTICE</strong></div>
        <div className="ai-learning-hero__node ai-learning-hero__node--one">Frontend</div><div className="ai-learning-hero__node ai-learning-hero__node--two">API</div><div className="ai-learning-hero__node ai-learning-hero__node--three">AI</div>
      </div>
    </div>
  </section>;
}

