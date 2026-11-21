import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DIWALI_PARTNER_CTA_UNTIL_IST,
  diwaliPartnerHref,
  isDiwaliFestivalStory,
  isDiwaliPartnerCtaActive,
  istCalendarDate,
  partnerRashifalFor,
  useDiwaliPartnerCta,
  canShowSponsoredEndUnit,
  isHardNewsStory,
  isKashiVishwanathStory,
  isPartnerEligibleStory,
  isSensitiveStory,
  AAJ_KA_PANCHANG,
  isAajKaPanchangStory,
  KASHI_VISHWANATH_DARSHAN,
  UPCOMING_VRAT_CTAS,
  getUpcomingVrat,
  showDevDeepawaliVaranasiPartner,
  upcomingVratForStory,
  isPartnerInlineTestActive,
  isPartnerTechAutoTestActive,
  isTechAutoTestStory,
  partnerHref,
  partnerInlineVariant,
  PARTNER_INLINE_TEST_UNTIL_IST,
  PARTNER_TECH_AUTO_TEST_SLUGS,
  PARTNER_TECH_AUTO_TEST_UNTIL_IST,
  rehypePartnerInlineCard,
  showTechAutoPartnerLine,
  slugHash,
} from "./partnerRashifal";
import { PartnerEndCard, PartnerRashifal, PartnerSidebar } from "../components/PartnerRashifal";
import { rehypeAdSlots } from "./rehypeAdSlots";

const renderHtml = (el: React.ReactElement) => renderToStaticMarkup(el);
const renderHrefs = (s: string) => Array.from(s.matchAll(/href="([^"]+)"/g)).map((m) => m[1].replace(/&amp;/g, "&"));

describe("Diwali partner CTA window", () => {
  it("keeps the until-date constant at 11 Nov 2026 IST", () => {
    assert.equal(DIWALI_PARTNER_CTA_UNTIL_IST, "2026-11-11");
  });

  it("is active on 6 Nov 2026 afternoon IST", () => {
    // 6 Nov 2026 15:00 IST = 09:30 UTC
    assert.equal(isDiwaliPartnerCtaActive(new Date("2026-11-06T09:30:00Z")), true);
  });

  it("is still active through the final millisecond of 11 Nov 2026 IST", () => {
    // 11 Nov 2026 23:59:59.999 IST = 18:29:59.999 UTC
    assert.equal(isDiwaliPartnerCtaActive(new Date("2026-11-11T18:29:59.999Z")), true);
  });

  it("reverts at midnight on 12 Nov 2026 IST", () => {
    // 12 Nov 2026 00:00 IST = 2026-11-11T18:30:00Z
    assert.equal(isDiwaliPartnerCtaActive(new Date("2026-11-11T18:30:00Z")), false);
  });

  it("formats IST calendar dates as YYYY-MM-DD", () => {
    assert.equal(istCalendarDate(new Date("2026-11-11T18:29:59.999Z")), "2026-11-11");
    assert.equal(istCalendarDate(new Date("2026-11-11T18:30:00Z")), "2026-11-12");
  });
});

describe("Diwali festival story match", () => {
  it("matches Diwali and Dhanteras titles", () => {
    assert.equal(isDiwaliFestivalStory({ title: "Diwali 2026 muhurat timings" }), true);
    assert.equal(isDiwaliFestivalStory({ title: "Dhanteras gold buying guide" }), true);
    assert.equal(isDiwaliFestivalStory({ slug: "lakshmi-puja-2026-muhurat" }), true);
  });

  it("does not match a plain rashifal story", () => {
    assert.equal(isDiwaliFestivalStory({ title: "Mesh rashifal today" }), false);
  });

  it("builds the Diwali href with required UTMs", () => {
    const href = diwaliPartnerHref("diwali-2026-muhurat");
    assert.match(href, /^https:\/\/pocketjyotish\.in\/diwali-2026\/\?/);
    assert.match(href, /utm_source=dalimss_news/);
    assert.match(href, /utm_medium=widget/);
    assert.match(href, /utm_campaign=diwali_2026/);
    assert.match(href, /utm_content=diwali-2026-muhurat/);
  });

  it("turns on only when both festival match and window are true", () => {
    const article = { title: "Diwali muhurat 2026", slug: "diwali-muhurat-2026" };
    assert.equal(useDiwaliPartnerCta(article, new Date("2026-11-06T09:30:00Z")), true);
    assert.equal(useDiwaliPartnerCta(article, new Date("2026-11-11T18:30:00Z")), false);
    assert.equal(
      useDiwaliPartnerCta({ title: "Mesh rashifal today" }, new Date("2026-11-06T09:30:00Z")),
      false
    );
  });

  it("still shows the partner widget for Diwali stories", () => {
    const info = partnerRashifalFor({ title: "Diwali 2026 muhurat", slug: "diwali-2026-muhurat" });
    assert.equal(info.show, true);
  });
});

