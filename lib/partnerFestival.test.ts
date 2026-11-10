import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AKSHAYA_NAVAMI_PARTNER_CTA_UNTIL_IST,
  BHAI_DOOJ_PARTNER_CTA_UNTIL_IST,
  DIWALI_PARTNER_CTA_UNTIL_IST,
  FESTIVAL_PARTNER_CTAS,
  GOVARDHAN_PARTNER_CTA_UNTIL_IST,
  GURU_NANAK_PARTNER_CTA_UNTIL_IST,
  isHardNewsStory,
  isPartnerEligibleStory,
  partnerRashifalFor,
  diwaliPartnerHref,
  festivalPartnerCtaFor,
  festivalPartnerHref,
  getFestivalPartnerCta,
  secondsUntilFestivalCtaExpiry,
  useDiwaliPartnerCta,
} from "./partnerRashifal";
import { rehypeAdSlots } from "./rehypeAdSlots";
import {
  PartnerEndCard,
  PartnerFestivalLine,
  PartnerSidebar,
} from "../components/PartnerRashifal";

const GOV = {
  slug: "govardhan-puja-10-november-2026-varanasi-gurugram",
  title: "गोवर्धन पूजा 10 नवंबर 2026: वाराणसी और गुरुग्राम का मुहूर्त",
  category: "Lifestyle",
  tags: "गोवर्धन पूजा 2026, govardhan puja 2026, अन्नकूट, वाराणसी, गुरुग्राम, पूजा मुहूर्त",
  language: "hi",
};
const BD = {
  slug: "bhai-dooj-11-november-2026-varanasi-gurugram",
  title: "भाई दूज 11 नवंबर 2026: वाराणसी और गुरुग्राम में तिलक का समय",
  category: "Lifestyle",
  tags: "भाई दूज 2026, bhai dooj 2026, तिलक मुहूर्त, यम द्वितीया, वाराणसी, गुरुग्राम",
  language: "hi",
};
const DIWALI = { slug: "diwali-2026-lakshmi-puja-muhurat-varanasi", title: "Diwali 2026 Lakshmi Puja muhurat in Varanasi", category: "Lifestyle" };

// IST = UTC + 5:30
const IST_10NOV_NOON = new Date("2026-11-10T06:30:00Z");
const IST_10NOV_LAST_MS = new Date("2026-11-10T18:29:59.999Z");
const IST_11NOV_MIDNIGHT = new Date("2026-11-10T18:30:00Z");
const IST_11NOV_LAST_MS = new Date("2026-11-11T18:29:59.999Z");
const IST_12NOV_MIDNIGHT = new Date("2026-11-11T18:30:00Z");

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const hrefs = (s: string) => Array.from(s.matchAll(/href="([^"]+)"/g)).map((m) => m[1].replace(/&amp;/g, "&"));
const params = (u: string) => Object.fromEntries(new URL(u).searchParams.entries());

describe("festival CTA constants", () => {
  it("has the approved inclusive IST end dates", () => {
    assert.equal(GOVARDHAN_PARTNER_CTA_UNTIL_IST, "2026-11-10");
    assert.equal(BHAI_DOOJ_PARTNER_CTA_UNTIL_IST, "2026-11-11");
    assert.equal(AKSHAYA_NAVAMI_PARTNER_CTA_UNTIL_IST, "2026-11-18");
    assert.equal(DIWALI_PARTNER_CTA_UNTIL_IST, "2026-11-11");
  });
});

