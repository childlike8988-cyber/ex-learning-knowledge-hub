"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { learningApps } from "@/data/learning-apps";
import { publicAssetPath } from "@/lib/paths";

const slides = [
  ...learningApps.map((app) => ({ id: app.id, code: app.shortCode, title: app.englishTitle, description: app.description, href: app.href, image: app.previewImage, alt: app.previewAlt, external: true })),
  { id: "seedance", code: "NEW", title: "Seedance 2.0 Tutorial", description: "真人 × 動漫分身房屋介紹：Prompt、分鏡與 PDF。", href: "/ai-tutorials/seedance-2-real-anime-home-tour", image: null, alt: "Seedance 2.0 教學導覽圖", external: false },
] as const;

export function HomeShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[active];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const visual = slide.image ? <Image src={publicAssetPath(slide.image)} alt={slide.alt} width={1600} height={900} unoptimized className="h-full w-full object-cover" /> : <div className="showcase-tutorial-art flex h-full items-end p-6"><span className="rounded-full border border-cyan-100/30 bg-slate-950/65 px-3 py-1 text-xs font-bold tracking-widest text-cyan-100">15S · 9:16 · AI VIDEO</span></div>;
  const body = <><div className="relative aspect-[16/10] overflow-hidden">{visual}<div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-cyan-100/30 bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-cyan-100">{slide.code}</span>{slide.external && <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold text-slate-200">EXTERNAL ↗</span>}</div><div className="p-5"><p className="text-xs font-bold tracking-[0.16em] text-cyan-300">FEATURED GATEWAY</p><h2 className="mt-2 text-2xl font-semibold text-white">{slide.title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-300">{slide.description}</p><span className="mt-4 inline-flex min-h-11 items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100 transition group-hover:bg-cyan-300 group-hover:text-slate-950">{slide.external ? "開始學習" : "閱讀教學"}<span aria-hidden="true" className="ml-2">↗</span></span></div></>;

  return <aside className="showcase-shell relative mx-auto w-full max-w-md" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}><div className="showcase-orbit" /><div className="showcase-scan" />{slide.external ? <a href={slide.href} target="_blank" rel="noopener noreferrer" className="glass group relative block cursor-pointer overflow-hidden rounded-[1.6rem] transition hover:-translate-y-1 hover:border-cyan-200/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">{body}<span className="sr-only">在新分頁開啟 {slide.title}</span></a> : <Link href={slide.href} className="glass group relative block cursor-pointer overflow-hidden rounded-[1.6rem] transition hover:-translate-y-1 hover:border-cyan-200/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">{body}</Link>}<div className="relative mt-4 flex items-center justify-between gap-3 px-2"><p className="text-xs text-slate-400">{paused ? "已暫停自動切換" : "每 5 秒探索下一個入口"}</p><div className="flex gap-2" aria-label="選擇重點入口">{slides.map((item, index) => <button type="button" key={item.id} aria-label={`切換至 ${item.title}`} aria-current={index === active} onClick={() => setActive(index)} className={`h-2.5 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 ${index === active ? "w-7 bg-cyan-300" : "w-2.5 bg-white/25 hover:bg-white/60"}`} />)}</div></div></aside>;
}
