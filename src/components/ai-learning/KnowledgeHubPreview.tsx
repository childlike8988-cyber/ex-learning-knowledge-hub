import Link from "next/link";

type KnowledgeCategory = { readonly id: string; readonly label: string; readonly description: string; readonly count: string };

export function KnowledgeHubPreview({ categories, compact = false }: { categories: readonly KnowledgeCategory[]; compact?: boolean }) {
  return <section className={`ai-learning-knowledge-hub${compact ? " ai-learning-knowledge-hub--compact" : ""}`} aria-labelledby="knowledge-hub-title"><div className="ai-learning-section-heading"><div><p className="ai-learning-eyebrow">01 / KNOWLEDGE HUB</p><h2 id="knowledge-hub-title">先找到概念，再找到答案</h2></div><Link href="/ai-learning/knowledge-hub/" className="ai-learning-inline-link">開啟知識庫 →</Link></div><p className="ai-learning-muted">把零散名詞整理成系統位置，讓每一次學習都能連回更大的脈絡。</p><div className="ai-learning-knowledge-grid">{categories.map((category) => <Link key={category.id} href={category.id === "web" ? "/ai-learning/classroom/how-web-works/" : "/ai-learning/knowledge-hub/"}><span>{category.label}</span><p>{category.description}</p><small>{category.count}</small></Link>)}</div></section>;
}
