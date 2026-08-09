import type { CreatorAcademyAccess, CreatorAcademyCategoryId, CreatorAcademyLevel } from "@/data/creator-academy";

export type CreatorCourseChapter = { id: string; number: string; title: string; summary: string; points: readonly string[] };
export type CreatorCoursePromptElement = { id: string; label: string; title: string; description: string };
export type CreatorCourseExample = { id: string; title: string; image: string; imageAlt: string; prompt: string; analysis: readonly string[]; tips: readonly string[]; tools?: readonly string[] };
export type CreatorCompositionPrinciple = { id: string; number: string; title: string; englishTitle: string; description: string };
export type CreatorPhotographyExample = { id: string; title: string; image: string; imageAlt: string; analysis: readonly { label: string; description: string }[] };
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
  motionLanguage?: readonly { term: string; translation: string; description: string }[];
  compositionPrinciples?: readonly CreatorCompositionPrinciple[];
  photographyExamples?: readonly CreatorPhotographyExample[];
  proSection?: { title: string; description: string; topics: readonly string[] };
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

export const yuniAiVideoMotionBasicsCourse: CreatorCourseDetail = {
  id: "yuni-ai-video-motion-basics",
  title: "YUNI AI 影片運鏡入門",
  englishTitle: "YUNI AI Video Motion Basics",
  subtitle: "Control Camera Motion, Character Action and Scene Atmosphere with Prompts",
  category: "ai-visual-creation",
  categoryTitle: "AI 視覺創作",
  level: "入門",
  access: "free",
  duration: "約 25 分鐘",
  heroImage: studioPlaceholder,
  heroImageAlt: "YUNI AI 影片運鏡課程主視覺預留位置，呈現影像監看與創作工作站",
  chapters: [
    { id: "video-foundation", number: "01", title: "AI 影片生成基本概念", summary: "AI 影片工具會依文字、圖片或前後畫面推算時間中的變化。Prompt 需要同時說明人物動作、鏡頭運動與環境狀態。", points: ["圖片轉影片：以單張角色或場景圖作為視覺起點", "文字生成影片：用完整描述建立人物、動作與場景", "首幀／尾幀：用開始與結束畫面控制變化方向", "鏡頭語言：模型會把 push in、orbit、tracking 等詞轉換成視角移動"] },
    { id: "motion-language", number: "02", title: "AI 運鏡語言", summary: "每次先選一個主要鏡頭運動，再搭配人物動作。過多互相衝突的運鏡指令容易造成畫面漂移。", points: ["Push In", "Pull Out", "Orbit", "Tracking", "Pan / Tilt"] },
    { id: "video-prompt-elements", number: "03", title: "AI Video Prompt 五大元素", summary: "影片 Prompt 需要描述時間中的行為。依序建立人物、動作、鏡頭、環境與光線，讓模型理解畫面如何發生。", points: ["Subject", "Action", "Camera Motion", "Environment", "Lighting"] },
    { id: "video-practice", number: "04", title: "YUNI 實戰案例", summary: "以室內生活、旅行與商業展示三種情境，練習把人物動作與鏡頭運動寫進 Prompt。", points: ["室內生活影片", "旅行場景", "商業展示"] },
  ],
  promptElements: [
    { id: "subject", label: "01", title: "Subject", description: "人物與主體：固定 YUNI 的外觀、服裝與畫面角色。" },
    { id: "action", label: "02", title: "Action", description: "動作：說明走路、轉身、展示或與物件互動的方式。" },
    { id: "camera-motion", label: "03", title: "Camera Motion", description: "鏡頭運動：指定 push in、tracking、orbit 或 pan。" },
    { id: "environment", label: "04", title: "Environment", description: "環境：交代空間、背景層次、天氣與移動路徑。" },
    { id: "lighting", label: "05", title: "Lighting", description: "光線與氛圍：描述時間、光源方向、色溫與情緒。" },
  ],
  scenes: [],
  photographyLanguage: [],
  motionLanguage: [
    { term: "Push In", translation: "鏡頭緩緩靠近", description: "逐步拉近人物或物件，集中注意力並強化情緒。" },
    { term: "Pull Out", translation: "鏡頭拉遠展現環境", description: "從主體向外移動，揭示空間、位置與整體情境。" },
    { term: "Orbit", translation: "環繞人物", description: "鏡頭沿人物周圍移動，適合展示造型或建立立體感。" },
    { term: "Tracking", translation: "跟隨人物移動", description: "保持人物在畫面中的相對位置，跟著走路方向平順移動。" },
    { term: "Pan / Tilt", translation: "水平與垂直移動", description: "Pan 左右觀看場景；Tilt 上下揭示高度或物件全貌。" },
  ],
  examples: [
    { id: "yuni-cozy-room", title: "室內生活影片", image: studioPlaceholder, imageAlt: "YUNI 室內生活影片案例視覺預留位置", tools: ["KLING AI", "Seedance", "LumaFlow"], prompt: `YUNI standing in a cozy room beside a large window, wearing a light blue sleeveless knit top and neutral trousers. She gently turns toward the camera and smiles naturally while soft curtains move in the breeze. Slow camera push in, stable cinematic movement, subtle natural body motion, warm morning window light, shallow depth of field, realistic fabric movement, consistent face and outfit, no sudden motion, no distorted hands, no camera shake.`, analysis: ["Subject 固定 YUNI 的服裝、外觀與所在位置", "Action 使用緩慢轉身、自然微笑與窗簾細微飄動", "Camera Motion 只使用 slow push in，避免運鏡衝突"], tips: ["想更安靜，可移除窗簾動態並加入 locked background", "人物動作不穩時，把轉身改為 looks toward the camera", "畫面晃動時加入 stable cinematic movement 與 no camera shake"] },
    { id: "yuni-travel-landscape", title: "旅行場景", image: studioPlaceholder, imageAlt: "YUNI 旅行場景 AI 影片案例視覺預留位置", tools: ["KLING AI", "Seedance", "LumaFlow"], prompt: `YUNI walking through a beautiful coastal landscape at golden hour, her long dark brown hair moving gently in the wind. She walks at a relaxed natural pace and looks toward the horizon. Smooth side tracking shot matching her walking speed, wide environmental composition, soft golden sunlight, distant ocean and layered mountains, realistic footsteps, consistent character appearance, cinematic travel film, no floating, no warped landscape, no speed ramp.`, analysis: ["Action 指定自然步伐、視線方向與頭髮受風影響", "Tracking 跟隨人物速度，並保留寬廣旅行環境", "Golden hour 統一光線、色溫與旅行影片氣氛"], tips: ["想看更多風景，可把 tracking 改成 slow pull out", "人物漂移時縮短走路距離並固定 consistent character appearance", "不需要快速節奏時加入 no speed ramp"] },
    { id: "yuni-product-presentation", title: "商業展示", image: studioPlaceholder, imageAlt: "YUNI 商業產品展示 AI 影片案例視覺預留位置", tools: ["KLING AI", "Seedance", "LumaFlow"], prompt: `YUNI presenting a product on a clean premium studio table. She places one hand beside the product, looks at the camera and makes a small confident presentation gesture. Slow controlled camera orbit from the front-left to the front, polished commercial lighting, cyan and soft purple accent reflections, crisp product edges, realistic contact shadows, consistent YUNI appearance, elegant restrained movement, no logo distortion, no extra objects, no exaggerated gesture.`, analysis: ["商業場景同時固定人物、產品位置與手部動作", "Controlled orbit 僅使用小角度環繞，保持產品輪廓清楚", "Commercial lighting 配合青藍與紫色反射，延續 E.X 品牌調性"], tips: ["若產品文字重要，應以實拍或後期合成處理，不依賴生成模型", "手部容易變形時，減少拿取動作並使用 places one hand beside", "想更穩定，可將 orbit 改成 slow push in"] },
  ],
  proSection: { title: "AI Director Motion Masterclass", description: "會員專屬內容", topics: ["多鏡頭分鏡", "連續劇情控制", "角色一致性", "商業影片流程", "AI 廣告製作"] },
};

