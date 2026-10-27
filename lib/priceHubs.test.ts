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

const tv = guide(
  "samsung-tv-price-list-india-rs-17-400-4k-rs-32-490-october-2026",
  "Samsung TV price list India",
  "Samsung, Smart TV, Mini LED, TV prices, Technology"
);
const gadget = guide(
  "portronics-charger-price-list-20w-rs-399-65w-rs-1-249-oct-2026",
  "Portronics charger price list: 20W from Rs 399, 65W from Rs 1,249",
  "Portronics, Charger, GaN charger, Price list, Technology"
);
const excluded = [
  guide(
    "app-store-indie-games-week-india-prices-device-limits",
    "App Store Indie Games Week: India prices and device limits",
    "Apple, App Store, Mobile games, iPhone, iPad, deal"
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
  assert.equal(priceHubIdFor(tv), "tvs-and-projectors");
  assert.equal(priceHubIdFor(gadget), "gadgets-and-accessories");
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
  assert.equal(brandFromTags(gadget.tags), "Portronics");
  assert.equal(brandFromTags("Zebronics, Projector, Price list"), "Zebronics");
  assert.equal(brandFromTags("Lumio, projector"), "Lumio");
  assert.equal(brandFromTags("Ray-Ban Meta, smart glasses"), "Ray-Ban");
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
    priceHubLinkForArticle(tv)?.label,
    "More TV and projector prices"
  );
  assert.equal(
    priceHubLinkForArticle(gadget)?.label,
    "More gadget and accessory prices"
  );
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
    tv,
    gadget,
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
  assert.equal(isAllowedSitemapLoc(`${base}/prices/tvs-and-projectors`), true);
  assert.equal(isAllowedSitemapLoc(`${base}/prices/gadgets-and-accessories?page=2`), true);
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

{
  // Live titles and tags from 25 Oct 2026. Product guides map to one hub.
  // Commodity, fuel, IPO, policy, and local market stories map to none.
  const listed: {
    slug: string;
    title: string;
    tags: string;
    category?: string;
    language?: string;
    hub: string | null;
  }[] = [
    {
      slug: "portronics-charger-price-list-20w-rs-399-65w-rs-1-249-oct-2026",
      title: "Portronics charger price list: 20W from Rs 399, 65W from Rs 1,249, 33 models",
      tags: "Portronics, Charger, GaN charger, Price list, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "zebronics-projector-price-list-rs-12-999-to-rs-1-49-999-oct-2026",
      title: "Zebronics projector price list: native 1080p from Rs 19,349, 26 models from Rs 12,999",
      tags: "Zebronics, Projector, PixaPlay, Price list, Technology",
      hub: "tvs-and-projectors",
    },
    {
      slug: "playstation-price-list-india-ps-vr2-rs-44-999-dualsense-rs-6-390",
      title: "PS VR2 at Rs 44,999, DualSense at Rs 6,390: PlayStation price list, PS5 consoles unavailable",
      tags: "Sony, PlayStation, PS5, PS VR2, Price list, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "sony-camera-price-list-india-alpha-7-v-rs-2-40-990-october-2026",
      title: "Sony camera price list: Alpha 7 V at Rs 2,40,990, Alpha 7R VI at Rs 4,19,990, 30 models",
      tags: "Sony, Alpha 7 V, Cameras, Mirrorless, Price list, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "portronics-power-bank-price-list-rs-799-to-rs-5-049-october-2026",
      title: "Portronics power bank price list: 24 models from Rs 799, 65W Halley 20K at Rs 2,099",
      tags: "Portronics, Power bank, Accessories, Price list, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "sony-bravia-tv-price-list-india-rs-28-490-to-rs-25-64-991",
      title: "Sony BRAVIA TV price list: 27 models from Rs 28,490 to Rs 25,64,991",
      tags: "Sony, BRAVIA, Smart TV, Price list, Technology",
      hub: "tvs-and-projectors",
    },
    {
      slug: "apple-accessories-price-list-india-rs-1-080-to-rs-42-900",
      title: "Apple accessories price list India: Pencil Pro Rs 11,900, Magic Keyboard Rs 9,500, MagSafe Rs 5,290",
      tags: "Apple, Accessories, Apple Pencil, Magic Keyboard, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "samsung-galaxy-case-price-list-india-rs-799-to-rs-9-999",
      title: "Samsung Galaxy case price list India: Rs 799 to Rs 9,999 for S26, A series and foldables",
      tags: "Samsung, Phone cases, Galaxy accessories, Price list, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "samsung-charger-price-list-india-rs-525-to-rs-6-499-october-2026",
      title: "Samsung charger price list India: 25W adapter Rs 690, 65W Rs 4,499, wireless charger Rs 3,299",
      tags: "Samsung, Chargers, Galaxy accessories, Price list, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "samsung-monitor-price-list-india-rs-6-199-to-rs-1-73-999",
      title: "Samsung monitor price list India: Rs 6,199 to Rs 1,73,999 for Essential, ViewFinity, smart and Odyssey",
      tags: "Samsung, Monitors, Gaming monitors, Price list, Technology",
      hub: "tvs-and-projectors",
    },
    {
      slug: "samsung-tv-price-list-india-rs-17-400-4k-rs-32-490-october-2026",
      title: "Samsung TV price list India: Rs 17,400 to Rs 21,99,900, 4K from Rs 32,490",
      tags: "Samsung, Smart TV, Mini LED, TV prices, Technology",
      hub: "tvs-and-projectors",
    },
    {
      slug: "qled-vs-mini-led-vs-qd-mini-led-vs-oled-tv-explained-festive-sale-oct",
      title: "QLED vs Mini LED vs OLED: what TV labels mean before you buy in the festive sale",
      tags: "QLED TV, Mini LED TV, OLED TV, smart TV, TV buying guide, festive sale",
      hub: "tvs-and-projectors",
    },
    {
      slug: "lumio-arc-7-2026-projector-price-32999-500-lumens-120-inch",
      title: "Lumio Arc 7 (2026) projector is Rs 32,999 with 500 lumens, 120-inch picture and an AI watch assistant",
      tags: "Lumio Arc 7 2026, Lumio, projector, Google TV projector, Arc 5",
      hub: "tvs-and-projectors",
    },
    {
      slug: "mivi-one-5g-vs-hmd-vibe2-pro-vs-lava-virat-v1-pro-budget-5g-under-1600",
      title: "Mivi One 5G vs HMD Vibe2 Pro 5G vs Lava Virat V1 Pro 5G: best budget 5G phone under Rs 16,000 in Big Billion Days",
      tags: "Mivi One 5G, HMD Vibe2 Pro 5G, Lava Virat V1 Pro 5G, budget 5G phone, Flipkart Big Billion Days, phone comparison",
      hub: "phones",
    },
    {
      slug: "realme-p4s-lite-vs-c100i-vs-infinix-smart-20-hd-budget-4g-phones-oct-2",
      title: "realme P4s Lite vs realme C100i vs Infinix SMART 20 HD: which budget 4G phone, or should you go 5G?",
      tags: "realme P4s Lite, realme C100i, Infinix SMART 20 HD, budget phones, 4G phone, phone comparison",
      hub: "phones",
    },
    {
      slug: "samsung-week-2026-galaxy-s26-fe-price-79999-offers-explained",
      title: "Samsung Week 2026: what the Galaxy S26, S26+ and S26 FE actually cost on Samsung.com",
      tags: "Samsung Week 2026, Galaxy S26, Galaxy S26 FE, Galaxy S26 Plus, Samsung sale, Diwali 2026",
      hub: "phones",
    },
    {
      slug: "vivo-v70-vs-v80-should-you-upgrade-originos-7-december-2026",
      title: "Should vivo V70 owners upgrade to the V80, or wait for OriginOS 7?",
      tags: "vivo V70, vivo V80, OriginOS 7, should you upgrade, vivo, smartphone guide",
      hub: "phones",
    },
    {
      slug: "oneplus-diwali-sale-2026-oct-8-15r-54999-15-81999-store-vs-list",
      title: "OnePlus Diwali sale from 8 October: 15R from Rs 54,999, but check the base price",
      tags: "OnePlus Diwali sale, OnePlus 15R, OnePlus 15, festive sale, India price",
      hub: "phones",
    },
    {
      slug: "garmin-cirqa-india-price-25990-colours-sizes-sale-october-2026",
      title: "Garmin CIRQA screen-free band goes on sale in India at Rs 25,990",
      tags: "Garmin CIRQA, Garmin, CIRQA Smart Band, screenless fitness tracker, Garmin India, India price, wearables, fitness band",
      hub: "watches-and-audio",
    },
    {
      slug: "diwali-2026-earbuds-vs-phone-upgrade-budget-guide",
      title: "Should you buy earbuds or save for a phone this Diwali?",
      tags: "Diwali, earbuds, phone upgrade, Amazon GIF, budget guide",
      hub: "watches-and-audio",
    },
    {
      slug: "dyson-october-offers-v8-airwrap-origin-india-prices",
      title: "Dyson October offers: V8 at Rs 29,900, Airwrap Origin at Rs 32,900",
      tags: "Dyson, Deals, V8 Absolute, Airwrap Origin, India Prices, deal",
      hub: "appliances",
    },
    {
      slug: "luminous-edge-go-offer-prices-model-differences-october-2026",
      title: "Luminous EDGE GO offer runs to 8 November: prices and model differences",
      tags: "Luminous, EDGE GO, Portable Power Stations, India Prices, deal",
      hub: "appliances",
    },
    {
      slug: "new-kindle-2026-paperwhite-colorsoft-us-prices-launch-countries-india",
      title: "Amazon's new Kindle range starts at 149.99 dollars, launches in 19 countries and leaves out India",
      tags: "Amazon Kindle, Kindle Paperwhite, Kindle Colorsoft, e-reader, US price, India launch, Amazon devices",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "ray-ban-meta-gen-1-india-price-rs-22400-meta-store-amazon-oct-2026",
      title: "Ray-Ban Meta Gen 1 price in India: Rs 22,400 at Meta, Rs 24,075 on Amazon.in",
      tags: "Ray-Ban Meta, Ray-Ban Meta Gen 1, smart glasses, Meta AI glasses, India price, Amazon Great Indian Festival",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "ray-ban-meta-gen-3-india-price-rs-44300-ranveer-singh-oct-2026",
      title: "Ray-Ban Meta Gen 3 AI glasses go on sale in India from Rs 44,300",
      tags: "Ray-Ban Meta Gen 3, smart glasses, Meta AI, India price, Ranveer Singh",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "portronics-extension-board-price-list-rs-425-to-rs-2-999-oct-2026",
      title: "Portronics extension board price list: 26 models from Rs 425 to Rs 2,999",
      tags: "Portronics, Extension board, Power strip, Price list, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "canon-pixma-tr160-selphy-cp1500-price-11995-to-41095",
      title: "Canon PIXMA TR160 vs SELPHY CP1500 price: CP1500 starts lower at Rs 11,995",
      tags: "Technology, Canon, Portable printers, PIXMA TR160, SELPHY CP1500, India prices",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "canon-maxify-gx1070-gx2070-price-list-29340-to-33275",
      title: "Canon MAXIFY GX1070 and GX2070 price list: Rs 29,340 to Rs 33,275",
      tags: "Technology, Canon, MAXIFY, Printers, Office equipment, India prices",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "hp-smart-tank-580-585-price-14999-to-15500",
      title: "HP Smart Tank 580 vs 585 price: 585 starts lower at Rs 14,999",
      tags: "Technology, HP, Smart Tank, Printers, India prices, Home office",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "sony-lens-price-list-india-e-mount-fe-50mm-f1-8-rs-19-990",
      title:
        "Sony lens price list India: 48 E-mount lenses from Rs 17,490, FE 50mm F1.8 at Rs 19,990",
      tags: "Sony, Camera lens, E-mount, Price list, Technology",
      hub: "gadgets-and-accessories",
    },
    {
      slug: "ducati-multistrada-v2-price-list-1926000-to-2142000",
      title: "Ducati Multistrada V2 price list: Rs 19,26,000 to Rs 21,42,000",
      tags: "Automotive, Ducati, Multistrada V2, Touring Bikes, Price List, India",
      category: "Automotive",
      hub: "two-wheelers",
    },
    {
      slug: "ducati-streetfighter-v2-price-list-1786000-to-2019900",
      title: "Ducati Streetfighter V2 price list: Rs 17,86,000 to Rs 20,19,900",
      tags: "Automotive, Ducati, Streetfighter V2, Premium Bikes, Price List, India",
      category: "Automotive",
      hub: "two-wheelers",
    },
    {
      slug: "honda-city-price-list-1199900-to-2099900",
      title: "Honda City price list: Rs 11,99,900 to Rs 20,99,900",
      tags: "Automotive, Honda, City, Car prices, Sedans, Hybrid cars, India",
      category: "Automotive",
      hub: "cars",
    },
    {
      slug: "bmw-x7-x5-petrol-13490000-9690000",
      title: "BMW X7 petrol vs X5 petrol price: X5 starts lower at Rs 96,90,000",
      tags: "Automotive, BMW, BMW X5, BMW X7, Luxury SUVs, Petrol cars",
      category: "Automotive",
      hub: "cars",
    },
    {
      slug: "honda-activa-price-list",
      title: "Honda Activa price list",
      tags: "Honda, Activa, Price list",
      category: "Automotive",
      hub: "two-wheelers",
    },
    {
      slug: "suzuki-access-price-list",
      title: "Suzuki Access price list",
      tags: "Suzuki, Access, Price list",
      category: "Automotive",
      hub: "two-wheelers",
    },
    {
      slug: "bmw-motorrad-g-310-price-list",
      title: "BMW Motorrad G 310 price list",
      tags: "BMW Motorrad, Price list",
      category: "Automotive",
      hub: "two-wheelers",
    },
    {
      slug: "google-store-india-no-returns-dead-after-purchase-price-match-rules",
      title: "Google Store India has no returns: Dead After Purchase, price match and grievance rules explained",
      tags: "Google, Pixel, Google Store, Consumer rights, Technology",
      hub: null,
    },
    {
      slug: "gurugram-restaurant-week-menus-table-ticket-prices",
      title: "Gurugram Restaurant Week: menus and table-ticket prices",
      tags: "Gurugram, Restaurant Week India, Dining, Comorin, Hosa, Nara Thai, CinCin",
      hub: null,
    },
    {
      slug: "apple-store-india-no-returns-14-day-price-drop-refund-rules",
      title: "Apple Store India has no returns, but a 14-day price-drop refund applies",
      tags: "Apple, Apple Store, Consumer rights, iPhone, Warranty",
      hub: null,
    },
    {
      slug: "gurugram-bajra-purchases-price-support-records",
      title: "Gurugram reports 28,394 tonnes of bajra purchases",
      tags: "Gurugram, Agriculture, Bajra, Price support",
      hub: null,
    },
    {
      slug: "office-2021-support-deadline-india-upgrade-prices",
      title: "Office 2021 support deadline: India prices and free alternatives",
      tags: "Microsoft, Office 2021, Office 2024, Microsoft 365, Software updates, deal",
      hub: null,
    },
    {
      slug: "uk-google-maps-fuel-prices-report-errors",
      title: "UK fuel prices reach Google Maps: how to compare and report errors",
      tags: "UK, Fuel Finder, Google Maps, Consumer information, Travel",
      hub: null,
    },
    {
      slug: "app-store-indie-games-week-india-prices-device-limits",
      title: "App Store Indie Games Week: India prices and device limits",
      tags: "Apple, App Store, Mobile games, iPhone, iPad, deal",
      hub: null,
    },
    {
      slug: "vijay-sales-hsbc-offer-oct-11-nord-6-asus-prices",
      title: "Vijay Sales HSBC offer starts today: Nord 6 and Asus prices",
      tags: "Vijay Sales, HSBC offer, OnePlus Nord 6, Asus TUF A15, Festive sale, India technology, deal",
      hub: null,
    },
    {
      slug: "varanasi-durga-idols-odisha-lucknow-jabalpur-prices-up-10-pct",
      title: "Kashi's Idol Makers Send Durga Murtis to Odisha, Lucknow and Jabalpur; Prices Up About 10 Percent This Year",
      tags: "Varanasi, Durga Puja 2026, Navratri 2026, idol makers, Khojwan",
      hub: null,
    },
    {
      slug: "escape-rooms-gurugram-mystery-rooms-branches-prices-guide",
      title: "Escape Rooms in Gurugram: Mystery Rooms Branches, Prices",
      tags: "Lifestyle, Gurugram, escape rooms, Mystery Rooms, Golf Course Road, Sushant Lok, Elan Epic Mall, Sector 70",
      hub: null,
    },
    {
      slug: "onion-prices-ease-126-cities-kharif-arrivals-buffer-stock-oct-2026",
      title: "Onion prices ease as kharif arrivals and buffer stock reach the markets",
      tags: "onion, commodity prices",
      category: "India",
      language: "hi",
      hub: null,
    },
    {
      slug: "typical-vs-rated-battery-capacity-mah-explained-vivo-samsung-oct-2026",
      title: "Typical vs rated battery capacity: what the mAh on your phone page really means",
      tags: "battery capacity, mAh, vivo S2 FE, vivo V80, Galaxy Z Fold8, explainer, smartphone battery",
      hub: null,
    },
    {
      slug: "eu-cbam-explained-indian-steel-aluminium-exporters-2026-dates-price",
      title: "EU carbon border charge (CBAM): what Indian steel and aluminium exporters need to know in 2026",
      tags: "CBAM, EU carbon border adjustment, steel exports, aluminium exports, EU ETS, India trade",
      hub: null,
    },
    {
      slug: "acevector-ipo-price-rs-32-subscribed-3-30-times-listing-oct-5",
      title: "AceVector fixes IPO price at Rs 32, offer subscribed 3.30 times, shares to list on 5 October",
      tags: "AceVector, Snapdeal, Unicommerce, IPO, allotment, India startups",
      hub: null,
    },
    {
      slug: "moneyview-listing-rs-55-nse-ipo-price-rs-34-oct-2026",
      title: "Moneyview shares open at Rs 55 on NSE against Rs 34 IPO price",
      tags: "Moneyview, Moneyview IPO, share listing, fintech, lending, India startups",
      hub: null,
    },
    {
      slug: "cng-price-rises-rs-92-01-gurugram",
      title: "CNG Price Rises to Rs 92.01 per kg in Gurugram",
      tags: "CNG price, Gurugram fuel price, IGL, cab fares, Delhi NCR",
      category: "India, Gurugram",
      hub: null,
    },
    {
      slug: "varanasi-sweet-prices-sugar-ghee-cashew-costs-rise",
      title: "Varanasi Sweet Shops Raise Prices as Sugar, Ghee and Cashew Costs Climb",
      tags: "Varanasi, sweets, sugar prices, festive market, mithai",
      hub: null,
    },
    {
      slug: "up-raises-fair-price-dealer-margin-araji-line-launch",
      title: "UP Raises Fair-Price Dealer Margin to Rs 125 Per Quintal; Araji Line Joins Launch",
      tags: "Varanasi, Public Distribution System, Ration Dealers, Araji Line, ePOS",
      hub: null,
    },
    {
      slug: "local-produce-keeps-varanasi-vegetable-prices-steady-monsoon",
      title: "Local Produce Keeps Varanasi Vegetable Prices Steady Through Monsoon",
      tags: "Varanasi, Vegetable Prices, Markets, Monsoon, Food",
      hub: null,
    },
    {
      slug: "badagaon-fair-price-dealers-suspend-august-ration-distribution-demands",
      title: "Badagaon Fair-Price Dealers Suspend August Ration Distribution Over Demands",
      tags: "Varanasi, Badagaon, ration, fair-price shops, public distribution system",
      hub: null,
    },
    {
      slug: "everyday-prices-climb-varanasi-markets-festive-demand",
      title: "Everyday Prices Climb Across Varanasi Markets Ahead Of Festive Demand",
      tags: "Varanasi market, food prices, sugar price, rice price, mustard oil, inflation",
      hub: null,
    },
    {
      slug: "beed-student-approaches-bombay-high-court-over-alleged-522-vs-95-score-mismatch",
      title: "Beed Student Approaches Bombay High Court Over Alleged 522 vs 95 Score Mismatch",
      tags: "neet ug 2026, bombay high court, nta score discrepancy, beed student neet case, neet omr sheet mismatch, nta neet result 2026, aurangabad bench, medical entrance exam",
      category: "Education",
      hub: null,
    },
    {
      slug: "land-prices-near-varanasi-airport-could-double-in--ighws9",
      title: "Land Prices Near Varanasi Airport Could Double in a Decade",
      tags: "",
      category: "Varanasi",
      hub: null,
    },
    {
      slug: "fuel-prices-rise-again-petrol-diesel-become-costli-4so5ht",
      title: "Fuel Prices Rise Again: Petrol and Diesel Become Costlier",
      tags: "",
      category: "Varanasi",
      hub: null,
    },
    {
      slug: "coal-price-surge-amid-gas-shortage-hits-hotels-sma-oiq9uv",
      title: "Coal Price Surge Amid Gas Shortage Hits Hotels, Small Businesses and Households",
      tags: "",
      category: "Varanasi",
      hub: null,
    },
    {
      slug: "coal-prices-rise-in-varanasi-amid-lpg-shortage-o16j56",
      title: "Coal Prices Rise in Varanasi Amid LPG Shortage",
      tags: "",
      category: "Varanasi",
      hub: null,
    },
    {
      slug: "gas-cylinder-price-increase-impacts-households-in--16file",
      title: "Gas Cylinder Price Increase Impacts Households in Varanasi",
      tags: "",
      category: "Varanasi",
      hub: null,
    },
    {
      slug: "up-government-vs-swami-avimukteshwaranand-up-govt--g4mixr",
      title: "UP Government vs Swami Avimukteshwaranand",
      tags: "",
      category: "Varanasi",
      hub: null,
    },
  ];

  const seen = new Set<string>();
  for (const row of listed) {
    assert.equal(seen.has(row.slug), false, row.slug);
    seen.add(row.slug);
    const article = guide(row.slug, row.title, row.tags, row.category || "Technology");
    if (row.language) article.language = row.language;
    assert.equal(priceHubIdFor(article), row.hub, row.slug);
    const hubs = PRICE_HUBS.filter((hub) => priceHubIdFor(article) === hub.slug);
    assert.equal(hubs.length, row.hub ? 1 : 0, row.slug);
  }

  const stay = [
    guide(
      "samsung-tab-cover-keyboard-price-list-rs-1-999-to-rs-27-999",
      "Samsung Galaxy Tab keyboard and cover price list India: Rs 1,999 to Rs 27,999",
      "Samsung, Galaxy Tab, Tablet accessories, Price list, Technology"
    ),
    guide(
      "apple-homeview-homepod-mini-2-tv-india-prices-siri-ai",
      "Apple HomeView at Rs 39,900: India dates and Siri AI limits",
      "Apple HomeView, HomePod mini 2, Apple TV 4K, India prices, Siri AI, deal"
    ),
    guide(
      "sony-diwali-soundbar-bravia-prices-warranty-2026",
      "Sony Diwali deals: home theatre and TV warranty terms",
      "Sony, Diwali 2026, BRAVIA, Soundbars, India prices, deal"
    ),
    guide(
      "vivo-v80-vs-oppo-f35-pro-india-price-camera-battery-comparison-oct-202",
      "vivo V80 vs OPPO F35 Pro: is the Rs 17,000 extra worth it?",
      "vivo V80, OPPO F35 Pro, phone comparison, mid-range phones, festive season, smartphone"
    ),
    guide(
      "mahindra-xev-9s-price-rs-21-40-lakh-xev-9e-rs-21-90-lakh-baas",
      "Mahindra XEV 9S from Rs 21.40 lakh, XEV 9e from Rs 21.90 lakh: range, chargers and what BaaS means",
      "Mahindra, XEV 9S, XEV 9e, Electric SUV, Automotive",
      "Automotive"
    ),
    guide(
      "highway-fast-charger-price",
      "Highway fast charger price",
      "EV charging, charger price",
      "Automotive"
    ),
    guide(
      "acerpure-nitro-qled-tv-india-59999-flipkart-sep-2026",
      "Acerpure Nitro QLED TVs land on Flipkart from Rs 59,999",
      "Acerpure, Nitro, QLED TV, Flipkart, Google TV, India launch"
    ),
    guide(
      "dyson-v16-piston-animal-india-79900-sep-2026",
      "Dyson V16 Piston Animal cordless vacuum launches in India at Rs 79,900",
      "Dyson, V16 Piston Animal, cordless vacuum, home appliances, India launch",
      "India, Technology"
    ),
    guide(
      "galaxy-z-fold8-reliance-digital-rs-1-74-999-ultra-october-2026",
      "Galaxy Z Fold8 is Rs 1,74,999 at Reliance Digital",
      "Samsung, Galaxy Z Fold8, foldable phone, Phone prices"
    ),
  ];
  assert.equal(priceHubIdFor(stay[0]), "laptops-and-tablets");
  assert.equal(priceHubIdFor(stay[1]), "watches-and-audio");
  assert.equal(priceHubIdFor(stay[2]), "watches-and-audio");
  assert.equal(priceHubIdFor(stay[3]), "phones");
  assert.equal(priceHubIdFor(stay[4]), "cars");
  assert.equal(priceHubIdFor(stay[5]), "cars");
  assert.equal(priceHubIdFor(stay[6]), "tvs-and-projectors");
  assert.equal(priceHubIdFor(stay[7]), "appliances");
  assert.equal(priceHubIdFor(stay[8]), "phones");

  for (const article of [
    guide(
      "tata-power-kanpur-60kw-chargers-eternity-nh19",
      "Tata Power adds three 60 kW chargers at two Kanpur stops",
      "Tata Power, EV charging, Kanpur, Electric vehicles",
      "Automotive"
    ),
    guide(
      "power-bank-flight-rules-india-100wh-hand-baggage-diwali-2026",
      "Flying with a power bank this Diwali: the 100Wh rule",
      "power bank, flight rules, baggage rules, Diwali travel"
    ),
    guide(
      "fast-charging-explained-usb-pd-pps-supervooc-charger-india",
      "Fast charging explained: USB PD, PPS, SUPERVOOC and which charger to buy in India",
      "fast charging, USB-C, smartphone chargers, Qi2, BIS"
    ),
    guide(
      "lg-tv-warranty-india-november-15-retailer-rules",
      "LG TV warranty offer runs to November 15, with retailer limits",
      "LG, deal, Televisions, Warranty, India",
      "India, Technology"
    ),
    guide(
      "varanasi-tv-tower-price",
      "Varanasi TV Tower restoration price",
      "Varanasi TV Tower, Doordarshan Varanasi",
      "Varanasi"
    ),
    guide(
      "six-air-monitors-price",
      "Six air monitors price for Gurugram",
      "Gurugram, air quality, pollution monitoring",
      "India, Gurugram"
    ),
    guide(
      "vivo-vision-discovery-edition-mr-headset-india-demo-10-cities-oct-2026",
      "vivo Vision mixed reality headset comes to India for demos in 10 cities, no price yet",
      "vivo Vision, mixed reality headset, vivo, MR headset India",
      "Technology"
    ),
    guide(
      "mobile-phone-driving-94-challans-september",
      "94 Fined Rs 4.70 Lakh for Phone Use at Wheel",
      "Gurugram, traffic police, mobile phone, driving, challans",
      "India, Gurugram"
    ),
    guide(
      "five-lakh-stolen-unlocked-car-naria-varanasi-2026",
      "Rs 5 Lakh Stolen From Unlocked Car After Property Registration in Naria",
      "Varanasi, car theft, distraction crime",
      "India, Uttar Pradesh, Varanasi, Crime"
    ),
    guide(
      "vmc-2161-crore-sewer-water-cctv-groundbreaking-sep20-22",
      "Mayor Orders CCTV Watch on Rs 2,161-Crore Sewer and Water Pipeline Works",
      "Varanasi, Municipal Corporation, sewer, water, civic",
      "Varanasi"
    ),
    guide(
      "oppo-find-x10-9-pack-gifts-refund-terms",
      "OPPO's Rs 9 pack has conflicting refund terms",
      "OPPO, Shopping, deal",
      "India, Technology"
    ),
    guide(
      "scorpio-suv-medanta-impound-pending-challans",
      "Police Impound Scorpio With Rs 46,500 Dues",
      "Gurugram, traffic police, Scorpio, challans",
      "India, Gurugram"
    ),
    guide(
      "byd-luxury-brand-denza-announces-india-entry-no-price-launch-date",
      "BYD luxury brand Denza announces India entry, no price or launch date",
      "BYD, Denza, Automotive",
      "Automotive"
    ),
    guide(
      "new-car-bike-third-party-insurance-4-year-6-year-rule-diwali-2026",
      "New car or bike this Diwali: where the 4-year and 6-year third-party insurance rule stands",
      "third-party insurance, motor insurance, new car, two-wheeler, car buying guide",
      "Automotive"
    ),
  ]) {
    assert.equal(priceHubIdFor(article), null, article.slug);
  }
}

console.log("priceHubs.test.ts ok");
