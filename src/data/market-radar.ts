export type MarketTrend = "up" | "down" | "steady";

export type MarketRadarIndicator = {
  id: "transactionHeat" | "priceMomentum" | "negotiationSpace";
  label: string;
  value: string;
  trend: MarketTrend;
  detail: string;
};

export type MarketRadarNewsItem = {
  id: string;
  category: "政策" | "房貸" | "實價" | "建案" | "區域";
  title: string;
  summary: string;
  source: string;
  updatedAt: string;
  detail: MarketRadarDetail;
};

export type MarketRadarChart = {
  id: "transaction-heat" | "price-momentum" | "district-comparison";
  title: string;
  subtitle: string;
  values: readonly number[];
  labels: readonly string[];
  detail: MarketRadarDetail;
};

export type MarketRadarDetail = {
  id: string;
  category: string;
  title: string;
  summary: string;
  analysis: {
    summary: string;
    impact: string;
    impactLevel: "低" | "中" | "高";
    affectedAudience: readonly ("買方" | "屋主" | "房仲" | "投資人")[];
  };
  source: {
    name: string;
    url?: string;
    publishedAt?: string;
    dataPeriod?: string;
    verifiedAt?: string;
  };
  isMock: boolean;
};

export type MarketRadarDistrictHighlight = {
  district: string;
  headline: string;
  note: string;
  detail: MarketRadarDetail;
};

export type MarketRadarDailyKeyTake = {
  text: string;
  lineCount: 1 | 2 | 3;
};

export type MarketRadarAccess = {
  freeQuarterlyDownloadsAllowed: number;
  freeQuarterlyDownloadsUsed: number;
  freeQuarterlyDownloadsRemaining: number;
  hasActiveMonthlySubscription: boolean;
  hasActiveAnnualSubscription: boolean;
};

export type MarketRadarPricing = {
  monthlyPrice: number;
  annualPrice: number;
  monthlyDurationDays: number;
  annualDurationDays: number;
  annualEquivalentMonthly: number;
};

export type MarketRadarFreePlan = {
  downloadsPerQuarter: number;
  includesPng: boolean;
  includesPdf: boolean;
  creditsCarryOver: boolean;
};

export type MarketRadarQuarter = {
  id: string;
  label: string;
  quarterStart: string;
  quarterEnd: string;
  nextQuarterLabel: string;
};

export type MarketRadarReport = {
  id: string;
  date: string;
  updatedAt: string;
  title: string;
  subtitle: string;
  summary: string;
  source: {
    mode: "mock";
    futureJsonPath: string;
  };
  marketTemperature: {
    label: string;
    description: string;
    indicators: readonly MarketRadarIndicator[];
  };
  dailyKeyTake: MarketRadarDailyKeyTake;
  districtHighlights: readonly MarketRadarDistrictHighlight[];
  keyTakeaways: readonly string[];
  newsItems: readonly MarketRadarNewsItem[];
  publicCharts: readonly MarketRadarChart[];
  proContent: {
    title: string;
    description: string;
    benefits: readonly string[];
  };
  freePlan: MarketRadarFreePlan;
  currentQuarter: MarketRadarQuarter;
  downloadBundle: {
    id: "current-full-report";
    reportId: string;
    title: string;
    formats: readonly ["PNG", "PDF"];
    freeCreditCost: number;
  };
  downloads: readonly {
    id: "brief-png" | "analysis-pdf";
    title: string;
    description: string;
    format: "PNG" | "PDF";
    access: "full-report";
  }[];
  pricing: MarketRadarPricing;
  access: MarketRadarAccess;
};

