// Decide whether a story gets the partner rashifal widget, and which sign to show.
const EN_KEYWORDS =
  /\b(rashifal|rashi|horoscopes?|jyotish|kundli|kundali|astrology|astrological|zodiac|panchang|muhurat|muhurta|vrat|vrats|puja|pooja|aarti|chalisa|karwa[\s-]?chauth|diwali|deepavali|deepawali|chhath|dhanteras|ekadashi|navratri|bhai[\s-]?dooj|govardhan|tulsi[\s-]?vivah|dev[\s-]?uthani|dev[\s-]?diwali|kartik[\s-]?purnima|purnima|amavasya|sankranti|makar[\s-]?sankranti|holi|janmashtami|maha[\s-]?shivratri|shivratri|ganesh[\s-]?chaturthi|durga[\s-]?puja|raksha[\s-]?bandhan|rakhi|dussehra|vijayadashami|ram[\s-]?navami|hanuman[\s-]?jayanti|akshaya[\s-]?tritiya|teej|hartalika|pitru[\s-]?paksha|shradh|shraddha|sawan|shravan)\b/i;
const HI_KEYWORDS =
  /(राशिफल|राशि|ज्योतिष|कुंडली|कुण्डली|पंचांग|मुहूर्त|व्रत|पूजा|आरती|चालीसा|करवा\s?चौथ|दिवाली|दीपावली|छठ|धनतेरस|एकादशी|नवरात्रि|नवरात्र|भाई\s?दूज|गोवर्धन|तुलसी\s?विवाह|देव\s?दीपावली|देव\s?दिवाली|कार्तिक\s?पूर्णिमा|पूर्णिमा|अमावस्या|संक्रांति|होली|जन्माष्टमी|शिवरात्रि|गणेश\s?चतुर्थी|दुर्गा\s?पूजा|रक्षाबंधन|दशहरा|रामनवमी|हनुमान\s?जयंती|अक्षय\s?तृतीया|तीज|पितृ\s?पक्ष|श्राद्ध|सावन)/;

/** Story categories that are astrology / religion by definition. */
const RELIGION_CATEGORY = /^(astrology|religion|spirituality|spiritual|dharm|dharma|festivals?|धर्म|ज्योतिष|अध्यात्म)$/i;

/** Varanasi festival / ghat service guides (timings, darshan, how to visit). */
const VARANASI_PLACE = /\b(varanasi|kashi|banaras|benaras)\b|वाराणसी|काशी|बनारस/i;
const VARANASI_SPIRITUAL =
  /\b(ghats?|ganga[\s-]?aarti|aarti|temples?|mandir|darshan|vishwanath|snan|dev[\s-]?deepawali|dev[\s-]?diwali|kartik[\s-]?purnima|festival)\b|घाट|गंगा\s?आरती|आरती|मंदिर|दर्शन|विश्वनाथ|स्नान|देव\s?दीपावली/i;
const SERVICE_GUIDE =
  /\b(guide|timings?|time[\s-]?table|schedule|how[\s-]?to|visit|visiting|darshan|booking|book|tickets?|route|routes|parking|entry|tips|explained|what[\s-]?to[\s-]?know|checklist|dates?|muhurat|places?)\b|गाइड|समय|कैसे|दर्शन|बुकिंग|रूट|पार्किंग|प्रवेश/i;

/**
 * Hard news never gets partner placements, even when it mentions a ghat,
 * a festival or a puja. Exclusion always wins over inclusion.
 */
const HARD_NEWS_EN =
  /\b(crimes?|criminal|accidents?|crash(es|ed)?|collisions?|deaths?|dead|died|dies|dying|killed|kills?|killing|murder(s|ed)?|homicide|drown(s|ed|ing)?|bod(y|ies)[\s-]found|corpse|disasters?|flood(s|ed|ing)?|earthquakes?|cyclone|landslides?|stampedes?|collapse[sd]?|fires?|blaze|burn(t|ed)|explosions?|blasts?|police|cops?|arrest(s|ed)?|fir|custody|probe|raids?|rape[sd]?|assault(s|ed)?|molest(ed|ation)?|suicide|missing|injur(ed|ies|y)|victims?|tragedy|riots?|clash(es)?|violence|protests?|terror(ist|ism)?|shoot(ing|out)|stabb(ed|ing)|politics?|political|elections?|polls?|bjp|congress|samajwadi|aap|bsp|minister|mla|cm|chief[\s-]minister|court|verdict|bail|scam|fraud|recall(s|ed)?)\b/i;
const HARD_NEWS_HI =
  /(अपराध|हादसा|हादसे|दुर्घटना|मौत|मृत्यु|मृत|निधन|हत्या|डूब|डूबा|डूबी|डूबे|शव|लाश|आपदा|बाढ़|भूकंप|भगदड़|आग|विस्फोट|धमाका|पुलिस|गिरफ्तार|गिरफ्तारी|दुष्कर्म|बलात्कार|आत्महत्या|लापता|घायल|हिंसा|दंगा|बवाल|प्रदर्शन|राजनीति|राजनीतिक|चुनाव|भाजपा|कांग्रेस|सपा|बसपा|मंत्री|विधायक|मुख्यमंत्री|अदालत|कोर्ट|जमानत|घोटाला|ठगी)/;
