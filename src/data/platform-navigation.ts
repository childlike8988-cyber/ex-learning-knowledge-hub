export type PlatformNavigationItem = {
  id: string;
  index: string;
  titleZh: string;
  titleEn: string;
  description: string;
  status: string;
  href?: string;
  comingSoon: boolean;
  category: string;
};

export const platformNavigationItems: readonly PlatformNavigationItem[] = [
  { id: "ai-video-studio", index: "01", titleZh: "AI 影片製作", titleEn: "AI Video Studio", description: "AI 影片生成、自動剪輯與內容製作。", status: "Enter Studio", href: "/ex-galaxy-ui/", comingSoon: false, category: "AI PRODUCTION" },
  { id: "creator-academy", index: "02", titleZh: "創作者學院", titleEn: "Creator Academy", description: "AI 生圖、影片、攝影與創作教學。", status: "Open Learning", href: "/creator-academy/", comingSoon: false, category: "LEARNING" },
  { id: "creator-toolkit", index: "03", titleZh: "YUNI 創作工具箱", titleEn: "Creator Toolkit", description: "提示詞、運鏡與拍攝資源。", status: "Open Toolkit", href: "/creator-academy/resources/", comingSoon: false, category: "CREATOR TOOLS" },
  { id: "ai-app-ecosystem", index: "04", titleZh: "AI App 生態", titleEn: "AI App Ecosystem", description: "學習工具、AI 快報與房仲應用。", status: "Explore Apps", href: "#learning-apps", comingSoon: false, category: "ECOSYSTEM" },
  { id: "voice-studio", index: "05", titleZh: "E.X Voice Studio", titleEn: "Voice Studio", description: "AI 語音與聲音創作中心。", status: "Coming Soon", comingSoon: true, category: "VOICE" },
  { id: "galaxy-ui", index: "06", titleZh: "E.X Galaxy", titleEn: "Galaxy UI", description: "未來 AI 創作與自動化控制中心。", status: "Coming Soon", comingSoon: true, category: "FUTURE SYSTEM" },
];
