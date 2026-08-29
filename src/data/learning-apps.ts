export type LearningAppId = "ai-pulse" | "market-radar" | "realty-data-tools" | "stock" | "english" | "japanese";

export type LearningApp = {
  id: LearningAppId;
  shortCode: "AI" | "MR" | "RE" | "STK" | "ENG" | "JP";
  title: string;
  englishTitle: string;
  description: string;
  href: string;
  category: string;
  external: boolean;
  previewImage: string;
  previewAlt: string;
  previewKind?: "market-radar";
  ctaLabel: string;
  tags?: readonly string[];
  features: readonly string[];
};

export const learningApps: readonly LearningApp[] = [
  {
    id: "ai-pulse",
    shortCode: "AI",
    title: "AI 脈動",
    englishTitle: "AI Pulse Brief",
    description: "每日整理 AI 產業動態、工具更新與重要趨勢，快速掌握最新脈動。",
    href: "https://ai-pulse-brief-2026.childlike8988.chatgpt.site/",
    category: "AI 脈動",
    external: true,
    previewImage: "/images/learning-apps/ai-pulse-preview.png",
    previewAlt: "AI 脈動的青藍與紫色資料流預覽圖",
    ctaLabel: "開啟 AI 快報",
    tags: ["AI NEWS", "TREND", "BRIEF"],
    features: ["AI 產業動態", "工具更新摘要", "重要趨勢追蹤"],
  },
  {
    id: "market-radar",
    shortCode: "MR",
    title: "E.X MARKET RADAR",
    englishTitle: "Housing Market Intelligence",
    description: "高雄房市重點、區域趨勢、政策、房貸與實價資訊整理。",
    href: "/market-radar/",
    category: "高雄房市快報",
    external: false,
    previewImage: "",
    previewAlt: "E.X MARKET RADAR 的高雄房市快報資料視覺預覽",
    previewKind: "market-radar",
    ctaLabel: "查看房市快報",
    tags: ["KAOHSIUNG", "MARKET", "BRIEF"],
    features: ["每日市場摘要", "區域趨勢整理", "Pro 報告預覽"],
  },
  {
    id: "realty-data-tools",
    shortCode: "RE",
    title: "E.X Realty Data Tools",
    englishTitle: "Real Price Explorer",
    description: "AI 輔助房地產資料分析工具展示中心。",
    href: "https://childlike8988-cyber.github.io/E.X-Realty-Operations-Hub/",
    category: "Real Estate AI Tools",
    external: true,
    previewImage: "/images/learning-apps/realty-data-tools-preview.png",
    previewAlt: "深藍紫色房地產資料儀表板、地圖與成交分析圖表視覺",
    ctaLabel: "開啟展示工具",
    tags: ["REAL ESTATE", "AI TOOLS", "DEMO"],
    features: ["實價登錄查詢（展示版）", "房市行情分析", "未來學區生活機能分析"],
  },
  {
    id: "stock",
    shortCode: "STK",
    title: "股票視覺學習",
    englishTitle: "Stock Visual Academy",
    description: "用圖像與互動方式理解股票基礎。",
    href: "https://stock-visual-academy.vercel.app/",
    category: "股票學習",
    external: true,
    previewImage: "/images/learning-apps/stk-preview.png",
    previewAlt: "股票視覺學習的圖表與資料卡預覽圖",
    ctaLabel: "開始學習",
    features: ["視覺化基礎觀念", "互動式學習節奏", "適合建立投資入門知識"],
  },
  {
    id: "english",
    shortCode: "ENG",
    title: "Little Star English",
    englishTitle: "Little Star English",
    description: "適合兒童使用的情境式英文互動練習。",
    href: "https://little-star-english.childlike8988.chatgpt.site/",
    category: "英文學習",
    external: true,
    previewImage: "/images/learning-apps/eng-preview.png",
    previewAlt: "Little Star English 的互動學習預覽圖",
    ctaLabel: "開始學習",
    features: ["兒童友善互動", "情境式英文練習", "容易開始的學習體驗"],
  },
  {
    id: "japanese",
    shortCode: "JP",
    title: "Japanese Kana Adventure",
    englishTitle: "Japanese Kana Adventure",
    description: "透過互動方式學習日文五十音與假名。",
    href: "https://jp-kana-adventure-z54t.vercel.app/",
    category: "日文學習",
    external: true,
    previewImage: "/images/learning-apps/jp-preview.png",
    previewAlt: "Japanese Kana Adventure 的假名冒險預覽圖",
    ctaLabel: "開始學習",
    features: ["五十音與假名練習", "互動式關卡體驗", "適合持續複習"],
  },
];

export function getLearningApp(id: LearningAppId): LearningApp {
  const app = learningApps.find((item) => item.id === id);
  if (!app) throw new Error(`Unknown learning app: ${id}`);
  return app;
}
