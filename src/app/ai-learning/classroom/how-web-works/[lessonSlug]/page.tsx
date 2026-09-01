import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AiLearningBreadcrumbs } from "@/components/ai-learning/AiLearningBreadcrumbs";
import { AiTaPanel } from "@/components/ai-learning/AiTaPanel";
import { LessonNavigation } from "@/components/ai-learning/LessonNavigation";
import { LessonSection } from "@/components/ai-learning/LessonSection";
import { AI_LEARNING_COURSE, getAiLearningLesson, getAiLearningNextLesson } from "@/lib/ai-learning/content";

export function generateStaticParams() { return AI_LEARNING_COURSE.lessons.map((lesson) => ({ lessonSlug: lesson.slug })); }

type LessonRouteProps = { params: Promise<{ lessonSlug: string }> };

export async function generateMetadata({ params }: LessonRouteProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = getAiLearningLesson(lessonSlug);
  return lesson ? { title: `${lesson.title}｜${AI_LEARNING_COURSE.title}｜AI 學習站`, description: lesson.summary } : { title: "Lesson｜AI 學習站" };
}

export default async function AiLearningLessonPage({ params }: LessonRouteProps) {
  const { lessonSlug } = await params;
  const lesson = getAiLearningLesson(lessonSlug);
  if (!lesson) notFound();
  const nextLesson = getAiLearningNextLesson(lesson.slug);
  return <div className="ai-learning-page ai-learning-page--lesson"><main className="ai-learning-container ai-learning-lesson-main"><AiLearningBreadcrumbs items={[{ label: "AI 學習站", href: "/ai-learning/" }, { label: "Classroom", href: "/ai-learning/classroom/" }, { label: AI_LEARNING_COURSE.title, href: "/ai-learning/classroom/how-web-works/" }, { label: lesson.title }]} /><div className="ai-learning-lesson-layout"><div className="ai-learning-lesson-layout__navigation"><LessonNavigation course={AI_LEARNING_COURSE} activeSlug={lesson.slug} /></div><article className="ai-learning-lesson-content"><header className="ai-learning-lesson-hero"><span className="ai-learning-lesson-hero__number">{String(lesson.order).padStart(2, "0")} / 07</span><p className="ai-learning-eyebrow">SYSTEM FOUNDATIONS · LESSON {String(lesson.order).padStart(2, "0")}</p><h1>{lesson.title}</h1><p className="ai-learning-lesson-hero__en">{lesson.titleEn}</p><p>{lesson.summary}</p><div className="ai-learning-lesson-progress"><span>LESSON {lesson.order} / {AI_LEARNING_COURSE.lessons.length}</span><i><b style={{ width: `${(lesson.order / AI_LEARNING_COURSE.lessons.length) * 100}%` }} /></i></div></header><LessonSection number="01" title="這是什麼？"><p className="ai-learning-lead">{lesson.concept}</p></LessonSection><LessonSection number="02" title="為什麼需要它？"><p>{lesson.whyItMatters}</p></LessonSection><LessonSection number="03" title="它在整個系統的位置"><div className="ai-learning-position-map"><span>{lesson.systemPosition}</span></div><p className="ai-learning-section-note">這是學習用的概念位置，實際產品會依需求有不同分工與部署方式。</p></LessonSection><LessonSection number="04" title="用生活情境理解"><div className="ai-learning-analogy"><span>ANALOGY</span><p>{lesson.analogy}</p></div></LessonSection><LessonSection number="05" title="E.X 真實案例"><div className="ai-learning-example"><span>E.X CASE</span><p>{lesson.exExample}</p></div></LessonSection><LessonSection number="06" title="AI 可以幫你做什麼？"><div className="ai-learning-ai-boundary"><span>AI CAN ASSIST</span><p>{lesson.aiCanDo}</p></div></LessonSection><LessonSection number="07" title="哪些東西你自己一定要懂？"><div className="ai-learning-human-boundary"><span>HUMAN JUDGMENT</span><p>{lesson.humanMustUnderstand}</p></div></LessonSection><LessonSection number="08" title="Knowledge Check"><div className="ai-learning-knowledge-check"><p>{lesson.knowledgeCheck.question}</p><details><summary>查看提示與答案</summary><p>{lesson.knowledgeCheck.answer}</p></details></div></LessonSection><LessonSection number="09" title="Practice"><div className="ai-learning-practice-inline"><h3>{lesson.practice.title}</h3><ol>{lesson.practice.steps.map((step) => <li key={step}>{step}</li>)}</ol></div></LessonSection><LessonSection number="10" title="Ask AI TA" className="ai-learning-ask-section"><AiTaPanel lesson={lesson} /></LessonSection><footer className="ai-learning-lesson-footer"><Link href="/ai-learning/classroom/how-web-works/">← 回到課程地圖</Link>{nextLesson ? <Link href={`/ai-learning/classroom/${AI_LEARNING_COURSE.slug}/${nextLesson.slug}/`}>下一課：{nextLesson.title} →</Link> : <Link href="/ai-learning/practice-lab/">前往 Practice Lab →</Link>}</footer></article><div className="ai-learning-lesson-layout__aside"><aside className="ai-learning-related"><span className="ai-learning-eyebrow">RELATED SKILLS</span><h2>這一課連到</h2><ul>{lesson.relatedSkills.map((skill) => <li key={skill}><span>{skill}</span></li>)}</ul><p>把概念連起來，比單獨背名詞更容易在真實工作中找到位置。</p></aside><div className="ai-learning-lesson-layout__aside-link"><Link href="/ai-learning/skill-tree/">查看完整 Skill Tree →</Link></div></div></div></main></div>;
}

