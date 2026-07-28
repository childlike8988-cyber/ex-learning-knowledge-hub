import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = { title: "E.X Learning & Knowledge Hub", description: "公開知識與互動學習入口網站" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body><Header /><main>{children}</main><Footer /></body></html>;
}
