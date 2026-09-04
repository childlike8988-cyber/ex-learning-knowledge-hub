import type { Metadata } from "next";
import "./globals.css";
import "./ai-learning/ai-learning.css";
import { Footer } from "@/components/Footer";
import { GlobalTechBackground } from "@/components/GlobalTechBackground";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL("https://excreatorstudio.com/"),
  title: "E.X Creator Studio | Learning & Knowledge Hub",
  description: "整合 AI 創作、短影音製作與系統化學習的專業平台。",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body><GlobalTechBackground /><div className="app-shell"><Header /><main>{children}</main><Footer /></div></body></html>;
}