export const marketRadarReport: MarketRadarReport = {
  id: "kaohsiung-2026-08-29",
  date: "2026.08.29",
  updatedAt: "07:30 更新",
  title: "高雄房市快報",
  subtitle: "Kaohsiung Housing Brief",
  summary: "給房產從業者與關注高雄房市的人，快速掌握市場變化。",
  source: {
    mode: "mock",
    futureJsonPath: "/data/market-radar/2026-08-29.json",
  },
  marketTemperature: {
    label: "中性",
    description: "買方仍在場，但決策更重視總價、產品條件與可談空間。",
    indicators: [
      { id: "transactionHeat", label: "成交熱度", value: "↓", trend: "down", detail: "看屋與出價節奏放慢" },
      { id: "priceMomentum", label: "價格動能", value: "→", trend: "steady", detail: "核心產品仍有支撐" },
      { id: "negotiationSpace", label: "議價空間", value: "↑", trend: "up", detail: "條件差異拉開成交結果" },
    ],
  },
  dailyKeyTake: {
    text: "高雄房市持續量縮，\n但不同區域的買氣開始明顯分化。",
    lineCount: 2,
  },
  districtHighlights: [
    { district: "01｜左營", headline: "中古屋量縮，但自住詢問維持", note: "生活機能成熟與總價帶，仍是買方比較的核心。", detail: { id: "district-zuoying", category: "區域分析", title: "左營｜中古屋量縮，但自住詢問維持", summary: "成熟生活機能與總價帶仍讓左營維持穩定的自住比較需求。", analysis: { summary: "展示資料顯示，買方更重視屋況、生活機能與總價的平衡，而非單純追逐區域熱度。", impact: "市場從廣泛詢問轉為更精準的產品篩選。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲"] }, source: { name: "Mock district observation", publishedAt: "2026.08.29", dataPeriod: "2026 Q3", verifiedAt: "Mock verification pending" }, isMock: true } },
    { district: "02｜楠梓", headline: "科技題材仍有支撐，追價力道降溫", note: "需求持續觀望，產品條件與入手價格更被放大檢視。", detail: { id: "district-nanzih", category: "區域分析", title: "楠梓｜科技題材有支撐，追價力道降溫", summary: "科技題材持續支撐關注度，但買方對入手價格與產品條件更加謹慎。", analysis: { summary: "展示資料以觀望需求為情境，說明區域故事仍需回到個案條件與付款能力。", impact: "高討論度不必然等同快速成交。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲", "投資人"] }, source: { name: "Mock district observation", publishedAt: "2026.08.29", dataPeriod: "2026 Q3", verifiedAt: "Mock verification pending" }, isMock: true } },
    { district: "03｜鳳山", headline: "總價型產品成交相對有韌性", note: "可負擔的產品更容易進入實質洽談。", detail: { id: "district-fengshan", category: "區域分析", title: "鳳山｜總價型產品成交相對有韌性", summary: "可負擔總價與清楚產品定位，讓部分買方更願意進入實質洽談。", analysis: { summary: "展示資料反映總價與月付壓力，是影響買方行動的優先判斷條件。", impact: "具競爭力的總價帶更容易形成有效溝通。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲"] }, source: { name: "Mock district observation", publishedAt: "2026.08.29", dataPeriod: "2026 Q3", verifiedAt: "Mock verification pending" }, isMock: true } },
  ],
  keyTakeaways: [
    "「現在不是沒有買方，而是買方更挑價格。」",
    "「區域分化比全高雄平均數字更值得看。」",
    "「議價空間正在回來，但不是所有產品都一樣。」",
  ],
  newsItems: [
    { id: "policy", category: "政策", title: "市場觀望下，政策訊號仍是信心的重要變數", summary: "本期以政策觀察框架呈現，等待正式資料來源接入。", source: "Mock source placeholder", updatedAt: "07:20", detail: { id: "news-policy", category: "政策", title: "市場觀望下，政策訊號仍是信心的重要變數", summary: "本期以政策觀察框架呈現，等待正式來源接入。", analysis: { summary: "政策資訊會影響市場預期，但展示階段不對實際政策做任何判讀。", impact: "可作為客戶溝通時的觀察題目。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲", "投資人"] }, source: { name: "Mock source", publishedAt: "2026.08.29", dataPeriod: "展示期間", verifiedAt: "Mock verification pending" }, isMock: true } },
    { id: "mortgage", category: "房貸", title: "貸款條件與月付壓力持續影響決策節奏", summary: "買方更常同時比較自備款、核貸條件與持有成本。", source: "Mock source placeholder", updatedAt: "07:10", detail: { id: "news-mortgage", category: "房貸", title: "貸款條件與月付壓力持續影響決策節奏", summary: "買方更常同時比較自備款、核貸條件與持有成本。", analysis: { summary: "展示資料用以說明決策條件，而非提供個別房貸建議。", impact: "付款能力會影響產品篩選與看屋節奏。", impactLevel: "中", affectedAudience: ["買方", "房仲"] }, source: { name: "Mock source", publishedAt: "2026.08.29", dataPeriod: "展示期間", verifiedAt: "Mock verification pending" }, isMock: true } },
    { id: "price-registry", category: "實價", title: "實價資訊需回到產品、屋況與交易時間逐筆解讀", summary: "平均數僅作方向判讀，不取代個案比價。", source: "Mock source placeholder", updatedAt: "07:00", detail: { id: "news-price-registry", category: "實價", title: "實價資訊需回到產品、屋況與交易時間逐筆解讀", summary: "平均數僅作方向判讀，不取代個案比價。", analysis: { summary: "展示資料提醒讀者，同一區域的產品條件會造成數字解讀差異。", impact: "有助於把平均數帶回個案溝通。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲", "投資人"] }, source: { name: "Mock source", publishedAt: "2026.08.29", dataPeriod: "展示期間", verifiedAt: "Mock verification pending" }, isMock: true } },
    { id: "development", category: "建案", title: "新案供給節奏影響區域比較與買方選擇", summary: "本期為展示資料，未串接真實建案或交易資料。", source: "Mock source placeholder", updatedAt: "06:50", detail: { id: "news-development", category: "建案", title: "新案供給節奏影響區域比較與買方選擇", summary: "供給節奏會改變買方比較的基準與產品選項。", analysis: { summary: "展示資料用來預留建案資訊日後的分析入口。", impact: "可作為區域競品與產品定位的補充脈絡。", impactLevel: "低", affectedAudience: ["買方", "屋主", "房仲"] }, source: { name: "Mock source", publishedAt: "2026.08.29", dataPeriod: "展示期間", verifiedAt: "Mock verification pending" }, isMock: true } },
    { id: "district", category: "區域", title: "不同生活圈的價格敏感度正在拉開", summary: "以區域視角建立後續市場觀測脈絡。", source: "Mock source placeholder", updatedAt: "06:40", detail: { id: "news-district", category: "區域", title: "不同生活圈的價格敏感度正在拉開", summary: "不同生活圈的價格敏感度正在拉開。", analysis: { summary: "展示資料說明後續會以生活圈與產品條件，而非全市單一平均數觀察市場。", impact: "更精準的區域訊息有助於建立市場開場話題。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲", "投資人"] }, source: { name: "Mock source", publishedAt: "2026.08.29", dataPeriod: "展示期間", verifiedAt: "Mock verification pending" }, isMock: true } },
  ],
  publicCharts: [
    { id: "transaction-heat", title: "成交熱度", subtitle: "最近四個觀測期 · 展示資料", labels: ["W1", "W2", "W3", "W4"], values: [74, 61, 57, 48], detail: { id: "chart-transaction-heat", category: "公開圖表", title: "成交熱度｜展示分析", summary: "以最近四個觀測期呈現展示用的成交熱度變化。", analysis: { summary: "目前柱狀資料僅供 UI 與閱讀節奏展示，不代表真實交易量。", impact: "未來可協助快速理解市場活躍度變化。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲", "投資人"] }, source: { name: "Mock chart source", publishedAt: "2026.08.29", dataPeriod: "最近四個觀測期", verifiedAt: "Mock verification pending" }, isMock: true } },
    { id: "price-momentum", title: "價格動能", subtitle: "核心產品相對平穩 · 展示資料", labels: ["5月", "6月", "7月", "8月"], values: [56, 57, 55, 55], detail: { id: "chart-price-momentum", category: "公開圖表", title: "價格動能｜展示分析", summary: "以四個月的展示值說明價格動能的閱讀方式。", analysis: { summary: "圖表的目的在於預留不同資料期間與指標解讀的呈現方式。", impact: "未來能協助比較區域或產品的價格節奏。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲", "投資人"] }, source: { name: "Mock chart source", publishedAt: "2026.08.29", dataPeriod: "2026.05–2026.08", verifiedAt: "Mock verification pending" }, isMock: true } },
    { id: "district-comparison", title: "區域比較", subtitle: "買氣觀察指標 · 展示資料", labels: ["左營", "楠梓", "鳳山", "其他"], values: [63, 58, 61, 46], detail: { id: "chart-district-comparison", category: "公開圖表", title: "區域比較｜展示分析", summary: "以展示指標呈現各區域比較的資料閱讀方式。", analysis: { summary: "同一區域的真實分析仍須納入產品、屋況、交易期間等資料。", impact: "未來可協助建立區域比較與市場溝通素材。", impactLevel: "中", affectedAudience: ["買方", "屋主", "房仲", "投資人"] }, source: { name: "Mock chart source", publishedAt: "2026.08.29", dataPeriod: "2026 Q3", verifiedAt: "Mock verification pending" }, isMock: true } },
  ],
  proContent: {
    title: "MARKET RADAR PRO",
    description: "需要更頻繁使用房市快報？升級 Pro 即可於訂閱期間無限下載。",
    benefits: ["完整區域分析", "成交量趨勢", "價格動能圖", "議價空間分析", "實價比較", "專業圖表", "PNG 快報", "PDF 完整報告", "歷史報告下載"],
  },
  freePlan: {
    downloadsPerQuarter: 1,
    includesPng: true,
    includesPdf: true,
    creditsCarryOver: false,
  },
  currentQuarter: {
    id: "2026-Q3",
    label: "Q3 免費下載額度",
    quarterStart: "2026-07-01",
    quarterEnd: "2026-09-30",
    nextQuarterLabel: "2026 Q4",
  },
  downloadBundle: {
    id: "current-full-report",
    reportId: "kaohsiung-2026-08-29",
    title: "本期完整報告",
    formats: ["PNG", "PDF"],
    freeCreditCost: 1,
  },
  downloads: [
    { id: "brief-png", title: "PNG 快報", description: "適合 LINE、社群分享、客戶溝通與快速轉傳。", format: "PNG", access: "full-report" },
    { id: "analysis-pdf", title: "PDF 完整報告", description: "適合完整閱讀、客戶說明、提案、市場簡報與留存。", format: "PDF", access: "full-report" },
  ],
  pricing: {
    monthlyPrice: 40,
    annualPrice: 360,
    monthlyDurationDays: 30,
    annualDurationDays: 365,
    annualEquivalentMonthly: 30,
  },
  access: {
    freeQuarterlyDownloadsAllowed: 1,
    freeQuarterlyDownloadsUsed: 0,
    freeQuarterlyDownloadsRemaining: 1,
    hasActiveMonthlySubscription: false,
    hasActiveAnnualSubscription: false,
  },
};

export function hasFreeQuarterlyCredit(report: MarketRadarReport): boolean {
  return resolveMarketRadarAccess(report.access).hasFreeQuarterlyCredit;
}

export function hasMarketRadarProAccess(report: MarketRadarReport): boolean {
  return resolveMarketRadarAccess(report.access).hasActiveProSubscription;
}

export function resolveMarketRadarAccess(access: MarketRadarAccess) {
  const hasActiveProSubscription = access.hasActiveMonthlySubscription || access.hasActiveAnnualSubscription;
  const hasFreeQuarterlyCredit = access.freeQuarterlyDownloadsRemaining > 0;
  return {
    hasActiveProSubscription,
    hasFreeQuarterlyCredit,
    canDownloadWithPro: hasActiveProSubscription,
    canDownloadCurrentFullReport: hasActiveProSubscription || hasFreeQuarterlyCredit,
    isFreeQuarterlyCreditExhausted: !hasActiveProSubscription && !hasFreeQuarterlyCredit,
  };
}

export function canDownloadMarketRadarReport(report: MarketRadarReport): boolean {
  return resolveMarketRadarAccess(report.access).canDownloadCurrentFullReport;
}
