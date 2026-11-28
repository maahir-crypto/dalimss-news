/**
 * Varanasi civic updates tracker.
 * Stories come from the same Article query the /varanasi-news hub uses
 * (Varanasi, Banaras, Kashi and the Hindi city names, English and Hindi).
 * Civic grouping is a separate match on title, slug, tags and category.
 */

import { articlePath } from "@/lib/publicPaths";
import { decodeEntities } from "@/lib/decodeEntities";
import { canonicalArticleSlug } from "@/lib/seo";
import { TOPIC_HUBS } from "@/lib/topicHubs";
import {
  CIVIC_UPDATES_GROUP_LIMIT,
  CIVIC_UPDATES_INDEX_MIN,
  CIVIC_UPDATES_PATH,
  civicWindowStart,
} from "@/lib/civicUpdatesCopy";

export {
  CIVIC_UPDATES_CANONICAL,
  CIVIC_UPDATES_DESCRIPTION,
  CIVIC_UPDATES_GROUP_LIMIT,
  CIVIC_UPDATES_H1,
  CIVIC_UPDATES_INDEX_MIN,
  CIVIC_UPDATES_INTRO,
  CIVIC_UPDATES_LLMS_BULLET,
  CIVIC_UPDATES_LLMS_LINE,
  CIVIC_UPDATES_MORE_LABEL,
  CIVIC_UPDATES_PATH,
  CIVIC_UPDATES_ROBOTS_INDEX,
  CIVIC_UPDATES_ROBOTS_THIN,
  CIVIC_UPDATES_TITLE,
  CIVIC_UPDATES_TITLE_BEFORE_PIPE,
  CIVIC_UPDATES_TRACKER_LABEL,
  CIVIC_UPDATES_WINDOW_DAYS,
  CIVIC_UPDATES_WINDOW_MS,
  civicLastUpdatedLabel,
  civicUpdatesRobots,
  civicWindowStart,
  formatCivicPublishedAt,
} from "@/lib/civicUpdatesCopy";

export type CivicGroupId =
  | "traffic"
  | "police"
  | "schools"
  | "utilities"
  | "voters";

export type CivicGroupDefinition = {
  id: CivicGroupId;
  label: string;
  keywords: readonly string[];
};

export const CIVIC_UPDATE_GROUPS: readonly CivicGroupDefinition[] = [
  {
    id: "traffic",
    label: "Traffic and diversions",
    keywords: [
      "traffic",
      "diversion",
      "route",
      "road closed",
      "bridge",
      "parking",
      "bus",
      "jam",
      "यातायात",
      "डायवर्जन",
      "रूट",
    ],
  },
  {
    id: "police",
    label: "Police transfers and postings",
    keywords: [
      "transfer",
      "posting",
      "inspector",
      "appointed",
      "commissioner",
      "तबादला",
    ],
  },
  {
    id: "schools",
    label: "Schools and exams",
    keywords: [
      "school",
      "timing",
      "closure",
      "holiday",
      "exam",
      "admission",
      "convocation",
      "स्कूल",
      "छुट्टी",
      "परीक्षा",
    ],
  },
  {
    id: "utilities",
    label: "Power, water and civic works",
    keywords: [
      "power",
      "electricity",
      "water",
      "supply",
      "sewer",
      "nagar nigam",
      "VDA",
      "corridor",
      "bids",
      "बिजली",
      "पानी",
    ],
  },
  {
    id: "voters",
    label: "Voters and elections",
    keywords: ["voter", "booth", "election", "SIR", "मतदाता"],
  },
];

export type CivicStorySource = {
  id: number;
  slug: string;
  title: string;
  content?: string | null;
  category?: string | null;
  tags?: string | null;
  focusKeyword?: string | null;
  metaDescription?: string | null;
  createdAt: Date | string;
};

export type CivicUpdateItem = {
  id: number;
  slug: string;
  title: string;
  href: string;
  publishedAt: string;
  excerpt: string | null;
};

export type CivicUpdateGroup = {
  id: CivicGroupId;
  label: string;
  items: CivicUpdateItem[];
};

export type CivicUpdateList = {
  groups: CivicUpdateGroup[];
  items: CivicUpdateItem[];
  newestPublishedAt: string | null;
  indexable: boolean;
};

const LATIN_INFLECTION = /^(?:s|es|ed|ing|red)?$/;

function isPublicSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-+[a-z0-9]+)*$/.test(slug);
}

function oneLine(value: string): string {
  return decodeEntities(value).replace(/\s+/g, " ").trim();
}

/**
 * Varanasi identity, same fields and keywords as the /varanasi-news hub.
 * Hindi is included here; the hub page itself skips language "hi".
 */
export function articleMatchesVaranasiHub(article: {
  title?: string | null;
  content?: string | null;
  category?: string | null;
  tags?: string | null;
  focusKeyword?: string | null;
}): boolean {
  const haystack = [
    article.title,
    article.content,
    article.category,
    article.tags,
    article.focusKeyword,
  ]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join("\n")
    .toLowerCase();
  if (!haystack) return false;
  return TOPIC_HUBS.varanasi.keywords.some((keyword) =>
    haystack.includes(keyword.toLowerCase())
  );
}