const HARD_NEWS_CATEGORY = /^(crime|politics|political|police|accident|disaster|राजनीति|अपराध)$/i;

/** Festival stories that get the time-boxed Diwali Partner CTA (EndCard + Sidebar only). */
const DIWALI_FESTIVAL_EN =
  /\b(diwali|deepavali|dhanteras|lakshmi[\s-]?puja|lakshmi[\s-]?pooja)\b/i;
const DIWALI_FESTIVAL_HI = /(दिवाली|दीपावली|धनतेरस|लक्ष्मी\s?पूजा)/;

/**
 * Inclusive last Asia/Calcutta calendar day for the Diwali Partner CTA.
 * After this day, EndCard and Sidebar revert to the usual rashifal / milan links.
 * Maahir approved the extension through 11 Nov 2026 IST; revert on 12 Nov.
 */
export const DIWALI_PARTNER_CTA_UNTIL_IST = "2026-11-11";

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

// ---------------------------------------------------------------------------
// Shared Pocket Jyotish URL builder. Every partner link goes through this.
// ---------------------------------------------------------------------------

export const PARTNER_UTM_SOURCE = "dalimss_news";
export const PARTNER_CAMPAIGN_EVERGREEN = "partner_evergreen";
export const PARTNER_CAMPAIGN_DIWALI = "diwali_2026";
export const PARTNER_CAMPAIGN_TECH_AUTO = "tech_auto_test";

export type PartnerMedium = "widget" | "inline_card" | "sidebar" | "price_guide" | "endline";
export type PartnerVariant = "a" | "b";

export function partnerHref(opts: {
  path: string;
  medium: PartnerMedium;
  campaign: string;
  slug: string;
  variant?: PartnerVariant | null;
}): string {
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const q = new URLSearchParams({
    utm_source: PARTNER_UTM_SOURCE,
    utm_medium: opts.medium,
    utm_campaign: opts.campaign,
    utm_content: opts.slug,
  });
  if (opts.variant) q.set("utm_term", `variant_${opts.variant}`);
  return `https://pocketjyotish.in${path}?${q.toString()}`;
}

/** Diwali CTA link (EndCard / Sidebar) while the Diwali window is open. */
export function diwaliPartnerHref(
  slug: string,
  medium: PartnerMedium = "widget",
  variant?: PartnerVariant | null
): string {
  return partnerHref({ path: "/diwali-2026/", medium, campaign: PARTNER_CAMPAIGN_DIWALI, slug, variant });
}

// ---------------------------------------------------------------------------
// 7-day inline 'Free Kundli' card A/B test.
// ---------------------------------------------------------------------------

/**
 * Inclusive last Asia/Calcutta day of the inline card A/B test.
 * Started 9-10 Nov 2026; from 00:00 IST on 17 Nov no inline card shows.
 */
export const PARTNER_INLINE_TEST_UNTIL_IST = "2026-11-16";

export function isPartnerInlineTestActive(now: Date = new Date()): boolean {
  return istCalendarDate(now) <= PARTNER_INLINE_TEST_UNTIL_IST;
}

