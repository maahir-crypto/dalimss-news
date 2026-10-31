import prisma from "@/lib/prisma";
import { scoreSameEvent, SameEventScore } from "@/lib/duplicateArticles";

const SAME_EVENT_WINDOW_HOURS = 72;
const SAME_EVENT_MAX_CANDIDATES = 60;

export type SameEventMatch = {
  id: unknown;
  slug: string;
  title: string;
  createdAt: Date;
  score: SameEventScore;
};

/** True when the request asks to publish despite a same-event warning. */
export function wantsSameEventOverride(body: any): boolean {
  if (!body) return false;
  const value = body.allowSameEvent !== undefined ? body.allowSameEvent : body.allow_same_event;
  return value === true || value === "true";
}

/**
 * Finds a story in the same section from the last 72 hours that the incoming
 * story looks like a rewrite of. One indexed query, capped and limited to the
 * fields the comparison needs.
 */
export async function findSameEventArticle(input: {
  title: string;
  content?: string | null;
  category?: string | null;
}): Promise<SameEventMatch | null> {
  const since = new Date(Date.now() - SAME_EVENT_WINDOW_HOURS * 60 * 60 * 1000);
  const where: any = { createdAt: { gte: since } };
  if (input.category) where.category = input.category;
  const candidates = await prisma.article.findMany({
    where,
    select: { id: true, slug: true, title: true, content: true, createdAt: true },
    orderBy: { createdAt: "asc" },
    take: SAME_EVENT_MAX_CANDIDATES,
  });
  let best: SameEventMatch | null = null;
  for (const c of candidates) {
    const score = scoreSameEvent(input, c);
    if (!score.sameEvent) continue;
    // Keep the first published match, so the warning names the original.
    if (!best) best = { id: c.id, slug: c.slug, title: c.title, createdAt: c.createdAt, score };
  }
  return best;
}

export function sameEventWarning(match: SameEventMatch) {
  return {
    error: "This looks like a rewrite of a story published in the last 72 hours.",
    sameEvent: true,
    existing: { slug: match.slug, title: match.title, url: "/articles/" + match.slug },
    score: match.score,
    hint: "If this is a real follow-up with new facts, send allowSameEvent: true to publish it.",
  };
}
