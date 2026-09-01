export type AiLearningKnowledgeCheck = {
  question: string;
  answer: string;
};

export type AiLearningPractice = {
  title: string;
  steps: readonly string[];
};

export type AiLearningLesson = {
  id: string;
  slug: string;
  order: number;
  title: string;
  titleEn: string;
  summary: string;
  concept: string;
  whyItMatters: string;
  systemPosition: string;
  analogy: string;
  exExample: string;
  aiCanDo: string;
  humanMustUnderstand: string;
  knowledgeCheck: AiLearningKnowledgeCheck;
  practice: AiLearningPractice;
  suggestedQuestions: readonly string[];
  relatedSkills: readonly string[];
  aiTaResponses: Readonly<Record<string, string>>;
};

export type AiLearningCourse = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  subtitle: string;
  summary: string;
  flow: readonly string[];
  lessons: readonly AiLearningLesson[];
};

export type AiLearningModule = {
  id: "knowledge-hub" | "classroom" | "ai-ta" | "skill-tree" | "practice-lab";
  order: string;
  title: string;
  titleEn: string;
  description: string;
  href: string;
  accent: string;
};

export type AiLearningSkillNode = {
  id: string;
  label: string;
  labelEn: string;
  description: string;
  prerequisiteIds: readonly string[];
  state: "current" | "ready" | "next";
};

const sharedResponses = {
  boundary: "先把概念與責任邊界說清楚，再決定哪一段交給 AI 執行；AI 不能取代來源驗證與最後判斷。",
  api: "API 是系統之間約定好的入口與格式。Backend 可以包含許多處理邏輯，而 API 是讓其他系統安全地提出請求、取得回應的契約。",
  key: "敏感的 API Key 不應放在瀏覽器可以直接看到的前端程式裡。需要保護的工作應經過受控的後端或安全服務。",
  database: "不一定。資料庫適合需要持續保存、查詢與多人共用的結構化資料；簡單的靜態內容可以直接由檔案或建置產物提供。",
  cloud: "Cloud 是一組遠端基礎設施與服務，不只是一台 Server。它可以提供部署、儲存、網路與運算等能力。",
} as const;

export const aiLearningModules: readonly AiLearningModule[] = [
  { id: "knowledge-hub", order: "01", title: "Knowledge Hub", titleEn: "Concept Library", description: "概念與系統知識庫，把零散名詞放回它們真正的位置。", href: "/ai-learning/knowledge-hub/", accent: "cyan" },
  { id: "classroom", order: "02", title: "Classroom", titleEn: "Structured Courses", description: "有結構的主題課程，用視覺化路徑建立可轉移的理解。", href: "/ai-learning/classroom/", accent: "blue" },
  { id: "ai-ta", order: "03", title: "AI TA", titleEn: "Contextual Tutor", description: "課程內的 AI 助教，在每一課的邊界裡陪著練習與提問。", href: "/ai-learning/classroom/how-web-works/", accent: "violet" },
  { id: "skill-tree", order: "04", title: "Skill Tree", titleEn: "Capability Map", description: "能力與知識關係圖，看見目前的位置與下一個可學節點。", href: "/ai-learning/skill-tree/", accent: "indigo" },
  { id: "practice-lab", order: "05", title: "Practice Lab", titleEn: "Learn by Doing", description: "理解後實際做一次，把概念轉成可以檢查的行動。", href: "/ai-learning/practice-lab/", accent: "sky" },
];

export const knowledgeHubCategories = [
  { id: "web", label: "Web", description: "從網址、瀏覽器到整個請求路徑。", count: "01 course" },
  { id: "frontend", label: "Frontend", description: "使用者看得到、點得到的介面與互動。", count: "01 lesson" },
  { id: "backend", label: "Backend", description: "介面背後的規則、處理與驗證。", count: "01 lesson" },
  { id: "api", label: "API", description: "系統之間交換請求與回應的共同語言。", count: "01 lesson" },
  { id: "database", label: "Database", description: "需要被保存、查詢與管理的結構化資料。", count: "01 lesson" },
  { id: "cloud", label: "Cloud", description: "讓服務可以被部署、連線與持續運作的遠端基礎設施。", count: "01 lesson" },
  { id: "ai", label: "AI", description: "加在系統上的生成、分析、教學與自動化能力。", count: "01 lesson" },
  { id: "automation", label: "Automation", description: "把可重複的流程交給工具執行，留下可驗證的邊界。", count: "coming soon" },
] as const;

