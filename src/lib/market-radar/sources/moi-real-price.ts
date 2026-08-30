import type { MarketRadarFreshness, MarketRadarSource } from "@/data/market-radar";

export const MOI_REAL_PRICE_SOURCE_ID = "moi-real-price-sales";
export const MOI_REAL_PRICE_OFFICIAL_URL = "https://plvr.land.moi.gov.tw/DownloadOpenData";

export const MOI_REAL_PRICE_SOURCE_CONFIG = {
  sourceId: MOI_REAL_PRICE_SOURCE_ID,
  name: "內政部不動產實價登錄",
  publisher: "內政部地政司",
  datasetName: "不動產實價登錄買賣案件批次開放資料",
  priority: "official",
  isPrimarySource: true,
  expectedUpdateFrequency: "irregular",
  officialUrl: MOI_REAL_PRICE_OFFICIAL_URL,
  notes: "官方 Open Data 為每月 1 日、11 日、21 日公布當期靜態資料；實際可用批次以官方公告與授權下載頁為準。",
} as const;

export type MarketRadarRealEstateTransaction = {
  id: string;
  district: string;
  transactionDate: string;
  transactionTarget: string;
  buildingType?: string;
  totalPrice: number;
  unitPricePerSquareMeter?: number;
  buildingAreaSquareMeters?: number;
  landAreaSquareMeters?: number;
  parkingPrice?: number;
  buildingCompletionDate?: string;
  rawSourceId: typeof MOI_REAL_PRICE_SOURCE_ID;
  sourceRecordId: string;
  isLive: true;
};

export type MarketRadarDistrictTransactionCount = { district: string; transactionCount: number };

export type MarketRadarMoiLiveData = {
  status: "live" | "updating";
  dataStatus: "live" | "updating";
  sourceId: typeof MOI_REAL_PRICE_SOURCE_ID;
  generatedAt?: string;
  sourcePublishedAt?: string;
  dataPeriodStart?: string;
  dataPeriodEnd?: string;
  verifiedAt?: string;
  source?: MarketRadarSource;
  freshness: MarketRadarFreshness;
  metrics: {
    transactionCount?: number;
    districtTransactionCounts: readonly MarketRadarDistrictTransactionCount[];
  };
  methodology: {
    transactionCountDefinition: string;
    kaohsiungFilter: string;
    excludedSpecialTransactions: boolean;
    notes: readonly string[];
  };
  warning?: string;
};

export function createMoiLiveSource(metadata: {
  publishedAt: string;
  dataPeriodStart: string;
  dataPeriodEnd: string;
  verifiedAt: string;
  retrievedAt: string;
}): MarketRadarSource {
  return {
    id: MOI_REAL_PRICE_SOURCE_ID,
    name: MOI_REAL_PRICE_SOURCE_CONFIG.name,
    publisher: MOI_REAL_PRICE_SOURCE_CONFIG.publisher,
    type: "public-record",
    priority: "official",
    url: MOI_REAL_PRICE_OFFICIAL_URL,
    publishedAt: metadata.publishedAt,
    dataPeriodStart: metadata.dataPeriodStart,
    dataPeriodEnd: metadata.dataPeriodEnd,
    verifiedAt: metadata.verifiedAt,
    retrievedAt: metadata.retrievedAt,
    expectedUpdateFrequency: "irregular",
    notes: MOI_REAL_PRICE_SOURCE_CONFIG.notes,
    isPrimarySource: true,
    isMock: false,
  };
}

export function squareMetersToPing(squareMeters: number): number {
  return squareMeters / 3.305785;
}

export function pricePerSquareMeterToTenThousandPerPing(pricePerSquareMeter: number): number {
  return (pricePerSquareMeter * 3.305785) / 10_000;
}
