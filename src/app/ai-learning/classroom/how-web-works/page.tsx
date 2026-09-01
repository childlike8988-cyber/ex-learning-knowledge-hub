import type { Metadata } from "next";
import Link from "next/link";
import { AiLearningBreadcrumbs } from "@/components/ai-learning/AiLearningBreadcrumbs";
import { CourseRoadmap } from "@/components/ai-learning/CourseRoadmap";
import { AI_LEARNING_COURSE } from "@/lib/ai-learning/content";

export const metadata: Metadata = { title: "一個網站到底怎麼運作？｜AI 學習站", description: "從輸入網址開始，理解 Internet、Frontend、Backend、API、Database、Cloud 與 AI 的概念位置。" };

export default function HowWebWorksCoursePage() {
  return <div className="ai-learning-page ai-learning-page--subpage"><main className="ai-learning-container ai-learning-subpage-main"><AiLearningBreadcrumbs items={[{ label: "AI 學習站", href: "/ai-learning/" }, { label: "Classroom", href: "/ai-learning/classroom/" }, { label: "一個網站到底怎麼運作？" }]} /><header className="ai-learning-course-hero"><div><p className="ai-learning-eyebrow">CLASSROOM / SYSTEM FOUNDATIONS</p><h1>{AI_LEARNING_COURSE.title}</h1><p className="ai-learning-course-hero__en">{AI_LEARNING_COURSE.titleEn}</p><p>{AI_LEARNING_COURSE.subtitle}</p><span className="ai-learning-course-hero__note">概念地圖 · 不把所有產品硬塞進同一種架構</span></div><div className="ai-learning-course-hero__diagram" aria-label="User 到 AI 的概念流程" role="img">{AI_LEARNING_COURSE.flow.map((node, index) => <span key={node}>{node}{index < AI_LEARNING_COURSE.flow.length - 1 && <b aria-hidden="true">↓</b>}</span>)}</div></header><section className="ai-learning-course-overview"><div><p className="ai-learning-eyebrow">THE QUESTION</p><h2>從你輸入網址的那一刻，發生了什麼？</h2><p>{AI_LEARNING_COURSE.summary}</p></div><div className="ai-learning-course-overview__callout"><span>LEARNING PROMISE</span><strong>看懂位置<br />才能判斷邊界。</strong></div></section><CourseRoadmap course={AI_LEARNING_COURSE} /><section className="ai-learning-next-step"><p className="ai-learning-eyebrow">READY WHEN YOU ARE</p><h2>先從 Internet 開始，沿著請求走一遍。</h2><Link href={`/ai-learning/classroom/${AI_LEARNING_COURSE.slug}/${AI_LEARNING_COURSE.lessons[0].slug}/`} className="ai-learning-button ai-learning-button--primary">開始第 01 課 <span aria-hidden="true">→</span></Link></section></main></div>;
}

