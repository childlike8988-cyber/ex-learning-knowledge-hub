"use client";

import { usePathname } from "next/navigation";
import { publicAssetPath } from "@/lib/paths";

export type GlobalTechBackgroundVariant = "platform" | "academy" | "course";

function getBackgroundVariant(pathname: string): GlobalTechBackgroundVariant {
  const normalizedPathname = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  if (
    normalizedPathname === "/creator-academy" ||
    normalizedPathname === "/creator-academy/resources"
  ) {
    return "academy";
  }

  if (normalizedPathname.startsWith("/creator-academy/")) return "course";

  return "platform";
}

export function GlobalTechBackground() {
  const variant = getBackgroundVariant(usePathname());

  return <div aria-hidden="true" className={`global-tech-background global-tech-background--${variant}`}>
    <div className="global-tech-background__base" />
    <div className="global-tech-background__texture" style={{ backgroundImage: `url(${publicAssetPath("/images/creator-academy/hero-circuit-background.png")})` }} />
    <div className="global-tech-background__flow" />
    <div className="global-tech-background__aurora" />
    <div className="global-tech-background__mask" />
  </div>;
}