function civicMatchText(article: {
  title?: string | null;
  slug?: string | null;
  tags?: string | null;
  category?: string | null;
}): string {
  return [article.title, article.slug, article.tags, article.category]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join("\n")
    .toLowerCase()
    .replace(/[-_]+/g, " ");
}

function tokenMatchesKeyword(token: string, keyword: string): boolean {
  if (token === keyword) return true;
  if (!token.startsWith(keyword)) return false;
  return LATIN_INFLECTION.test(token.slice(keyword.length));
}

/**
 * Latin keywords match a whole word, or that word plus a short inflection
 * (timings, transfers, transferred, buses). They do not match inside a
 * longer word such as business or example. Devanagari keywords match as
 * written. Phrases such as "road closed" match consecutive words.
 */
export function textHasCivicKeyword(text: string, keyword: string): boolean {
  const hay = text.toLowerCase().replace(/[-_]+/g, " ");
  const needle = keyword.toLowerCase().replace(/[-_]+/g, " ").trim();
  if (!needle) return false;
  if (/[\u0900-\u097F]/.test(needle)) return hay.includes(needle);

  const words = needle.split(/\s+/);
  const tokens = hay.split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length > 1) {
    for (let index = 0; index <= tokens.length - words.length; index += 1) {
      const matched = words.every((word, offset) =>
        tokenMatchesKeyword(tokens[index + offset], word)
      );
      if (matched) return true;
    }
    return false;
  }
  return tokens.some((token) => tokenMatchesKeyword(token, words[0]));
}

/** First matching group wins. Null when no civic keyword matches. */
export function civicGroupForStory(article: {
  title?: string | null;
  slug?: string | null;
  tags?: string | null;
  category?: string | null;
}): CivicGroupDefinition | null {
  const haystack = civicMatchText(article);
  if (!haystack) return null;
  for (const group of CIVIC_UPDATE_GROUPS) {
    if (group.keywords.some((keyword) => textHasCivicKeyword(haystack, keyword))) {
      return group;
    }
  }
  return null;
}

export function civicUpdatesPathForArticle(article: {
  slug?: string | null;
  title?: string | null;
  content?: string | null;
  category?: string | null;
  tags?: string | null;
  focusKeyword?: string | null;
}): string | null {
  if (!articleMatchesVaranasiHub(article)) return null;
  if (!civicGroupForStory(article)) return null;
  return CIVIC_UPDATES_PATH;
}

function publishedMillis(value: Date | string): number | null {
  const date = value instanceof Date ? value : new Date(value);
  const millis = date.getTime();
  return Number.isNaN(millis) ? null : millis;
}

export function groupCivicStories(
  stories: readonly CivicStorySource[],
  now: Date,
  options?: { assumeVaranasi?: boolean }
): CivicUpdateList {
  const start = civicWindowStart(now).getTime();
  const end = now.getTime();
  const assumeVaranasi = options?.assumeVaranasi === true;
  const ordered = stories.slice().sort((left, right) => {
    const delta =
      (publishedMillis(right.createdAt) || 0) -
      (publishedMillis(left.createdAt) || 0);
    if (delta !== 0) return delta;
    return right.id - left.id;
  });

  const buckets = new Map<CivicGroupId, CivicUpdateItem[]>();
  for (const group of CIVIC_UPDATE_GROUPS) buckets.set(group.id, []);
  const seen = new Set<string>();
  let newestPublishedAt: string | null = null;
  let newestMillis = -1;

  for (const story of ordered) {
    const published = publishedMillis(story.createdAt);
    if (published === null || published < start || published > end) continue;
    if (!assumeVaranasi && !articleMatchesVaranasiHub(story)) continue;
    const group = civicGroupForStory(story);
    if (!group) continue;
    const bucket = buckets.get(group.id);
    if (!bucket || bucket.length >= CIVIC_UPDATES_GROUP_LIMIT) continue;

    const slug = canonicalArticleSlug(story.slug);
    if (!isPublicSlug(slug) || seen.has(slug)) continue;
    const title = oneLine(story.title);
    if (!title) continue;
    seen.add(slug);

    const excerpt = story.metaDescription ? oneLine(story.metaDescription) : "";
    bucket.push({
      id: story.id,
      slug,
      title,
      href: articlePath(slug),
      publishedAt: new Date(published).toISOString(),
      excerpt: excerpt || null,
    });
    if (published > newestMillis) {
      newestMillis = published;
      newestPublishedAt = new Date(published).toISOString();
    }
  }

  const groups = CIVIC_UPDATE_GROUPS.flatMap((group) => {
    const items = buckets.get(group.id) || [];
    if (items.length === 0) return [];
    return [{ id: group.id, label: group.label, items }];
  });
  const items = groups.flatMap((group) => group.items);

  return {
    groups,
    items,
    newestPublishedAt,
    indexable: items.length >= CIVIC_UPDATES_INDEX_MIN,
  };
}

