import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { pickBreadcrumbCategory } from "./categories";
import {
  canShowSponsoredEndUnit,
  devDeepawaliPartnerSlot,
  devDeepawaliVaranasiHref,
  devDeepawaliVaranasiWindows,
  DEV_DEEPAWALI_GUIDE_SLUG,
  DEV_DEEPAWALI_VARANASI_FROM_IST,
  DEV_DEEPAWALI_VARANASI_UNTIL_IST,
  festivalPartnerCtaFor,
  hasDevDeepawaliGuide,
  isHardNewsStory,
  isSensitiveStory,
  isVaranasiSectionStory,
  partnerPageRevalidateSeconds,
  showDevDeepawaliVaranasiPartner,
  slugHash,
  sponsoredEndModeForStory,
  upcomingVratForStory,
} from "./partnerRashifal";
import {
  DEV_DEEPAWALI_VARANASI_COPY,
  DEV_DEEPAWALI_VARANASI_LINE_HEIGHT_PX,
  PartnerDevDeepawaliLine,
  PartnerEndCard,
} from "../components/PartnerRashifal";

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const hrefs = (s: string) => Array.from(s.matchAll(/href="([^"]+)"/g)).map((m) => m[1].replace(/&amp;/g, "&"));
const params = (u: string) => Object.fromEntries(new URL(u).searchParams.entries());

const VARANASI = {
  slug: "varanasi-ghats-cleaned",
  title: "Varanasi ghats cleaned before the weekend",
  category: "Varanasi",
};
const GURUGRAM = {
  slug: "gurugram-metro-extension",
  title: "Gurugram metro extension gets approval",
  category: "Gurugram",
};
const SENSITIVE = {
  slug: "varanasi-building-collapse",
  title: "Three dead after building collapse in Varanasi",
  category: "Varanasi",
};
const GUIDE = {
  slug: "dashashwamedh-ghat-aarti-timings",
  title: "Dashashwamedh Ghat aarti timings in Varanasi",
  category: "Varanasi",
  tags: "Varanasi, aarti, guide, timings",
};
const EXACT = {
  slug: DEV_DEEPAWALI_GUIDE_SLUG,
  title: "Dev Deepawali on 24 November 2026: Varanasi timings and travel checks",
  category: "Lifestyle",
  tags: "Dev Deepawali, Varanasi, Kartik Purnima",
};

// IST = UTC+5:30
const NOV19_2359 = new Date("2026-11-19T18:29:00Z");
const NOV19_LAST = new Date("2026-11-19T18:29:59.999Z");
const NOV20_0000 = new Date("2026-11-19T18:30:00Z");
const NOV20_NOON = new Date("2026-11-20T06:30:00Z");
const NOV21_0000 = new Date("2026-11-20T18:30:00Z");
const NOV22_NOON = new Date("2026-11-22T06:30:00Z");
const NOV24_2359 = new Date("2026-11-24T18:29:00Z");
const NOV24_LAST = new Date("2026-11-24T18:29:59.999Z");
const NOV25_0000 = new Date("2026-11-24T18:30:00Z");

describe("Dev Deepawali Varanasi partner window", () => {
  it("keeps the approved IST dates", () => {
    assert.equal(DEV_DEEPAWALI_VARANASI_FROM_IST, "2026-11-20");
    assert.equal(DEV_DEEPAWALI_VARANASI_UNTIL_IST, "2026-11-24");
  });

  it("is off at 19 Nov 23:59 IST and on at 20 Nov 00:00 IST", () => {
    assert.equal(showDevDeepawaliVaranasiPartner(VARANASI, NOV19_2359), false);
    assert.equal(showDevDeepawaliVaranasiPartner(VARANASI, NOV19_LAST), false);
    assert.equal(showDevDeepawaliVaranasiPartner(VARANASI, NOV20_0000), true);
  });

  it("is on at 24 Nov 23:59 IST and off at 25 Nov 00:00 IST", () => {
    assert.equal(showDevDeepawaliVaranasiPartner(VARANASI, NOV24_2359), true);
    assert.equal(showDevDeepawaliVaranasiPartner(VARANASI, NOV24_LAST), true);
    assert.equal(showDevDeepawaliVaranasiPartner(VARANASI, NOV25_0000), false);
  });

  it("revalidates a Varanasi story at 00:00 IST on 20 Nov and on 25 Nov", () => {
    const late19 = new Date("2026-11-19T18:00:00Z");
    const late24 = new Date("2026-11-24T18:00:00Z");
    assert.deepEqual(devDeepawaliVaranasiWindows(VARANASI, late19), [{ untilIst: "2026-11-19" }]);
    assert.equal(partnerPageRevalidateSeconds(devDeepawaliVaranasiWindows(VARANASI, late19), late19), 1800);
    assert.equal(partnerPageRevalidateSeconds(devDeepawaliVaranasiWindows(VARANASI, NOV19_2359), NOV19_2359), 60);
    assert.deepEqual(devDeepawaliVaranasiWindows(VARANASI, late24), [{ untilIst: "2026-11-24" }]);
    assert.equal(partnerPageRevalidateSeconds(devDeepawaliVaranasiWindows(VARANASI, late24), late24), 1800);
    assert.equal(partnerPageRevalidateSeconds(devDeepawaliVaranasiWindows(VARANASI, NOV24_2359), NOV24_2359), 60);
    assert.equal(partnerPageRevalidateSeconds(devDeepawaliVaranasiWindows(VARANASI, NOV20_NOON), NOV20_NOON), 3600);
    assert.deepEqual(devDeepawaliVaranasiWindows(VARANASI, NOV25_0000), []);
    assert.deepEqual(devDeepawaliVaranasiWindows(GURUGRAM, late19), []);
    assert.deepEqual(devDeepawaliVaranasiWindows(SENSITIVE, late24), []);
  });
});

