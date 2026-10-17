import type { NextApiResponse } from "next";
import { getCategoriesByDbValue } from "@/lib/categories";
import { canonicalArticleSlug } from "@/lib/seo";
import { TOPIC_HUBS, topicHubPathsForArticle } from "@/lib/topicHubs";

/**
 * Article fields used to choose which pages to refresh.
 * `previousSlug` is the slug before an edit when it may have changed.
 * `previous` is the listing fields from before the edit, so an author,
 * category, language, or hub-keyword change refreshes both sides.
 */
export type ArticleRevalidateInput = {
  slug: string;
  category?: string | null;
  customAuthor?: string | null;
  language?: string | null;
  title?: string | null;
  content?: string | null;
  tags?: string | null;
  focusKeyword?: string | null;
  previousSlug?: string | null;
  previous?: {
    category?: string | null;
    customAuthor?: string | null;
    language?: string | null;
    title?: string | null;
    content?: string | null;
    tags?: string | null;
    focusKeyword?: string | null;
  } | null;
};

/**
 * Pages regenerated with res.revalidate.
 *
 * ISR: the article itself, the homepage, category pages, and topic hubs.
 * Homepage and hubs use a 120s revalidate as a backstop; this refresh makes
 * a publish show up without waiting for that window.
 *
 * getServerSideProps listings (/articles, /hindi, /author/[slug], /authors)
 * are not included. res.revalidate throws for those. They use a short
 * s-maxage instead.
 */
function listingPaths(article: {
  language?: string | null;
  category?: string | null;
  title?: string | null;
  content?: string | null;
  tags?: string | null;
  focusKeyword?: string | null;
}): string[] {
  if (article.language === "hi") return [];
  const paths = ["/"];
  getCategoriesByDbValue(article.category).forEach((category) => {
    paths.push(`/category/${category.slug}`);
  });
  paths.push(...topicHubPathsForArticle(article));
  return paths;
}

function candidatePaths(article: ArticleRevalidateInput): string[] {
  const paths = [`/articles/${canonicalArticleSlug(article.slug)}`];

  if (article.previousSlug) {
    const previous = `/articles/${canonicalArticleSlug(article.previousSlug)}`;
    if (previous !== paths[0]) paths.push(previous);
  }

  paths.push(...listingPaths(article));
  if (article.previous) {
    paths.push(...listingPaths(article.previous));
  }

  return paths;
}

const TOPIC_HUB_PATHS = new Set(
  Object.values(TOPIC_HUBS).map((hub) => hub.canonicalPath)
);

/** Article pages, the homepage, category pages, and topic hubs are ISR. */
function isIsrPath(path: string): boolean {
  if (path === "/") return true;
  if (TOPIC_HUB_PATHS.has(path)) return true;
  if (/^\/articles\/[^/]+$/.test(path)) return true;
  if (/^\/category\/[^/]+$/.test(path)) return true;
  return false;
}

export function articleRevalidatePaths(article: ArticleRevalidateInput): string[] {
  return Array.from(new Set(candidatePaths(article).filter(isIsrPath)));
}

/**
 * Regenerate ISR pages for this article.
 * A failed path is logged and ignored so the API response still succeeds.
 * Must be awaited inside the request: res.revalidate cannot run after the
 * function returns.
 */
export async function revalidateArticlePaths(
  res: NextApiResponse,
  article: ArticleRevalidateInput
): Promise<void> {
  await Promise.allSettled(
    articleRevalidatePaths(article).map(async (path) => {
      try {
        await res.revalidate(path);
      } catch (error) {
        console.error(`On-demand revalidate failed for ${path}:`, error);
      }
    })
  );
}
