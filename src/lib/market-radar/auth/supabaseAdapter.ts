"use client";

import type { AuthChangeEvent, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { getMarketRadarAuthCallbackUrl, getSupabaseBrowserClient } from "./supabaseClient";
import type { AccountState, AuthActionResult, AuthProviderAdapter, AuthSession, IdentityUser } from "./types";

export function mapSupabaseUserToIdentityUser(user: User): IdentityUser {
  const metadata = user.user_metadata ?? {};
  const displayName = typeof metadata.full_name === "string" ? metadata.full_name : typeof metadata.name === "string" ? metadata.name : user.email?.split("@")[0];
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : typeof metadata.picture === "string" ? metadata.picture : undefined;
  return { id: user.id, ...(displayName ? { displayName } : {}), ...(user.email ? { email: user.email } : {}), ...(avatarUrl ? { avatarUrl } : {}) };
}

export function mapSupabaseSession(session: Session | null): AuthSession {
  if (!session?.user) return { authenticated: false, provider: "none", isMock: false };
  return { authenticated: true, user: mapSupabaseUserToIdentityUser(session.user), provider: "supabase", isMock: false };
}

function unavailable(message: string): AuthActionResult {
  return { status: "unavailable", safeMessage: message };
}

function failed(message: string): AuthActionResult {
  return { status: "failed", safeMessage: message };
}

/**
 * Production browser adapter. It owns only Supabase SDK calls and maps their
 * result to provider-neutral Market Radar contracts. Authenticated users are
 * intentionally shown as Free until trusted membership persistence exists.
 */
export function createSupabaseAuthProviderAdapter(client: SupabaseClient | undefined = getSupabaseBrowserClient()): AuthProviderAdapter | undefined {
  if (!client) return undefined;

  return {
    async getSession() {
      const { data, error } = await client.auth.getSession();
      if (error) throw new Error("AUTH_SESSION_UNAVAILABLE");
      return mapSupabaseSession(data.session);
    },
    async getAccountState(): Promise<AccountState> {
      const session = await this.getSession();
      // Membership is intentionally not read from the browser or persistence yet.
      return { authenticated: session.authenticated, plan: session.authenticated ? "free" : "guest", session };
    },
    async signIn(method, options = {}) {
      try {
        const redirectTo = options.redirectTo ?? getMarketRadarAuthCallbackUrl();
        if (!redirectTo) return unavailable("登入服務目前無法建立安全回呼網址。");

        if (method === "google") {
          const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
          return error ? failed("Google 登入暫時無法開始，請稍後再試。") : { status: "redirecting", safeMessage: "正在前往 Google 完成登入。" };
        }

        const email = options.email?.trim();
        if (!email) return failed("請輸入可收取驗證碼的 Email。" );
        const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
        return error ? failed("驗證碼暫時無法寄送，請確認 Email 或稍後再試。") : { status: "otp-sent", safeMessage: "6 位數驗證碼已寄出，請在此完成驗證。" };
      } catch {
        return unavailable("登入服務暫時無法使用，請稍後再試。");
      }
    },
    async verifyEmailOtp(email, token) {
      try {
        const { data, error } = await client.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: "email" });
        if (error || !data.session) return failed("驗證碼無效或已過期，請重新取得驗證碼。" );
        return { status: "authenticated", safeMessage: "登入完成。", session: mapSupabaseSession(data.session) };
      } catch {
        return unavailable("驗證服務暫時無法使用，請稍後再試。");
      }
    },
    async signOut() {
      try {
        const { error } = await client.auth.signOut();
        return error ? failed("登出暫時無法完成，請稍後再試。") : { status: "signed-out", safeMessage: "已登出。" };
      } catch {
        return unavailable("登出服務暫時無法使用，請稍後再試。");
      }
    },
  };
}

export function subscribeToSupabaseAuthChanges(client: SupabaseClient, callback: (event: AuthChangeEvent, session: AuthSession) => void): () => void {
  const { data } = client.auth.onAuthStateChange((event, session) => callback(event, mapSupabaseSession(session)));
  return () => data.subscription.unsubscribe();
}
