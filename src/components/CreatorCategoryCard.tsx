import Image from "next/image";
import Link from "next/link";
import type { CreatorCategory } from "@/data/creator-platform";
import { publicAssetPath } from "@/lib/paths";

export function CreatorCategoryCard({ category }: { category: CreatorCategory }) {
  return <Link href={category.href} className={`creator-category-card creator-category-card--${category.tone} group`}>
    <div className="creator-category-card__visual"><Image src={publicAssetPath(category.previewImage)} alt={category.previewAlt} width={1200} height={675} unoptimized className="creator-category-card__image" /><span className="creator-category-card__veil" /><span className="creator-category-card__code">{category.code}</span><span className="creator-category-card__arrow" aria-hidden="true">↗</span></div>
    <div className="creator-category-card__body"><h3>{category.title}</h3><p>{category.description}</p><span className="creator-category-card__link">進入分類 <b aria-hidden="true">→</b></span></div>
  </Link>;
}
