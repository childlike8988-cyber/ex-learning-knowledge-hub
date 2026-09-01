import type { Metadata } from "next";
import { AiLearningBreadcrumbs } from "@/components/ai-learning/AiLearningBreadcrumbs";
import { KnowledgeHubPreview } from "@/components/ai-learning/KnowledgeHubPreview";
import { knowledgeHubCategories } from "@/lib/ai-learning/content";

export const metadata: Metadata = { title: "Knowledge Hub｜AI 學習站", description: "AI 學習站的概念與系統知識庫。" };

export default function KnowledgeHubPage() { return <div className="ai-learning-page ai-learning-page--subpage"><main className="ai-learning-container ai-learning-subpage-main"><AiLearningBreadcrumbs items={[{ label: "AI 學習站", href: "/ai-learning/" }, { label: "Knowledge Hub" }]} /><header className="ai-learning-subpage-hero"><div><p className="ai-learning-eyebrow">01 / KNOWLEDGE HUB</p><h1>先找到概念，<span>再找到答案。</span></h1><p>這不是一個堆滿文章的資料庫，而是一張幫助理解系統位置的地圖。</p></div><div className="ai-learning-subpage-hero__meta"><span>08 CATEGORIES</span><strong>MAP</strong><small>CONCEPT FIRST</small></div></header><KnowledgeHubPreview categories={knowledgeHubCategories} /></main></div>; }

