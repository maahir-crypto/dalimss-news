/**
 * Unit-style checks for deal disclosure and AI illustration captions.
 * Run: npx tsx scripts/check-labelling.tsx
 */
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DealDisclosure } from "../components/DealDisclosure";
import { ArticleJsonLd } from "../components/ArticleJsonLd";
import { isDealArticle } from "../lib/dealArticles";
import {
  AI_ILLUSTRATION_LABEL,
  normalizeImageCaption,
} from "../lib/imageCaption";

const AFTER = "2026-09-08T02:29:24.619+05:30";
const BEFORE = "2026-07-27T13:07:11.291+05:30";
const DISCLOSURE =
  "Dalimss News has no commercial arrangement with the retailer or the brand named in this article.";

const EXCLUDED = [
  "the-titans-of-kashi-the-homegrown-brands-shaping-v-o87un7",
  "sampurnanand-sanskrit-university-book-reading-dikshaotsav",
  "damdami-taksal-chief-harnam-singh-khalsa-urges-schools-to-strengthen-indian-cultural-values",
] as const;

function caption(
  text: string,
  slug: string,
  publishedAt: string | Date | null
) {
  return normalizeImageCaption(text, { slug, publishedAt });
}

function expectSame(
  text: string,
  slug: string,
  publishedAt: string | Date | null
) {
  const result = caption(text, slug, publishedAt);
  assert.equal(result.ai, false, text);
  assert.equal(result.text, text, text);
}

const mg =
  "Illustrative image: Potholed arterial road carrying mixed traffic in Gurugram";
const mgResult = caption(mg, "mg-road-potholes-gmda-old-gurgaon", AFTER);
assert.equal(mgResult.ai, true);
assert.equal(
  mgResult.text,
  `${AI_ILLUSTRATION_LABEL}: Potholed arterial road carrying mixed traffic in Gurugram`
);
assert.ok(mgResult.text.startsWith(AI_ILLUSTRATION_LABEL));

assert.deepEqual(caption("", "x", AFTER), { text: "", ai: false });
assert.deepEqual(caption("   ", "x", AFTER), { text: "", ai: false });
assert.deepEqual(normalizeImageCaption(null, { slug: "x", publishedAt: AFTER }), {
  text: "",
  ai: false,
});

const already = "AI generated illustration: a wet street";
assert.deepEqual(caption(already, "x", BEFORE), { text: already, ai: true });
const alreadyHyphen = "ai-generated illustration of the yard";
assert.deepEqual(caption(alreadyHyphen, "old", BEFORE), {
  text: alreadyHyphen,
  ai: true,
});

expectSame("Illustrative image: A quiet lane", "old-story", BEFORE);
expectSame("Illustrative editorial image.", "old-story", BEFORE);

for (const slug of EXCLUDED) {
  expectSame("Illustrative image: Title graphic over a river.", slug, AFTER);
  expectSame(
    "Illustrative image of a group reading session in a university library.",
    slug,
    AFTER
  );
}

expectSame(
  "Xiaomi 17. Image: company materials.",
  "xiaomi-17-59999-amazon-gif-early-deal-october-2026",
  AFTER
);
expectSame("Image: company materials", "brand-story", AFTER);
expectSame(
  "Illustrative image: A desk. Photo by A. Sharma",
  "photo-story",
  AFTER
);
expectSame(
  "प्रतीकात्मक चित्र: सड़क पर पानी",
  "hindi-story",
  AFTER
);

assert.deepEqual(
  caption("Illustrative editorial image.", "new-story", AFTER),
  { text: `${AI_ILLUSTRATION_LABEL}.`, ai: true }
);
assert.deepEqual(caption("Illustrative image.", "new-story", AFTER), {
  text: `${AI_ILLUSTRATION_LABEL}.`,
  ai: true,
});

assert.deepEqual(
  caption(
    "illustrative image: potholed arterial road",
    "new-story",
    AFTER
  ),
  {
    text: `${AI_ILLUSTRATION_LABEL}: Potholed arterial road`,
    ai: true,
  }
);

const editorialScene =
  "Illustrative editorial image: Uniformed service hockey teams playing on the blue astroturf ground at BHU in Varanasi.";