describe("Dev Deepawali Varanasi partner audience", () => {
  it("shows on a Varanasi story, including mixed cities the breadcrumb or category data treats as Varanasi", () => {
    assert.equal(isVaranasiSectionStory(VARANASI), true);
    assert.equal(showDevDeepawaliVaranasiPartner(VARANASI, NOV20_NOON), true);
    assert.equal(pickBreadcrumbCategory("Gurugram, Varanasi")?.slug, "varanasi");
    assert.equal(pickBreadcrumbCategory("Varanasi, Gurugram")?.slug, "gurgaon");
    assert.equal(showDevDeepawaliVaranasiPartner({ slug: "mixed-last", title: "City notes", category: "Gurugram, Varanasi" }, NOV20_NOON), true);
    assert.equal(showDevDeepawaliVaranasiPartner({ slug: "mixed-first", title: "City notes", category: "Varanasi, Gurugram" }, NOV20_NOON), true);
    assert.equal(showDevDeepawaliVaranasiPartner({ slug: "kashi-note", title: "City notes", category: "Kashi" }, NOV20_NOON), true);
    assert.equal(showDevDeepawaliVaranasiPartner({ slug: "banaras-note", title: "City notes", category: "Banaras" }, NOV20_NOON), true);
    assert.equal(isVaranasiSectionStory({ category: "General News" }), true);
  });

  it("stays off a Gurugram story, even when the title mentions Varanasi", () => {
    assert.equal(isVaranasiSectionStory(GURUGRAM), false);
    assert.equal(showDevDeepawaliVaranasiPartner(GURUGRAM, NOV20_NOON), false);
    assert.equal(showDevDeepawaliVaranasiPartner(GURUGRAM, NOV24_LAST), false);
    const visit = {
      slug: "gurugram-delegation-visits-varanasi",
      title: "Gurugram delegation visits Varanasi",
      category: "Gurugram",
    };
    assert.equal(isVaranasiSectionStory(visit), false);
    assert.equal(showDevDeepawaliVaranasiPartner(visit, NOV20_NOON), false);
  });

  it("stays off a sensitive Varanasi story", () => {
    assert.equal(isSensitiveStory(SENSITIVE), true);
    assert.equal(showDevDeepawaliVaranasiPartner(SENSITIVE, NOV20_NOON), false);
    assert.equal(showDevDeepawaliVaranasiPartner(SENSITIVE, NOV24_LAST), false);
    assert.equal(
      showDevDeepawaliVaranasiPartner(
        { slug: "varanasi-fire", title: "Fire breaks out in Varanasi", category: "Varanasi" },
        NOV20_NOON
      ),
      false
    );
  });

  it("does not add a second Dev Deepawali link when the guide is already showing", () => {
    assert.equal(upcomingVratForStory(GUIDE, NOV22_NOON)?.id, "dev_deepawali_2026");
    assert.equal(upcomingVratForStory(GUIDE, NOV22_NOON)?.path, "/dev-deepawali-2026/");
    assert.equal(hasDevDeepawaliGuide(GUIDE, NOV22_NOON), true);
    assert.equal(showDevDeepawaliVaranasiPartner(GUIDE, NOV22_NOON), false);
    assert.equal(hasDevDeepawaliGuide(GUIDE, NOV24_LAST), true);
    assert.equal(showDevDeepawaliVaranasiPartner(GUIDE, NOV24_LAST), false);

    assert.equal(EXACT.slug, "dev-deepawali-24-november-2026-varanasi-timings");
    assert.equal(festivalPartnerCtaFor(EXACT, NOV22_NOON)?.id, "vaikuntha_2026");
    assert.equal(festivalPartnerCtaFor(EXACT, NOV22_NOON)?.linksOnly, true);
    assert.equal(hasDevDeepawaliGuide(EXACT, NOV22_NOON), true);
    assert.equal(showDevDeepawaliVaranasiPartner(EXACT, NOV22_NOON), false);
    assert.equal(showDevDeepawaliVaranasiPartner({ ...EXACT, category: "Varanasi" }, NOV24_LAST), false);

    const end = html(React.createElement(PartnerEndCard, { lang: "en", slug: GUIDE.slug, upcomingVratId: "dev_deepawali_2026" }));
    const guideLinks = hrefs(end).filter((href) => href.includes("/dev-deepawali-2026/"));
    assert.equal(guideLinks.length, 1);
    assert.equal(showDevDeepawaliVaranasiPartner(GUIDE, NOV22_NOON), false);
  });

  it("keeps Sponsored A/B on soft Varanasi stories and blocks hard news entirely", () => {
    assert.equal(isHardNewsStory(VARANASI), false);
    assert.equal(canShowSponsoredEndUnit(VARANASI, { now: NOV20_NOON }), true);
    assert.equal(sponsoredEndModeForStory(VARANASI, NOV20_NOON), slugHash(VARANASI.slug) % 2 === 1 ? "b" : "a");
    assert.equal(sponsoredEndModeForStory(VARANASI, NOV21_0000), "a");
    assert.equal(showDevDeepawaliVaranasiPartner(VARANASI, NOV21_0000), true);
    const politics = { slug: "bjp-rally-varanasi", title: "BJP rally in Varanasi", category: "Varanasi" };
    assert.equal(isSensitiveStory(politics), false);
    assert.equal(isHardNewsStory(politics), true);
    assert.equal(showDevDeepawaliVaranasiPartner(politics, NOV20_NOON), false);
    assert.equal(canShowSponsoredEndUnit(politics, { now: NOV20_NOON }), false);
    assert.equal(sponsoredEndModeForStory(politics, NOV20_NOON), null);
    const udhna = {
      slug: "varanasi-udhna-special-05115-cantt-nov20-2026",
      title: "Varanasi to Udhna special: Cantt boarding is November 20 at 1:30 am",
      category: "Varanasi",
    };
    const udyan = {
      slug: "varanasi-shaheed-udyan-sonia-pond-deadlines-nov16-2026",
      title: "Varanasi sets December deadlines for Shaheed Udyan and Sonia pond",
      category: "Varanasi",
    };
    for (const story of [udhna, udyan]) {
      assert.equal(isHardNewsStory(story), true, JSON.stringify(story));
      assert.equal(showDevDeepawaliVaranasiPartner(story, NOV20_NOON), false, JSON.stringify(story));
      assert.equal(canShowSponsoredEndUnit(story, { now: NOV20_NOON }), false, JSON.stringify(story));
    }
  });
});

