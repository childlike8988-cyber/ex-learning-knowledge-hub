const academyHeroStatuses = [
  ["AI 圖像生成完成 ✓", "AI Image Generated"],
  ["運鏡分析完成 ✓", "Camera Motion"],
  ["提示詞準備完成 ✓", "Prompt Ready"],
  ["AI 創作流程啟動 ✓", "Creative Workflow"],
] as const;

export function CreatorAcademyHeroStatus() {
  return <div aria-label="AI 創作流程狀態" className="academy-hero-status">{academyHeroStatuses.map(([title, subtitle], index) => <div className="academy-hero-status__item" key={title} style={{ animationDelay: `${index * 4}s` }}><p>{title}</p><span>{subtitle}</span></div>)}</div>;
}

