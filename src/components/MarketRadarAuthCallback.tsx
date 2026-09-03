"use client";

import { useEffect, useRef, useState } from "react";
import { getMarketRadarHomePath, getSupabaseBrowserClient } from "@/lib/market-radar/auth/supabaseClient";

export function MarketRadarAuthCallback() {
  const [message, setMessage] = useState("正在完成登入…");
  const [failed, setFailed] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    const client = getSupabaseBrowserClient();
    if (!client) {
      setMessage("登入服務尚未設定。請回到 Market Radar 後再試。"
      );
      setFailed(true);
      return;
    }

    const code = new URLSearchParams(window.location.search).get("code");
    const finish = async () => {
      if (code) {
        // Keep the code out of the visible callback URL before the async exchange.
        window.history.replaceState({}, document.title, window.location.pathname);
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage("登入回呼無法完成，請重新嘗試登入。"
          );
          setFailed(true);
          return;
        }
      }
      const { data, error } = await client.auth.getSession();
      if (error || !data.session) {
        setMessage("找不到有效登入 session，請回到 Market Radar 重新登入。"
        );
        setFailed(true);
        return;
      }
      window.location.replace(getMarketRadarHomePath());
    };
    void finish().catch(() => {
      setMessage("登入回呼暫時無法完成，請回到 Market Radar 重新嘗試。"
      );
      setFailed(true);
    });
  }, []);

  return <main className="market-radar-auth-callback" aria-live="polite"><section><p className="market-radar-kicker">MARKET RADAR ACCOUNT</p><h1>帳戶登入</h1><p>{message}</p>{failed && <a href={getMarketRadarHomePath()}>返回 Market Radar 重新登入</a>}</section></main>;
}
