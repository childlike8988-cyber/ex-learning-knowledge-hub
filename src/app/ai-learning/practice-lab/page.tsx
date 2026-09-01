import type { Metadata } from "next";
import Link from "next/link";
import { AiLearningBreadcrumbs } from "@/components/ai-learning/AiLearningBreadcrumbs";
import { PracticeLabCard } from "@/components/ai-learning/PracticeLabCard";

export const metadata: Metadata = { title: "Practice Lab｜AI 學習站", description: "把理解轉成一個可以檢查的小練習。" };

export default function PracticeLabPage() { return <div className="ai-learning-page ai-learning-page--subpage"><main className="ai-learning-container ai-learning-subpage-main"><AiLearningBreadcrumbs items={[{ label: "AI 學習站", href: "/ai-learning/" }, { label: "Practice Lab" }]} /><header className="ai-learning-subpage-hero"><div><p className="ai-learning-eyebrow">05 / PRACTICE LAB</p><h1>懂完後，<span>真正做一次。</span></h1><p>把剛理解的概念拆成 input、output、檢查與觀察，先練習判斷，再考慮自動化。</p></div><div className="ai-learning-subpage-hero__meta"><span>FIRST LAB</span><strong>API</strong><small>CONTRACT PRACTICE</small></div></header><PracticeLabCard full /><section className="ai-learning-practice-next"><p className="ai-learning-eyebrow">KEEP THE LOOP GOING</p><h2>做完後回到課程，問 AI TA。</h2><p>練習的目的不是交出一個漂亮答案，而是留下可以被人檢查的思考痕跡。</p><Link href="/ai-learning/classroom/how-web-works/api/" className="ai-learning-button ai-learning-button--ghost">回到 API 課程 <span aria-hidden="true">→</span></Link></section></main></div>; }

