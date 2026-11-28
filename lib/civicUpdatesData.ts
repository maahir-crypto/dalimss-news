import { listingSlugNotIn } from "@/lib/listingExclusions";
import prisma from "@/lib/prisma";
import { TOPIC_HUBS } from "@/lib/topicHubs";
import {
  civicWindowStart,
  groupCivicStories,
  type CivicUpdateList,
} from "@/lib/civicUpdates";

function varanasiKeywordWhere() {
  return TOPIC_HUBS.varanasi.keywords.flatMap((keyword) => [
    { title: { contains: keyword, mode: "insensitive" as const } },
    { content: { contains: keyword, mode: "insensitive" as const } },
    { category: { contains: keyword, mode: "insensitive" as const } },
    { focusKeyword: { contains: keyword, mode: "insensitive" as const } },
    { tags: { contains: keyword, mode: "insensitive" as const } },
  ]);
}

/**
 * Published Varanasi stories from the last 30 days, then civic grouping.
 * The Prisma filter is the hub keyword query, including Hindi.
 * `createdAt` is the publish time. Callers pass `now` so the window is not
 * a displayed freshness time.
 */
export async function loadCivicUpdates(now: Date): Promise<CivicUpdateList> {
  const rows = await prisma.article.findMany({
    where: {
      AND: [
        { createdAt: { gte: civicWindowStart(now), lte: now } },
        { slug: listingSlugNotIn() },
        { OR: varanasiKeywordWhere() },
      ],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      tags: true,
      metaDescription: true,
      createdAt: true,
    },
  });

  return groupCivicStories(rows, now, { assumeVaranasi: true });
}
