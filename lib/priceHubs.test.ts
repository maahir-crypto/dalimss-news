import assert from "node:assert/strict";
import { renderPriceGuideSection, type PriceGuidePick } from "./llmsPriceGuides";
import { isAllowedSitemapLoc } from "./sitemapLocs";
import {
  PRICE_CHANGE_NOTE,
  PRICE_HUBS,
  PRICE_INDEX,
  articlesForHub,
  brandFromTags,
  collectionPageJsonLd,
  formatIsoDateTimeIST,
  presentHubPage,
  priceDocumentTitle,
  priceHubCsv,
  priceHubIdFor,
  priceHubLinkForArticle,
  priceHubSummaries,
  type PriceHubArticle,
} from "./priceHubs";
import { LISTING_PAGE_SIZE } from "./pagination";

function guide(
  slug: string,
  title: string,
  tags: string,
  category = "Technology",
  hoursAgo = 0
): PriceHubArticle {
  const createdAt = new Date(Date.UTC(2026, 9, 24, 12) - hoursAgo * 60 * 60 * 1000);
  return {
    slug,
    title,
    tags,
    category,
    language: "en",
    createdAt,
    updatedAt: createdAt,
  };
}

const phones = guide(
  "vivo-phone-price-list-india",
  "vivo phone price list India",
  "vivo, vivo V80, Phone prices"
);
const jimny = guide(
  "maruti-jimny-price-october-2026",
  "Maruti Jimny price",
  "Maruti Suzuki, Maruti Jimny, Car prices, Off-road SUV, Automotive",
  "Automotive",
  2
);
const carens = guide(
  "kia-carens-clavis-ev-price-rs-18-03-900-to-rs-24-99-900-2026",
  "Kia Carens Clavis EV price: Rs 18,03,900 to Rs 24,99,900 for all nine trims",
  "Kia, Kia Carens Clavis EV, Electric cars, Car prices, Automotive",
  "Automotive",
  3
);
const xuv = guide(
  "mahindra-xuv-3xo-zng-cng-price-bookings-october-20",
  "Mahindra XUV 3XO ZNG launched at Rs 9.99 lakh",
  "deal, CNG, Mahindra",
  "India, Automotive",
  4
);
const scooter = guide(
  "river-indie-electric-scooter-price-161699-karnataka-oct-2026",
  "River Indie electric scooter price starts at Rs 1,61,699 in Karnataka",
  "River, River Indie, electric scooter, Bengaluru, EV price, India EV",
  "Technology",
  5
);
const bike = guide(
  "bajaj-freedom-125-cng-price-rs-1-04-058-to-rs-1-17-499-october-2026",
  "Bajaj Freedom 125 CNG price: Rs 1,04,058 to Rs 1,17,499, variants explained",
  "Bajaj Freedom 125,Bajaj Auto,CNG motorcycle,commuter bike,bike price India,Diwali 2026",
  "Automotive",
  6
);
const washer = guide(
  "samsung-washing-machine-price-list-india",
  "Samsung washing machine price list India",
  "Samsung, Washing machines, Home appliances, Price list, Technology",
  "Technology",
  7
);
const blender = guide(
  "xech-blendxl-duo-2999-capacity-use-limits",
  "XECH BlendXL Duo launches at Rs 2,999, with fill limits to check",
  "XECH, BlendXL Duo, Portable blender, Kitchen appliances, India price, deal",
  "India, Technology",
  8
);
const ipad = guide(
  "ipad-price-list-india-rs-49-900-to-rs-3-67-900-october-2026",
  "iPad price list India October 2026: Rs 49,900 to Rs 3,67,900 for iPad, mini, Air and Pro",
  "Apple, iPad, iPad Pro, iPad Air, Tablet prices",
  "Technology",
  9
);
const watch = guide(
  "galaxy-watch-price-list-india-watch8",
  "Galaxy Watch price list India: Watch8 from Rs 32,999",
  "Samsung, Galaxy Watch9, Galaxy Watch8, Galaxy Buds, Technology",
  "Technology",
  10
);
const smartwatch = guide(
  "boat-smartwatch-price-list-rs-1-099-to-rs-5-899-october-2026",
  "boAt smartwatch price list: Rs 1,099 to Rs 5,899, AMOLED from Rs 1,699",
  "boAt, Smartwatch, Wearables, Gadget prices, Technology",
  "Technology",
  11
);
const buds = guide(
  "oneplus-nord-buds-4-pro-3999-amazon-gif-early-deal-oct-2026",
  "OnePlus Nord Buds 4 Pro listed at Rs 3,999 in Amazon early festival deals",
  "OnePlus Nord Buds 4 Pro,earbuds,Amazon Great Indian Festival,ANC,India price",
  "Technology",
  12
);
const headphones = guide(
  "sennheiser-momentum-4-20990-amazon-gif-early-deal-oct-2026",
  "Sennheiser Momentum 4 listed at Rs 20,990 in Amazon Great Indian Festival early deals",
  "Sennheiser Momentum 4,headphones,Amazon Great Indian Festival,ANC,India price",
  "Technology",
  13
);
const tablet = guide(
  "amazon-alexa-tablets-prices-us-uk-ship-dates-india-not-listed",
  "Amazon Alexa Tablets: prices from $229.99, US shipping 14 October, UK 19 October, no India date",
  "Amazon Alexa Tablets,Alexa+,Amazon Kids Tablets,tablet prices,Amazon devices,tech launch",
  "World",
  14
);
const garmin = guide(
  "garmin-enduro-4-price-899-dollars-799-pounds-320-hour-battery-india",
  "Garmin Enduro 4 launches at 899.99 dollars with up to 320 hours of GPS battery",
  "Garmin,Garmin Enduro 4,smartwatch,GPS watch,running watch,price,launch",
  "World",
  15
);

