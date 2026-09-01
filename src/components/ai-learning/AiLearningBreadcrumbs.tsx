import Link from "next/link";

export type AiLearningBreadcrumb = { label: string; href?: string };

export function AiLearningBreadcrumbs({ items }: { items: readonly AiLearningBreadcrumb[] }) {
  return <nav className="ai-learning-breadcrumbs" aria-label="學習站位置"><Link href="/">Hub</Link>{items.map((item, index) => <span key={`${item.label}-${index}`}><span aria-hidden="true">/</span>{item.href ? <Link href={item.href}>{item.label}</Link> : <strong>{item.label}</strong>}</span>)}</nav>;
}

