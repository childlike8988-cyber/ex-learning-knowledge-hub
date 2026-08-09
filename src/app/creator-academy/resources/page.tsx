import type { Metadata } from "next";
import Link from "next/link";
import { CreatorResourceCard } from "@/components/CreatorResourceCard";
import { CreatorVideoPreview } from "@/components/CreatorVideoPreview";
import { creatorCameraMotionResources, creatorResources } from "@/data/creator-resources";

export const metadata: Metadata = {
  title: "YUNI 創作工具箱 | E.X Creator Studio",
  description: "YUNI Creator Toolkit：提供 AI 生圖提示詞、AI 運鏡示範與拍攝基礎技巧的課後查詢工具。",
};

const freePrompts = creatorResources.filter((resource) => resource.category === "ai-visual-creation" && resource.type === "prompt" && resource.access === "free");
const proPrompts = creatorResources.filter((resource) => resource.category === "ai-visual-creation" && resource.type === "prompt" && resource.access === "pro");
const recordingBasics = creatorResources.find((resource) => resource.id === "yuni-recording-basics");

export default function CreatorResourcesLibraryPage() {
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
    <Link href="/creator-academy" className="inline-flex min-h-11 items-center rounded-full border border-cyan-300/25 bg-cyan-300/5 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">← 返回 AI 創作者學院</Link>
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-violet-300/20 bg-[radial-gradient(circle_at_85%_5%,rgba(124,58,237,0.32),transparent_34%),radial-gradient(circle_at_15%_88%,rgba(34,211,238,0.14),transparent_28%),linear-gradient(135deg,rgba(8,24,55,0.96),rgba(2,6,23,0.96))] px-6 py-12 shadow-[0_30px_90px_rgba(2,6,23,0.35)] sm:px-10 sm:py-16">
      <p className="eyebrow">創作工具箱 / CREATOR TOOLKIT</p><h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">YUNI 創作工具箱</h1><p className="mt-2 text-sm font-medium tracking-[0.08em] text-cyan-100">YUNI Creator Toolkit</p><p className="mt-5 max-w-2xl leading-8 text-slate-300">課程完成後的查詢工具，集中整理 AI 生圖提示詞、運鏡示範與拍攝基礎技巧；公開內容可直接瀏覽，會員專屬內容僅保留展示狀態。</p><div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-cyan-100">免費資源</span><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-amber-100">會員專屬內容</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-slate-200">無聲影片預覽</span></div>
    </section>
    <section aria-labelledby="ai-prompt-library" id="ai-prompt-library" className="scroll-mt-24 py-14 sm:py-20"><p className="eyebrow">01 / AI 生圖提示詞庫</p><h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">AI 生圖提示詞庫</h2><p className="mt-2 text-sm font-medium tracking-[0.08em] text-cyan-100">AI Prompt Library</p><p className="mt-3 max-w-2xl leading-7 text-slate-300">從基礎提示詞 A、基礎提示詞 B 開始；進階提示詞 01–20 保留為會員專屬內容。</p><div className="mt-8 grid gap-5 sm:grid-cols-2">{freePrompts.map((resource) => <CreatorResourceCard resource={resource} key={resource.id} />)}</div><div className="mt-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">會員專屬內容 / PRO</p><h3 className="mt-2 text-2xl font-semibold text-white">進階提示詞 01–20</h3><p className="mt-1 text-sm text-cyan-100">Advanced Prompt 01–20</p></div><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-100">會員專屬內容</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{proPrompts.map((resource) => <CreatorResourceCard resource={resource} key={resource.id} />)}</div></section>
    <section aria-labelledby="camera-motion-library" id="camera-motion-library" className="scroll-mt-24 border-t border-white/10 py-14 sm:py-20"><p className="eyebrow">02 / AI 運鏡示範庫</p><h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">AI 運鏡示範庫</h2><p className="mt-2 text-sm font-medium tracking-[0.08em] text-cyan-100">Camera Motion Library</p><p className="mt-3 max-w-2xl leading-7 text-slate-300">推近、拉遠、平移、升降、跟拍與環繞，皆以 MP4 無聲循環方式呈現，方便對照 AI Video Prompt。</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{creatorCameraMotionResources.map((resource) => <CreatorVideoPreview resource={resource} key={resource.id} />)}</div></section>
    {recordingBasics ? <section aria-labelledby="recording-basics" id="recording-basics" className="scroll-mt-24 border-t border-white/10 py-14 sm:py-20"><p className="eyebrow">03 / 拍攝基礎技巧</p><h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">拍攝基礎技巧</h2><p className="mt-2 text-sm font-medium tracking-[0.08em] text-cyan-100">Recording Basics</p><p className="mt-3 max-w-2xl leading-7 text-slate-300">先建立畫面穩定、構圖、光線、收音與設備差異等錄影基礎，再進入進階的影像創作。</p><div className="mt-8 max-w-3xl"><CreatorResourceCard resource={recordingBasics} /></div></section> : null}
  </main>;
}