const excluded = [
  guide(
    "samsung-galaxy-case-price-list-india-rs-799-to-rs-9-999",
    "Samsung Galaxy case price list India: Rs 799 to Rs 9,999 for S26, A series and foldables",
    "Samsung, Phone cases, Galaxy accessories, Price list, Technology"
  ),
  guide(
    "samsung-monitor-price-list-india-rs-6-199-to-rs-1-73-999",
    "Samsung monitor price list India",
    "Samsung, Monitors, Gaming monitors, Price list, Technology"
  ),
  guide(
    "samsung-tv-price-list-india-rs-17-400-4k-rs-32-490-october-2026",
    "Samsung TV price list India",
    "Samsung, Smart TV, Mini LED, TV prices, Technology"
  ),
  guide(
    "app-store-indie-games-week-india-prices-device-limits",
    "App Store Indie Games Week: India prices and device limits",
    "Apple, App Store, Mobile games, iPhone, iPad, deal"
  ),
  guide(
    "new-kindle-2026-paperwhite-colorsoft-us-prices-launch-countries-india",
    "Amazon's new Kindle range starts at 149.99 dollars",
    "Amazon Kindle,Kindle Paperwhite,e-reader,US price,India launch",
    "World"
  ),
  guide(
    "cng-price-rises-rs-92-01-gurugram",
    "CNG Price Rises to Rs 92.01 per kg in Gurugram",
    "CNG price, Gurugram fuel price, IGL, cab fares, Delhi NCR",
    "India, Gurugram"
  ),
];

{
  assert.equal(priceHubIdFor(phones), "phones");
  assert.equal(priceHubIdFor(jimny), "cars");
  assert.equal(priceHubIdFor(carens), "cars");
  assert.equal(priceHubIdFor(xuv), "cars");
  assert.equal(priceHubIdFor(scooter), "two-wheelers");
  assert.equal(priceHubIdFor(bike), "two-wheelers");
  assert.equal(priceHubIdFor(washer), "appliances");
  assert.equal(priceHubIdFor(blender), "appliances");
  assert.equal(priceHubIdFor(ipad), "laptops-and-tablets");
  assert.equal(priceHubIdFor(watch), "watches-and-audio");
  assert.equal(priceHubIdFor(smartwatch), "watches-and-audio");
  assert.equal(priceHubIdFor(buds), "watches-and-audio");
  assert.equal(priceHubIdFor(headphones), "watches-and-audio");
  assert.equal(priceHubIdFor(tablet), "laptops-and-tablets");
  assert.equal(priceHubIdFor(garmin), "watches-and-audio");
  for (const article of excluded) {
    assert.equal(priceHubIdFor(article), null, article.slug);
  }
  assert.equal(
    priceHubIdFor({ ...phones, language: "hi" }),
    null
  );
}

{
  assert.equal(brandFromTags(phones.tags), "vivo");
  assert.equal(brandFromTags(jimny.tags), "Maruti Suzuki");
  assert.equal(brandFromTags("TVS Motor, TVS Jupiter, Scooter prices"), "TVS");
  assert.equal(brandFromTags("Google, Pixel 11, Smartphone prices"), "Google");
  assert.equal(brandFromTags(smartwatch.tags), "boAt");
  assert.equal(brandFromTags("iQOO, iQOO 15, Phone prices"), "iQOO");
  assert.equal(brandFromTags(washer.tags), "Samsung");
  assert.equal(brandFromTags(garmin.tags), "Garmin");
  assert.equal(brandFromTags(tablet.tags), null);
  assert.equal(brandFromTags("Diwali phones, festive sale"), null);
}

