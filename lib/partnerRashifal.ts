import { getCategoriesByDbValue, pickBreadcrumbCategory } from "@/lib/categories";

// Decide whether a story gets the partner rashifal widget, and which sign to show.
const EN_KEYWORDS =
  /\b(rashifal|rashi|horoscopes?|jyotish|kundli|kundali|astrology|astrological|zodiac|panchang|muhurat|muhurta|vrat|vrats|puja|pooja|aarti|chalisa|karwa[\s-]?chauth|diwali|deepavali|deepawali|chhath|dhanteras|ekadashi|navratri|bhai[\s-]?dooj|govardhan|tulsi[\s-]?vivah|dev[\s-]?uthani|dev[\s-]?diwali|kartik[\s-]?purnima|purnima|amavasya|sankranti|makar[\s-]?sankranti|lohri|pongal|holi|janmashtami|maha[\s-]?shivratri|shivratri|ganesh[\s-]?chaturthi|durga[\s-]?puja|raksha[\s-]?bandhan|rakhi|dussehra|vijayadashami|ram[\s-]?navami|hanuman[\s-]?jayanti|akshaya[\s-]?tritiya|teej|hartalika|pitru[\s-]?paksha|shradh|shraddha|sawan|shravan|jagaddhatri|jagadhatri|karthigai|kartigai|tiruvannamalai[\s-]deepam|somvar[\s-]vrat|somwar[\s-]vrat|monday[\s-]fast|guruvar[\s-]vrat|brihaspativar[\s-]vrat|thursday[\s-]fast|vivah[\s-]panchami|ram[\s-]sita[\s-]vivah|sita[\s-]vivah|janakpur|mokshada|(?:gita|geeta)[\s-]jayanti|gita[\s-]discourses?|kurukshetra[\s-]gita)\b/i;
const HI_KEYWORDS =
  /(राशिफल|राशि|ज्योतिष|कुंडली|कुण्डली|पंचांग|मुहूर्त|व्रत|पूजा|आरती|चालीसा|करवा\s?चौथ|दिवाली|दीपावली|छठ|धनतेरस|एकादशी|नवरात्रि|नवरात्र|भाई\s?दूज|गोवर्धन|तुलसी\s?विवाह|देव\s?दीपावली|देव\s?दिवाली|कार्तिक\s?पूर्णिमा|पूर्णिमा|अमावस्या|संक्रांति|लोहड़ी|होली|जन्माष्टमी|शिवरात्रि|गणेश\s?चतुर्थी|दुर्गा\s?पूजा|रक्षाबंधन|दशहरा|रामनवमी|हनुमान\s?जयंती|अक्षय\s?तृतीया|तीज|पितृ\s?पक्ष|श्राद्ध|सावन|जगद्धात्री|कार्तिगई|विवाह\s?पंचमी|राम\s?सीता\s?विवाह|सीता\s?विवाह|(?<![\u0900-\u097F])जनकपुर(?![\u0900-\u097F])|मोक्षदा|गीता\s?जयंती)/;

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
  /\b(crimes?|criminal|accidents?|crash(es|ed)?|collisions?|deaths?|dead|died|dies|dying|killed|kills?|killing|murder(s|ed)?|homicide|drown(s|ed|ing)?|bod(y|ies)[\s-]found|corpse|disasters?|flood(s|ed|ing)?|earthquakes?|cyclone|landslides?|stampedes?|collapse[sd]?|fires?|blaze|burn(t|ed)|explosions?|blasts?|police|cops?|arrest(s|ed)?|fir|custody|probe|raids?|rape[sd]?|assault(s|ed)?|molest(ed|ation)?|suicide|missing|injur(ed|ies|y)|victims?|tragedy|riots?|clash(es)?|violence|protests?|terror(ist|ism)?|shoot(ing|out)|stabb(ed|ing)|politics?|political|elections?|polls?|bjp|congress|samajwadi|aap|bsp|minister|mla|cm|chief[\s-]minister|court|verdict|bail|scam|fraud|recall(s|ed)?|thefts?|thie(f|ves)|stolen|steal(s|ing)?|robber(y|ies|s)?|robbed|loot(s|ed|ing)?|burglar(y|ies|s)?|snatch(es|ed|ing|ers?)?|accused|kidnap(s|ped|ping)?|abduct(ed|ion|s)?|extortion|smuggl(ing|ed|ers?)|dacoity|absconding)\b/i;
const HARD_NEWS_HI =
  /(अपराध|हादसा|हादसे|दुर्घटना|मौत|मृत्यु|निधन|हत्या|डूब|डूबा|डूबी|डूबे|शव|लाश|आपदा|बाढ़|भूकंप|भगदड़|विस्फोट|धमाका|पुलिस|गिरफ्तार|गिरफ्तारी|दुष्कर्म|बलात्कार|आत्महत्या|लापता|घायल|हिंसा|दंगा|बवाल|प्रदर्शन|राजनीति|राजनीतिक|चुनाव|भाजपा|कांग्रेस|सपा|बसपा|मंत्री|विधायक|मुख्यमंत्री|अदालत|कोर्ट|जमानत|घोटाला|ठगी|चोरी|चोर|लूट|डकैती|छिनैती|अपहरण|तस्कर|आरोपी|फरार|रंगदारी)/;
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

// Do not keyword-match a swap of the end unit to /dev-deepawali-2026/.
// The approved end-unit placement is the links-only Vaikuntha Chaturdashi CTA
// on one exact slug, through 24 Nov IST. Varanasi section stories use a
// separate links-only Partner line (showDevDeepawaliVaranasiPartner).

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

export type PartnerMedium = "widget" | "inline_card" | "sidebar" | "price_guide" | "endline" | "inline" | "ad" | "partner";
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
// Time-boxed festival guide CTAs (one named Dalimss News festival guide each).
// ---------------------------------------------------------------------------

/**
 * Inclusive last Asia/Calcutta day for each festival guide CTA. From 00:00 IST
 * on the next day the story falls back to the evergreen rashifal links.
 * Maahir approved Govardhan Puja through 10 Nov and Bhai Dooj through 11 Nov 2026.
 */
export const GOVARDHAN_PARTNER_CTA_UNTIL_IST = "2026-11-10";
export const BHAI_DOOJ_PARTNER_CTA_UNTIL_IST = "2026-11-11";
/** Guru Nanak Jayanti (links-only CTA), approved by Maahir 10 Nov 2026; off 00:00 IST 25 Nov. */
export const GURU_NANAK_PARTNER_CTA_UNTIL_IST = "2026-11-24";
/**
 * Vaikuntha Chaturdashi guide on the Dev Deepawali story (links-only).
 * Approved by Maahir 11 Nov 2026; off 00:00 IST 25 Nov.
 */
export const VAIKUNTHA_PARTNER_CTA_UNTIL_IST = "2026-11-24";
/** Dormant: no Dalimss News guide exists yet, so its slug list is empty. */
export const AKSHAYA_NAVAMI_PARTNER_CTA_UNTIL_IST = "2026-11-18";

export const PARTNER_CAMPAIGN_GOVARDHAN = "govardhan_2026";
export const PARTNER_CAMPAIGN_BHAI_DOOJ = "bhai_dooj_2026";
export const PARTNER_CAMPAIGN_AKSHAYA_NAVAMI = "akshaya_navami_2026";
export const PARTNER_CAMPAIGN_GURU_NANAK = "guru_nanak_2026";
export const PARTNER_CAMPAIGN_VAIKUNTHA = "vaikuntha_2026";

export type FestivalPartnerId =
  | "govardhan_2026"
  | "bhai_dooj_2026"
  | "akshaya_navami_2026"
  | "guru_nanak_2026"
  | "vaikuntha_2026";

export type FestivalPartnerCta = {
  id: FestivalPartnerId;
  /** Pocket Jyotish path. Linked only, never embedded. */
  path: string;
  campaign: string;
  untilIst: string;
  /** Exact festival-guide slugs. Exact match only, no keyword matching. */
  slugs: readonly string[];
  /**
   * Links-only CTA for an exact slug: end card, sidebar link and labeled line
   * only. No rashifal iframe, no inline Free Kundli card, no sidebar Free
   * Kundli link, no A/B test enrolment (so no utm_term), even when the story
   * would otherwise be partner-eligible. General eligibility rules are
   * unchanged. After the IST window the usual placements return.
   */
  linksOnly?: boolean;
  text: {
    en: { endCard: string; sidebarTitle: string; sidebarBody: string; sidebarLink: string; line: string };
    hi: { endCard: string; sidebarTitle: string; sidebarBody: string; sidebarLink: string; line: string };
  };
};