describe("partner eligibility", () => {
  const yes = (a: any) => assert.equal(isPartnerEligibleStory(a), true, JSON.stringify(a));
  const no = (a: any) => assert.equal(isPartnerEligibleStory(a), false, JSON.stringify(a));

  it("includes astrology, rashifal, festival, vrat and puja guides", () => {
    yes({ title: "Mesh rashifal today: love and career" });
    yes({ title: "Kartik Purnima 2026 snan muhurat and puja vidhi" });
    yes({ title: "Ekadashi vrat November 2026: date and parana time" });
    yes({ title: "Chhath Puja 2026 arghya timings" });
    yes({ title: "Janmashtami 2026 puja guide" });
    yes({ title: "आज का राशिफल: मेष राशि" });
    yes({ title: "देव दीपावली 2026 मुहूर्त" });
    yes({ title: "Weekly predictions", category: "Astrology" });
  });

  it("includes Varanasi festival and ghat service guides", () => {
    yes({ title: "Dev Deepawali 2026 Varanasi: ghat guide, boat booking and timings" });
    yes({ title: "Varanasi Ganga Aarti timings at Dashashwamedh Ghat", category: "Varanasi" });
    yes({ title: "Kashi Vishwanath darshan guide: entry gates and timings" });
  });

  it("excludes hard news even with ghat, festival or puja words", () => {
    no({ title: "Two youths drown at Assi Ghat in Varanasi", category: "Varanasi" });
    no({ title: "Man drowns during Chhath Puja at ghat" });
    no({ title: "Fire breaks out at Durga Puja pandal" });
    no({ title: "Police arrest three after murder near Manikarnika Ghat" });
    no({ title: "Stampede at temple during Kartik Purnima snan kills 2" });
    no({ title: "Accident on Diwali night: bike crash" });
    no({ title: "BJP and Congress clash over Diwali holiday" });
    no({ title: "Varanasi ghat flood: boats banned" });
    no({ title: "घाट पर स्नान करते समय युवक डूबा" });
    no({ title: "Navratri pandal festival", category: "Politics" });
    no({ title: "Diwali rashifal", category: "Crime" });
  });

  it("excludes ordinary non-spiritual stories", () => {
    no({ title: "Gurugram metro extension gets approval" });
    no({ title: "Varanasi airport new terminal opens", category: "Varanasi" });
    no({ title: "realme 16 5G review", category: "Technology" });
  });

  it("reports hard news", () => {
    assert.equal(isHardNewsStory({ title: "Ghat drowning: body found" }), true);
    assert.equal(isHardNewsStory({ title: "Ganga Aarti timings" }), false);
    assert.equal(isHardNewsStory({ title: "Gurugram metro extension gets approval" }), true);
    assert.equal(isHardNewsStory({ title: "Ardee City flyover and underpass plan" }), true);
    assert.equal(isHardNewsStory({ title: "Varanasi to Udhna special train timetable" }), true);
    assert.equal(isHardNewsStory({ title: "Shaheed Udyan park renovation deadline" }), true);
  });

  it("partnerRashifalFor uses the same rule", () => {
    assert.equal(partnerRashifalFor({ title: "Two youths drown at Assi Ghat" }).show, false);
    assert.equal(partnerRashifalFor({ title: "Tula rashifal today" }).show, true);
  });

  it("keeps Pocket Jyotish off the three hard-news leak examples", () => {
    const leaks = [
      {
        slug: "varanasi-udhna-special-05115-cantt-nov20-2026",
        title: "Varanasi to Udhna special: Cantt boarding is November 20 at 1:30 am",
        category: "Varanasi",
      },
      {
        slug: "gurugram-ardee-city-flyover-underpass-plan-november-18",
        title: "Gurugram Ardee City flyover and underpass plan: Rs 225 crore",
        category: "Gurugram",
      },
      {
        slug: "varanasi-shaheed-udyan-sonia-pond-deadlines-nov16-2026",
        title: "Varanasi sets December deadlines for Shaheed Udyan and Sonia pond",
        category: "Varanasi",
      },
    ];
    const nov20 = new Date("2026-11-20T06:30:00Z");
    for (const story of leaks) {
      assert.equal(isHardNewsStory(story), true, JSON.stringify(story));
      assert.equal(isPartnerEligibleStory(story), false, JSON.stringify(story));
      assert.equal(partnerRashifalFor(story).show, false, JSON.stringify(story));
      assert.equal(canShowSponsoredEndUnit(story, { now: nov20 }), false, JSON.stringify(story));
      assert.equal(showDevDeepawaliVaranasiPartner(story, nov20), false, JSON.stringify(story));
      assert.equal(upcomingVratForStory(story, nov20), null, JSON.stringify(story));
    }
  });

  it("still shows partner units on genuine festival and temple stories", () => {
    const keep = [
      { title: "Dev Deepawali 2026 Varanasi: ghat guide, boat booking and timings", category: "Varanasi" },
      { title: "Kartik Purnima 2026 snan muhurat and puja vidhi", category: "Lifestyle" },
      { title: "Kashi Vishwanath darshan guide: entry gates and timings", category: "Varanasi" },
      { title: "December 2026 vrat and tyohar list", slug: "december-2026-vrat-tyohar", category: "Astrology" },
      { title: "Ekadashi vrat November 2026: date and parana time", category: "Religion" },
    ];
    for (const story of keep) {
      assert.equal(isHardNewsStory(story), false, JSON.stringify(story));
      assert.equal(isPartnerEligibleStory(story), true, JSON.stringify(story));
      assert.equal(partnerRashifalFor(story).show, true, JSON.stringify(story));
    }
  });
});

