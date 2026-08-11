import Image from "next/image";
import { publicAssetPath } from "@/lib/paths";

const personalBrandHubUrl = "https://childlike8988-cyber.github.io/ex-personal-brand-hub/";

export function PersonalBrandShowcaseFloat() {
  return <a
    className="personal-brand-showcase-float"
    href={personalBrandHubUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="開啟 Ernest 個人品牌展示站"
  >
    <span className="personal-brand-showcase-float__live" aria-hidden="true"><i /> LIVE SITE</span>
    <span className="personal-brand-showcase-float__visual" aria-hidden="true">
      <Image
        src={publicAssetPath("/images/ex-personal-brand.png")}
        alt=""
        fill
        sizes="(max-width: 639px) 128px, (max-width: 899px) 192px, 250px"
      />
    </span>
    <span className="personal-brand-showcase-float__tooltip" aria-hidden="true">
      <strong>Ernest 個人品牌站</strong>
      <small>Personal Brand Showcase</small>
      <b>開啟展示站 ↗</b>
    </span>
  </a>;
}
