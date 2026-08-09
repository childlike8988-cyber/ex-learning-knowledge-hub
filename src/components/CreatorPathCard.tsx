import Link from "next/link";
import type { CreatorLearningPathStage } from "@/data/creator-learning-path";

const toneClasses = {
  starter: "border-cyan-300/25 from-cyan-300/[0.12] to-slate-950/55",
  creator: "border-violet-300/25 from-violet-300/[0.13] to-slate-950/55",
  pro: "border-amber-300/25 from-amber-300/[0.13] to-slate-950/55",
} as const;

export function CreatorPathCard({ stage, index }: { stage: CreatorLearningPathStage; index: number }) {
  const isPro = stage.access === "pro";

  return <article className={`relative flex min-h-[20rem] flex-col overflow-hidden rounded-3xl border bg-gradient-to-b p-6 shadow-[0_22px_70px_rgba(2,6,23,0.25)] backdrop-blur-xl ${toneClasses[stage.id]}`}>
    <span className="absolute right-5 top-3 text-6xl font-black tracking-tight text-white/[0.045]">0{index + 1}</span>
    <div className="relative flex flex-wrap items-center gap-2"><span className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.15em] ${isPro ? "border-amber-300/35 bg-amber-300/10 text-amber-100" : "border-cyan-200/35 bg-cyan-300/10 text-cyan-100"}`}>{stage.level}</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-slate-300">{stage.courses.length} 門內容</span></div>
    <h3 className="relative mt-6 text-2xl font-semibold text-white">{stage.title}</h3><p className="relative mt-1 text-xs font-bold tracking-[0.12em] text-cyan-100/80">{stage.englishTitle}</p><p className="relative mt-3 text-sm leading-7 text-slate-300">{stage.description}</p>
    <div className="relative mt-6 space-y-2">{stage.courses.map((course) => course.href ? <Link key={course.id} href={course.href} className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"><span>{course.title}</span><span aria-hidden="true">→</span></Link> : <div key={course.id} className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-4 text-sm text-slate-400"><span>{course.title}</span><span aria-label="會員專屬內容">🔒</span></div>)}</div>
    <p className={`relative mt-auto pt-5 text-xs font-semibold ${isPro ? "text-amber-100" : "text-cyan-100"}`}>{isPro ? "會員專屬內容" : "公開 Free 課程"}</p>
  </article>;
}