describe("partner URL builder", () => {
  it("builds full UTMs for every placement", () => {
    const end = new URL(partnerHref({ path: "/rashifal/", medium: "widget", campaign: "partner_evergreen", slug: "x-y" }));
    assert.equal(end.origin + end.pathname, "https://pocketjyotish.in/rashifal/");
    assert.equal(end.searchParams.get("utm_source"), "dalimss_news");
    assert.equal(end.searchParams.get("utm_medium"), "widget");
    assert.equal(end.searchParams.get("utm_campaign"), "partner_evergreen");
    assert.equal(end.searchParams.get("utm_content"), "x-y");
    assert.equal(end.searchParams.get("utm_term"), null);
    const inline = new URL(partnerHref({ path: "/kundli/", medium: "inline_card", campaign: "partner_evergreen", slug: "x", variant: "b" }));
    assert.equal(inline.searchParams.get("utm_medium"), "inline_card");
    assert.equal(inline.searchParams.get("utm_term"), "variant_b");
  });
});

describe("inline card A/B test", () => {
  it("ends after 16 Nov 2026 IST", () => {
    assert.equal(PARTNER_INLINE_TEST_UNTIL_IST, "2026-11-16");
    assert.equal(isPartnerInlineTestActive(new Date("2026-11-16T18:29:59.999Z")), true);
    assert.equal(isPartnerInlineTestActive(new Date("2026-11-16T18:30:00Z")), false);
  });

  it("splits deterministically by slug hash", () => {
    assert.equal(slugHash("abc"), slugHash("abc"));
    assert.equal(partnerInlineVariant("mesh-rashifal"), partnerInlineVariant("mesh-rashifal"));
    let b = 0;
    for (let i = 0; i < 2000; i++) if (partnerInlineVariant(`story-${i}`) === "b") b++;
    assert.ok(b > 900 && b < 1100, `b=${b}`);
  });

  const p = (t: string) => ({ type: "element", tagName: "p", properties: {}, children: [{ type: "text", value: t }] });
  const nl = () => ({ type: "text", value: "\n" });
  const run = (n: number, ads: boolean) => {
    const tree: any = { type: "root", children: [] };
    for (let i = 1; i <= n; i++) tree.children.push(p(`P${i}`), nl());
    if (ads) rehypeAdSlots({ after: [3, 7] })()(tree);
    rehypePartnerInlineCard({ enabled: true, after: 3 })()(tree);
    return tree.children
      .filter((c: any) => c.type === "element")
      .map((c: any) => (c.tagName === "p" ? c.children[0].value : c.tagName));
  };

  it("moves the card past an ad slot after paragraph 3", () => {
    const order = run(10, true);
    assert.deepEqual(order.slice(0, 6), ["P1", "P2", "P3", "ad-slot", "P4", "partner-inline-card"]);
    const i = order.indexOf("partner-inline-card");
    assert.notEqual(order[i - 1], "ad-slot");
    assert.notEqual(order[i + 1], "ad-slot");
  });

  it("goes right after paragraph 3 when no ad follows it", () => {
    assert.deepEqual(run(4, true), ["P1", "P2", "P3", "partner-inline-card", "P4"]);
  });

  it("never touches an ad and is never last", () => {
    for (let n = 1; n <= 14; n++) {
      const order = run(n, true);
      const i = order.indexOf("partner-inline-card");
      if (i < 0) continue;
      assert.notEqual(order[i - 1], "ad-slot", `n=${n}`);
      assert.notEqual(order[i + 1], "ad-slot", `n=${n}`);
      assert.ok(i < order.length - 1, `n=${n}`);
    }
    assert.equal(run(3, true).includes("partner-inline-card"), false);
  });

  it("does nothing when disabled", () => {
    const tree: any = { children: [p("a"), p("b"), p("c"), p("d")] };
    rehypePartnerInlineCard({ enabled: false })()(tree);
    assert.equal(tree.children.length, 4);
  });
});

