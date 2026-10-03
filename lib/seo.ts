// lib/seo.ts
// SEO helper functions

import { decodeEntities } from "@/lib/decodeEntities";

export const SITE_URL = "https://dalimss.news";
export const SITE_NAME = "Dalimss News";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export const ARTICLE_SLUG_REDIRECTS: Record<string, string> = {
  "what-is-artificial-intelligence-ai":
    "vda-cracks-down-on-illegal-constructions-in-zone-4-multiple-buildings-sealed",
};

const AUTHOR_NAME_CORRECTIONS: Record<string, string> = {
  "dalimss news desk": "Dalimss News Desk",
  "dalimss news desks": "Dalimss News Desk",
  "dalimss news education desk": "Dalimss News Education Desk",
  "maahr madhok": "Maahir Madhok",
  "priyanak kapoor": "Priyanka Kapoor",
  "saura yadav": "Saurav Yadav",
  "siddhart srivastava": "Siddharth Srivastava",
  "sidharth srivastava": "Siddharth Srivastava",
  "sushant gauarav": "Sushant Gaurav",
  "pankaj yadav": "Pankaj Yadav",
  "sushant": "Sushant",
  "surbhi singh": "Surbhi Singh",
  "aishwarya jaiswal": "Aishwarya Jaiswal",
  "singham singh": "Singham Singh",
  "gaurav singh": "Gaurav Singh",
  "ajay singh": "Ajay Singh",
  "sanjay singh": "Sanjay Singh",
  "sanjeev singh": "Sanjeev Singh",
  "akash singh": "Akash Singh",
  "pranav rari": "Pranav Rari",
  "sonal sharma": "Sonal Sharma",
  "priya kapoor": "Priya Kapoor",
  "sandeep pathak": "Sandeep Pathak",
  "rudraksh sehgal": "Aditya Rudraksh Sehgal",
  "sanya kapoor, technology correspondent, dalimss news": "Sanya Kapoor",
  "sanya kapoor technology correspondent dalimss news": "Sanya Kapoor",
};

/**
 * Author slugs shown on /authors. Other real bylines keep their own
 * /author/<slug> page and are omitted from this index.
 */
export const INDEX_AUTHOR_SLUGS = new Set([
  "jhinuk-barman",
  "appurva-singh",
  "pankaj-yadav",
  "tanishka-upadhyay",
  "harsh-mehra",
  "aditya-rudraksh-sehgal",
  "ansh-sisodia",
  "kiara-kapoor",
  "sumit-arora",
  "anahita-desai",
  "fizaa-madhok",
]);

function authorLookupKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function knownAuthorSpelling(name: string): string | undefined {
  const key = authorLookupKey(name);
  if (!key) return undefined;
  const corrected = AUTHOR_NAME_CORRECTIONS[key];
  if (corrected) return corrected;
  return Object.values(AUTHOR_NAME_CORRECTIONS).find(
    (correctedName) => authorLookupKey(correctedName) === key
  );
}

export function canonicalAuthorName(name: string): string {
  const normalizedName = name.trim().replace(/\s+/g, " ");
  return knownAuthorSpelling(normalizedName) || normalizedName;
}

export function authorNameVariants(name: string): string[] {
  const canonicalName = canonicalAuthorName(name);
  const canonicalKey = canonicalName.toLowerCase();
  const aliases = Object.entries(AUTHOR_NAME_CORRECTIONS)
    .filter(([, correctedName]) => correctedName.toLowerCase() === canonicalKey)
    .map(([alias]) =>
      alias.replace(/\b\w/g, (character) => character.toUpperCase())
    );

  return Array.from(new Set([canonicalName, ...aliases]));
}

const NEWSROOM_BYLINE_WORDS = new Set([
  "the",
  "dalimss",
  "news",
  "new",
  "desk",
  "desks",
  "editorial",
  "team",
  "staff",
  "reporter",
  "writer",
  "writers",
  "admin",
  "administrator",
  "newsroom",
  "bureau",
]);

/**
 * True for an empty byline or an organisation label such as Dalimss News,
 * Dalimss Editorial Team, a desk, staff, or admin. Named reporters stay false.
 */
