import { decodeEntities } from "@/lib/decodeEntities";
import { SITE_URL } from "@/lib/seo";

export const LISTING_PAGE_SIZE = 30;

/**
 * Stories on one /category/* archive page.
 * The inline "Load More" request uses this same size.
 */
export const CATEGORY_ARCHIVE_PAGE_SIZE = 20;

/**
 * Stories on one topic hub page (/varanasi-news, /gurugram-news, and the
 * other hubs). Page 1 stays the 30 stories the hub already showed.
 */
export const TOPIC_HUB_PAGE_SIZE = 30;

const PAGE_DASH = "\u2013";

/** Missing page is page 1. Any other value must be a positive integer. */
export function parsePageParam(
  value: string | string[] | undefined
): number | null {
  if (value === undefined) return 1;
  if (Array.isArray(value) || !/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}

/** Page 1 keeps the existing path. Later pages use a crawlable query. */
export function listingPath(pathname: string, page: number): string {
  return page > 1 ? `${pathname}?page=${page}` : pathname;
}

/** Absolute canonical URL. Page 1 has no ?page=1. */
export function listingCanonicalUrl(pathname: string, page: number): string {
  return `${SITE_URL}${listingPath(pathname, page)}`;
}

/**
 * Document title and meta description for page N.
 * Page 1 is unchanged. Later pages end with "– Page N" (en dash).
 */
export function withPageSuffix(text: string, page: number): string {
  if (!Number.isInteger(page) || page <= 1) return text;
  return `${text} ${PAGE_DASH} Page ${page}`;
}

export function listingTotalPages(totalCount: number, pageSize: number): number {
  if (totalCount <= 0 || pageSize <= 0) return 0;
  return Math.ceil(totalCount / pageSize);
}

/** Page 1 of an empty archive is valid. Any later page needs stories. */
export function isListingPageInRange(
  page: number,
  totalCount: number,
  pageSize: number
): boolean {
  if (!Number.isInteger(page) || page < 1) return false;
  if (totalCount <= 0) return page === 1;
  return page <= listingTotalPages(totalCount, pageSize);
}

/** skip/take for the same ordering the archive already uses. */
export function listingWindow(
  page: number,
  pageSize: number
): { skip: number; take: number } {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeSize = pageSize > 0 ? pageSize : 1;
  return { skip: (safePage - 1) * safeSize, take: safeSize };
}

/** In-memory equivalent of listingWindow, used to test the slice. */
export function slicePage<T>(
  items: readonly T[],
  page: number,
  pageSize: number
): T[] {
  const { skip, take } = listingWindow(page, pageSize);
  return items.slice(skip, skip + take);
}

/** Absolute rel=prev / rel=next targets. Missing ends are null. */
export function listingRelHrefs(
  pathname: string,
  page: number,
  totalPages: number
): { prev: string | null; next: string | null } {
  return {
    prev: page > 1 ? listingCanonicalUrl(pathname, page - 1) : null,
    next:
      totalPages > page ? listingCanonicalUrl(pathname, page + 1) : null,
  };
}

/** Short plain-text excerpt so listing HTML does not include full articles. */
export function listingExcerpt(
  content: string | null | undefined,
  maxLength = 180
): string {
  if (!content) return "";
  return decodeEntities(
    content
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
