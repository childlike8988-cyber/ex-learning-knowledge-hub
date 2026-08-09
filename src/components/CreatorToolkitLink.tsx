import Link from "next/link";

export function CreatorToolkitLink({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return <section className="mb-8 rounded-3xl border border-cyan-200/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(124,58,237,0.1))] p-5 sm:p-6"><p className="text-[10px] font-bold tracking-[0.16em] text-cyan-200">相關工具箱 / CREATOR TOOLKIT</p><div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold text-white">{title}</h2><p className="mt-1 text-sm text-slate-300">{subtitle}</p></div><Link href={href} className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/10 px-5 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">前往工具箱 →</Link></div></section>;
}