describe("tech/auto end-line test", () => {
  it("lists exactly 20 unique slugs", () => {
    assert.equal(PARTNER_TECH_AUTO_TEST_SLUGS.length, 20);
    assert.equal(new Set(PARTNER_TECH_AUTO_TEST_SLUGS).size, 20);
  });

  it("ends after 16 Nov 2026 IST", () => {
    assert.equal(PARTNER_TECH_AUTO_TEST_UNTIL_IST, "2026-11-16");
    assert.equal(isPartnerTechAutoTestActive(new Date("2026-11-16T18:29:59.999Z")), true);
    assert.equal(isPartnerTechAutoTestActive(new Date("2026-11-16T18:30:00Z")), false);
  });

  it("only listed tech/auto stories qualify", () => {
    const s = { slug: "skoda-kodiaq-150-7", title: "Skoda Kodiaq: 150 kW petrol and 7-speed DSG explained", category: "Automotive" };
    assert.equal(isTechAutoTestStory(s), true);
    assert.equal(showTechAutoPartnerLine(s, new Date("2026-11-10T06:00:00Z")), true);
    assert.equal(showTechAutoPartnerLine(s, new Date("2026-11-16T18:30:00Z")), false);
    assert.equal(isTechAutoTestStory({ slug: "some-other-tech-story", title: "Phone review" }), false);
  });

  it("listed tech/auto stories never get the astrology widget", () => {
    for (const slug of PARTNER_TECH_AUTO_TEST_SLUGS) {
      assert.equal(isPartnerEligibleStory({ slug }), false, slug);
    }
  });
});

