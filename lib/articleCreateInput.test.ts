import assert from "node:assert/strict";
import { articleCreateFields } from "./articleCreateInput";

const publisherBody = {
  title: "iPhone 18 Pro Reliance Digital price Rs 1,64,900 October 2026",
  slug: "iphone-18-pro-reliance-digital-price-rs-1-64-900-october-2026",
  content: "<p>Reliance Digital listed the iPhone 18 Pro at Rs 1,64,900.</p>",
  excerpt: "Reliance Digital listed the iPhone 18 Pro at Rs 1,64,900 in October 2026.",
  category: "Technology",
  tags: ["iPhone", "Reliance Digital", "price"],
  sources: [{ label: "Reliance Digital", url: "https://www.reliancedigital.in/" }],
  image: "https://example.com/iphone.jpg",
  imageCaption: "Price shown on the Reliance Digital listing.",
  imageAltText: "iPhone 18 Pro on a store listing",
  language: "en",
  reportingBasis:
    "Price read from the Reliance Digital product page on 19 October 2026.",
  author: "Sumit Arora",
};

{
  const fields = articleCreateFields(publisherBody);
  assert.equal(fields.tags, "iPhone, Reliance Digital, price");
  assert.equal(fields.category, "Technology");
  assert.equal(
    articleCreateFields({ ...publisherBody, category: ["Technology", "Business"] }).category,
    "Technology, Business"
  );
  assert.equal(fields.customAuthor, "Sumit Arora");
  assert.equal(
    fields.metaDescription,
    "Reliance Digital listed the iPhone 18 Pro at Rs 1,64,900 in October 2026."
  );
  assert.equal(fields.mediaUrl, "https://example.com/iphone.jpg");
  assert.equal(fields.mediaType, "image");
  assert.deepEqual(fields.mediaItems, [
    { url: "https://example.com/iphone.jpg", type: "image" },
  ]);
  assert.deepEqual(fields.sourceUrls, [
    { label: "Reliance Digital", url: "https://www.reliancedigital.in/" },
  ]);
  assert.equal("excerpt" in fields, false);
  assert.equal("sources" in fields, false);
  assert.equal("image" in fields, false);
}

{
  const fields = articleCreateFields({
    title: "Road tenders",
    content: "<p>Five tenders were published.</p>",
    slug: "gurugram-road-tenders",
    category: "India, Gurugram",
    tags: "Gurugram, roads, tenders",
    focusKeyword: "Gurugram",
    sourceUrl: "https://etenders.hry.nic.in/example",
    sourceUrls: [],
    mediaUrl: "https://example.com/road.jpg",
    mediaType: "image",
    mediaItems: [{ url: "https://example.com/road.jpg", type: "image" }],
    customAuthor: "Sumit Arora",
    metaTitle: "Gurugram road tenders",
    metaDescription: "Five fresh road tenders cover GMDA sector works and Palam Vihar resurfacing.",
    imageAltText: "A road",
    imageCaption: "An illustration of a road.",
    language: "en",
    reportingBasis: "Haryana e-procurement portal notices published on 17 October.",
  });

  assert.equal(fields.tags, "Gurugram, roads, tenders");
  assert.equal(fields.category, "India, Gurugram");
  assert.equal(fields.mediaUrl, "https://example.com/road.jpg");
  assert.deepEqual(fields.mediaItems, [
    { url: "https://example.com/road.jpg", type: "image" },
  ]);
  assert.deepEqual(fields.sourceUrls, []);
  assert.equal(fields.metaDescription.includes("Five fresh road tenders"), true);
}

console.log("articleCreateInput checks passed");
