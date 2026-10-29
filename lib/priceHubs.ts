import { decodeEntities } from "@/lib/decodeEntities";
import { LISTING_PAGE_SIZE } from "@/lib/pagination";
import {
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  canonicalArticleSlug,
} from "@/lib/seo";

/**
 * Price-guide hubs. Membership comes from tags, category, slug, and title.
 * A guide is listed on one hub. Empty hubs are left out by the callers.
 */

export const PRICE_INDEX_PATH = "/prices";
export const PRICE_CHANGE_NOTE =
  "Prices change. Confirm the current figure with the seller before you buy.";

export type PriceHubSlug =
  | "phones"
  | "cars"
  | "two-wheelers"
  | "appliances"
  | "laptops-and-tablets"
  | "watches-and-audio"
  | "tvs-and-projectors"
  | "gadgets-and-accessories";

export type PriceHubConfig = {
  slug: PriceHubSlug;
  path: string;
  h1: string;
  navLabel: string;
  moreLabel: string;
  llmsLabel: string;
  /** Document title lead, without the site name or a page number. */
  titleLead: string;
  description: string;
  intro: [string, string];
};

/**
 * First hub wins a tie. Specific catalogues (cases, earbuds, tablets, TVs)
 * sit ahead of phones and cars so a shared word does not pull them across.
 */
const HUB_ORDER: PriceHubSlug[] = [
  "two-wheelers",
  "appliances",
  "laptops-and-tablets",
  "watches-and-audio",
  "tvs-and-projectors",
  "gadgets-and-accessories",
  "phones",
  "cars",
];

export const PRICE_HUBS: PriceHubConfig[] = [
  {
    slug: "phones",
    path: "/prices/phones",
    h1: "Phone prices in India",
    navLabel: "Phones",
    moreLabel: "phone",
    llmsLabel: "Phone prices",
    titleLead: "Phone Prices in India",
    description:
      "Phone price guides from Dalimss News, newest first. Each link is a report already published on this site.",
    intro: [
      "This page lists Dalimss News phone price guides, newest first.",
      "The date beside each link is when that report was last updated.",
    ],
  },
  {
    slug: "cars",
    path: "/prices/cars",
    h1: "Car prices in India",
    navLabel: "Cars",
    moreLabel: "car",
    llmsLabel: "Car prices",
    titleLead: "Car Prices in India",
    description:
      "Car price guides from Dalimss News, newest first. Each link is a report already published on this site.",
    intro: [
      "This page lists Dalimss News car price guides, newest first.",
      "The date beside each link is when that report was last updated.",
    ],
  },
  {
    slug: "two-wheelers",
    path: "/prices/two-wheelers",
    h1: "Scooter and bike prices in India",
    navLabel: "Scooters and bikes",
    moreLabel: "two-wheeler",
    llmsLabel: "Scooter and bike prices",
    titleLead: "Scooter and Bike Prices",
    description:
      "Scooter and bike price guides from Dalimss News, newest first. Each link is a report already published on this site.",
    intro: [
      "This page lists Dalimss News scooter and bike price guides, newest first.",
      "The date beside each link is when that report was last updated.",
    ],
  },
  {
    slug: "appliances",
    path: "/prices/appliances",
    h1: "Appliance prices in India",
    navLabel: "Appliances",
    moreLabel: "appliance",
    llmsLabel: "Appliance prices",
    titleLead: "Appliance Prices in India",
    description:
      "Appliance price guides from Dalimss News, newest first. Each link is a report already published on this site.",
    intro: [
      "This page lists Dalimss News appliance price guides, newest first.",
      "The date beside each link is when that report was last updated.",
    ],
  },
  {
    slug: "laptops-and-tablets",
    path: "/prices/laptops-and-tablets",
    h1: "Laptop and tablet prices in India",
    navLabel: "Laptops and tablets",
    moreLabel: "laptop and tablet",
    llmsLabel: "Laptop and tablet prices",
    titleLead: "Laptop and Tablet Prices",
    description:
      "Laptop and tablet price guides from Dalimss News, newest first. Each link is a report already published on this site.",
    intro: [
      "This page lists Dalimss News laptop and tablet price guides, newest first.",
      "The date beside each link is when that report was last updated.",
    ],
  },
  {
    slug: "watches-and-audio",
    path: "/prices/watches-and-audio",
    h1: "Watch and audio prices in India",
    navLabel: "Watches and audio",
    moreLabel: "watch and audio",
    llmsLabel: "Watch and audio prices",
    titleLead: "Watch and Audio Prices",
    description:
      "Watch and audio price guides from Dalimss News, newest first. Each link is a report already published on this site.",
    intro: [
      "This page lists Dalimss News watch and audio price guides, newest first.",
      "The date beside each link is when that report was last updated.",
    ],
  },
  {
    slug: "tvs-and-projectors",
    path: "/prices/tvs-and-projectors",
    h1: "TV and projector prices in India",
    navLabel: "TVs and projectors",
    moreLabel: "TV and projector",
    llmsLabel: "TV and projector prices",
    titleLead: "TV and Projector Prices",
    description:
      "TV, projector and monitor price guides from Dalimss News, newest first. Each link is a report already published on this site.",
    intro: [
      "This page lists Dalimss News TV, projector and monitor price guides, newest first.",
      "The date beside each link is when that report was last updated.",
    ],
  },
  {
    slug: "gadgets-and-accessories",
    path: "/prices/gadgets-and-accessories",
    h1: "Gadget and accessory prices in India",
    navLabel: "Gadgets and accessories",
    moreLabel: "gadget and accessory",
    llmsLabel: "Gadget and accessory prices",
    titleLead: "Gadget and Accessory Prices",
    description:
      "Gadget and accessory price guides from Dalimss News, newest first. Each link is a report already published on this site.",
    intro: [
      "This page lists Dalimss News gadget and accessory price guides, newest first.",
      "The date beside each link is when that report was last updated.",
    ],
  },
];