describe("festival CTA slug targeting", () => {
  it("Govardhan guide gets the Govardhan CTA, Bhai Dooj guide gets Bhai Dooj", () => {
    assert.equal(festivalPartnerCtaFor(GOV, IST_10NOV_NOON)?.id, "govardhan_2026");
    assert.equal(festivalPartnerCtaFor(BD, IST_10NOV_NOON)?.id, "bhai_dooj_2026");
  });

  it("exact slug only: other govardhan / annakut / bhai dooj / diwali stories get nothing", () => {
    for (const a of [
      { slug: "govardhan-puja-2026-annakut-recipes", title: "Govardhan Puja annakut recipes", category: "Lifestyle" },
      { slug: "bhai-dooj-gift-ideas-2026", title: "Bhai Dooj gift ideas", category: "Lifestyle" },
      DIWALI,
      { slug: "realme-16-5g-72-60", title: "Realme 16 5G price", category: "Technology" },
    ]) {
      assert.equal(festivalPartnerCtaFor(a, IST_10NOV_NOON), null, a.slug);
    }
  });

  it("Akshaya Navami / Gopashtami mapping is dormant on every story", () => {
    const ak = FESTIVAL_PARTNER_CTAS.find((c) => c.id === "akshaya_navami_2026");
    assert.ok(ak);
    assert.deepEqual([...ak.slugs], []);
    assert.equal(ak.path, "/akshaya-navami-2026/");
    assert.equal(ak.campaign, "akshaya_navami_2026");
    const t = new Date("2026-11-17T06:30:00Z");
    for (const a of [
      { slug: "akshaya-navami-2026-varanasi", title: "Akshaya Navami 2026 muhurat", category: "Lifestyle" },
      { slug: "gopashtami-2026", title: "Gopashtami 2026 puja", category: "Lifestyle" },
      GOV,
      BD,
    ]) {
      assert.notEqual(festivalPartnerCtaFor(a, t)?.id, "akshaya_navami_2026", a.slug);
    }
  });
});

describe("festival CTA expiry (IST midnight)", () => {
  it("Govardhan is on through 23:59:59.999 IST 10 Nov and off from 00:00 IST 11 Nov", () => {
    assert.ok(festivalPartnerCtaFor(GOV, IST_10NOV_LAST_MS));
    assert.equal(festivalPartnerCtaFor(GOV, IST_11NOV_MIDNIGHT), null);
  });

  it("Bhai Dooj is on through 23:59:59.999 IST 11 Nov and off from 00:00 IST 12 Nov", () => {
    assert.ok(festivalPartnerCtaFor(BD, IST_11NOV_LAST_MS));
    assert.equal(festivalPartnerCtaFor(BD, IST_12NOV_MIDNIGHT), null);
  });

  it("revalidate lands on IST midnight", () => {
    const gov = getFestivalPartnerCta("govardhan_2026")!;
    assert.equal(secondsUntilFestivalCtaExpiry(gov, new Date("2026-11-10T18:00:00Z")), 1800);
    assert.equal(secondsUntilFestivalCtaExpiry(gov, IST_11NOV_MIDNIGHT), 1);
  });

  it("after expiry the end card and sidebar fall back to evergreen rashifal links", () => {
    const id = festivalPartnerCtaFor(GOV, IST_11NOV_MIDNIGHT)?.id ?? null;
    const end = html(React.createElement(PartnerEndCard, { lang: "hi", slug: GOV.slug, festivalCtaId: id }));
    const side = html(React.createElement(PartnerSidebar, { lang: "hi", slug: GOV.slug, festivalCtaId: id }));
    assert.ok(end.includes("pocketjyotish.in/rashifal/") && end.includes("pocketjyotish.in/milan/"));
    assert.ok(side.includes("pocketjyotish.in/rashifal/"));
    assert.ok(!(end + side).includes("govardhan-puja-2026"));
    assert.equal(html(React.createElement(PartnerFestivalLine, { lang: "hi", slug: GOV.slug, festivalCtaId: id })), "");
  });
});

describe("festival CTA hard-news exclusion", () => {
  it("never shows on hard news, even with the exact slug", () => {
    assert.equal(festivalPartnerCtaFor({ ...GOV, title: "Govardhan Puja: police arrest 3 after clash" }, IST_10NOV_NOON), null);
    assert.equal(festivalPartnerCtaFor({ ...BD, title: "भाई दूज पर हादसा, दो की मौत" }, IST_10NOV_NOON), null);
    assert.equal(festivalPartnerCtaFor({ ...GOV, category: "Crime" }, IST_10NOV_NOON), null);
  });
});

