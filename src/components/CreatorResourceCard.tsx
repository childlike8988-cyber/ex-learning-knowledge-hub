import Image from "next/image";
import type { CreatorResource } from "@/data/creator-resources";
import { publicAssetPath } from "@/lib/paths";

export function CreatorResourceCard({ resource }: { resource: CreatorResource }) {
  const isPro = resource.access === "pro";

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur-xl">
      {resource.publicImagePath ? (
        <div className="relative aspect-[4/5] overflow-hidden border-b border-white/10 bg-slate-950/60">
          <Image src={publicAssetPath(resource.publicImagePath)} alt={`${resource.title} 預覽圖`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized className="object-contain p-3 transition duration-300 group-hover:scale-[1.02]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/70 to-transparent" aria-hidden="true" />
        </div>
      ) : (
        <div className="flex aspect-[4/5] items-center justify-center border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.18),transparent_45%),rgba(2,6,23,0.7)] p-6 text-center">
          <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-slate-300">{isPro ? "MEMBERS ONLY" : "RESOURCE PREVIEW"}</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold tracking-[0.14em] text-cyan-200">{resource.type.toUpperCase()}</span><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] ${isPro ? "border-amber-300/35 bg-amber-300/10 text-amber-100" : "border-cyan-200/35 bg-cyan-300/10 text-cyan-100"}`}>{isPro ? "PRO" : "FREE"}</span></div>
        <h3 className="mt-3 text-lg font-semibold text-white">{resource.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{isPro ? "會員專屬內容" : resource.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">{resource.content.topics.map((topic) => <span className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[10px] font-medium text-slate-300" key={topic}>{topic}</span>)}</div>
      </div>
    </article>
  );
}

