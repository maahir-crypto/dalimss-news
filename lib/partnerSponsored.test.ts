import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DEV_DEEPAWALI_PRIORITY_FROM_IST,
  DEV_DEEPAWALI_PRIORITY_UNTIL_IST,
  DEV_DEEPAWALI_UNTIL_IST,
  MARGASHIRSHA_PURNIMA_UNTIL_IST,
  PRADOSH_VRAT_UNTIL_IST,
  SANKASHTI_UNTIL_IST,
  TULSI_VIVAH_UNTIL_IST,
  VAIKUNTHA_VRAT_UNTIL_IST,
  canShowSponsoredEndUnit,
  festivalPartnerCtaFor,
  isHardNewsStory,
  isPartnerEligibleStory,
  isSensitiveStory,
  devDeepawaliOverridesPradosh,
  isVaranasiOrFestivalStory,
  nextUpcomingVrat,
  partnerPageRevalidateSeconds,
  secondsUntilFestivalCtaExpiry,
  sponsoredEndPlacement,
  upcomingVratForStory,
} from "./partnerRashifal";
import {
  PartnerEndCard,
  PartnerRashifal,
  PartnerSidebar,
  PartnerSponsoredUnit,
  SPONSORED_END_UNIT_HEIGHT_PX,
  SPONSORED_HARD_NEWS_COPY,
  VRAT_END_CARD_HEIGHT_PX,
  WIDGET_VRAT_ROW_HEIGHT_PX,
} from "../components/PartnerRashifal";

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const hrefs = (s: string) => Array.from(s.matchAll(/href="([^"]+)"/g)).map((m) => m[1].replace(/&amp;/g, "&"));
const params = (u: string) => Object.fromEntries(new URL(u).searchParams.entries());

const RASHIFAL = { slug: "mesh-rashifal-today", title: "Mesh rashifal today: love and career", category: "Astrology" };
const POLITICS = { slug: "bjp-congress-diwali-holiday", title: "BJP and Congress clash over Diwali holiday", category: "Politics" };
const METRO = { slug: "gurugram-metro-extension", title: "Gurugram metro extension gets approval", category: "Gurugram" };
const TECH = { slug: "skoda-kodiaq-150-7", title: "Skoda Kodiaq: 150 kW petrol and 7-speed DSG explained", category: "Automotive" };
const GN = {
  slug: "guru-nanak-jayanti-24-november-2026-date-holiday-guide",
  title: "Guru Nanak Jayanti on 24 November 2026: date, observances and holiday checks",
  category: "Lifestyle",
};
const DD = {
  slug: "dev-deepawali-24-november-2026-varanasi-timings",
  title: "Dev Deepawali on 24 November 2026: Varanasi timings and travel checks",
  category: "Lifestyle",
  tags: "Dev Deepawali, Varanasi, Kartik Purnima",
};

const TULSI_LAST = new Date("2026-11-21T18:29:59.999Z");
const PRADOSH_START = new Date("2026-11-21T18:30:00Z");
const PRADOSH_LAST = new Date("2026-11-22T18:29:59.999Z");
const SANKASHTI_START = new Date("2026-11-22T18:30:00Z");
const SANKASHTI_LAST = new Date("2026-11-27T18:29:59.999Z");
const MG_START = new Date("2026-11-27T18:30:00Z");
const MG_LAST = new Date("2026-12-24T18:29:59.999Z");
const AFTER_ALL = new Date("2026-12-24T18:30:00Z");

