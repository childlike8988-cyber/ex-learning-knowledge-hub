import Link from "next/link";
import type { AiLearningCourse } from "@/lib/ai-learning/content";

export function LessonNavigation({ course, activeSlug }: { course: AiLearningCourse; activeSlug?: string }) {
  return <details className="ai-learning-lesson-nav" open>
    <summary><span>COURSE MAP</span><strong>{course.title}</strong><b aria-hidden="true">⌄</b></summary>
    <nav aria-label="課程小節導覽">{course.lessons.map((lesson) => <Link key={lesson.id} href={`/ai-learning/classroom/${course.slug}/${lesson.slug}/`} className={activeSlug === lesson.slug ? "is-active" : ""} aria-current={activeSlug === lesson.slug ? "page" : undefined}><span>{String(lesson.order).padStart(2, "0")}</span><strong>{lesson.title}</strong><small>{lesson.titleEn}</small></Link>)}</nav>
  </details>;
}
