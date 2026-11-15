// Conservative classifier for evergreen how-to guides and explainers.
// These stay in the main sitemap and in search, but they do not belong
// in the Google News sitemap and should use Article rather than NewsArticle.
// Real news must never be classified as evergreen.

import { getCategoriesByDbValue } from "./categories";

export type EvergreenGuideFields = {
  slug?: string | null;
  title?: string | null;
  category?: string | null;
};

function hyphenate(value: string | null | undefined): string {
  return (value || "")
    .toLowerCase()
    .replace(/&apos;|&#39;|&amp;|&quot;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleText(value: string | null | undefined): string {
  return (value || "")
    .toLowerCase()
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const CITY_SLUG_PREFIX =
  /^(gurugram|gurgaon|varanasi|banaras|kashi)(?:-|$)/;

const DATED_CITY_TOKEN =
  /(?:january|february|march|april|may|june|july|august|september|october|november|december)-\d{1,2}(?:-|$)|[a-z]{3}\d{2}-\d{4}(?:-|$)/;

// Timely announcements and hard news. Checked before any how-to pattern,
// so a result page that also says "how to check" stays in the news sitemap.
const TIMELY_NEWS_SLUG =
  /(?:^|-)(?:final-result|merit-list|time-table|timetable|exam-dates|recruitment-\d{4}|ruling|arrest|tenders?|hearing-dates|chargesheets?|acquittal)(?:-|$)/;

const EVERGREEN_SLUG_PATTERNS: RegExp[] = [
  /(?:^|-)how-to(?:-|$)/,
  /(?:^|-)what-are-/,
  /(?:^|-)what-is-/,
  /(?:^|-)formula(?:-|$)/,
  /(?:^|-)measurement(?:-|$)/,
  /online-apply/,
  /(?:^|-)itr-download(?:-|$)/,
  /download-pdf/,
  /(?:^|-)itr-v(?:-|$)/,
  /exam-pattern/,
  /voting-process/,
  /tie-breaker-rules/,
  /(?:^|-)worldwide-collection(?:-|$)/,
  /complaint-tracking/,
  /hallmark-check/,
  /allotment-status/,
  /privacy-settings/,
  /warning-signs/,
  /(?:^|-)lakshan(?:-|$)/,
  /eligibility-documents/,
  /eligibility-application/,
  /applicability-due-date/,
  /free-consultations/,
  /(?:^|-)safe-limits(?:-|$)/,
  /credit-utilisation-ratio/,
  /waist-hip-ratio/,
  /slow-over-rate/,
];

const EVERGREEN_TITLE_PATTERNS: RegExp[] = [
  /\bhow to\b/i,
  /\bwhat is\b/i,
  /\bwhat are\b/i,
  /\bstep[- ]by[- ]step\b/i,
  /\bexplained\b/i,
  /कैसे/,
  /क्या है/,
];

function isTimelyNews(slug: string): boolean {
  if (TIMELY_NEWS_SLUG.test(slug)) return true;
  if (CITY_SLUG_PREFIX.test(slug) && DATED_CITY_TOKEN.test(slug)) return true;
  return false;
}

function hasExplainersCategory(category: string | null | undefined): boolean {
  return getCategoriesByDbValue(category).some((item) => item.slug === "explainers");
}

function isSchemeHowTo(slug: string): boolean {
  return (
    slug.includes("yojana") &&
    /(?:^|-)(patrata|avedan|navinikaran|pavti)(?:-|$)/.test(slug)
  );
}

function matchesEvergreenSlug(slug: string): boolean {
  if (EVERGREEN_SLUG_PATTERNS.some((pattern) => pattern.test(slug))) return true;
  return isSchemeHowTo(slug);
}

function matchesEvergreenTitle(title: string): boolean {
  return EVERGREEN_TITLE_PATTERNS.some((pattern) => pattern.test(title));
}

/**
 * True for evergreen how-to guides and explainers. Conservative: returns
 * false unless a clear category, slug or title signal is present, and
 * always returns false for timely or city-dated news.
 */
export function isEvergreenGuide(article: EvergreenGuideFields): boolean {
  const slug = hyphenate(article.slug);
  if (isTimelyNews(slug)) return false;
  if (hasExplainersCategory(article.category)) return true;
  if (matchesEvergreenSlug(slug)) return true;
  if (matchesEvergreenTitle(titleText(article.title))) return true;
  return false;
}

/** Schema.org type for an article page. Guides use Article; news stays NewsArticle. */
export function articleSchemaType(
  article: EvergreenGuideFields
): "Article" | "NewsArticle" {
  return isEvergreenGuide(article) ? "Article" : "NewsArticle";
}