export const FESTIVAL_PARTNER_CTAS: readonly FestivalPartnerCta[] = [
  {
    id: "govardhan_2026",
    path: "/govardhan-puja-2026/",
    campaign: PARTNER_CAMPAIGN_GOVARDHAN,
    untilIst: GOVARDHAN_PARTNER_CTA_UNTIL_IST,
    slugs: ["govardhan-puja-10-november-2026-varanasi-gurugram"],
    text: {
      en: {
        endCard: "Govardhan Puja 2026 muhurat guide",
        sidebarTitle: "Govardhan Puja muhurat",
        sidebarBody: "See Govardhan Puja and Annakut timings on our partner site.",
        sidebarLink: "See Govardhan Puja guide",
        line: "Govardhan Puja 2026 guide",
      },
      hi: {
        endCard: "गोवर्धन पूजा 2026 मुहूर्त गाइड",
        sidebarTitle: "गोवर्धन पूजा मुहूर्त",
        sidebarBody: "गोवर्धन पूजा और अन्नकूट का मुहूर्त हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "गोवर्धन पूजा गाइड देखें",
        line: "गोवर्धन पूजा 2026 गाइड",
      },
    },
  },
  {
    id: "bhai_dooj_2026",
    path: "/bhai-dooj-2026/",
    campaign: PARTNER_CAMPAIGN_BHAI_DOOJ,
    untilIst: BHAI_DOOJ_PARTNER_CTA_UNTIL_IST,
    slugs: ["bhai-dooj-11-november-2026-varanasi-gurugram"],
    text: {
      en: {
        endCard: "Bhai Dooj 2026 tilak muhurat guide",
        sidebarTitle: "Bhai Dooj muhurat",
        sidebarBody: "See Bhai Dooj tilak timings on our partner site.",
        sidebarLink: "See Bhai Dooj guide",
        line: "Bhai Dooj 2026 guide",
      },
      hi: {
        endCard: "भाई दूज 2026 तिलक मुहूर्त गाइड",
        sidebarTitle: "भाई दूज मुहूर्त",
        sidebarBody: "भाई दूज के तिलक का समय हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "भाई दूज गाइड देखें",
        line: "भाई दूज 2026 गाइड",
      },
    },
  },
  {
    id: "guru_nanak_2026",
    path: "/guru-nanak-jayanti-2026/",
    campaign: PARTNER_CAMPAIGN_GURU_NANAK,
    untilIst: GURU_NANAK_PARTNER_CTA_UNTIL_IST,
    slugs: ["guru-nanak-jayanti-24-november-2026-date-holiday-guide"],
    linksOnly: true,
    text: {
      en: {
        endCard: "Guru Nanak Jayanti 2026 guide",
        sidebarTitle: "Guru Nanak Jayanti 2026",
        sidebarBody: "See the Guru Nanak Jayanti 2026 guide on our partner site.",
        sidebarLink: "See Guru Nanak Jayanti guide",
        line: "Guru Nanak Jayanti 2026 guide",
      },
      hi: {
        endCard: "गुरु नानक जयंती 2026 गाइड",
        sidebarTitle: "गुरु नानक जयंती 2026",
        sidebarBody: "गुरु नानक जयंती 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "गुरु नानक जयंती गाइड देखें",
        line: "गुरु नानक जयंती 2026 गाइड",
      },
    },
  },
  {
    // Dev Deepawali / Kartik Purnima story. The linked guide is Vaikuntha
    // Chaturdashi, a different observance, so the label names that guide only.
    id: "vaikuntha_2026",
    path: "/vaikuntha-chaturdashi-2026/",
    campaign: PARTNER_CAMPAIGN_VAIKUNTHA,
    untilIst: VAIKUNTHA_PARTNER_CTA_UNTIL_IST,
    slugs: ["dev-deepawali-24-november-2026-varanasi-timings"],
    linksOnly: true,
    text: {
      en: {
        endCard: "Vaikuntha Chaturdashi 2026 guide",
        sidebarTitle: "Vaikuntha Chaturdashi 2026",
        sidebarBody: "See the Vaikuntha Chaturdashi 2026 guide on our partner site.",
        sidebarLink: "See Vaikuntha Chaturdashi guide",
        line: "Vaikuntha Chaturdashi 2026 guide",
      },
      hi: {
        endCard: "वैकुंठ चतुर्दशी 2026 गाइड",
        sidebarTitle: "वैकुंठ चतुर्दशी 2026",
        sidebarBody: "वैकुंठ चतुर्दशी 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "वैकुंठ चतुर्दशी गाइड देखें",
        line: "वैकुंठ चतुर्दशी 2026 गाइड",
      },
    },
  },
  {
    // Dormant until a matching Dalimss News Akshaya Navami / Gopashtami guide
    // exists and Maahir approves it. Empty slug list = shows on no story.
    id: "akshaya_navami_2026",
    path: "/akshaya-navami-2026/",
    campaign: PARTNER_CAMPAIGN_AKSHAYA_NAVAMI,
    untilIst: AKSHAYA_NAVAMI_PARTNER_CTA_UNTIL_IST,
    slugs: [],
    text: {
      en: {
        endCard: "Akshaya Navami 2026 muhurat guide",
        sidebarTitle: "Akshaya Navami muhurat",
        sidebarBody: "See Gopashtami and Akshaya Navami timings on our partner site.",
        sidebarLink: "See Akshaya Navami guide",
        line: "Akshaya Navami 2026 guide",
      },
      hi: {
        endCard: "अक्षय नवमी 2026 मुहूर्त गाइड",
        sidebarTitle: "अक्षय नवमी मुहूर्त",
        sidebarBody: "गोपाष्टमी और अक्षय नवमी का मुहूर्त हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "अक्षय नवमी गाइड देखें",
        line: "अक्षय नवमी 2026 गाइड",
      },
    },
  },
];

export function getFestivalPartnerCta(id: string | null | undefined): FestivalPartnerCta | null {
  if (!id) return null;
  return FESTIVAL_PARTNER_CTAS.find((c) => c.id === id) ?? null;
}

/**
 * The festival CTA for this story right now, or null. Exact slug match only.
 * Hard news is always excluded. A normal CTA also requires partner eligibility;
 * a links-only CTA does not. The campaign must be inside its IST window.
 */
export function festivalPartnerCtaFor(a: StoryFields, now: Date = new Date()): FestivalPartnerCta | null {
  if (!a.slug) return null;
  if (isHardNewsStory(a)) return null;
  const eligible = isPartnerEligibleStory(a);
  const today = istCalendarDate(now);
  return (
    FESTIVAL_PARTNER_CTAS.find(
      (c) => c.slugs.includes(a.slug as string) && today <= c.untilIst && (eligible || c.linksOnly === true)
    ) ?? null
  );
}

/** Seconds until 00:00 IST after the campaign's last day (min 1), for ISR revalidate. */
export function secondsUntilFestivalCtaExpiry(cta: { untilIst: string }, now: Date = new Date()): number {
  const [y, m, d] = cta.untilIst.split("-").map(Number);
  // 00:00 IST on the next day = 18:30 UTC on the last day.
  const end = Date.UTC(y, m - 1, d, 18, 30, 0, 0);
  return Math.max(1, Math.ceil((end - now.getTime()) / 1000));
}

/**
 * ISR window for an article that may be showing a festival or vrat CTA.
 * Hourly by default. Inside the last hour, regenerate at 00:00 IST so a page
 * is not served from cache after the campaign's last day.
 */
export function partnerPageRevalidateSeconds(
  ctas: Array<{ untilIst: string } | null | undefined>,
  now: Date = new Date()
): number {
  let best = 3600;
  for (const cta of ctas) {
    if (!cta) continue;
    best = Math.min(best, secondsUntilFestivalCtaExpiry(cta, now));
  }
  return best;
}

export function festivalPartnerHref(
  cta: FestivalPartnerCta,
  slug: string,
  medium: PartnerMedium,
  variant?: PartnerVariant | null
): string {
  return partnerHref({ path: cta.path, medium, campaign: cta.campaign, slug, variant });
}

// ---------------------------------------------------------------------------
// Upcoming vrat / puja guides for astrology, festival, vrat and puja stories.
// One live guide at a time. Chhath and Vrishchika (the predicate guides that
// sit ahead of the general rotation) keep first place while their IST window
// is open. Later story-predicate guides then beat the general rotation when
// the story matches. Otherwise the soonest open general guide is used.
// Predicate guides stay in untilIst order, so the earlier last day wins when
// two match: Vivah Panchami before Kharmas, Mokshada Ekadashi before Saphala,
// Kharmas before Griha Pravesh. Guru Nanak Jayanti, Akshaya Navami and Griha
// Pravesh match only their own phrases. Kaal Bhairav does too, and alsoGeneral
// keeps it in the general queue. A bare Bhairav is not a Kaal Bhairav match.
// Bhishma Panchak, Dev Uthani Ekadashi, Margashirsha month and the December
// 2026 vrat and tyohar list are story fallbacks. They are not general-queue
// guides. A matching story takes one only when no named predicate guide
// matches. Dev Uthani Ekadashi is listed before Bhishma Panchak, so Dev Uthani
// and Prabodhini stories take it through 21 Nov IST. From 00:00 IST 22 Nov
// those terms use Bhishma until 00:00 IST 25 Nov. Bhishma Panchak and Kartik
// snan stay on the Bhishma guide. The December list is on from 00:00 IST
// 25 Nov through 31 Dec and off at 00:00 IST 1 Jan 2027. Tulsi, Dev Deepawali,
// Pradosh, Vaikuntha, Sankashti, Utpanna, Margashirsha Purnima and the other
// named guides keep their own CTAs.
// After 00:00 IST the day after a guide's last day, the next guide takes over.
// When none remain, callers fall back to the evergreen kundli / rashifal links.
// Exact-slug festival CTAs and the Diwali CTA win over this rotation.
// Linked only. The free chart URL is /kundli/. Do not swap in a retired alias.
// ---------------------------------------------------------------------------

/** Inclusive last Asia/Calcutta day. Off at 00:00 IST the next day. */
export const CHHATH_UNTIL_IST = "2026-11-16";
export const VRISHCHIKA_SANKRANTI_UNTIL_IST = "2026-11-16";
export const KAAL_BHAIRAV_UNTIL_IST = "2026-12-01";
export const UTPANNA_EKADASHI_UNTIL_IST = "2026-12-04";
/** Inclusive first IST day. Utpanna covers Ekadashi through 4 Dec. */
export const SAPHALA_EKADASHI_FROM_IST = "2026-12-05";
export const SAPHALA_EKADASHI_UNTIL_IST = "2027-01-03";
export const KHARMAS_UNTIL_IST = "2027-01-14";
export const LOHRI_SANKRANTI_UNTIL_IST = "2027-01-15";
export const RASHIFAL_2027_UNTIL_IST = "2027-01-31";
export const GRIHA_PRAVESH_UNTIL_IST = "2027-12-31";
export const TULSI_VIVAH_UNTIL_IST = "2026-11-21";
/** Inclusive last IST day. Off at 00:00 IST 22 Nov. Not a general-queue guide. */
export const DEV_UTHANI_EKADASHI_UNTIL_IST = "2026-11-21";
export const PRADOSH_VRAT_UNTIL_IST = "2026-11-22";
/** Rotation window. The exact-slug links-only CTA stays on its own later date. */
export const VAIKUNTHA_VRAT_UNTIL_IST = "2026-11-23";
export const DEV_DEEPAWALI_UNTIL_IST = "2026-11-24";
export const SANKASHTI_UNTIL_IST = "2026-11-27";
export const MARGASHIRSHA_PURNIMA_UNTIL_IST = "2026-12-24";
export const JAGADDHATRI_UNTIL_IST = "2026-11-18";
export const SOMVAR_VRAT_NOV_UNTIL_IST = "2026-11-23";
export const KARTHIGAI_DEEPAM_UNTIL_IST = "2026-11-24";
export const GURUVAR_VRAT_NOV_UNTIL_IST = "2026-11-26";
/** Inclusive first IST day. Other vivah stories stay on Kharmas outside this window. */
export const VIVAH_PANCHAMI_FROM_IST = "2026-12-01";
export const VIVAH_PANCHAMI_UNTIL_IST = "2026-12-14";
/** Inclusive first IST day. Other Ekadashi stories stay on Saphala outside this window. */
export const MOKSHADA_EKADASHI_FROM_IST = "2026-12-10";
export const MOKSHADA_EKADASHI_UNTIL_IST = "2026-12-20";
/**
 * Inclusive IST days when Dev Deepawali replaces Pradosh on Varanasi and
 * festival stories. Off at 00:00 IST on 25 Nov. Tulsi and Vaikuntha are unchanged.
 */
