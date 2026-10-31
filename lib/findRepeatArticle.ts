import prisma from "@/lib/prisma";
import { slugifyArticleTitle } from "@/lib/articleSlugs";
import { isRepeatPost } from "@/lib/duplicateArticles";

const REPEAT_WINDOW_DAYS = 7;

/**
 * Finds an article published in the last 7 days that the incoming post
 * repeats (same title, or the same body), checking the base slug, its numbered
 * copies and recent posts with the same title.
 */
export async function findRepeatArticle(input: {
  title: string;
  content?: string | null;
  slug?: string | null;
}) {
  const since = new Date(Date.now() - REPEAT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const baseSlug = slugifyArticleTitle(input.slug || input.title);
  const candidates = await prisma.article.findMany({
    where: {
      createdAt: { gte: since },
      OR: [
        { slug: { startsWith: baseSlug } },
        { title: input.title },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  for (const candidate of candidates) {
    if (isRepeatPost(input, candidate)) return candidate;
  }
  return null;
}