export const PRICE_INDEX = {
  path: PRICE_INDEX_PATH,
  h1: "Price guides",
  titleLead: "Price Guides in India",
  description:
    "Price guides for phones, TVs, cars, appliances and more on Dalimss News. Each hub links to reports already published on this site.",
  intro: [
    "These hubs collect Dalimss News price guides for phones, TVs, cars, appliances and more.",
    "Each hub links to reports already published on this site.",
  ] as [string, string],
};

const TITLE_SUFFIX = "Dalimss News";

export function priceDocumentTitle(titleLead: string, page = 1): string {
  const lead = page > 1 ? `${titleLead}, Page ${page}` : titleLead;
  return `${lead} | ${TITLE_SUFFIX}`;
}

export function priceHubBySlug(slug: string): PriceHubConfig | undefined {
  return PRICE_HUBS.find((hub) => hub.slug === slug);
}

export function isPriceHubListingPath(path: string): boolean {
  return PRICE_HUBS.some((hub) => hub.path === path);
}

export type PriceHubSource = {
  slug: string;
  title: string;
  tags?: string | null;
  category?: string | null;
  language?: string | null;
};

export type PriceHubArticle = PriceHubSource & {
  updatedAt: Date;
  createdAt: Date;
};

export type PricedGuide<T> = T & { slug: string; brand: string | null };

const PRICE_SIGNAL = /\bpric(?:e|es|ed|ing)\b/i;
const RUPEE_SIGNAL = /(?:₹|\bRs\.?\s*\d)/i;

/**
 * Phone brands used when a price guide names the brand and model but not the
 * word phone. Multi-category brands (Samsung, Apple, Google) are not listed.
 */
const PHONE_LEAD =
  /^(?:oneplus|vivo|iqoo|oppo|xiaomi|realme|redmi|poco|motorola|infinix|nothing phone|nokia|honor|lava|mivi|hmd|tecno|itel)\b/i;

/**
 * Bike-only brands. Checked before the automotive car default so a model
 * name is not filed as a car. TVS is matched separately: the title "TVs"
 * is a television, not the bike brand.
 */
const TWO_WHEELER_BRAND =
  /\b(?:ducati|kawasaki|ktm|triumph|jawa|yezdi|royal enfield|harley(?:-davidson)?|hero|bajaj|ather|ola(?: electric)?|vida|yamaha|vespa|aprilia|benelli|ultraviolette|revolt)\b/i;

