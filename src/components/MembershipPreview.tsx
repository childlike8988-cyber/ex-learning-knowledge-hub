import Link from "next/link";

const guestFeatures = ["免費資源", "公開教學", "免費工具"];
const memberFeatures = ["更多課程", "個人收藏", "使用紀錄"];
const creatorFeatures = ["AI 剪輯", "AI 生片", "AI 工具中心"];

function FeatureList({ items }: { items: readonly string[] }) {
  return <ul className="membership-preview__list">{items.map((item) => <li key={item}><span aria-hidden="true">✦</span>{item}</li>)}</ul>;
}

export function MembershipPreview() {
  return <section id="membership" aria-labelledby="membership-heading" className="membership-preview">
    <div className="membership-preview__intro"><p className="eyebrow">Creator Access / Future Layer</p><h2 id="membership-heading">從免費學習，逐步進入創作中心</h2><p>先使用公開內容建立創作節奏；未來登入後，可延伸到收藏、紀錄、更多課程與 AI 生產工具。</p><div className="membership-preview__journey" aria-label="訪客到創作中心的產品路徑"><span>訪客</span><b>→</b><span>免費內容</span><b>→</b><span>會員功能</span><b>→</b><span className="is-active">AI Production Center</span></div></div>
    <div className="membership-preview__grid">
      <div className="membership-card membership-card--guest"><div className="membership-card__heading"><span className="membership-card__icon">01</span><div><p>GUEST ACCESS</p><h3>目前可直接開始</h3></div></div><FeatureList items={guestFeatures} /><Link href="/resources" className="membership-card__cta">探索免費內容 <span aria-hidden="true">→</span></Link></div>
      <div className="membership-card membership-card--member"><div className="membership-card__heading"><span className="membership-card__icon">02</span><div><p>MEMBER SPACE</p><h3>登入後的工作區</h3></div></div><FeatureList items={memberFeatures} /><Link href="/#membership" className="membership-card__cta">登入入口（即將開放） <span aria-hidden="true">↗</span></Link></div>
      <div className="membership-card membership-card--creator"><div className="membership-card__heading"><span className="membership-card__icon">03</span><div><p>CREATOR PASS</p><h3>AI 生產工具中心</h3></div></div><FeatureList items={creatorFeatures} /><Link href="/#membership" className="membership-card__cta">查看訂閱方向 <span aria-hidden="true">↗</span></Link></div>
    </div>
    <p className="membership-preview__note">登入、點數與訂閱為產品化規劃入口；本階段尚未連接帳號、付款或 AI API。</p>
  </section>;
}
