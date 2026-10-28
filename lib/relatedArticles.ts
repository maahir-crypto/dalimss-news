import { articlePath } from "./publicPaths";
import {
  brandMatchKeys,
  priceHubBySlug,
  priceHubFamilyFor,
  type PriceHubSlug,
} from "./priceHubs";
import { SITE_URL } from "./seo";

/** Body related links stay at three. */
export const RELATED_LINK_COUNT = 3;

export type RelatedCandidate = {
  slug: string;
  title: string;
  tags?: string | null;
  category?: string | null;
  language?: string | null;
  content?: string | null;
};

export type RelatedPick = {
  kind: "article" | "hub";
  href: string;
  label: string;
  slug: string;
};

const HUB_GUIDE_LABEL: { [slug: string]: string } = {
  phones: "Phone price guide",
  cars: "Car price guide",
  "two-wheelers": "Scooter and bike price guide",
  appliances: "Appliance price guide",
  "laptops-and-tablets": "Laptop and tablet price guide",
  "watches-and-audio": "Watch and audio price guide",
  "tvs-and-projectors": "TV and projector price guide",
  "gadgets-and-accessories": "Gadget and accessory price guide",
};

/**
 * Tokens that end a model prefix. A later price, comparison, or topic word
 * means the tokens before it name the model.
 */
const BOUNDARY: { [token: string]: boolean } = {
  price: true,
  prices: true,
  pricing: true,
  vs: true,
  versus: true,
  warranty: true,
  warranties: true,
  guarantee: true,
  guarantees: true,
  claim: true,
  claims: true,
  replacement: true,
  charging: true,
  charger: true,
  chargers: true,
  charge: true,
  repair: true,
  repairs: true,
  safety: true,
  airbag: true,
  airbags: true,
  payload: true,
  variant: true,
  variants: true,
  explained: true,
  explainer: true,
  conditions: true,
  condition: true,
  guide: true,
  list: true,
  review: true,
  reviews: true,
  specs: true,
  spec: true,
  comparison: true,
  compare: true,
  terms: true,
  policy: true,
  policies: true,
  service: true,
  services: true,
  ownership: true,
  consumer: true,
  feature: true,
  features: true,
  how: true,
  before: true,
  after: true,
  check: true,
  checks: true,
  which: true,
  what: true,
  when: true,
  where: true,
  official: true,
  update: true,
  launch: true,
  launched: true,
  sale: true,
  sales: true,
  india: true,
  october: true,
  november: true,
  december: true,
  january: true,
  february: true,
  march: true,
  april: true,
  may: true,
  june: true,
  july: true,
  august: true,
  september: true,
  rs: true,
  year: true,
  years: true,
  engine: true,
  transmission: true,
};

/** Words that are not a brand, even when they lead a price slug. */
const GENERIC: { [token: string]: boolean } = {
  a: true,
  an: true,
  the: true,
  and: true,
  or: true,
  of: true,
  for: true,
  to: true,
  in: true,
  on: true,
  with: true,
  india: true,
  indian: true,
  new: true,
  news: true,
  official: true,
  update: true,
  live: true,
  today: true,
  technology: true,
  automotive: true,
  business: true,
  sport: true,
  sports: true,
  lifestyle: true,
  health: true,
  education: true,
  world: true,
  varanasi: true,
  gurugram: true,
  gurgaon: true,
  delhi: true,
  price: true,
  prices: true,
  pricing: true,
  vs: true,
  versus: true,
  car: true,
  cars: true,
  phone: true,
  phones: true,
  mobile: true,
  smartphone: true,
  smartphones: true,
  guide: true,
  review: true,
  reviews: true,
  explained: true,
  explainer: true,
  list: true,
  report: true,
  launch: true,
  launched: true,
  sale: true,
  sales: true,
  deal: true,
  deals: true,
  best: true,
  top: true,
  how: true,
  what: true,
  why: true,
  when: true,
  where: true,
  which: true,
  before: true,
  after: true,
  check: true,
  checks: true,
  your: true,
  our: true,
  rs: true,
  inr: true,
  variant: true,
  variants: true,
  model: true,
  models: true,
  pro: true,
  max: true,
  plus: true,
  ultra: true,
  lite: true,
  warranty: true,
  charging: true,
  repair: true,
  safety: true,
  comparison: true,
  feature: true,
  features: true,
};

