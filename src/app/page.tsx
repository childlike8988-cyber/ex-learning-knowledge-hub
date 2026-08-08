import Link from "next/link";
import { CreatorCategoryCard } from "@/components/CreatorCategoryCard";
import { CreatorStudioHero } from "@/components/CreatorStudioHero";
import { LearningAppCard } from "@/components/LearningAppCard";
import { MembershipPreview } from "@/components/MembershipPreview";
import { creatorCategories } from "@/data/creator-platform";
import { learningApps } from "@/data/learning-apps";

export default function Home() {
  return <div className="home-page">
    <CreatorStudioHero />
    <div className="mx-auto max-w-6xl px-5 pb-2 sm:px-8">
    <section aria-labelledby="learning-apps" className="home-learning-section"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">E.X AI App Ecosystem</p><h2 id="learning-apps" className="mt-2 text-3xl font-semibold text-white">Learning Apps</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">三個可立即使用的互動入口，串起知識、練習與未來的 AI 工具中心。</p></div><span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs text-cyan-100">OPEN IN NEW TAB</span></div><div className="grid gap-4 lg:grid-cols-3">{learningApps.map((app) => <LearningAppCard app={app} key={app.id} />)}</div><div className="ecosystem-rail" aria-label="未來 AI 應用生態系"><span>STK / ENG / JP</span><i /><span>SEEDANCE LAB</span><i /><span>VOICE STUDIO</span><i /><span>AI VIDEO STUDIO</span></div></section>
    <section aria-labelledby="categories" className="creator-categories-section"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-cyan-200/75">Creator Categories</p><h2 id="categories" className="mt-2 text-2xl font-semibold text-white">探索你的創作路徑</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">從 AI、影音、課程到生活管理，選擇下一個值得投入的主題。</p></div><span className="text-xs tracking-[0.18em] text-slate-500">06 DIRECTIONS</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{creatorCategories.map((category) => <CreatorCategoryCard category={category} key={category.id} />)}</div></section>
    <MembershipPreview />
    <section className="mt-16 grid gap-4 lg:grid-cols-2"><div className="glass rounded-2xl p-6"><p className="eyebrow">Latest tutorial</p><h2 className="mt-3 text-2xl font-semibold">Seedance 2.0｜真人 × 動漫分身房屋介紹</h2><p className="mt-3 text-sm leading-6 text-slate-300">完整英文 Prompt、5 段分鏡與可下載 PDF 的 AI 影音教學。</p><Link href="/ai-tutorials/seedance-2-real-anime-home-tour" className="mt-5 inline-block cursor-pointer text-sm font-semibold text-cyan-300 transition hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">閱讀教學 →</Link></div><div className="glass rounded-2xl p-6"><p className="eyebrow">Popular resources</p><h2 className="mt-3 text-2xl font-semibold">免費資源庫</h2><p className="mt-3 text-sm leading-6 text-slate-300">精選工具、模板與下載素材，將逐步開放。</p><Link href="/resources" className="mt-5 inline-block cursor-pointer text-sm font-semibold text-cyan-300 transition hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">查看資源 →</Link></div></section>
    </div>
  </div>;
}
