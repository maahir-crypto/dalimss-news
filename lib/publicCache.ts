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
 * Store anonymous HTML at the edge.
 * A logged-in request is marked private and is not written to the shared cache.
 * Newsroom controls on these pages render in the browser from the session,
 * so the HTML itself does not vary by user.
 */
export function setPublicPageCache(
  req: IncomingMessage,
  res: ServerResponse
): void {
  if (hasSessionCookie(req.headers.cookie)) {
    res.setHeader("Cache-Control", PRIVATE_NO_STORE);
    return;
  }
  res.setHeader("Cache-Control", PUBLIC_PAGE_CACHE_CONTROL);
}
