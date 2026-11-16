import assert from "node:assert/strict";
import { articleRevalidatePaths, listingHtmlCacheTags } from "./revalidate";

const article = {
  slug: "city-phone-launch",
  category: "Technology",
  language: "en",
  title: "Varanasi airport expansion",
  content: "Gurugram traffic update",
};

{
  const paths = articleRevalidatePaths(article);
  assert.equal(paths.includes("/"), true);
  assert.equal(paths.includes("/articles/city-phone-launch"), true);
  assert.equal(paths.includes("/category/technology"), false);
  assert.equal(paths.includes("/varanasi-news"), false);
  assert.equal(paths.includes("/gurugram-news"), false);
  assert.equal(paths.includes("/varanasi-airport-news"), false);
}

{
  const tags = listingHtmlCacheTags(article);
  assert.equal(tags.includes("listing-category-technology"), true);
  assert.equal(tags.includes("listing-varanasi-news"), true);
  assert.equal(tags.includes("listing-gurugram-news"), true);
  assert.equal(tags.includes("listing-varanasi-airport-news"), true);
  assert.equal(tags.includes("listing-category-automotive"), false);
}

{
  const moved = listingHtmlCacheTags({
    slug: "moved-story",
    category: "Automotive",
    language: "en",
    title: "New bikes",
    previous: {
      category: "Technology",
      language: "en",
      title: "Old phones",
    },
  });
  assert.equal(moved.includes("listing-category-automotive"), true);
  assert.equal(moved.includes("listing-category-technology"), true);
}

{
  const hindi = {
    slug: "hindi-story",
    category: "Technology",
    language: "hi",
    title: "Varanasi",
  };
  assert.deepEqual(articleRevalidatePaths(hindi), ["/articles/hindi-story"]);
  assert.deepEqual(listingHtmlCacheTags(hindi), []);
}

console.log("revalidate.test.ts ok");
