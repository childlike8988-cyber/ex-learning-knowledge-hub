"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createMarketRadarEntitlementProvider } from "./membershipRepository";
import { getSupabaseBrowserClient } from "./supabaseClient";
import type { QuarterlyEntitlement, UnlockResult } from "./types";

type PersistenceStatus = "idle" | "loading" | "ready" | "unavailable";

export type MarketRadarEntitlementController = {
  status: PersistenceStatus;
  entitlement?: QuarterlyEntitlement;
  safeMessage?: string;
  refresh(): Promise<void>;
  unlockReport(): Promise<UnlockResult | undefined>;
};

export function useMarketRadarEntitlement({ reportId, enabled }: { reportId: string; enabled: boolean }): MarketRadarEntitlementController {
  const client = useMemo(() => enabled ? getSupabaseBrowserClient() : undefined, [enabled]);
  const provider = useMemo(() => client ? createMarketRadarEntitlementProvider(client) : undefined, [client]);
  const [status, setStatus] = useState<PersistenceStatus>(enabled ? "loading" : "idle");
  const [entitlement, setEntitlement] = useState<QuarterlyEntitlement>();
  const [safeMessage, setSafeMessage] = useState<string>();

  const refresh = useCallback(async () => {
    if (!enabled || !provider || !reportId) {
      setStatus("idle");
      setEntitlement(undefined);
      return;
    }
    setStatus("loading");
    try {
      const next = await provider.getQuarterlyEntitlement(reportId);
      setEntitlement(next);
      setSafeMessage(undefined);
      setStatus("ready");
    } catch {
      setEntitlement(undefined);
      setSafeMessage("會員權益與季度額度暫時無法確認；下載功能已安全停用。");
      setStatus("unavailable");
    }
  }, [enabled, provider, reportId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const unlockReport = useCallback(async () => {
    if (!enabled || !provider || !reportId) return undefined;
    try {
      const result = await provider.unlockReport(reportId);
      await refresh();
      return result;
    } catch {
      setSafeMessage("報告解鎖暫時無法完成；季度額度未被視為已使用。");
      setStatus("unavailable");
      return undefined;
    }
  }, [enabled, provider, refresh, reportId]);

  return { status, entitlement, safeMessage, refresh, unlockReport };
}