const TOPIC_RULES: { id: string; pattern: RegExp }[] = [
  { id: "warranty", pattern: /\b(warrant(?:y|ies)|guarantees?)\b/i },
  { id: "charging", pattern: /\b(chargers?|charging|charge)\b/i },
  { id: "repair", pattern: /\brepairs?\b/i },
  { id: "safety", pattern: /\b(safety|airbags?)\b/i },
  { id: "commercial", pattern: /\b(commercial|payload|pickups?|pik up|goods|cv)\b/i },
  { id: "loan", pattern: /\bloans?\b/i },
];

type AnchorHit = { start: number; end: number; slug: string };

type Ranked = {
  candidate: RelatedCandidate;
  score: number;
  shared: number;
  keys: string[];
};

function isHindi(language: string | null | undefined): boolean {
  return language === "hi";
}

function isPublicSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function slugTokens(slug: string): string[] {
  const parts = slug.toLowerCase().split("-");
  const tokens: string[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    if (parts[index]) tokens.push(parts[index]);
  }
  return tokens;
}

function sharedLeading(left: string[], right: string[]): number {
  const limit = left.length < right.length ? left.length : right.length;
  let index = 0;
  while (index < limit && left[index] === right[index]) index += 1;
  return index;
}

function isBoundaryToken(token: string | undefined): boolean {
  if (!token) return true;
  if (BOUNDARY[token]) return true;
  return /^\d+$/.test(token);
}

/** True when both slugs name the same model, not only the same brand. */
function sameModelSlug(leftSlug: string, rightSlug: string): boolean {
  const left = slugTokens(leftSlug);
  const right = slugTokens(rightSlug);
  const shared = sharedLeading(left, right);
  if (shared < 2) return false;
  return isBoundaryToken(left[shared]) || isBoundaryToken(right[shared]);
}

function slugHasPriceOrVs(slug: string): boolean {
  const lower = slug.toLowerCase();
  if (lower.indexOf("price") !== -1) return true;
  const parts = lower.split("-");
  for (let index = 0; index < parts.length; index += 1) {
    if (parts[index] === "vs" || parts[index] === "versus") return true;
  }
  return false;
}

function isGenericToken(token: string): boolean {
  if (!token || token.length < 2) return true;
  if (/^\d+$/.test(token)) return true;
  return GENERIC[token] === true;
}

function firstSlugToken(slug: string): string {
  const parts = slug.toLowerCase().split("-");
  return parts[0] || "";
}

function topicIds(article: RelatedCandidate): string[] {
  const text = `${(article.slug || "").replace(/-/g, " ")} ${article.title || ""} ${article.tags || ""}`;
  const ids: string[] = [];
  for (let index = 0; index < TOPIC_RULES.length; index += 1) {
    if (TOPIC_RULES[index].pattern.test(text)) ids.push(TOPIC_RULES[index].id);
  }
  return ids;
}

function sharesTopic(left: string[], right: string[]): boolean {
  for (let i = 0; i < left.length; i += 1) {
    for (let j = 0; j < right.length; j += 1) {
      if (left[i] === right[j]) return true;
    }
  }
  return false;
}

function sharesBrand(left: string[], right: string[]): boolean {
  for (let i = 0; i < left.length; i += 1) {
    for (let j = 0; j < right.length; j += 1) {
      if (left[i] === right[j]) return true;
    }
  }
  return false;
}

/**
 * Brand tokens seen on price and comparison slugs.
 * Known aliases count, and so does a leading slug token such as hmd or tecno
 * when that brand is not in the alias list.
 */
function priceBrandCorpus(candidates: RelatedCandidate[]): { [token: string]: boolean } {
  const corpus: { [token: string]: boolean } = {};
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (!slugHasPriceOrVs(candidate.slug || "")) continue;
    const keys = brandMatchKeys(candidate.tags, candidate.slug);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
      corpus[keys[keyIndex]] = true;
    }
    const token = firstSlugToken(candidate.slug || "");
    if (!isGenericToken(token)) corpus[token] = true;
  }
  return corpus;
}