describe("sensitive stories get no Pocket Jyotish unit", () => {
  const sensitive = [
    { title: "Three dead after building collapse in Varanasi" },
    { title: "Bus accident on the highway kills 4" },
    { title: "Family tragedy after the flood" },
    { title: "Man dies by suicide", category: "Crime" },
    { title: "Terror attack condemned" },
    { title: "Communal tension in the old city" },
    { title: "Stampede at temple during Kartik Purnima snan kills 2" },
    { title: "Communal tension during Kartik Purnima puja" },
    { title: "युवक की मौत, परिजनों में शोक" },
    { title: "आत्महत्या के मामले में केस" },
    { title: "सांप्रदायिक तनाव के बाद धारा 144" },
    { title: "हादसे में दो घायल" },
    { title: "आग लग गई मंदिर के पास" },
    { title: "Weekly horoscope", category: "Crime" },
    { title: "City brief", category: "Disaster" },
    { title: "City brief", category: "आतंक" },
  ];

  for (const story of sensitive) {
    it(`skips ${story.title} / ${story.category ?? "no category"}`, () => {
      assert.equal(isSensitiveStory(story), true, JSON.stringify(story));
      assert.equal(isHardNewsStory(story), true);
      assert.equal(isPartnerEligibleStory(story), false);
      assert.equal(canShowSponsoredEndUnit(story), false);
      assert.equal(upcomingVratForStory(story, TULSI_LAST), null);
    });
  }

  it("does not treat आगे or अमृतसर as death or fire", () => {
    const ahead = { title: "आगे का राशिफल: मेष राशि", slug: "aage-ka-rashifal" };
    assert.equal(isSensitiveStory(ahead), false);
    assert.equal(isPartnerEligibleStory(ahead), true);
    const amritsar = { title: "अमृतसर में गुरु नानक जयंती की तैयारी", slug: "amritsar-preparations" };
    assert.equal(isSensitiveStory(amritsar), false);
  });
});

describe("hard news is end-only and other stories keep one end unit", () => {
  it("politics is hard news, not sensitive, and gets the end unit only", () => {
    assert.equal(isHardNewsStory(POLITICS), true);
    assert.equal(isSensitiveStory(POLITICS), false);
    assert.equal(isPartnerEligibleStory(POLITICS), false);
    assert.equal(canShowSponsoredEndUnit(POLITICS), true);
    assert.equal(upcomingVratForStory(POLITICS, TULSI_LAST), null);
  });

  it("an ordinary story gets the evergreen end unit and no inline partner card", () => {
    assert.equal(isHardNewsStory(METRO), false);
    assert.equal(isSensitiveStory(METRO), false);
    assert.equal(isPartnerEligibleStory(METRO), false);
    assert.equal(canShowSponsoredEndUnit(METRO), true);
  });

  it("does not add a second end unit on astrology, festival, price or tech lines", () => {
    assert.equal(canShowSponsoredEndUnit(RASHIFAL, { now: TULSI_LAST }), false);
    assert.equal(isPartnerEligibleStory(RASHIFAL), true);
    assert.equal(canShowSponsoredEndUnit(GN, { now: new Date("2026-11-20T06:30:00Z") }), false);
    assert.equal(canShowSponsoredEndUnit(GN, { now: new Date("2026-11-24T18:30:00Z") }), true);
    assert.equal(canShowSponsoredEndUnit(DD, { now: new Date("2026-11-20T06:30:00Z") }), false);
    assert.equal(canShowSponsoredEndUnit(METRO, { hasPriceGuide: true }), false);
    assert.equal(canShowSponsoredEndUnit(TECH, { hasTechAutoLine: true }), false);
    assert.equal(canShowSponsoredEndUnit(TECH, { hasTechAutoLine: false }), true);
  });

  it("places the unit after the body only when editorial copy separates it from the ad", () => {
    assert.equal(sponsoredEndPlacement({ show: false, separatedFromBelowAd: true, hasLatestStories: true }), "none");
    assert.equal(sponsoredEndPlacement({ show: true, separatedFromBelowAd: true, hasLatestStories: false }), "after-body");
    assert.equal(sponsoredEndPlacement({ show: true, separatedFromBelowAd: false, hasLatestStories: true }), "before-related");
    assert.equal(sponsoredEndPlacement({ show: true, separatedFromBelowAd: false, hasLatestStories: false }), "none");
  });
});

