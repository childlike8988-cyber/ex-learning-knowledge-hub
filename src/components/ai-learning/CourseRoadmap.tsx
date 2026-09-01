import Link from "next/link";
import type { AiLearningCourse } from "@/lib/ai-learning/content";

export function CourseRoadmap({ course, compact = false }: { course: AiLearningCourse; compact?: boolean }) {
  return <section className={`ai-learning-roadmap${compact ? " ai-learning-roadmap--compact" : ""}`} aria-labelledby="course-roadmap-title">
    <div className="ai-learning-section-heading"><div><p className="ai-learning-eyebrow">COURSE ROADMAP</p><h2 id="course-roadmap-title">七個節點，拼回一個系統</h2></div><span>{course.lessons.length} MICRO-LESSONS</span></div>
    <div className="ai-learning-flow" aria-label="網站系統概念流程">{course.flow.map((node, index) => <span key={node} className={index === course.flow.length - 1 ? "ai-learning-flow__node ai-learning-flow__node--accent" : "ai-learning-flow__node"}>{node}{index < course.flow.length - 1 && <b aria-hidden="true">→</b>}</span>)}</div>
    <ol className="ai-learning-lesson-grid">{course.lessons.map((lesson) => <li key={lesson.id}><Link href={`/ai-learning/classroom/${course.slug}/${lesson.slug}/`}><span>{String(lesson.order).padStart(2, "0")}</span><div><strong>{lesson.title}</strong><small>{lesson.titleEn}</small><p>{lesson.summary}</p></div><b aria-hidden="true">↗</b></Link></li>)}</ol>
  </section>;
}

