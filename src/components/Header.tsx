import Link from "next/link";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
      <Link href="/" className="text-sm font-bold tracking-[0.22em] text-white">E.X <span className="text-cyan-300">HUB</span></Link>
      <nav aria-label="主要導覽" className="flex gap-4 text-xs text-slate-300 sm:gap-6">
        <Link href="/ai-tutorials" className="transition hover:text-white">探索</Link>
        <Link href="/resources" className="transition hover:text-white">資源</Link>
        <Link href="/about" className="transition hover:text-white">關於</Link>
      </nav>
    </header>
  );
}