export const yuniPhotographyCompositionBasicsCourse: CreatorCourseDetail = {
  id: "yuni-composition-basics",
  title: "YUNI 基礎構圖法",
  englishTitle: "YUNI Photography Composition Basics",
  subtitle: "Learn Visual Focus, Spatial Balance and Photography Composition with YUNI",
  category: "photography-composition",
  categoryTitle: "攝影美學構圖",
  level: "基礎",
  access: "free",
  duration: "約 20 分鐘",
  heroImage: studioPlaceholder,
  heroImageAlt: "YUNI 基礎構圖課程主視覺預留位置，呈現攝影與影像監看工作室",
  chapters: [
    { id: "composition-foundation", number: "01", title: "攝影構圖基本概念", summary: "構圖決定觀看者先看見什麼、視線如何移動，以及人物和環境之間呈現何種關係。", points: ["構圖如何影響視覺焦點：利用位置、明暗與大小建立觀看順序", "主體與背景關係：讓背景支持人物，而不是搶走注意力", "畫面層次：使用前景、中景與背景建立空間深度"] },
    { id: "composition-methods", number: "02", title: "基礎構圖法", summary: "五種常用構圖可以作為拍攝起點。理解目的後再選擇，而不是讓所有照片都套用同一規則。", points: ["三分法", "中央構圖", "引導線", "前景框景", "留白"] },
    { id: "composition-cases", number: "03", title: "YUNI 實戰案例", summary: "從咖啡廳、戶外旅行與商業形象三種情境，觀察人物位置、環境比例、光線與視覺焦點。", points: ["YUNI 咖啡廳人像", "YUNI 戶外旅行", "YUNI 商業形象照"] },
  ],
  promptElements: [],
  scenes: [],
  photographyLanguage: [],
  compositionPrinciples: [
    { id: "rule-of-thirds", number: "01", title: "三分法", englishTitle: "Rule of Thirds", description: "利用水平與垂直分割線安排人物位置，讓主體與觀看方向保有平衡空間。" },
    { id: "center-composition", number: "02", title: "中央構圖", englishTitle: "Center Composition", description: "適合人物肖像與對稱場景，直接強調主體並建立穩定感。" },
    { id: "leading-lines", number: "03", title: "引導線", englishTitle: "Leading Lines", description: "利用道路、建築邊緣或光線方向，把視線帶向人物或重要物件。" },
    { id: "frame-within-frame", number: "04", title: "前景框景", englishTitle: "Frame Within Frame", description: "利用窗戶、門框或前景物件包圍主體，增加空間層次與觀看感。" },
    { id: "negative-space", number: "05", title: "留白", englishTitle: "Negative Space", description: "保留乾淨空間，營造情緒、呼吸感與簡潔的高級視覺。" },
  ],
  photographyExamples: [
    { id: "yuni-cafe-portrait", title: "YUNI 咖啡廳人像", image: studioPlaceholder, imageAlt: "YUNI 咖啡廳人像構圖案例預留位置", analysis: [{ label: "主體位置", description: "將 YUNI 放在右側三分線，左側保留觀看方向與環境資訊。" }, { label: "背景", description: "選擇簡潔桌面與柔和牆面，避免高對比物件干擾人物。" }, { label: "光線", description: "使用側面窗光塑造臉部立體感，讓背景亮度稍低。" }, { label: "景深", description: "使用淺景深柔化背景，同時保留咖啡廳的空間辨識度。" }] },
    { id: "yuni-outdoor-travel", title: "YUNI 戶外旅行", image: studioPlaceholder, imageAlt: "YUNI 戶外旅行攝影構圖案例預留位置", analysis: [{ label: "環境比例", description: "讓景觀占較大比例，人物作為尺度與旅行故事的視覺錨點。" }, { label: "人與空間", description: "使用道路或地景線條引導視線，同時保留人物前進方向的空間。" }] },
    { id: "yuni-brand-portrait", title: "YUNI 商業形象照", image: studioPlaceholder, imageAlt: "YUNI 商業形象攝影構圖案例預留位置", analysis: [{ label: "品牌感", description: "使用中央或微偏中央構圖、乾淨背景與一致品牌色，建立專業穩定感。" }, { label: "視覺焦點", description: "讓臉部與眼神成為最高對比區域，服裝和背景只作支援。" }] },
  ],
  examples: [],
  proSection: { title: "Cinematic Composition Masterclass", description: "會員專屬內容", topics: ["電影構圖", "色彩心理", "故事敘事", "商業攝影"] },
};

