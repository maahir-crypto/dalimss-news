import { isPriceHubListingPath } from "@/lib/priceHubs";
import { SITE_URL } from "@/lib/seo";

/**
 * Canonical https URL, or a listing page query of ?page=2 and later.
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
  if (path.startsWith("/author/") && query) return false;
  if (!query) return true;
  if (/(^|&)search=/.test(query)) return false;
  return (
    /^page=([2-9]|[1-9]\d+)$/.test(query) &&
    (path === "/articles" || path === "/hindi" || isPriceHubListingPath(path))
  );
}