const CAR_WORD = /\b(?:cars?|suvs?|mpvs?|hatchbacks?|sedans?)\b/i;
const BIKE_WORD =
  /\b(?:scooters?|motorcycles?|motorbikes?|superbikes?|bikes?|two[- ]wheelers?|motorrad)\b/i;

/** Appliance brands used when the model name is not in the product list. */
const APPLIANCE_LEAD = /^(?:dyson|luminous|atomberg|voltas|ifb|whirlpool)\b/i;

const HUB_PATTERNS: Record<
  PriceHubSlug,
  { fields: RegExp[]; titleSlug: RegExp[] }
> = {
  "two-wheelers": {
    fields: [
      /\bscooters?\b/i,
      /\bmotorcycles?\b/i,
      /\bmotorbikes?\b/i,
      /\bsuperbikes?\b/i,
      /\bbike prices?\b/i,
      /\belectric scooters?\b/i,
      /\belectric motorcycles?\b/i,
      /\btwo[- ]wheelers?\b/i,
    ],
    titleSlug: [],
  },
  appliances: {
    fields: [
      /\bwashing machines?\b/i,
      /\brefrigerators?\b/i,
      /\bfridges?\b/i,
      /\bair conditioners?\b/i,
      /\bmicrowaves?\b/i,
      /\bdishwashers?\b/i,
      /\bwater purifiers?\b/i,
      /\bhome appliances?\b/i,
      /\bkitchen appliances?\b/i,
      /\bblenders?\b/i,
      /\bvacuum cleaners?\b/i,
      /\bvacuums?\b/i,
      /\bair purifiers?\b/i,
      /\bairwraps?\b/i,
      /\bportable power stations?\b/i,
      /\bhair dryers?\b/i,
      /\bhair stylers?\b/i,
    ],
    titleSlug: [],
  },
  "laptops-and-tablets": {
    fields: [
      /\blaptops?\b/i,
      /\btablets?\b/i,
      /\bchromebooks?\b/i,
      /\bgalaxy tab\b/i,
    ],
    titleSlug: [/\bmacbooks?\b/i, /\bipads?\b/i],
  },
  "watches-and-audio": {
    fields: [
      /\bsmart ?watch(?:es)?\b/i,
      /\bwatch(?:es)?\b/i,
      /\bearbuds?\b/i,
      /\bheadphones?\b/i,
      /\bsoundbars?\b/i,
      /\bspeakers?\b/i,
      /\bbuds\b/i,
      /\baudio\b/i,
      /\b(?:fitness|smart|screenless|screen-free|recovery)\s+bands?\b/i,
      /\bfitness trackers?\b/i,
      /\bactivity trackers?\b/i,
    ],
    titleSlug: [/\bairpods?\b/i, /\bhomepods?\b/i],
  },
  "tvs-and-projectors": {
    fields: [
      /\btv\b/i,
      /\bTVs\b/,
      /\btelevisions?\b/i,
      /\bprojectors?\b/i,
      /\bmonitors?\b/i,
    ],
    titleSlug: [],
  },
  "gadgets-and-accessories": {
    fields: [
      /\bchargers?\b/i,
      /\bpower banks?\b/i,
      /\baccessory-cases?\b/i,
      /\baccessory-covers?\b/i,
      /\bgalaxy\s+cases?\b/i,
      /\bmobile\s+cases?\b/i,
      /\bback covers?\b/i,
      /\baccessories\b/i,
      /\bcamera prices?\b/i,
      /\bmirrorless\b/i,
      /\bdslrs?\b/i,
      /\bplaystations?\b/i,
      /\bps5\b/i,
      /\bdualsense\b/i,
      /\bxbox\b/i,
      /\bnintendo(?:\s+switch)?\b/i,
      /\bgaming consoles?\b/i,
      /\bkindles?\b/i,
      /\be-?readers?\b/i,
      /\b(?:smart|ai|vr)\s+glasses\b/i,
      /\bprinters?\b/i,
      /\bpixma\b/i,
      /\bmaxify\b/i,
      /\bselphy\b/i,
      /\bsmart tanks?\b/i,
      /\becotanks?\b/i,
      /\bextension boards?\b/i,
      /\bpower strips?\b/i,
      /\blenses?\b/i,
      /\b(?:charging|usb|type-c|multi-device|data)[\s-]+cables?\b/i,
    ],
    titleSlug: [],
  },
  phones: {
    fields: [
      /\bsmartphones?\b/i,
      /\bmobile phones?\b/i,
      /\bphones?\b/i,
      /\bredmi\b/i,
      /\bgalaxy\s*(?:note\s*\d+|[sazmf]\s*(?:fold|flip)?\s*\d+)/i,
    ],
    titleSlug: [/\biphones?\b/i],
  },
  cars: {
    fields: [
      /\bcars?\b/i,
      /\bsuvs?\b/i,
      /\bmpvs?\b/i,
      /\bhatchbacks?\b/i,
      /\bsedans?\b/i,
    ],
    titleSlug: [],
  },
};

