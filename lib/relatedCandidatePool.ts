import prisma from "./prisma";
import type { RelatedCandidate } from "./relatedArticles";

/** Refresh the candidate list after it is older than 10 minutes. */
export const RELATED_CANDIDATE_TTL_MS = 10 * 60 * 1000;

export type RelatedCandidateCache = {
  entry?: {
    promise: Promise<RelatedCandidate[]>;
    loadedAt: number;
  };
  inflight?: Promise<RelatedCandidate[]>;
};

const store = global as typeof globalThis & {
  relatedCandidateCache?: RelatedCandidateCache;
};

function sharedCache(): RelatedCandidateCache {
  if (!store.relatedCandidateCache) {
    store.relatedCandidateCache = {};
  }
  return store.relatedCandidateCache;
}

function queryRelatedCandidates(): Promise<RelatedCandidate[]> {
  return prisma.article.findMany({
    select: {
      slug: true,
      title: true,
      tags: true,
      category: true,
      language: true,
    },
  });
}

/**
 * Read the cached candidate list.
 * A list older than ttlMs starts one refresh. Callers keep the previous list
 * while that refresh is in flight, and also when the refresh throws.
 * The first load has no previous list, so its failure is returned to the caller.
 * The article page already ignores that failure and keeps the stored body.
 */
export function readRelatedCandidateCache(input: {
  cache: RelatedCandidateCache;
  now: () => number;
  ttlMs: number;
  load: () => Promise<RelatedCandidate[]>;
  onRefreshError?: (error: unknown) => void;
}): Promise<RelatedCandidate[]> {
  const current = input.cache.entry;
  if (current && input.now() - current.loadedAt <= input.ttlMs) {
    return current.promise;
  }

  const load = () =>
    new Promise<RelatedCandidate[]>((resolve) => {
      resolve(input.load());
    });

  if (current) {
    if (!input.cache.inflight) {
      const report = input.onRefreshError || defaultRefreshError;
      input.cache.inflight = load().then(
        (rows) => {
          input.cache.entry = {
            promise: Promise.resolve(rows),
            loadedAt: input.now(),
          };
          input.cache.inflight = undefined;
          return rows;
        },
        (error: unknown) => {
          input.cache.inflight = undefined;
          report(error);
          return current.promise;
        }
      );
    }
    return current.promise;
  }

  if (!input.cache.inflight) {
    input.cache.inflight = load().then(
      (rows) => {
        const promise = Promise.resolve(rows);
        input.cache.entry = { promise, loadedAt: input.now() };
        input.cache.inflight = undefined;
        return rows;
      },
      (error: unknown) => {
        input.cache.inflight = undefined;
        throw error;
      }
    );
  }
  return input.cache.inflight;
}

function defaultRefreshError(error: unknown): void {
  console.error("Related candidate refresh failed:", error);
}

/**
 * One cached list of published article rows for related link scoring.
 * The Article table has no draft flag. Slug, title, tags, category, and
 * language are enough. The body is not loaded.
 * The list is reused for 10 minutes, then refreshed in the background.
 */
export function loadRelatedCandidatePool(): Promise<RelatedCandidate[]> {
  return readRelatedCandidateCache({
    cache: sharedCache(),
    now: function now() {
      return Date.now();
    },
    ttlMs: RELATED_CANDIDATE_TTL_MS,
    load: queryRelatedCandidates,
  });
}
