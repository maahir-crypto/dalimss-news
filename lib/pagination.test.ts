import assert from "node:assert/strict";
import { isAllowedSitemapLoc } from "./sitemapLocs";
import { SITE_URL } from "./seo";
import {
  CATEGORY_ARCHIVE_PAGE_SIZE,
  TOPIC_HUB_PAGE_SIZE,
  isListingPageInRange,
  listingCanonicalUrl,
  listingPath,
  listingRelHrefs,
  listingTotalPages,
  listingWindow,
  parsePageParam,
  slicePage,
  withPageSuffix,
} from "./pagination";

const stories = Array.from({ length: 45 }, (_, index) => ({
  id: index + 1,
  title: `Story ${index + 1}`,
}));

function ids(page: number, pageSize: number): number[] {
  return slicePage(stories, page, pageSize).map((story) => story.id);
}

{
  assert.deepEqual(ids(1, CATEGORY_ARCHIVE_PAGE_SIZE), range(1, 20));
  assert.deepEqual(ids(2, CATEGORY_ARCHIVE_PAGE_SIZE), range(21, 40));
  assert.deepEqual(ids(3, CATEGORY_ARCHIVE_PAGE_SIZE), range(41, 45));
  assert.deepEqual(ids(1, TOPIC_HUB_PAGE_SIZE), range(1, 30));
  assert.deepEqual(ids(2, TOPIC_HUB_PAGE_SIZE), range(31, 45));
  assert.deepEqual(
    ids(1, CATEGORY_ARCHIVE_PAGE_SIZE).filter((id) =>
      ids(2, CATEGORY_ARCHIVE_PAGE_SIZE).includes(id)
    ),
    []
  );

  const window = listingWindow(2, CATEGORY_ARCHIVE_PAGE_SIZE);
  assert.deepEqual(window, { skip: 20, take: 20 });
  assert.deepEqual(
    stories.slice(window.skip, window.skip + window.take).map((story) => story.id),
    ids(2, CATEGORY_ARCHIVE_PAGE_SIZE)
  );
  assert.deepEqual(listingWindow(3, TOPIC_HUB_PAGE_SIZE), { skip: 60, take: 30 });
}

{
  assert.equal(listingTotalPages(0, 20), 0);
  assert.equal(listingTotalPages(20, 20), 1);
  assert.equal(listingTotalPages(21, 20), 2);
  assert.equal(listingTotalPages(60, TOPIC_HUB_PAGE_SIZE), 2);
  assert.equal(isListingPageInRange(1, 0, 20), true);
  assert.equal(isListingPageInRange(2, 0, 20), false);
  assert.equal(isListingPageInRange(1, 20, 20), true);
  assert.equal(isListingPageInRange(2, 20, 20), false);
  assert.equal(isListingPageInRange(2, 21, 20), true);
  assert.equal(isListingPageInRange(3, 45, 20), true);
  assert.equal(isListingPageInRange(4, 45, 20), false);
  assert.equal(isListingPageInRange(2, 45, TOPIC_HUB_PAGE_SIZE), true);
  assert.equal(isListingPageInRange(3, 45, TOPIC_HUB_PAGE_SIZE), false);
}

{
  assert.equal(parsePageParam(undefined), 1);
  assert.equal(parsePageParam("1"), 1);
  assert.equal(parsePageParam("2"), 2);
  assert.equal(parsePageParam("10"), 10);
  assert.equal(parsePageParam("0"), null);
  assert.equal(parsePageParam("01"), null);
  assert.equal(parsePageParam("-1"), null);
  assert.equal(parsePageParam("2.5"), null);
  assert.equal(parsePageParam("abc"), null);
  assert.equal(parsePageParam(""), null);
  assert.equal(parsePageParam(["2"]), null);
}

{
  assert.equal(listingPath("/category/technology", 1), "/category/technology");
  assert.equal(
    listingPath("/category/technology", 2),
    "/category/technology?page=2"
  );
  assert.equal(listingPath("/varanasi-news", 1), "/varanasi-news");
  assert.equal(listingPath("/gurugram-news", 4), "/gurugram-news?page=4");
  assert.equal(listingPath("/category/technology", 1).includes("page="), false);

  assert.equal(
    listingCanonicalUrl("/category/technology", 1),
    "https://dalimss.news/category/technology"
  );
  assert.equal(
    listingCanonicalUrl("/category/technology", 2),
    "https://dalimss.news/category/technology?page=2"
  );
  assert.equal(
    listingCanonicalUrl("/category/automotive", 3),
    "https://dalimss.news/category/automotive?page=3"
  );
  assert.equal(
    listingCanonicalUrl("/varanasi-news", 2),
    "https://dalimss.news/varanasi-news?page=2"
  );
  assert.equal(
    listingCanonicalUrl("/gurugram-news", 2),
    "https://dalimss.news/gurugram-news?page=2"
  );
  assert.equal(listingCanonicalUrl("/category/technology", 2).includes("?page=1"), false);
}

{
  const techTitle =
    "Tech News Today: Latest Technology News India | Dalimss News";
  const techDescription =
    "Latest technology news today from India: phones, gadgets, apps, AI, digital policy, launches and official price lists.";
  assert.equal(withPageSuffix(techTitle, 1), techTitle);
  assert.equal(withPageSuffix(techDescription, 1), techDescription);
  assert.equal(
    withPageSuffix(techTitle, 2),
    `${techTitle} \u2013 Page 2`
  );
  assert.equal(
    withPageSuffix(techDescription, 2),
    `${techDescription} \u2013 Page 2`
  );
  assert.equal(withPageSuffix("Gurugram News", 4).endsWith("\u2013 Page 4"), true);
  assert.equal(withPageSuffix("Gurugram News", 4).includes(" - Page"), false);
  assert.equal(withPageSuffix(techTitle, 2).includes("Page 1"), false);
}

{
  const first = listingRelHrefs("/category/technology", 1, 3);
  assert.equal(first.prev, null);
  assert.equal(first.next, "https://dalimss.news/category/technology?page=2");

  const middle = listingRelHrefs("/varanasi-news", 2, 3);
  assert.equal(middle.prev, "https://dalimss.news/varanasi-news");
  assert.equal(middle.next, "https://dalimss.news/varanasi-news?page=3");

  const last = listingRelHrefs("/gurugram-news", 3, 3);
  assert.equal(last.prev, "https://dalimss.news/gurugram-news?page=2");
  assert.equal(last.next, null);

  const only = listingRelHrefs("/category/automotive", 1, 1);
  assert.equal(only.prev, null);
  assert.equal(only.next, null);
}

{
  assert.equal(
    isAllowedSitemapLoc(`${SITE_URL}/category/technology?page=2`),
    false
  );
  assert.equal(
    isAllowedSitemapLoc(`${SITE_URL}/category/automotive?page=3`),
    false
  );
  assert.equal(isAllowedSitemapLoc(`${SITE_URL}/varanasi-news?page=2`), false);
  assert.equal(isAllowedSitemapLoc(`${SITE_URL}/gurugram-news?page=2`), false);
  assert.equal(isAllowedSitemapLoc(`${SITE_URL}/bhu-news?page=2`), false);
  assert.equal(isAllowedSitemapLoc(`${SITE_URL}/category/technology`), true);
  assert.equal(isAllowedSitemapLoc(`${SITE_URL}/varanasi-news`), true);
  assert.equal(isAllowedSitemapLoc(`${SITE_URL}/articles?page=2`), true);
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

console.log("pagination.test.ts ok");