export const DEV_DEEPAWALI_PRIORITY_FROM_IST = "2026-11-17";
export const DEV_DEEPAWALI_PRIORITY_UNTIL_IST = "2026-11-24";
/** Inclusive IST days. Off at 00:00 IST on 25 Nov. Not a general-queue guide. */
export const BHISHMA_PANCHAK_FROM_IST = "2026-11-20";
export const BHISHMA_PANCHAK_UNTIL_IST = "2026-11-24";
/** Inclusive IST days. Off at 00:00 IST on 25 Dec. Not a general-queue guide. */
export const MARGASHIRSHA_MONTH_FROM_IST = "2026-11-25";
export const MARGASHIRSHA_MONTH_UNTIL_IST = "2026-12-24";
/** Inclusive IST days. Off at 00:00 IST on 1 Jan 2027. Not a general-queue guide. */
export const DECEMBER_VRAT_FROM_IST = "2026-11-25";
export const DECEMBER_VRAT_UNTIL_IST = "2026-12-31";

export const PARTNER_CAMPAIGN_TULSI_VIVAH = "tulsi_vivah_2026";
export const PARTNER_CAMPAIGN_PRADOSH = "pradosh_2026";
export const PARTNER_CAMPAIGN_SANKASHTI = "sankashti_2026";
export const PARTNER_CAMPAIGN_MGPURNIMA = "mgpurnima_2026";
export const PARTNER_CAMPAIGN_DEV_DEEPAWALI = "dev_deepawali_2026";
/** House-ad evergreen unit. Older rashifal and kundli links stay on partner_evergreen. */
export const PARTNER_CAMPAIGN_SPONSORED_EVERGREEN = "evergreen";

export type UpcomingVratId =
  | "chhath_2026"
  | "vrishchika_sankranti_2026"
  | "jagaddhatri_2026"
  | "akshaya_navami_2026"
  | "kaal_bhairav_2026"
  | "utpanna_ekadashi_2026"
  | "tulsi_vivah_2026"
  | "pradosh_2026"
  | "somvar_vrat_nov_2026"
  | "vaikuntha_2026"
  | "karthigai_deepam_2026"
  | "dev_deepawali_2026"
  | "guru_nanak_jayanti_2026"
  | "dev_uthani_ekadashi_2026"
  | "bhishma_panchak_2026"
  | "guruvar_vrat_nov_2026"
  | "sankashti_2026"
  | "mgpurnima_2026"
  | "vivah_panchami_2026"
  | "mokshada_ekadashi_2026"
  | "margashirsha_month_2026"
  | "december_vrat_2026"
  | "saphala_ekadashi_2027"
  | "kharmas_2026"
  | "lohri_sankranti_2027"
  | "rashifal_2027"
  | "griha_pravesh_2027";

export type UpcomingVratCta = {
  id: UpcomingVratId;
  path: string;
  campaign: string;
  untilIst: string;
  /** Inclusive first Asia/Calcutta day. Absent means the guide is already active. */
  fromIst?: string;
  appliesTo?: (a: StoryFields) => boolean;
  /**
   * Also a general-queue guide. A matching story still takes it ahead of the
   * queue. Every other eligible story gets it when it is the soonest open
   * general guide.
   */
  alsoGeneral?: boolean;
  /**
   * Story fallback, not a general-queue guide. Checked after every named
   * predicate guide and before the general queue.
   */
  fallback?: boolean;
  text: {
    en: { endCard: string; sidebarTitle: string; sidebarBody: string; sidebarLink: string };
    hi: { endCard: string; sidebarTitle: string; sidebarBody: string; sidebarLink: string };
  };
};

