// Conservative classifier for evergreen how-to guides, explainers,
// product price or specification lists, and product comparison pages.
// These stay in the main sitemap and in search, but they do not belong
// in the Google News sitemap and should use Article rather than NewsArticle.
// Real news must never be classified as evergreen, including timely
// launch, price-hike and recall stories.

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

// Timely announcements and hard news. Checked before any evergreen
// pattern, so a result page that also says "how to check" stays in the
// news sitemap, as do price hikes, cuts and recalls.
const TIMELY_NEWS_SLUG =
  /(?:^|-)(?:final-result|merit-list|time-table|timetable|exam-dates?|last-date|deadline|recruitment-\d{4}|ruling|arrest|tenders?|hearing-dates|chargesheets?|acquittal|price-hike|prices-hiked|price-cut|price-cuts|price-increase|price-drop|price-revision|price-rise|hikes-price|cuts-price|recall|recalled)(?:-|$)/;

const TIMELY_PRICE_NEWS_TITLE =
  /\b(price hike|prices hiked|price cut|price increase|price drop|price revision|recall(?:ed)?)\b/i;

// Premiere / dated-release announcements (e.g. 2026-release-cast), but not
// evergreen release-date guides.
const TIMELY_YEAR_RELEASE_SLUG =
  /(?:^|-)\d{4}-release(?!-date)(?:-|$)/;

// Timely "X replaces Y" announcements. Applied before evergreen eligibility
// patterns so a replaces story that also mentions eligibility stays news.
const TIMELY_REPLACES_SLUG = /(?:^|-)replaces?(?:-|$)/;
const TIMELY_REPLACES_TITLE = /\breplaces?\b/i;

const LAUNCH_NEWS_SLUG =
  /(?:^|-)(?:launches?|launched|unveils?|unveiled|india-launch)(?:-|$)/;

const LAUNCH_NEWS_TITLE =
  /\b(launches?|launched|unveils?|unveiled|india launch)\b/i;

const POLICY_SLUG =
  /(?:^|-)(?:incentive|subsidy|policy|tax-relief|registration-fee|chargers?|approved)(?:-|$)/;

const POLICY_TITLE =
  /\b(incentive|subsidy|policy|tax relief|registration fee)\b/i;

const SPORTS_SLUG =
  /(?:^|-)(?:odi|t20|t20i|test-match|world-cup|fifa|ipl|premier-league|la-liga|nba|fixtures|squads?)(?:-|$)/;

const SPORTS_TITLE =
  /\b(odi|t20|world cup|premier league|fixtures|squads?)\b/i;

const COUNTRY_VS_SLUG =
  /(?:^|-)(?:india|australia|england|pakistan|new-zealand|south-africa|sri-lanka|bangladesh|west-indies)-vs-/;

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
  // Hyphen-bounded guide tokens (no bare global "rules").
  /(?:^|-)eligibility(?:-|$)/,
  /(?:^|-)meaning(?:-|$)/,
  /(?:^|-)cast(?:-|$)/,
  /(?:^|-)episodes?(?:-|$)/,
  /(?:^|-)runtime(?:-|$)/,
  /(?:^|-)ott(?:-|$)/,
  /(?:^|-)kitne-episode(?:-|$)/,
  /(?:^|-)kahan-dekhen(?:-|$)/,
  /(?:^|-)release-date(?:-|$)/,
  /(?:^|-)yojana(?:-|$)/,
  /(?:^|-)apply(?:-|$)/,
  /(?:^|-)application-steps(?:-|$)/,
  /(?:^|-)activation(?:-|$)/,
  /(?:^|-)e-nomination(?:-|$)/,
  /(?:^|-)due-dates?(?:-|$)/,
  /(?:^|-)instalment(?:-|$)/,
  /(?:^|-)recharge(?:-|$)/,
  /(?:^|-)audiobooks?(?:-|$)/,
];

const EVERGREEN_TITLE_PATTERNS: RegExp[] = [
  /\bhow to\b/i,
  /\bwhat is\b/i,
  /\bwhat are\b/i,
  /\bstep[- ]by[- ]step\b/i,
  /\bexplained\b/i,
  /\beligibility\b/i,
  /\bmeaning\b|\bmeans\b/i,
  /\bcast\b/i,
  /\bepisodes?\b/i,
  /\bruntime\b/i,
  /\bott\b/i,
  /\brelease date\b/i,
  /\bhow to check\b/i,
  /\bapplication steps\b/i,
  /\bcontribution chart\b/i,
  /\brecharge\b/i,
  /\brules\b/i,
  /कैसे/,
  /क्या है/,
  /कितने एपिसोड/,
  /कहां देखें|कहाँ देखें/,
];

const PRICE_LIST_SLUG =
  /(?:^|-)price-list(?:-|$)|(?:^|-)price(?:-|$)|(?:^|-)\d{4,9}-to-\d{4,9}(?:-|$)/;

const TWO_PRICE_TAIL = /(?:^|-)\d{4,9}-\d{4,9}$/;

const TRAILING_PRICE = /-\d{5,9}$/;

