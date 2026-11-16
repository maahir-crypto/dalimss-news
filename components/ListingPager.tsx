import { listingPath } from "@/lib/pagination";

const controlClass =
  "inline-block bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 disabled:opacity-50 transition-colors";

interface ListingPagerProps {
  /** Page in the URL. "Newer stories" uses this, not the inline cursor. */
  page: number;
  pathname: string;
  hasMore: boolean;
  /** Defaults to page + 1. Moves forward after an inline Load More. */
  nextPage?: number;
  loadingMore?: boolean;
  /** When set, a plain click loads the next page inline. The href stays real. */
  onLoadMore?: () => void;
}

export function ListingPager({
  page,
  pathname,
  hasMore,
  nextPage,
  loadingMore = false,
  onLoadMore,
}: ListingPagerProps) {
  const showNewer = page > 1;
  if (!showNewer && !hasMore) return null;

  const nextHref = listingPath(pathname, nextPage ?? page + 1);

  return (
    <div className="mt-10 text-center bg-gray-50 p-4 rounded-lg">
      {showNewer && (
        <a
          href={listingPath(pathname, page - 1)}
          rel="prev"
          className={`${controlClass}${hasMore ? " mr-3" : ""}`}
        >
          Newer stories
        </a>
      )}
      {hasMore && (
        <a
          href={nextHref}
          rel="next"
          aria-disabled={loadingMore || undefined}
          className={`${controlClass}${loadingMore ? " opacity-50" : ""}`}
          onClick={
            onLoadMore
              ? (event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0
                  ) {
                    return;
                  }
                  event.preventDefault();
                  if (!loadingMore) onLoadMore();
                }
              : undefined
          }
        >
          {loadingMore ? "Loading..." : "Load More Articles"}
        </a>
      )}
    </div>
  );
}
