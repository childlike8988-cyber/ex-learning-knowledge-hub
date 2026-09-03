"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { buildMarketRadarAuthCallbackUrl, buildMarketRadarHomePath } from "./callbackUrl";

type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

let browserClient: SupabaseClient | undefined;

/**
 * Only the Supabase URL plus anon/publishable browser key are read here.
 * Service-role keys, database passwords and OAuth client secrets must never
 * be prefixed NEXT_PUBLIC_ or included in this static application.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();
  return url && publishableKey ? { url, publishableKey } : undefined;
}

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(getSupabasePublicConfig());
}

export function getSupabaseBrowserClient(): SupabaseClient | undefined {
  if (typeof window === "undefined") return undefined;
  const config = getSupabasePublicConfig();
  if (!config) return undefined;
  browserClient ??= createClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
  return browserClient;
}

function getBasePath(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

/** Exact redirect path to register in Supabase Auth Redirect URLs. */
export function getMarketRadarAuthCallbackUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return buildMarketRadarAuthCallbackUrl(window.location.origin, getBasePath());
}

export function getMarketRadarHomePath(): string {
  return buildMarketRadarHomePath(getBasePath());
}