describe("upcoming vrat rotation expires at 00:00 IST", () => {
  it("keeps the approved last days", () => {
    assert.equal(TULSI_VIVAH_UNTIL_IST, "2026-11-21");
    assert.equal(PRADOSH_VRAT_UNTIL_IST, "2026-11-22");
    assert.equal(VAIKUNTHA_VRAT_UNTIL_IST, "2026-11-23");
    assert.equal(DEV_DEEPAWALI_UNTIL_IST, "2026-11-24");
    assert.equal(DEV_DEEPAWALI_PRIORITY_FROM_IST, "2026-11-17");
    assert.equal(DEV_DEEPAWALI_PRIORITY_UNTIL_IST, "2026-11-24");
    assert.equal(SANKASHTI_UNTIL_IST, "2026-11-27");
    assert.equal(MARGASHIRSHA_PURNIMA_UNTIL_IST, "2026-12-24");
  });

  it("shows only the next live guide, then the evergreen fallback", () => {
    const vaikunthaLast = new Date("2026-11-23T18:29:59.999Z");
    const devStart = new Date("2026-11-23T18:30:00Z");
    const devLast = new Date("2026-11-24T18:29:59.999Z");
    assert.equal(nextUpcomingVrat(TULSI_LAST)?.id, "tulsi_vivah_2026");
    assert.equal(nextUpcomingVrat(PRADOSH_START)?.id, "pradosh_2026");
    assert.equal(nextUpcomingVrat(PRADOSH_LAST)?.id, "pradosh_2026");
    assert.equal(nextUpcomingVrat(SANKASHTI_START)?.id, "vaikuntha_2026");
    assert.equal(nextUpcomingVrat(vaikunthaLast)?.id, "vaikuntha_2026");
    assert.equal(nextUpcomingVrat(devStart)?.id, "dev_deepawali_2026");
    assert.equal(nextUpcomingVrat(devLast)?.id, "dev_deepawali_2026");
    assert.equal(nextUpcomingVrat(SANKASHTI_LAST)?.id, "sankashti_2026");
    assert.equal(nextUpcomingVrat(MG_START)?.id, "mgpurnima_2026");
    assert.equal(nextUpcomingVrat(MG_LAST)?.id, "mgpurnima_2026");
    assert.equal(nextUpcomingVrat(AFTER_ALL), null);
    assert.equal(nextUpcomingVrat(devStart)?.path, "/dev-deepawali-2026/");
    assert.equal(nextUpcomingVrat(devStart)?.campaign, "dev_deepawali_2026");
    assert.equal(nextUpcomingVrat(vaikunthaLast)?.path, "/vaikuntha-chaturdashi-2026/");
    assert.equal(nextUpcomingVrat(vaikunthaLast)?.campaign, "vaikuntha_2026");
    assert.equal(nextUpcomingVrat(new Date("2026-11-24T18:30:00Z"))?.id, "sankashti_2026");
  });

  it("revalidate hits IST midnight and is hourly when the window is longer", () => {
    const tulsi = nextUpcomingVrat(TULSI_LAST)!;
    assert.equal(secondsUntilFestivalCtaExpiry(tulsi, new Date("2026-11-21T18:00:00Z")), 1800);
    assert.equal(secondsUntilFestivalCtaExpiry(tulsi, PRADOSH_START), 1);
    assert.equal(partnerPageRevalidateSeconds([tulsi], new Date("2026-11-21T18:00:00Z")), 1800);
    assert.equal(partnerPageRevalidateSeconds([tulsi], new Date("2026-11-12T06:30:00Z")), 3600);
    assert.equal(partnerPageRevalidateSeconds([null, undefined]), 3600);
    for (const cta of [
      nextUpcomingVrat(PRADOSH_LAST),
      nextUpcomingVrat(SANKASHTI_LAST),
      nextUpcomingVrat(MG_LAST),
    ]) {
      assert.ok(cta);
      const end = new Date(cta.untilIst + "T18:30:00Z");
      assert.equal(secondsUntilFestivalCtaExpiry(cta, new Date(end.getTime() - 1800 * 1000)), 1800);
      assert.equal(secondsUntilFestivalCtaExpiry(cta, end), 1);
    }
  });

  it("eligible stories take the next guide unless a named festival CTA is already showing", () => {
    assert.equal(upcomingVratForStory(RASHIFAL, TULSI_LAST)?.campaign, "tulsi_vivah_2026");
    assert.equal(upcomingVratForStory(RASHIFAL, PRADOSH_START)?.path, "/pradosh-vrat-2026/");
    assert.equal(upcomingVratForStory(RASHIFAL, SANKASHTI_START)?.campaign, "vaikuntha_2026");
    assert.equal(upcomingVratForStory(RASHIFAL, MG_START)?.campaign, "mgpurnima_2026");
    assert.equal(upcomingVratForStory(RASHIFAL, AFTER_ALL), null);
    assert.equal(upcomingVratForStory(DD, new Date("2026-11-20T06:30:00Z")), null);
    assert.equal(upcomingVratForStory(DD, new Date("2026-11-24T18:30:00Z"))?.id, "sankashti_2026");
    const diwali = { slug: "diwali-2026-lakshmi-puja", title: "Diwali 2026 Lakshmi Puja muhurat", category: "Lifestyle" };
    assert.equal(upcomingVratForStory(diwali, new Date("2026-11-06T09:30:00Z")), null);
    assert.equal(upcomingVratForStory(diwali, new Date("2026-11-12T06:30:00Z"))?.id, "tulsi_vivah_2026");
  });
});

