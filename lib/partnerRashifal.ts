// Decide whether a story gets the partner rashifal widget, and which sign to show.
const EN_KEYWORDS =
  /\b(rashifal|rashi|horoscopes?|jyotish|kundli|kundali|astrology|astrological|zodiac|vrat|puja|pooja|karwa[\s-]?chauth|diwali|deepavali|chhath|dhanteras|ekadashi|navratri|bhai[\s-]?dooj|govardhan|tulsi[\s-]?vivah|dev[\s-]?uthani)\b/i;
const HI_KEYWORDS =
  /(राशिफल|राशि|ज्योतिष|कुंडली|कुण्डली|व्रत|पूजा|करवा\s?चौथ|दिवाली|दीपावली|छठ|धनतेरस|एकादशी|नवरात्रि|नवरात्र|भाई\s?दूज|गोवर्धन|तुलसी\s?विवाह)/;

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

export function partnerRashifalFor(a: {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  tags?: string | null;
  language?: string | null;
}): PartnerInfo {
  const lang = a.language === "hi" ? "hi" : "en";
  const slugText = (a.slug || "").replace(/-/g, " ");
  const hay = [a.title, slugText, a.category, a.tags].filter(Boolean).join(" ");
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