describe("Kashi Vishwanath darshan guide", () => {
  const NOV20 = new Date("2026-11-20T06:30:00Z");
  const NOV22 = new Date("2026-11-22T06:30:00Z");
  const NOV24 = new Date("2026-11-24T06:30:00Z");
  const NOV24_LAST = new Date("2026-11-24T18:29:59.999Z");
  const NOV25 = new Date("2026-11-24T18:30:00Z");
  const JUN2027 = new Date("2027-06-15T06:30:00Z");
  const TEMPLE = {
    slug: "kashi-vishwanath-temple-darshan",
    title: "Kashi Vishwanath temple reopens for evening darshan",
    category: "Varanasi",
  };

  it("is an evergreen story guide outside the dated rotation", () => {
    assert.equal(KASHI_VISHWANATH_DARSHAN.id, "kashi_vishwanath_darshan");
    assert.equal(KASHI_VISHWANATH_DARSHAN.path, "/kashi-vishwanath-live-darshan/");
    assert.equal(KASHI_VISHWANATH_DARSHAN.campaign, "kashi_vishwanath_darshan");
    assert.equal(getUpcomingVrat("kashi_vishwanath_darshan")?.path, "/kashi-vishwanath-live-darshan/");
    assert.equal(UPCOMING_VRAT_CTAS.some((c) => c.id === "kashi_vishwanath_darshan"), false);
    assert.equal(KASHI_VISHWANATH_DARSHAN.text.en.endCard, "Kashi Vishwanath live darshan on Pocket Jyotish");
    assert.equal(KASHI_VISHWANATH_DARSHAN.text.en.sidebarTitle, "Kashi Vishwanath darshan");
    assert.equal(KASHI_VISHWANATH_DARSHAN.text.en.sidebarBody, "Watch Kashi Vishwanath live darshan on our partner site.");
    assert.equal(KASHI_VISHWANATH_DARSHAN.text.en.sidebarLink, "Kashi Vishwanath live darshan");
    for (const lang of ["en", "hi"] as const) {
      const blob = Object.values(KASHI_VISHWANATH_DARSHAN.text[lang]).join("\n");
      assert.equal(/\bfree\b|मुफ्त|मुफ़्त|click here/i.test(blob), false, lang);
    }
    for (const medium of ["ad", "sidebar", "widget"] as const) {
      const href = partnerHref({
        path: KASHI_VISHWANATH_DARSHAN.path,
        medium,
        campaign: KASHI_VISHWANATH_DARSHAN.campaign,
        slug: TEMPLE.slug,
      });
      const url = new URL(href);
      assert.equal(url.origin + url.pathname, "https://pocketjyotish.in/kashi-vishwanath-live-darshan/");
      assert.equal(url.searchParams.get("utm_source"), "dalimss_news");
      assert.equal(url.searchParams.get("utm_medium"), medium);
      assert.equal(url.searchParams.get("utm_campaign"), "kashi_vishwanath_darshan");
      assert.equal(url.searchParams.get("utm_content"), TEMPLE.slug);
    }
  });

  it("gives a Kashi Vishwanath temple story the darshan guide", () => {
    for (const story of [
      TEMPLE,
      { title: "Vishwanath temple queue on Monday", category: "India" },
      { title: "Vishwanath dham evening aarti", slug: "city-notes" },
      { title: "Kashi Vishwanath corridor opens", category: "Varanasi" },
      { title: "काशी विश्वनाथ दर्शन", category: "Varanasi" },
      { title: "विश्वनाथ मंदिर में आरती", slug: "evening-aarti" },
      { title: "विश्वनाथ धाम", category: "Religion" },
      { slug: "kashi-vishwanath-corridor-update", title: "Corridor update", category: "Varanasi" },
      { slug: "vishwanath-temple-timings", title: "Morning timings", category: "India" },
    ]) {
      assert.equal(isKashiVishwanathStory(story), true, JSON.stringify(story));
      assert.equal(isPartnerEligibleStory(story), true, JSON.stringify(story));
      for (const now of [NOV20, NOV25, JUN2027]) {
        const guide = upcomingVratForStory(story, now);
        assert.equal(guide?.id, "kashi_vishwanath_darshan", `${JSON.stringify(story)} ${now.toISOString()}`);
        assert.equal(guide?.path, "/kashi-vishwanath-live-darshan/");
        assert.equal(guide?.campaign, "kashi_vishwanath_darshan");
      }
    }
  });

  it("keeps Dev Deepawali when a Kashi Vishwanath story also matches it", () => {
    const both = {
      slug: "kashi-vishwanath-dev-deepawali-2026",
      title: "Kashi Vishwanath Dev Deepawali 2026",
      category: "Varanasi",
    };
    for (const now of [NOV20, NOV22, NOV24, NOV24_LAST]) {
      assert.equal(upcomingVratForStory(both, now)?.id, "dev_deepawali_2026", now.toISOString());
      assert.equal(upcomingVratForStory(both, now)?.path, "/dev-deepawali-2026/");
    }
    assert.equal(upcomingVratForStory(both, NOV25)?.id, "kashi_vishwanath_darshan");
    const tulsi = {
      slug: "kashi-vishwanath-tulsi-vivah",
      title: "Tulsi Vivah at Kashi Vishwanath",
      category: "Lifestyle",
    };
    assert.equal(upcomingVratForStory(tulsi, NOV20)?.id, "tulsi_vivah_2026");
    const bhishma = {
      slug: "kashi-vishwanath-bhishma-panchak",
      title: "Bhishma Panchak at the Vishwanath temple",
      category: "Lifestyle",
    };
    assert.equal(upcomingVratForStory(bhishma, NOV20)?.id, "bhishma_panchak_2026");
  });

  it("blocks the darshan guide on sensitive and hard-news stories", () => {
    for (const story of [
      { slug: "kashi-vishwanath-stampede", title: "Kashi Vishwanath stampede", category: "Varanasi" },
      { slug: "kashi-vishwanath-death", title: "Death at Kashi Vishwanath temple", category: "Varanasi" },
      { title: "काशी विश्वनाथ में भगदड़", category: "Varanasi" },
      { title: "Police probe at Kashi Vishwanath", category: "Varanasi" },
    ]) {
      assert.equal(isSensitiveStory(story) || isHardNewsStory(story), true, JSON.stringify(story));
      assert.equal(isPartnerEligibleStory(story), false, JSON.stringify(story));
      assert.equal(upcomingVratForStory(story, NOV20), null, JSON.stringify(story));
      assert.equal(upcomingVratForStory(story, JUN2027), null, JSON.stringify(story));
    }
  });

  it("does not give the darshan guide to a generic Varanasi ghat story", () => {
    const ghat = {
      slug: "dashashwamedh-ghat-aarti-timings",
      title: "Dashashwamedh Ghat aarti timings in Varanasi",
      category: "Lifestyle",
    };
    const kashiGhat = {
      slug: "kashi-ghat-aarti-guide",
      title: "Kashi ghat aarti timings",
      category: "Varanasi",
    };
    const bare = { slug: "vishwanath-singh-profile", title: "Vishwanath Singh on the ghat plan", category: "Varanasi" };
    const taggedOnly = { slug: "city-traffic-plan", title: "Traffic plan for the old city", category: "Varanasi", tags: "Kashi Vishwanath" };
    for (const story of [ghat, kashiGhat, bare, taggedOnly]) {
      assert.equal(isKashiVishwanathStory(story), false, JSON.stringify(story));
      assert.notEqual(upcomingVratForStory(story, NOV20)?.id, "kashi_vishwanath_darshan", JSON.stringify(story));
      assert.notEqual(upcomingVratForStory(story, JUN2027)?.id, "kashi_vishwanath_darshan", JSON.stringify(story));
    }
    assert.equal(upcomingVratForStory(ghat, NOV20)?.id, "tulsi_vivah_2026");
  });
});