const editorialSceneResult = caption(editorialScene, "hockey", AFTER);
assert.equal(editorialSceneResult.ai, true);
assert.equal(
  editorialSceneResult.text,
  `${AI_ILLUSTRATION_LABEL}: Uniformed service hockey teams playing on the blue astroturf ground at BHU in Varanasi.`
);

assert.deepEqual(
  caption(
    "Illustrative image of a group reading session in a university library.",
    "reading",
    AFTER
  ),
  {
    text: `${AI_ILLUSTRATION_LABEL} of a group reading session in a university library.`,
    ai: true,
  }
);
assert.deepEqual(
  caption("Illustrative image representing a crowded market.", "market", AFTER),
  {
    text: `${AI_ILLUSTRATION_LABEL} of a crowded market.`,
    ai: true,
  }
);
assert.deepEqual(
  caption("Illustrative image depicting a night stage.", "stage", AFTER),
  {
    text: `${AI_ILLUSTRATION_LABEL} of a night stage.`,
    ai: true,
  }
);

const productSentence =
  "Illustrative editorial image: The composite cylinder is designed to be lighter than a standard steel cylinder and allows users to see the remaining fuel level.";
assert.deepEqual(caption(productSentence, "cylinder", AFTER), {
  text: `${AI_ILLUSTRATION_LABEL}.`,
  ai: true,
});

const longScene = `Illustrative image: ${"A".repeat(141)}`;
assert.deepEqual(caption(longScene, "long", AFTER), {
  text: `${AI_ILLUSTRATION_LABEL}.`,
  ai: true,
});

assert.deepEqual(
  caption(
    "Representational illustration created for Dalimss News.",
    "mahindra-tractor-sales-september-2026-50208-festive-season-shift",
    "2026-10-03T12:27:10.811+05:30"
  ),
  { text: `${AI_ILLUSTRATION_LABEL} for Dalimss News.`, ai: true }
);
assert.deepEqual(
  caption(
    "Representational image generated for Dalimss News.",
    "substation",
    AFTER
  ),
  { text: `${AI_ILLUSTRATION_LABEL} for Dalimss News.`, ai: true }
);
assert.deepEqual(
  caption(
    "Representative image generated for Dalimss News; not a photograph of the reported event.",
    "solar",
    AFTER
  ),
  { text: `${AI_ILLUSTRATION_LABEL} for Dalimss News.`, ai: true }
);

const biennale =
  "A contemporary art installation imagined within Varanasi's living heritage landscape. Editorial illustration generated for Dalimss News.";
const biennaleResult = caption(biennale, "biennale", AFTER);
assert.equal(biennaleResult.ai, true);
assert.equal(
  biennaleResult.text,
  `${AI_ILLUSTRATION_LABEL}: A contemporary art installation imagined within Varanasi's living heritage landscape.`
);

const anya =
  "Representational image. Anya Green Energy's Independence Day-linked campaign is using rooftop solar visibility to encourage public conversation around clean energy in Varanasi.";
assert.deepEqual(caption(anya, "anya", AFTER), {
  text: `${AI_ILLUSTRATION_LABEL}.`,
  ai: true,
});

const icu =
  "The phased drive focused on deep cleaning and disinfection in the Trauma Centre ICU. Representational image generated for Dalimss News.";
const icuResult = caption(icu, "icu", AFTER);
assert.equal(icuResult.ai, true);
assert.equal(
  icuResult.text,
  `${AI_ILLUSTRATION_LABEL}: The phased drive focused on deep cleaning and disinfection in the Trauma Centre ICU.`
);

expectSame(
  "The stocking drive links pond conservation with leased fisheries and local income across four districts.",
  "ponds",
  AFTER
);

const englishDisclosure = renderToStaticMarkup(
  <DealDisclosure language="en" />
);
assert.equal(englishDisclosure.split(DISCLOSURE).length - 1, 1);
assert.match(englishDisclosure, /role="note"/);
assert.match(englishDisclosure, /aria-label="Disclosure"/);
assert.match(
  englishDisclosure,
  /class="my-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"/
);
assert.equal(renderToStaticMarkup(<DealDisclosure language="hi" />), "");

