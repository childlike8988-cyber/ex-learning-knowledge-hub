import Link from "next/link";
import type { AiLearningModule } from "@/lib/ai-learning/content";

export function LearningModuleCard({ module }: { module: AiLearningModule }) {
  return <Link href={module.href} className={`ai-learning-module-card ai-learning-module-card--${module.accent}`}>
    <span className="ai-learning-module-card__index">{module.order}</span>
    <span className="ai-learning-module-card__signal" aria-hidden="true"><i /><i /><i /></span>
    <div><h3>{module.title}</h3><p>{module.titleEn}</p><span className="ai-learning-module-card__description">{module.description}</span></div>
    <span className="ai-learning-module-card__arrow" aria-hidden="true">↗</span>
  </Link>;
}

