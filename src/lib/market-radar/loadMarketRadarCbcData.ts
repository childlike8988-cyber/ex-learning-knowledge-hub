import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CBC_HOUSING_FINANCE_SOURCE_ID, type MarketRadarCbcLiveData } from "@/lib/market-radar/sources/cbc-housing-finance";

const liveDataPath = join(process.cwd(), "public", "data", "market-radar", "live", "cbc-housing-finance-latest.json");

function updatingCbcData(warning: string): MarketRadarCbcLiveData {
  return {
    status: "updating",
    dataStatus: "updating",
    sourceId: CBC_HOUSING_FINANCE_SOURCE_ID,
    freshness: { status: "aging", label: "房貸資料更新中", expectedUpdateFrequency: "monthly" },
    history: [],
    methodology: { notes: ["CBC Live JSON 尚未產製；Fixture 與其他已驗證 Live source 維持正常顯示。"] },
    warning,
  };
}

function isCbcLiveData(value: unknown): value is MarketRadarCbcLiveData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<MarketRadarCbcLiveData>;
  return data.status === "live"
    && data.dataStatus === "live"
    && data.sourceId === CBC_HOUSING_FINANCE_SOURCE_ID
    && typeof data.generatedAt === "string"
    && typeof data.sourcePublishedAt === "string"
    && typeof data.dataPeriodStart === "string"
    && typeof data.dataPeriodEnd === "string"
    && typeof data.verifiedAt === "string"
    && Boolean(data.source && data.source.isMock === false)
    && Boolean(data.latest && typeof data.latest.period === "string")
    && Array.isArray(data.history);
}

export function loadMarketRadarCbcData(): MarketRadarCbcLiveData {
  if (!existsSync(liveDataPath)) return updatingCbcData("尚未匯入已驗證的中央銀行房貸統計檔案。");
  try {
    const parsed: unknown = JSON.parse(readFileSync(liveDataPath, "utf8"));
    if (isCbcLiveData(parsed)) return parsed;
  } catch {
    // Static export must remain available when an operator places an invalid live file.
  }
  return updatingCbcData("中央銀行 Live 資料檔未通過驗證，目前等待重新產製。");
}
