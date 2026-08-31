import type { MarketRadarFreshness, MarketRadarSource } from "@/data/market-radar";

export const CBC_HOUSING_FINANCE_SOURCE_ID = "cbc-housing-finance";
export const CBC_HOUSING_FINANCE_SOURCE_PAGE_URL = "https://www.cbc.gov.tw/tw/lp-302-1.html";

export const CBC_HOUSING_FINANCE_SOURCE_CONFIG = {
  sourceId: CBC_HOUSING_FINANCE_SOURCE_ID,
  name: "中央銀行房貸與購屋貸款統計",
  publisher: "中央銀行",
  datasetName: "五大銀行新承做放款金額與利率統計表",
  priority: "official",
  type: "government",
  isPrimarySource: true,
  expectedUpdateFrequency: "monthly",
  sourcePageUrl: CBC_HOUSING_FINANCE_SOURCE_PAGE_URL,
  attachmentDiscovery: "從官方發布頁即時辨識 XLSX 附件；不固定附件 URL。",
  notes: "資料單位依中央銀行附件：新台幣百萬元、年息百分比率。月資料有發布與統計期間差，非即時房貸報價。",
} as const;

export type MarketRadarHousingFinanceRecord = {
  id: string;
  period: string;
  mortgageRate?: number;
  newMortgageAmount?: number;
  /** Keep the two official measures explicit; neither value is silently converted. */
  unit: {
    mortgageRate: "percent";
    newMortgageAmount: "million-twd";
  };
  sourceId: typeof CBC_HOUSING_FINANCE_SOURCE_ID;
  sourceRecordId?: string;
  publishedAt?: string;
  dataPeriodStart: string;
  dataPeriodEnd: string;
  isLive: true;
};

export type MarketRadarCbcLiveData = {
  status: "live" | "updating";
  dataStatus: "live" | "updating";
  sourceId: typeof CBC_HOUSING_FINANCE_SOURCE_ID;
  generatedAt?: string;
  sourcePublishedAt?: string;
  dataPeriodStart?: string;
  dataPeriodEnd?: string;
  verifiedAt?: string;
  source?: MarketRadarSource;
  freshness: MarketRadarFreshness;
  latest?: {
    period: string;
    mortgageRate?: number;
    newMortgageAmount?: number;
    mortgageRateChangePercentagePoints?: number;
  };
  history: readonly {
    period: string;
    mortgageRate?: number;
    newMortgageAmount?: number;
  }[];
  methodology: { notes: readonly string[] };
  warning?: string;
};

export function createCbcHousingFinanceSource(metadata: {
  publishedAt: string;
  dataPeriodStart: string;
  dataPeriodEnd: string;
  verifiedAt: string;
  retrievedAt: string;
}): MarketRadarSource {
  return {
    id: CBC_HOUSING_FINANCE_SOURCE_ID,
    name: CBC_HOUSING_FINANCE_SOURCE_CONFIG.name,
    publisher: CBC_HOUSING_FINANCE_SOURCE_CONFIG.publisher,
    type: "government",
    priority: "official",
    url: CBC_HOUSING_FINANCE_SOURCE_PAGE_URL,
    publishedAt: metadata.publishedAt,
    dataPeriodStart: metadata.dataPeriodStart,
    dataPeriodEnd: metadata.dataPeriodEnd,
    verifiedAt: metadata.verifiedAt,
    retrievedAt: metadata.retrievedAt,
    expectedUpdateFrequency: "monthly",
    notes: CBC_HOUSING_FINANCE_SOURCE_CONFIG.notes,
    isPrimarySource: true,
    isMock: false,
  };
}
