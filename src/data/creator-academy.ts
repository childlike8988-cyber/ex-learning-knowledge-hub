export type CreatorAcademyCategoryId =
  | "ai-visual-creation"
  | "photography-composition"
  | "video-production";

export type CreatorAcademyAccess = "free" | "pro";
export type CreatorAcademyLevel = "基礎" | "入門" | "進階";

export type CreatorAcademyCourse = {
  id: string;
  title: string;
  subtitle: string;
  category: CreatorAcademyCategoryId;
  description: string;
  thumbnail: string;
  level: CreatorAcademyLevel;
  access: CreatorAcademyAccess;
  href?: string;
};

export type CreatorAcademyCategory = {
  id: CreatorAcademyCategoryId;
  title: string;
  englishTitle: string;
  description: string;
  thumbnail: string;
  tone: "cyan" | "purple" | "gold";
};

const creatorStudioThumbnail = "/images/creator-studio/hero-showcase-v1.png";

export const creatorAcademyCategories: readonly CreatorAcademyCategory[] = [
  {
    id: "ai-visual-creation",
    title: "AI 視覺創作",
    englishTitle: "AI Visual Creation",
    description: "從生圖、角色視覺到 AI 影片運鏡，建立可重複的創作流程。",
    thumbnail: creatorStudioThumbnail,
    tone: "cyan",
  },
  {
    id: "photography-composition",
    title: "攝影美學構圖",
    englishTitle: "Photography Composition",
    description: "理解畫面比例、視覺動線與電影感構圖，提升影像表達力。",
    thumbnail: creatorStudioThumbnail,
    tone: "purple",
  },
  {
    id: "video-production",
    title: "影像拍攝技巧",
    englishTitle: "Video Production",
    description: "從基礎運鏡到 Creator Film Lab，逐步建立影像拍攝能力。",
    thumbnail: creatorStudioThumbnail,
    tone: "gold",
  },
];

export const creatorAcademyCourses: readonly CreatorAcademyCourse[] = [
  {
    id: "yuni-ai-image-basics",
    title: "YUNI AI 生圖基礎",
    subtitle: "從構想到第一張完整 AI 視覺",
    category: "ai-visual-creation",
    description: "認識提示詞、構圖與風格控制，建立清楚的 AI 生圖起點。",
    thumbnail: creatorStudioThumbnail,
    level: "基礎",
    access: "free",
    href: "/creator-academy/ai-visual-creation/yuni-ai-image-basics",
  },
  {
    id: "yuni-ai-camera-movement",
    title: "YUNI AI 影片運鏡入門",
    subtitle: "讓 AI 影片鏡頭更自然、更有節奏",
    category: "ai-visual-creation",
    description: "整理推、拉、搖、移與跟拍概念，建立 AI 影片的鏡頭語言。",
    thumbnail: creatorStudioThumbnail,
    level: "入門",
    access: "free",
  },
  {
    id: "ai-director-masterclass",
    title: "AI Director Masterclass",
    subtitle: "從創意企劃到完整 AI 影像導演流程",
    category: "ai-visual-creation",
    description: "進階整合角色、分鏡、運鏡與視覺一致性的導演級工作流。",
    thumbnail: creatorStudioThumbnail,
    level: "進階",
    access: "pro",
  },
  {
    id: "yuni-composition-basics",
    title: "YUNI 基礎構圖法",
    subtitle: "用簡單原則整理畫面視覺重點",
    category: "photography-composition",
    description: "練習三分法、留白、前中後景與視覺動線的基礎應用。",
    thumbnail: creatorStudioThumbnail,
    level: "基礎",
    access: "free",
  },
  {
    id: "cinematic-composition",
    title: "Cinematic Composition",
    subtitle: "建立具有情緒與敘事感的電影構圖",
    category: "photography-composition",
    description: "運用景別、層次、光線與色彩關係，強化畫面敘事。",
    thumbnail: creatorStudioThumbnail,
    level: "進階",
    access: "pro",
  },
  {
    id: "yuni-camera-techniques",
    title: "YUNI 基礎運鏡技巧",
    subtitle: "拍出穩定、清楚而有目的的鏡頭",
    category: "video-production",
    description: "從手持穩定、移動節奏與鏡頭銜接開始練習實拍運鏡。",
    thumbnail: creatorStudioThumbnail,
    level: "基礎",
    access: "free",
  },
  {
    id: "creator-film-lab",
    title: "Creator Film Lab",
    subtitle: "整合拍攝、場面調度與作品實驗",
    category: "video-production",
    description: "以創作專題練習鏡頭設計、拍攝執行與作品檢視。",
    thumbnail: creatorStudioThumbnail,
    level: "進階",
    access: "pro",
  },
];

export function getCreatorAcademyCourses(category: CreatorAcademyCategoryId) {
  return creatorAcademyCourses.filter((course) => course.category === category);
}
