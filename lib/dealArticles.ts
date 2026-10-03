import { getCategoriesByDbValue } from "@/lib/categories";

const COMMERCE_SLUGS = new Set([
  "technology",
  "reviews",
  "business",
  "automotive",
]);

const RETAILERS =
  /\b(amazon|flipkart|croma|myntra|meesho|ajio|nykaa|tata neu|reliance digital|vijay sales|jiomart|snapdeal)\b/i;

const DEAL_TERMS =
  /\b(deal|deals|sale|discount|discounts|cashback|coupon|coupons|offer|offers|bbd|early[ -]bird|price cut)\b|big billion|great indian festival/i;

/**
 * Price and deal reports that should show the no-commercial-arrangement note.
 * A manual "deal" or "deals" tag always qualifies. "no-deal-disclosure" suppresses
 * the note unless a deal tag is also present. Otherwise the article must sit in a
 * commerce category and name both a retailer and a deal term.
 */
export function isDealArticle(a: {
  title: string;
  slug: string;
  tags?: string | null;
  category?: string | null;
}): boolean {
  const tags = (a.tags ?? "")
    .toLowerCase()
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (tags.includes("deal") || tags.includes("deals")) return true;
  if (tags.includes("no-deal-disclosure")) return false;

  const inCommerce = getCategoriesByDbValue(a.category).some((category) =>
    COMMERCE_SLUGS.has(category.slug)
  );
  if (!inCommerce) return false;

  const text = `${a.title} ${a.slug.replace(/-/g, " ")} ${a.tags ?? ""}`;
  return RETAILERS.test(text) && DEAL_TERMS.test(text);
}