describe("Dev Deepawali Varanasi partner line", () => {
  it("uses the partner URL, Partner label, and fixed box", () => {
    const href = devDeepawaliVaranasiHref(VARANASI.slug);
    assert.equal(
      href,
      "https://pocketjyotish.in/dev-deepawali-2026/?utm_source=dalimss_news&utm_medium=partner&utm_campaign=dev_deepawali_2026&utm_content=varanasi-ghats-cleaned"
    );
    assert.equal(DEV_DEEPAWALI_VARANASI_COPY.en, "Dev Deepawali 2026: date, muhurat and Kartik Purnima rituals. Ask Pocket Jyotish's AI Astrologer");
    for (const lang of ["en", "hi"] as const) {
      const markup = html(React.createElement(PartnerDevDeepawaliLine, { lang, slug: VARANASI.slug }));
      const links = hrefs(markup);
      assert.equal(links.length, 1);
      assert.equal(links[0], href);
      assert.deepEqual(params(links[0]), {
        utm_source: "dalimss_news",
        utm_medium: "partner",
        utm_campaign: "dev_deepawali_2026",
        utm_content: VARANASI.slug,
      });
      assert.equal(params(links[0]).utm_term, undefined);
      assert.match(markup, new RegExp(`height:${DEV_DEEPAWALI_VARANASI_LINE_HEIGHT_PX}px`));
      assert.match(markup, /min-height:120px/);
      assert.match(markup, /max-height:120px/);
      assert.equal(DEV_DEEPAWALI_VARANASI_LINE_HEIGHT_PX, 120);
      assert.ok(markup.includes("Partner"));
      assert.ok(markup.includes(DEV_DEEPAWALI_VARANASI_COPY[lang].replace(/'/g, "&#x27;")));
      assert.ok(markup.includes('aria-label="Partner"'));
      assert.ok(!/>Sponsored</.test(markup));
      assert.ok(!markup.includes("प्रायोजित"));
      assert.ok(!/<(iframe|img|script|embed|object)\b/i.test(markup));
      for (const tag of Array.from(markup.matchAll(/<a [^>]*>/g))) {
        assert.ok(tag[0].includes('rel="sponsored noopener"'), tag[0]);
        assert.ok(tag[0].includes('target="_blank"'), tag[0]);
      }
    }
  });

  it("names only Pocket Jyotish and does not use fear or free-chat wording", () => {
    for (const text of Object.values(DEV_DEEPAWALI_VARANASI_COPY)) {
      assert.match(text, /Pocket Jyotish/);
      assert.ok(!/dalimss|astrosage|instaastro/i.test(text), text);
      assert.ok(!/\bfree\b|मुफ्त|मुफ़्त|फ्री/i.test(text), text);
      assert.ok(!/free jyotishi|free chat|free astrologer|free call/i.test(text), text);
      assert.ok(!/fear|danger|curse|dosh|calamity|hurry|don't miss|death|killed|tragedy|terror/i.test(text), text);
    }
    assert.match(DEV_DEEPAWALI_VARANASI_COPY.en, /AI Astrologer/);
    assert.match(DEV_DEEPAWALI_VARANASI_COPY.hi, /AI Astrologer/);
  });

  it("stays off the ad slot and out of the story text", () => {
    assert.equal(devDeepawaliPartnerSlot({ show: false, separatedFromBelowAd: true, hasLatestStories: true }), "none");
    assert.equal(devDeepawaliPartnerSlot({ show: true, separatedFromBelowAd: true, hasLatestStories: false }), "after-body");
    assert.equal(devDeepawaliPartnerSlot({ show: true, separatedFromBelowAd: false, hasLatestStories: true }), "before-related");
    assert.equal(devDeepawaliPartnerSlot({ show: true, separatedFromBelowAd: false, hasLatestStories: false }), "none");

    const src = readFileSync(new URL("../pages/articles/[slug].tsx", import.meta.url), "utf8");
    assert.ok(src.includes('content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"'));
    assert.ok(src.includes("rehypeAdSlots({ after: [3, 7] })"));
    assert.ok(src.includes("NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE_1"));
    assert.ok(src.includes("NEXT_PUBLIC_ADSENSE_SLOT_BELOW_ARTICLE"));
    assert.equal(src.split("<PartnerSponsoredUnit").length - 1, 2);
    assert.equal(src.split('placement="after-body"').length - 1, 1);
    assert.equal(src.split('placement="before-related"').length - 1, 1);
    assert.equal(src.split('mode={sponsoredEndMode ?? "a"}').length - 1, 2);
    const markdownStart = src.indexOf("<ReactMarkdown");
    const markdownEnd = src.indexOf("</ReactMarkdown>");
    assert.ok(!src.slice(markdownStart, markdownEnd).includes("PartnerDevDeepawaliLine"));
    const afterBody = src.indexOf('devDeepawaliSlot === "after-body"');
    const belowAd = src.indexOf('name="below-article"');
    const belowTag = src.lastIndexOf("<AdSlot", belowAd);
    assert.ok(afterBody > markdownEnd && afterBody < belowTag);
    assert.ok(src.slice(afterBody, belowTag).includes("<AuthorBox"));
    assert.ok(!src.slice(afterBody, belowTag).includes("<AdSlot"));
    const latest = src.indexOf("<LatestStories");
    const beforeRelated = src.indexOf('devDeepawaliSlot === "before-related"');
    const related = src.indexOf("<RelatedArticles");
    assert.ok(belowAd < latest && latest < beforeRelated && beforeRelated < related);
    assert.ok(!src.slice(latest, related).includes("<AdSlot"));
    assert.ok(src.includes("...devDeepawaliVaranasiWindows(article, partnerNow)"));
    assert.ok(src.includes("devDeepawaliVaranasi: showDevDeepawaliVaranasiPartner(article, partnerNow)"));
  });
});
