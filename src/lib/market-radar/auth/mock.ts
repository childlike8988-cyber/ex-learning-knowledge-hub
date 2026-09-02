import type { AccountState, AuthActionResult, AuthProviderAdapter, AuthSession, MembershipPlan, QuarterlyDownloadCreditState } from "./types";

export const MARKET_RADAR_LOCAL_AUTH_STATE_LABEL = "DEMO / LOCAL AUTH STATE";

export function createLocalMockAccount(plan: MembershipPlan): AccountState {
  const authenticated = plan !== "guest";
  const session: AuthSession = {
    authenticated,
    ...(authenticated ? { user: { id: `local-${plan}`, displayName: plan === "pro" ? "Pro Preview" : "Free Preview" } } : {}),
    provider: authenticated ? "local-mock" : "none",
    isMock: true,
  };
  return { authenticated, plan, session };
}

export function createLocalQuarterlyCreditState(quarterKey: string, options: { used?: boolean; unlockedReportId?: string } = {}): QuarterlyDownloadCreditState {
  const usedCredits = options.used ? 1 : 0;
  return { quarterKey, totalCredits: 1, usedCredits, remainingCredits: Math.max(0, 1 - usedCredits), ...(options.unlockedReportId ? { unlockedReportId: options.unlockedReportId, unlockedAt: "LOCAL-MOCK" } : {}), isMock: true };
}

/** Development-only in-memory adapter. It holds no password, token or persisted session. */
export function createLocalMockAuthAdapter(initialPlan: MembershipPlan = "guest"): AuthProviderAdapter {
  let account = createLocalMockAccount(initialPlan);
  return {
    async getSession() { return account.session; },
    async signIn(): Promise<AuthActionResult> { return { status: "unavailable", safeMessage: "本機 preview 不會建立正式登入或 session。" }; },
    async signOut(): Promise<AuthActionResult> { account = createLocalMockAccount("guest"); return { status: "signed-out", safeMessage: "已結束本機 preview 狀態。" }; },
    async getAccountState() { return account; },
  };
}