{
  const link = priceHubLinkForArticle(phones);
  assert.deepEqual(link, {
    path: "/prices/phones",
    label: "More phone prices",
  });
  assert.equal(priceHubLinkForArticle(excluded[0]), null);
  assert.equal(
    priceHubLinkForArticle(scooter)?.label,
    "More two-wheeler prices"
  );
  assert.equal(priceHubLinkForArticle(ipad)?.label, "More laptop and tablet prices");
  assert.equal(priceHubLinkForArticle(watch)?.label, "More watch and audio prices");
}

{
  const rows = [
    phones,
    jimny,
    carens,
    xuv,
    scooter,
    bike,
    washer,
    ipad,
    watch,
    ...excluded,
  ];
  const summaries = priceHubSummaries(rows);
  const slugs = summaries.map((summary) => summary.hub.slug);
  assert.deepEqual(slugs, PRICE_HUBS.map((hub) => hub.slug));
  assert.equal(summaries.find((summary) => summary.hub.slug === "phones")?.count, 1);
  const phoneRows = articlesForHub(rows, "phones");
  assert.equal(phoneRows.length, 1);
  assert.equal(phoneRows[0].brand, "vivo");
  const carRows = articlesForHub(rows, "cars");
  assert.deepEqual(
    carRows.map((row) => row.slug),
    [jimny.slug, carens.slug, xuv.slug]
  );
  assert.deepEqual(
    carRows.map((row) => row.brand),
    ["Maruti Suzuki", "Kia", "Mahindra"]
  );
  assert.equal(articlesForHub([scooter, bike], "cars").length, 0);
  assert.equal(articlesForHub([scooter, bike], "two-wheelers").length, 2);
}

{
  const older = guide("samsung-phone-price", "Samsung phone price A", "Samsung, Phone prices", "Technology", 5);
  const newer = guide("samsung-phone-price", "Samsung phone price B", "Samsung, Phone prices", "Technology", 1);
  const listed = articlesForHub([older, newer], "phones");
  assert.equal(listed.length, 1);
  assert.equal(listed[0].title, newer.title);
}

{
  const many: PriceHubArticle[] = [];
  for (let index = 0; index < LISTING_PAGE_SIZE + 1; index += 1) {
    many.push(
      guide(
        `vivo-phone-price-${index}`,
        `vivo phone price ${index}`,
        "vivo, Phone prices",
        "Technology",
        index
      )
    );
  }
  const ordered = articlesForHub(many, "phones");
  assert.equal(ordered.length, LISTING_PAGE_SIZE + 1);
  const page1 = presentHubPage(ordered, 1);
  const page2 = presentHubPage(ordered, 2);
  assert.ok(page1 && page2);
  const rows1 = page1.groups.flatMap((group) => group.articles);
  const rows2 = page2.groups.flatMap((group) => group.articles);
  assert.equal(rows1.length, LISTING_PAGE_SIZE);
  assert.equal(rows2.length, 1);
  assert.equal(page1.totalPages, 2);
  const json1 = collectionPageJsonLd({
    name: "Phone prices in India",
    description: "Phone price guides.",
    url: "https://dalimss.news/prices/phones",
    items: rows1.map((row) => ({
      name: row.title,
      url: `https://dalimss.news/articles/${row.slug}`,
    })),
  });
  const list = json1.mainEntity as { numberOfItems: number; itemListElement: { position: number }[] };
  assert.equal(list.numberOfItems, rows1.length);
  assert.equal(list.itemListElement.length, rows1.length);
  assert.equal(list.itemListElement[0].position, 1);
  assert.equal(list.itemListElement[rows1.length - 1].position, rows1.length);
  assert.equal(presentHubPage(ordered, 3), null);
  assert.equal(page1.groups[0].brand, "vivo");
}

{
  const unbranded = guide(
    "amazon-alexa-tablets-prices-example",
    "Alexa tablets prices example",
    "tablet prices, Amazon devices",
    "World"
  );
  const page = presentHubPage(articlesForHub([unbranded], "laptops-and-tablets"), 1);
  assert.ok(page);
  assert.equal(page.showUngroupedHeading, false);
  assert.equal(page.groups[0].brand, null);
}