export const aiLearningLessons: readonly AiLearningLesson[] = [
  {
    id: "internet",
    slug: "internet",
    order: 1,
    title: "Internet",
    titleEn: "The network that carries the request",
    summary: "從輸入網址開始，理解瀏覽器如何找到服務並把請求送出去。",
    concept: "Internet 是許多網路與設備互相連線的協作系統，讓瀏覽器可以找到並連接遠端服務。",
    whyItMatters: "知道請求怎麼走，才知道問題是在裝置、連線、服務，還是內容本身。",
    systemPosition: "User → Internet → Frontend",
    analogy: "像寄信時的郵政網路：地址、轉運與投遞共同完成一次傳遞。",
    exExample: "開啟 E.X Learning & Knowledge Hub 時，瀏覽器先透過網路取得靜態頁面與資產。",
    aiCanDo: "協助畫出請求路徑、整理 DNS、HTTP 與瀏覽器的關係，並幫忙設計檢查清單。",
    humanMustUnderstand: "連線成功不代表內容正確；要能分辨網路可達、服務回應與資料可信度。",
    knowledgeCheck: { question: "輸入網址後，第一個需要被理解的不是畫面，而是什麼？", answer: "是請求要去哪裡、如何被找到，以及服務是否能回應。" },
    practice: { title: "畫出一次請求的旅程", steps: ["寫下使用者輸入的網址與目的。", "標出瀏覽器、網路、服務與回應。", "指出哪一步可能失敗，以及要觀察什麼證據。"] },
    suggestedQuestions: ["Internet 和 Wi-Fi 是一樣的東西嗎？", "網址為什麼可以找到正確網站？", "連不上網站時要先檢查哪裡？"],
    relatedSkills: ["frontend", "backend"],
    aiTaResponses: { "Internet 和 Wi-Fi 是一樣的東西嗎？": "不是。Wi-Fi 是裝置連線到區域網路的一種方式；Internet 是更大的互聯網路。可以有 Wi-Fi 卻沒有 Internet，也可以用其他方式連上 Internet。", "網址為什麼可以找到正確網站？": "網址提供人類可讀的名稱與路徑，DNS 等機制會協助把名稱找到對應的網路位置，瀏覽器再提出請求。", "連不上網站時要先檢查哪裡？": "先分辨是只有一個網站失效，還是整體連線失效；再觀察 DNS、網路回應與服務狀態，不要只反覆重新整理。" },
  },
  {
    id: "frontend",
    slug: "frontend",
    order: 2,
    title: "Frontend",
    titleEn: "The interface people can see",
    summary: "理解瀏覽器裡的畫面、元件與互動，如何把資料變成可使用的體驗。",
    concept: "Frontend 是使用者在瀏覽器中看到與操作的介面，也包含讓互動發生的 client-side 程式。",
    whyItMatters: "介面不是資料本身；知道它的責任，才能避免把秘密、規則或未驗證數字放錯地方。",
    systemPosition: "Internet → Frontend ↔ Backend / API",
    analogy: "像餐廳前台：負責接待、呈現菜單與收下訂單，但不等於廚房的全部流程。",
    exExample: "Market Radar 的卡片、行政區圖表與 Detail Drawer 是前端把已驗證資料呈現成閱讀路徑。",
    aiCanDo: "協助拆解元件、整理狀態與產生介面草稿，但不能替使用者決定資料是否可信。",
    humanMustUnderstand: "瀏覽器中的程式與文字都可能被看見；API Key、權限判斷與來源真實性不能只靠前端保護。",
    knowledgeCheck: { question: "Frontend 最主要負責什麼？", answer: "把資訊與互動呈現給使用者，並與其他系統依契約交換需要的資料。" },
    practice: { title: "拆一張畫面卡片", steps: ["找出標題、數字、狀態與操作。", "標記哪些是事實、哪些是介面文案。", "寫下這張卡片需要哪一個資料來源。"] },
    suggestedQuestions: ["Frontend 為什麼不能放 API Key？", "元件和頁面有什麼差別？", "畫面上的數字一定是後端算出來的嗎？"],
    relatedSkills: ["internet", "api", "human-judgment"],
    aiTaResponses: { "Frontend 為什麼不能放 API Key？": sharedResponses.key, "元件和頁面有什麼差別？": "元件是可重用的介面單位，頁面則是由多個元件與資料組合成的完整閱讀情境。這是組織程式與責任的方式，不是固定的視覺尺寸。", "畫面上的數字一定是後端算出來的嗎？": "不一定。數字可能來自靜態檔、建置時資料或 API；重要的是能追溯來源、計算規則與更新時間。" },
  },
  {
    id: "backend",
    slug: "backend",
    order: 3,
    title: "Backend",
    titleEn: "The logic behind the interface",
    summary: "看懂介面背後的處理、驗證與權限概念，並分清楚教學架構與本專案現況。",
    concept: "Backend 是在使用者看不到的環境中執行規則、處理資料與回應請求的系統部分。",
    whyItMatters: "把規則放在正確位置，才能讓資料處理一致、權限有邊界、錯誤可被追蹤。",
    systemPosition: "Frontend → Backend ↔ Database / External Sources",
    analogy: "像餐廳廚房：接收前台訂單，依流程處理，再把結果交回前台。",
    exExample: "本站目前以 GitHub Pages 靜態輸出為主；課程中的 Backend 是通用概念，不表示本站已有傳統伺服器後端。",
    aiCanDo: "協助寫處理流程草稿、測試案例與錯誤分類，但不能跳過權限與驗證設計。",
    humanMustUnderstand: "要知道哪些規則必須在受控環境執行，哪些資料可以公開，以及失敗時要保留什麼。",
    knowledgeCheck: { question: "為什麼不能把所有系統邏輯都塞進畫面？", answer: "因為公開畫面容易被看見與修改，重要規則、秘密與一致性需要更受控的位置。" },
    practice: { title: "畫出一個驗證邊界", steps: ["列出使用者提交的輸入。", "標記前端可做的快速檢查。", "再標記必須在受控環境重做的驗證。"] },
    suggestedQuestions: ["Backend 一定要是一台 Server 嗎？", "驗證和授權有什麼差別？", "靜態網站可以沒有 Backend 嗎？"],
    relatedSkills: ["frontend", "api", "database", "cloud"],
    aiTaResponses: { "Backend 一定要是一台 Server 嗎？": "不一定。Backend 是責任與處理位置的概念，可以由伺服器、雲端函式或其他受控服務承擔，不應只用硬體名稱定義。", "驗證和授權有什麼差別？": "驗證是在確認『你是誰或資料格式是否正確』；授權是在確認『你是否可以做這件事』。兩者都需要明確規則。", "靜態網站可以沒有 Backend 嗎？": "可以。若頁面由建置產物與公開檔案提供，基本瀏覽不需要傳統後端；但登入、個人資料或動態權限通常需要受控服務。" },
  },
  {
    id: "api",
    slug: "api",
    order: 4,
    title: "API",
    titleEn: "A contract between systems",
    summary: "用 request / response 看懂系統如何互相溝通，而不是先陷入語法。",
    concept: "API 是系統之間約定好的介面與資料契約，定義可以提出什麼請求、得到什麼回應。",
    whyItMatters: "有契約，系統才能分工；沒有契約，整合就會變成猜測與脆弱的字串拼接。",
    systemPosition: "Frontend ↔ API ↔ Backend / Data Source",
    analogy: "像餐廳點餐介面：客人依菜單格式提出需求，廚房依約定回傳餐點或說明無法供應。",
    exExample: "Market Radar 的資料載入與分析層把官方資料先 normalize，再讓畫面依固定結構讀取。",
    aiCanDo: "協助描述 input / output、產生測試請求與整理錯誤回應，並提醒契約缺口。",
    humanMustUnderstand: "要看懂資料型別、錯誤狀態、權限與版本相容性；API 能傳資料，不代表資料自動可信。",
    knowledgeCheck: { question: "API 最核心的價值是什麼？", answer: "讓不同系統在清楚的 input / output 契約下協作，降低彼此對內部實作的依賴。" },
    practice: { title: "寫一張 API contract card", steps: ["定義一個請求需要的 input。", "定義成功 response 的欄位。", "定義至少一種錯誤 response 與處理方式。"] },
    suggestedQuestions: ["API 跟 Backend 差在哪？", "Request 和 Response 怎麼分？", "API 版本為什麼需要管理？"],
    relatedSkills: ["frontend", "backend", "automation"],
    aiTaResponses: { "API 跟 Backend 差在哪？": sharedResponses.api, "Request 和 Response 怎麼分？": "Request 是提出需求的一方送出的內容，包含方法、輸入與必要上下文；Response 是服務依契約回傳的結果或錯誤。", "API 版本為什麼需要管理？": "因為使用者可能還在使用舊格式。版本管理讓契約可以演進，也讓變更有清楚的相容性界線。" },
  },
  {
    id: "database",
    slug: "database",
    order: 5,
    title: "Database",
    titleEn: "Structured memory for a system",
    summary: "理解持續保存、查詢與管理資料的地方，以及它和靜態檔案的差別。",
    concept: "Database 是可以持續保存並依規則查詢、更新與管理結構化資料的系統。",
    whyItMatters: "知道資料要不要被保存、誰可以改、如何查詢，才不會把每一種資料都當成同一種檔案。",
    systemPosition: "Backend ↔ Database",
    analogy: "像圖書館的編目系統：不只是把書堆在一起，而是有欄位、索引與借閱規則。",
    exExample: "本階段 Market Radar 的公開 Live JSON 是建置與展示資料；不代表所有產品功能都需要資料庫。",
    aiCanDo: "協助設計欄位、查詢草稿與資料品質檢查，但不能替人決定保存什麼或誰可存取。",
    humanMustUnderstand: "持久化、備份、資料關係、權限與刪除策略都是產品責任，不只是選一個套件。",
    knowledgeCheck: { question: "什麼情況下，靜態檔案可能比資料庫更適合？", answer: "內容更新節奏低、公開讀取、建置時可驗證，而且不需要即時個人化寫入時。" },
    practice: { title: "判斷資料放置位置", steps: ["列出一份資料的更新頻率。", "判斷是否需要多人同時寫入。", "決定使用靜態檔案、API 或資料庫，並寫下理由。"] },
    suggestedQuestions: ["Database 一定需要嗎？", "資料庫和 JSON 檔案差在哪？", "為什麼要做資料備份？"],
    relatedSkills: ["backend", "api", "cloud"],
    aiTaResponses: { "Database 一定需要嗎？": sharedResponses.database, "資料庫和 JSON 檔案差在哪？": "JSON 檔案是資料格式；資料庫是負責持久化、查詢、更新與權限管理的系統。兩者可以承載資料，但能力與責任不同。", "為什麼要做資料備份？": "因為資料可能因操作、程式或硬體問題遺失。備份讓系統能回到已知良好的版本，而不是只依賴當下那一份。" },
  },
  {
    id: "cloud",
    slug: "cloud",
    order: 6,
    title: "Cloud",
    titleEn: "Remote infrastructure that makes it available",
    summary: "從部署與託管理解 Cloud，不把它簡化成單一 Server 或一個品牌。",
    concept: "Cloud 是透過網路提供運算、儲存、部署與其他基礎設施能力的一組服務。",
    whyItMatters: "它把『在本機跑得動』延伸成『別人可以穩定使用』，也帶來成本、權限與可靠性選擇。",
    systemPosition: "Cloud hosts and connects the system layers",
    analogy: "像共享的現代工作空間：提供場地、電力、網路與管理服務，不只是一張桌子。",
    exExample: "GitHub Pages 可以作為靜態網站部署的概念例子；它是託管邊界，不等於本專案擁有完整雲端後端。",
    aiCanDo: "協助整理部署步驟、環境變數與監控清單，但不能忽略成本、權限與資料位置。",
    humanMustUnderstand: "部署位置、公開範圍、備份、費用與服務限制需要由人做決定。",
    knowledgeCheck: { question: "Cloud 和 Server 的關係可以怎麼理解？", answer: "Server 是可能提供運算的資源；Cloud 是把多種遠端基礎設施與服務以可管理方式提供出來。" },
    practice: { title: "整理一次部署交接", steps: ["寫下要公開的產物。", "標記需要的環境與服務。", "列出部署後要確認的可用性、權限與回滾方法。"] },
    suggestedQuestions: ["Cloud 跟 Server 一樣嗎？", "部署完成就代表系統可靠嗎？", "GitHub Pages 算 Cloud 嗎？"],
    relatedSkills: ["backend", "database", "ai"],
    aiTaResponses: { "Cloud 跟 Server 一樣嗎？": sharedResponses.cloud, "部署完成就代表系統可靠嗎？": "不代表。還要確認可用性、錯誤處理、備份、權限、監控與回滾；部署只是把產物放到可被使用的位置。", "GitHub Pages 算 Cloud 嗎？": "可以把它當作雲端託管服務的一個例子，但它的能力邊界是靜態內容部署，不應推論成完整後端平台。" },
  },
  {
    id: "ai",
    slug: "ai",
    order: 7,
    title: "AI in the System",
    titleEn: "A capability layer, not the whole application",
    summary: "把 AI 放回系統脈絡：它可以生成、分析、教學與自動化，但仍需要邊界與人類判斷。",
    concept: "AI 是可以被接入系統的能力層，依情境提供生成、分類、分析、教學或自動化。",
    whyItMatters: "理解能力層的位置，才能知道哪些工作適合交給 AI，哪些事實與責任不能外包。",
    systemPosition: "AI can assist across the system, within explicit boundaries",
    analogy: "像一位速度很快的協作者：可以幫忙整理與執行，但仍需要清楚的任務、材料與審核者。",
    exExample: "Market Radar 的規則式分析可以把 MOI / CBC 事實整理成可讀訊號；AI 不應修改數字或自行補出來源。",
    aiCanDo: "協助摘要、產生草稿、分類、教學與重複流程，但輸出要經過來源、規則與結果驗證。",
    humanMustUnderstand: "來源真實性、數字、權限、風險與最後決策仍由人負責；流暢文字不等於正確答案。",
    knowledgeCheck: { question: "AI 在系統裡最安全的定位是什麼？", answer: "在已定義的資料、規則與邊界內擔任能力層，協助執行而不是取代事實與責任。" },
    practice: { title: "寫一份 AI task boundary", steps: ["定義 AI 收到的資料與來源。", "寫出可交給 AI 的執行步驟。", "列出必須由人檢查的結果與禁止事項。"] },
    suggestedQuestions: ["AI 可以直接決定答案嗎？", "為什麼資料來源比漂亮摘要重要？", "理解邏輯後，哪些工作適合交給 AI？"],
    relatedSkills: ["api", "automation", "human-judgment"],
    aiTaResponses: { "AI 可以直接決定答案嗎？": sharedResponses.boundary, "為什麼資料來源比漂亮摘要重要？": "摘要只是呈現層；如果來源、期間或計算規則不清楚，文字再順也可能誤導。先保留可追溯事實，才有安全的摘要。", "理解邏輯後，哪些工作適合交給 AI？": "可交給 AI 的通常是規則清楚、可重複、結果可驗證的整理與執行；涉及事實真偽、風險與責任的判斷仍要由人掌握。" },
  },
];

