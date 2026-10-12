export const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

/** Same window pages/stories/[slug].tsx uses. Older or unpublished stories 404. */
export function activeStoryWhere(now = new Date()) {
  return {
    published: true,
    createdAt: { gt: new Date(now.getTime() - STORY_LIFETIME_MS), lte: now },
  };
}

/**
 * True only for a published story the public story page would still serve.
 * Unpublished stories, and stories outside the 24 hour window, are omitted.
 */
export function isPublicStory(
  story: {
    published?: boolean | null;
    createdAt?: Date | string | null;
    slug?: string | null;
  },
  now = new Date()
): boolean {
  if (story.published !== true || !story.slug) return false;
  const created =
    story.createdAt instanceof Date
      ? story.createdAt
      : story.createdAt
        ? new Date(story.createdAt)
        : null;
  if (!created || Number.isNaN(created.getTime())) return false;
  const windowStart = now.getTime() - STORY_LIFETIME_MS;
  return created.getTime() > windowStart && created.getTime() <= now.getTime();
}
