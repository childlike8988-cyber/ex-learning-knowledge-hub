export type CreatorLearningPathAccess = "free" | "pro";

export type CreatorLearningPathCourse = {
  id: string;
  title: string;
  href?: string;
};

export type CreatorLearningPathStage = {
  id: "starter" | "creator" | "pro";
  level: "初階" | "進階" | "專業";
  title: string;
  englishTitle: string;
  description: string;
  access: CreatorLearningPathAccess;
  courses: readonly CreatorLearningPathCourse[];
};

export const creatorLearningPath: readonly CreatorLearningPathStage[] = [
  {
    id: "starter",
    level: "初階",
    title: "初階創作者",
    englishTitle: "Beginner Creator",
    description: "建立 AI 與影像創作基礎。",
    access: "free",
    courses: [
      { id: "yuni-ai-image-basics", title: "YUNI AI 生圖基礎", href: "/creator-academy/ai-visual-creation/yuni-ai-image-basics" },
      { id: "yuni-composition-basics", title: "YUNI 基礎構圖法", href: "/creator-academy/photography-composition/yuni-composition-basics" },
    ],
  },
  {
    id: "creator",
    level: "進階",
    title: "視覺創作者",
    englishTitle: "Visual Creator",
    description: "掌握 AI 影片、運鏡與電影感影像。",
    access: "free",
    courses: [
      { id: "yuni-ai-video-motion-basics", title: "YUNI AI 影片運鏡入門", href: "/creator-academy/ai-visual-creation/yuni-ai-video-motion-basics" },
      { id: "yuni-camera-movement-basics", title: "YUNI 電影感運鏡基礎", href: "/creator-academy/video-production/yuni-camera-movement-basics" },
    ],
  },
  {
    id: "pro",
    level: "專業",
    title: "專業創作者",
    englishTitle: "AI Creator Pro",
    description: "進階 AI 導演與商業製作流程。",
    access: "pro",
    courses: [
      { id: "ai-director-masterclass", title: "AI Director Masterclass" },
      { id: "commercial-video-workflow", title: "Commercial Video Workflow" },
      { id: "advanced-prompt-library", title: "Advanced Prompt Library" },
    ],
  },
];

export const creatorRecommendedOrder = [
  "開始這裡 / Start Here",
  "AI 生圖 / AI Image",
  "構圖 / Composition",
  "AI 影片 / AI Video",
  "電影感運鏡 / Cinematic Motion",
] as const;
