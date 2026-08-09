export type CreatorResourceCategory =
  | "ai-visual-creation"
  | "video-production"
  | "camera-recording-basics";

export type CreatorResourceType = "image" | "video" | "prompt" | "article" | "pdf";
export type CreatorResourceAccess = "free" | "pro";
export type CreatorResourceStatus = "source-only" | "planned" | "ready";

export type CreatorResource = {
  id: string;
  category: CreatorResourceCategory;
  title: string;
  englishTitle?: string;
  description: string;
  type: CreatorResourceType;
  access: CreatorResourceAccess;
  sourcePath: string;
  publicImagePath?: string;
  publicVideoSources?: readonly { src: string; type: "video/mp4" | "video/webm" }[];
  sourceFormat?: "png" | "mp4" | "mov";
  status: CreatorResourceStatus;
  content: { summary: string; topics: readonly string[]; sourceCount?: number };
};

export type CreatorResourceCollection = {
  id: string;
  category: CreatorResourceCategory;
  title: string;
  englishTitle: string;
  description: string;
  types: readonly CreatorResourceType[];
  freeCount: number;
  proCount: number;
  sourcePath: string;
};

const motionDefinitions = [
  ["push-in", "推近", "Push In", "PUSH-in.mp4"],
  ["pull-out", "拉遠", "Pull Out", "Pull-out.mp4"],
  ["pan", "平移", "Pan", "PAN.mp4"],
  ["tilt", "升降", "Tilt", "TILT.mp4"],
  ["tracking", "跟拍", "Tracking", "tracking.mp4"],
  ["orbit", "環繞", "Orbit", "Orbit.mp4"],
] as const;

export const creatorCameraMotionResources: readonly CreatorResource[] = motionDefinitions.map(([id, title, englishTitle, sourceFile]) => ({
  id: `yuni-camera-motion-${id}`,
  category: "video-production",
  title,
  englishTitle,
  description: `YUNI ${title}運鏡示範，可對照 AI Video Prompt 的 Camera Motion 寫法。`,
  type: "video",
  access: "free",
  sourcePath: `yuni/motion/${sourceFile}`,
  publicVideoSources: [{ src: `/videos/creator-academy/yuni/${id}.mp4`, type: "video/mp4" }],
  sourceFormat: "mp4",
  status: "ready",
  content: { summary: "以無聲循環預覽觀察鏡頭節奏與畫面關係。", topics: [title, englishTitle, "AI Video Prompt"] },
}));

const advancedPromptResources: readonly CreatorResource[] = Array.from({ length: 20 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `yuni-advanced-prompt-${number}`,
    category: "ai-visual-creation",
    title: `進階提示詞 ${number}`,
    englishTitle: `Advanced Prompt ${number}`,
    description: "進階 YUNI 圖像提示詞素材，保留為會員專屬內容預覽。",
    type: "prompt",
    access: "pro",
    sourcePath: `yuni/Image/${number}.png`,
    status: "source-only",
    content: { summary: "未公開原始素材；此處僅提供會員分層與未來展示結構。", topics: ["YUNI", "Advanced Prompt", `Prompt ${number}`] },
  };
});

export const creatorResources: readonly CreatorResource[] = [
  {
    id: "yuni-recording-basics",
    category: "camera-recording-basics",
    title: "拍攝基礎技巧",
    englishTitle: "Recording Basics",
    description: "從畫面穩定、構圖、光線、收音與設備差異，建立可靠的錄影習慣。",
    type: "article",
    access: "free",
    sourcePath: "yuni/錄影要素.png",
    publicImagePath: "/images/creator-academy/yuni/recording-stability-basics.png",
    sourceFormat: "png",
    status: "ready",
    content: { summary: "以既有 YUNI 圖解作為拍攝與錄影基礎查詢卡。", topics: ["穩定", "構圖", "光線", "收音", "設備差異"], sourceCount: 1 },
  },
  {
    id: "yuni-ai-image-prompt-basic-a",
    category: "ai-visual-creation",
    title: "基礎提示詞 A",
    englishTitle: "Basic Prompt A",
    description: "YUNI AI 生圖基礎提示詞，練習人物、場景與鏡頭的基本控制。",
    type: "prompt",
    access: "free",
    sourcePath: "yuni/Image/基本A.png",
    publicImagePath: "/images/creator-academy/yuni/basic-prompt-a.png",
    sourceFormat: "png",
    status: "ready",
    content: { summary: "公開的 Free Prompt 示範。", topics: ["Character", "Scene", "Camera"] },
  },
  {
    id: "yuni-ai-image-prompt-basic-b",
    category: "ai-visual-creation",
    title: "基礎提示詞 B",
    englishTitle: "Basic Prompt B",
    description: "YUNI AI 生圖基礎提示詞，練習外觀、光線與構圖的控制。",
    type: "prompt",
    access: "free",
    sourcePath: "yuni/Image/基本B.png",
    publicImagePath: "/images/creator-academy/yuni/basic-prompt-b.png",
    sourceFormat: "png",
    status: "ready",
    content: { summary: "公開的 Free Prompt 示範。", topics: ["Appearance", "Lighting", "Composition"] },
  },
  ...advancedPromptResources,
  {
    id: "yuni-camera-motion-basics",
    category: "video-production",
    title: "AI 運鏡示範庫",
    englishTitle: "Camera Motion Library",
    description: "整理六種基礎鏡頭移動，作為影片課程完成後的查詢工具。",
    type: "video",
    access: "free",
    sourcePath: "yuni/motion/",
    status: "source-only",
    content: { summary: "對照 YUNI 動作素材與 AI Video Prompt 的 Camera Motion。", topics: ["Push In", "Pull Out", "Pan", "Tilt", "Tracking", "Orbit"], sourceCount: 6 },
  },
  ...creatorCameraMotionResources,
  {
    id: "advanced-camera-motion",
    category: "video-production",
    title: "進階運鏡控制",
    englishTitle: "Advanced Camera Motion",
    description: "連續運鏡與 AI Video Prompt 的進階規劃預留內容。",
    type: "video",
    access: "pro",
    sourcePath: "yuni/motion/",
    status: "planned",
    content: { summary: "Pro 內容預留，尚未公開原始素材。", topics: ["Motion Sequencing", "Camera Prompt", "Shot Planning"] },
  },
];

export const creatorResourceCollections: readonly CreatorResourceCollection[] = [
  { id: "ai-visual-creation-resources", category: "ai-visual-creation", title: "AI 生圖提示詞庫", englishTitle: "AI Prompt Library", description: "提供基礎提示詞與進階 Prompt Library 的課後查詢入口。", types: ["image", "prompt"], freeCount: 2, proCount: 20, sourcePath: "yuni/Image/" },
  { id: "video-production-resources", category: "video-production", title: "AI 運鏡示範庫", englishTitle: "Camera Motion Library", description: "整理 YUNI 運鏡示範與 AI Video Prompt 對照方式。", types: ["video", "prompt"], freeCount: 6, proCount: 1, sourcePath: "yuni/motion/" },
  { id: "camera-recording-basics-resources", category: "camera-recording-basics", title: "拍攝基礎技巧", englishTitle: "Recording Basics", description: "從穩定、構圖、光線、收音到設備差異建立錄影基礎。", types: ["image", "article"], freeCount: 1, proCount: 0, sourcePath: "yuni/錄影要素.png" },
];

export const creatorAcademyPublicAssetSlots = {
  images: "/images/creator-academy/yuni/",
  videos: "/videos/creator-academy/yuni/",
} as const;
