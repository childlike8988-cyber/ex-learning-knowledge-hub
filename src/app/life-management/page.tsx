import type { Metadata } from "next";
import { LifeManagementPage } from "@/components/LifeManagementPage";
export const metadata: Metadata = { title: "生活管理｜E.X Learning & Knowledge Hub", description: "從運動、情緒與早餐開始，建立能長期維持的生活節奏。" };
export default function Page() { return <LifeManagementPage />; }
