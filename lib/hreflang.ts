import { duplicateCanonicalSlug } from "@/lib/duplicateArticles";
import { articlePath } from "@/lib/publicPaths";
import { SITE_URL, canonicalArticleSlug } from "@/lib/seo";

export type PageLanguage = "en" | "hi";

export type HreflangCode = PageLanguage | "x-default";

export interface HreflangLink {
  hrefLang: HreflangCode;
  href: string;
}

/**
 * A real English/Hindi translation of the same story.
 *
 * Paths are site pathnames such as /articles/city-budget. Do not put query
 * strings here. Register a pair only when both URLs exist and each page is
 * a translation of the other. No database column is required.
 *
 * Slugs that differ only by a trailing "-hindi" are paired automatically
 * when both articles are published. This list is the override for a
 * translation whose slugs do not follow that pattern.
 *
 * When a pair is present, both URLs emit reciprocal hreflang alternates
 * and x-default pointing at the English URL.
 */
export interface TranslationPair {
  en: string;
  hi: string;
}

/**
 * A story row used to decide whether a counterpart is published.
 * Rows from Article are published; tests pass published: false for a
 * counterpart that exists but must not be linked.
 */
export interface PublishedArticle {
  slug: string;
  language?: string | null;
  published?: boolean;
}

const HINDI_SUFFIX = "-hindi";

/**
 * Differently named translations, checked against the published articles.
 * Same-story pairs whose Hindi slug is exactly "<english-slug>-hindi" are
 * not listed here; those are paired from the article rows.
 */
export const TRANSLATION_PAIRS: TranslationPair[] = [
  {
    en: "/articles/india-new-zealand-fifth-odi-series-win-november-2026",
    hi: "/articles/india-new-zealand-fifth-odi-series-win-hindi-2026",
  },
  {
    en: "/articles/varanasi-bhu-two-tavi-patients-discharged-nov15-2026",
    hi: "/articles/varanasi-bhu-do-hriday-valve-upchar-nov15-2026",
  },
  {
    en: "/articles/karwa-chauth-delhi-gurugram-noida-lucknow-moonrise-2026",
    hi: "/articles/karwa-chauth-2026-delhi-gurugram-noida-lucknow-hindi",
  },
  {
    en: "/articles/ipl-2027-retentions-team-purses-key-releases-auction",
    hi: "/articles/ipl-2027-retention-purse-released-players-auction-hindi",
  },
  {
    en: "/articles/varanasi-mangari-road-land-notice-nov18-2026",
    hi: "/articles/varanasi-mangari-karmi-bhumi-adhisuchna-upload-nov18-2026",
  },
];

