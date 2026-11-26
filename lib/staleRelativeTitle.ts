// Replace relative day words in article titles once the Asia/Calcutta
// calendar day of publication is earlier than today. Computed at render
// time (ISR / s-maxage is fine); keep the result identical for server and
// client by using fixed Intl options.

import { formatDateIST } from "./seo";

// Longer phrases first so "this weekend" wins over a bare "this", and
// "आज रात" wins over "आज". JS \b is ASCII-only, so the Hindi alternatives
// are guarded by Devanagari lookaround (U+0900-U+097F) and match only as
// standalone words. Fresh RegExp per call avoids /g lastIndex races.
const RELATIVE_DAY_SOURCE =
  String.raw`\bthis morning\b|\bthis afternoon\b|\bthis evening\b|\bthis weekend\b|\btoday\b|\btonight\b|\byesterday\b|(?<![\u0900-\u097F])(?:आज रात|इस सप्ताहांत|आज|कल)(?![\u0900-\u097F])`;

function relativeDayPattern(): RegExp {
  return new RegExp(RELATIVE_DAY_SOURCE, "gi");
}

function istCalendarDate(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Calcutta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function publishedDateLabel(publishedAt: string | Date): string {
  return formatDateIST(publishedAt, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function tidyPunctuation(title: string): string {
  return title
    .replace(/\s+,/g, ",")
    .replace(/,{2,}/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([:?!.])/g, "$1")
    .replace(/,(?=[:?!.])/g, "")
    .replace(/^,\s*/, "")
    .trim();
}

/**
 * When a title still says "today" / "this weekend" (or Hindi equivalents)
 * but the article's publishedAt/createdAt calendar date in Asia/Calcutta is
 * before the current IST date, swap those words for the published date
 * ("28 October 2026"). Stories published today are left unchanged.
 */
export function resolveStaleRelativeTitle(
  title: string,
  publishedAt: string | Date | null | undefined,
  now: Date = new Date()
): string {
  if (!title || !publishedAt) return title;

  const published =
    publishedAt instanceof Date ? publishedAt : new Date(publishedAt);
  if (Number.isNaN(published.getTime())) return title;

  const pattern = relativeDayPattern();
  if (!pattern.test(title)) return title;

  const publishedDay = istCalendarDate(published);
  const today = istCalendarDate(now);
  if (publishedDay >= today) return title;

  const dateLabel = publishedDateLabel(published);
  if (!dateLabel) return title;

  const replaced = title.replace(relativeDayPattern(), `, ${dateLabel}`);
  return tidyPunctuation(replaced);
}