export const yuniCinematicCameraMovementCourse: CreatorCourseDetail = {
  id: "yuni-camera-movement-basics",
  title: "YUNI 電影感運鏡基礎",
  englishTitle: "YUNI Cinematic Camera Movement",
  subtitle: "Learn Camera Movement for Mobile, AI Video and Commercial Storytelling",
  category: "video-production",
  categoryTitle: "影像拍攝技巧",
  level: "基礎",
  access: "free",
  duration: "約 25 分鐘",
  heroImage: studioPlaceholder,
  heroImageAlt: "YUNI 電影感運鏡課程主視覺預留位置，呈現鏡頭與影像工作站",
  chapters: [
    { id: "camera-foundation", number: "01", title: "影像運鏡基本概念", summary: "運鏡是選擇觀看主體的方法。每一次移動都應支援情緒、資訊或人物關係，而不是只為了讓畫面動起來。", points: ["為什麼需要運鏡：引導注意力、揭示資訊或回應人物情緒", "靜態與動態畫面：靜態畫面建立穩定；動態畫面帶出時間、空間與能量", "運鏡如何增加故事感：先交代環境，再跟隨行動，最後靠近表情或細節"] },
    { id: "camera-techniques", number: "02", title: "基礎運鏡技巧", summary: "先練習單一、緩慢而穩定的鏡頭運動。每支短片只要選對一種主要動作，就能明確提升觀看感。", points: ["Push In", "Pull Out", "Pan", "Tilt", "Tracking Shot", "Orbit Shot"] },
    { id: "motion-prompt", number: "03", title: "AI Video Motion Prompt", summary: "將人物、動作、鏡頭、環境、光線與時長寫成可閱讀的時間指令，讓 AI 影片工具更容易生成穩定結果。", points: ["Subject", "Action", "Camera Movement", "Environment", "Lighting", "Duration"] },
    { id: "camera-cases", number: "04", title: "YUNI 實戰案例", summary: "以日常咖啡店、旅行與商業展示三種情境，拆解從開場、運鏡到收尾的鏡頭選擇。", points: ["YUNI 日常生活", "YUNI 旅行影片", "YUNI 商業展示"] },
  ],
  promptElements: [
    { id: "subject", label: "01", title: "Subject", description: "人物與主體：固定 YUNI、產品或當下最重要的視覺目標。" },
    { id: "action", label: "02", title: "Action", description: "動作：描述走入、停下、看向鏡頭或展示物件。" },
    { id: "camera-movement", label: "03", title: "Camera Movement", description: "鏡頭運動：選擇 push in、tracking、orbit、pan 或 tilt。" },
    { id: "environment", label: "04", title: "Environment", description: "環境：交代咖啡店、旅行地景或商業棚拍空間。" },
    { id: "lighting", label: "05", title: "Lighting", description: "光線：指定晨光、黃金時刻、棚燈或品牌色反射。" },
    { id: "duration", label: "06", title: "Duration", description: "時長：指定 5–8 秒等短片長度，讓動作節奏可控。" },
  ],
  scenes: [],
  photographyLanguage: [],
  motionLanguage: [
    { term: "Push In", translation: "鏡頭慢慢靠近主體", description: "增加情緒並建立注意力，適合收進人物表情或產品細節。" },
    { term: "Pull Out", translation: "鏡頭慢慢拉遠", description: "展現環境與空間感，適合從人物帶出更完整的故事位置。" },
    { term: "Pan", translation: "水平移動", description: "用於介紹場景或讓視線由一個資訊點移向另一個資訊點。" },
    { term: "Tilt", translation: "上下移動", description: "用於展現建築、高度或從物件細節移至人物。" },
    { term: "Tracking Shot", translation: "跟隨人物移動", description: "跟著人物步伐移動，增加臨場感並維持行動方向。" },
    { term: "Orbit Shot", translation: "環繞人物", description: "環繞人物或產品建立電影感，適合造型與商品展示。" },
  ],
  examples: [
    { id: "yuni-cafe-entry", title: "YUNI 日常生活｜走入咖啡店", image: studioPlaceholder, imageAlt: "YUNI 走入咖啡店運鏡案例預留位置", tools: ["KLING AI", "Seedance", "LumaFlow"], prompt: `YUNI walks into a warm modern coffee shop from the entrance, wearing a light blue sleeveless knit top and neutral trousers. Start with a wide establishing shot showing the coffee counter and window light. Smooth tracking shot follows behind her for two steps, then a slow push in as she turns toward the camera with a natural relaxed smile. Soft morning light, realistic footsteps, shallow depth of field, stable handheld gimbal feeling, 7 seconds, cinematic everyday lifestyle film, no camera shake, no warped interior, consistent YUNI appearance.`, analysis: ["開場遠景先交代咖啡店與人物進入方向", "Tracking Shot 跟拍兩步，把觀眾帶進同一個空間", "Push In 收到近景表情，讓日常片段有情緒焦點"], tips: ["空間過窄時，改為 side tracking 避免背影遮住畫面", "人物動作不自然時，把 two steps 改為 walks slowly", "想增加品牌感，可補上桌面、杯子與色彩限制"] },
    { id: "yuni-travel-reveal", title: "YUNI 旅行影片｜從環境到人物", image: studioPlaceholder, imageAlt: "YUNI 旅行影片運鏡案例預留位置", tools: ["KLING AI", "Seedance", "LumaFlow"], prompt: `A wide establishing shot of a coastal travel landscape at golden hour. YUNI stands near the path looking toward the ocean, her long dark brown hair moving gently in the wind. Slow pull out reveals the coastline and layered mountains, then a gentle push in toward YUNI's profile. Subtle slow motion movement, warm golden sunlight, cinematic atmospheric lighting, natural fabric motion, 8 seconds, smooth gimbal camera movement, consistent character appearance, no floating, no warped horizon, no speed ramp.`, analysis: ["Establishing Shot 先建立地點、時間與旅行規模", "Pull Out 擴大環境比例，再以 Push In 回到人物感受", "Slow Motion 僅用於細微風與頭髮動態，保持自然節奏"], tips: ["想更有壯闊感，可增加 wide environmental composition", "地平線扭曲時加入 keep horizon straight", "人物比例不穩時先縮短鏡頭移動距離"] },
    { id: "yuni-product-reveal", title: "YUNI 商業展示｜商品／品牌展示", image: studioPlaceholder, imageAlt: "YUNI 商業展示運鏡案例預留位置", tools: ["KLING AI", "Seedance", "LumaFlow"], prompt: `YUNI presents a premium product on a clean studio table. Begin with a close product reveal under polished commercial lighting, then make a slow controlled orbit shot around YUNI and the product from front-left to front. YUNI places one hand beside the product and looks at the camera with a calm confident expression. Cyan and soft purple accent lighting, crisp product edges, realistic contact shadows, elegant minimal movement, 6 seconds, cinematic commercial film, no logo distortion, no extra objects, no exaggerated gesture.`, analysis: ["Product Reveal 先讓觀眾理解商品，再引入人物", "Orbit Shot 用小角度環繞增加電影感，同時保留產品輪廓", "Lighting 使用青藍與紫色反射，建立一致的品牌視覺"], tips: ["包裝文字重要時，應以實拍或後期合成處理", "Orbit 過度時改為 slow push in，避免產品變形", "手部瑕疵可把動作簡化為 places one hand beside"] },
  ],
  proSection: { title: "Creator Film Director Masterclass", description: "會員專屬內容", topics: ["商業影片分鏡", "Shot List", "B-roll 設計", "AI Director Workflow", "房產影片製作"] },
};

export const creatorCourseDetails: readonly CreatorCourseDetail[] = [yuniAiImageBasicsCourse, yuniAiVideoMotionBasicsCourse, yuniPhotographyCompositionBasicsCourse, yuniCinematicCameraMovementCourse];
export function getCreatorCourseDetail(id: string) { return creatorCourseDetails.find((course) => course.id === id); }
