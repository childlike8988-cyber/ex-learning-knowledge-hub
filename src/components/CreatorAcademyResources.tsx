import Link from "next/link";
import { creatorResourceCollections } from "@/data/creator-resources";

const typeLabels = { image: "圖片", video: "影片", prompt: "提示詞", article: "文章", pdf: "PDF" } as const;

export function CreatorAcademyResources() {
  return (
    <section aria-labelledby="creator-academy-resources" className="border-t border-white/10 py-14 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">創作工具箱 / CREATOR TOOLKIT</p>
          <h2 id="creator-academy-resources" className="mt-3 text-3xl font-semibold text-white sm:text-4xl">YUNI 創作工具箱</h2>
          <p className="mt-2 text-sm font-medium tracking-[0.08em] text-cyan-100">YUNI Creator Toolkit</p>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">課程完成後的查詢工具，集中整理 AI 生圖提示詞、運鏡示範與拍攝基礎技巧。</p>
        </div>
        <span className="rounded-full border border-cyan-200/20 bg-cyan-300/[0.06] px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-cyan-100">COURSE COMPANION</span>
      </div>
      <Link href="/creator-academy/resources" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/10 px-5 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">開啟創作工具箱 →</Link>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {creatorResourceCollections.map((collection) => (
          <article key={collection.id} className="flex min-h-72 flex-col rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full border border-cyan-200/20 bg-cyan-300/[0.08] px-2.5 py-1 text-[10px] font-bold tracking-[0.13em] text-cyan-100">{collection.category.replaceAll("-", " ")}</span>
              <span className="text-xs text-slate-500">課後查詢</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">{collection.title}</h3>
            <p className="mt-1 text-xs font-medium tracking-[0.08em] text-cyan-100">{collection.englishTitle}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{collection.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">{collection.types.map((type) => <span key={type} className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-slate-300">{typeLabels[type]}</span>)}</div>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-6 text-sm">
              <div className="rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.05] p-3"><p className="text-[10px] font-bold tracking-[0.12em] text-cyan-200">FREE</p><p className="mt-1 font-semibold text-white">{collection.freeCount} 項</p></div>
              <div className="rounded-2xl border border-amber-200/15 bg-amber-300/[0.05] p-3"><p className="text-[10px] font-bold tracking-[0.12em] text-amber-100">PRO</p><p className="mt-1 font-semibold text-white">{collection.proCount} 項</p></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
