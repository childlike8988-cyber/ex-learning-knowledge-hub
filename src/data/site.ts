export type Category = {
  title: string;
  description: string;
  href: string;
  label: string;
};

export const categories: Category[] = [
  { title: "AI 教學", description: "把 AI 變成可複製的工作流程。", href: "/ai-tutorials", label: "AI" },
  { title: "影音製作", description: "從構想、腳本到發佈的創作方法。", href: "/video-production", label: "VID" },
  { title: "生活管理", description: "從運動、情緒與早餐開始，建立能長期維持的生活節奏。", href: "/life-management", label: "LIFE" },
  { title: "免費資源", description: "工具、模板與精選下載集合。", href: "/resources", label: "FREE" },
  { title: "股票學習", description: "投資知識的基礎入口。", href: "/stock-learning", label: "STK" },
  { title: "英文學習", description: "為真實溝通建立每日練習。", href: "/english-learning", label: "ENG" },
  { title: "日文學習", description: "從發音到情境表達的學習地圖。", href: "/japanese-learning", label: "JP" },
];
