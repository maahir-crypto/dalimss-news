import { canonicalArticleSlug, SITE_URL } from "@/lib/seo";
import { decodeEntities } from "@/lib/decodeEntities";

/**
 * Newest price-guide articles for /llms.txt.
 * At most three titles per brand tag inside each product group,
 * and about 40 titles in total.
 */

const PER_BRAND = 3;
/** Stop once the list is about 40 titles, after finishing the current brand. */
const TARGET_TITLES = 40;
const TITLE_CEILING = 42;

export type PriceGuideSource = {
  slug: string;
  title: string;
  tags: string | null;
  createdAt: Date;
};

export type PriceGuidePick = {
  categoryHeading: string;
  brand: string;
  title: string;
  slug: string;
  createdAt: Date;
};

type GuideCategory = {
  id: string;
  heading: string;
  needles: string[];
};

const CATEGORIES: GuideCategory[] = [
  {
    id: "phones",
    heading: "Phones",
    needles: ["phone price", "smartphone"],
  },
  {
    id: "cars",
    heading: "Cars",
    needles: [
      "car price",
      "suv price",
      "mpv price",
      "hatchback",
      "sedan",
      "electric car",
      "hybrid car",
      "cng car",
      "compact suv",
    ],
  },
  {
    id: "scooters-bikes",
    heading: "Scooters and bikes",
    needles: ["scooter", "motorcycle", "bike price"],
  },
  {
    id: "appliances",
    heading: "Appliances",
    needles: [
      "home appliance",
      "washing machine",
      "refrigerator",
      "fridge",
      "air conditioner",
      "microwave",
      "dishwasher",
      "water purifier",
    ],
  },
];

/** Specific product groups are tested before broader ones. */
const CLASSIFY_ORDER = ["appliances", "scooters-bikes", "phones", "cars"];

const GENERIC_TAGS = [
  "technology",
  "automotive",
  "phones",
  "phone",
  "smartphones",
  "smartphone",
  "cars",
  "car",
  "suv",
  "mpv",
  "hatchback",
  "sedan",
  "compact suv",
  "scooters",
  "scooter",
  "motorcycles",
  "motorcycle",
  "bikes",
  "bike",
  "electric scooter",
  "electric scooters",
  "electric motorcycle",
  "electric cars",
  "electric car",
  "hybrid cars",
  "cng cars",
  "home appliances",
  "appliances",
  "washing machines",
  "washing machine",
  "refrigerators",
  "refrigerator",
  "monitors",
  "monitor",
  "tablets",
  "tablet",
  "smartwatch",
  "smartwatches",
  "wearables",
  "earbuds",
  "nexa",
  "tv",
  "smart tv",
];

type GuideGroup = {
  categoryIndex: number;
  brandKey: string;
  brand: string;
  articles: PriceGuideSource[];
};

function isPublicSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-+[a-z0-9]+)*$/.test(slug);
}

function splitTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function isGenericTag(tag: string): boolean {
  const value = tag.toLowerCase();
  if (!value || value.indexOf("price") !== -1) return true;
  return GENERIC_TAGS.indexOf(value) !== -1;
}

function brandFromTags(tags: string[]): string | null {
  for (let index = 0; index < tags.length; index += 1) {
    if (!isGenericTag(tags[index])) return tags[index];
  }
  return null;
}

function textHasNeedle(text: string, needles: string[]): boolean {
  const lower = text.toLowerCase();
  for (let index = 0; index < needles.length; index += 1) {
    if (lower.indexOf(needles[index]) !== -1) return true;
  }
  return false;
}

function categoryIndexFor(tags: string[], title: string): number {
  const tagText = tags.join(" | ");
  for (let order = 0; order < CLASSIFY_ORDER.length; order += 1) {
    const category = CATEGORIES.find((item) => item.id === CLASSIFY_ORDER[order]);
    if (category && textHasNeedle(tagText, category.needles)) {
      return CATEGORIES.indexOf(category);
    }
  }
  for (let order = 0; order < CLASSIFY_ORDER.length; order += 1) {
    const category = CATEGORIES.find((item) => item.id === CLASSIFY_ORDER[order]);
    if (category && textHasNeedle(title, category.needles)) {
      return CATEGORIES.indexOf(category);
    }
  }
  return -1;
}

function linkTitle(title: string): string {
  return decodeEntities(title)
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\[/g, "(")
    .replace(/\]/g, ")");
}

