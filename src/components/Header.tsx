import Link from "next/link";

export function Header() {
  return (
    <header className="creator-header">
      <div className="creator-header__inner">
        <Link href="/" className="creator-brand" aria-label="E.X Creator Studio 首頁"><span className="creator-brand__mark">E.X</span><span className="creator-brand__name">CREATOR STUDIO</span></Link>
        <nav aria-label="主要導覽" className="creator-header__nav">
          <Link href="/ai-tutorials">探索</Link>
          <Link href="/video-production">課程</Link>
          <Link href="/resources">資源</Link>
          <Link href="/about">關於</Link>
        </nav>
        <details className="creator-mobile-nav">
          <summary aria-label="開啟主要導覽"><span /><span /><span /></summary>
          <nav aria-label="手機主要導覽" className="creator-mobile-nav__panel">
            <Link href="/ai-tutorials">探索</Link>
            <Link href="/video-production">課程</Link>
            <Link href="/resources">資源</Link>
            <Link href="/about">關於</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
