export function CreatorStudioHero() {
  return (
    <section className="creator-hero" aria-labelledby="creator-studio-heading">
      <div className="creator-hero__aurora" aria-hidden="true" />
      <div className="creator-hero__grid" aria-hidden="true" />
      <div className="creator-hero__inner">
        <div className="creator-hero__content">
          <p className="creator-hero__eyebrow">AI CREATIVE CENTER × CREATOR ACADEMY</p>
          <h1 id="creator-studio-heading" className="creator-hero__title">
            <span>E.X AI 創作中心</span>
            <span className="creator-hero__title-accent">× 創作者學院</span>
          </h1>
          <p className="creator-hero__description">整合 AI 創作、短影音製作與系統化學習的專業平台，陪伴從靈感到作品，持續創造影響力。</p>

          <div className="creator-search" role="search">
            <label className="sr-only" htmlFor="creator-site-search">搜尋課程、資源與創作主題</label>
            <svg aria-hidden="true" className="creator-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.3 4.3" /></svg>
            <input id="creator-site-search" type="search" placeholder="搜尋課程、資源與創作主題" />
            <span className="creator-search__status" aria-hidden="true">EXPLORE</span>
          </div>

          <p className="creator-hero__ticker" aria-label="AI、影音、創作者、課程、資源與生活管理分類">AI · VIDEO · CREATOR · COURSES · RESOURCES · HEALTH</p>
        </div>

        <div className="creator-hero__visual" aria-hidden="true">
          <div className="creator-hero__visual-glow" />
          <div className="creator-hero__panel creator-hero__panel--back"><span>CREATIVE<br />SYSTEMS</span></div>
          <div className="creator-hero__panel creator-hero__panel--main">
            <div className="creator-hero__panel-head"><span className="creator-hero__signal" /> STUDIO / LIVE</div>
            <div className="creator-hero__panel-lines"><i /><i /><i /><i /></div>
            <div className="creator-hero__panel-orb" />
            <div className="creator-hero__panel-footer"><span>AI</span><span>VIDEO</span><span>IDEAS</span></div>
          </div>
          <div className="creator-hero__camera"><span /><i /></div>
          <div className="creator-hero__tag">FROM IDEA<br />TO IMPACT</div>
        </div>
      </div>
    </section>
  );
}