/** Sorted by last IST day, earliest first, so the first open window is the next guide. */
export const UPCOMING_VRAT_CTAS: readonly UpcomingVratCta[] = [
  {
    id: "chhath_2026",
    path: "/chhath-puja-2026/",
    campaign: "chhath2026",
    untilIst: CHHATH_UNTIL_IST,
    appliesTo: isChhathStory,
    text: {
      en: {
        endCard: "Chhath Puja 2026 guide",
        sidebarTitle: "Chhath Puja 2026",
        sidebarBody: "See the Chhath Puja 2026 guide on our partner site.",
        sidebarLink: "Chhath Puja 2026 guide",
      },
      hi: {
        endCard: "छठ पूजा 2026 गाइड",
        sidebarTitle: "छठ पूजा 2026",
        sidebarBody: "छठ पूजा 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "छठ पूजा 2026 गाइड",
      },
    },
  },
  {
    id: "vrishchika_sankranti_2026",
    path: "/vrishchika-sankranti-2026/",
    campaign: "vrishchika_sankranti2026",
    untilIst: VRISHCHIKA_SANKRANTI_UNTIL_IST,
    appliesTo: isAstrologyStory,
    text: {
      en: {
        endCard: "Vrishchika Sankranti 2026 guide",
        sidebarTitle: "Vrishchika Sankranti 2026",
        sidebarBody: "See the Vrishchika Sankranti 2026 guide on our partner site.",
        sidebarLink: "Vrishchika Sankranti 2026 guide",
      },
      hi: {
        endCard: "वृश्चिक संक्रांति 2026 गाइड",
        sidebarTitle: "वृश्चिक संक्रांति 2026",
        sidebarBody: "वृश्चिक संक्रांति 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "वृश्चिक संक्रांति 2026 गाइड",
      },
    },
  },
  {
    id: "jagaddhatri_2026",
    path: "/jagaddhatri-puja-2026/",
    campaign: "jagaddhatri_2026",
    untilIst: JAGADDHATRI_UNTIL_IST,
    appliesTo: isJagaddhatriStory,
    text: {
      en: {
        endCard: "Jagaddhatri Puja 2026 guide",
        sidebarTitle: "Jagaddhatri Puja 2026",
        sidebarBody: "See the Jagaddhatri Puja 2026 guide on our partner site.",
        sidebarLink: "Jagaddhatri Puja 2026 guide",
      },
      hi: {
        endCard: "जगद्धात्री पूजा 2026 गाइड",
        sidebarTitle: "जगद्धात्री पूजा 2026",
        sidebarBody: "जगद्धात्री पूजा 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "जगद्धात्री पूजा 2026 गाइड",
      },
    },
  },
  {
    id: "akshaya_navami_2026",
    path: "/akshaya-navami-2026/",
    campaign: PARTNER_CAMPAIGN_AKSHAYA_NAVAMI,
    untilIst: AKSHAYA_NAVAMI_PARTNER_CTA_UNTIL_IST,
    appliesTo: isAkshayaNavamiStory,
    text: {
      en: {
        endCard: "Akshaya Navami 2026 guide",
        sidebarTitle: "Akshaya Navami and Gopashtami",
        sidebarBody: "See Gopashtami and Akshaya Navami timings on our partner site.",
        sidebarLink: "Akshaya Navami 2026 guide",
      },
      hi: {
        endCard: "अक्षय नवमी 2026 गाइड",
        sidebarTitle: "अक्षय नवमी और गोपाष्टमी",
        sidebarBody: "गोपाष्टमी और अक्षय नवमी का समय हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "अक्षय नवमी 2026 गाइड",
      },
    },
  },
  {
    id: "tulsi_vivah_2026",
    path: "/tulsi-vivah-2026/",
    campaign: PARTNER_CAMPAIGN_TULSI_VIVAH,
    untilIst: TULSI_VIVAH_UNTIL_IST,
    text: {
      en: {
        endCard: "Tulsi Vivah 2026 guide",
        sidebarTitle: "Tulsi Vivah 2026",
        sidebarBody: "See the Tulsi Vivah 2026 guide on our partner site.",
        sidebarLink: "Tulsi Vivah 2026 guide",
      },
      hi: {
        endCard: "तुलसी विवाह 2026 गाइड",
        sidebarTitle: "तुलसी विवाह 2026",
        sidebarBody: "तुलसी विवाह 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "तुलसी विवाह 2026 गाइड",
      },
    },
  },
  {
    // Story fallback. Not a general-queue guide. Off at 00:00 IST 22 Nov.
    // Listed before Bhishma so Dev Uthani terms take this guide while it is open.
    id: "dev_uthani_ekadashi_2026",
    path: "/dev-uthani-ekadashi-2026/",
    campaign: "dev_uthani_ekadashi_2026",
    untilIst: DEV_UTHANI_EKADASHI_UNTIL_IST,
    appliesTo: isDevUthaniEkadashiStory,
    fallback: true,
    text: {
      en: {
        endCard: "Dev Uthani Ekadashi 2026 (20 to 21 Nov): date and parana time on Pocket Jyotish",
        sidebarTitle: "Dev Uthani Ekadashi 2026",
        sidebarBody: "Dev Uthani Ekadashi 2026 (20 to 21 Nov): date and parana time on Pocket Jyotish",
        sidebarLink: "Dev Uthani Ekadashi 2026 (20 to 21 Nov): date and parana time on Pocket Jyotish",
      },
      hi: {
        endCard: "देवउठनी एकादशी 2026 (20 से 21 नवंबर): तिथि और पारण समय, Pocket Jyotish पर",
        sidebarTitle: "देवउठनी एकादशी 2026",
        sidebarBody: "देवउठनी एकादशी 2026 (20 से 21 नवंबर): तिथि और पारण समय, Pocket Jyotish पर",
        sidebarLink: "देवउठनी एकादशी 2026 (20 से 21 नवंबर): तिथि और पारण समय, Pocket Jyotish पर",
      },
    },
  },
  {
    id: "pradosh_2026",
    path: "/pradosh-vrat-2026/",
    campaign: PARTNER_CAMPAIGN_PRADOSH,
    untilIst: PRADOSH_VRAT_UNTIL_IST,
    text: {
      en: {
        endCard: "Pradosh Vrat 2026 guide",
        sidebarTitle: "Pradosh Vrat 2026",
        sidebarBody: "See the Pradosh Vrat 2026 guide on our partner site.",
        sidebarLink: "Pradosh Vrat 2026 guide",
      },
      hi: {
        endCard: "प्रदोष व्रत 2026 गाइड",
        sidebarTitle: "प्रदोष व्रत 2026",
        sidebarBody: "प्रदोष व्रत 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "प्रदोष व्रत 2026 गाइड",
      },
    },
  },
  {
    id: "somvar_vrat_nov_2026",
    path: "/somvar-vrat/",
    campaign: "somvar_vrat_nov_2026",
    untilIst: SOMVAR_VRAT_NOV_UNTIL_IST,
    appliesTo: isSomvarVratStory,
    text: {
      en: {
        endCard: "Somvar Vrat vidhi guide",
        sidebarTitle: "Somvar Vrat vidhi",
        sidebarBody: "See the Somvar Vrat vidhi guide on our partner site.",
        sidebarLink: "Somvar Vrat vidhi guide",
      },
      hi: {
        endCard: "सोमवार व्रत विधि गाइड",
        sidebarTitle: "सोमवार व्रत विधि",
        sidebarBody: "सोमवार व्रत विधि गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "सोमवार व्रत विधि गाइड",
      },
    },
  },
  {
    id: "vaikuntha_2026",
    path: "/vaikuntha-chaturdashi-2026/",
    campaign: PARTNER_CAMPAIGN_VAIKUNTHA,
    untilIst: VAIKUNTHA_VRAT_UNTIL_IST,
    text: {
      en: {
        endCard: "Vaikuntha Chaturdashi 2026 guide",
        sidebarTitle: "Vaikuntha Chaturdashi 2026",
        sidebarBody: "See the Vaikuntha Chaturdashi 2026 guide on our partner site.",
        sidebarLink: "Vaikuntha Chaturdashi 2026 guide",
      },
      hi: {
        endCard: "वैकुंठ चतुर्दशी 2026 गाइड",
        sidebarTitle: "वैकुंठ चतुर्दशी 2026",
        sidebarBody: "वैकुंठ चतुर्दशी 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "वैकुंठ चतुर्दशी 2026 गाइड",
      },
    },
  },
  {
    id: "karthigai_deepam_2026",
    path: "/karthigai-deepam-2026/",
    campaign: "karthigai_deepam_2026",
    untilIst: KARTHIGAI_DEEPAM_UNTIL_IST,
    appliesTo: isKarthigaiDeepamStory,
    text: {
      en: {
        endCard: "Karthigai Deepam 2026 guide",
        sidebarTitle: "Karthigai Deepam 2026",
        sidebarBody: "See the Karthigai Deepam 2026 guide on our partner site.",
        sidebarLink: "Karthigai Deepam 2026 guide",
      },
      hi: {
        endCard: "कार्तिगई दीपम 2026 गाइड",
        sidebarTitle: "कार्तिगई दीपम 2026",
        sidebarBody: "कार्तिगई दीपम 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "कार्तिगई दीपम 2026 गाइड",
      },
    },
  },
  {
    id: "dev_deepawali_2026",
    path: "/dev-deepawali-2026/",
    campaign: PARTNER_CAMPAIGN_DEV_DEEPAWALI,
    untilIst: DEV_DEEPAWALI_UNTIL_IST,
    text: {
      en: {
        endCard: "Dev Deepawali 2026 guide",
        sidebarTitle: "Dev Deepawali 2026",
        sidebarBody: "See the Dev Deepawali 2026 guide on our partner site.",
        sidebarLink: "Dev Deepawali 2026 guide",
      },
      hi: {
        endCard: "देव दीपावली 2026 गाइड",
        sidebarTitle: "देव दीपावली 2026",
        sidebarBody: "देव दीपावली 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "देव दीपावली 2026 गाइड",
      },
    },
  },
  {
    // The exact-slug links-only CTA stays on FESTIVAL_PARTNER_CTAS and wins.
    id: "guru_nanak_jayanti_2026",
    path: "/guru-nanak-jayanti-2026/",
    campaign: PARTNER_CAMPAIGN_GURU_NANAK,
    untilIst: GURU_NANAK_PARTNER_CTA_UNTIL_IST,
    appliesTo: isGuruNanakJayantiStory,
    text: {
      en: {
        endCard: "Guru Nanak Jayanti 2026 guide",
        sidebarTitle: "Guru Nanak Jayanti 2026",
        sidebarBody: "See the Guru Nanak Jayanti 2026 guide on our partner site.",
        sidebarLink: "Guru Nanak Jayanti 2026 guide",
      },
      hi: {
        endCard: "गुरु नानक जयंती 2026 गाइड",
        sidebarTitle: "गुरु नानक जयंती 2026",
        sidebarBody: "गुरु नानक जयंती 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "गुरु नानक जयंती 2026 गाइड",
      },
    },
  },
  {
    // Fallback after named guides. Not a general-queue guide. Off at 00:00 IST 25 Nov.
    id: "bhishma_panchak_2026",
    path: "/bhishma-panchak-2026/",
    campaign: "bhishma_panchak_2026",
    fromIst: BHISHMA_PANCHAK_FROM_IST,
    untilIst: BHISHMA_PANCHAK_UNTIL_IST,
    appliesTo: isBhishmaPanchakStory,
    fallback: true,
    text: {
      en: {
        endCard: "Bhishma Panchak 2026 (20 to 24 Nov): dates and puja vidhi on Pocket Jyotish",
        sidebarTitle: "Bhishma Panchak 2026",
        sidebarBody: "Bhishma Panchak 2026 (20 to 24 Nov): dates and puja vidhi on Pocket Jyotish",
        sidebarLink: "Bhishma Panchak 2026 (20 to 24 Nov): dates and puja vidhi on Pocket Jyotish",
      },
      hi: {
        endCard: "भीष्म पंचक 2026 (20 से 24 नवंबर): तिथि और पूजा विधि, Pocket Jyotish पर",
        sidebarTitle: "भीष्म पंचक 2026",
        sidebarBody: "भीष्म पंचक 2026 (20 से 24 नवंबर): तिथि और पूजा विधि, Pocket Jyotish पर",
        sidebarLink: "भीष्म पंचक 2026 (20 से 24 नवंबर): तिथि और पूजा विधि, Pocket Jyotish पर",
      },
    },
  },
  {
    id: "guruvar_vrat_nov_2026",
    path: "/guruvar-vrat/",
    campaign: "guruvar_vrat_nov_2026",
    untilIst: GURUVAR_VRAT_NOV_UNTIL_IST,
    appliesTo: isGuruvarVratStory,
    text: {
      en: {
        endCard: "Guruvar Vrat vidhi guide",
        sidebarTitle: "Guruvar Vrat vidhi",
        sidebarBody: "See the Guruvar Vrat vidhi guide on our partner site.",
        sidebarLink: "Guruvar Vrat vidhi guide",
      },
      hi: {
        endCard: "गुरुवार व्रत विधि गाइड",
        sidebarTitle: "गुरुवार व्रत विधि",
        sidebarBody: "गुरुवार व्रत विधि गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "गुरुवार व्रत विधि गाइड",
      },
    },
  },
  {
    id: "sankashti_2026",
    path: "/sankashti-chaturthi-2026/",
    campaign: PARTNER_CAMPAIGN_SANKASHTI,
    untilIst: SANKASHTI_UNTIL_IST,
    text: {
      en: {
        endCard: "Sankashti Chaturthi 2026 guide",
        sidebarTitle: "Sankashti Chaturthi 2026",
        sidebarBody: "See the Sankashti Chaturthi 2026 guide on our partner site.",
        sidebarLink: "Sankashti Chaturthi 2026 guide",
      },
      hi: {
        endCard: "संकष्टी चतुर्थी 2026 गाइड",
        sidebarTitle: "संकष्टी चतुर्थी 2026",
        sidebarBody: "संकष्टी चतुर्थी 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "संकष्टी चतुर्थी 2026 गाइड",
      },
    },
  },
  {
    // Matching stories take this ahead of the queue. alsoGeneral keeps it as
    // the queue guide from 28 Nov through 1 Dec. A bare Bhairav does not match.
    id: "kaal_bhairav_2026",
    path: "/kaal-bhairav-jayanti-2026/",
    campaign: "kaal_bhairav_2026",
    untilIst: KAAL_BHAIRAV_UNTIL_IST,
    appliesTo: isKaalBhairavStory,
    alsoGeneral: true,
    text: {
      en: {
        endCard: "Kaal Bhairav Ashtami 2026 guide",
        sidebarTitle: "Kaal Bhairav Ashtami 2026",
        sidebarBody: "See the Kaal Bhairav Ashtami 2026 guide on our partner site.",
        sidebarLink: "Kaal Bhairav Ashtami 2026 guide",
      },
      hi: {
        endCard: "काल भैरव अष्टमी 2026 गाइड",
        sidebarTitle: "काल भैरव अष्टमी 2026",
        sidebarBody: "काल भैरव अष्टमी 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "काल भैरव अष्टमी 2026 गाइड",
      },
    },
  },
  {
    id: "utpanna_ekadashi_2026",
    path: "/utpanna-ekadashi-2026/",
    campaign: "utpanna_ekadashi_2026",
    untilIst: UTPANNA_EKADASHI_UNTIL_IST,
    text: {
      en: {
        endCard: "Utpanna Ekadashi 2026 guide",
        sidebarTitle: "Utpanna Ekadashi 2026",
        sidebarBody: "See the Utpanna Ekadashi 2026 guide on our partner site.",
        sidebarLink: "Utpanna Ekadashi 2026 guide",
      },
      hi: {
        endCard: "उत्पन्ना एकादशी 2026 गाइड",
        sidebarTitle: "उत्पन्ना एकादशी 2026",
        sidebarBody: "उत्पन्ना एकादशी 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "उत्पन्ना एकादशी 2026 गाइड",
      },
    },
  },
  {
    // Earlier untilIst than Kharmas, so a matching story takes this guide
    // through 14 Dec and returns to Kharmas on 15 Dec.
    id: "vivah_panchami_2026",
    path: "/vivah-panchami-2026/",
    campaign: "vivah_panchami_2026",
    fromIst: VIVAH_PANCHAMI_FROM_IST,
    untilIst: VIVAH_PANCHAMI_UNTIL_IST,
    appliesTo: isVivahPanchamiStory,
    text: {
      en: {
        endCard: "Vivah Panchami 2026 guide",
        sidebarTitle: "Vivah Panchami 2026",
        sidebarBody: "See the Vivah Panchami 2026 guide on our partner site.",
        sidebarLink: "Vivah Panchami 2026 guide",
      },
      hi: {
        endCard: "विवाह पंचमी 2026 गाइड",
        sidebarTitle: "विवाह पंचमी 2026",
        sidebarBody: "विवाह पंचमी 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "विवाह पंचमी 2026 गाइड",
      },
    },
  },
  {
    // Earlier untilIst than Saphala, so a matching story takes this guide
    // through 20 Dec and returns to Saphala on 21 Dec when that guide also matches.
    id: "mokshada_ekadashi_2026",
    path: "/mokshada-ekadashi-2026/",
    campaign: "mokshada_ekadashi_2026",
    fromIst: MOKSHADA_EKADASHI_FROM_IST,
    untilIst: MOKSHADA_EKADASHI_UNTIL_IST,
    appliesTo: isMokshadaEkadashiStory,
    text: {
      en: {
        endCard: "Mokshada Ekadashi and Gita Jayanti 2026 guide",
        sidebarTitle: "Mokshada Ekadashi and Gita Jayanti 2026",
        sidebarBody: "See the Mokshada Ekadashi and Gita Jayanti 2026 guide on our partner site.",
        sidebarLink: "Mokshada Ekadashi and Gita Jayanti 2026 guide",
      },
      hi: {
        endCard: "मोक्षदा एकादशी और गीता जयंती 2026 गाइड",
        sidebarTitle: "मोक्षदा एकादशी और गीता जयंती 2026",
        sidebarBody: "मोक्षदा एकादशी और गीता जयंती 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "मोक्षदा एकादशी और गीता जयंती 2026 गाइड",
      },
    },
  },
  {
    id: "mgpurnima_2026",
    path: "/margashirsha-purnima-2026/",
    campaign: PARTNER_CAMPAIGN_MGPURNIMA,
    untilIst: MARGASHIRSHA_PURNIMA_UNTIL_IST,
    text: {
      en: {
        endCard: "Margashirsha Purnima 2026 guide",
        sidebarTitle: "Margashirsha Purnima 2026",
        sidebarBody: "See the Margashirsha Purnima 2026 guide on our partner site.",
        sidebarLink: "Margashirsha Purnima 2026 guide",
      },
      hi: {
        endCard: "मार्गशीर्ष पूर्णिमा 2026 गाइड",
        sidebarTitle: "मार्गशीर्ष पूर्णिमा 2026",
        sidebarBody: "मार्गशीर्ष पूर्णिमा 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "मार्गशीर्ष पूर्णिमा 2026 गाइड",
      },
    },
  },
  {
    // Fallback after named guides, including Margashirsha Purnima. Not a general-queue guide.
    id: "margashirsha_month_2026",
    path: "/margashirsha-month-2026/",
    campaign: "margashirsha_month_2026",
    fromIst: MARGASHIRSHA_MONTH_FROM_IST,
    untilIst: MARGASHIRSHA_MONTH_UNTIL_IST,
    appliesTo: isMargashirshaMonthStory,
    fallback: true,
    text: {
      en: {
        endCard: "Margashirsha month 2026: vrat and festival dates on Pocket Jyotish",
        sidebarTitle: "Margashirsha month 2026",
        sidebarBody: "Margashirsha month 2026: vrat and festival dates on Pocket Jyotish",
        sidebarLink: "Margashirsha month 2026: vrat and festival dates on Pocket Jyotish",
      },
      hi: {
        endCard: "मार्गशीर्ष माह 2026: व्रत और त्योहार की तिथियां, Pocket Jyotish पर",
        sidebarTitle: "मार्गशीर्ष माह 2026",
        sidebarBody: "मार्गशीर्ष माह 2026: व्रत और त्योहार की तिथियां, Pocket Jyotish पर",
        sidebarLink: "मार्गशीर्ष माह 2026: व्रत और त्योहार की तिथियां, Pocket Jyotish पर",
      },
    },
  },
  {
    // Fallback after named guides, including the Margashirsha month guide.
    // Not a general-queue guide. Off at 00:00 IST 1 Jan 2027.
    id: "december_vrat_2026",
    path: "/december-2026-vrat-tyohar/",
    campaign: "december_vrat_2026",
    fromIst: DECEMBER_VRAT_FROM_IST,
    untilIst: DECEMBER_VRAT_UNTIL_IST,
    appliesTo: isDecemberVratTyoharStory,
    fallback: true,
    text: {
      en: {
        endCard: "December 2026: vrat and tyohar dates on Pocket Jyotish",
        sidebarTitle: "December 2026 vrat and tyohar",
        sidebarBody: "December 2026: vrat and tyohar dates on Pocket Jyotish",
        sidebarLink: "December 2026: vrat and tyohar dates on Pocket Jyotish",
      },
      hi: {
        endCard: "दिसंबर 2026: व्रत और त्योहार की तिथियां, Pocket Jyotish पर",
        sidebarTitle: "दिसंबर 2026 व्रत और त्योहार",
        sidebarBody: "दिसंबर 2026: व्रत और त्योहार की तिथियां, Pocket Jyotish पर",
        sidebarLink: "दिसंबर 2026: व्रत और त्योहार की तिथियां, Pocket Jyotish पर",
      },
    },
  },
  {
    id: "saphala_ekadashi_2027",
    path: "/saphala-ekadashi-2027/",
    campaign: "saphala_2027",
    fromIst: SAPHALA_EKADASHI_FROM_IST,
    untilIst: SAPHALA_EKADASHI_UNTIL_IST,
    appliesTo: isSaphalaEkadashiStory,
    text: {
      en: {
        endCard: "Saphala Ekadashi 2027 guide",
        sidebarTitle: "Saphala Ekadashi 2027",
        sidebarBody: "See the Saphala Ekadashi 2027 guide on our partner site.",
        sidebarLink: "Saphala Ekadashi 2027 guide",
      },
      hi: {
        endCard: "सफला एकादशी 2027 गाइड",
        sidebarTitle: "सफला एकादशी 2027",
        sidebarBody: "सफला एकादशी 2027 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "सफला एकादशी 2027 गाइड",
      },
    },
  },
  {
    id: "kharmas_2026",
    path: "/kharmas-2026/",
    campaign: "kharmas_2026",
    untilIst: KHARMAS_UNTIL_IST,
    appliesTo: isKharmasWeddingStory,
    text: {
      en: {
        endCard: "Kharmas 2026 dates and last vivah muhurat",
        sidebarTitle: "Kharmas 2026",
        sidebarBody: "See the Kharmas 2026 guide on our partner site.",
        sidebarLink: "Kharmas 2026 dates and last vivah muhurat",
      },
      hi: {
        endCard: "खरमास 2026 तिथियां और अंतिम विवाह मुहूर्त",
        sidebarTitle: "खरमास 2026",
        sidebarBody: "खरमास 2026 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "खरमास 2026 तिथियां और अंतिम विवाह मुहूर्त",
      },
    },
  },
  {
    id: "lohri_sankranti_2027",
    path: "/lohri-makar-sankranti-2027/",
    campaign: "lohri_sankranti_2027",
    untilIst: LOHRI_SANKRANTI_UNTIL_IST,
    appliesTo: isLohriSankrantiStory,
    text: {
      en: {
        endCard: "Lohri and Makar Sankranti 2027 guide",
        sidebarTitle: "Lohri and Makar Sankranti 2027",
        sidebarBody: "See the Lohri and Makar Sankranti 2027 guide on our partner site.",
        sidebarLink: "Lohri and Makar Sankranti 2027 guide",
      },
      hi: {
        endCard: "लोहड़ी और मकर संक्रांति 2027 गाइड",
        sidebarTitle: "लोहड़ी और मकर संक्रांति 2027",
        sidebarBody: "लोहड़ी और मकर संक्रांति 2027 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "लोहड़ी और मकर संक्रांति 2027 गाइड",
      },
    },
  },
  {
    id: "rashifal_2027",
    path: "/rashifal-2027/",
    campaign: "rashifal_2027",
    untilIst: RASHIFAL_2027_UNTIL_IST,
    appliesTo: isRashifalHoroscopeStory,
    text: {
      en: {
        endCard: "Rashifal 2027 for all 12 signs",
        sidebarTitle: "Rashifal 2027",
        sidebarBody: "See the Rashifal 2027 guide on our partner site.",
        sidebarLink: "Rashifal 2027 for all 12 signs",
      },
      hi: {
        endCard: "राशिफल 2027: सभी 12 राशियों के लिए",
        sidebarTitle: "राशिफल 2027",
        sidebarBody: "राशिफल 2027 गाइड हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "राशिफल 2027: सभी 12 राशियों के लिए",
      },
    },
  },
  {
    id: "griha_pravesh_2027",
    path: "/griha-pravesh-muhurat-2027/",
    campaign: "griha_pravesh_2027",
    untilIst: GRIHA_PRAVESH_UNTIL_IST,
    appliesTo: isGrihaPraveshStory,
    text: {
      en: {
        endCard: "Griha Pravesh Muhurat 2027 guide",
        sidebarTitle: "Griha Pravesh Muhurat 2027",
        sidebarBody: "See Griha Pravesh muhurat dates for 2027 on our partner site.",
        sidebarLink: "Griha Pravesh Muhurat 2027 guide",
      },
      hi: {
        endCard: "गृह प्रवेश मुहूर्त 2027 गाइड",
        sidebarTitle: "गृह प्रवेश मुहूर्त 2027",
        sidebarBody: "2027 के गृह प्रवेश मुहूर्त की तिथियां हमारी पार्टनर साइट पर देखें.",
        sidebarLink: "गृह प्रवेश मुहूर्त 2027 गाइड",
      },
    },
  },
];