export function isNewsroomByline(name: string | null | undefined): boolean {
  const normalized = canonicalAuthorName(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return true;

  const tokens = normalized.split(" ");
  if (tokens.every((token) => NEWSROOM_BYLINE_WORDS.has(token))) return true;

  if (
    tokens.some(
      (token) =>
        token === "admin" ||
        token === "administrator" ||
        token === "staff" ||
        token === "newsroom"
    )
  ) {
    return true;
  }

  const lastToken = tokens[tokens.length - 1];
  if (lastToken === "desk" || lastToken === "desks") {
    const topical = tokens.filter((token) => !NEWSROOM_BYLINE_WORDS.has(token));
    if (topical.length <= 2 && tokens.length <= 6) return true;
  }

  return false;
}

export function canonicalArticleSlug(slug: string): string {
  return ARTICLE_SLUG_REDIRECTS[slug] || slug;
}

/**
 * Generate a URL-safe slug from an author name
 */
export function authorSlug(name: string): string {
  return canonicalAuthorName(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/(^-|-$)/g, ""); // Trim hyphens
}

/**
 * Strip HTML tags and Markdown formatting from content.
 */
export function toPlainText(content: string): string {
  return decodeEntities(
    content
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/[#*`_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip HTML tags and Markdown formatting from content
 * to produce a clean text string for meta descriptions
 */
export function stripForMeta(content: string, maxLength = 160): string {
  const plainText = toPlainText(content);

  if (plainText.length <= maxLength) return plainText;

  return `${plainText.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

const TRAILING_PUNCTUATION = /[\s.!?।,;:…"'“”‘’()[\]-]+$/;

function usesDevanagariSentences(text: string): boolean {
  const devanagari = text.match(/[\u0900-\u097F]/g)?.length ?? 0;
  const latin = text.match(/[A-Za-z]/g)?.length ?? 0;
  return devanagari > 0 && devanagari >= latin;
}

function finishMetaDescription(fragment: string, devanagari: boolean): string {
  const trimmed = fragment.replace(TRAILING_PUNCTUATION, "").trim();
  if (!trimmed) return "";
  return `${trimmed}${devanagari ? "।" : "."}`;
}

/**
 * Last sentence boundary inside `windowText` that begins at index 80 or later.
 * English boundaries are ". ", "? ", and "! ". Devanagari uses the danda.
 * Returns the index of the boundary marker, or -1.
 */
function lastSentenceBoundary(windowText: string, devanagari: boolean): number {
  if (devanagari) {
    let boundary = -1;
    for (let index = 80; index < windowText.length; index += 1) {
      if (windowText[index] === "।") boundary = index;
    }
    return boundary;
  }

  let boundary = -1;
  for (const marker of [". ", "? ", "! "]) {
    let from = 80;
    while (from < windowText.length) {
      const index = windowText.indexOf(marker, from);
      if (index === -1) break;
      if (index >= 80) boundary = Math.max(boundary, index);
      from = index + marker.length;
    }
  }
  return boundary;
}

function cutAtLastWord(windowText: string): string {
  const space = windowText.lastIndexOf(" ");
  if (space <= 0) return windowText;
  return windowText.slice(0, space);
}

/**
 * Search-result description. Short text is returned unchanged.
 * Longer text is cut at the last sentence end after character 80 inside the
 * window, otherwise at the last word boundary, then closed with a full stop
 * (or a danda for Devanagari).
 */
export function metaDescription(text: string, max = 155): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  const hadEllipsis = /(?:…|\.\.\.)\s*$/.test(collapsed);
  const source = hadEllipsis
    ? collapsed.replace(/(?:…|\.\.\.)\s*$/, "").trim()
    : collapsed;

  if (!source) return "";

  const devanagari = usesDevanagariSentences(source);
  if (!hadEllipsis && source.length <= max) return source;
  if (hadEllipsis && source.length <= max && /[.!?।]$/.test(source)) {
    return source;
  }

  const windowText = source.slice(0, max);
  const boundary = lastSentenceBoundary(windowText, devanagari);
  const fragment =
    boundary >= 80 ? windowText.slice(0, boundary) : cutAtLastWord(windowText);
  return finishMetaDescription(fragment, devanagari);
}

/** Prefer an editor-written SEO description, then fall back to the body. */
export function articleMetaDescription(article: {
  metaDescription?: string | null;
  excerpt?: string | null;
  content?: string | null;
}): string {
  const explicit = toPlainText(article.metaDescription || "");
  const source =
    explicit ||
    toPlainText(article.excerpt || "") ||
    toPlainText(article.content || "");
  return metaDescription(source);
}

/** An edit counts only when updatedAt is more than two hours after publication. */
export const ARTICLE_UPDATE_THRESHOLD_MS = 2 * 60 * 60 * 1000;

export function articleModifiedAt(
  publishedAt: string | Date | null | undefined,
  updatedAt?: string | Date | null
): Date | null {
  const published = publishedAt ? new Date(publishedAt) : null;
  const publishedValid =
    published && !Number.isNaN(published.getTime()) ? published : null;
  const updated = updatedAt ? new Date(updatedAt) : null;
  const updatedValid =
    updated && !Number.isNaN(updated.getTime()) ? updated : null;

  if (
    publishedValid &&
    updatedValid &&
    updatedValid.getTime() - publishedValid.getTime() > ARTICLE_UPDATE_THRESHOLD_MS
  ) {
    return updatedValid;
  }
  return publishedValid || updatedValid;
}

export function articleWasMeaningfullyUpdated(
  publishedAt: string | Date | null | undefined,
  updatedAt?: string | Date | null
): boolean {
  const published = publishedAt ? new Date(publishedAt) : null;
  const modified = articleModifiedAt(publishedAt, updatedAt);
  if (!published || !modified || Number.isNaN(published.getTime())) return false;
  return modified.getTime() !== published.getTime();
}

/**
 * Format a date in India Standard Time with a fixed locale so server and
 * browser HTML match. Part values come from Intl, then the string is assembled
 * without locale-specific connectors such as "at" or narrow spaces.
 */
export function formatDateIST(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-IN", {
    ...options,
    timeZone: "Asia/Kolkata",
    calendar: "gregory",
    numberingSystem: "latn",
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value.replace(/[\u202f\u00a0]/g, " ");
    }
  }

  const day = map.day ? String(Number(map.day)) : "";
  const month = map.month || "";
  const year = map.year || "";
  const weekday = map.weekday || "";
  const hour = map.hour ? String(Number(map.hour)) : "";
  const minute = map.minute || "";
  const dayPeriod = (map.dayPeriod || "").toLowerCase();

  const calendar = [day, month, year].filter(Boolean).join(" ");
  const dateText = weekday
    ? calendar
      ? `${weekday}, ${calendar}`
      : weekday
    : calendar;

  if (!hour) return dateText;
  const time = `${hour}:${minute || "00"}${dayPeriod ? ` ${dayPeriod}` : ""}`;
  return dateText ? `${dateText}, ${time}` : time;
}

export const ORGANIZATION_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Gurugram",
  addressRegion: "Haryana",
  addressCountry: "IN",
};

export const ORGANIZATION_LANGUAGES = ["English", "Hindi"];

/**
 * Get absolute image URL (handles relative and absolute URLs)
 */
export function absoluteImageUrl(
  url: string | null | undefined
): string {
  if (!url) return DEFAULT_OG_IMAGE;
  if (url.startsWith("http")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Return a social-crawler-friendly version of an image.
 *
 * OTT artwork is stored efficiently as WebP, but some link-preview crawlers
 * (notably WhatsApp) do not reliably render WebP Open Graph images. Next's
 * image endpoint returns a widely supported PNG when the crawler does not
 * advertise WebP/AVIF support, while keeping the original artwork unchanged.
 */
export function socialPreviewImageUrl(
  url: string | null | undefined,
  version?: string | number | Date,
  width = 640
): string {
  let sourceUrl = absoluteImageUrl(url);
  if (version !== undefined) {
    const separator = sourceUrl.includes("?") ? "&" : "?";
    const versionValue =
      version instanceof Date ? version.getTime() : String(version);
    sourceUrl = `${sourceUrl}${separator}v=${encodeURIComponent(versionValue)}`;
  }
  return `${SITE_URL}/_next/image?url=${encodeURIComponent(
    sourceUrl
  )}&w=${width}&q=75`;
}

/** Resolve a site-hosted asset without substituting an image fallback. */
export function absoluteUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Format a media duration in seconds as an ISO 8601 duration. */
export function toISO8601Duration(
  totalSeconds: number | null | undefined
): string | undefined {
  if (!Number.isFinite(totalSeconds) || Number(totalSeconds) <= 0) {
    return undefined;
  }

  return `PT${Math.round(Number(totalSeconds))}S`;
}

/**
 * Format ISO date string with India timezone
 */
export function toISOWithTZ(date: string | Date): string {
  const d = new Date(date);
  const indiaOffsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(d.getTime() + indiaOffsetMs)
    .toISOString()
    .replace("Z", "+05:30");
}