describe("festival CTA UTM values", () => {
  const cases = [
    { a: GOV, path: "/govardhan-puja-2026/", campaign: "govardhan_2026" },
    { a: BD, path: "/bhai-dooj-2026/", campaign: "bhai_dooj_2026" },
  ];
  for (const { a, path, campaign } of cases) {
    it(`${campaign}: widget, sidebar and inline line carry the exact UTMs`, () => {
      const id = festivalPartnerCtaFor(a, IST_10NOV_NOON)!.id;
      const end = hrefs(html(React.createElement(PartnerEndCard, { lang: "hi", slug: a.slug, festivalCtaId: id })));
      const side = hrefs(html(React.createElement(PartnerSidebar, { lang: "hi", slug: a.slug, festivalCtaId: id })));
      const line = hrefs(html(React.createElement(PartnerFestivalLine, { lang: "hi", slug: a.slug, festivalCtaId: id })));
      assert.equal(end.length, 1);
      assert.equal(line.length, 1);
      const want = (medium: string) => ({ utm_source: "dalimss_news", utm_medium: medium, utm_campaign: campaign, utm_content: a.slug });
      assert.equal(new URL(end[0]).pathname, path);
      assert.deepEqual(params(end[0]), want("widget"));
      assert.equal(new URL(side[0]).pathname, path);
      assert.deepEqual(params(side[0]), want("sidebar"));
      assert.equal(new URL(line[0]).pathname, path);
      assert.deepEqual(params(line[0]), want("inline"));
    });
  }

  it("keeps utm_term=variant_a/b when the A/B test passes a variant", () => {
    const gov = getFestivalPartnerCta("govardhan_2026")!;
    assert.equal(params(festivalPartnerHref(gov, GOV.slug, "widget", "a")).utm_term, "variant_a");
    assert.equal(params(festivalPartnerHref(gov, GOV.slug, "inline", "b")).utm_term, "variant_b");
    const line = hrefs(html(React.createElement(PartnerFestivalLine, { lang: "hi", slug: GOV.slug, festivalCtaId: gov.id, variant: "b" })));
    assert.equal(params(line[0]).utm_term, "variant_b");
    assert.equal(params(line[0]).utm_medium, "inline");
  });
});

describe("festival CTA markup", () => {
  for (const id of ["govardhan_2026", "bhai_dooj_2026"]) {
    it(`${id}: sponsored rel, visible Partner label, no iframe/embed of the festival page`, () => {
      for (const lang of ["hi", "en"] as const) {
        const parts = [
          html(React.createElement(PartnerEndCard, { lang, slug: "s", festivalCtaId: id })),
          html(React.createElement(PartnerSidebar, { lang, slug: "s", festivalCtaId: id })),
          html(React.createElement(PartnerFestivalLine, { lang, slug: "s", festivalCtaId: id })),
        ];
        for (const p of parts) {
          assert.ok(!/<(iframe|embed|object)\b/i.test(p), p);
          assert.ok(p.includes("Partner"), p);
          for (const m of Array.from(p.matchAll(/<a [^>]*>/g))) assert.ok(m[0].includes('rel="sponsored noopener"'), m[0]);
        }
        assert.ok(parts[2].includes("min-height:1.5rem"));
      }
    });
  }

  it("labeled line text", () => {
    assert.ok(html(React.createElement(PartnerFestivalLine, { lang: "en", slug: "s", festivalCtaId: "govardhan_2026" })).includes("Govardhan Puja 2026 guide"));
    assert.ok(html(React.createElement(PartnerFestivalLine, { lang: "en", slug: "s", festivalCtaId: "bhai_dooj_2026" })).includes("Bhai Dooj 2026 guide"));
  });
});