type BrandAlias = { name: string; alias: string };

const BRAND_ALIASES: BrandAlias[] = [
  ["Maruti Suzuki", ["maruti suzuki", "maruti"]],
  ["Royal Enfield", ["royal enfield"]],
  ["Mercedes-Benz", ["mercedes-benz", "mercedes"]],
  ["TVS", ["tvs motor", "tvs"]],
  ["MG", ["jsw mg motor india", "jsw mg motor", "mg motor", "jsw mg", "mg"]],
  ["Hyundai", ["hyundai"]],
  ["Mahindra", ["mahindra"]],
  ["Tata", ["tata motors", "tata.ev", "tata"]],
  ["Kia", ["kia"]],
  ["Toyota", ["toyota"]],
  ["Honda", ["honda"]],
  ["Renault", ["renault"]],
  ["Skoda", ["skoda"]],
  ["Nissan", ["nissan"]],
  ["Volkswagen", ["volkswagen"]],
  ["Audi", ["audi"]],
  ["BMW", ["bmw motorrad", "bmw"]],
  ["Volvo", ["volvo"]],
  ["BYD", ["byd"]],
  ["MINI", ["mini"]],
  ["Jeep", ["jeep"]],
  ["Denza", ["denza"]],
  ["Kawasaki", ["kawasaki"]],
  ["Suzuki", ["suzuki"]],
  ["Yamaha", ["yamaha"]],
  ["Bajaj", ["bajaj"]],
  ["Hero", ["hero"]],
  ["KTM", ["ktm"]],
  ["Ather", ["ather"]],
  ["Ola", ["ola electric", "ola"]],
  ["Vida", ["vida"]],
  ["Ultraviolette", ["ultraviolette"]],
  ["Ampere", ["ampere"]],
  ["Triumph", ["triumph"]],
  ["Harley-Davidson", ["harley-davidson", "harley"]],
  ["Jawa", ["jawa"]],
  ["Yezdi", ["yezdi"]],
  ["Revolt", ["revolt"]],
  ["River", ["river"]],
  ["Vespa", ["vespa"]],
  ["Aprilia", ["aprilia"]],
  ["Benelli", ["benelli"]],
  ["Ducati", ["ducati"]],
  ["Samsung", ["samsung"]],
  ["Apple", ["apple"]],
  ["Google", ["google"]],
  ["vivo", ["vivo"]],
  ["iQOO", ["iqoo"]],
  ["OPPO", ["oppo"]],
  ["OnePlus", ["oneplus"]],
  ["Xiaomi", ["xiaomi"]],
  ["realme", ["realme"]],
  ["Nothing", ["nothing"]],
  ["Motorola", ["motorola"]],
  ["Infinix", ["infinix"]],
  ["Nokia", ["nokia"]],
  ["Poco", ["poco"]],
  ["Honor", ["honor"]],
  ["Asus", ["asus"]],
  ["Lenovo", ["lenovo"]],
  ["Microsoft", ["microsoft"]],
  ["Sony", ["sony"]],
  ["HP", ["hp"]],
  ["Dell", ["dell"]],
  ["Acer", ["acer"]],
  ["MSI", ["msi"]],
  ["boAt", ["boat"]],
  ["Noise", ["noise"]],
  ["Fire-Boltt", ["fire-boltt", "fire boltt"]],
  ["Garmin", ["garmin"]],
  ["JBL", ["jbl"]],
  ["Sennheiser", ["sennheiser"]],
  ["Bose", ["bose"]],
  ["Beats", ["beats"]],
  ["Harman", ["harman"]],
  ["Devialet", ["devialet"]],
  ["LG", ["lg"]],
  ["Whirlpool", ["whirlpool"]],
  ["Bosch", ["bosch"]],
  ["IFB", ["ifb"]],
  ["Godrej", ["godrej"]],
  ["Voltas", ["voltas"]],
  ["Haier", ["haier"]],
  ["Panasonic", ["panasonic"]],
  ["Atomberg", ["atomberg"]],
  ["Dyson", ["dyson"]],
  ["XECH", ["xech"]],
  ["Luminous", ["luminous"]],
  ["Philips", ["philips"]],
  ["Blue Star", ["blue star"]],
  ["Lloyd", ["lloyd"]],
  ["Portronics", ["portronics"]],
  ["Zebronics", ["zebronics"]],
  ["Lumio", ["lumio"]],
  ["Ray-Ban", ["ray-ban"]],
].flatMap(([name, aliases]) =>
  (aliases as string[]).map((alias) => ({ name: name as string, alias }))
);

