import type { LearningApp } from "@/data/learning-apps";

export function LearningAppCard({ app }: { app: LearningApp }) {
  return <article className="glass group flex min-h-72 flex-col rounded-2xl p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4"><span className="text-xs font-bold tracking-[0.18em] text-cyan-300">{app.shortCode}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-300">外部工具 ↗</span></div>
    <h3 className="mt-8 text-xl font-semibold text-white">{app.title}</h3>
    <p className="mt-1 text-sm text-cyan-100">{app.englishTitle}</p>
    <p className="mt-4 text-sm leading-6 text-slate-300">{app.description}</p>
    <a href={app.href} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">開始學習 <span aria-hidden="true" className="ml-2">↗</span><span className="sr-only">（在新分頁開啟 {app.englishTitle}）</span></a>
  </article>;
}
