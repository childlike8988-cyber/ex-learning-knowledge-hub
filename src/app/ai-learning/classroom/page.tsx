import type { Metadata } from "next";
import Link from "next/link";
import { AiLearningBreadcrumbs } from "@/components/ai-learning/AiLearningBreadcrumbs";
import { CourseRoadmap } from "@/components/ai-learning/CourseRoadmap";
import { LearningModuleCard } from "@/components/ai-learning/LearningModuleCard";
import { AI_LEARNING_COURSE, aiLearningModules } from "@/lib/ai-learning/content";

export const metadata: Metadata = { title: "Classroom｜AI 學習站", description: "用有結構的課程與視覺化路徑，理解系統如何真正運作。" };

export default function AiLearningClassroomPage() {
  return <div className="ai-learning-page ai-learning-page--subpage"><main className="ai-learning-container ai-learning-subpage-main"><AiLearningBreadcrumbs items={[{ label: "AI 學習站", href: "/ai-learning/" }, { label: "Classroom" }]} /><header className="ai-learning-subpage-hero"><div><p className="ai-learning-eyebrow">02 / CLASSROOM</p><h1>有結構的課程，<span>把複雜放回位置。</span></h1><p>每一門課都從概念、關係、比喻與練習開始，讓 AI 成為理解後的執行助手。</p></div><div className="ai-learning-subpage-hero__meta"><span>01 COURSE</span><strong>7</strong><small>MICRO-LESSONS</small></div></header><section className="ai-learning-course-card"><div><span className="ai-learning-card-label">FEATURED COURSE · FREE PROTOTYPE</span><h2>{AI_LEARNING_COURSE.title}</h2><p>{AI_LEARNING_COURSE.subtitle}</p><div className="ai-learning-course-card__tags"><span>CONCEPT MAP</span><span>7 LESSONS</span><span>AI TA DEMO</span></div></div><Link href="/ai-learning/classroom/how-web-works/" className="ai-learning-button ai-learning-button--primary">開始課程 <span aria-hidden="true">→</span></Link></section><CourseRoadmap course={AI_LEARNING_COURSE} /><section className="ai-learning-module-strip" aria-labelledby="classroom-next-title"><div className="ai-learning-section-heading"><div><p className="ai-learning-eyebrow">THE REST OF THE STATION</p><h2 id="classroom-next-title">課程之外，還有三個練習角落</h2></div></div><div className="ai-learning-module-strip__grid">{aiLearningModules.filter((module) => module.id !== "classroom").map((module) => <LearningModuleCard key={module.id} module={module} />)}</div></section></main></div>;
}

