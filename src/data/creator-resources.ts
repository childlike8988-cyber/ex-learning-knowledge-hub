export type CreatorResourceCategory =
  | "ai-visual-creation"
  | "video-production"
  | "camera-recording-basics";

export type CreatorResourceType = "image" | "video" | "prompt" | "article" | "pdf";
export type CreatorResourceAccess = "free" | "pro";
export type CreatorResourceStatus = "source-only" | "planned" | "ready";

export type CreatorResourceContent = {
  summary: string;
  topics: readonly string[];
  sourceCount?: number;
};

export type CreatorResource = {
  id: string;
  category: CreatorResourceCategory;
  title: string;
  description: string;
  type: CreatorResourceType;
  access: CreatorResourceAccess;
  sourcePath: string;
  publicImagePath?: string;
  publicVideoSources?: readonly { src: string; type: "video/mp4" | "video/webm" }[];
  sourceFormat?: "png" | "mp4" | "mov";
  status: CreatorResourceStatus;
  content: CreatorResourceContent;
};

const motionResourceDefinitions: readonly {
  id: string;
  title: string;
  sourcePath: string;
  sourceFormat: "mp4" | "mov";
  publicPath?: string;
}[] = [
  { id: "push-in", title: "Push In", sourcePath: "yuni/motion/PUSH-in.mp4", sourceFormat: "mp4" as const, publicPath: "/videos/creator-academy/yuni/push-in.mp4" },
  { id: "pull-out", title: "Pull Out", sourcePath: "yuni/motion/Pull-out.mp4", sourceFormat: "mp4" as const, publicPath: "/videos/creator-academy/yuni/pull-out.mp4" },
  { id: "pan", title: "Pan", sourcePath: "yuni/motion/PAN.mp4", sourceFormat: "mp4" as const, publicPath: "/videos/creator-academy/yuni/pan.mp4" },
  { id: "tilt", title: "Tilt", sourcePath: "yuni/motion/TILT.mp4", sourceFormat: "mp4" as const, publicPath: "/videos/creator-academy/yuni/tilt.mp4" },
  { id: "tracking", title: "Tracking", sourcePath: "yuni/motion/tracking.mp4", sourceFormat: "mp4" as const, publicPath: "/videos/creator-academy/yuni/tracking.mp4" },
  { id: "orbit", title: "Orbit", sourcePath: "yuni/motion/Orbit.mp4", sourceFormat: "mp4" as const, publicPath: "/videos/creator-academy/yuni/orbit.mp4" },
];

export const creatorCameraMotionResources: readonly CreatorResource[] = motionResourceDefinitions.map((motion) => ({
  id: `yuni-camera-motion-${motion.id}`,
  category: "video-production",
  title: motion.title,
  description: `${motion.title} 的實拍運鏡示範，對應 AI Video Prompt 中的 Camera Motion。`,
  type: "video",
  access: "free",
  sourcePath: motion.sourcePath,
  publicVideoSources: motion.publicPath ? [{ src: motion.publicPath, type: "video/mp4" }] : undefined,
  sourceFormat: motion.sourceFormat,
  status: motion.publicPath ? "ready" : "planned",
  content: {
    summary: motion.publicPath ? "已建立靜音循環預覽；可作為實拍與 AI 運鏡語言的對照。" : "原始 MOV 保留不動；待轉換為公開可播放的 MP4 或 WebM。",
    topics: [motion.title, "Camera Motion", "AI Video Prompt"],
  },
}));

export type CreatorResourceCollection = {
  id: string;
  category: CreatorResourceCategory;
  title: string;
  description: string;
  types: readonly CreatorResourceType[];
  freeCount: number;
  proCount: number;
  sourcePath: string;
};

const advancedPromptResources: readonly CreatorResource[] = Array.from({ length: 20 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");

  return {
    id: `yuni-advanced-prompt-${number}`,
    category: "ai-visual-creation",
    title: `YUNI Advanced Prompt ${number}`,
    description: "進階 YUNI 圖像提示詞來源卡，待內容確認後再轉為公開的文字教學。",
    type: "prompt",
    access: "pro",
    sourcePath: `yuni/Image/${number}.png`,
    status: "source-only",
    content: {
      summary: "保留原始提示詞圖的來源索引；本輪不擷取、重寫或公開其中的內容。",
      topics: ["YUNI", "Advanced Prompt", `Prompt ${number}`],
    },
  };
});

