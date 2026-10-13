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

/** Public category URL. Unknown or template slugs go to the homepage. */
export function categoryPath(slug: string | null | undefined): string {
  if (isPlaceholderSegment(slug)) return "/";
  const category =
    getCategoryBySlug(slug as string) ||
    getCategoryBySlug((slug as string).toLowerCase());
  return category ? `/category/${category.slug}` : "/";
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