BRAND_ALIASES.sort((left, right) => right.alias.length - left.alias.length);

const FAMILY_BRANDS: { pattern: RegExp; name: string }[] = [
  { pattern: /^galaxy\b/i, name: "Samsung" },
  { pattern: /^pixel\b/i, name: "Google" },
  { pattern: /^(?:iphone|ipad|macbook|airpods|homepod)\b/i, name: "Apple" },
  { pattern: /^redmi\b/i, name: "Xiaomi" },
  { pattern: /^(?:ideapad|thinkpad|thinkbook)\b/i, name: "Lenovo" },
];

function isPublicSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-+[a-z0-9]+)*$/.test(slug);
}

function splitTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function scrub(value: string): string {
  return value
    .replace(/\bphone cases?\b/gi, " accessory-case ")
    .replace(/\bphone covers?\b/gi, " accessory-cover ")
    .replace(/\bapple\s+tvs?\b/gi, " ")
    .replace(/\btv\s+towers?\b/gi, " ")
    .replace(/\bair\s+monitors?\b/gi, " ")
    .replace(/\bai watch\b/gi, " ");
}

function guideText(article: PriceHubSource): string {
  const slug = (article.slug || "").replace(/-/g, " ");
  return `${slug} ${article.title || ""} ${article.tags || ""} ${article.category || ""}`;
}

function withoutEmptyPrice(text: string): string {
  return text.replace(/\bno\s+prices?\b/gi, " ");
}

/** "No price yet" is not a price report. Other uses of the word still count. */
function hasPriceWord(article: PriceHubSource): boolean {
  return PRICE_SIGNAL.test(withoutEmptyPrice(guideText(article)));
}

/**
 * A rupee figure counts only on the tech and auto desks. City fines, theft
 * reports, and civic budgets also name rupees, and they are not price guides.
 */
function hasRupeeSignal(article: PriceHubSource): boolean {
  if (!RUPEE_SIGNAL.test(guideText(article))) return false;
  return /\b(?:technology|automotive)\b/i.test(article.category || "");
}

/**
 * Model comparisons and buying guides often skip the word price.
 * An explainer that is not itself a price report stays off the hubs.
 */
function hasComparisonSignal(article: PriceHubSource): boolean {
  const text = guideText(article);
  if (/\bexplainer\b/i.test(article.tags || "") && !hasPriceWord(article)) {
    return false;
  }
  if (/\b(?:vs|should you (?:buy|upgrade)|comparisons?)\b/i.test(text)) {
    return true;
  }
  // A buying-guide tag alone is not enough. Insurance and rule explainers
  // use it without a price, a rupee figure, or a model-versus-model slug.
  if (!/\bbuying guides?\b/i.test(text)) return false;
  return hasPriceWord(article) || hasRupeeSignal(article);
}