{
  assert.equal(
    formatIsoDateTimeIST(new Date("2026-10-24T08:48:43.062Z")),
    "2026-10-24T14:18:43+05:30"
  );
  const csv = priceHubCsv([
    {
      title: 'Samsung "Galaxy", phone price',
      slug: "samsung-phone-price",
      updatedAt: new Date("2026-10-24T08:48:43.062Z"),
    },
  ]);
  assert.ok(csv.startsWith("title,url,updated\r\n"));
  assert.ok(csv.includes('"Samsung ""Galaxy"", phone price"'));
  assert.ok(
    csv.includes("https://dalimss.news/articles/samsung-phone-price")
  );
  assert.ok(csv.includes("2026-10-24T14:18:43+05:30"));
  assert.equal(csv.split("\r\n").filter(Boolean).length, 2);
}

{
  const generated = [
    PRICE_CHANGE_NOTE,
    PRICE_INDEX.h1,
    PRICE_INDEX.description,
    priceDocumentTitle(PRICE_INDEX.titleLead),
    ...PRICE_INDEX.intro,
    ...PRICE_HUBS.flatMap((hub) => [
      hub.h1,
      hub.navLabel,
      hub.description,
      hub.llmsLabel,
      `More ${hub.moreLabel} prices`,
      priceDocumentTitle(hub.titleLead),
      priceDocumentTitle(hub.titleLead, 2),
      priceDocumentTitle(hub.titleLead, 12),
      ...hub.intro,
    ]),
  ];
  for (const text of generated) {
    assert.equal(text.includes("\u2014"), false, text);
    assert.equal(text.includes("\u2013"), false, text);
    assert.equal(/lowest price|best deal/i.test(text), false, text);
  }
  assert.ok(priceDocumentTitle(PRICE_INDEX.titleLead).length <= 60);
  assert.ok(PRICE_INDEX.description.length <= 155);
  assert.equal(PRICE_INDEX.intro.length, 2);
  for (const hub of PRICE_HUBS) {
    assert.ok(priceDocumentTitle(hub.titleLead).length <= 60, hub.slug);
    assert.ok(priceDocumentTitle(hub.titleLead, 12).length <= 60, hub.slug);
    assert.ok(hub.description.length <= 155, hub.description);
    assert.equal(hub.intro.length, 2);
    assert.ok(hub.intro[0].endsWith("."));
    assert.ok(hub.intro[1].endsWith("."));
  }
  assert.ok(PRICE_CHANGE_NOTE.startsWith("Prices change."));
}

{
  const picks: PriceGuidePick[] = [
    {
      categoryHeading: "Phones",
      brand: "vivo",
      title: "vivo phone price",
      slug: "vivo-phone",
      createdAt: new Date("2026-10-24T00:00:00.000Z"),
    },
  ];
  const markdown = renderPriceGuideSection(picks, [
    { label: "All price guides", href: "https://dalimss.news/prices" },
    { label: "Phone prices", href: "https://dalimss.news/prices/phones" },
  ]);
  assert.ok(markdown.startsWith("## Price guides"));
  assert.ok(markdown.includes("[All price guides](https://dalimss.news/prices)"));
  assert.ok(markdown.includes("[Phone prices](https://dalimss.news/prices/phones)"));
  assert.ok(markdown.indexOf("/prices/phones") < markdown.indexOf("### Phones"));
  assert.equal(markdown.includes("\u2014"), false);
  assert.equal(markdown.includes("\u2013"), false);
}

{
  const base = "https://dalimss.news";
  assert.equal(isAllowedSitemapLoc(`${base}/prices`), true);
  assert.equal(isAllowedSitemapLoc(`${base}/prices/phones`), true);
  assert.equal(isAllowedSitemapLoc(`${base}/prices/phones?page=2`), true);
  assert.equal(isAllowedSitemapLoc(`${base}/prices/laptops-and-tablets?page=10`), true);
  assert.equal(isAllowedSitemapLoc(`${base}/prices?page=2`), false);
  assert.equal(isAllowedSitemapLoc(`${base}/prices/phones?page=1`), false);
  assert.equal(isAllowedSitemapLoc(`${base}/prices/phones.csv`), false);
  assert.equal(isAllowedSitemapLoc(`${base}/articles?page=2`), true);
  assert.equal(isAllowedSitemapLoc(`${base}/hindi?page=2`), true);
  assert.equal(isAllowedSitemapLoc(`${base}/articles?page=1`), false);
  assert.equal(isAllowedSitemapLoc(`${base}/author/someone?page=2`), false);
  assert.equal(isAllowedSitemapLoc(`${base}/llms.txt`), false);
  assert.equal(isAllowedSitemapLoc(`${base}/feed.xml`), false);
  assert.equal(isAllowedSitemapLoc(`${base}/search`), false);
  assert.equal(isAllowedSitemapLoc(base), true);
}

console.log("priceHubs.test.ts ok");
