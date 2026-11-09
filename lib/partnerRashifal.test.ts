import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DIWALI_PARTNER_CTA_UNTIL_IST,
  diwaliPartnerHref,
  isDiwaliFestivalStory,
  isDiwaliPartnerCtaActive,
  istCalendarDate,
  partnerRashifalFor,
  useDiwaliPartnerCta,
  isHardNewsStory,
  isPartnerEligibleStory,
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
import { rehypeAdSlots } from "./rehypeAdSlots";

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
  });

  it("partnerRashifalFor uses the same rule", () => {
    assert.equal(partnerRashifalFor({ title: "Two youths drown at Assi Ghat" }).show, false);
    assert.equal(partnerRashifalFor({ title: "Tula rashifal today" }).show, true);
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
