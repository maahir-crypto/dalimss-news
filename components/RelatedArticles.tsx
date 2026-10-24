// components/RelatedArticles.tsx
// Displays 4-6 related articles for internal linking

import Link from "next/link";
import Image from "next/image";
import { decodeEntities } from "@/lib/decodeEntities";
import { formatDateIST } from "@/lib/seo";
import { articlePath } from "@/lib/publicPaths";
import { getCategoriesByDbValue } from "@/lib/categories";
import { isOptimizableImageSrc } from "@/lib/optimizableImage";

interface RelatedArticle {
  id: number;
  slug: string;
  title: string;
  mediaUrl?: string | null;
  createdAt: string;
  category?: string | null;
  customAuthor?: string | null;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
  heading?: string;
  itemLang?: string;
  moreLink?: { href: string; label: string } | null;
}

export function RelatedArticles({
  articles,
  heading = "Related Stories",
  itemLang,
  moreLink,
}: RelatedArticlesProps) {
  const stories = articles || [];
  if (stories.length === 0 && !moreLink) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      {stories.length > 0 && (
        <h2 className="mb-5 font-serif text-xl font-bold uppercase tracking-[0.08em] text-gray-900">
          {heading}
        </h2>
      )}
      {moreLink && (
        <p className={stories.length > 0 ? "mb-4 text-sm" : "text-sm"}>
          <Link
            href={moreLink.href}
            className="font-semibold text-red-700 hover:text-red-800"
          >
            {moreLink.label}
          </Link>
        </p>
      )}
      {stories.length > 0 && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {stories.map((article) => {
          const title = decodeEntities(article.title);
          const category = getCategoriesByDbValue(article.category)[0];
          const categoryName =
            itemLang === "hi" && category?.nameHi
              ? category.nameHi
              : category?.name || article.category;

          return (
          <Link
            key={article.id}
            href={articlePath(article.slug)}
            className="group flex gap-4 rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
          >
            {article.mediaUrl && (
              <div className="relative aspect-[3/2] w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {isOptimizableImageSrc(article.mediaUrl) ? (
                  <Image
                    src={article.mediaUrl}
                    alt={title}
                    fill
                    sizes="112px"
                    quality={70}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={article.mediaUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {categoryName && (
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700">
                  {categoryName}
                </span>
              )}
              <h3
                lang={itemLang}
                className="mt-1 line-clamp-2 font-serif text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-700"
              >
                {title}
              </h3>
              <time
                className="mt-1 block text-xs text-gray-500"
                dateTime={article.createdAt}
              >
                {formatDateIST(article.createdAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </div>
          </Link>
          );
        })}
      </div>
      )}
    </section>
  );
}
