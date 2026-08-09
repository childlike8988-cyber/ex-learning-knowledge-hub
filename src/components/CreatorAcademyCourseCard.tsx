import Image from "next/image";
import Link from "next/link";
import type { CreatorAcademyCourse } from "@/data/creator-academy";
import { publicAssetPath } from "@/lib/paths";

export function CreatorAcademyCourseCard({ course }: { course: CreatorAcademyCourse }) {
  const isPro = course.access === "pro";
  const isAvailable = !isPro && Boolean(course.href);

  return (
    <article className="group flex min-h-[27rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/35 focus-within:border-cyan-200/45">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
        <Image src={publicAssetPath(course.thumbnail)} alt={`${course.title} 的 YUNI 示範圖預留位置`} width={1200} height={750} unoptimized className="h-full w-full object-cover opacity-55 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-violet-950/15" />
        <span className="absolute left-4 top-4 rounded-full border border-cyan-200/30 bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-cyan-100">YUNI DEMO</span>
        <span className={`absolute right-4 top-4 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] ${isPro ? "border-amber-300/35 bg-amber-300/10 text-amber-100" : "border-cyan-200/35 bg-cyan-300/10 text-cyan-100"}`}>{isPro ? "PRO" : "FREE"}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{course.level} · Creator Academy</p>
        <h3 className="mt-3 text-xl font-semibold text-white">{course.title}</h3>
        <p className="mt-2 text-sm font-medium text-cyan-100">{course.subtitle}</p>
        <p className="mt-4 text-sm leading-6 text-slate-300">{course.description}</p>
        {isAvailable ? <Link href={course.href!} className="mt-auto inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-300/15 px-5 py-3 text-sm font-bold text-cyan-50 transition hover:border-cyan-100 hover:bg-cyan-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">查看課程 →</Link> : <button type="button" disabled aria-disabled="true" className={`mt-auto min-h-12 cursor-not-allowed rounded-full border px-5 py-3 text-sm font-bold ${isPro ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"}`}>{isPro ? "🔒 會員專屬內容" : "查看課程（內容建置中）"}</button>}
      </div>
    </article>
  );
}
