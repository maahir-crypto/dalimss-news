/** Reading speed for read-time labels, in words a minute. */
export const WORDS_PER_MINUTE = 220;

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
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

export function readTimeMinutes(content: string | null | undefined): number {
  return Math.max(1, Math.round(countReadableWords(content) / WORDS_PER_MINUTE));
}
