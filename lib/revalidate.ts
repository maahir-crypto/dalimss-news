import type { NextApiResponse } from "next";
import { getCategoriesByDbValue } from "@/lib/categories";
import { authorSlug, canonicalArticleSlug } from "@/lib/seo";

/**
 * Article fields used to choose which pages to refresh.
 * `previousSlug` is the slug before an edit when it may have changed.
 */
export type ArticleRevalidateInput = {
  slug: string;
  category?: string | null;
  customAuthor?: string | null;
  language?: string | null;
  previousSlug?: string | null;
};

/**
 * Same relative paths as indexNowUrlsForArticle, plus the previous article
 * path when an edit changes the canonical slug.
 *
 * Hindi articles list on /hindi and the author page. English articles list
 * on /, /articles, category pages, and the author page.
 */
function candidatePaths(article: ArticleRevalidateInput): string[] {
  const paths = [`/articles/${canonicalArticleSlug(article.slug)}`];

  if (article.previousSlug) {
    const previous = `/articles/${canonicalArticleSlug(article.previousSlug)}`;
    if (previous !== paths[0]) paths.push(previous);
  }

  const author = article.customAuthor ? authorSlug(article.customAuthor) : "";
  if (author) paths.push(`/author/${author}`);

  if (article.language === "hi") {
    paths.push("/hindi");
    return paths;
  }

  paths.push("/", "/articles");
  getCategoriesByDbValue(article.category).forEach((category) => {
    paths.push(`/category/${category.slug}`);
  });
  return paths;
}

/**
 * res.revalidate throws for getServerSideProps pages and for paths with no
 * page. Homepage, /articles, /hindi, /category/[slug] and /author/[slug] are
 * all getServerSideProps. The only ISR page is pages/articles/[slug].tsx.
 */
function isIsrPath(path: string): boolean {
  return /^\/articles\/[^/]+$/.test(path);
}

export function articleRevalidatePaths(article: ArticleRevalidateInput): string[] {
  return Array.from(new Set(candidatePaths(article).filter(isIsrPath)));
}

/**
 * Regenerate the ISR article page (and the previous slug, on a rename).
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
