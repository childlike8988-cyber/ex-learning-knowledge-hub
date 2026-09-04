"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseAuthProviderAdapter, subscribeToSupabaseAuthChanges } from "./supabaseAdapter";
import { getSupabaseBrowserClient, isSupabaseAuthConfigured } from "./supabaseClient";
import type { AccountState, AuthActionResult, MarketRadarAuthStatus } from "./types";

export type MarketRadarAuthController = {
  status: MarketRadarAuthStatus;
  account?: AccountState;
  safeMessage?: string;
  signInWithGoogle(): Promise<AuthActionResult>;
  requestEmailOtp(email: string): Promise<AuthActionResult>;
  verifyEmailOtp(email: string, token: string): Promise<AuthActionResult>;
  signOut(): Promise<AuthActionResult>;
};

export function useMarketRadarAuth({ enabled = true }: { enabled?: boolean } = {}): MarketRadarAuthController {
  const configured = enabled && isSupabaseAuthConfigured();
  const client = useMemo(() => enabled ? getSupabaseBrowserClient() : undefined, [enabled]);
  const adapter = useMemo(() => createSupabaseAuthProviderAdapter(client), [client]);
  const [status, setStatus] = useState<MarketRadarAuthStatus>("loading");
  const [account, setAccount] = useState<AccountState>();
  const [safeMessage, setSafeMessage] = useState<string>();

  const restore = useCallback(async () => {
    if (!configured || !adapter || !client) {
      setStatus("unavailable");
      setSafeMessage("登入服務尚未設定或暫時無法使用；公開 Market Radar 內容仍可瀏覽。"
      );
      return;
    }
    setStatus("loading");
    try {
      const nextAccount = await adapter.getAccountState();
      setAccount(nextAccount);
      setStatus(nextAccount.authenticated ? "authenticated" : "guest");
      setSafeMessage(undefined);
    } catch {
      setStatus("unavailable");
      setSafeMessage("帳戶服務暫時無法確認，下載與帳戶功能已安全停用。"
      );
    }
  }, [adapter, client, configured]);

  useEffect(() => {
    void restore();
    if (!client || !adapter) return;
    return subscribeToSupabaseAuthChanges(client, (_event, session) => {
      if (!session.authenticated) {
        setAccount({ authenticated: false, plan: "guest", session });
        setStatus("guest");
        setSafeMessage(undefined);
        return;
      }
      window.setTimeout(() => void restore(), 0);
    });
  }, [adapter, client, restore]);

  const unavailable = useCallback(async (): Promise<AuthActionResult> => ({ status: "unavailable", safeMessage: "登入服務尚未設定或暫時無法使用。" }), []);
  const signInWithGoogle = useCallback(() => adapter ? adapter.signIn("google") : unavailable(), [adapter, unavailable]);
  const requestEmailOtp = useCallback((email: string) => adapter ? adapter.signIn("email-otp", { email }) : unavailable(), [adapter, unavailable]);
  const verifyEmailOtp = useCallback((email: string, token: string) => adapter?.verifyEmailOtp ? adapter.verifyEmailOtp(email, token) : unavailable(), [adapter, unavailable]);
  const signOut = useCallback(async () => {
    const result = adapter ? await adapter.signOut() : await unavailable();
    if (result.status === "signed-out") await restore();
    return result;
  }, [adapter, restore, unavailable]);

  return { status, account, safeMessage, signInWithGoogle, requestEmailOtp, verifyEmailOtp, signOut };
}
