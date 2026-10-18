import type { IncomingMessage, ServerResponse } from "http";

/**
 * Anonymous listing HTML.
 * `s-maxage` is the fresh window: about two minutes, so a published story
 * replaces the cached page on the next request after that. The stale copy
 * stays servable for a day, so a crawler that comes back later still gets an
 * edge response instead of a cold database render, and that hit refreshes
 * the cache in the background.
 */
export const PUBLIC_PAGE_CACHE_CONTROL =
  "public, s-maxage=120, stale-while-revalidate=86400";

/** ISR interval for listing pages that do not vary per request. */
export const LISTING_REVALIDATE_SECONDS = 120;

/**
 * /news-sitemap.xml. Fresh for about two minutes, then servable for a day
 * while the edge refreshes it. A published story is in the next response
 * after that window. Publish also drops the shared crawler-file tag so the
 * sitemap does not have to wait out the window.
 */
export const NEWS_SITEMAP_CACHE_CONTROL =
  "public, s-maxage=120, stale-while-revalidate=86400";

/**
 * /llms.txt and /llms-full.txt. Fresh for about ten minutes, with the same
 * day-long stale window so a crawler still gets an edge response.
 */
export const LLMS_CACHE_CONTROL =
  "public, s-maxage=600, stale-while-revalidate=86400";

/** CDN tag for /llms.txt, /llms-full.txt, and /news-sitemap.xml. */
export const CRAWLER_FILES_CACHE_TAG = "crawler-files";

const PRIVATE_NO_STORE = "private, no-store";

const SESSION_COOKIE_PREFIXES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

/** True when the request carries a NextAuth session cookie (including chunked ones). */
export function hasSessionCookie(
  cookieHeader: string | undefined | null
): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => {
    const name = part.trim().split("=")[0] || "";
    return SESSION_COOKIE_PREFIXES.some(
      (prefix) => name === prefix || name.startsWith(`${prefix}.`)
    );
  });
}

/**
 * Anonymous responses are cacheable. A session cookie is marked private so
 * that response is not written to the shared cache.
 * Returns false when the response must stay private.
 */
function setSharedCacheControl(
  req: IncomingMessage,
  res: ServerResponse,
  cacheControl: string
): boolean {
  if (hasSessionCookie(req.headers.cookie)) {
    res.setHeader("Cache-Control", PRIVATE_NO_STORE);
    return false;
  }
  res.setHeader("Cache-Control", cacheControl);
  return true;
}

/**
 * Store anonymous HTML at the edge.
 * A logged-in request is marked private and is not written to the shared cache.
 * Newsroom controls on these pages render in the browser from the session,
 * so the HTML itself does not vary by user.
 */
export function setPublicPageCache(
  req: IncomingMessage,
  res: ServerResponse
): void {
  setSharedCacheControl(req, res, PUBLIC_PAGE_CACHE_CONTROL);
}

/**
 * Store an anonymous crawler file at the edge and tag it for purge on publish.
 * A logged-in request is private and is not tagged, so it cannot replace the
 * shared copy.
 */
export function setCrawlerFileCache(
  req: IncomingMessage,
  res: ServerResponse,
  cacheControl: string
): void {
  if (!setSharedCacheControl(req, res, cacheControl)) return;
  res.setHeader("Vercel-Cache-Tag", CRAWLER_FILES_CACHE_TAG);
}
