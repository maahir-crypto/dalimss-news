import prisma from "@/lib/prisma";
import { canonicalArticleSlug } from "@/lib/seo";
import { activeStoryWhere } from "@/lib/storyLifetime";

const TRAILING_TIMESTAMP = /^(.*)-(\d{10,})$/;
const TRAILING_MIXED_ID = /^(.*)-([a-z0-9]{4,16})$/i;
const PREFIX_MIN_LENGTH = 12;

/**
 * Drop a trailing timestamp or short mixed id (`-1767862028028`, `-35mz4a`).
 * Returns null when the slug has no such suffix.
 */
export function slugWithoutTrailingId(slug: string): string | null {
  const timestamp = TRAILING_TIMESTAMP.exec(slug);
  if (timestamp && timestamp[1]) return timestamp[1];

  const mixed = TRAILING_MIXED_ID.exec(slug);
  if (!mixed || !mixed[1]) return null;
  const token = mixed[2];
  if (!/\d/.test(token) || !/[a-z]/i.test(token)) return null;
  return mixed[1];
}

function usableSlug(slug: string): boolean {
  return slug.length > 0 && slug.indexOf("[") === -1 && slug.indexOf("]") === -1;
}

async function articleByExactSlug(slug: string): Promise<string | null> {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { slug: true },
  });
  if (!article) return null;
  return canonicalArticleSlug(article.slug);
}

async function articleByPrefix(prefix: string): Promise<string | null> {
  if (prefix.length < PREFIX_MIN_LENGTH) return null;
  const matches = await prisma.article.findMany({
    where: { slug: { startsWith: prefix } },
    select: { slug: true },
    take: 2,
  });
  if (matches.length !== 1 || matches[0].slug === prefix) return null;
  return canonicalArticleSlug(matches[0].slug);
}

/**
 * Slug to 308 to when `requested` is a truncated or id-suffixed article URL.
 * Null when nothing published matches.
 */
export async function findArticleRedirectSlug(
  requested: string
): Promise<string | null> {
  if (!usableSlug(requested)) return null;

  const folded = requested.toLowerCase();
  const stripped = slugWithoutTrailingId(folded);
  if (stripped && stripped !== folded) {
    const exact = await articleByExactSlug(stripped);
    if (exact && exact !== requested) return exact;
  }

  const prefixed = await articleByPrefix(folded);
  if (prefixed && prefixed !== requested) return prefixed;
  return null;
}

async function storyByExactSlug(slug: string): Promise<string | null> {
  const story = await prisma.webStory.findFirst({
    where: { slug, ...activeStoryWhere() },
    select: { slug: true },
  });
  return story?.slug || null;
}

async function storyByPrefix(prefix: string): Promise<string | null> {
  if (prefix.length < PREFIX_MIN_LENGTH) return null;
  const matches = await prisma.webStory.findMany({
    where: { slug: { startsWith: prefix }, ...activeStoryWhere() },
    select: { slug: true },
    take: 2,
  });
  if (matches.length !== 1 || matches[0].slug === prefix) return null;
  return matches[0].slug;
}

/**
 * Slug to 308 to when `requested` is a truncated or timestamp-suffixed story URL.
 * Only currently published stories match.
 */
export async function findStoryRedirectSlug(
  requested: string
): Promise<string | null> {
  if (!usableSlug(requested)) return null;

  const folded = requested.toLowerCase();
  const stripped = slugWithoutTrailingId(folded);
  if (stripped && stripped !== folded) {
    const exact = await storyByExactSlug(stripped);
    if (exact && exact !== requested) return exact;
  }

  const prefixed = await storyByPrefix(folded);
  if (prefixed && prefixed !== requested) return prefixed;
  return null;
}