export const creatorResources: readonly CreatorResource[] = [
  {
    id: "yuni-recording-basics",
    category: "camera-recording-basics",
    title: "錄影基礎知識",
    description: "手機與設備錄影的穩定、構圖、光線、收音與設備差異基礎。",
    type: "article",
    access: "free",
    sourcePath: "yuni/錄影要素.png",
    publicImagePath: "/images/creator-academy/yuni/recording-stability-basics.png",
    sourceFormat: "png",
    status: "ready",
    content: {
      summary: "來源圖聚焦手持拍攝的穩定原則，未來可拆分為短文、圖片卡與影片練習。",
      topics: ["穩定", "構圖", "光線", "收音", "設備差異"],
      sourceCount: 1,
    },
  },
  {
    id: "yuni-ai-image-prompt-basic-a",
    category: "ai-visual-creation",
    title: "YUNI AI 生圖基礎｜基本提示詞 A",
    description: "公開基礎提示詞來源，對應 YUNI AI 生圖基礎課程。",
    type: "prompt",
    access: "free",
    sourcePath: "yuni/Image/基本A.png",
    publicImagePath: "/images/creator-academy/yuni/basic-prompt-a.png",
    sourceFormat: "png",
    status: "ready",
    content: {
      summary: "待確認文字版與公開呈現方式後，作為 Free Prompt 卡片使用。",
      topics: ["Character", "Scene", "Camera"],
    },
  },
  {
    id: "yuni-ai-image-prompt-basic-b",
    category: "ai-visual-creation",
    title: "YUNI AI 生圖基礎｜基本提示詞 B",
    description: "公開基礎提示詞來源，對應 YUNI AI 生圖基礎課程。",
    type: "prompt",
    access: "free",
    sourcePath: "yuni/Image/基本B.png",
    publicImagePath: "/images/creator-academy/yuni/basic-prompt-b.png",
    sourceFormat: "png",
    status: "ready",
    content: {
      summary: "待確認文字版與公開呈現方式後，作為 Free Prompt 卡片使用。",
      topics: ["Appearance", "Lighting", "Composition"],
    },
  },
  ...advancedPromptResources,
  {
    id: "yuni-camera-motion-basics",
    category: "video-production",
    title: "YUNI 運鏡基礎",
    description: "六種實拍運鏡來源：Push In、Pull Out、Pan、Tilt、Tracking 與 Orbit。",
    type: "video",
    access: "free",
    sourcePath: "yuni/motion/",
    status: "source-only",
    content: {
      summary: "待轉檔與公開路徑確認後，可作為 AI Video Prompt 與實拍運鏡的對照素材。",
      topics: ["Push In", "Pull Out", "Pan", "Tilt", "Tracking", "Orbit"],
      sourceCount: 6,
    },
  },
  ...creatorCameraMotionResources,
  {
    id: "advanced-camera-motion",
    category: "video-production",
    title: "Advanced Camera Motion",
    description: "進階運鏡與 AI Video Prompt 的會員內容預留。",
    type: "video",
    access: "pro",
    sourcePath: "yuni/motion/",
    status: "planned",
    content: {
      summary: "僅建立 Pro 資源定位；尚未將任何原始影片指定為會員內容。",
      topics: ["Motion Sequencing", "Camera Prompt", "Shot Planning"],
    },
  },
];

export const creatorResourceCollections: readonly CreatorResourceCollection[] = [
  {
    id: "ai-visual-creation-resources",
    category: "ai-visual-creation",
    title: "AI Visual Creation Resources",
    description: "YUNI AI 生圖基礎的 Free 提示詞與 Advanced Prompt Library 的來源索引。",
    types: ["image", "prompt"],
    freeCount: 2,
    proCount: 20,
    sourcePath: "yuni/Image/",
  },
  {
    id: "video-production-resources",
    category: "video-production",
    title: "Video Production Resources",
    description: "YUNI 運鏡基礎與 Advanced Camera Motion 的影片、運鏡與 Prompt 對照架構。",
    types: ["video", "prompt"],
    freeCount: 1,
    proCount: 1,
    sourcePath: "yuni/motion/",
  },
  {
    id: "camera-recording-basics-resources",
    category: "camera-recording-basics",
    title: "Camera / Recording Basics",
    description: "由錄影要素延伸的穩定、構圖、光線、收音與設備差異知識架構。",
    types: ["image", "article"],
    freeCount: 1,
    proCount: 0,
    sourcePath: "yuni/錄影要素.png",
  },
];

export const creatorAcademyPublicAssetSlots = {
  images: "/images/creator-academy/yuni/",
  videos: "/videos/creator-academy/yuni/",
} as const;