function isPriceHubCandidate(article: PriceHubSource): boolean {
  return hasPriceWord(article) || hasComparisonSignal(article) || hasRupeeSignal(article);
}

function leadMatch(
  pattern: RegExp,
  title: string,
  slugText: string,
  tags: string | null | undefined
): boolean {
  if (pattern.test(title) || pattern.test(slugText)) return true;
  const first = splitTags(tags)[0] || "";
  return pattern.test(first);
}

function hasTvsBrand(title: string, slug: string, tags: string): boolean {
  if (/\btvs\b/.test(slug)) return true;
  return /\bTVS\b/.test(title) || /\bTVS\b/.test(tags);
}

/**
 * Bike brands win before the car default. BMW, Honda and Suzuki stay on
 * cars when the article is about a car. Maruti Suzuki is a car brand.
 */
function isTwoWheelerArticle(title: string, slug: string, tags: string): boolean {
  const text = `${title}\n${slug}\n${tags}`;
  if (TWO_WHEELER_BRAND.test(text) || hasTvsBrand(title, slug, tags)) return true;
  const car = CAR_WORD.test(text);
  if (/\bbmw\s+motorrad\b/i.test(text)) return true;
  if (/\bbmw\b/i.test(text) && BIKE_WORD.test(text) && !car) return true;
  if (/\bhonda\b/i.test(text) && !car) return true;
  if (/\bmaruti\b/i.test(text)) return false;
  if (/\bsuzuki\b/i.test(text) && !car) return true;
  return false;
}

function patternHit(patterns: RegExp[], text: string): boolean {
  for (let index = 0; index < patterns.length; index += 1) {
    if (patterns[index].test(text)) return true;
  }
  return false;
}

function hubScore(
  slug: PriceHubSlug,
  title: string,
  slugText: string,
  tags: string
): number {
  const patterns = HUB_PATTERNS[slug];
  let score = 0;
  if (patternHit(patterns.fields, tags)) score += 3;
  if (patternHit(patterns.fields, title)) score += 2;
  if (patternHit(patterns.fields, slugText)) score += 2;
  if (
    patterns.titleSlug.length > 0 &&
    (patternHit(patterns.titleSlug, title) ||
      patternHit(patterns.titleSlug, slugText))
  ) {
    score += 2;
  }
  return score;
}

function classifyPriceHub(
  article: PriceHubSource,
  requirePriceSignal: boolean
): PriceHubSlug | null {
  if (article.language === "hi") return null;
  const title = article.title || "";
  const rawSlug = article.slug || "";
  if (!title.trim() || !rawSlug.trim()) return null;
  if (requirePriceSignal && !isPriceHubCandidate(article)) return null;

  const fields = {
    title: scrub(title),
    slug: scrub(rawSlug.replace(/-/g, " ")),
    tags: scrub(`${article.tags || ""}\n${article.category || ""}`),
  };

  const scores = {} as Record<PriceHubSlug, number>;
  for (let index = 0; index < HUB_ORDER.length; index += 1) {
    const slug = HUB_ORDER[index];
    scores[slug] = hubScore(slug, fields.title, fields.slug, fields.tags);
  }

  // Bike brands are decided before this block. A price report filed under
  // Automotive, with no scooter or bike wording, is a car guide. Model names
  // such as XUV are not a separate keyword list.
  // Charger wording in an EV story stays here, not on the accessory hub.
  // A rupee figure or a comparison, with no vehicle wording and no price
  // word, is not assumed to be a car guide.
  if (isTwoWheelerArticle(fields.title, fields.slug, fields.tags)) {
    return "two-wheelers";
  }

  if (/\bautomotive\b/i.test(article.category || "")) {
    const two = scores["two-wheelers"];
    const car = scores.cars;
    if (two > car && two > 0) return "two-wheelers";
    if (car > 0 && car >= two) return "cars";
    if (two > 0) return "two-wheelers";
    if (hasPriceWord(article) || !requirePriceSignal) return "cars";
    return null;
  }

  let best = 0;
  let winner: PriceHubSlug | null = null;
  for (let index = 0; index < HUB_ORDER.length; index += 1) {
    const slug = HUB_ORDER[index];
    if (scores[slug] > best) {
      best = scores[slug];
      winner = slug;
    }
  }
  if (winner) return winner;
  // Brand lead is only for reports that use the word price. A rupee amount
  // in a refund note or a "no price yet" demo is not a phone guide.
  // Related-reading fallback may still follow a brand lead when the story
  // itself is not a price report.
  if (requirePriceSignal && !hasPriceWord(article)) return null;
  if (leadMatch(PHONE_LEAD, fields.title, fields.slug, article.tags)) {
    return "phones";
  }
  if (leadMatch(APPLIANCE_LEAD, fields.title, fields.slug, article.tags)) {
    return "appliances";
  }
  return null;
}

