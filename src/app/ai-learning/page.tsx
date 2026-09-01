import type { Metadata } from "next";
import Link from "next/link";
import { AiLearningHero } from "@/components/ai-learning/AiLearningHero";
import { CourseRoadmap } from "@/components/ai-learning/CourseRoadmap";
import { KnowledgeHubPreview } from "@/components/ai-learning/KnowledgeHubPreview";
import { LearningModuleCard } from "@/components/ai-learning/LearningModuleCard";
import { PracticeLabCard } from "@/components/ai-learning/PracticeLabCard";
import { AI_LEARNING_COURSE, aiLearningModules, knowledgeHubCategories } from "@/lib/ai-learning/content";

export const metadata: Metadata = {
  title: "AI 學習站｜AI Learning Station",
  description: "理解網站、API、資料庫、Cloud 與 AI 如何協作，再知道哪些工作可以放心交給 AI。",
};

export default function AiLearningStationPage() {
  return <div className="ai-learning-page">
    <AiLearningHero />
    <main className="ai-learning-container ai-learning-main">
      <section className="ai-learning-intro" aria-labelledby="ai-learning-intro-title"><div><p className="ai-learning-eyebrow">A DIFFERENT WAY TO LEARN AI</p><h2 id="ai-learning-intro-title">先懂系統，<span>再交給 AI 執行。</span></h2></div><p>AI 學習站把知識放回系統脈絡：概念、位置、責任與練習彼此連起來。從一個網站的請求旅程開始，逐步建立能遷移到真實工作的理解。</p></section>
      <section className="ai-learning-module-section" aria-labelledby="ai-learning-modules-title"><div className="ai-learning-section-heading"><div><p className="ai-learning-eyebrow">THE STATION</p><h2 id="ai-learning-modules-title">五個入口，一條理解路徑</h2></div><span>01—05 / STATION MAP</span></div><div className="ai-learning-module-grid">{aiLearningModules.map((module) => <LearningModuleCard module={module} key={module.id} />)}</div></section>
      <CourseRoadmap course={AI_LEARNING_COURSE} compact />
      <div className="ai-learning-lower-grid"><KnowledgeHubPreview categories={knowledgeHubCategories.slice(0, 6)} compact /><PracticeLabCard /></div>
      <section className="ai-learning-cta" aria-labelledby="ai-learning-cta-title"><div><p className="ai-learning-eyebrow">START WITH THE SYSTEM</p><h2 id="ai-learning-cta-title">一個網站到底怎麼運作？</h2><p>七個 micro-lessons，從 Internet 走到 AI in the System。每課都有一個生活比喻、一個 E.X 案例與一次小練習。</p></div><Link href="/ai-learning/classroom/how-web-works/" className="ai-learning-button ai-learning-button--primary">查看課程路徑 <span aria-hidden="true">→</span></Link></section>
    </main>
  </div>;
}

