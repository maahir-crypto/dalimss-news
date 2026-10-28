import prisma from "./prisma";
import type { RelatedCandidate } from "./relatedArticles";

const store = global as typeof globalThis & {
  relatedCandidatePool?: Promise<RelatedCandidate[]>;
};

/**
 * One cached list of published article rows for related-link scoring.
 * The Article table has no draft flag. Slug, title, tags, category, and
 * language are enough. The body is not loaded.
 */
export function loadRelatedCandidatePool(): Promise<RelatedCandidate[]> {
  if (!store.relatedCandidatePool) {
    store.relatedCandidatePool = prisma.article
      .findMany({
        select: {
          slug: true,
          title: true,
          tags: true,
          category: true,
          language: true,
        },
      })
      .catch((error: unknown) => {
        store.relatedCandidatePool = undefined;
        throw error;
      });
  }
  return store.relatedCandidatePool;
}
