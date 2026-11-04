import assert from "node:assert/strict";
import { latestStories } from "./latestStories";
import { DUPLICATE_ARTICLE_CANONICALS } from "./duplicateArticles";

const duplicate = Object.keys(DUPLICATE_ARTICLE_CANONICALS)[0];
const original = DUPLICATE_ARTICLE_CANONICALS[duplicate];
const story = (slug: string, day: number) => ({ slug, title: slug, createdAt: new Date(Date.UTC(2026, 0, day)) });
const input = [story("old", 1), story("new", 9), story(duplicate, 12), story(original, 8), story("middle", 5), story("new", 7)];
const before = input.slice();
assert.deepEqual(latestStories(input).map((row) => row.slug), ["new", original, "middle", "old"]);
assert.deepEqual(latestStories(input, duplicate).map((row) => row.slug), ["new", "middle", "old"]);
assert.deepEqual(input, before);
assert.equal(latestStories(Array.from({ length: 8 }, (_, i) => story(`story-${i}`, i + 1))).length, 5);
assert.deepEqual(latestStories([]), []);
assert.deepEqual(latestStories([
  { slug: "b", title: "B", createdAt: "2026-01-01T00:00:00Z" },
  { slug: "a", title: "A", createdAt: "2026-01-01T00:00:00Z" },
]).map((row) => row.slug), ["a", "b"]);
console.log("latestStories tests passed");
