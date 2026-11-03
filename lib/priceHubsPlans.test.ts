import assert from "node:assert/strict";
import {
  PLAN_HUB_SLUG,
  articlesForHub,
  priceHubBySlug,
  priceHubFamilyFor,
  priceHubIdFor,
  priceHubLinkForArticle,
  type PriceHubArticle,
} from "./priceHubs";

// Live titles, tags and sections from dalimss.news, 3 Nov 2026.
// [slug, title, tags, category, expected hub]
const cases: [string, string, string, string, string | null][] = [
  ["airtel-prepaid-730", "How Airtel prepaid recharge stacking works up to 730 days", "Airtel, Prepaid, Recharge, Plan validity, Airtel app, Mobile plans", "Technology", "mobile-and-broadband-plans"],
  ["airtel-icloud-postpaid-1049-to-1799", "Airtel iCloud+ postpaid price list: Rs 1,049 to Rs 1,799", "Airtel, Postpaid, iCloud+, Apple TV, Apple Arcade, Family plans", "Technology", "mobile-and-broadband-plans"],
  ["jio-family-449-899", "Jio family billing explained: four SIMs reach Rs 899 before tax", "Jio, Postpaid, Family plans, Mobile plans, MyJio, Telecom", "Technology", "mobile-and-broadband-plans"],
  ["jio-data-add-ons-11-359", "Jio data add-ons: Rs 11 buys 10 GB for just 1 hour", "Jio, Prepaid, Data packs, Recharge, India", "Technology", "mobile-and-broadband-plans"],
  ["jio-prepaid-349", "Jio Rs 349 prepaid: the 2 GB daily allowance and 5G conditions", "Jio, Prepaid, 5G, Mobile plans, India", "Technology", "mobile-and-broadband-plans"],
  ["vi-prepaid-family-500-mb", "Vi Prepaid Family transfers 500 MB, with a same-day expiry", "Vi, Prepaid, Mobile plans, Data sharing, India", "Technology", "mobile-and-broadband-plans"],
  ["airtel-dth-box-replacement-300-to-2850", "Airtel DTH box replacement price list: Rs 300 to Rs 2,850", "Airtel, Airtel Digital TV, DTH, Set-top boxes, Service charges, Consumer guide", "Technology", "mobile-and-broadband-plans"],
  ["jiofiber-postpaid-0-399-699", "JioFiber postpaid has Rs 0 deposit, but rent is paid in advance", "JioFiber, Jio, Broadband, Postpaid, Internet plans, Consumer guide", "Technology", "mobile-and-broadband-plans"],
  ["jiofiber-prepaid-ott-999-1499-8499", "JioFiber prepaid OTT guide: Netflix begins at Rs 1,499", "JioFiber, JioHome, Broadband, Netflix, Amazon Prime Lite, OTT", "Technology", "mobile-and-broadband-plans"],
  ["airtel-xstream-fiber-price-list-499-to-3999", "Airtel Xstream Fiber price list: Rs 499 to Rs 3,999", "Airtel, Xstream Fiber, Broadband, Wi-Fi, IPTV, Internet plans", "Technology", "mobile-and-broadband-plans"],
  ["tata-play-marathi-super-value-83-to-97-60", "Tata Play Marathi Super Value price list: Rs 83 to Rs 97.60", "Tata Play, DTH, Marathi television, Channel packs, HD television", "Technology", "mobile-and-broadband-plans"],
  ["tata-play-netflix-standard-basic-499-199", "Tata Play Netflix Standard vs Basic price: Basic starts lower at Rs 199", "Tata Play, DTH, Netflix, Digital services, Subscription plans", "Technology", "mobile-and-broadband-plans"],
  ["tata-play-binge-plus-hd-upgrade-1799-1299", "Tata Play Binge+ vs HD upgrade price: HD starts lower at Rs 1,299", "Tata Play, Binge+, HD set-top box, DTH, OTT, TV upgrades", "Technology", "mobile-and-broadband-plans"],
  ["dish-tv-box-repair-250-700", "Dish TV box repair: Rs 250 swap fee and 180-day cover explained", "Dish TV, DTH, Set-top boxes, Warranty, Service charges, Consumer guide", "Technology", "mobile-and-broadband-plans"],
  ["dishtv-multi-tv-50", "DishTV Multi-TV: what the Rs 50 network fee covers", "DishTV, DTH, Multi-TV, Network Capacity Fee, Television plans", "Technology", "mobile-and-broadband-plans"],
  ["dishtv-tv-key-500", "Set up DishTV TV Key on Samsung TVs: check the Rs 500 antenna fee", "DishTV, Samsung, TVKey Cloud, DTH, Digital services, Television setup", "Technology", "mobile-and-broadband-plans"],
  ["jiobharat-b2-offer-1622-activation-free-recharge-rules", "JioBharat B2 offer: why activation costs ₹1,622, not ₹1,499", "JioBharat, Jio, Prepaid recharge, Feature phones, deal", "Technology", "phones"],
  ["jioextender-je6000-price-3499", "JioExtender JE6000 price: Rs 3,499", "Jio, Wi-Fi extenders, Home networking, Smart home, India prices", "Technology", null],
  ["jio-ipo-allotment-status-26-october-2026-refund-listing", "Jio IPO allotment status, 26 October 2026: checks, refunds and listing", "Jio IPO, IPO allotment, KFin Technologies, NSE, BSE, ASBA, demat credit", "Business", null],
  ["jio-platforms-ipo-drhp-ril-shareholder-quota-oct-2026", "Jio Platforms IPO: what the draft prospectus confirms, and what is still only reported", "Jio Platforms IPO, Jio IPO, Reliance Industries, RIL shareholder quota, DRHP, SEBI, IPO", "Technology", null],
  ["jioshield-1000-fee-vouchers-privacy-android", "JioShield’s ₹1,000 fee: recharge vouchers and privacy explained", "JioShield, Jio, Parental controls, Android, Consumer privacy, deal", "Technology", null],
  ["jiohotstar-tara-ai-agentic-media-planner-sep-2026", "JioHotstar unveils Tara.ai agentic planner for brand media teams", "JioHotstar, Tara.ai, FICCI Frames, CTV, advertising, AI", "Technology", null],
  ["airtel-free-roaming-postpaid-90-day-wait-exit-charge", "Airtel free roaming: 90-day wait and exit charge explained", "Airtel, International Roaming, Postpaid Plans, Telecom, Consumer Technology", "Technology", null],
  ["vi-free-international-roaming-roam-free-plans-sep-2026", "Vi makes international roaming free on select postpaid, prepaid plans", "Vodafone Idea, Vi, international roaming, telecom, postpaid plans, prepaid plans, travel, Avneesh Khosla", "Technology", null],
  ["free-wifi-varanasi-court-complex-bsnl", "Free High-Speed Wi-Fi Goes Live at Varanasi Court Complex", "Varanasi, free Wi-Fi, court complex, BSNL, Varanasi Municipal Corporation, digital connectivity, smart city", "India, Uttar Pradesh, Varanasi, Technology", null],
  ["cm-100-recharge-structures-gurugram-waterlogging", "CM Plans 100 Recharge Structures After Briefing PM on Flooding", "Gurugram, waterlogging, Nayab Singh Saini, rainwater recharge, IIT Delhi, Nippon Koei, Aravali, GMDA, monsoon", "India, Gurugram", null],
  ["air-india-easyroam-esim-data-benefits-ekyc-refunds", "Air India EasyRoam launches with separate welcome-data terms", "Air India, EasyRoam, eSIM, International Roaming, Consumer Technology, deal", "Technology", null],
  ["iphone-air-reliance-99990-price-esim-stock-october-2026", "iPhone Air at Rs 99,990: Reliance price and buying checks", "iPhone Air, Apple, India prices, Smartphones, deal", "India, Technology", "phones"],
  ["mivi-one-5g-vs-hmd-vibe2-pro-vs-lava-virat-v1-pro-budget-5g-under-1600", "Mivi One 5G vs HMD Vibe2 Pro 5G vs Lava Virat V1 Pro 5G: best budget 5G phone under Rs 16,000 in Big Billion Days", "Mivi One 5G, HMD Vibe2 Pro 5G, Lava Virat V1 Pro 5G, budget 5G phone, Flipkart Big Billion Days, phone comparison", "Technology", "phones"],
];

