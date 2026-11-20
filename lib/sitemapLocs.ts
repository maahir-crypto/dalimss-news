import { SITE_URL } from "@/lib/seo";

/**
 * Canonical https URL with no query string.
 * Paginated ?page=N listing URLs stay crawlable via rel prev/next and Load More,
 * but stay out of the main sitemap. Page 1 canonicals (no ?page=) remain.
 * RSS feeds, llms files, search, and author archives stay out.
 */
export function isAllowedSitemapLoc(loc: string): boolean {
  if (loc === SITE_URL) return true;
  if (
    !loc.startsWith(`${SITE_URL}/`) ||
    loc.includes("www.") ||
    loc.includes("http://")
  ) {
    return false;
  }
  const pathAndQuery = loc.slice(SITE_URL.length);
  const [path, query] = pathAndQuery.split("?");
  if (!path || path.endsWith("/") || pathAndQuery.split("?").length > 2) {
    return false;
  }
  if (
    path === "/llms.txt" ||
    path === "/llms-full.txt" ||
    path.endsWith("/feed.xml") ||
    path === "/feed.xml" ||
    path.endsWith(".csv")
  ) {
    return false;
  }
  if (path === "/search" || path.startsWith("/search/")) return false;
  // No query strings in the sitemap (including ?page=N).
  if (query) return false;
  return true;
}
