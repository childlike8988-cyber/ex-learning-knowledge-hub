import Image from "next/image";
import Link from "next/link";
import type { LearningApp } from "@/data/learning-apps";
import { publicAssetPath } from "@/lib/paths";

export function LearningAppCard({ app }: { app: LearningApp }) {
  const className = "glass group flex min-h-[28rem] cursor-pointer flex-col overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-1 hover:border-cyan-200/60 hover:bg-slate-800/85 hover:shadow-[0_20px_50px_rgba(34,211,238,0.16)] focus-visible:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200";
  const contents = <>
    <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10">
      {app.previewKind === "market-radar" ? <div className="market-radar-app-preview h-full w-full" role="img" aria-label={app.previewAlt}><span className="market-radar-app-preview__grid" /><span className="market-radar-app-preview__eyebrow">KAOHSIUNG / DAILY BRIEF</span><strong>MARKET<br />RADAR</strong><span className="market-radar-app-preview__chart"><i /><i /><i /><i /><b /></span></div> : <Image src={publicAssetPath(app.previewImage)} alt={app.previewAlt} width={1600} height={900} unoptimized className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035] group-focus-visible:scale-[1.035]" />}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
      <span className="absolute left-4 top-4 rounded-full border border-cyan-200/40 bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-cyan-100">{app.shortCode}</span>
      <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-200">{app.external ? "外部工具 ↗" : "站內快報"}</span>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6"><h3 className="text-xl font-semibold text-white">{app.title}</h3><p className="mt-1 text-sm text-cyan-100">{app.englishTitle}</p><p className="mt-4 text-sm leading-6 text-slate-300">{app.description}</p>{app.tags && <div className="mt-4 flex flex-wrap gap-2" aria-label={`${app.englishTitle} 類型標籤`}>{app.tags.map((tag) => <span className="rounded-full border border-violet-300/25 bg-violet-300/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-violet-100" key={tag}>{tag}</span>)}</div>}<p className="mt-auto pt-5 text-xs text-slate-400">{app.external ? "點擊卡片或按鈕即可開啟 · 將在新分頁開啟" : "點擊卡片或按鈕即可查看今日快報"}</p><span className="mt-3 inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/15 px-5 py-3 text-sm font-bold text-cyan-50 transition group-hover:bg-cyan-300 group-hover:text-slate-950 group-focus-visible:bg-cyan-300 group-focus-visible:text-slate-950">{app.ctaLabel} <span aria-hidden="true" className="ml-2">{app.external ? "↗" : "→"}</span>{app.external && <span className="sr-only">（在新分頁開啟 {app.englishTitle}）</span>}</span></div>
  </>;

  return app.external ? <a href={app.href} target="_blank" rel="noopener noreferrer" className={className}>{contents}</a> : <Link href={app.href} className={className}>{contents}</Link>;
}
