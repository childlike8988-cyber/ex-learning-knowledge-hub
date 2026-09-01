import type { Metadata } from "next";
import { AiLearningBreadcrumbs } from "@/components/ai-learning/AiLearningBreadcrumbs";
import { SkillTree } from "@/components/ai-learning/SkillTree";
import { aiLearningSkillTree } from "@/lib/ai-learning/content";

export const metadata: Metadata = { title: "Skill Tree｜AI 學習站", description: "看見 Internet、Frontend、Backend、API、Database、Cloud 與 AI 的能力關係。" };

export default function SkillTreePage() { return <div className="ai-learning-page ai-learning-page--subpage"><main className="ai-learning-container ai-learning-subpage-main"><AiLearningBreadcrumbs items={[{ label: "AI 學習站", href: "/ai-learning/" }, { label: "Skill Tree" }]} /><header className="ai-learning-subpage-hero"><div><p className="ai-learning-eyebrow">04 / SKILL TREE</p><h1>能力不是清單，<span>而是關係。</span></h1><p>從 Internet 到 AI Integration，沿著前置概念看見下一個可以理解的節點。</p></div><div className="ai-learning-subpage-hero__meta"><span>CAPABILITY MAP</span><strong>07</strong><small>NODES</small></div></header><SkillTree nodes={aiLearningSkillTree} /></main></div>; }

