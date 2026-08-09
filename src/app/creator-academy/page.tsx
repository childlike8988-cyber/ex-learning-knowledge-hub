import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CreatorAcademyCategoryCard } from "@/components/CreatorAcademyCategoryCard";
import { CreatorAcademyCourseCard } from "@/components/CreatorAcademyCourseCard";
import { CreatorAcademyHeroStatus } from "@/components/CreatorAcademyHeroStatus";
import { CreatorAcademyResources } from "@/components/CreatorAcademyResources";
import { CreatorLearningPath } from "@/components/CreatorLearningPath";
import { creatorAcademyCategories, getCreatorAcademyCourses } from "@/data/creator-academy";
import { publicAssetPath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "AI 創作者學院 | E.X Creator Studio",
  description: "從 AI 生成、攝影構圖，到影片製作，打造完整影像創作能力。",
};

export default function CreatorAcademyPage() {
  return <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
    <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-cyan-300/25 bg-cyan-300/5 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">← 返回 E.X Creator Studio</Link>

    <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-violet-300/20 bg-[radial-gradient(circle_at_78%_10%,rgba(124,58,237,0.3),transparent_32%),linear-gradient(140deg,rgba(7,24,54,0.96),rgba(8,9,35,0.92))] shadow-[0_30px_90px_rgba(2,6,23,0.35)]"><div className="grid lg:grid-cols-[1.1fr_0.9fr]"><div className="relative px-6 py-12 sm:px-10 sm:py-16"><div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden="true" /><div className="relative max-w-3xl"><p className="eyebrow">AI 創作者教育中心 / EDUCATION CENTER</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">AI 創作者學院</h1><p className="mt-3 text-sm font-bold tracking-[0.13em] text-cyan-100 sm:text-base">Creator Academy</p><p className="mt-6 max-w-2xl leading-8 text-slate-300">從 AI 生成、攝影構圖，到影片製作，打造完整影像創作能力。</p><a href="#learning-path-title" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-300/15 px-6 py-3 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">查看學習路徑 ↓</a></div></div><div className="relative min-h-72 overflow-hidden border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0"><Image src={publicAssetPath("/images/creator-studio/hero-showcase-v1.png")} alt="YUNI AI 創作者導師形象預留區，呈現創作工作室場景" fill priority sizes="(max-width: 1024px) 100vw, 45vw" unoptimized className="object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-violet-950/20 lg:bg-gradient-to-r" /><CreatorAcademyHeroStatus /><div className="absolute bottom-5 left-5 rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 backdrop-blur-xl"><p className="text-[10px] font-bold tracking-[0.16em] text-cyan-200">YUNI 導師預留區</p><p className="mt-1 text-sm text-slate-300">YUNI CREATOR MENTOR</p></div></div></div></section>

    <CreatorLearningPath />
    <CreatorAcademyResources />

    <section aria-labelledby="academy-categories" className="pb-14 sm:pb-20"><p className="eyebrow">課程分類 / COURSE CATEGORIES</p><h2 id="academy-categories" className="mt-3 text-3xl font-semibold text-white">探索學習分類</h2><div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{creatorAcademyCategories.map((category, index) => <CreatorAcademyCategoryCard category={category} priority={index === 0} key={category.id} />)}</div></section>

    {creatorAcademyCategories.map((category) => { const courses = getCreatorAcademyCourses(category.id); return <section id={category.id} className="scroll-mt-24 border-t border-white/10 py-14" key={category.id}><p className="eyebrow">{category.englishTitle}</p><div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl font-semibold text-white">{category.title}</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">{category.description}</p></div><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-slate-300">{courses.length} 門課程</span></div><div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <CreatorAcademyCourseCard course={course} key={course.id} />)}</div></section>; })}

    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm leading-6 text-slate-400">AI 創作者學院目前為公開架構 MVP。免費與 Pro 標籤僅用於內容規劃，不代表已建立登入、會員、付款或存取控制。</section>
  </div>;
}