export function getUpcomingVrat(id: string | null | undefined): UpcomingVratCta | null {
  if (!id) return null;
  return UPCOMING_VRAT_CTAS.find((c) => c.id === id) ?? null;
}

function vratIsOpen(c: UpcomingVratCta, today: string): boolean {
  return (!c.fromIst || today >= c.fromIst) && today <= c.untilIst;
}

/** In the dated general queue. alsoGeneral keeps a predicate guide there too. */
function isGeneralVrat(c: UpcomingVratCta): boolean {
  return c.appliesTo === undefined || c.alsoGeneral === true;
}

/** Next open guide matching the story; without a story, only general guides qualify. */
export function nextUpcomingVrat(now: Date = new Date(), a?: StoryFields): UpcomingVratCta | null {
  const today = istCalendarDate(now);
  // Legacy prefix ends at the first guide that is only general. alsoGeneral
  // guides stay in the later predicate pass and the general fallback.
  // Story fallbacks are not in this prefix and are not general-queue guides.
  const firstGeneral = UPCOMING_VRAT_CTAS.findIndex((c) => c.appliesTo === undefined);
  const legacyEnd = firstGeneral === -1 ? UPCOMING_VRAT_CTAS.length : firstGeneral;
  for (let i = 0; i < legacyEnd; i++) {
    const c = UPCOMING_VRAT_CTAS[i];
    if (c.fallback) continue;
    if (vratIsOpen(c, today) && (!c.appliesTo || (a !== undefined && c.appliesTo(a)))) return c;
  }
  if (a) {
    const specific = UPCOMING_VRAT_CTAS.find(
      (c) => c.appliesTo !== undefined && c.fallback !== true && vratIsOpen(c, today) && c.appliesTo(a)
    );
    if (specific) return specific;
    const seasonal = UPCOMING_VRAT_CTAS.find(
      (c) => c.fallback === true && c.appliesTo !== undefined && vratIsOpen(c, today) && c.appliesTo(a)
    );
    if (seasonal) return seasonal;
  }
  return UPCOMING_VRAT_CTAS.find((c) => isGeneralVrat(c) && vratIsOpen(c, today)) ?? null;
}

