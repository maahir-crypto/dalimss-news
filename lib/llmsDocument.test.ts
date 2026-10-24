import assert from "node:assert/strict";
import { buildLlmsTxt } from "./llmsDocument";

const priceGuides = [
  "## Price guides",
  "",
  "### Phones",
  "",
  "#### vivo",
  "",
  "- [vivo phone price](https://dalimss.news/articles/vivo-phone)",
].join("\n");

const body = buildLlmsTxt(
  [
    "- [Example \u2014 story](https://dalimss.news/articles/example) (2026-10-24): A note \u2013 here.",
  ],
  priceGuides
);

assert.ok(body.includes("## Price guides"));
assert.ok(body.includes("## How to cite"));
assert.ok(body.includes("## Latest articles"));
assert.ok(body.includes("## Optional"));
assert.equal(/^### Feeds$/m.test(body), true);
assert.equal(/^### Sitemaps$/m.test(body), true);
assert.equal(/^## Feeds$/m.test(body), false);
assert.ok(body.indexOf("## Price guides") < body.indexOf("## How to cite"));
assert.ok(body.indexOf("## How to cite") < body.indexOf("## Latest articles"));
assert.ok(body.indexOf("## Latest articles") < body.indexOf("## Optional"));
assert.ok(
  body.includes(
    "Dalimss News is published by PAMF Digimedia Private Limited, Gurugram, Haryana, India. Reporting is in English and Hindi. Prices and rules are taken from official sources and linked in each article."
  )
);
assert.ok(
  body.includes(
    "Cite as Dalimss News with the article URL. Each article shows its publication and update date in IST and links its official sources. To report an error: editor@dalimss.news, see /corrections-policy."
  )
);
for (const url of [
  "https://dalimss.news/masthead",
  "https://dalimss.news/fact-checking",
  "https://dalimss.news/ownership",
  "https://dalimss.news/privacy-policy",
  "https://dalimss.news/terms-and-conditions",
]) {
  assert.ok(body.includes(url), url);
}
assert.ok(
  body.includes(
    "Technology: https://dalimss.news/category/technology. Phone, laptop, wearable and appliance price lists for India, launches and explainers."
  )
);
assert.ok(
  body.includes(
    "Automotive: https://dalimss.news/category/automotive. Car, scooter and motorcycle prices."
  )
);
assert.ok(
  body.includes(
    "Education: https://dalimss.news/category/education. Exams, results, admissions."
  )
);
assert.ok(
  body.includes("Varanasi News: https://dalimss.news/varanasi-news. Local news.")
);
assert.ok(
  body.includes("Gurugram News: https://dalimss.news/gurugram-news. Local news.")
);
assert.equal(body.includes("\u2014"), false);
assert.equal(body.includes("\u2013"), false);
assert.ok(body.includes("Example - story"));
assert.ok(Buffer.byteLength(body, "utf8") < 60 * 1024);

const bulky = buildLlmsTxt(
  Array.from({ length: 4000 }, (_, index) => {
    return `- [Story ${index} ${"word ".repeat(40)}](https://dalimss.news/articles/story-${index}) (2026-10-24): ${"detail ".repeat(30)}`;
  }),
  priceGuides
);
assert.ok(Buffer.byteLength(bulky, "utf8") <= 60 * 1024);
assert.ok(bulky.includes("## Optional"));
assert.ok(bulky.includes("## Price guides"));

console.log("llmsDocument.test.ts ok");