describe("Aaj ka Panchang for Varanasi", () => {
  const NOV22 = new Date("2026-11-22T06:30:00Z");
  const DEC10 = new Date("2026-12-10T06:30:00Z");
  const DEC26 = new Date("2026-12-26T06:30:00Z");
  const JUN2027 = new Date("2027-06-15T06:30:00Z");
  const GHAT = {
    slug: "dashashwamedh-ghat-aarti-timings",
    title: "Dashashwamedh Ghat aarti timings in Varanasi",
    category: "Varanasi",
  };

  it("matches a Varanasi ghat aarti story and not a crime story", () => {
    assert.equal(AAJ_KA_PANCHANG.id, "aaj_ka_panchang");
    assert.equal(AAJ_KA_PANCHANG.path, "/aaj-ka-panchang/varanasi/");
    assert.equal(AAJ_KA_PANCHANG.campaign, "aaj_ka_panchang");
    assert.equal(UPCOMING_VRAT_CTAS.some((c) => c.id === "aaj_ka_panchang"), false);
    assert.equal(getUpcomingVrat("aaj_ka_panchang")?.path, "/aaj-ka-panchang/varanasi/");
    assert.equal(isAajKaPanchangStory(GHAT), true);
    assert.equal(isPartnerEligibleStory(GHAT), true);
    assert.equal(upcomingVratForStory(GHAT, JUN2027)?.id, "aaj_ka_panchang");
    assert.equal(upcomingVratForStory(GHAT, DEC26)?.id, "aaj_ka_panchang");
    assert.equal(upcomingVratForStory(GHAT, DEC26)?.path, "/aaj-ka-panchang/varanasi/");
    const hindi = { slug: "kashi-ghat-aarti", title: "वाराणसी के घाट पर आरती", category: "Varanasi" };
    assert.equal(isAajKaPanchangStory(hindi), true);
    assert.equal(upcomingVratForStory(hindi, JUN2027)?.id, "aaj_ka_panchang");
    assert.equal(isAajKaPanchangStory({ slug: "banaras-mahotsav-2026", title: "Banaras mahotsav opens", category: "Varanasi" }), true);
    assert.equal(isAajKaPanchangStory({ title: "Haridwar ghat aarti timings", category: "India" }), false);
    assert.equal(isAajKaPanchangStory({ title: "Varanasi traffic plan", slug: "varanasi-traffic-plan", category: "Varanasi" }), false);
    assert.equal(isAajKaPanchangStory({
      slug: "city-notes",
      title: "Old city notes",
      category: "India",
      tags: "Varanasi, ghat, aarti",
    }), false);
    const crime = {
      slug: "varanasi-ghat-murder",
      title: "Murder at Dashashwamedh Ghat in Varanasi",
      category: "Crime",
    };
    assert.equal(isSensitiveStory(crime), true);
    assert.equal(isAajKaPanchangStory(crime), false);
    assert.equal(isPartnerEligibleStory(crime), false);
    assert.equal(upcomingVratForStory(crime, JUN2027), null);
    assert.equal(upcomingVratForStory(crime, NOV22), null);
  });

  it("loses to named festival guides and to Kashi Vishwanath darshan", () => {
    assert.equal(upcomingVratForStory(GHAT, NOV22)?.id, "dev_deepawali_2026");
    const namedDev = {
      slug: "dev-deepawali-dashashwamedh-ghat",
      title: "Dev Deepawali at Dashashwamedh Ghat in Varanasi",
      category: "Varanasi",
    };
    assert.equal(upcomingVratForStory(namedDev, NOV22)?.id, "dev_deepawali_2026");
    const vishwanath = {
      slug: "kashi-vishwanath-ghat-aarti",
      title: "Kashi Vishwanath ghat aarti in Varanasi",
      category: "Varanasi",
    };
    assert.equal(isAajKaPanchangStory(vishwanath), true);
    assert.equal(isKashiVishwanathStory(vishwanath), true);
    assert.equal(upcomingVratForStory(vishwanath, JUN2027)?.id, "kashi_vishwanath_darshan");
    assert.notEqual(upcomingVratForStory(vishwanath, JUN2027)?.id, "aaj_ka_panchang");
    assert.equal(upcomingVratForStory({
      slug: "guru-nanak-varanasi-ghat",
      title: "Guru Nanak Jayanti gathering at a Varanasi ghat",
      category: "Varanasi",
    }, new Date("2026-11-20T06:30:00Z"))?.id, "guru_nanak_jayanti_2026");
    assert.equal(upcomingVratForStory({
      slug: "kaal-bhairav-varanasi-temple",
      title: "Kaal Bhairav Jayanti at a Varanasi temple",
      category: "Varanasi",
    }, new Date("2026-11-30T06:30:00Z"))?.id, "kaal_bhairav_2026");
    assert.equal(upcomingVratForStory({
      slug: "margashirsha-varanasi-temple",
      title: "Margashirsha month rituals at a Varanasi temple",
      category: "Varanasi",
    }, DEC10)?.id, "margashirsha_month_2026");
    assert.equal(upcomingVratForStory({
      slug: "december-vrat-varanasi-ghat",
      title: "December vrat list and Varanasi ghat aarti",
      category: "Varanasi",
    }, DEC26)?.id, "december_vrat_2026");
  });

  it("uses the approved copy and the slot medium on each partner unit", () => {
    assert.equal(AAJ_KA_PANCHANG.text.en.endCard, "Aaj ka Panchang for Varanasi: tithi, nakshatra and today's muhurat timings");
    assert.equal(AAJ_KA_PANCHANG.text.hi.endCard, "वाराणसी का आज का पंचांग: तिथि, नक्षत्र और शुभ मुहूर्त");
    for (const lang of ["en", "hi"] as const) {
      const blob = Object.values(AAJ_KA_PANCHANG.text[lang]).join("\n");
      assert.equal(blob.includes("—"), false, lang);
      assert.equal(blob.includes("–"), false, lang);
      assert.equal(/\bfree\b|मुफ्त|मुफ़्त|click now|click here/i.test(blob), false, lang);
    }
    const slots = [
      ["ad", renderHtml(React.createElement(PartnerEndCard, { lang: "en", slug: GHAT.slug, upcomingVratId: "aaj_ka_panchang" }))],
      ["sidebar", renderHtml(React.createElement(PartnerSidebar, { lang: "en", slug: GHAT.slug, upcomingVratId: "aaj_ka_panchang" }))],
      ["widget", renderHtml(React.createElement(PartnerRashifal, { sign: "mesh", lang: "hi", slug: GHAT.slug, upcomingVratId: "aaj_ka_panchang" }))],
    ] as const;
    for (const [medium, markup] of slots) {
      const links = renderHrefs(markup).filter((href) => href.includes("/aaj-ka-panchang/varanasi/"));
      assert.equal(links.length, 1, medium);
      const url = new URL(links[0]);
      assert.equal(url.pathname, "/aaj-ka-panchang/varanasi/");
      assert.equal(url.searchParams.get("utm_source"), "dalimss_news");
      assert.equal(url.searchParams.get("utm_medium"), medium);
      assert.equal(url.searchParams.get("utm_campaign"), "aaj_ka_panchang");
      assert.equal(url.searchParams.get("utm_content"), GHAT.slug);
      assert.match(markup, /rel="sponsored noopener"/);
      assert.ok(markup.includes("Sponsored"));
    }
    const end = slots[0][1];
    const widget = slots[2][1];
    assert.match(end, /height:148px;min-height:148px;max-height:148px/);
    assert.match(widget, /height:64px;min-height:64px;max-height:64px/);
    assert.ok(end.includes("Aaj ka Panchang for Varanasi: tithi, nakshatra and today&#x27;s muhurat timings"));
    assert.ok(widget.includes("वाराणसी का आज का पंचांग: तिथि, नक्षत्र और शुभ मुहूर्त"));
  });
});
