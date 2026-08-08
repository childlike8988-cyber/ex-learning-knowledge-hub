export type CreatorGateway = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  detail: string;
};

export const creatorGateways: readonly CreatorGateway[] = [
  {
    id: "seedance-lab",
    eyebrow: "AI VIDEO",
    title: "Seedance Lab",
    description: "從 Prompt、分鏡到一支可分享的 AI 影片。",
    href: "/ai-tutorials/seedance-2-real-anime-home-tour",
    detail: "公開教學 / 15 秒影片",
  },
  {
    id: "learning-hub",
    eyebrow: "LEARNING HUB",
    title: "Learning Hub",
    description: "把工具、方法與練習，整理成可持續的創作路徑。",
    href: "/ai-tutorials",
    detail: "公開課程 / 即刻開始",
  },
  {
    id: "creator-system",
    eyebrow: "AI TOOL",
    title: "Creator System",
    description: "探索能縮短從靈感到作品距離的 AI 工具入口。",
    href: "/resources",
    detail: "工具資源 / 持續擴充",
  },
  {
    id: "voice-studio",
    eyebrow: "VOICE STUDIO",
    title: "Voice Studio",
    description: "為未來的聲音、配音與內容工作流預留位置。",
    href: "/video-production",
    detail: "產品預告 / 即將開放",
  },
];

export type CreatorCategory = {
  id: string;
  code: string;
  title: string;
  description: string;
  href: string;
  previewImage: string;
  previewAlt: string;
  tone: "cyan" | "purple" | "gold" | "green";
};

export const creatorCategories: readonly CreatorCategory[] = [
  { id: "ai", code: "AI", title: "AI 教學", description: "把 AI 變成可複製的工作流程。", href: "/ai-tutorials", previewImage: "/images/creator-studio/hero-showcase-v1.png", previewAlt: "AI 創作工作室的多螢幕監看牆", tone: "cyan" },
  { id: "video", code: "VIDEO", title: "影音製作", description: "從構想、腳本到發佈的創作方法。", href: "/video-production", previewImage: "/images/creator-studio/hero-showcase-v1.png", previewAlt: "剪輯工作站與攝影機的創作場景", tone: "purple" },
  { id: "creator", code: "CREATOR", title: "Creator System", description: "建立從靈感、工具到作品的個人創作系統。", href: "/about", previewImage: "/images/creator-studio/hero-showcase-v1.png", previewAlt: "Creator Studio 的 AI 影像工作站", tone: "gold" },
  { id: "courses", code: "COURSES", title: "創作者學院", description: "以清楚的課程路徑，逐步累積可使用的能力。", href: "/ai-tutorials", previewImage: "/images/learning-apps/eng-preview.png", previewAlt: "互動學習課程的預覽圖", tone: "cyan" },
  { id: "resources", code: "RESOURCES", title: "免費資源", description: "工具、模板與精選下載集合。", href: "/resources", previewImage: "/images/learning-apps/jp-preview.png", previewAlt: "互動資源入口的預覽圖", tone: "purple" },
  { id: "health", code: "HEALTH", title: "生活管理", description: "從運動、情緒與早餐開始，建立能長期維持的生活節奏。", href: "/life-management", previewImage: "/assets/life-management/yuni-weekly-exercise-options.png", previewAlt: "YUNI 每週追加運動示意圖", tone: "green" },
];
