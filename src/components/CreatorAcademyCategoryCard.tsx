import Image from "next/image";
import type { CreatorAcademyCategory } from "@/data/creator-academy";
import { getCreatorAcademyCourses } from "@/data/creator-academy";
import { publicAssetPath } from "@/lib/paths";

const toneClasses = {
  cyan: "border-cyan-300/20 from-cyan-400/20",
  purple: "border-violet-300/20 from-violet-400/20",
  gold: "border-amber-300/20 from-amber-300/20",
} as const;

export function CreatorAcademyCategoryCard({ category, priority = false }: { category: CreatorAcademyCategory; priority?: boolean }) {
  const courses = getCreatorAcademyCourses(category.id);
  const freeCount = courses.filter((course) => course.access === "free").length;
  const proCount = courses.length - freeCount;

  return (
    <a href={`#${category.id}`} className={`group overflow-hidden rounded-2xl border bg-gradient-to-b ${toneClasses[category.tone]} to-slate-950/55 shadow-[0_18px_55px_rgba(2,6,23,0.2)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200`}>
      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10">
        <Image src={publicAssetPath(category.thumbnail)} alt={`${category.title}分類的創作工作室預覽圖`} width={1200} height={675} priority={priority} unoptimized className="h-full w-full object-cover opacity-55 transition duration-300 group-hover:scale-[1.04] group-hover:opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
      </div>
      <div className="p-5">
        <p className="text-[10px] font-bold tracking-[0.16em] text-cyan-100/75">{category.englishTitle}</p>
        <h2 className="mt-2 text-xl font-semibold text-white">{category.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">{category.description}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold tracking-[0.1em]">
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-slate-200">{courses.length} COURSES</span>
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-cyan-100">{freeCount} FREE</span>
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-amber-100">{proCount} PRO</span>
        </div>
      </div>
    </a>
  );
}
