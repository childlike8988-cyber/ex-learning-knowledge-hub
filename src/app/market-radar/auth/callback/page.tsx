import type { Metadata } from "next";
import { MarketRadarAuthCallback } from "@/components/MarketRadarAuthCallback";

export const metadata: Metadata = {
  title: "Market Radar 帳戶登入｜E.X",
  robots: { index: false, follow: false },
};

/** Static GitHub Pages callback shell. Supabase finishes the browser session client-side. */
export default function MarketRadarAuthCallbackRoute() {
  return <MarketRadarAuthCallback />;
}
