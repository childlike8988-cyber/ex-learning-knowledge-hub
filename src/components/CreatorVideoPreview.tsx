import type { CreatorResource } from "@/data/creator-resources";
import { publicAssetPath } from "@/lib/paths";

export function CreatorVideoPreview({ resource }: { resource: CreatorResource }) {
  const sources = resource.publicVideoSources ?? [];
  const canPlay = sources.length > 0;

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur-xl">
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {canPlay ? <video autoPlay muted loop playsInline preload="metadata" aria-label={`${resource.title} 靜音循環預覽`} className="h-full w-full object-cover">{sources.map((source) => <source key={source.src} src={publicAssetPath(source.src)} type={source.type} />)}</video> : <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.25),transparent_42%),linear-gradient(135deg,rgba(8,24,55,0.9),rgba(2,6,23,0.96))] p-6 text-center"><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-amber-100">MOV SOURCE / CONVERSION PENDING</span></div>}
        <span className="absolute left-4 top-4 rounded-full border border-cyan-200/30 bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-cyan-100">CAMERA MOTION</span>
        {canPlay ? <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-slate-200">MUTED LOOP</span> : null}
      </div>
      <div className="p-5"><h3 className="text-xl font-semibold text-white">{resource.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{resource.description}</p><p className="mt-4 text-xs font-medium text-cyan-100">{canPlay ? "可播放 MP4／WebM 預覽，預設靜音。" : "原始 MOV 未修改；轉換完成後將提供 MP4 或 WebM 預覽。"}</p></div>
    </article>
  );
}