function takeTitles(
  groupsByCategory: GuideGroup[][]
): { group: GuideGroup; article: PriceGuideSource }[] {
  const chosen: { group: GuideGroup; article: PriceGuideSource }[] = [];
  const cursor = groupsByCategory.map(() => 0);
  let added = true;
  while (added && chosen.length < TARGET_TITLES) {
    added = false;
    for (let index = 0; index < groupsByCategory.length; index += 1) {
      const brands = groupsByCategory[index];
      if (cursor[index] >= brands.length) continue;
      const group = brands[cursor[index]];
      cursor[index] += 1;
      for (const article of group.articles) {
        if (chosen.length >= TITLE_CEILING) break;
        chosen.push({ group, article });
      }
      added = true;
      if (chosen.length >= TARGET_TITLES) break;
    }
  }
  return chosen;
}

export function selectPriceGuides(articles: PriceGuideSource[]): PriceGuidePick[] {
  const newestFirst = articles.slice().sort((left, right) => {
    const delta = right.createdAt.getTime() - left.createdAt.getTime();
    if (delta !== 0) return delta;
    return left.slug.localeCompare(right.slug);
  });

  const groups = new Map<string, GuideGroup>();
  const seen = new Set<string>();

  for (const article of newestFirst) {
    const slug = canonicalArticleSlug(article.slug);
    if (!isPublicSlug(slug) || seen.has(slug)) continue;
    const title = article.title.replace(/\s+/g, " ").trim();
    if (!title) continue;
    const tags = splitTags(article.tags);
    const categoryIndex = categoryIndexFor(tags, title);
    if (categoryIndex < 0) continue;
    const category = CATEGORIES[categoryIndex];
    const brand = brandFromTags(tags) || category.heading;
    const brandKey = `${category.id}\n${brand.toLowerCase()}`;
    seen.add(slug);
    let group = groups.get(brandKey);
    if (!group) {
      group = { categoryIndex, brandKey, brand, articles: [] };
      groups.set(brandKey, group);
    }
    if (group.articles.length >= PER_BRAND) continue;
    group.articles.push({
      slug,
      title,
      tags: article.tags,
      createdAt: article.createdAt,
    });
  }

  const groupsByCategory: GuideGroup[][] = CATEGORIES.map(() => []);
  groups.forEach((group) => {
    groupsByCategory[group.categoryIndex].push(group);
  });
  for (const brands of groupsByCategory) {
    brands.sort((left, right) => {
      const delta =
        right.articles[0].createdAt.getTime() -
        left.articles[0].createdAt.getTime();
      if (delta !== 0) return delta;
      return left.brand.localeCompare(right.brand);
    });
  }

  const chosen = takeTitles(groupsByCategory);
  chosen.sort((left, right) => {
    if (left.group.categoryIndex !== right.group.categoryIndex) {
      return left.group.categoryIndex - right.group.categoryIndex;
    }
    const newest =
      right.group.articles[0].createdAt.getTime() -
      left.group.articles[0].createdAt.getTime();
    if (newest !== 0) return newest;
    const brand = left.group.brand.localeCompare(right.group.brand);
    if (brand !== 0) return brand;
    return right.article.createdAt.getTime() - left.article.createdAt.getTime();
  });

  return chosen.map((item) => ({
    categoryHeading: CATEGORIES[item.group.categoryIndex].heading,
    brand: item.group.brand,
    title: item.article.title,
    slug: item.article.slug,
    createdAt: item.article.createdAt,
  }));
}

export function renderPriceGuideSection(picks: PriceGuidePick[]): string {
  const lines: string[] = ["## Price guides"];
  let category = "";
  let brand = "";

  for (const pick of picks) {
    if (pick.categoryHeading !== category) {
      lines.push("", `### ${pick.categoryHeading}`, "");
      category = pick.categoryHeading;
      brand = "";
    }
    const showBrand =
      pick.brand.toLowerCase() !== pick.categoryHeading.toLowerCase();
    if (showBrand && pick.brand !== brand) {
      if (brand) lines.push("");
      lines.push(`#### ${pick.brand}`, "");
      brand = pick.brand;
    }
    const title = linkTitle(pick.title);
    if (!title) continue;
    lines.push(`- [${title}](${SITE_URL}/articles/${pick.slug})`);
  }

  return lines.join("\n");
}
