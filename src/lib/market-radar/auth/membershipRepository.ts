"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MarketRadarEntitlementProvider,
  Membership,
  MembershipStatus,
  QuarterlyDownloadCreditState,
  QuarterlyEntitlement,
  UnlockResultStatus,
} from "./types";

type DbRecord = Record<string, unknown>;

const membershipStatuses = new Set<MembershipStatus>(["active", "inactive", "expired"]);

function asRecord(value: unknown): DbRecord {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || typeof candidate !== "object") throw new Error("ENTITLEMENT_RESPONSE_INVALID");
  return candidate as DbRecord;
}

function requiredString(row: DbRecord, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || !value) throw new Error("ENTITLEMENT_RESPONSE_INVALID");
  return value;
}

function optionalString(row: DbRecord, key: string): string | undefined {
  const value = row[key];
  return typeof value === "string" && value ? value : undefined;
}

function integer(row: DbRecord, key: string): number {
  const value = row[key];
  if (typeof value !== "number" || !Number.isInteger(value)) throw new Error("ENTITLEMENT_RESPONSE_INVALID");
  return value;
}

function mapMembership(row: DbRecord): Membership {
  const plan = requiredString(row, "effective_plan");
  const status = requiredString(row, "membership_status");
  if ((plan !== "free" && plan !== "pro") || !membershipStatuses.has(status as MembershipStatus)) throw new Error("MEMBERSHIP_RESPONSE_INVALID");
  const endsAt = optionalString(row, "ends_at");
  return {
    plan,
    status: status as MembershipStatus,
    startsAt: requiredString(row, "starts_at"),
    ...(endsAt ? { endsAt } : {}),
  };
}

function mapDownloadState(value: string): QuarterlyEntitlement["downloadState"] {
  const states: Record<string, QuarterlyEntitlement["downloadState"]> = {
    free_credit_available: "free-credit-available",
    free_report_unlocked: "free-report-unlocked",
    free_credit_exhausted: "free-credit-exhausted",
    pro_ready: "pro-ready",
    download_unavailable: "download-unavailable",
  };
  const state = states[value];
  if (!state) throw new Error("ENTITLEMENT_STATUS_INVALID");
  return state;
}

function mapQuarterlyEntitlement(value: unknown): QuarterlyEntitlement {
  const row = asRecord(value);
  const reportId = requiredString(row, "report_id");
  const downloadState = mapDownloadState(requiredString(row, "status"));
  if (downloadState === "download-unavailable") return { reportId, downloadState };
  const quarterKey = requiredString(row, "quarter_key");
  const totalCredits = integer(row, "total_credits");
  const usedCredits = integer(row, "used_credits");
  const remainingCredits = integer(row, "remaining_credits");
  if (!/^\d{4}-Q[1-4]$/.test(quarterKey) || totalCredits !== 1 || ![0, 1].includes(usedCredits) || ![0, 1].includes(remainingCredits)) throw new Error("ENTITLEMENT_RESPONSE_INVALID");
  const unlockedReportId = optionalString(row, "unlocked_report_id");
  const unlockedAt = optionalString(row, "unlocked_at");
  const credit: QuarterlyDownloadCreditState = {
    quarterKey,
    totalCredits,
    usedCredits,
    remainingCredits,
    ...(unlockedReportId ? { unlockedReportId } : {}),
    ...(unlockedAt ? { unlockedAt } : {}),
    isMock: false,
  };
  return { membership: mapMembership(row), reportId, downloadState, credit };
}

function mapUnlockStatus(value: string): UnlockResultStatus {
  const statuses: Record<string, UnlockResultStatus> = {
    unlocked: "unlocked",
    already_unlocked: "already-unlocked",
    credit_exhausted: "credit-exhausted",
    pro_ready: "pro-ready",
    invalid_report: "invalid-report",
    unauthenticated: "unauthenticated",
    membership_unavailable: "membership-unavailable",
  };
  const status = statuses[value];
  if (!status) throw new Error("UNLOCK_STATUS_INVALID");
  return status;
}

function unlockMessage(status: UnlockResultStatus): string {
  if (status === "unlocked") return "本季完整報告已解鎖；同一期 PNG 與 PDF 共用此權益。";
  if (status === "already-unlocked") return "本期報告已解鎖，不會再次扣除季度額度。";
  if (status === "credit-exhausted") return "本季免費額度已用於另一份報告。";
  if (status === "pro-ready") return "Pro 會員可存取已準備的完整報告。";
  if (status === "invalid-report") return "本期完整報告尚未開放。";
  if (status === "unauthenticated") return "請先登入後再解鎖完整報告。";
  return "會員權益暫時無法確認；下載功能已安全停用。";
}

export function createMarketRadarEntitlementProvider(client: SupabaseClient): MarketRadarEntitlementProvider {
  return {
    async getEffectiveMembership() {
      const { data, error } = await client.rpc("ensure_market_radar_membership");
      if (error) throw new Error("MEMBERSHIP_UNAVAILABLE");
      return mapMembership(asRecord(data));
    },
    async getQuarterlyEntitlement(reportId) {
      const { data, error } = await client.rpc("get_market_radar_entitlement", { p_report_id: reportId });
      if (error) throw new Error("ENTITLEMENT_UNAVAILABLE");
      return mapQuarterlyEntitlement(data);
    },
    async unlockReport(reportId) {
      const { data, error } = await client.rpc("unlock_market_radar_report", { p_report_id: reportId });
      if (error) throw new Error("UNLOCK_UNAVAILABLE");
      const row = asRecord(data);
      const status = mapUnlockStatus(requiredString(row, "status"));
      const remaining = row.remaining_credit;
      const quarterKey = optionalString(row, "quarter_key");
      return {
        status,
        reportId: optionalString(row, "report_id") ?? reportId,
        ...(quarterKey ? { quarterKey } : {}),
        ...(remaining === 0 || remaining === 1 ? { remainingCredit: remaining } : {}),
        unlimited: row.unlimited === true,
        safeMessage: unlockMessage(status),
      };
    },
  };
}
