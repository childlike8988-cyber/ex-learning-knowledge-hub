import type { ReactNode } from "react";

export function LessonSection({ number, title, children, className = "" }: { number: string; title: string; children: ReactNode; className?: string }) {
  return <section className={`ai-learning-lesson-section ${className}`}><div className="ai-learning-lesson-section__heading"><span>{number}</span><h2>{title}</h2></div><div className="ai-learning-lesson-section__body">{children}</div></section>;
}

