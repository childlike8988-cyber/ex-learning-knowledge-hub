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
};

export type MarketRadarChart = {
  id: "transaction-heat" | "price-momentum" | "district-comparison";
  title: string;
  subtitle: string;
  values: readonly number[];
  labels: readonly string[];
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
  districtHighlights: readonly {
    district: string;
    headline: string;
    note: string;
  }[];
  keyTakeaways: readonly string[];
  newsItems: readonly MarketRadarNewsItem[];
  publicCharts: readonly MarketRadarChart[];
  proContent: {
    title: string;
    description: string;
    benefits: readonly string[];
  };
  downloads: readonly {
    id: "brief-png" | "analysis-pdf";
    title: string;
    description: string;
    format: "PNG" | "PDF";
    access: "pro";
  }[];
  pricing: {
    singlePrice: number;
    annualPrice: number;
    annualDurationDays: number;
    annualEquivalentMonthly: number;
  };
  access: {
    hasPurchasedCurrentReport: boolean;
    hasActiveAnnualSubscription: boolean;
  };
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
  districtHighlights: [
    { district: "01｜左營", headline: "中古屋量縮，但自住詢問維持", note: "生活機能成熟與總價帶，仍是買方比較的核心。" },
    { district: "02｜楠梓", headline: "科技題材仍有支撐，追價力道降溫", note: "需求持續觀望，產品條件與入手價格更被放大檢視。" },
    { district: "03｜鳳山", headline: "總價型產品成交相對有韌性", note: "可負擔的產品更容易進入實質洽談。" },
  ],
  keyTakeaways: [
    "「現在不是沒有買方，而是買方更挑價格。」",
    "「區域分化比全高雄平均數字更值得看。」",
    "「議價空間正在回來，但不是所有產品都一樣。」",
  ],
  newsItems: [
    { id: "policy", category: "政策", title: "市場觀望下，政策訊號仍是信心的重要變數", summary: "本期以政策觀察框架呈現，等待正式資料來源接入。", source: "Mock source placeholder", updatedAt: "07:20" },
    { id: "mortgage", category: "房貸", title: "貸款條件與月付壓力持續影響決策節奏", summary: "買方更常同時比較自備款、核貸條件與持有成本。", source: "Mock source placeholder", updatedAt: "07:10" },
    { id: "price-registry", category: "實價", title: "實價資訊需回到產品、屋況與交易時間逐筆解讀", summary: "平均數僅作方向判讀，不取代個案比價。", source: "Mock source placeholder", updatedAt: "07:00" },
    { id: "development", category: "建案", title: "新案供給節奏影響區域比較與買方選擇", summary: "本期為展示資料，未串接真實建案或交易資料。", source: "Mock source placeholder", updatedAt: "06:50" },
    { id: "district", category: "區域", title: "不同生活圈的價格敏感度正在拉開", summary: "以區域視角建立後續市場觀測脈絡。", source: "Mock source placeholder", updatedAt: "06:40" },
  ],
  publicCharts: [
    { id: "transaction-heat", title: "成交熱度", subtitle: "最近四個觀測期 · 展示資料", labels: ["W1", "W2", "W3", "W4"], values: [74, 61, 57, 48] },
    { id: "price-momentum", title: "價格動能", subtitle: "核心產品相對平穩 · 展示資料", labels: ["5月", "6月", "7月", "8月"], values: [56, 57, 55, 55] },
    { id: "district-comparison", title: "區域比較", subtitle: "買氣觀察指標 · 展示資料", labels: ["左營", "楠梓", "鳳山", "其他"], values: [63, 58, 61, 46] },
  ],
  proContent: {
    title: "MARKET RADAR PRO",
    description: "解鎖完整市場分析、專業圖表與可下載報告。",
    benefits: ["完整區域分析", "成交量趨勢", "價格動能圖", "議價空間分析", "實價比較", "專業圖表", "PNG 快報", "PDF 完整報告", "歷史報告下載"],
  },
  downloads: [
    { id: "brief-png", title: "下載今日快報 PNG", description: "適合快速分享的 Report Card。", format: "PNG", access: "pro" },
    { id: "analysis-pdf", title: "下載完整分析 PDF", description: "保留完整閱讀脈絡的 Article Report。", format: "PDF", access: "pro" },
  ],
  pricing: {
    singlePrice: 30,
    annualPrice: 360,
    annualDurationDays: 365,
    annualEquivalentMonthly: 30,
  },
  access: {
    hasPurchasedCurrentReport: false,
    hasActiveAnnualSubscription: false,
  },
};

export function canDownloadMarketRadarPro(report: MarketRadarReport): boolean {
  return report.access.hasPurchasedCurrentReport || report.access.hasActiveAnnualSubscription;
}
