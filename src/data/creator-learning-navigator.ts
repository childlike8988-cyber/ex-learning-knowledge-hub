export type CreatorLearningNavigatorItem = {
  id: string;
  index: string;
  title: string;
  englishTitle: string;
  description: string;
  href?: string;
  comingSoon?: boolean;
};

export const creatorLearningNavigatorItems: CreatorLearningNavigatorItem[] = [
  { id: "quick-start", index: "01", title: "平台快速上手", englishTitle: "Quick Start", description: "快速了解 E.X Creator Studio 與 Creator Academy。", comingSoon: true },
  { id: "ai-creation", index: "02", title: "AI 創作教學", englishTitle: "AI Creation", description: "AI 生圖、提示詞與影像生成基礎。", href: "/creator-academy/ai-visual-creation/yuni-ai-image-basics/" },
  { id: "video-motion", index: "03", title: "影音運鏡教學", englishTitle: "Video Motion", description: "Push In、Pull Out、Pan、Tilt、Tracking、Orbit。", href: "/creator-academy/video-production/yuni-camera-movement-basics/" },
  { id: "photography", index: "04", title: "攝影構圖美學", englishTitle: "Photography", description: "三分法、引導線、框景與電影感構圖。", href: "/creator-academy/photography-composition/yuni-composition-basics/" },
  { id: "creator-toolkit", index: "05", title: "YUNI 創作工具箱", englishTitle: "Creator Toolkit", description: "提示詞、運鏡示範與拍攝資源。", href: "/creator-academy/resources/" },
  { id: "creator-pro", index: "06", title: "專業創作者", englishTitle: "Creator Pro", description: "AI Director、商業影片與進階工作流預覽。", comingSoon: true },
];
