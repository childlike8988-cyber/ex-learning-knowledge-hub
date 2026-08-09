import type { Metadata } from "next";
import Link from "next/link";
import { CreatorAcademyCategoryCard } from "@/components/CreatorAcademyCategoryCard";
import { CreatorAcademyCourseCard } from "@/components/CreatorAcademyCourseCard";
import { creatorAcademyCategories, getCreatorAcademyCourses } from "@/data/creator-academy";

export const metadata: Metadata = {
  title: "YUNI Creator Academy | E.X Creator Studio",
  description: "AI 視覺創作、攝影美學構圖與影像拍攝技巧的創作者教育中心。",
};

export default function CreatorAcademyPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-cyan-300/25 bg-cyan-300/5 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">← 返回 E.X Creator Studio</Link>

      <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-violet-300/20 bg-[radial-gradient(circle_at_78%_10%,rgba(124,58,237,0.3),transparent_32%),linear-gradient(140deg,rgba(7,24,54,0.96),rgba(8,9,35,0.92))] px-6 py-12 shadow-[0_30px_90px_rgba(2,6,23,0.35)] sm:px-10 sm:py-16">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="eyebrow">E.X Creator Studio / Education Center</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">YUNI Creator Academy</h1>
          <p className="mt-4 text-sm font-bold tracking-[0.13em] text-cyan-100 sm:text-base">AI Creation · Photography · Video Production</p>
          <p className="mt-6 max-w-2xl leading-8 text-slate-300">以 YUNI 作為示範角色，從 AI 視覺、攝影構圖到影像拍攝，建立可逐步學習的創作者教育中心。本階段為課程架構 MVP。</p>
        </div>
      </section>

      <section aria-labelledby="academy-categories" className="py-14 sm:py-20">
        <p className="eyebrow">Three learning paths</p>
        <h2 id="academy-categories" className="mt-3 text-3xl font-semibold text-white">選擇創作學習方向</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {creatorAcademyCategories.map((category, index) => <CreatorAcademyCategoryCard category={category} priority={index === 0} key={category.id} />)}
        </div>
      </section>

      {creatorAcademyCategories.map((category) => {
        const courses = getCreatorAcademyCourses(category.id);
        return (
          <section id={category.id} className="scroll-mt-24 border-t border-white/10 py-14" key={category.id}>
            <p className="eyebrow">{category.englishTitle}</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-3xl font-semibold text-white">{category.title}</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">{category.description}</p></div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-slate-300">{courses.length} COURSES</span>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => <CreatorAcademyCourseCard course={course} key={course.id} />)}
            </div>
          </section>
        );
      })}

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm leading-6 text-slate-400">
        Creator Academy 目前為公開架構 MVP。免費與 Pro 標籤僅用於內容規劃，不代表已建立登入、會員、付款或存取控制。
      </section>
    </div>
  );
}