/** FNV-1a 32-bit hash of the UTF-8 slug. Deterministic, no randomness. */
export function slugHash(slug: string): number {
  let h = 0x811c9dc5;
  const bytes = new TextEncoder().encode(slug);
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** 50/50 split by slug hash: even = a (end card only), odd = b (adds inline card). */
export function partnerInlineVariant(slug: string): PartnerVariant {
  return slugHash(slug) % 2 === 0 ? "a" : "b";
}

// ---------------------------------------------------------------------------
// 7-day tech / auto end-line test.
// ---------------------------------------------------------------------------

/** Inclusive last Asia/Calcutta day; from 00:00 IST on 17 Nov the line is off. */
export const PARTNER_TECH_AUTO_TEST_UNTIL_IST = "2026-11-16";

/**
 * 20 technology and automotive stories, picked on 9 Nov 2026: the first 20
 * by slugHash among page-1 Technology and Automotive stories, after removing
 * stories that already carry a partner line (price guides), OTT / movie
 * explainers, a safety-recall story and one story whose title trips the
 * hard-news filter ("missing access").
 */
export const PARTNER_TECH_AUTO_TEST_SLUGS: readonly string[] = [
  "asus-chromebook-cx15-2-usb-c-45w",
  "mg-cyberster-3-2",
  "realme-16-5g-72-60",
  "alto-k10-smartplay-studio-10-paired-phones",
  "dzire-zxi-plus-sunroof-360-view-camera-checklist",
  "eeco-smp-private-100000-km-commercial-160000-km",
  "d-link-r03-warranty-3-days-arrival-failure",
  "mg-windsor-battery-warranty-8-years-160000-km-transfer",
  "wagonr-998-1197-cc-bioflex-variant-labels",
  "tapo-p116m-6a-matter-setup",
  "skoda-kodiaq-150-7",
  "brezza-3-seat-cooling-levels-64-light-colours",
  "claude-memory-settings-review-pause-reset-delete",
  "ai-hallucination-meaning-examples-source-checks",
  "amazfit-t-rex-3-battery-27-days-42-hours",
  "nissan-tekton-warranty-3-years-100000-km",
  "realme-16t-5g-69",
  "realme-narzo-90x-5g-60w-charging-protocols",
  "volkswagen-golf-gti-4289-136",
  "archer-c64-access-point-4-gigabit-lan-ports",
];

export function isPartnerTechAutoTestActive(now: Date = new Date()): boolean {
  return istCalendarDate(now) <= PARTNER_TECH_AUTO_TEST_UNTIL_IST;
}

/** Story is in the tech/auto test list and is not astrology-eligible or hard news. */
export function isTechAutoTestStory(a: StoryFields): boolean {
  if (!a.slug || !PARTNER_TECH_AUTO_TEST_SLUGS.includes(a.slug)) return false;
  if (isHardNewsStory(a) || isPartnerEligibleStory(a)) return false;
  return true;
}

/** Tech/auto end line: listed story and the test window is open. */
export function showTechAutoPartnerLine(a: StoryFields, now: Date = new Date()): boolean {
  return isPartnerTechAutoTestActive(now) && isTechAutoTestStory(a);
}

type StoryFields = {
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  tags?: string | null;
};

/** True for crime, accident, death, disaster, politics, police and similar hard news. */
export function isHardNewsStory(a: StoryFields): boolean {
  const cat = (a.category || "").trim();
  if (cat && HARD_NEWS_CATEGORY.test(cat)) return true;
  const hay = partnerHay(a);
  return HARD_NEWS_EN.test(hay) || HARD_NEWS_HI.test(hay);
}

/** True for a Varanasi festival, ghat, aarti or temple service guide. */
export function isVaranasiSpiritualGuide(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return VARANASI_PLACE.test(hay) && VARANASI_SPIRITUAL.test(hay) && SERVICE_GUIDE.test(hay);
}

/**
 * Partner widget eligibility: astrology, rashifal, festival, vrat and
 * puja-guide stories, plus Varanasi festival / ghat service guides.
 * Hard news is always excluded, and exclusion wins over inclusion.
 */
export function isPartnerEligibleStory(a: StoryFields): boolean {
  if (isHardNewsStory(a)) return false;
  const cat = (a.category || "").trim();
  if (cat && RELIGION_CATEGORY.test(cat)) return true;
  const hay = partnerHay(a);
  if (EN_KEYWORDS.test(hay) || HI_KEYWORDS.test(hay)) return true;
  return isVaranasiSpiritualGuide(a);
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
  const show = isPartnerEligibleStory(a);
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

type HNode = { type: string; tagName?: string; value?: string; children?: HNode[]; properties?: Record<string, unknown> };

function isBlankText(n: HNode): boolean {
  return n.type === "text" && !(n.value || "").trim();
}

/**
 * Rehype plugin: insert a <partner-inline-card> after the given top-level
 * paragraph (default 3). Run it AFTER rehypeAdSlots. The card never touches an
 * ad slot: the blocks directly before and after it must not be <ad-slot>, so
 * there is always at least one paragraph or block between the card and any ad.
 * If an ad follows paragraph N, the card moves after the next block. The card
 * is never the last block of the body. If no safe spot exists, no card.
 */
export function rehypePartnerInlineCard(options: { enabled: boolean; after?: number }) {
  const after = options.after ?? 3;
  return function plugin() {
    return function transformer(tree: { children?: HNode[] }) {
      if (!options.enabled || !Array.isArray(tree?.children)) return;
      const children = tree.children;
      const blocks: number[] = [];
      children.forEach((n, i) => {
        if (!isBlankText(n)) blocks.push(i);
      });
      const isAd = (b: number) => {
        const n = children[blocks[b]];
        return !!n && n.type === "element" && n.tagName === "ad-slot";
      };
      const isPartner = (b: number) => {
        const n = children[blocks[b]];
        return !!n && n.type === "element" && (n.tagName === "partner-slot" || n.tagName === "partner-inline-card");
      };
      let pCount = 0;
      let k = -1;
      for (let b = 0; b < blocks.length; b++) {
        const n = children[blocks[b]];
        if (n.type === "element" && n.tagName === "p") {
          pCount += 1;
          if (pCount === after) {
            k = b;
            break;
          }
        }
      }
      if (k < 0) return;
      // Card goes after block k. Prev = block k, next = block k + 1.
      while (k < blocks.length - 1 && (isAd(k) || isAd(k + 1) || isPartner(k) || isPartner(k + 1))) {
        k += 1;
      }
      if (k >= blocks.length - 1) return;
      children.splice(blocks[k] + 1, 0, {
        type: "element",
        tagName: "partner-inline-card",
        properties: {},
        children: [],
      });
    };
  };
}
