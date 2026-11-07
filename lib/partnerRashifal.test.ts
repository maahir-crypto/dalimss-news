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
} from "./partnerRashifal";

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
    assert.match(href, /utm_campaign=diwali2026/);
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
