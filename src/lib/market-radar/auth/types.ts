export type MembershipPlan = "guest" | "free" | "pro";

export type AuthUser = {
  id: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
};

export type AuthSession = {
  authenticated: boolean;
  user?: AuthUser;
  provider: "future-provider" | "local-mock" | "none";
  isMock: boolean;
};

export type AccountState = {
  authenticated: boolean;
  plan: MembershipPlan;
  session: AuthSession;
};

export type QuarterlyDownloadCreditState = {
  quarterKey: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  unlockedReportId?: string;
  unlockedAt?: string;
  isMock: boolean;
};

export type MarketRadarReportAvailability = {
  reportId: string;
  reportDate: string;
  quarterKey: string;
  isAvailable: boolean;
  availableFormats: readonly ["share-bundle", "pdf"];
  status: "ready-for-backend" | "preparing";
};

export type MarketRadarDownloadState =
  | "guest-login-required"
  | "free-credit-available"
  | "free-report-unlocked"
  | "free-credit-exhausted"
  | "pro-ready"
  | "download-unavailable";

export type MarketRadarDownloadEntitlementState = {
  status: MarketRadarDownloadState;
  requiresLogin: boolean;
  canUnlockFreeReport: boolean;
  canDownloadUnlimited: boolean;
  canAccessReport: boolean;
  quarterlyCreditAvailable: boolean;
  ctaLabel: string;
  reason: string;
  reportId: string;
};

export type MarketRadarDownloadFormat = "share-bundle" | "pdf" | "all";

export type MarketRadarDownloadRequest = {
  reportId: string;
  format: MarketRadarDownloadFormat;
};

export type MarketRadarDownloadRequestResult = {
  status: "NOT_IMPLEMENTED";
  errorCode: "REQUIRES_BACKEND";
  reportId: string;
  format: MarketRadarDownloadFormat;
  safeMessage: string;
};

/**
 * Future providers must implement this adapter. The static site never treats
 * the local mock adapter as secure production authentication.
 */
export interface AuthProviderAdapter {
  getSession(): Promise<AuthSession>;
  signIn(): Promise<AuthSession>;
  signOut(): Promise<void>;
  getAccountState(): Promise<AccountState>;
}