function brandKeysFor(
  article: RelatedCandidate,
  corpus: { [token: string]: boolean }
): string[] {
  const seen: { [key: string]: boolean } = {};
  const keys: string[] = [];
  const add = (key: string) => {
    if (!key || seen[key]) return;
    seen[key] = true;
    keys.push(key);
  };
  const matched = brandMatchKeys(article.tags, article.slug);
  for (let index = 0; index < matched.length; index += 1) add(matched[index]);
  const token = firstSlugToken(article.slug || "");
  if (corpus[token]) add(token);
  const tags = (article.tags || "").split(",");
  for (let index = 0; index < tags.length; index += 1) {
    const word = (tags[index].trim().toLowerCase().split(/\s+/)[0] || "");
    if (corpus[word]) add(word);
  }
  return keys;
}

function articleSlugFromHref(href: string): string | null {
  const match = href.match(/\/articles\/([A-Za-z0-9-]+)/);
  if (!match) return null;
  const slug = match[1].toLowerCase();
  if (!isPublicSlug(slug)) return null;
  return slug;
}

function internalArticleAnchors(content: string): AnchorHit[] {
  const hits: AnchorHit[] = [];
  const pattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content))) {
    const slug = articleSlugFromHref(match[1]);
    if (!slug) continue;
    hits.push({
      start: match.index,
      end: match.index + match[0].length,
      slug,
    });
  }
  return hits;
}

