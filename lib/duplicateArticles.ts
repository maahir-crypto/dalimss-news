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
  // Same-event rewrites from the Varanasi desk (found 30 Oct 2026). No per URL
  // Search Console or AdSense data on file, so the first published story is main.
  "varanasi-six-water-sewerage-projects-cabinet-oct27-2026":
    "varanasi-water-sewerage-six-amrut-projects-oct27-2026",
  "varanasi-six-water-sewerage-projects-approved-october-27-2026":
    "varanasi-water-sewerage-six-amrut-projects-oct27-2026",
  "varanasi-delhi-vande-bharat-sleeper-timetable-oct27-2026":
    "varanasi-delhi-sleeper-timetable-oct27-2026",
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

const STOP_WORDS: Record<string, true> = {};
"a an the and or of for to in on at by with from as is are was were be been has have had it its this that these those into over after before new news says said will can who what how why when about up out off than more most also per".split(" ").forEach(function (w) { STOP_WORDS[w] = true; });

function contentTokens(value: string | null | undefined): string[] {
  return normalizeForCompare(value).split(" ").filter(function (w) {
    return w.length > 1 && !STOP_WORDS[w];
  });
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA: Record<string, true> = {};
  a.forEach(function (x) { setA[x] = true; });
  const setB: Record<string, true> = {};
  b.forEach(function (x) { setB[x] = true; });
  let inter = 0;
  let union = 0;
  Object.keys(setA).forEach(function (k) { union++; if (setB[k]) inter++; });
  Object.keys(setB).forEach(function (k) { if (!setA[k]) union++; });
  return union ? inter / union : 0;
}

function shingles(tokens: string[], size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i + size <= tokens.length; i++) out.push(tokens.slice(i, i + size).join(" "));
  return out;
}

/** Title similarity that alone marks a same-event rewrite. */
export const SAME_EVENT_TITLE_THRESHOLD = 0.6;
/** Lower title bar that counts only when the bodies also overlap. */
export const SAME_EVENT_TITLE_SUPPORT = 0.35;
/** Body word overlap that, with a similar title, marks a rewrite. */
export const SAME_EVENT_BODY_THRESHOLD = 0.25;
/** Two word shingle overlap that alone marks a rewrite of the same text. */
export const SAME_EVENT_SHINGLE_THRESHOLD = 0.5;

export type SameEventScore = {
  title: number;
  body: number;
  shingle: number;
  sameEvent: boolean;
};

/**
 * Scores how likely two stories cover the same event. A follow-up with new
 * facts normally shares the topic words in the title but little of the body,
 * so it stays below the bar.
 */
export function scoreSameEvent(
  incoming: RepeatCandidate,
  existing: RepeatCandidate
): SameEventScore {
  const title = jaccard(contentTokens(incoming.title), contentTokens(existing.title));
  const bodyA = contentTokens(incoming.content);
  const bodyB = contentTokens(existing.content);
  const body = jaccard(bodyA, bodyB);
  const shingle = jaccard(shingles(bodyA, 2), shingles(bodyB, 2));
  const sameEvent =
    title >= SAME_EVENT_TITLE_THRESHOLD ||
    (title >= SAME_EVENT_TITLE_SUPPORT && body >= SAME_EVENT_BODY_THRESHOLD) ||
    (bodyA.length >= 40 && shingle >= SAME_EVENT_SHINGLE_THRESHOLD);
  return { title, body, shingle, sameEvent };
}