describe("unchanged partner links", () => {
  it("Diwali stories keep /diwali-2026/ through 11 Nov and no festival CTA", () => {
    assert.equal(useDiwaliPartnerCta(DIWALI, IST_11NOV_LAST_MS), true);
    assert.equal(festivalPartnerCtaFor(DIWALI, IST_11NOV_LAST_MS), null);
    const end = html(React.createElement(PartnerEndCard, { lang: "en", slug: DIWALI.slug, diwaliCta: true, festivalCtaId: null }));
    assert.equal(hrefs(end)[0], diwaliPartnerHref(DIWALI.slug, "widget"));
    assert.ok(hrefs(end)[0].includes("/diwali-2026/") && hrefs(end)[0].includes("utm_campaign=diwali_2026"));
    assert.equal(useDiwaliPartnerCta(DIWALI, IST_12NOV_MIDNIGHT), false);
  });

  it("Free Kundli sidebar link stays /kundli/ partner_evergreen sidebar on festival and normal sidebars", () => {
    for (const festivalCtaId of ["govardhan_2026", "bhai_dooj_2026", null]) {
      const side = hrefs(html(React.createElement(PartnerSidebar, { lang: "hi", slug: GOV.slug, festivalCtaId, variant: "a" })));
      const k = side.find((h) => new URL(h).pathname === "/kundli/");
      assert.ok(k, String(festivalCtaId));
      assert.deepEqual(params(k), {
        utm_source: "dalimss_news",
        utm_medium: "sidebar",
        utm_campaign: "partner_evergreen",
        utm_content: GOV.slug,
        utm_term: "variant_a",
      });
    }
  });
});

describe("labeled line ad spacing", () => {
  type N = { type: string; tagName?: string; children?: N[]; properties?: Record<string, unknown> };
  const p = (): N => ({ type: "element", tagName: "p", children: [] });
  const lastBlock = (n: number) => {
    const tree = { type: "root", children: Array.from({ length: n }, p) as N[] };
    rehypeAdSlots({ after: [3, 7] })()(tree as any);
    const blocks = tree.children.filter((c) => c.type === "element");
    return blocks[blocks.length - 1];
  };

  it("the article body never ends in an ad slot, so the line (right after the body) never touches an ad", () => {
    for (let n = 1; n <= 20; n++) assert.equal(lastBlock(n).tagName, "p", `paragraphs=${n}`);
  });

  it("page renders the line between the body and the end card, with no AdSlot in between", () => {
    const src = readFileSync(new URL("../pages/articles/[slug].tsx", import.meta.url), "utf8");
    const line = src.indexOf("<PartnerFestivalLine");
    const end = src.indexOf("<PartnerEndCard", line);
    const bodyClose = src.lastIndexOf("</ReactMarkdown>", line);
    assert.ok(line > 0 && end > line && bodyClose > 0 && bodyClose < line);
    assert.ok(!src.slice(bodyClose, end).includes("<AdSlot"));
    // The end card follows the line, and the below-article ad is not directly after the end card block.
    const nextAd = src.indexOf("<AdSlot", end);
    assert.ok(src.slice(end, nextAd).includes("<AuthorBox") || src.slice(end, nextAd).includes("Sources"));
  });
});