function pathnameOf(path: string): string {
  const withoutQuery = (path.split("?")[0] || "/").trim();
  if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

function absolute(path: string): string {
  const normalized = pathnameOf(path);
  return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized}`;
}

function slugFromArticlePath(path: string): string | null {
  const pathname = pathnameOf(path);
  const prefix = "/articles/";
  if (!pathname.startsWith(prefix)) return null;
  const slug = pathname.slice(prefix.length);
  if (!slug || slug.includes("/")) return null;
  return slug;
}

/** Same path the article page uses for rel=canonical. */
function canonicalArticlePath(slug: string): string {
  return articlePath(duplicateCanonicalSlug(slug));
}

function isPublished(article: PublishedArticle): boolean {
  return article.published !== false && Boolean(article.slug);
}

function languagesAllow(en: PublishedArticle, hi: PublishedArticle): boolean {
  if (en.language === "hi") return false;
  if (hi.language != null && hi.language !== "" && hi.language !== "hi") {
    return false;
  }
  return true;
}

function pairFromSlugs(enSlug: string, hiSlug: string): TranslationPair {
  return {
    en: canonicalArticlePath(enSlug),
    hi: canonicalArticlePath(hiSlug),
  };
}

/**
 * Slugs to load when rendering `slug`: itself, the "-hindi" counterpart,
 * and both sides of a manual pair that names this slug.
 */
export function translationCandidateSlugs(slug: string): string[] {
  const slugs = new Set<string>();
  const seeds = new Set<string>();
  if (slug) {
    seeds.add(slug);
    seeds.add(canonicalArticleSlug(slug));
  }

  for (const seed of Array.from(seeds)) {
    slugs.add(seed);
    if (seed.endsWith(HINDI_SUFFIX)) {
      const base = seed.slice(0, -HINDI_SUFFIX.length);
      if (base) slugs.add(base);
    } else {
      slugs.add(`${seed}${HINDI_SUFFIX}`);
    }
    for (const pair of TRANSLATION_PAIRS) {
      const en = slugFromArticlePath(pair.en);
      const hi = slugFromArticlePath(pair.hi);
      if (seed === en || seed === hi) {
        if (en) slugs.add(en);
        if (hi) slugs.add(hi);
      }
    }
  }

  return Array.from(slugs);
}

/**
 * English/Hindi pair for one article slug.
 * Manual TRANSLATION_PAIRS win when the slugs differ. Otherwise a published
 * slug X and a published slug X-hindi are a pair. A missing or unpublished
 * counterpart returns null.
 */
export function translationPairForSlug(
  slug: string,
  articles: PublishedArticle[]
): TranslationPair | null {
  const published = new Map<string, PublishedArticle>();
  for (const article of articles) {
    if (!isPublished(article)) continue;
    published.set(article.slug, article);
  }

  const self = published.get(slug);
  if (!self) return null;

  for (const pair of TRANSLATION_PAIRS) {
    const enSlug = slugFromArticlePath(pair.en);
    const hiSlug = slugFromArticlePath(pair.hi);
    if (!enSlug || !hiSlug) continue;
    if (slug !== enSlug && slug !== hiSlug) continue;
    const en = published.get(enSlug);
    const hi = published.get(hiSlug);
    if (!en || !hi || !languagesAllow(en, hi)) return null;
    return pairFromSlugs(en.slug, hi.slug);
  }

  const enSlug = slug.endsWith(HINDI_SUFFIX)
    ? slug.slice(0, -HINDI_SUFFIX.length)
    : slug;
  const hiSlug = slug.endsWith(HINDI_SUFFIX) ? slug : `${slug}${HINDI_SUFFIX}`;
  if (!enSlug || enSlug === hiSlug) return null;
  const en = published.get(enSlug);
  const hi = published.get(hiSlug);
  if (!en || !hi || !languagesAllow(en, hi)) return null;
  return pairFromSlugs(en.slug, hi.slug);
}

/**
 * hreflang alternates for one canonical URL.
 *
 * Hindi pages with no registered pair return a single self link:
 * rel="alternate" hreflang="hi". English pages with no pair return nothing.
 * A published pair returns reciprocal en and hi links, plus x-default
 * pointing at the English URL. Those hrefs are the pages' canonical URLs.
 */
export function hreflangLinks(input: {
  /** Canonical path, including ?page=N when the page is past 1. */
  path: string;
  language: PageLanguage;
  /** Published articles. Omit on pages that are not one story. */
  articles?: PublishedArticle[];
}): HreflangLink[] {
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const selfHref =
    pathnameOf(path) === "/" && !path.includes("?")
      ? SITE_URL
      : `${SITE_URL}${path}`;
  const pathname = pathnameOf(path);
  const slug = slugFromArticlePath(pathname);

  let pair: TranslationPair | null = null;
  if (input.articles && slug) {
    pair = translationPairForSlug(slug, input.articles);
  } else if (!input.articles) {
    pair =
      TRANSLATION_PAIRS.find(
        (entry) =>
          pathnameOf(entry.en) === pathname || pathnameOf(entry.hi) === pathname
      ) ?? null;
  }

  if (!pair) {
    if (input.language !== "hi") return [];
    return [{ hrefLang: "hi", href: selfHref }];
  }

  const enHref = absolute(pair.en);
  return [
    { hrefLang: "en", href: enHref },
    { hrefLang: "hi", href: absolute(pair.hi) },
    { hrefLang: "x-default", href: enHref },
  ];
}
