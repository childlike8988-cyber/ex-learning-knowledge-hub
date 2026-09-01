import Link from "next/link";
import type { AiLearningSkillNode } from "@/lib/ai-learning/content";

export function SkillTree({ nodes }: { nodes: readonly AiLearningSkillNode[] }) {
  return <section className="ai-learning-skill-tree" aria-labelledby="skill-tree-title"><div className="ai-learning-section-heading"><div><p className="ai-learning-eyebrow">CAPABILITY MAP</p><h2 id="skill-tree-title">把知識放回關係裡</h2></div><span>7 NODES / 1 PATH</span></div><p className="ai-learning-muted">Skill Tree 不只顯示進度；它回答「現在學的東西，在整個能力地圖的哪裡？」</p><div className="ai-learning-skill-tree__map">{nodes.map((node, index) => <div key={node.id} className={`ai-learning-skill-node ai-learning-skill-node--${node.state}`}><span className="ai-learning-skill-node__line" aria-hidden="true" /> <span className="ai-learning-skill-node__number">0{index + 1}</span><div><strong>{node.label}</strong><small>{node.labelEn}</small><p>{node.description}</p></div><span className="ai-learning-skill-node__state">{node.state === "current" ? "CURRENT" : node.state === "ready" ? "READY" : "NEXT"}</span></div>)}</div><Link className="ai-learning-inline-link" href="/ai-learning/classroom/how-web-works/">沿著課程開始學習 →</Link></section>;
}