const PRICE_TITLE =
  /\bprice list\b|\bprice:\s*rs\b|\bex-showroom\b|\bon-road price\b|\bstarting figure\b|\b(?:at|from|listing at)\s*rs\s*[\d,]|\bकीमत\b|\bमूल्य सूची\b/i;

const RUPEE_TITLE = /(?:rs\.?|₹)\s*[\d,]/i;

const PRODUCT_SETUP_TITLE = /\bset up\b|\bcompatibility\b/i;

function isTimelyNews(slug: string, title: string): boolean {
  if (TIMELY_NEWS_SLUG.test(slug) || TIMELY_PRICE_NEWS_TITLE.test(title)) {
    return true;
  }
  if (TIMELY_YEAR_RELEASE_SLUG.test(slug)) return true;
  if (TIMELY_REPLACES_SLUG.test(slug) || TIMELY_REPLACES_TITLE.test(title)) {
    return true;
  }
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

function isTechOrAuto(category: string | null | undefined): boolean {
  const value = category || "";
  if (/\b(technology|automotive)\b/i.test(value)) return true;
  return getCategoriesByDbValue(value).some((item) =>
    item.slug === "technology" || item.slug === "automotive"
  );
}

function isPolicyNews(slug: string, title: string): boolean {
  return POLICY_SLUG.test(slug) || POLICY_TITLE.test(title);
}

function isSportsMatchup(
  slug: string,
  title: string,
  category: string | null | undefined
): boolean {
  if (/\bsports\b/i.test(category || "") || /खेल/.test(category || "")) return true;
  if (SPORTS_SLUG.test(slug) || SPORTS_TITLE.test(title)) return true;
  if (COUNTRY_VS_SLUG.test(slug)) return true;
  return false;
}

function hasExplicitPriceListSignal(slug: string, title: string): boolean {
  return PRICE_LIST_SLUG.test(slug) || PRICE_TITLE.test(title);
}

function hasComparisonToken(slug: string, title: string): boolean {
  return /(?:^|-)vs(?:-|$)/.test(slug) || /\bvs\b/i.test(title) || /बनाम/.test(title);
}

function isLaunchNewsWithoutPriceList(slug: string, title: string): boolean {
  if (!LAUNCH_NEWS_SLUG.test(slug) && !LAUNCH_NEWS_TITLE.test(title)) return false;
  if (hasExplicitPriceListSignal(slug, title)) return false;
  if (hasComparisonToken(slug, title) && (TWO_PRICE_TAIL.test(slug) || TRAILING_PRICE.test(slug) || RUPEE_TITLE.test(title))) {
    return false;
  }
  return true;
}

function isProductSetupPricePage(slug: string, title: string): boolean {
  if (!PRODUCT_SETUP_TITLE.test(title)) return false;
  return RUPEE_TITLE.test(title) || TRAILING_PRICE.test(slug) || /-\d{4,9}$/.test(slug);
}

function isProductPricePage(
  slug: string,
  title: string,
  category: string | null | undefined
): boolean {
  if (isPolicyNews(slug, title)) return false;
  if (hasExplicitPriceListSignal(slug, title)) return true;
  if (TWO_PRICE_TAIL.test(slug) && (isTechOrAuto(category) || RUPEE_TITLE.test(title))) {
    return true;
  }
  if (TRAILING_PRICE.test(slug) && RUPEE_TITLE.test(title)) {
    return true;
  }
  if (isProductSetupPricePage(slug, title)) return true;
  return false;
}

function isProductComparison(
  slug: string,
  title: string,
  category: string | null | undefined
): boolean {
  if (!hasComparisonToken(slug, title)) return false;
  if (isSportsMatchup(slug, title, category)) return false;
  if (isPolicyNews(slug, title)) return false;
  if (hasExplicitPriceListSignal(slug, title) || TWO_PRICE_TAIL.test(slug) || TRAILING_PRICE.test(slug)) {
    return true;
  }
  if (isTechOrAuto(category)) return true;
  return false;
}

/**
 * True for evergreen how-to guides, explainers, product price or
 * specification lists, and product comparison pages. Conservative:
 * returns false unless a clear category, slug or title signal is
 * present, and always returns false for timely, city-dated, launch,
 * price-hike or recall news.
 */
export function isEvergreenGuide(article: EvergreenGuideFields): boolean {
  const slug = hyphenate(article.slug);
  const title = titleText(article.title);
  if (isTimelyNews(slug, title)) return false;
  if (isLaunchNewsWithoutPriceList(slug, title)) return false;
  if (hasExplainersCategory(article.category)) return true;
  if (matchesEvergreenSlug(slug)) return true;
  if (matchesEvergreenTitle(title)) return true;
  if (isProductPricePage(slug, title, article.category)) return true;
  if (isProductComparison(slug, title, article.category)) return true;
  return false;
}

/** Schema.org type for an article page. Guides use Article; news stays NewsArticle. */
export function articleSchemaType(
  article: EvergreenGuideFields
): "Article" | "NewsArticle" {
  return isEvergreenGuide(article) ? "Article" : "NewsArticle";
}