describe("Guru Nanak Jayanti links-only CTA", () => {
  const GN = {
    slug: "guru-nanak-jayanti-24-november-2026-date-holiday-guide",
    title: "Guru Nanak Jayanti on 24 November 2026: date, observances and holiday checks",
    category: "Lifestyle",
    tags: "Guru Nanak Jayanti, Gurpurab, 24 November 2026, festival date, langar, holiday calendar, Amritsar",
    language: "en",
  };
  const IST_24NOV_LAST_MS = new Date("2026-11-24T18:29:59.999Z");
  const IST_25NOV_MIDNIGHT = new Date("2026-11-24T18:30:00Z");

  it("constant is 24 Nov 2026 IST", () => {
    assert.equal(GURU_NANAK_PARTNER_CTA_UNTIL_IST, "2026-11-24");
  });

  it("story is not hard news and stays NOT partner-eligible (general rules unchanged)", () => {
    assert.equal(isHardNewsStory(GN), false);
    assert.equal(isPartnerEligibleStory(GN), false);
    assert.equal(partnerRashifalFor(GN).show, false);
  });

  it("exact slug gets the links-only CTA through 24 Nov IST, off from 00:00 IST 25 Nov", () => {
    const c = festivalPartnerCtaFor(GN, IST_24NOV_LAST_MS);
    assert.equal(c?.id, "guru_nanak_2026");
    assert.equal(c?.linksOnly, true);
    assert.equal(festivalPartnerCtaFor(GN, IST_25NOV_MIDNIGHT), null);
    assert.equal(secondsUntilFestivalCtaExpiry(c!, new Date("2026-11-24T18:00:00Z")), 1800);
  });

  it("other Guru Nanak / Gurpurab stories and hard news get nothing", () => {
    const t = new Date("2026-11-20T06:30:00Z");
    assert.equal(festivalPartnerCtaFor({ ...GN, slug: "guru-nanak-jayanti-2026-wishes" }, t), null);
    assert.equal(festivalPartnerCtaFor({ ...GN, slug: "gurpurab-2026-amritsar-traffic" }, t), null);
    assert.equal(festivalPartnerCtaFor({ ...GN, title: "Guru Nanak Jayanti: police arrest 2 after clash" }, t), null);
  });

  it("end card, sidebar and line carry exact UTMs, no utm_term, no Free Kundli, no iframe", () => {
    const id = festivalPartnerCtaFor(GN, new Date("2026-11-20T06:30:00Z"))!.id;
    const end = html(React.createElement(PartnerEndCard, { lang: "en", slug: GN.slug, festivalCtaId: id, variant: null }));
    const side = html(React.createElement(PartnerSidebar, { lang: "en", slug: GN.slug, festivalCtaId: id, variant: null }));
    const line = html(React.createElement(PartnerFestivalLine, { lang: "en", slug: GN.slug, festivalCtaId: id, variant: null }));
    const want = (medium: string) => ({ utm_source: "dalimss_news", utm_medium: medium, utm_campaign: "guru_nanak_2026", utm_content: GN.slug });
    for (const [h, medium] of [[end, "widget"], [side, "sidebar"], [line, "inline"]] as const) {
      const links = hrefs(h);
      assert.equal(links.length, 1, h);
      assert.equal(new URL(links[0]).origin + new URL(links[0]).pathname, "https://pocketjyotish.in/guru-nanak-jayanti-2026/");
      assert.deepEqual(params(links[0]), want(medium));
      assert.ok(!/<(iframe|embed|object)\b/i.test(h));
      assert.ok(h.includes("Partner"));
      assert.ok(!/kundli/i.test(h));
      assert.ok(!/\bfree\b/i.test(h), "no 'free' wording");
      for (const m of Array.from(h.matchAll(/<a [^>]*>/g))) assert.ok(m[0].includes('rel="sponsored noopener"'));
    }
    assert.ok(line.includes("Guru Nanak Jayanti 2026 guide"));
  });

  it("page renders links-only CTA without the iframe slot or inline card", () => {
    const src = readFileSync(new URL("../pages/articles/[slug].tsx", import.meta.url), "utf8");
    assert.ok(src.includes("rehypePartnerSlot({ enabled: partner.show"));
    assert.ok(src.includes("const inlineTestOn = partner.show &&"));
    assert.ok(src.includes("{linksOnlyCta && festivalCta && (\n        <PartnerEndCard"));
  });
});

describe("Kundli sidebar link still present for eligible festival CTAs after links-only change", () => {
  it("Govardhan sidebar keeps /kundli/", () => {
    const side = hrefs(html(React.createElement(PartnerSidebar, { lang: "hi", slug: GOV.slug, festivalCtaId: "govardhan_2026" })));
    assert.ok(side.some((h) => new URL(h).pathname === "/kundli/"));
  });
});
