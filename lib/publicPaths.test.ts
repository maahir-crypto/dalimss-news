import assert from "node:assert/strict";
import {
  CATEGORY_HUB_PATHS,
  articlePath,
  categoryPath,
  sectionPath,
} from "./publicPaths";
import { itemListSchema, newsMediaOrganizationSchema } from "./seo";

assert.equal(sectionPath("varanasi"), "/varanasi-news");
assert.equal(sectionPath("gurgaon"), "/gurugram-news");
assert.equal(sectionPath("technology"), "/category/technology");
assert.equal(sectionPath("automotive"), "/category/automotive");
assert.equal(sectionPath("[slug]"), "/");
assert.equal(categoryPath("varanasi"), "/category/varanasi");
assert.equal(categoryPath("gurgaon"), "/category/gurgaon");
assert.equal(CATEGORY_HUB_PATHS.varanasi, "/varanasi-news");
assert.equal(articlePath("honor-x9b-battery-80-percent-1000-cycles"), "/articles/honor-x9b-battery-80-percent-1000-cycles");

const items = itemListSchema([
  { name: "One", url: "https://dalimss.news/articles/one" },
  { name: "Two", url: "https://dalimss.news/articles/two" },
]);
assert.equal(items["@type"], "ItemList");
assert.equal(items.numberOfItems, 2);
assert.equal(items.itemListElement[0].position, 1);
assert.equal(items.itemListElement[1].url, "https://dalimss.news/articles/two");

const org = newsMediaOrganizationSchema();
assert.equal(org["@type"], "NewsMediaOrganization");
assert.equal(org.foundingDate, "2024-02");
assert.ok(org.sameAs.includes("https://www.instagram.com/dalimss.news.banaras/"));
assert.ok(org.sameAs.includes("https://www.youtube.com/@dalimss_news"));
assert.equal(org.publishingPrinciples, "https://dalimss.news/editorial-policy");
assert.equal(org.correctionsPolicy, "https://dalimss.news/corrections-policy");
assert.equal(org.ownershipFundingInfo, "https://dalimss.news/ownership");
assert.equal(org.masthead, "https://dalimss.news/masthead");
assert.equal(org.parentOrganization.name, "PAMF Digimedia Private Limited");
assert.equal(org.founder.name, "Maahir Madhok");
assert.ok(org.areaServed.some((place: { name: string }) => place.name === "Varanasi"));
assert.ok(org.areaServed.some((place: { name: string }) => place.name === "Gurugram"));
