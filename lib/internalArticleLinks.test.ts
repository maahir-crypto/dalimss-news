import assert from "node:assert/strict";
import { internalArticleSlugs } from "./internalArticleLinks";

assert.deepEqual(internalArticleSlugs(`
  <a href="/articles/local-story?ref=home#top">Story</a>
  [Report](https://dalimss.news/articles/another-story/)
  <a href='https://www.dalimss.news/articles/local-story'>Copy</a>
  <a href="//dalimss.news/articles/live-duplicate-2">Duplicate</a>
  <a href="https://elsewhere.test/articles/foreign">External</a>
  <a href="/category/india">Category</a>
  href: "/articles/static-story"
  href={\`/articles/\${slug}\`}
  "/articles/[slug]"
`), ["local-story", "another-story", "live-duplicate-2", "static-story"]);
assert.deepEqual(internalArticleSlugs('<a href="/articles/hello%2Dworld">Story</a>'), ["hello-world"]);
assert.deepEqual(internalArticleSlugs('<a href="/articles/%broken">Story</a>'), []);
assert.deepEqual(internalArticleSlugs("Nothing linked"), []);
console.log("internalArticleLinks tests passed");