export function priceHubIdFor(article: PriceHubSource): PriceHubSlug | null {
  return classifyPriceHub(article, true);
}

/**
 * Product family for a related-reading link.
 * Explainers often skip the word price, so this does not use the price-report gate.
 * Returns null when no hub pattern matches.
 */
export function priceHubFamilyFor(article: PriceHubSource): PriceHubSlug | null {
  return classifyPriceHub(article, false);
}

export function brandFromTags(tags: string | null | undefined): string | null {
  const parsed = splitTags(tags);
  for (let index = 0; index < parsed.length; index += 1) {
    const tag = parsed[index].toLowerCase();
    for (let aliasIndex = 0; aliasIndex < BRAND_ALIASES.length; aliasIndex += 1) {
      const alias = BRAND_ALIASES[aliasIndex];
      if (tag === alias.alias || tag.startsWith(`${alias.alias} `)) {
        return alias.name;
      }
    }
  }
  for (let index = 0; index < parsed.length; index += 1) {
    const tag = parsed[index];
    for (let family = 0; family < FAMILY_BRANDS.length; family += 1) {
      if (FAMILY_BRANDS[family].pattern.test(tag)) return FAMILY_BRANDS[family].name;
    }
  }
  return null;
}

/** Lowercase brand keys from tags and the slug, using the alias list. */
export function brandMatchKeys(
  tags: string | null | undefined,
  slug?: string | null
): string[] {
  const seen: { [key: string]: boolean } = {};
  const keys: string[] = [];
  const add = (value: string) => {
    const key = value.toLowerCase();
    if (!key || seen[key]) return;
    seen[key] = true;
    keys.push(key);
  };
  const addName = (name: string) => {
    add(name);
    for (let index = 0; index < BRAND_ALIASES.length; index += 1) {
      if (BRAND_ALIASES[index].name === name) add(BRAND_ALIASES[index].alias);
    }
  };
  const fromTags = brandFromTags(tags);
  if (fromTags) addName(fromTags);
  const slugText = (slug || "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (slugText) {
    for (let index = 0; index < BRAND_ALIASES.length; index += 1) {
      const alias = BRAND_ALIASES[index].alias;
      if (slugText === alias || slugText.indexOf(`${alias} `) === 0) {
        addName(BRAND_ALIASES[index].name);
        break;
      }
    }
  }
  return keys;
}

export function compareNewest(
  left: { updatedAt: Date; createdAt: Date; slug: string },
  right: { updatedAt: Date; createdAt: Date; slug: string }
): number {
  const updated = right.updatedAt.getTime() - left.updatedAt.getTime();
  if (updated !== 0) return updated;
  const created = right.createdAt.getTime() - left.createdAt.getTime();
  if (created !== 0) return created;
  return left.slug.localeCompare(right.slug);
}

