import type { Metadata } from "next";
import Link from "next/link";
import { CreatorResourceCard } from "@/components/CreatorResourceCard";
import { CreatorVideoPreview } from "@/components/CreatorVideoPreview";
import { creatorCameraMotionResources, creatorResources } from "@/data/creator-resources";

export const metadata: Metadata = {
  title: "YUNI Creator Resources Library | E.X Creator Studio",
  description: "YUNI 的公開 AI Prompt、Camera Motion 與 Recording Basics 資源展示庫。",
};

const freePrompts = creatorResources.filter((resource) => resource.category === "ai-visual-creation" && resource.type === "prompt" && resource.access === "free");
const proPrompts = creatorResources.filter((resource) => resource.category === "ai-visual-creation" && resource.type === "prompt" && resource.access === "pro");
const recordingBasics = creatorResources.find((resource) => resource.id === "yuni-recording-basics");

export default function CreatorResourcesLibraryPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <Link href="/creator-academy" className="inline-flex min-h-11 items-center rounded-full border border-cyan-300/25 bg-cyan-300/5 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">← 返回 YUNI Creator Academy</Link>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-violet-300/20 bg-[radial-gradient(circle_at_85%_5%,rgba(124,58,237,0.32),transparent_34%),radial-gradient(circle_at_15%_88%,rgba(34,211,238,0.14),transparent_28%),linear-gradient(135deg,rgba(8,24,55,0.96),rgba(2,6,23,0.96))] px-6 py-12 shadow-[0_30px_90px_rgba(2,6,23,0.35)] sm:px-10 sm:py-16">
        <p className="eyebrow">Creator Academy / Resource Library</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">YUNI Creator Resources Library</h1>
        <p className="mt-5 max-w-2xl leading-8 text-slate-300">集中展示 YUNI 的 AI Prompt、Camera Motion 與錄影基礎資源。公開素材以 GitHub Pages 相容路徑載入；Pro 項目只保留會員內容預覽。</p>
        <div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-cyan-100">FREE RESOURCES</span><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-amber-100">PRO PREVIEW</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-slate-200">MUTED VIDEO</span></div>
      </section>

      <section aria-labelledby="ai-prompt-library" className="py-14 sm:py-20"><p className="eyebrow">01 / AI Prompt Library</p><h2 id="ai-prompt-library" className="mt-3 text-3xl font-semibold text-white sm:text-4xl">AI Prompt Library</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">Basic Prompt A、Basic Prompt B 可公開閱讀；Advanced Prompt 01–20 保留為會員專屬內容。</p><div className="mt-8 grid gap-5 sm:grid-cols-2">{freePrompts.map((resource) => <CreatorResourceCard resource={resource} key={resource.id} />)}</div><div className="mt-10 flex items-end justify-between gap-4"><div><p className="eyebrow">Pro / Advanced Prompt Library</p><h3 className="mt-2 text-2xl font-semibold text-white">Advanced Prompt 01–20</h3></div><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-100">會員專屬內容</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{proPrompts.map((resource) => <CreatorResourceCard resource={resource} key={resource.id} />)}</div></section>

      <section aria-labelledby="camera-motion-library" className="border-t border-white/10 py-14 sm:py-20"><p className="eyebrow">02 / Camera Motion Library</p><h2 id="camera-motion-library" className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Camera Motion Library</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">Push In、Pull Out、Pan、Tilt、Tracking 與 Orbit。六種 MP4 都以靜音循環方式載入，作為實拍運鏡與 AI Video Prompt 的對照。</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{creatorCameraMotionResources.map((resource) => <CreatorVideoPreview resource={resource} key={resource.id} />)}</div></section>

      {recordingBasics ? <section aria-labelledby="recording-basics" className="border-t border-white/10 py-14 sm:py-20"><p className="eyebrow">03 / Recording Basics</p><h2 id="recording-basics" className="mt-3 text-3xl font-semibold text-white sm:text-4xl">錄影穩定要素</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">手持拍攝的五個穩定關鍵：雙手持穩、手肘貼近、膝蓋微彎、輕步移動與放慢呼吸。</p><div className="mt-8 max-w-3xl"><CreatorResourceCard resource={recordingBasics} /></div></section> : null}
    </div>
  );
}
