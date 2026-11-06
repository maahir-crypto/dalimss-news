// Decide whether a story gets the partner rashifal widget, and which sign to show.
const EN_KEYWORDS =
  /\b(rashifal|rashi|horoscopes?|jyotish|kundli|kundali|astrology|astrological|zodiac|vrat|puja|pooja|karwa[\s-]?chauth|diwali|deepavali|chhath|dhanteras|ekadashi|navratri|bhai[\s-]?dooj|govardhan|tulsi[\s-]?vivah|dev[\s-]?uthani)\b/i;
const HI_KEYWORDS =
  /(राशिफल|राशि|ज्योतिष|कुंडली|कुण्डली|व्रत|पूजा|करवा\s?चौथ|दिवाली|दीपावली|छठ|धनतेरस|एकादशी|नवरात्रि|नवरात्र|भाई\s?दूज|गोवर्धन|तुलसी\s?विवाह)/;

/** Festival stories that get the time-boxed Diwali Partner CTA (EndCard + Sidebar only). */
const DIWALI_FESTIVAL_EN =
  /\b(diwali|deepavali|dhanteras|lakshmi[\s-]?puja|lakshmi[\s-]?pooja)\b/i;
const DIWALI_FESTIVAL_HI = /(दिवाली|दीपावली|धनतेरस|लक्ष्मी\s?पूजा)/;

/**
 * Inclusive last Asia/Calcutta calendar day for the Diwali Partner CTA.
 * After this day, EndCard and Sidebar revert to the usual rashifal / milan links.
 * Pocket Jyotish asked to revert after 9 Nov; end of 8 Nov IST matches that.
 */
export const DIWALI_PARTNER_CTA_UNTIL_IST = "2026-11-08";

// TODO(dev-deepawali-2026): Around 24 Nov 2026, add a similar date window that
// swaps EndCard/Sidebar to
// https://pocketjyotish.in/dev-deepawali-2026/?utm_source=dalimss_news&utm_medium=widget&utm_campaign=devdeepawali2026&utm_content=<slug>
// Match keywords such as /dev[\s-]?deepawali|dev[\s-]?diwali/i (and Hindi). Keep that
// campaign OFF until its window; do not enable it in the Diwali window.

const SIGNS: { slug: string; re: RegExp }[] = [
  { slug: "mesh", re: /\b(mesh|aries)\b|मेष/i },
  { slug: "vrishabh", re: /\b(vrishabh|vrushabh|taurus)\b|वृषभ/i },
  { slug: "mithun", re: /\b(mithun|gemini)\b|मिथुन/i },
  { slug: "kark", re: /\b(kark|karka)\b|कर्क/i },
  { slug: "singh", re: /\b(singh[\s-]rashi|simha|leo[\s-](horoscope|rashifal))\b|सिंह\s?राशि/i },
  { slug: "kanya", re: /\b(kanya|virgo)\b|कन्या\s?राशि/i },
  { slug: "tula", re: /\b(tula|libra)\b|तुला/i },
  { slug: "vrishchik", re: /\b(vrishchik|vrischik|scorpio)\b|वृश्चिक/i },
  { slug: "dhanu", re: /\b(dhanu|sagittarius)\b|धनु\s?राशि/i },
  { slug: "makar", re: /\b(makar[\s-]rashi|capricorn)\b|मकर\s?राशि/i },
  { slug: "kumbh", re: /\b(kumbh[\s-]rashi|aquarius)\b|कुंभ\s?राशि/i },
  { slug: "meen", re: /\b(meen|pisces)\b|मीन/i },
];

export type PartnerInfo = { show: boolean; sign: string; lang: "hi" | "en" };

function partnerHay(a: {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  tags?: string | null;
}): string {
  const slugText = (a.slug || "").replace(/-/g, " ");
  return [a.title, slugText, a.category, a.tags].filter(Boolean).join(" ");
}

/** Asia/Calcutta calendar date as YYYY-MM-DD. */
export function istCalendarDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Calcutta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** True through end of DIWALI_PARTNER_CTA_UNTIL_IST in Asia/Calcutta. */
export function isDiwaliPartnerCtaActive(now: Date = new Date()): boolean {
  return istCalendarDate(now) <= DIWALI_PARTNER_CTA_UNTIL_IST;
}

/** True when the story is a Diwali / Dhanteras / Lakshmi Puja festival piece. */
export function isDiwaliFestivalStory(a: {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  tags?: string | null;
}): boolean {
  const hay = partnerHay(a);
  return DIWALI_FESTIVAL_EN.test(hay) || DIWALI_FESTIVAL_HI.test(hay);
}

/**
 * EndCard + Sidebar should use the Diwali 2026 Partner CTA when the campaign
 * window is open and the story is a festival match. Iframe stays on rashifal.
 */
export function useDiwaliPartnerCta(
  a: {
    title?: string | null;
    slug?: string | null;
    category?: string | null;
    tags?: string | null;
  },
  now: Date = new Date()
): boolean {
  return isDiwaliPartnerCtaActive(now) && isDiwaliFestivalStory(a);
}

export function diwaliPartnerHref(slug: string): string {
  const q = new URLSearchParams({
    utm_source: "dalimss_news",
    utm_medium: "widget",
    utm_campaign: "diwali2026",
    utm_content: slug,
  });
  return `https://pocketjyotish.in/diwali-2026/?${q.toString()}`;
}

export function partnerRashifalFor(a: {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  tags?: string | null;
  language?: string | null;
}): PartnerInfo {
  const lang = a.language === "hi" ? "hi" : "en";
  const slugText = (a.slug || "").replace(/-/g, " ");
  const hay = partnerHay(a);
  const show = EN_KEYWORDS.test(hay) || HI_KEYWORDS.test(hay);
  let sign = "mesh";
  if (show) {
    const signHay = `${a.title || ""} ${slugText}`;
    const hit = SIGNS.find((s) => s.re.test(signHay));
    if (hit) sign = hit.slug;
  }
  return { show, sign, lang };
}

/** Rehype plugin: insert a <partner-slot> after the given top-level paragraph. */
export function rehypePartnerSlot(options: { enabled: boolean; after: number }) {
  return function plugin() {
    return function transformer(tree: any) {
      if (!options.enabled || !Array.isArray(tree?.children)) return;
      const idx: number[] = [];
      tree.children.forEach((n: any, i: number) => {
        if (n.type === "element" && n.tagName === "p") idx.push(i);
      });
      if (idx.length < options.after + 1) return;
      tree.children.splice(idx[options.after - 1] + 1, 0, {
        type: "element",
        tagName: "partner-slot",
        properties: {},
        children: [],
      });
    };
  };
}
