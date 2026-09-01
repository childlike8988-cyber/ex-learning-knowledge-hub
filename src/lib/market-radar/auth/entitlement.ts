import type {
  AccountState,
  MarketRadarDownloadEntitlementState,
  MarketRadarDownloadRequest,
  MarketRadarDownloadRequestResult,
  MarketRadarReportAvailability,
  QuarterlyDownloadCreditState,
} from "./types";

export type MarketRadarDownloadEntitlementInput = {
  account: AccountState;
  report: MarketRadarReportAvailability;
  quarterState: QuarterlyDownloadCreditState;
};

/**
 * Pure state evaluator only. It neither writes quarterly usage nor grants a
 * file URL; both operations require a future trusted backend.
 */
export function evaluateMarketRadarDownloadEntitlement({ account, report, quarterState }: MarketRadarDownloadEntitlementInput): MarketRadarDownloadEntitlementState {
  if (!report.isAvailable) {
    return { status: "download-unavailable", requiresLogin: false, canUnlockFreeReport: false, canDownloadUnlimited: false, canAccessReport: false, quarterlyCreditAvailable: false, ctaLabel: "完整報告準備中", reason: "本期報告尚未通過可提供下載的準備條件。", reportId: report.reportId };
  }

  if (!account.authenticated || account.plan === "guest") {
    return { status: "guest-login-required", requiresLogin: true, canUnlockFreeReport: false, canDownloadUnlimited: false, canAccessReport: false, quarterlyCreditAvailable: false, ctaLabel: "本季免費下載完整報告", reason: "下載完整報告需先登入。", reportId: report.reportId };
  }

  if (account.plan === "pro") {
    return { status: "pro-ready", requiresLogin: false, canUnlockFreeReport: false, canDownloadUnlimited: true, canAccessReport: true, quarterlyCreditAvailable: false, ctaLabel: "下載完整報告", reason: "Pro 會員可不限季度額度存取已準備的完整報告。", reportId: report.reportId };
  }

  const sameReportUnlocked = quarterState.unlockedReportId === report.reportId;
  if (sameReportUnlocked) {
    return { status: "free-report-unlocked", requiresLogin: false, canUnlockFreeReport: false, canDownloadUnlimited: false, canAccessReport: true, quarterlyCreditAvailable: false, ctaLabel: "已解鎖本期報告", reason: "同一期報告的 PNG 分享圖文與 PDF 完整報告共用一次季度解鎖。", reportId: report.reportId };
  }

  if (quarterState.remainingCredits > 0) {
    return { status: "free-credit-available", requiresLogin: false, canUnlockFreeReport: true, canDownloadUnlimited: false, canAccessReport: false, quarterlyCreditAvailable: true, ctaLabel: "本季免費解鎖完整報告", reason: "本季尚有 1 次完整報告解鎖額度，會同時包含 PNG 分享圖文與 PDF。", reportId: report.reportId };
  }

  return { status: "free-credit-exhausted", requiresLogin: false, canUnlockFreeReport: false, canDownloadUnlimited: false, canAccessReport: false, quarterlyCreditAvailable: false, ctaLabel: "本季免費額度已使用", reason: "本季已下載。下一次免費額度將於下個自然季度開放；本季免費額度已用於另一份報告，額度不跨季度累積。", reportId: report.reportId };
}

/** Future protected-download boundary. No file path, URL, token or credential is returned in Phase 2F-0. */
export function requestMarketRadarDownload(request: MarketRadarDownloadRequest): MarketRadarDownloadRequestResult {
  return { status: "NOT_IMPLEMENTED", errorCode: "REQUIRES_BACKEND", reportId: request.reportId, format: request.format, safeMessage: "正式下載需由未來的安全登入、權限與受保護檔案服務處理。" };
}
