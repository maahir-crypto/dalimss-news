import {
  DUPLICATE_ARTICLE_CANONICALS,
  MERGED_ARTICLE_REDIRECTS,
} from "@/lib/duplicateArticles";

/**
 * Slugs that 301/308 to another article (merged thin-audit copies and
 * duplicate "-2" pairs). Keep them out of every public listing so readers
 * and crawlers only see the surviving URL.
 */
export function excludedListingSlugs(): string[] {
  return [
    ...Object.keys(DUPLICATE_ARTICLE_CANONICALS),
    ...Object.keys(MERGED_ARTICLE_REDIRECTS),
  ];
}

/** Prisma `slug: { notIn: ... }` clause for listing queries. */
export function listingSlugNotIn() {
  return { notIn: excludedListingSlugs() };
}
