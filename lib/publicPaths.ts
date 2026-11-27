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

/**
 * Server-rendered "More {City} news" link for article pages when the
 * breadcrumb/category maps to a city topic hub. Hindi articles (language
 * "hi", the same signal as the Hindi breadcrumb) use a Hindi anchor for
 * the Varanasi and Gurugram hubs only. Other languages keep the English text.
 */
export function cityHubMoreNewsLink(
  categorySlug: string | null | undefined,
  language?: string | null
): { href: string; label: string } | null {
  if (!categorySlug) return null;
  const hindi = language === "hi";
  if (categorySlug === "varanasi") {
    return {
      href: CATEGORY_HUB_PATHS.varanasi,
      label: hindi ? "और वाराणसी समाचार" : "More Varanasi news",
    };
  }
  if (categorySlug === "gurgaon") {
    return {
      href: CATEGORY_HUB_PATHS.gurgaon,
      label: hindi ? "और गुरुग्राम समाचार" : "More Gurugram news",
    };
  }
  return null;
}

/**
 * Public category URL. City categories resolve to their topic hubs, same
 * as sectionPath, so a link never points at a redirected archive.
 * Unknown or template slugs go to the homepage.
 */
export function categoryPath(slug: string | null | undefined): string {
  return sectionPath(slug);
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
