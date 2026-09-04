export type MembershipPlan = "guest" | "free" | "pro";
export type EffectivePlan = Exclude<MembershipPlan, "guest">;
export type MembershipStatus = "active" | "inactive" | "expired";

export type Membership = {
  plan: EffectivePlan;
  status: MembershipStatus;
  startsAt: string;
  endsAt?: string;
};

/** Provider-neutral identity used by Market Radar domain/UI code. */
export type IdentityUser = {
  id: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
};

/** @deprecated Use IdentityUser in new code. Kept for Phase 2F-0 compatibility. */
export type AuthUser = IdentityUser;

export type AuthSession = {
  authenticated: boolean;
  user?: IdentityUser;
  provider: "supabase" | "future-provider" | "local-mock" | "none";
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

export type ReportUnlock = {
  reportId: string;
  quarterKey: string;
  unlockType: "free-quarterly";
  unlockedAt: string;
};

export type QuarterlyEntitlement = {
  membership: Membership;
  reportId: string;
  downloadState: Exclude<MarketRadarDownloadState, "guest-login-required">;
  credit: QuarterlyDownloadCreditState;
};

export type UnlockResultStatus =
  | "unlocked"
  | "already-unlocked"
  | "credit-exhausted"
  | "pro-ready"
  | "invalid-report"
  | "unauthenticated"
  | "membership-unavailable";

export type UnlockResult = {
  status: UnlockResultStatus;
  reportId: string;
  quarterKey?: string;
  remainingCredit?: 0 | 1;
  unlimited: boolean;
  safeMessage: string;
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

export type AuthSignInMethod = "google" | "email-otp";

export type AuthActionResult = {
  status: "redirecting" | "otp-sent" | "authenticated" | "signed-out" | "unavailable" | "failed";
  safeMessage: string;
  session?: AuthSession;
};

export type MarketRadarAuthStatus = "loading" | "guest" | "authenticated" | "unavailable";

/**
 * Future providers must implement this adapter. The static site never treats
 * the local mock adapter as secure production authentication.
 */
export interface AuthProviderAdapter {
  getSession(): Promise<AuthSession>;
  signIn(method: AuthSignInMethod, options?: { email?: string; redirectTo?: string }): Promise<AuthActionResult>;
  verifyEmailOtp?(email: string, token: string): Promise<AuthActionResult>;
  signOut(): Promise<AuthActionResult>;
  getAccountState(): Promise<AccountState>;
}

export interface MarketRadarEntitlementProvider {
  getEffectiveMembership(): Promise<Membership>;
  getQuarterlyEntitlement(reportId: string): Promise<QuarterlyEntitlement>;
  unlockReport(reportId: string): Promise<UnlockResult>;
}
