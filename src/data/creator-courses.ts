import type { CreatorAcademyAccess, CreatorAcademyCategoryId, CreatorAcademyLevel } from "@/data/creator-academy";

export type CreatorCourseChapter = { id: string; number: string; title: string; summary: string; points: readonly string[] };
export type CreatorCoursePromptElement = { id: string; label: string; title: string; description: string };
export type CreatorCourseExample = { id: string; title: string; image: string; imageAlt: string; prompt: string; analysis: readonly string[]; tips: readonly string[] };
export type CreatorCourseDetail = {
  id: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  category: CreatorAcademyCategoryId;
  categoryTitle: string;
  level: CreatorAcademyLevel;
  access: CreatorAcademyAccess;
  duration: string;
  heroImage: string;
  heroImageAlt: string;
  chapters: readonly CreatorCourseChapter[];
  promptElements: readonly CreatorCoursePromptElement[];
  scenes: readonly { title: string; description: string }[];
  photographyLanguage: readonly { term: string; description: string }[];
  examples: readonly CreatorCourseExample[];
};

const studioPlaceholder = "/images/creator-studio/hero-showcase-v1.png";

export const yuniAiImageBasicsCourse: CreatorCourseDetail = {
  id: "yuni-ai-image-basics",
  title: "YUNI AI 生圖基礎",
  englishTitle: "YUNI AI Image Creation Basics",
  subtitle: "Learn AI Image Creation with Character, Scene and Camera Control",
  category: "ai-visual-creation",
  categoryTitle: "AI 視覺創作",
  level: "基礎",
  access: "free",
  duration: "約 20 分鐘",
  heroImage: studioPlaceholder,
  heroImageAlt: "YUNI AI 生圖課程主視覺預留位置，呈現 AI 創作工作室",
  chapters: [
    { id: "ai-image-basics", number: "01", title: "什麼是 AI 生圖", summary: "AI 圖像生成會把文字指令轉換為視覺結果；清楚描述人物、場景與畫面語言，能讓結果更接近創作意圖。", points: ["AI 模型會依 Prompt 中的關鍵字建立人物、物件、光線與構圖", "Prompt 不是關鍵字堆疊，而是一份可被模型理解的視覺指令", "先控制主要元素，再逐步增加細節，較容易找出影響結果的設定"] },
    { id: "yuni-character", number: "02", title: "YUNI 角色設定", summary: "角色一致性來自穩定且可重複的描述。每次生成都保留角色核心設定，再調整場景與動作。", points: ["年齡感：使用一致的年齡區間與成熟度描述", "臉部特徵：固定臉型、眼神與辨識特徵", "髮型：長度、髮色、瀏海與造型保持一致", "服裝：固定款式、材質與主要配色", "氣質：明確描述自信、自然、親切或專業", "動作：說明姿勢、手部位置與視線方向"] },
  ],
  promptElements: [
    { id: "subject", label: "01", title: "Subject", description: "先說明畫面主角是誰，以及人物在畫面中的角色。" },
    { id: "appearance", label: "02", title: "Appearance", description: "固定臉部、髮型、服裝、配色與整體氣質。" },
    { id: "environment", label: "03", title: "Environment", description: "描述地點、時間、空間物件與背景層次。" },
    { id: "lighting", label: "04", title: "Lighting", description: "指定自然光、柔光、逆光或商業棚拍光線。" },
    { id: "camera", label: "05", title: "Camera", description: "控制景別、角度、鏡頭焦段與景深。" },
  ],
  scenes: [
    { title: "室內", description: "使用空間材質、窗光方向與家具層次建立生活感。" },
    { title: "旅行", description: "補充地點特色、天氣、時間與人物移動狀態。" },
    { title: "咖啡廳", description: "描述桌面物件、環境光、背景人群與安靜氛圍。" },
    { title: "商業場景", description: "控制品牌調性、乾淨背景、服裝與專業棚燈。" },
  ],
  photographyLanguage: [
    { term: "Camera angle", description: "Eye-level 自然親近；low angle 強化氣勢；high angle 帶出環境關係。" },
    { term: "Lens", description: "35mm 適合環境人像；50mm 自然；85mm 適合壓縮背景的人像。" },
    { term: "Depth of field", description: "Shallow depth of field 突出人物；deep focus 保留場景資訊。" },
    { term: "Lighting", description: "Soft window light 適合生活照；rim light 可增加人物與背景的分離感。" },
  ],
  examples: [{
    id: "yuni-indoor-lifestyle",
    title: "YUNI 室內生活照",
    image: studioPlaceholder,
    imageAlt: "YUNI 室內生活照案例圖片預留位置",
    prompt: `A photorealistic Taiwanese woman named YUNI in her early thirties, with long dark brown hair, soft natural facial features and a calm confident expression. She is wearing a light blue sleeveless knit top and clean neutral trousers, sitting naturally beside a large window in a modern minimalist living room. Warm wood, soft beige fabric and subtle indoor plants create a refined everyday atmosphere. Soft morning window light, realistic skin texture, eye-level camera angle, 50mm lens, shallow depth of field, natural hand position, editorial lifestyle photography, premium color grading, clean composition, no distorted hands, no extra fingers, no text, no watermark.`,
    analysis: ["Subject 與 Appearance 固定 YUNI 的年齡感、髮型、服裝和氣質", "Environment 指定現代客廳、木質、米色布料與植栽", "Lighting 使用柔和晨間窗光，Camera 使用 eye-level、50mm 與淺景深"],
    tips: ["想改成咖啡廳，只替換 Environment，先保留人物描述不動", "想增加專業感，可把服裝改為西裝並加入 soft studio key light", "若手部不自然，簡化動作並明確指定 natural hand position"],
  }],
};

export const creatorCourseDetails: readonly CreatorCourseDetail[] = [yuniAiImageBasicsCourse];
export function getCreatorCourseDetail(id: string) { return creatorCourseDetails.find((course) => course.id === id); }
