import type { MarketRadarReport } from "@/data/market-radar";
import { getQuarterKey } from "./quarter";
import type { MarketRadarReportAvailability } from "./types";

function reportDateToLocalDate(value: string): Date | undefined {
  const match = value.match(/^(\d{4})[.-](\d{2})[.-](\d{2})$/);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * Public, metadata-only availability. This intentionally does not inspect a
 * local export directory or expose an artifact path from a static build.
 */
export function getMarketRadarReportAvailability(report: MarketRadarReport): MarketRadarReportAvailability {
  const reportDate = reportDateToLocalDate(report.date);
  const quarterKey = reportDate ? getQuarterKey(reportDate) : report.currentQuarter.id;
  const isAvailable = report.status !== "fallback" && Boolean(report.downloadBundle.reportId);
  return {
    reportId: report.downloadBundle.reportId,
    reportDate: report.date,
    quarterKey,
    isAvailable,
    availableFormats: ["share-bundle", "pdf"],
    status: isAvailable ? "ready-for-backend" : "preparing",
  };
}
