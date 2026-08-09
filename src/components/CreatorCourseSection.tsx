import type { ReactNode } from "react";

export function CreatorCourseSection({ id, number, eyebrow, title, description, children }: { id: string; number: string; eyebrow: string; title: string; description?: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-white/10 py-12 sm:py-16"><div className="grid gap-6 lg:grid-cols-[10rem_minmax(0,1fr)]"><div><span className="text-5xl font-black tracking-tight text-cyan-200/15">{number}</span><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">{eyebrow}</p></div><div className="min-w-0"><h2 id={`${id}-title`} className="text-3xl font-semibold text-white sm:text-4xl">{title}</h2>{description ? <p className="mt-4 max-w-3xl leading-8 text-slate-300">{description}</p> : null}<div className="mt-7">{children}</div></div></div></section>;
}
