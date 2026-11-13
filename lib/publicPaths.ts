import { getCategoryBySlug } from "@/lib/categories";
import { canonicalArticleSlug } from "@/lib/seo";

/** True for unresolved route templates such as `[slug]`. */
export function isPlaceholderSegment(value: string | null | undefined): boolean {
  if (!value) return true;
  return value.indexOf("[") !== -1 || value.indexOf("]") !== -1;
}

/** Public article URL, or the articles index when the slug is a template. */
export function articlePath(slug: string | null | undefined): string {
  if (isPlaceholderSegment(slug)) return "/articles";
  return `/articles/${canonicalArticleSlug(slug as string)}`;
}

/** Official public URL for a category that has a dedicated topic hub. */
export const CATEGORY_HUB_PATHS: Record<string, string> = {
  varanasi: "/varanasi-news",
  gurgaon: "/gurugram-news",
};

/** Public category archive URL. Unknown or template slugs go to the homepage. */
export function categoryPath(slug: string | null | undefined): string {
  if (isPlaceholderSegment(slug)) return "/";
  const category =
    getCategoryBySlug(slug as string) ||
    getCategoryBySlug((slug as string).toLowerCase());
  return category ? `/category/${category.slug}` : "/";
}

/**
 * Public section URL used in navigation, breadcrumbs, sitemaps and canonicals.
 * City categories resolve to the official topic hubs; other categories keep
 * /category/{slug}.
 */
export function sectionPath(slug: string | null | undefined): string {
  if (isPlaceholderSegment(slug)) return "/";
  const category =
    getCategoryBySlug(slug as string) ||
    getCategoryBySlug((slug as string).toLowerCase());
  if (!category) return "/";
  return CATEGORY_HUB_PATHS[category.slug] || `/category/${category.slug}`;
}

/** Course URL, or the homepage when the slug is a template. */
export function coursePath(slug: string | null | undefined): string {
  if (isPlaceholderSegment(slug)) return "/";
  return `/courses/${slug}`;
}

/** Story URL, or the stories index when the slug is a template. */
export function storyPath(slug: string | null | undefined): string {
  if (isPlaceholderSegment(slug)) return "/stories";
  return `/stories/${slug}`;
}
