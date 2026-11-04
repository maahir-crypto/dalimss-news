import { duplicateCanonicalSlug, isDuplicateArticleCopy } from "./duplicateArticles";

export type LatestStory = { slug: string; title: string };

/** Publication order, independent of later edits or brand grouping. */
export function latestStories<T extends LatestStory & { createdAt: Date | string }>(
  articles: readonly T[],
  currentSlug?: string,
): T[] {
  const current = currentSlug ? duplicateCanonicalSlug(currentSlug) : undefined;
  const seen = new Set<string>();
  return articles.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || a.slug.localeCompare(b.slug)
  ).filter((article) => {
    const slug = duplicateCanonicalSlug(article.slug);
    if (isDuplicateArticleCopy(article.slug) || slug === current || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  }).slice(0, 5);
}
