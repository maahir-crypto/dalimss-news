import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

interface ArticleIdRow {
  id: number | bigint;
}

/** Lower case, trimmed, single spaces. Same key the SQL byline expression produces. */
export function normalizedAuthorMatchKeys(variants: string[]): string[] {
  return Array.from(
    new Set(
      variants
        .map((variant) => variant.trim().replace(/\s+/g, " ").toLowerCase())
        .filter((variant) => variant.length > 0)
    )
  );
}

/**
 * Article ids whose byline matches any variant after case and whitespace
 * normalisation. Stored bylines are not modified.
 */
export async function articleIdsForAuthorVariants(
  variants: string[]
): Promise<number[]> {
  const keys = normalizedAuthorMatchKeys(variants);
  if (keys.length === 0) return [];

  const rows = await prisma.$queryRaw<ArticleIdRow[]>(Prisma.sql`
    SELECT id
    FROM "Article"
    WHERE lower(btrim(regexp_replace(coalesce("customAuthor", ''), '[[:space:]]+', ' ', 'g')))
      IN (${Prisma.join(keys)})
  `);

  return rows
    .map((row) => Number(row.id))
    .filter((id) => Number.isInteger(id));
}
