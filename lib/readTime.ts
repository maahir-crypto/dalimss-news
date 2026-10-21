import { decodeEntities } from "./decodeEntities";

/** Reading speed for read-time labels, in words a minute. */
export const WORDS_PER_MINUTE = 220;

/**
 * Letters and numbers in any script. Built with the constructor so the
 * Unicode flag typechecks under the project's ES5 target; matching is the
 * same as /[\p{L}\p{N}]/u. Devanagari letters are included, so Hindi words
 * count as words rather than as characters.
 */
const WORD_HAS_LETTER_OR_NUMBER = new RegExp("[\\p{L}\\p{N}]", "u");

/**
 * Visible words in article HTML or Markdown.
 * Tags, scripts, styles, and link targets are removed. HTML entities are
 * decoded first so numeric Devanagari (&#2357;…) is counted, and danda
 * (। ॥) breaks words the way a space does.
 */
export function countReadableWords(content: string | null | undefined): number {
  if (!content) return 0;
  const text = decodeEntities(content)
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~|]+/g, " ")
    .replace(/[।॥]+/g, " ");
  return text
    .split(/\s+/)
    .filter((word) => WORD_HAS_LETTER_OR_NUMBER.test(word)).length;
}

/** Minutes to read, at WORDS_PER_MINUTE, never below 1. */
export function readTimeMinutes(content: string | null | undefined): number {
  return Math.max(1, Math.round(countReadableWords(content) / WORDS_PER_MINUTE));
}

export type ReadTimeBackfillRow = {
  id: number;
  slug: string;
  content: string | null;
  readTimeInMinutes: number;
};

/** A stored minute value that does not match the shared helper. */
export type ReadTimeBackfillChange = {
  id: number;
  slug: string;
  from: number;
  to: number;
};

/**
 * Rows whose stored readTimeInMinutes disagrees with readTimeMinutes.
 * Applying `to` and planning again yields an empty list.
 */
export function planReadTimeBackfill(
  rows: readonly ReadTimeBackfillRow[]
): ReadTimeBackfillChange[] {
  const changes: ReadTimeBackfillChange[] = [];
  for (const row of rows) {
    const to = readTimeMinutes(row.content);
    if (to === row.readTimeInMinutes) continue;
    changes.push({
      id: row.id,
      slug: row.slug,
      from: row.readTimeInMinutes,
      to,
    });
  }
  return changes;
}
