import Link from "next/link";

export function PracticeLabCard({ full = false }: { full?: boolean }) {
  const steps = ["判斷 Input / Output", "描述 API contract", "讓 AI 協助產生基礎範例", "自己檢查合理性", "觀察結果並記錄"];
  return <section className={`ai-learning-practice${full ? " ai-learning-practice--full" : ""}`} aria-labelledby="practice-lab-title"><div className="ai-learning-practice__orb" aria-hidden="true">LAB</div><div><p className="ai-learning-eyebrow">05 / PRACTICE LAB</p><h2 id="practice-lab-title">懂完後，真正做一次。</h2><p>先不用寫完整程式；把 API 的輸入、輸出與檢查邊界說清楚，就是一個可以驗證的開始。</p></div><ol>{steps.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol>{!full && <Link href="/ai-learning/practice-lab/" className="ai-learning-inline-link">進入 Practice Lab →</Link>}</section>;
}

