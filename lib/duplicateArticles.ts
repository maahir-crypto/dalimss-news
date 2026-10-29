/**
 * Articles that were published twice, once at the base slug and again with a
 * "-2" suffix. Both copies stay live (nothing is deleted or redirected). The
 * copy listed as the key points its rel=canonical at the main copy and is left
 * out of every sitemap.
 *
 * To swap which copy is main for a pair, flip the key and value here.
 * Choice recorded 29 Oct 2026: no per URL Search Console or AdSense data on
 * file for any of these pairs, so the original (first published) copy is main.
 */
export const DUPLICATE_ARTICLE_CANONICALS: Record<string, string> = {
  "jiofiber-prepaid-ott-999-1499-8499-2": "jiofiber-prepaid-ott-999-1499-8499",
  "gst-council-57th-meeting-small-traders-online-sellers-late-fee-explain-2":
    "gst-council-57th-meeting-small-traders-online-sellers-late-fee-explain",
  "varanasi-pradeep-nathani-hmi-course-mount-renok-climb-2":
    "varanasi-pradeep-nathani-hmi-course-mount-renok-climb",
  "hardattpur-missing-approach-road-village-basic-services-varanasi-2":
    "hardattpur-missing-approach-road-village-basic-services-varanasi",
  "three-injured-scorpio-overturns-cholapur-motorcycle-collision-varanasi-2":
    "three-injured-scorpio-overturns-cholapur-motorcycle-collision-varanasi",
  "dalmandi-road-widening-project-nears-completion-in-varanasi-2":
    "dalmandi-road-widening-project-nears-completion-in-varanasi",
};

/** Slug whose URL should be the canonical for this article. */
export function duplicateCanonicalSlug(slug: string): string {
  return DUPLICATE_ARTICLE_CANONICALS[slug] || slug;
}

/** True when this slug is the non-main copy of a duplicate pair. */
export function isDuplicateArticleCopy(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(DUPLICATE_ARTICLE_CANONICALS, slug);
}

function normalizeForCompare(value: string | null | undefined): string {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type RepeatCandidate = {
  title: string;
  content?: string | null;
};

/**
 * True when a new post repeats an existing one: same title, or same body text.
 * Used by the publish flows so a repeat post returns the existing article
 * instead of creating a "-2" copy.
 */
export function isRepeatPost(
  incoming: RepeatCandidate,
  existing: RepeatCandidate
): boolean {
  const titleA = normalizeForCompare(incoming.title);
  const titleB = normalizeForCompare(existing.title);
  if (titleA && titleA === titleB) return true;
  const bodyA = normalizeForCompare(incoming.content);
  const bodyB = normalizeForCompare(existing.content);
  return bodyA.length >= 200 && bodyA === bodyB;
}