describe("sponsored unit and vrat link markup", () => {
  it("reserves 220px, labels Sponsored, and links chat then kundli and rashifal", () => {
    assert.equal(SPONSORED_END_UNIT_HEIGHT_PX, 220);
    for (const lang of ["en", "hi"] as const) {
      for (const tone of ["general", "hard-news"] as const) {
        for (const placement of ["after-body", "before-related"] as const) {
          const markup = html(
            React.createElement(PartnerSponsoredUnit, {
              lang,
              slug: "city-brief",
              tone,
              placement,
            })
          );
          assert.match(markup, /height:220px/);
          assert.match(markup, /min-height:220px/);
          assert.match(markup, /max-height:220px/);
          assert.match(markup, /background-color:#fffbeb/);
          assert.match(markup, /border:2px solid #b45309/);
          assert.ok(markup.includes("Sponsored"));
          if (lang === "hi") assert.ok(markup.includes("प्रायोजित"));
          assert.ok(!/advertisement|ads by/i.test(markup));
          assert.ok(!/<(iframe|img|script|embed|object)\b/i.test(markup));
          assert.ok(!/click here|hurry|don't miss|limited time|today only/i.test(markup));
          assert.ok(!/free-kundli|jyotishi|free call|free ai|free astrologer|free chat/i.test(markup));
          const links = hrefs(markup);
          assert.deepEqual(
            links.map((h) => new URL(h).pathname),
            ["/chat/", "/kundli/", "/rashifal/"]
          );
          for (const link of links) {
            assert.deepEqual(params(link), {
              utm_source: "dalimss_news",
              utm_medium: "ad",
              utm_campaign: "evergreen",
              utm_content: "city-brief",
            });
          }
          const chatText = markup.match(/<a [^>]*\/chat\/[^>]*>[^<]*<\/a>/)?.[0] ?? "";
          assert.match(chatText, /font-bold/);
          assert.ok(!/>\s*Free/i.test(chatText));
          for (const tag of Array.from(markup.matchAll(/<a [^>]*>/g))) {
            assert.ok(tag[0].includes('rel="sponsored noopener"'), tag[0]);
            assert.ok(tag[0].includes('target="_blank"'), tag[0]);
          }
        }
      }
    }
  });

  it("hard-news copy is the neutral sentence and does not name the story", () => {
    const markup = html(
      React.createElement(PartnerSponsoredUnit, {
        lang: "hi",
        slug: "assembly-debate",
        tone: "hard-news",
        placement: "before-related",
      })
    );
    assert.ok(markup.includes(SPONSORED_HARD_NEWS_COPY));
    assert.ok(markup.includes("प्रायोजित"));
    assert.match(markup, /margin-top:48px/);
    assert.equal(
      SPONSORED_HARD_NEWS_COPY,
      "Pocket Jyotish AI Astrologer. 10 questions a day are free. Free kundli and daily rashifal."
    );
    assert.ok(markup.includes(">AI Astrologer<"));
    assert.ok(!/free call|free jyotishi|free astrologer/i.test(markup));
    assert.ok(markup.includes("10 questions a day are free"));
  });

  it("general copy uses the live chat limit and does not call a human astrologer free", () => {
    const en = html(
      React.createElement(PartnerSponsoredUnit, { lang: "en", slug: "city-brief", tone: "general", placement: "after-body" })
    );
    const hi = html(
      React.createElement(PartnerSponsoredUnit, { lang: "hi", slug: "city-brief", tone: "general", placement: "after-body" })
    );
    assert.ok(en.includes("10 questions a day are free"));
    assert.ok(en.includes(">AI Astrologer<"));
    assert.ok(hi.includes("10 सवाल मुफ़्त"));
    assert.ok(hi.includes(">AI ज्योतिषी<"));
    assert.ok(!/free call|free jyotishi|free astrologer|फ्री कॉल|मुफ्त कॉल/i.test(en + hi));
  });

  it("vrat end card, widget and sidebar use ad, widget and sidebar UTMs and sponsored rel", () => {
    const slug = RASHIFAL.slug;
    const end = html(React.createElement(PartnerEndCard, { lang: "en", slug, upcomingVratId: "tulsi_vivah_2026" }));
    const side = html(React.createElement(PartnerSidebar, { lang: "hi", slug, upcomingVratId: "tulsi_vivah_2026" }));
    const widget = html(
      React.createElement(PartnerRashifal, { sign: "mesh", lang: "en", slug, upcomingVratId: "tulsi_vivah_2026" })
    );
    assert.match(end, new RegExp(`height:${VRAT_END_CARD_HEIGHT_PX}px`));
    assert.match(end, /min-height:148px/);
    assert.match(end, /max-height:148px/);
    assert.ok(end.includes("Sponsored"));
    assert.ok(end.includes("Tulsi Vivah 2026 guide"));
    assert.ok(!end.includes("/rashifal/") && !end.includes("/milan/"));
    assert.deepEqual(params(hrefs(end)[0]), {
      utm_source: "dalimss_news",
      utm_medium: "ad",
      utm_campaign: "tulsi_vivah_2026",
      utm_content: slug,
    });
    assert.equal(new URL(hrefs(end)[0]).pathname, "/tulsi-vivah-2026/");

    const sideLinks = hrefs(side);
    const vratSide = sideLinks.find((h) => new URL(h).pathname === "/tulsi-vivah-2026/")!;
    const kundliSide = sideLinks.find((h) => new URL(h).pathname === "/kundli/")!;
    assert.deepEqual(params(vratSide), {
      utm_source: "dalimss_news",
      utm_medium: "sidebar",
      utm_campaign: "tulsi_vivah_2026",
      utm_content: slug,
    });
    assert.equal(params(kundliSide).utm_campaign, "partner_evergreen");
    assert.equal(params(kundliSide).utm_medium, "sidebar");
    assert.ok(side.includes("प्रायोजित"));
    assert.ok(!/free-kundli/i.test(side));

    assert.match(widget, new RegExp(`height:${WIDGET_VRAT_ROW_HEIGHT_PX}px`));
    assert.match(widget, /height:440px/);
    const widgetVrat = hrefs(widget).find((h) => h.includes("tulsi-vivah-2026"))!;
    assert.deepEqual(params(widgetVrat), {
      utm_source: "dalimss_news",
      utm_medium: "widget",
      utm_campaign: "tulsi_vivah_2026",
      utm_content: slug,
    });
    for (const markup of [end, side, widget]) {
      assert.ok(!/advertisement|ads by|click here/i.test(markup));
      for (const tag of Array.from(markup.matchAll(/<a [^>]*>/g))) {
        assert.ok(tag[0].includes('rel="sponsored noopener"'), tag[0]);
        assert.ok(tag[0].includes('target="_blank"'));
      }
    }
  });

  it("a named festival CTA still wins, and expiry falls back to evergreen links", () => {
    const both = html(
      React.createElement(PartnerEndCard, {
        lang: "en",
        slug: "s",
        festivalCtaId: "govardhan_2026",
        upcomingVratId: "tulsi_vivah_2026",
      })
    );
    assert.ok(both.includes("/govardhan-puja-2026/"));
    assert.ok(!both.includes("tulsi-vivah-2026"));
    assert.ok(both.includes("Partner"));
    const expired = html(React.createElement(PartnerEndCard, { lang: "en", slug: "s", upcomingVratId: null }));
    assert.ok(expired.includes("/rashifal/") && expired.includes("/milan/"));
    assert.ok(!expired.includes("tulsi-vivah-2026"));
  });

  it("never links to /free-kundli/", () => {
    const files = [
      new URL("./partnerRashifal.ts", import.meta.url),
      new URL("../components/PartnerRashifal.tsx", import.meta.url),
      new URL("../pages/articles/[slug].tsx", import.meta.url),
    ];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      assert.equal(src.includes("free-kundli"), false, String(file));
    }
  });
});

describe("Vaikuntha and Dev Deepawali windows and priority", () => {
  const NOV16_LAST = new Date("2026-11-16T18:29:59.999Z");
  const NOV17_START = new Date("2026-11-16T18:30:00Z");
  const NOV17 = new Date("2026-11-17T06:30:00Z");
  const NOV22 = new Date("2026-11-22T06:30:00Z");
  const NOV23_LAST = new Date("2026-11-23T18:29:59.999Z");
  const NOV24_START = new Date("2026-11-23T18:30:00Z");
  const NOV24 = new Date("2026-11-24T06:30:00Z");
  const NOV24_LAST = new Date("2026-11-24T18:29:59.999Z");
  const NOV25_START = new Date("2026-11-24T18:30:00Z");
  const TULSI = { slug: "tulsi-vivah-2026-muhurat", title: "Tulsi Vivah 2026 muhurat", category: "Lifestyle" };
  const VARANASI = {
    slug: "dashashwamedh-ghat-aarti-timings",
    title: "Dashashwamedh Ghat aarti timings in Varanasi",
    category: "Lifestyle",
    tags: "Varanasi, aarti, guide",
  };
  const OTHER_DEV = {
    slug: "dev-deepawali-2026-kashi-ghat-guide",
    title: "Dev Deepawali 2026 ghat guide for Varanasi",
    category: "Lifestyle",
    tags: "Dev Deepawali, Varanasi",
  };

  it("tells Varanasi and festival stories apart from a plain rashifal", () => {
    assert.equal(isVaranasiOrFestivalStory(RASHIFAL), false);
    assert.equal(isVaranasiOrFestivalStory(TULSI), true);
    assert.equal(isVaranasiOrFestivalStory(VARANASI), true);
    assert.equal(isVaranasiOrFestivalStory(OTHER_DEV), true);
    assert.equal(isVaranasiOrFestivalStory(METRO), false);
  });

  it("Dev Deepawali replaces Pradosh only from 17 Nov through 24 Nov IST", () => {
    assert.equal(devDeepawaliOverridesPradosh(TULSI, NOV16_LAST), false);
    assert.equal(devDeepawaliOverridesPradosh(TULSI, NOV17_START), true);
    assert.equal(devDeepawaliOverridesPradosh(VARANASI, NOV22), true);
    assert.equal(devDeepawaliOverridesPradosh(RASHIFAL, NOV22), false);
    assert.equal(devDeepawaliOverridesPradosh(TULSI, NOV24_LAST), true);
    assert.equal(devDeepawaliOverridesPradosh(TULSI, NOV25_START), false);
  });

  it("keeps Tulsi through 21 Nov, then swaps only Pradosh on Varanasi and festival stories", () => {
    assert.equal(upcomingVratForStory(TULSI, NOV17)?.id, "tulsi_vivah_2026");
    assert.equal(upcomingVratForStory(VARANASI, NOV17)?.id, "tulsi_vivah_2026");
    assert.equal(upcomingVratForStory(RASHIFAL, NOV22)?.id, "pradosh_2026");
    assert.equal(upcomingVratForStory(RASHIFAL, NOV22)?.path, "/pradosh-vrat-2026/");
    assert.equal(upcomingVratForStory(TULSI, NOV22)?.id, "dev_deepawali_2026");
    assert.equal(upcomingVratForStory(VARANASI, NOV22)?.path, "/dev-deepawali-2026/");
    assert.equal(upcomingVratForStory(VARANASI, NOV22)?.campaign, "dev_deepawali_2026");
    assert.equal(upcomingVratForStory(OTHER_DEV, NOV22)?.id, "dev_deepawali_2026");
  });

  it("shows Vaikuntha through 23 Nov IST and Dev Deepawali through 24 Nov IST", () => {
    assert.equal(nextUpcomingVrat(NOV23_LAST)?.id, "vaikuntha_2026");
    assert.equal(upcomingVratForStory(RASHIFAL, NOV23_LAST)?.path, "/vaikuntha-chaturdashi-2026/");
    assert.equal(upcomingVratForStory(VARANASI, NOV23_LAST)?.id, "vaikuntha_2026");
    assert.equal(nextUpcomingVrat(NOV24_START)?.id, "dev_deepawali_2026");
    assert.equal(upcomingVratForStory(RASHIFAL, NOV24)?.id, "dev_deepawali_2026");
    assert.equal(upcomingVratForStory(VARANASI, NOV24_LAST)?.id, "dev_deepawali_2026");
    assert.equal(nextUpcomingVrat(NOV25_START)?.id, "sankashti_2026");
    assert.equal(upcomingVratForStory(RASHIFAL, NOV25_START)?.id, "sankashti_2026");
  });

  it("revalidate follows the guide that is actually showing", () => {
    const dev = upcomingVratForStory(VARANASI, NOV22)!;
    assert.equal(dev.untilIst, "2026-11-24");
    assert.equal(partnerPageRevalidateSeconds([dev], NOV22), 3600);
    assert.equal(secondsUntilFestivalCtaExpiry(dev, new Date("2026-11-24T18:00:00Z")), 1800);
    assert.equal(secondsUntilFestivalCtaExpiry(dev, NOV25_START), 1);
    const vaikuntha = upcomingVratForStory(RASHIFAL, NOV23_LAST)!;
    assert.equal(vaikuntha.untilIst, "2026-11-23");
    assert.equal(secondsUntilFestivalCtaExpiry(vaikuntha, new Date("2026-11-23T18:00:00Z")), 1800);
    assert.equal(secondsUntilFestivalCtaExpiry(vaikuntha, NOV24_START), 1);
    assert.equal(partnerPageRevalidateSeconds([vaikuntha], new Date("2026-11-23T18:00:00Z")), 1800);
  });

  it("keeps the exact-slug Vaikuntha links-only CTA and does not add a second unit", () => {
    for (const now of [NOV17, NOV22, NOV24, NOV24_LAST]) {
      assert.equal(upcomingVratForStory(DD, now), null, now.toISOString());
      assert.equal(canShowSponsoredEndUnit(DD, { now }), false);
      const cta = festivalPartnerCtaFor(DD, now);
      assert.equal(cta?.id, "vaikuntha_2026");
      assert.equal(cta?.linksOnly, true);
      assert.equal(cta?.path, "/vaikuntha-chaturdashi-2026/");
      assert.equal(cta?.untilIst, "2026-11-24");
      const end = html(
        React.createElement(PartnerEndCard, {
          lang: "en",
          slug: DD.slug,
          festivalCtaId: cta!.id,
          upcomingVratId: "dev_deepawali_2026",
        })
      );
      const links = hrefs(end);
      assert.equal(links.length, 1);
      assert.equal(new URL(links[0]).pathname, "/vaikuntha-chaturdashi-2026/");
      assert.equal(params(links[0]).utm_campaign, "vaikuntha_2026");
      assert.equal(params(links[0]).utm_content, DD.slug);
      assert.ok(!end.includes("dev-deepawali-2026"));
      assert.ok(!/\bfree\b/i.test(end));
    }
    assert.equal(festivalPartnerCtaFor(DD, NOV25_START), null);
    assert.equal(upcomingVratForStory(DD, NOV25_START)?.id, "sankashti_2026");
  });

  it("vrat guide cards are not called free and a story has one end unit", () => {
    const card = html(
      React.createElement(PartnerEndCard, { lang: "en", slug: "s", upcomingVratId: "dev_deepawali_2026" })
    );
    assert.ok(card.includes("Dev Deepawali 2026 guide"));
    assert.ok(card.includes("Sponsored"));
    assert.ok(!/\bfree\b/i.test(card));
    assert.equal(hrefs(card).length, 1);
    for (const story of [RASHIFAL, TULSI, VARANASI, OTHER_DEV, DD, METRO, POLITICS]) {
      for (const now of [NOV17, NOV22, NOV24, NOV25_START, AFTER_ALL]) {
        assert.equal(Boolean(canShowSponsoredEndUnit(story, { now }) && upcomingVratForStory(story, now)), false);
      }
    }
  });
});

describe("article template keeps the house ad away from AdSense", () => {
  const src = readFileSync(new URL("../pages/articles/[slug].tsx", import.meta.url), "utf8");

  it("does not move the in-article or below-article AdSense slots", () => {
    assert.ok(src.includes("rehypeAdSlots({ after: [3, 7] })"));
    assert.ok(src.includes("NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE_1"));
    assert.ok(src.includes("NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE_2"));
    assert.ok(src.includes("NEXT_PUBLIC_ADSENSE_SLOT_BELOW_ARTICLE"));
    assert.ok(src.includes('name="below-article"'));
    const bodyClose = src.indexOf("</ReactMarkdown>");
    const below = src.indexOf('name="below-article"');
    assert.ok(src.indexOf("NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE_1") < bodyClose);
    assert.ok(below > bodyClose);
  });

  it("puts the sponsored unit after the body or before related, never beside an ad slot", () => {
    const bodyClose = src.lastIndexOf("</ReactMarkdown>");
    const afterBody = src.indexOf('placement="after-body"');
    const author = src.indexOf("<AuthorBox");
    const below = src.indexOf('name="below-article"');
    const latest = src.indexOf("<LatestStories");
    const beforeRelated = src.indexOf('placement="before-related"');
    const related = src.indexOf("<RelatedArticles");
    assert.ok(bodyClose < afterBody && afterBody < author && author < below);
    assert.ok(below < latest && latest < beforeRelated && beforeRelated < related);
    assert.ok(!src.slice(bodyClose, afterBody).includes("<AdSlot"));
    assert.ok(!src.slice(latest, related).includes("<AdSlot"));
    assert.ok(src.includes("const showPartnerPlacements = partner.show && !linksOnlyCta;"));
    assert.ok(src.includes("const inlineTestOn = showPartnerPlacements &&"));
    assert.equal(src.split("<PartnerInlineCard").length - 1, 1);
    assert.equal(src.split("<PartnerSponsoredUnit").length - 1, 2);
    assert.equal(src.split('placement="after-body"').length - 1, 1);
    assert.equal(src.split('placement="before-related"').length - 1, 1);
  });
});