export function articlesForHub<T extends PriceHubArticle>(
  articles: T[],
  hubSlug: string
): PricedGuide<T>[] {
  const sorted = articles.slice().sort(compareNewest);
  const seen = new Set<string>();
  const matched: PricedGuide<T>[] = [];
  for (let index = 0; index < sorted.length; index += 1) {
    const article = sorted[index];
    if (priceHubIdFor(article) !== hubSlug) continue;
    const slug = canonicalArticleSlug(article.slug);
    if (!isPublicSlug(slug) || seen.has(slug)) continue;
    seen.add(slug);
    matched.push({
      ...article,
      slug,
      brand: brandFromTags(article.tags),
    });
  }

  const groups = new Map<string, PricedGuide<T>[]>();
  const unbranded: PricedGuide<T>[] = [];
  for (let index = 0; index < matched.length; index += 1) {
    const article = matched[index];
    if (!article.brand) {
      unbranded.push(article);
      continue;
    }
    const bucket = groups.get(article.brand);
    if (bucket) bucket.push(article);
    else groups.set(article.brand, [article]);
  }

  const branded = Array.from(groups.entries()).map(([brand, items]) => {
    items.sort(compareNewest);
    return { brand, items };
  });
  branded.sort((left, right) => {
    const newest = compareNewest(left.items[0], right.items[0]);
    if (newest !== 0) return newest;
    return left.brand.localeCompare(right.brand);
  });
  unbranded.sort(compareNewest);

  const ordered: PricedGuide<T>[] = [];
  for (let index = 0; index < branded.length; index += 1) {
    ordered.push(...branded[index].items);
  }
  ordered.push(...unbranded);
  return ordered;
}

export type PriceHubSummary = {
  hub: PriceHubConfig;
  count: number;
};

export function priceHubSummaries<T extends PriceHubArticle>(
  articles: T[]
): PriceHubSummary[] {
  const summaries: PriceHubSummary[] = [];
  for (let index = 0; index < PRICE_HUBS.length; index += 1) {
    const hub = PRICE_HUBS[index];
    const count = articlesForHub(articles, hub.slug).length;
    if (count > 0) summaries.push({ hub, count });
  }
  return summaries;
}

export type HubPageGroup<T> = {
  brand: string | null;
  articles: T[];
};

export function presentHubPage<T extends { brand: string | null }>(
  ordered: T[],
  page: number,
  pageSize = LISTING_PAGE_SIZE
): {
  groups: HubPageGroup<T>[];
  totalPages: number;
  showUngroupedHeading: boolean;
} | null {
  if (ordered.length === 0) return null;
  const totalPages = Math.ceil(ordered.length / pageSize);
  if (page < 1 || page > totalPages) return null;
  const slice = ordered.slice((page - 1) * pageSize, page * pageSize);
  const groups: HubPageGroup<T>[] = [];
  for (let index = 0; index < slice.length; index += 1) {
    const article = slice[index];
    const last = groups[groups.length - 1];
    if (!last || last.brand !== article.brand) {
      groups.push({ brand: article.brand, articles: [article] });
    } else {
      last.articles.push(article);
    }
  }
  return {
    groups,
    totalPages,
    showUngroupedHeading: ordered.some((article) => article.brand),
  };
}

export function priceHubLinkForArticle(
  article: PriceHubSource
): { path: string; label: string } | null {
  const slug = canonicalArticleSlug(article.slug || "");
  if (!isPublicSlug(slug)) return null;
  const hubSlug = priceHubIdFor(article);
  if (!hubSlug) return null;
  const hub = priceHubBySlug(hubSlug);
  if (!hub) return null;
  return { path: hub.path, label: `More ${hub.moreLabel} prices` };
}

export function formatIsoDateTimeIST(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";
  const hour = read("hour") === "24" ? "00" : read("hour");
  return `${read("year")}-${read("month")}-${read("day")}T${hour}:${read("minute")}:${read("second")}+05:30`;
}

function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function priceHubCsv(
  articles: { title: string; slug: string; updatedAt: Date | string }[]
): string {
  const lines = ["title,url,updated"];
  for (let index = 0; index < articles.length; index += 1) {
    const article = articles[index];
    const title = decodeEntities(article.title).replace(/\s+/g, " ").trim();
    const url = `${SITE_URL}/articles/${canonicalArticleSlug(article.slug)}`;
    const updated = formatIsoDateTimeIST(article.updatedAt);
    lines.push(`${csvField(title)},${csvField(url)},${csvField(updated)}`);
  }
  return `${lines.join("\r\n")}\r\n`;
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string }[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
