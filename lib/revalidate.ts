import { dangerouslyDeleteByTag } from "@vercel/functions";
import type { NextApiResponse } from "next";
import { getCategoriesByDbValue } from "@/lib/categories";
import {
  CRAWLER_FILES_CACHE_TAG,
  listingHtmlCacheTag,
} from "@/lib/publicCache";
import { canonicalArticleSlug } from "@/lib/seo";
import { civicUpdatesPathForArticle } from "@/lib/civicUpdates";
import { topicHubPathsForArticle } from "@/lib/topicHubs";

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
 * ISR: the article itself and the homepage. The homepage uses a 600s
 * revalidate as a backstop; this refresh makes a publish show up without
 * waiting for that window.
 *
 * Category archives and topic hubs are getServerSideProps so ?page=N can
 * render on the server. res.revalidate throws for those. Publish drops their
 * listing HTML cache tag instead. /articles, /hindi, /author/[slug], and
 * /authors stay on the ten-minute s-maxage window and are not tagged here.
 *
 * /llms.txt, /llms-full.txt, and /news-sitemap.xml are getServerSideProps too,
 * so they are not listed here. Publish drops their CDN tag instead.
 */
function homepagePath(article: { language?: string | null }): string[] {
  if (article.language === "hi") return [];
  return ["/"];
}

function paginatedListingPaths(article: {
  language?: string | null;
  category?: string | null;
  title?: string | null;
  content?: string | null;
  tags?: string | null;
  focusKeyword?: string | null;
}): string[] {
  if (article.language === "hi") return [];
  const paths: string[] = [];
  getCategoriesByDbValue(article.category).forEach((category) => {
    paths.push(`/category/${category.slug}`);
  });
  paths.push(...topicHubPathsForArticle(article));
  return paths;
}

function civicListingPaths(article: {
  slug?: string | null;
  title?: string | null;
  content?: string | null;
  category?: string | null;
  tags?: string | null;
  focusKeyword?: string | null;
}): string[] {
  const path = civicUpdatesPathForArticle(article);
  return path ? [path] : [];
}

/** Cache tags for the category archives and topic hubs this article appears on. */
export function listingHtmlCacheTags(article: ArticleRevalidateInput): string[] {
  const paths = [
    ...paginatedListingPaths(article),
    ...civicListingPaths(article),
  ];
  if (article.previous) {
    paths.push(...paginatedListingPaths(article.previous));
    paths.push(
      ...civicListingPaths({
        ...article.previous,
        slug: article.previousSlug || article.slug,
      })
    );
  }
  return Array.from(new Set(paths.map((path) => listingHtmlCacheTag(path))));
}

function candidatePaths(article: ArticleRevalidateInput): string[] {
  const paths = [`/articles/${canonicalArticleSlug(article.slug)}`];

  if (article.previousSlug) {
    const previous = `/articles/${canonicalArticleSlug(article.previousSlug)}`;
    if (previous !== paths[0]) paths.push(previous);
  }

  paths.push(...homepagePath(article));
  if (article.previous) {
    paths.push(...homepagePath(article.previous));
  }

  return paths;
}

/** Article pages and the homepage are ISR. Paginated listings are not. */
function isIsrPath(path: string): boolean {
  if (path === "/") return true;
  if (/^\/articles\/[^/]+$/.test(path)) return true;
  return false;
}

export function articleRevalidatePaths(article: ArticleRevalidateInput): string[] {
  return Array.from(new Set(candidatePaths(article).filter(isIsrPath)));
}

/** Drop cached category and topic-hub HTML, including every ?page=N. */
async function revalidateListingHtml(
  article: ArticleRevalidateInput
): Promise<void> {
  await Promise.all(
    listingHtmlCacheTags(article).map(async (tag) => {
      try {
        await dangerouslyDeleteByTag(tag);
      } catch (error) {
        console.error(`On-demand revalidate failed for ${tag}:`, error);
      }
    })
  );
}

/**
 * Drop the cached llms files and news sitemap.
 * res.revalidate throws for those getServerSideProps routes. Deleting the tag
 * makes the next fetch render the current stories instead of the previous
 * body. Outside Vercel this is a no-op, and the routes' s-maxage is the
 * backstop (about two minutes for the news sitemap, ten for the llms files).
 */
async function revalidateCrawlerFiles(): Promise<void> {
  try {
    await dangerouslyDeleteByTag(CRAWLER_FILES_CACHE_TAG);
  } catch (error) {
    console.error(
      `On-demand revalidate failed for ${CRAWLER_FILES_CACHE_TAG}:`,
      error
    );
  }
}

/**
 * Regenerate ISR pages for this article, drop cached listing HTML, and drop
 * the cached crawler files.
 * A failed path is logged and ignored so the API response still succeeds.
 * Must be awaited inside the request: res.revalidate cannot run after the
 * function returns.
 */
export async function revalidateArticlePaths(
  res: NextApiResponse,
  article: ArticleRevalidateInput
): Promise<void> {
  await Promise.allSettled([
    ...articleRevalidatePaths(article).map(async (path) => {
      try {
        await res.revalidate(path);
      } catch (error) {
        console.error(`On-demand revalidate failed for ${path}:`, error);
      }
    }),
    revalidateCrawlerFiles(),
    revalidateListingHtml(article),
  ]);
}
