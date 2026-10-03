import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCategoriesByDbValue } from "@/lib/categories";
import { normalizedAuthorMatchKeys } from "@/lib/authorMatch";
import { authorNameVariants } from "@/lib/seo";

export interface AuthorPublicationStats {
  storyCount: number;
  topCategory: string | null;
}

interface CategoryCountRow {
  category: string | null;
  count: number | bigint;
}

/**
 * One grouped count of articles under this byline, plus the public
 * category those articles use most often. Null when nothing is counted.
 */
export async function getAuthorPublicationStats(
  name: string,
  language: string | null | undefined
): Promise<AuthorPublicationStats | null> {
  const variants = normalizedAuthorMatchKeys(authorNameVariants(name));
  if (variants.length === 0) return null;

  const rows = await prisma.$queryRaw<CategoryCountRow[]>(
    Prisma.sql`
      SELECT category, COUNT(*)::int AS count
      FROM "Article"
      WHERE lower(btrim(regexp_replace(coalesce("customAuthor", ''), '[[:space:]]+', ' ', 'g')))
        IN (${Prisma.join(variants)})
      GROUP BY category
    `
  );

  let storyCount = 0;
  const categoryCounts: Array<{
    count: number;
    priority: number;
    slug: string;
    label: string;
  }> = [];

  for (const row of rows) {
    const count = Number(row.count);
    if (!Number.isFinite(count) || count <= 0) continue;
    storyCount += count;

    const primary = getCategoriesByDbValue(row.category)[0];
    const rawLabel = row.category?.trim() || "";
    const label = primary
      ? language === "hi" && primary.nameHi
        ? primary.nameHi
        : primary.name
      : rawLabel && !rawLabel.includes(",")
        ? rawLabel
        : "";
    if (!label) continue;

    const slug = primary?.slug || label.toLowerCase();
    const priority = primary?.priority ?? 0;
    const existing = categoryCounts.find((entry) => entry.slug === slug);
    if (existing) {
      existing.count += count;
    } else {
      categoryCounts.push({ count, priority, slug, label });
    }
  }

  if (storyCount < 1) return null;

  let topCategory: string | null = null;
  let bestCount = 0;
  let bestPriority = -1;
  let bestSlug = "";
  for (let index = 0; index < categoryCounts.length; index += 1) {
    const entry = categoryCounts[index];
    const wins =
      entry.count > bestCount ||
      (entry.count === bestCount && entry.priority > bestPriority) ||
      (entry.count === bestCount &&
        entry.priority === bestPriority &&
        (bestSlug === "" || entry.slug < bestSlug));
    if (!wins) continue;
    bestCount = entry.count;
    bestPriority = entry.priority;
    bestSlug = entry.slug;
    topCategory = entry.label;
  }

  return { storyCount, topCategory };
}