assert.equal(
  isDealArticle({
    title:
      "Xiaomi 17 listed at Rs 59,999 in Amazon Great Indian Festival early deals",
    slug: "xiaomi-17-59999-amazon-gif-early-deal-october-2026",
    category: "Technology",
    tags: "Xiaomi 17, Amazon Great Indian Festival, smartphone, Leica, India price",
  }),
  true
);
assert.equal(
  isDealArticle({
    title:
      "Mahindra tractor sales fall 23% in September as festive demand shifts to October",
    slug: "mahindra-tractor-sales-september-2026-50208-festive-season-shift",
    category: "Automotive",
    tags: "Mahindra tractors, Farm Equipment Business, September 2026 sales, tractor sales India, exports",
  }),
  false
);
assert.equal(
  isDealArticle({
    title: "Brand cuts its own sticker price",
    slug: "brand-direct-price-cut",
    category: "India",
    tags: "deal",
  }),
  true
);
assert.equal(
  isDealArticle({
    title: "Weekend notes",
    slug: "weekend-notes",
    category: "India",
    tags: "Deals",
  }),
  true
);
assert.equal(
  isDealArticle({
    title: "Amazon Great Indian Festival early deal on a phone",
    slug: "amazon-early-deal-phone",
    category: "Technology",
    tags: "no-deal-disclosure",
  }),
  false
);
assert.equal(
  isDealArticle({
    title: "Amazon Great Indian Festival early deal on a phone",
    slug: "amazon-early-deal-phone",
    category: "Technology",
    tags: "deal, no-deal-disclosure",
  }),
  true
);
assert.equal(
  isDealArticle({
    title: "Flipkart Big Billion Days opens with a sale on TVs",
    slug: "flipkart-big-billion-days-tv-sale",
    category: "Business",
    tags: "",
  }),
  true
);
assert.equal(
  isDealArticle({
    title: "Croma price cut on a laptop",
    slug: "croma-laptop-price-cut",
    category: "Reviews",
    tags: null,
  }),
  true
);
assert.equal(
  isDealArticle({
    title: "Meesho coupon for a festival order",
    slug: "meesho-coupon-festive",
    category: "Education",
    tags: "",
  }),
  false
);

const aiJson = JSON.parse(
  renderToStaticMarkup(
    <ArticleJsonLd
      article={{
        title: "MG Road Craters Persist as GMDA Starts Upgrades",
        slug: "mg-road-potholes-gmda-old-gurgaon",
        createdAt: AFTER,
        mediaUrl: "https://dalimss.news/articles/image/mg.jpg",
        imageCaption: mg,
        category: "India, Gurugram",
      }}
    />
  ).replace(/<script type="application\/ld\+json">|<\/script>/g, "")
);
assert.equal(aiJson.image.length, 1);
assert.equal(aiJson.image[0]["@type"], "ImageObject");
assert.equal(aiJson.image[0].url, "https://dalimss.news/articles/image/mg.jpg");
assert.equal(aiJson.image[0].caption, mgResult.text);
assert.equal(
  aiJson.image[0].description,
  "AI-generated illustration for Dalimss News."
);
assert.equal(
  aiJson.image[0].creditText,
  "AI-generated illustration for Dalimss News"
);
assert.deepEqual(aiJson.image[0].creator, {
  "@type": "Organization",
  "@id": "https://dalimss.news/#organization",
  name: "Dalimss News",
});
assert.equal(aiJson.image[0].copyrightNotice, undefined);
assert.equal(aiJson.image[0].license, undefined);
assert.equal(JSON.stringify(aiJson).includes(DISCLOSURE), false);

const creditJson = JSON.parse(
  renderToStaticMarkup(
    <ArticleJsonLd
      article={{
        title: "Xiaomi 17",
        slug: "xiaomi-17-59999-amazon-gif-early-deal-october-2026",
        createdAt: "2026-10-03T03:10:43.324+05:30",
        mediaUrl: "https://dalimss.news/articles/image/xiaomi.jpg",
        imageCaption: "Xiaomi 17. Image: company materials.",
        category: "Technology",
      }}
    />
  ).replace(/<script type="application\/ld\+json">|<\/script>/g, "")
);
assert.deepEqual(creditJson.image, [
  "https://dalimss.news/articles/image/xiaomi.jpg",
]);
assert.equal(JSON.stringify(creditJson).includes(DISCLOSURE), false);

console.log("labelling checks passed");
console.log("mg caption:", mgResult.text);
console.log("biennale caption:", biennaleResult.text);
console.log("icu caption:", icuResult.text);
