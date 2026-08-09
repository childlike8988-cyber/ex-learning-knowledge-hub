import Link from "next/link";

export function CreatorAcademyPromo() {
  return (
    <section aria-labelledby="creator-academy-promo" className="mt-10 overflow-hidden rounded-[1.6rem] border border-violet-300/20 bg-[radial-gradient(circle_at_85%_0%,rgba(124,58,237,0.25),transparent_35%),linear-gradient(135deg,rgba(10,27,58,0.9),rgba(12,12,42,0.82))] p-6 shadow-[0_24px_70px_rgba(5,6,29,0.24)] sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">Creator Academy / YUNI</p>
          <h2 id="creator-academy-promo" className="mt-3 text-3xl font-bold text-white sm:text-4xl">從工具使用，走向完整創作能力</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">AI 視覺創作、攝影美學構圖與影像拍攝技巧，整理成 YUNI Creator Academy 的第一版學習路徑。</p>
        </div>
        <Link href="/creator-academy" className="inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/15 px-6 py-3 text-sm font-bold text-cyan-50 transition hover:border-cyan-200/70 hover:bg-cyan-300 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">進入 Creator Academy →</Link>
      </div>
    </section>
  );
}
