import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  MOI_REAL_PRICE_SOURCE_ID,
  type MarketRadarMoiLiveData,
} from "@/lib/market-radar/sources/moi-real-price";

const liveDataPath = join(process.cwd(), "public", "data", "market-radar", "live", "moi-real-price-latest.json");

function updatingLiveData(warning: string): MarketRadarMoiLiveData {
  return {
    status: "updating",
    dataStatus: "updating",
    sourceId: MOI_REAL_PRICE_SOURCE_ID,
    freshness: {
      status: "aging",
      label: "官方資料更新中",
      expectedUpdateFrequency: "irregular",
    },
    metrics: { districtTransactionCounts: [] },
    methodology: {
      transactionCountDefinition: "等待已驗證的官方批次檔案匯入後顯示。",
      kaohsiungFilter: "等待已驗證的高雄市官方資料檔案。",
      excludedSpecialTransactions: false,
      notes: ["Live JSON 尚未產製；既有 Fixture Report 維持正常顯示。"],
    },
    warning,
  };
}

function isMoiLiveData(value: unknown): value is MarketRadarMoiLiveData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<MarketRadarMoiLiveData>;
  return data.status === "live"
    && data.dataStatus === "live"
    && data.sourceId === MOI_REAL_PRICE_SOURCE_ID
    && typeof data.generatedAt === "string"
    && typeof data.sourcePublishedAt === "string"
    && typeof data.dataPeriodStart === "string"
    && typeof data.dataPeriodEnd === "string"
    && typeof data.verifiedAt === "string"
    && typeof data.retrievedAt === "string"
    && typeof data.methodologyVersion === "string"
    && Boolean(data.source && data.source.isMock === false)
    && typeof data.metrics?.transactionCount === "number"
    && Array.isArray(data.metrics.districtTransactionCounts);
}

export function loadMarketRadarLiveData(): MarketRadarMoiLiveData {
  if (!existsSync(liveDataPath)) return updatingLiveData("尚未匯入已驗證的內政部官方批次資料。");

  try {
    const parsed: unknown = JSON.parse(readFileSync(liveDataPath, "utf8"));
    if (isMoiLiveData(parsed)) return parsed;
  } catch {
    // The public page must remain available when an operator places an invalid file.
  }

  return updatingLiveData("官方 Live 資料檔未通過驗證，目前等待重新產製。");
}