function anchorLabel(title: string, slug: string): string {
  const raw = title && title.trim() ? title.trim() : slug.split("-").join(" ");
  return raw
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function articlePick(candidate: RelatedCandidate): RelatedPick {
  return {
    kind: "article",
    href: `${SITE_URL}${articlePath(candidate.slug)}`,
    label: anchorLabel(candidate.title, candidate.slug),
    slug: candidate.slug,
  };
}

function hubGuide(family: PriceHubSlug): RelatedPick | null {
  const hub = priceHubBySlug(family);
  const label = HUB_GUIDE_LABEL[family];
  if (!hub || !label) return null;
  return {
    kind: "hub",
    href: `${SITE_URL}${hub.path}`,
    label,
    slug: family,
  };
}

/**
 * Choose exactly three related links.
 * Score: same model prefix, then same brand with a price or vs slug, then topic.
 * One slot is reserved for a same-brand price or vs article when one exists.
 * Otherwise that slot is the matching price hub, when a hub matches.
 * Three existing same-brand links are left as they are.
 * With no brand price page and no hub, the current links stay as they are.
 */
export function pickRelatedArticles(
  article: RelatedCandidate,
  candidates: RelatedCandidate[]
): RelatedPick[] {
  const self = (article.slug || "").toLowerCase();
  const corpus = priceBrandCorpus(candidates);
  const articleKeys = brandKeysFor(article, corpus);
  const articleTopics = topicIds(article);
  const hits = internalArticleAnchors(article.content || "");

  const bySlug: { [slug: string]: RelatedCandidate } = {};
  const pool: RelatedCandidate[] = [];
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const slug = (candidate.slug || "").toLowerCase();
    if (!slug || slug === self || !isPublicSlug(slug) || bySlug[slug]) continue;
    if (isHindi(article.language) !== isHindi(candidate.language)) continue;
    const normalized = slug === candidate.slug ? candidate : { ...candidate, slug };
    bySlug[slug] = normalized;
    pool.push(normalized);
  }

  const currentResolved: RelatedCandidate[] = [];
  const seenCurrent: { [slug: string]: boolean } = {};
  for (let index = 0; index < hits.length; index += 1) {
    const slug = hits[index].slug;
    if (slug === self || seenCurrent[slug] || !bySlug[slug]) continue;
    seenCurrent[slug] = true;
    currentResolved.push(bySlug[slug]);
    if (currentResolved.length === RELATED_LINK_COUNT) break;
  }

  const keyCache: { [slug: string]: string[] } = {};
  const keysFor = (candidate: RelatedCandidate): string[] => {
    const cached = keyCache[candidate.slug];
    if (cached) return cached;
    const keys = brandKeysFor(candidate, corpus);
    keyCache[candidate.slug] = keys;
    return keys;
  };

  let sameBrandSet = currentResolved.length === RELATED_LINK_COUNT;
  for (let index = 0; index < currentResolved.length && sameBrandSet; index += 1) {
    if (!sharesBrand(articleKeys, keysFor(currentResolved[index]))) sameBrandSet = false;
  }
  if (sameBrandSet) return currentResolved.map(articlePick);

  const currentPos: { [slug: string]: number } = {};
  for (let index = 0; index < currentResolved.length; index += 1) {
    currentPos[currentResolved[index].slug] = index;
  }

  const selfTokens = slugTokens(self);
  const ranked: Ranked[] = [];
  for (let index = 0; index < pool.length; index += 1) {
    const candidate = pool[index];
    const keys = keysFor(candidate);
    const shared = sharedLeading(selfTokens, slugTokens(candidate.slug));
    let score = 0;
    if (sameModelSlug(self, candidate.slug)) score += 300;
    if (sharesBrand(articleKeys, keys) && slugHasPriceOrVs(candidate.slug)) score += 200;
    if (sharesTopic(articleTopics, topicIds(candidate))) score += 100;
    if (score <= 0) continue;
    ranked.push({ candidate, score, shared, keys });
  }

  ranked.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (right.shared !== left.shared) return right.shared - left.shared;
    const leftPos = currentPos[left.candidate.slug];
    const rightPos = currentPos[right.candidate.slug];
    const leftKnown = leftPos !== undefined;
    const rightKnown = rightPos !== undefined;
    if (leftKnown !== rightKnown) return leftKnown ? -1 : 1;
    if (leftKnown && rightKnown && leftPos !== rightPos) return leftPos - rightPos;
    if (left.candidate.slug < right.candidate.slug) return -1;
    if (left.candidate.slug > right.candidate.slug) return 1;
    return 0;
  });

  let reserved: RelatedCandidate | null = null;
  for (let index = 0; index < ranked.length; index += 1) {
    const row = ranked[index];
    if (!slugHasPriceOrVs(row.candidate.slug)) continue;
    if (!sharesBrand(articleKeys, row.keys)) continue;
    reserved = row.candidate;
    break;
  }

  const family = priceHubFamilyFor(article);
  const hub = reserved || !family ? null : hubGuide(family);
  if (!reserved && !hub) {
    return currentResolved.slice(0, RELATED_LINK_COUNT).map(articlePick);
  }

  const selected: RelatedCandidate[] = [];
  const seen: { [slug: string]: boolean } = {};
  const articleLimit = hub ? RELATED_LINK_COUNT - 1 : RELATED_LINK_COUNT;
  const push = (candidate: RelatedCandidate | null) => {
    if (!candidate || seen[candidate.slug] || selected.length >= articleLimit) return;
    seen[candidate.slug] = true;
    selected.push(candidate);
  };

  if (reserved) push(reserved);
  for (let index = 0; index < currentResolved.length; index += 1) {
    const candidate = currentResolved[index];
    if (sharesBrand(articleKeys, keysFor(candidate)) && slugHasPriceOrVs(candidate.slug)) {
      push(candidate);
    }
  }
  for (let index = 0; index < ranked.length; index += 1) push(ranked[index].candidate);
  for (let index = 0; index < currentResolved.length; index += 1) push(currentResolved[index]);

  const picks = selected.map(articlePick);
  if (hub) picks.unshift(hub);
  return picks.slice(0, RELATED_LINK_COUNT);
}

/**
 * Rewrite the three in-body article links. The HTML is returned unchanged when
 * the picker keeps the same three articles, or when the body does not have three.
 */
export function applyRelatedArticleLinks(
  article: RelatedCandidate,
  candidates: RelatedCandidate[]
): string {
  const content = article.content || "";
  const hits = internalArticleAnchors(content);
  if (hits.length !== RELATED_LINK_COUNT) return content;
  const picks = pickRelatedArticles(article, candidates);
  if (picks.length !== RELATED_LINK_COUNT) return content;
  let same = true;
  for (let index = 0; index < picks.length; index += 1) {
    if (picks[index].kind !== "article" || picks[index].slug !== hits[index].slug) {
      same = false;
      break;
    }
  }
  if (same) return content;

  let next = content;
  for (let index = hits.length - 1; index >= 0; index -= 1) {
    const pick = picks[index];
    const anchor = `<a href="${escapeHtml(pick.href)}">${escapeHtml(pick.label)}</a>`;
    next = next.slice(0, hits[index].start) + anchor + next.slice(hits[index].end);
  }
  return next;
}