let fail = 0;
for (const [slug, title, tags, category, want] of cases) {
  const got = priceHubIdFor({ slug, title, tags, category, language: "en" });
  if (got !== want) {
    fail += 1;
    console.log(`FAIL ${slug}: got ${got}, want ${want}`);
  }
}
assert.equal(fail, 0);

// Operator news that is not a plan guide keeps its related-reading family.
for (const [slug, title, tags, category, want] of cases) {
  if (want === PLAN_HUB_SLUG) {
    assert.equal(priceHubFamilyFor({ slug, title, tags, category }), PLAN_HUB_SLUG, slug);
  } else {
    assert.notEqual(priceHubFamilyFor({ slug, title, tags, category }), PLAN_HUB_SLUG, slug);
  }
}

// Hindi stories stay off, as on every hub.
assert.equal(
  priceHubIdFor({
    slug: "jio-prepaid-349",
    title: "Jio Rs 349 prepaid: the 2 GB daily allowance and 5G conditions",
    tags: "Jio, Prepaid, 5G, Mobile plans, India",
    category: "Technology",
    language: "hi",
  }),
  null
);

// Hub copy and in-article link.
const hub = priceHubBySlug(PLAN_HUB_SLUG);
assert.ok(hub);
assert.equal(hub?.path, "/prices/mobile-and-broadband-plans");
assert.equal(hub?.h1, "Mobile, broadband and DTH plan prices");
const first = cases[0];
assert.deepEqual(
  priceHubLinkForArticle({ slug: first[0], title: first[1], tags: first[2], category: first[3] }),
  {
    path: "/prices/mobile-and-broadband-plans",
    label: "More mobile, broadband and DTH plan prices",
  }
);

// Grouped by operator on the hub page; Tata Play is not filed under Tata cars.
const rows: PriceHubArticle[] = cases.map(([slug, title, tags, category], index) => ({
  slug,
  title,
  tags,
  category,
  language: "en",
  createdAt: new Date(Date.UTC(2026, 10, 3) - index * 3600 * 1000),
  updatedAt: new Date(Date.UTC(2026, 10, 3) - index * 3600 * 1000),
}));
const listed = articlesForHub(rows, PLAN_HUB_SLUG);
assert.equal(listed.length, cases.filter((row) => row[4] === PLAN_HUB_SLUG).length);
const brands = new Set(listed.map((row) => row.brand));
for (const name of ["Jio", "Airtel", "Vi", "Tata Play", "Dish TV"]) {
  assert.ok(brands.has(name), name);
}
assert.equal(brands.has("Tata"), false);
assert.equal(brands.has(null), false);

console.log(`priceHubsPlans: ${cases.length} cases ok, ${listed.length} on the plan hub`);