/** Asia/Calcutta calendar day before istDate (YYYY-MM-DD). */
function previousIstDate(istDate: string): string {
  const [y, m, d] = istDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() - 1);
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${utc.getUTCFullYear()}-${mm}-${dd}`;
}

/**
 * ISR caps for story guides that have not started yet. 00:00 IST on fromIst
 * is the expiry of the previous IST date, so partnerPageRevalidateSeconds
 * already lands on that midnight. Saphala starts 2026-12-05, Vivah Panchami
 * starts 2026-12-01, and Mokshada Ekadashi starts 2026-12-10.
 */
export function pendingVratStartsForStory(a: StoryFields, now: Date = new Date()): { untilIst: string }[] {
  if (isSensitiveStory(a) || !isPartnerEligibleStory(a)) return [];
  const today = istCalendarDate(now);
  const out: { untilIst: string }[] = [];
  for (const c of UPCOMING_VRAT_CTAS) {
    if (!c.fromIst || today >= c.fromIst) continue;
    if (c.appliesTo && !c.appliesTo(a)) continue;
    out.push({ untilIst: previousIstDate(c.fromIst) });
  }
  return out;
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

/**
 * Tragedy, death, disaster, accident, crime, violence, suicide, terror or
 * communal tension. Err toward skipping: a keyword in the title, slug, tags
 * or category is enough. These stories get no Pocket Jyotish unit at all.
 * Short Hindi tokens that sit inside ordinary words (आग inside आगे, मृत inside
 * अमृत) use a Devanagari boundary so a rashifal line is not treated as a death.
 */
const SENSITIVE_CATEGORY =
  /^(crime|crimes|criminal|accident|accidents|disaster|disasters|tragedy|violence|terror|terrorism|अपराध|आपदा|हादसा|हिंसा|आतंक)$/i;
const SENSITIVE_EN =
  /\b(traged(?:y|ies)|tragic|deaths?|dead|died|dies|dying|killed|kills|killing|murder(?:s|ed|ing)?|homicides?|drown(?:s|ed|ing)?|bod(?:y|ies)[\s-]found|corpses?|disasters?|flood(?:s|ed|ing)?|earthquakes?|cyclones?|landslides?|stampedes?|collapses?|collapsed|fires?|blaze|burn(?:t|ed)|explosions?|blasts?|bomb(?:s|ed|ing)?|accidents?|crash(?:es|ed|ing)?|collisions?|crimes?|criminals?|violence|violent|riots?|assault(?:s|ed|ing)?|rapes?|raped|molest(?:ed|ation)?|suicides?|suicidal|terrors?|terrorists?|terrorism|shoot(?:ing|ings|out)|stabb(?:ed|ing|ings)|communal|massacres?|lynch(?:ed|ing|ings)?|victims?|thefts?|thie(f|ves)|stolen|steal(s|ing)?|robber(y|ies|s)?|robbed|loot(s|ed|ing)?|burglar(y|ies|s)?|snatch(es|ed|ing|ers?)?|accused|kidnap(s|ped|ping)?|abduct(ed|ion|s)?|extortion|smuggl(ing|ed|ers?)|dacoity|absconding)\b/i;
const SENSITIVE_HI =
  /(त्रासदी|दुखद|मौत|मृत्यु|निधन|हत्या|मृतक|मृतदेह|मृतकाय|शव|लाश|आपदा|बाढ़|भूकंप|भूकम्प|चक्रवात|भूस्खलन|भगदड़|आगजनी|अग्निकांड|विस्फोट|धमाका|हादसा|दुर्घटना|अपराध|हिंसा|दंगा|हमला|आत्महत्या|खुदकुशी|आतंक|सांप्रदायिक|साम्प्रदायिक|सम्प्रदायिक|संप्रदायिक|बलात्कार|दुष्कर्म|घायल|सुनामी|डूब|चोरी|चोर|लूट|डकैती|छिनैती|अपहरण|तस्कर|आरोपी|फरार|रंगदारी)/;
const SENSITIVE_HI_BOUNDED =
  /(?:^|[^\u0900-\u097F])(?:आग|मृत)(?:$|[^\u0900-\u097F])/;

export function isSensitiveStory(a: StoryFields): boolean {
  const cat = (a.category || "").trim();
  if (cat && SENSITIVE_CATEGORY.test(cat)) return true;
  const hay = partnerHay(a);
  return SENSITIVE_EN.test(hay) || SENSITIVE_HI.test(hay) || SENSITIVE_HI_BOUNDED.test(hay);
}

/** True for crime, accident, death, disaster, politics, police and similar hard news. */
export function isHardNewsStory(a: StoryFields): boolean {
  if (isSensitiveStory(a)) return true;
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
 * Named guides add only their exact phrases: Jagaddhatri, Karthigai,
 * Tiruvannamalai Deepam, Monday fast, Thursday fast, Vivah Panchami,
 * Ram-Sita vivah, Janakpur, Mokshada, Gita Jayanti, Kaal Bhairav,
 * Guru Nanak Jayanti, Akshaya Navami, Gopashtami, Griha Pravesh,
 * Bhishma Panchak, Dev Uthani, Prabodhini Ekadashi, Kartik snan,
 * Margashirsha month, and a December 2026 vrat or tyohar list.
 * Hard news is always excluded, and exclusion wins over inclusion.
 */
export function isPartnerEligibleStory(a: StoryFields): boolean {
  if (isHardNewsStory(a)) return false;
  const cat = (a.category || "").trim();
  if (cat && RELIGION_CATEGORY.test(cat)) return true;
  const hay = partnerHay(a);
  if (EN_KEYWORDS.test(hay) || HI_KEYWORDS.test(hay)) return true;
  if (
    isKaalBhairavStory(a) ||
    isGuruNanakJayantiStory(a) ||
    isAkshayaNavamiStory(a) ||
    isGrihaPraveshStory(a) ||
    mentionsBhishmaPanchak(a) ||
    mentionsMargashirshaMonth(a) ||
    mentionsDecemberVratTyohar(a)
  ) {
    return true;
  }
  return isVaranasiSpiritualGuide(a);
}

/**
 * Next vrat guide for an astrology / festival / vrat / puja story, or null.
 * Sensitive and hard news never qualify. An exact-slug festival CTA or the
 * Diwali CTA already occupies the end unit, so the rotation stays off.
 * From 17 to 24 Nov IST, Varanasi and festival stories show Dev Deepawali
 * instead of Pradosh. Tulsi (through 21 Nov) and Vaikuntha (through 23 Nov)
 * still win on those days because they are the sooner guide.
 */
export function upcomingVratForStory(a: StoryFields, now: Date = new Date()): UpcomingVratCta | null {
  if (isSensitiveStory(a) || !isPartnerEligibleStory(a)) return null;
  if (festivalPartnerCtaFor(a, now)) return null;
  if (isDiwaliPartnerCtaActive(now) && isDiwaliFestivalStory(a)) return null;
  const next = nextUpcomingVrat(now, a);
  if (!next) return null;
  if (next.id === "pradosh_2026" && devDeepawaliOverridesPradosh(a, now)) {
    return getUpcomingVrat("dev_deepawali_2026");
  }
  return next;
}

const FESTIVAL_STORY_EN =
  /\b(panchang|muhurats?|muhurtas?|vrats?|puja|pooja|aarti|chalisa|karwa[\s-]?chauth|diwali|deepavali|deepawali|chhath|dhanteras|ekadashi|navratri|bhai[\s-]?dooj|govardhan|tulsi|dev[\s-]?uthani|dev[\s-]?diwali|kartik|purnima|amavasya|sankranti|holi|janmashtami|shivratri|ganesh[\s-]?chaturthi|durga[\s-]?puja|raksha[\s-]?bandhan|rakhi|dussehra|vijayadashami|ram[\s-]?navami|hanuman[\s-]?jayanti|akshaya[\s-]?tritiya|teej|hartalika|pitru[\s-]?paksha|shradh|shraddha|sawan|shravan|pradosh|sankashti|vaikuntha|margashirsha|festivals?)\b/i;
const FESTIVAL_STORY_HI =
  /(पंचांग|मुहूर्त|व्रत|पूजा|आरती|चालीसा|करवा\s?चौथ|दिवाली|दीपावली|छठ|धनतेरस|एकादशी|नवरात्रि|नवरात्र|भाई\s?दूज|गोवर्धन|तुलसी|देव\s?दीपावली|देव\s?दिवाली|कार्तिक|पूर्णिमा|अमावस्या|संक्रांति|होली|जन्माष्टमी|शिवरात्रि|गणेश\s?चतुर्थी|दुर्गा\s?पूजा|रक्षाबंधन|दशहरा|रामनवमी|हनुमान\s?जयंती|अक्षय\s?तृतीया|तीज|पितृ\s?पक्ष|श्राद्ध|सावन|प्रदोष|संकष्टी|वैकुंठ|मार्गशीर्ष|त्योहार)/;
const FESTIVAL_STORY_CATEGORY = /^(festivals?|religion|spirituality|spiritual|dharm|dharma|धर्म|त्योहार|पर्व)$/i;

/** Varanasi stories and festival / vrat / puja stories. A plain rashifal does not match. */
export function isVaranasiOrFestivalStory(a: StoryFields): boolean {
  const cat = (a.category || "").trim();
  if (cat && (FESTIVAL_STORY_CATEGORY.test(cat) || /^varanasi$/i.test(cat))) return true;
  const hay = partnerHay(a);
  return VARANASI_PLACE.test(hay) || FESTIVAL_STORY_EN.test(hay) || FESTIVAL_STORY_HI.test(hay);
}

/** True on 17–24 Nov IST for a Varanasi or festival story. */
export function devDeepawaliOverridesPradosh(a: StoryFields, now: Date = new Date()): boolean {
  const today = istCalendarDate(now);
  return (
    today >= DEV_DEEPAWALI_PRIORITY_FROM_IST &&
    today <= DEV_DEEPAWALI_PRIORITY_UNTIL_IST &&
    isVaranasiOrFestivalStory(a)
  );
}

/**
 * Links-only Dev Deepawali Partner line on Varanasi section stories.
 * Maahir approved this on 15 Nov 2026. On from 00:00 IST 20 Nov through
 * 23:59:59 IST 24 Nov. Off at 00:00 IST 25 Nov. It does not replace the
 * Sponsored end unit or the chat versus Choghadiya test.
 */
export const DEV_DEEPAWALI_VARANASI_FROM_IST = "2026-11-20";
export const DEV_DEEPAWALI_VARANASI_UNTIL_IST = "2026-11-24";

/**
 * PR72 exact slug. That story already has the links-only Vaikuntha CTA, so it
 * does not also get a Dev Deepawali line.
 */
export const DEV_DEEPAWALI_GUIDE_SLUG = "dev-deepawali-24-november-2026-varanasi-timings";

export function isDevDeepawaliVaranasiWindow(now: Date = new Date()): boolean {
  const today = istCalendarDate(now);
  return today >= DEV_DEEPAWALI_VARANASI_FROM_IST && today <= DEV_DEEPAWALI_VARANASI_UNTIL_IST;
}

/**
 * Varanasi section story: the breadcrumb category is Varanasi, or any stored
 * category value maps to Varanasi (including a mixed city list).
 */
export function isVaranasiSectionStory(a: { category?: string | null }): boolean {
  if (pickBreadcrumbCategory(a.category)?.slug === "varanasi") return true;
  return getCategoriesByDbValue(a.category).some((category) => category.slug === "varanasi");
}

/**
 * Already showing a Dev Deepawali guide, so a second link would duplicate it.
 * The PR72 slug keeps its own CTA. The 17–24 Nov end-unit priority, and the
 * 24 Nov rotation, already link to /dev-deepawali-2026/ when that guide is
 * the one on the page.
 */
export function hasDevDeepawaliGuide(a: StoryFields, now: Date = new Date()): boolean {
  if (a.slug === DEV_DEEPAWALI_GUIDE_SLUG && festivalPartnerCtaFor(a, now)) return true;
  return upcomingVratForStory(a, now)?.id === "dev_deepawali_2026";
}

/**
 * The Varanasi Partner line. Sensitive stories are excluded. A story that
 * already has a partner widget, a festival line, or the Dev Deepawali guide
 * does not get a second unit.
 */
export function showDevDeepawaliVaranasiPartner(a: StoryFields, now: Date = new Date()): boolean {
  if (!isDevDeepawaliVaranasiWindow(now)) return false;
  if (isSensitiveStory(a)) return false;
  if (!isVaranasiSectionStory(a)) return false;
  if (hasDevDeepawaliGuide(a, now)) return false;
  if (isPartnerEligibleStory(a)) return false;
  if (festivalPartnerCtaFor(a, now)) return false;
  return true;
}

export function devDeepawaliVaranasiHref(slug: string): string {
  return partnerHref({
    path: "/dev-deepawali-2026/",
    medium: "partner",
    campaign: PARTNER_CAMPAIGN_DEV_DEEPAWALI,
    slug,
  });
}

/**
 * ISR caps for Varanasi section pages. 00:00 IST on 20 Nov is the expiry of
 * 19 Nov, and 00:00 IST on 25 Nov is the expiry of 24 Nov.
 */
export function devDeepawaliVaranasiWindows(
  a: StoryFields,
  now: Date = new Date()
): { untilIst: string }[] {
  if (isSensitiveStory(a) || !isVaranasiSectionStory(a)) return [];
  const today = istCalendarDate(now);
  if (today < DEV_DEEPAWALI_VARANASI_FROM_IST) {
    return [{ untilIst: previousIstDate(DEV_DEEPAWALI_VARANASI_FROM_IST) }];
  }
  if (today <= DEV_DEEPAWALI_VARANASI_UNTIL_IST) {
    return [{ untilIst: DEV_DEEPAWALI_VARANASI_UNTIL_IST }];
  }
  return [];
}

export type DevDeepawaliPartnerSlot = "after-body" | "before-related" | "none";

/**
 * After the body when author or sources separate the line from the
 * below-article ad. Otherwise before related stories, with Latest Stories
 * between the ad and the line. Never beside an AdSense slot.
 */
export function devDeepawaliPartnerSlot(opts: {
  show: boolean;
  separatedFromBelowAd: boolean;
  hasLatestStories: boolean;
}): DevDeepawaliPartnerSlot {
  if (!opts.show) return "none";
  if (opts.separatedFromBelowAd) return "after-body";
  if (opts.hasLatestStories) return "before-related";
  return "none";
}

/** Match only the story metadata used by partner eligibility. */
export function isChhathStory(a: StoryFields): boolean {
  return /\bchhath\b|छठ/i.test(partnerHay(a));
}

function isAstrologyStory(a: StoryFields): boolean {
  return /\b(astrology|astrological|rashifal|rashi|horoscopes?|jyotish|kundli|kundali|zodiac|panchang|sankranti)\b|ज्योतिष|राशिफल|राशि|कुंडली|कुण्डली|पंचांग|संक्रांति/i.test(partnerHay(a));
}

/** Rashifal / horoscope only. Not every astrology, kundli or religion story. */
export function isRashifalHoroscopeStory(a: StoryFields): boolean {
  return /\b(rashifal|horoscopes?|zodiac)\b|राशिफल/i.test(partnerHay(a));
}

/**
 * Wedding, shaadi, vivah, marriage muhurat and Kharmas.
 * Tulsi Vivah is the festival guide, so that phrase is not a wedding match.
 */
export function isKharmasWeddingStory(a: StoryFields): boolean {
  const hay = partnerHay(a).replace(/tulsi[\s-]*vivah/gi, " ").replace(/तुलसी\s*विवाह/g, " ");
  return /\b(wedding|vivah|shaadi|kharmas)\b|\bmarriage\s+muhurat\b/i.test(hay) || /विवाह|शादी|खरमास/.test(hay);
}

/** Ekadashi, Pausha and Vishnu stories for the Saphala guide. */
export function isSaphalaEkadashiStory(a: StoryFields): boolean {
  return /\b(ekadashi|pausha|paush|vishnu)\b|एकादशी|पौष|विष्णु/i.test(partnerHay(a));
}

/** Lohri, Makar Sankranti and Pongal. A bare sankranti is not enough. */
export function isLohriSankrantiStory(a: StoryFields): boolean {
  return /\b(lohri|pongal)\b|makar[\s-]?sankranti|लोहड़ी|मकर\s?संक्रांति/i.test(partnerHay(a));
}

/** Jagaddhatri or Jagadhatri. A bare puja is not a match. */
export function isJagaddhatriStory(a: StoryFields): boolean {
  return /\bjagaddhatri\b|\bjagadhatri\b|जगद्धात्री/i.test(partnerHay(a));
}

/** Karthigai, Kartigai, or the Tiruvannamalai Deepam phrase. */
export function isKarthigaiDeepamStory(a: StoryFields): boolean {
  return /\b(?:karthigai|kartigai)\b|\btiruvannamalai[\s-]deepam\b|कार्तिगई/i.test(partnerHay(a));
}

/** Somvar vrat, Somwar vrat, Monday vrat, or Monday fast. */
export function isSomvarVratStory(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return /\b(?:somvar|somwar)[\s-]vrat\b|\bmonday[\s-](?:vrat|fast)\b/i.test(hay) || /सोमवार\s?व्रत/.test(hay);
}

/** Guruvar vrat, Brihaspativar vrat, Thursday vrat, or Thursday fast. */
export function isGuruvarVratStory(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\b(?:guruvar|brihaspativar)[\s-]vrat\b|\bthursday[\s-](?:vrat|fast)\b/i.test(hay) ||
    /गुरुवार\s?व्रत|बृहस्पतिवार\s?व्रत/.test(hay)
  );
}

/** Vivah Panchami, Ram-Sita vivah, Sita vivah, or Janakpur. */
export function isVivahPanchamiStory(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\bvivah[\s-]panchami\b/i.test(hay) ||
    /\bram[\s-]sita[\s-]vivah\b/i.test(hay) ||
    /\bsita[\s-]vivah\b/i.test(hay) ||
    /\bjanakpur\b/i.test(hay) ||
    /विवाह\s?पंचमी|राम\s?सीता\s?विवाह|सीता\s?विवाह|(?<![\u0900-\u097F])जनकपुर(?![\u0900-\u097F])/.test(hay)
  );
}

/**
 * Kaal Bhairav, Kal Bhairav, Kala Bhairav, Bhairav Ashtami, Bhairav Jayanti,
 * or Bheru Ashtami. A bare Bhairav is a personal name and does not match.
 */
export function isKaalBhairavStory(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\b(?:kaal[\s-]?bhairav|kal[\s-]?bhairav|kala[\s-]?bhairav|kalbhairav|kaalbhairav|bhairav[\s-]?ashtami|bhairav[\s-]?jayanti|bhairavashtami|bheru[\s-]?ashtami)\b/i.test(
      hay
    ) || /काल\s?भैरव|भैरव\s?अष्टमी|भैरव\s?जयंती/.test(hay)
  );
}

/** Guru Nanak, Gurpurab, or Prakash Purab / Parv / Utsav. */
export function isGuruNanakJayantiStory(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\b(?:guru[\s-]?nanak|gurpurab|gurupurab|prakash[\s-]?purab|prakash[\s-]?parv|prakash[\s-]?utsav)\b/i.test(hay) ||
    /गुरु\s?नानक|गुरुपर्व|गुरपुरब|प्रकाश\s?पर्व/.test(hay)
  );
}

/** Akshaya Navami, Amla Navami, or Gopashtami. */
export function isAkshayaNavamiStory(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\b(?:akshaya[\s-]?navami|akshay[\s-]?navami|amla[\s-]?navami|aonla[\s-]?navami|gopashtami|gopasthami)\b/i.test(
      hay
    ) || /अक्षय\s?नवमी|आंवला\s?नवमी|आँवला\s?नवमी|गोपाष्टमी/.test(hay)
  );
}

/** Griha Pravesh or a housewarming muhurat. A bare housewarming does not match. */
export function isGrihaPraveshStory(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\b(?:griha[\s-]?pravesh(?:[\s-]?muhurat)?|grih[\s-]?pravesh|gruh[\s-]?pravesh|housewarming[\s-]?muhurat)\b/i.test(
      hay
    ) || /गृह\s?प्रवेश/.test(hay)
  );
}

/** Mokshada, Gita Jayanti, a Gita discourse, or Kurukshetra Gita. */
export function isMokshadaEkadashiStory(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\bmokshada\b/i.test(hay) ||
    /\b(?:gita|geeta)[\s-]jayanti\b/i.test(hay) ||
    /\bgita[\s-]discourses?\b/i.test(hay) ||
    /\bkurukshetra[\s-]gita\b/i.test(hay) ||
    /मोक्षदा|गीता\s?जयंती/.test(hay)
  );
}

/**
 * Named festival themes that keep their own guide. A seasonal fallback does
 * not replace them. Generic Ekadashi stays out so Prabodhini Ekadashi can
 * match the Dev Uthani guide through 21 Nov IST, then Bhishma Panchak through
 * 24 Nov, while Saphala is closed. Saphala still wins once open.
 */
function hasPriorityVratTheme(a: StoryFields): boolean {
  if (
    isJagaddhatriStory(a) ||
    isAkshayaNavamiStory(a) ||
    isSomvarVratStory(a) ||
    isKarthigaiDeepamStory(a) ||
    isGuruNanakJayantiStory(a) ||
    isGuruvarVratStory(a) ||
    isKaalBhairavStory(a) ||
    isVivahPanchamiStory(a) ||
    isMokshadaEkadashiStory(a)
  ) {
    return true;
  }
  const hay = partnerHay(a);
  return (
    /\btulsi[\s-]?vivah\b/i.test(hay) ||
    /तुलसी\s?विवाह/.test(hay) ||
    /\bdev[\s-]?(?:deepawali|diwali)\b/i.test(hay) ||
    /देव\s?(?:दीपावली|दिवाली)/.test(hay) ||
    /\bpradosh\b/i.test(hay) ||
    /प्रदोष/.test(hay) ||
    /\bvaikuntha\b/i.test(hay) ||
    /वैकुंठ/.test(hay) ||
    /\bsankashti\b/i.test(hay) ||
    /संकष्टी/.test(hay) ||
    /\butpanna\b/i.test(hay) ||
    /उत्पन्ना/.test(hay) ||
    /\bpurnima\b/i.test(hay) ||
    /पूर्णिमा/.test(hay)
  );
}

/**
 * Dev Uthani, Devutthana, Devuthani, or Prabodhini Ekadashi.
 * A bare Ekadashi does not match.
 */
function mentionsDevUthani(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\bdev[\s-]?ut+h(?:ani|ana)\b/i.test(hay) ||
    /देवउठनी|देव\s?उठनी|देवोत्थान|देव\s?उत्थान|प्रबोधिनी/.test(hay) ||
    /\bprabodhini[\s-]?ekadashi\b/i.test(hay)
  );
}

/** Story fallback for Dev Uthani Ekadashi. Named festival themes keep their own guides. */
export function isDevUthaniEkadashiStory(a: StoryFields): boolean {
  return mentionsDevUthani(a) && !hasPriorityVratTheme(a);
}

/**
 * Bhishma Panchak, Dev Uthani / Devutthana / Devuthani, Prabodhini Ekadashi,
 * or Kartik snan / Kartik month bathing. A bare Kartik or a bare snan does not match.
 * Dev Uthani terms stay included so they return here after 00:00 IST 22 Nov,
 * until this guide switches off at 00:00 IST 25 Nov.
 */
function mentionsBhishmaPanchak(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\bbhishma[\s-]?panchaka?\b/i.test(hay) ||
    /भीष्म\s?पंचक/.test(hay) ||
    mentionsDevUthani(a) ||
    /\bkartik[\s-]?snan\b/i.test(hay) ||
    /\bkartik[\s-]+month[\s-]+bath(?:ing)?\b/i.test(hay) ||
    /कार्तिक\s?(?:(?:मास|माह|महीने)(?:\s?का)?\s?)?स्नान/.test(hay)
  );
}

/** Story fallback for Bhishma Panchak. Named festival themes keep their own guides. */
export function isBhishmaPanchakStory(a: StoryFields): boolean {
  return mentionsBhishmaPanchak(a) && !hasPriorityVratTheme(a);
}

/** Margashirsha, Margshirsh, Aghan or Agahan month. A bare purnima is not a month match. */
function mentionsMargashirshaMonth(a: StoryFields): boolean {
  const hay = partnerHay(a);
  return (
    /\bmarg(?:a)?shirsh(?:a)?\b/i.test(hay) ||
    /\b(?:aghan|agahan)\b/i.test(hay) ||
    /(?<![\u0900-\u097F])(?:मार्गशीर्ष|अगहन)(?![\u0900-\u097F])/.test(hay)
  );
}

/** Story fallback for the Margashirsha month. Named festival themes keep their own guides. */
export function isMargashirshaMonthStory(a: StoryFields): boolean {
  return mentionsMargashirshaMonth(a) && !hasPriorityVratTheme(a);
}

/**
 * December 2026 vrat or tyohar list or calendar.
 * Needs December, दिसंबर, or दिसम्बर together with vrat, tyohar, a festival list,
 * a festival calendar, व्रत, or त्योहार. A bare December story does not match.
 */
function mentionsDecemberVratTyohar(a: StoryFields): boolean {
  const hay = partnerHay(a);
  const december = /\bdecember\b/i.test(hay) || /दिसंबर|दिसम्बर/.test(hay);
  if (!december) return false;
  return (
    /\bvrats?\b/i.test(hay) ||
    /\btyohars?\b/i.test(hay) ||
    /\bfestivals?[\s-]+lists?\b/i.test(hay) ||
    /\bfestivals?[\s-]+calendars?\b/i.test(hay) ||
    /व्रत|त्योहार/.test(hay)
  );
}

/** Story fallback for the December 2026 list. Named festival themes keep their own guides. */
export function isDecemberVratTyoharStory(a: StoryFields): boolean {
  return mentionsDecemberVratTyohar(a) && !hasPriorityVratTheme(a);
}

/** Inclusive last IST day of the Sponsored end unit A/B test. */
export const SPONSORED_END_TEST_UNTIL_IST = "2026-11-20";
export type SponsoredEndMode = "a" | "b" | "chhath" | "kharmas" | "rashifal";

/**
 * Chhath, then Kharmas, then Rashifal 2027. Other stories keep the slug A/B
 * through 20 Nov IST, then chat (A).
 */
export function sponsoredEndModeForStory(a: StoryFields, now: Date = new Date()): SponsoredEndMode | null {
  if (!canShowSponsoredEndUnit(a, { now })) return null;
  const today = istCalendarDate(now);
  if (today <= CHHATH_UNTIL_IST && isChhathStory(a)) return "chhath";
  if (today <= KHARMAS_UNTIL_IST && isKharmasWeddingStory(a)) return "kharmas";
  if (today <= RASHIFAL_2027_UNTIL_IST && isRashifalHoroscopeStory(a)) return "rashifal";
  return today <= SPONSORED_END_TEST_UNTIL_IST && slugHash(a.slug || "") % 2 === 1 ? "b" : "a";
}

/** Active end-unit windows for the shared ISR expiry cap. */
export function sponsoredEndWindowsForStory(a: StoryFields, now: Date = new Date()): { untilIst: string }[] {
  const mode = sponsoredEndModeForStory(a, now);
  if (mode === "chhath") return [{ untilIst: CHHATH_UNTIL_IST }];
  if (mode === "kharmas") return [{ untilIst: KHARMAS_UNTIL_IST }];
  if (mode === "rashifal") return [{ untilIst: RASHIFAL_2027_UNTIL_IST }];
  if (mode && istCalendarDate(now) <= SPONSORED_END_TEST_UNTIL_IST) {
    return [{ untilIst: SPONSORED_END_TEST_UNTIL_IST }];
  }
  return [];
}

/**
 * Evergreen Sponsored end unit. Off when the story is sensitive, and off when
 * an end unit is already reserved (partner end card, festival CTA, price line
 * or tech/auto line). Hard news that is not sensitive still qualifies: the
 * page renders it end-only, with neutral copy, and does not add an inline unit.
 */
export function canShowSponsoredEndUnit(
  a: StoryFields,
  opts: { hasPriceGuide?: boolean; hasTechAutoLine?: boolean; now?: Date } = {}
): boolean {
  if (isSensitiveStory(a)) return false;
  if (isPartnerEligibleStory(a)) return false;
  if (festivalPartnerCtaFor(a, opts.now)) return false;
  if (opts.hasPriceGuide) return false;
  if (opts.hasTechAutoLine) return false;
  return true;
}

export type SponsoredEndPlacement = "after-body" | "before-related" | "none";

/**
 * After the article body when author or sources sit between the unit and the
 * below-article AdSense slot. Otherwise before related stories, and only when
 * Latest Stories renders in between so the unit is not the ad's next sibling.
 * Never above the fold and never a second end unit.
 */
export function sponsoredEndPlacement(opts: {
  show: boolean;
  separatedFromBelowAd: boolean;
  hasLatestStories: boolean;
}): SponsoredEndPlacement {
  if (!opts.show) return "none";
  if (opts.separatedFromBelowAd) return "after-body";
  if (opts.hasLatestStories) return "before-related";
  return "none";
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
