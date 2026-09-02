"use client";

import { useEffect, useState } from "react";
import { getMarketRadarHomePath, getSupabaseBrowserClient } from "@/lib/market-radar/auth/supabaseClient";

export function MarketRadarAuthCallback() {
  const [message, setMessage] = useState("正在完成登入…");

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setMessage("登入服務尚未設定。請回到 Market Radar 後再試。"
      );
      return;
    }

    const code = new URLSearchParams(window.location.search).get("code");
    const finish = async () => {
      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage("登入回呼無法完成，請重新嘗試登入。"
          );
          return;
        }
      }
      const { data, error } = await client.auth.getSession();
      if (error || !data.session) {
        setMessage("找不到有效登入 session，請回到 Market Radar 重新登入。"
        );
        return;
      }
      window.location.replace(getMarketRadarHomePath());
    };
    void finish();
  }, []);

  return <main className="market-radar-auth-callback" aria-live="polite"><section><p className="market-radar-kicker">MARKET RADAR ACCOUNT</p><h1>帳戶登入</h1><p>{message}</p></section></main>;
}