export const AI_LEARNING_COURSE: AiLearningCourse = {
  id: "how-web-works",
  slug: "how-web-works",
  title: "一個網站到底怎麼運作？",
  titleEn: "How Does a Website Actually Work?",
  subtitle: "從你輸入網址開始，一路理解 Frontend、Backend、API、Database、Cloud 與 AI。",
  summary: "這是一張概念地圖，不把所有產品都硬塞進同一種架構；每一課只負責說清楚一個系統位置與一個可練習的判斷。",
  flow: ["User", "Internet", "Frontend", "Backend", "API", "Database", "Cloud", "AI Integration"],
  lessons: aiLearningLessons,
};

export const aiLearningSkillTree: readonly AiLearningSkillNode[] = [
  { id: "internet", label: "Internet", labelEn: "Network context", description: "知道請求如何抵達服務。", prerequisiteIds: [], state: "current" },
  { id: "frontend", label: "Frontend", labelEn: "Interface layer", description: "把資料與互動呈現給使用者。", prerequisiteIds: ["internet"], state: "ready" },
  { id: "backend", label: "Backend", labelEn: "Logic layer", description: "理解規則、驗證與處理位置。", prerequisiteIds: ["frontend"], state: "ready" },
  { id: "api", label: "API", labelEn: "System contract", description: "描述系統之間的 input / output。", prerequisiteIds: ["frontend", "backend"], state: "ready" },
  { id: "database", label: "Database", labelEn: "Persistent data", description: "判斷資料是否需要持續保存與查詢。", prerequisiteIds: ["backend", "api"], state: "next" },
  { id: "cloud", label: "Cloud", labelEn: "Deployment context", description: "把本機成果放到可被使用的基礎設施。", prerequisiteIds: ["backend", "database"], state: "next" },
  { id: "ai", label: "AI Integration", labelEn: "Capability layer", description: "在清楚邊界內交給 AI 協助執行。", prerequisiteIds: ["api", "cloud"], state: "next" },
];

export function getAiLearningLesson(slug: string): AiLearningLesson | undefined {
  return AI_LEARNING_COURSE.lessons.find((lesson) => lesson.slug === slug);
}

export function getAiLearningNextLesson(slug: string): AiLearningLesson | undefined {
  const lesson = getAiLearningLesson(slug);
  return lesson ? AI_LEARNING_COURSE.lessons.find((candidate) => candidate.order === lesson.order + 1) : undefined;
}

