// lib/categories.ts
// Central category definitions for national news structure

export interface Category {
  slug: string;
  name: string;
  nameHi?: string; // Hindi name
  description: string;
  /** The value stored in the Article.category DB field that maps to this category */
  dbValues: string[];
  priority: number; // Sitemap priority
}

export const CATEGORIES: Category[] = [
  {
    slug: "india",
    name: "India",
    nameHi: "भारत",
    description:
      "Latest India news covering national headlines, government, courts, policy, and major incidents across the country.",
    dbValues: ["India", "National", "Politics", "india", "national", "politics"],
    priority: 0.9,
  },
  {
    slug: "uttar-pradesh",
    name: "Uttar Pradesh",
    nameHi: "उत्तर प्रदेश",
    description:
      "Uttar Pradesh news: state politics, infrastructure, law and order, education, weather and more from across UP.",
    dbValues: [
      "Uttar Pradesh",
      "UP",
      "uttar pradesh",
      "up",
      "Uttar pradesh",
    ],
    priority: 0.9,
  },
  {
    slug: "varanasi",
    name: "Varanasi",
    nameHi: "वाराणसी",
    description:
      "Varanasi news and updates: local leadership, city development, culture, heritage, and community stories from Banaras.",
    dbValues: [
      "Varanasi",
      "varanasi",
      "Banaras",
      "banaras",
      "Kashi",
      "General News",
    ],
    priority: 0.9,
  },
  {
    slug: "gurgaon",
    name: "Gurugram",
    nameHi: "गुरुग्राम",
    description:
      "Gurugram news: local updates, infrastructure, corporate hubs, real estate, traffic, and civic developments.",
    dbValues: [
      "Gurugram",
      "gurugram",
      "Gurugram News",
      "Gurgaon",
      "gurgaon",
      "Gurgaon News",
    ],
    priority: 0.9,
  },
  {
    slug: "business",
    name: "Business",
    nameHi: "व्यापार",
    description:
      "Business and economy news: Indian companies, startups, markets, local business trends, and economic updates.",
    dbValues: ["Business", "business", "Economy", "economy", "Finance", "finance"],
    priority: 0.8,
  },
  {
    slug: "technology",
    name: "Technology",
    nameHi: "टेक्नोलॉजी",
    description:
      "Technology news: gadgets, apps, AI, Indian tech developments, digital policy, and tech industry updates.",
    dbValues: [
      "Technology",
      "technology",
      "Tech",
      "tech",
      "AI",
      "Digital",
    ],
    priority: 0.8,
  },
  {
    slug: "automotive",
    name: "Automotive",
    nameHi: "ऑटोमोबाइल",
    description:
      "Automotive news from India: new car, bike and scooter launches, electric vehicles, commercial vehicles, prices, road tests and industry updates.",
    dbValues: ["Automotive", "automotive"],
    priority: 0.8,
  },
  {
    slug: "education",
    name: "Education",
    nameHi: "शिक्षा",
    description:
      "Education news: schools, colleges, entrance exams, admissions, educational policy, and student issues in India.",
    dbValues: ["Education", "education"],
    priority: 0.8,
  },
  {
    slug: "health",
    name: "Health",
    nameHi: "स्वास्थ्य",
    description:
      "Health news: public health updates, hospital news, medical advisories, and health awareness articles.",
    dbValues: ["Health", "health", "Medical", "medical"],
    priority: 0.8,
  },
  {
    slug: "sports",
    name: "Sports",
    nameHi: "खेल",
    description:
      "Sports news: cricket, football, Olympics, local sports, and athlete stories from India and around the world.",
    dbValues: ["Sports", "sports", "Cricket", "cricket"],
    priority: 0.8,
  },
  {
    slug: "reviews",
    name: "Reviews",
    nameHi: "समीक्षा",
    description:
      "In-depth reviews of wearables, gadgets, restaurants, travel destinations, services, and more — hands-on and original.",
    dbValues: ["Reviews", "reviews", "Review", "review"],
    priority: 0.7,
  },
  {
    slug: "explainers",
    name: "Explainers",
    nameHi: "विश्लेषण",
    description:
      "Simple backgrounders answering what happened, why it matters, and what comes next — on topics that matter to India.",
    dbValues: ["Explainers", "explainers", "Explainer", "explainer"],
    priority: 0.7,
  },
  {
    slug: "opinion",
    name: "Opinion",
    nameHi: "राय",
    description:
      "Opinion and analysis: clearly labeled opinion pieces separate from news reporting, with author bios and disclaimers.",
    dbValues: ["Opinion", "opinion", "Editorial", "editorial"],
    priority: 0.6,
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    nameHi: "मनोरंजन",
    description:
      "Entertainment news: Bollywood, TV, OTT, music, events, and celebrity stories from India.",
    dbValues: ["Entertainment", "entertainment", "Bollywood", "bollywood"],
    priority: 0.7,
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    nameHi: "लाइफस्टाइल",
    description:
      "Lifestyle from Gurugram and across India: restaurants and cafes, fitness and wellness, shopping, events and everyday city guides.",
    dbValues: ["Lifestyle", "lifestyle"],
    priority: 0.7,
  },
  {
    slug: "world",
    name: "World",
    nameHi: "विश्व",
    description:
      "World news: global stories with an India angle, from Dalimss News.",
    dbValues: ["World", "world"],
    priority: 0.7,
  },
];

/**
 * Find a category by its URL slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/**
 * Find a category by a database category value
 */
export function getCategoryByDbValue(dbValue: string): Category | undefined {
  return CATEGORIES.find((c) =>
    c.dbValues.some(
      (v) => v.toLowerCase() === dbValue.toLowerCase()
    )
  );
}

/**
 * Resolve comma-separated database values into distinct public categories.
 */
export function getCategoriesByDbValue(
  dbValue: string | null | undefined
): Category[] {
  if (!dbValue) return [];

  const seen = new Set<string>();

  return dbValue
    .split(",")
    .map((value) => getCategoryByDbValue(value.trim()))
    .filter((category): category is Category => {
      if (!category || seen.has(category.slug)) return false;
      seen.add(category.slug);
      return true;
    });
}

/**
 * Get the category slug for a given article's DB category value
 */
export function getCategorySlug(dbCategory: string | null | undefined): string {
  if (!dbCategory) return "varanasi"; // Default
  const cat = getCategoriesByDbValue(dbCategory)[0];
  return cat?.slug || "varanasi";
}

/**
 * Navigation items for the top nav bar
 */
export const NAV_CATEGORIES = [
  { slug: "india", name: "India" },
  { slug: "uttar-pradesh", name: "UP" },
  { slug: "varanasi", name: "Varanasi" },
  { slug: "gurgaon", name: "Gurugram" },
  { slug: "education", name: "Education" },
  { slug: "business", name: "Business" },
  { slug: "technology", name: "Tech" },
  { slug: "automotive", name: "Automotive" },
  { slug: "health", name: "Health" },
  { slug: "sports", name: "Sports" },
  { slug: "reviews", name: "Reviews" },
  { slug: "entertainment", name: "Entertainment" },
  { slug: "lifestyle", name: "Lifestyle" },
  { slug: "world", name: "World" },
];
