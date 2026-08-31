import type { MarketRadarAutomationJobId } from "@/lib/market-radar/automation/types";

export const MARKET_RADAR_AUTOMATION_ENABLED = false as const;

export const marketRadarAutomationJobs: readonly {
  id: MarketRadarAutomationJobId;
  sourceId: "moi-real-price-sales" | "cbc-housing-finance";
  enabled: false;
  purpose: string;
}[] = [
  { id: "moi-latest-refresh", sourceId: "moi-real-price-sales", enabled: false, purpose: "檢查並更新最新內政部高雄市買賣批次資料。" },
  { id: "moi-history-backfill", sourceId: "moi-real-price-sales", enabled: false, purpose: "補齊已驗證的前期內政部高雄市買賣歷史基準。" },
  { id: "cbc-monthly-refresh", sourceId: "cbc-housing-finance", enabled: false, purpose: "檢查並更新中央銀行月度購屋貸款統計。" },
];
