export type LearningAppId = "stock" | "english" | "japanese";

export type LearningApp = {
  id: LearningAppId;
  shortCode: "STK" | "ENG" | "JP";
  title: string;
  englishTitle: string;
  description: string;
  href: string;
  category: string;
  external: true;
  previewImage: string;
  previewAlt: string;
  features: readonly string[];
};

export const learningApps: readonly LearningApp[] = [
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
    features: ["五十音與假名練習", "互動式關卡體驗", "適合持續複習"],
  },
];

export function getLearningApp(id: LearningAppId): LearningApp {
  const app = learningApps.find((item) => item.id === id);
  if (!app) throw new Error(`Unknown learning app: ${id}`);
  return app;
}
