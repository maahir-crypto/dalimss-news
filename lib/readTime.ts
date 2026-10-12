/** Reading speed for read-time labels, in words a minute. */
export const WORDS_PER_MINUTE = 220;

/**
 * Letters and numbers in any script. Built with the constructor so the
 * Unicode flag typechecks under the project's ES5 target; matching is the
 * same as /[\p{L}\p{N}]/u.
 */
const WORD_HAS_LETTER_OR_NUMBER = new RegExp("[\\p{L}\\p{N}]", "u");

/** Visible words in article HTML or Markdown, with tags, links and markup removed. */
export function countReadableWords(content: string | null | undefined): number {
  if (!content) return 0;
  const text = content
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/[#*_>`~|]+/g, " ");
  return text.split(/\s+/).filter((word) => WORD_HAS_LETTER_OR_NUMBER.test(word)).length;
}

export function readTimeMinutes(content: string | null | undefined): number {
  return Math.max(1, Math.round(countReadableWords(content) / WORDS_PER_MINUTE));
}
