import React from "react";
import {
  diwaliPartnerHref,
  festivalPartnerHref,
  getFestivalPartnerCta,
  getUpcomingVrat,
  partnerHref,
  PARTNER_CAMPAIGN_EVERGREEN,
  PARTNER_CAMPAIGN_SPONSORED_EVERGREEN,
  PARTNER_CAMPAIGN_TECH_AUTO,
  type PartnerVariant,
} from "@/lib/partnerRashifal";

const REL = "sponsored noopener";

/**
 * Reserved box for the evergreen Sponsored end unit.
 * 2px border + 16px padding, each side, then 16px label, 12px gap, 72px copy,
 * 12px gap, and three 24px link rows. Border is inside the box.
 */
export const SPONSORED_END_UNIT_HEIGHT_PX = 220;
/** Reserved box when the end card is showing the next vrat guide. */
export const VRAT_END_CARD_HEIGHT_PX = 148;
/** Reserved row under the rashifal iframe. The iframe box stays 440px. */
export const WIDGET_VRAT_ROW_HEIGHT_PX = 64;

export const SPONSORED_HARD_NEWS_COPY =
  "Pocket Jyotish AI Astrologer. 10 questions a day are free. Free kundli and daily rashifal.";

function sponsoredMark(hi: boolean) {
  return (
    <span
      style={{
        display: "block",
        height: 16,
        lineHeight: "16px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#92400e",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {hi ? "प्रायोजित · Sponsored" : "Sponsored"}
    </span>
  );
}
const evergreen = (
  path: string,
  medium: "widget" | "inline_card" | "sidebar" | "price_guide",
  slug: string,
  variant?: PartnerVariant | null
) => partnerHref({ path, medium, campaign: PARTNER_CAMPAIGN_EVERGREEN, slug, variant });
const tag = (slug: string) => `utm_content=${encodeURIComponent(slug)}`;
const label = (_hi: boolean) => (
  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
    Partner
  </span>
);

export function PartnerRashifal({
  sign,
  lang,
  slug,
  upcomingVratId = null,
}: {
  sign: string;
  lang: "hi" | "en";
  slug: string;
  upcomingVratId?: string | null;
}) {
  const hi = lang === "hi";
  const vrat = getUpcomingVrat(upcomingVratId);
  const vratText = vrat ? (hi ? vrat.text.hi : vrat.text.en) : null;
  return (
    <aside className="partner-rashifal my-6 mx-auto w-full" style={{ maxWidth: 360 }} aria-label="Partner">
      {label(hi)}
      <div style={{ minHeight: 440, height: 440 }}>
        <iframe
          src={`https://pocketjyotish.in/widget/rashifal?sign=${encodeURIComponent(sign)}&lang=${lang}&${tag(slug)}`}
          title="Aaj ka Rashifal, Pocket Jyotish"
          loading="lazy"
          width="100%"
          height={440}
          style={{ width: "100%", maxWidth: 360, height: 440, display: "block", border: 0 }}
        />
      </div>
      {vrat && vratText ? (
        <p
          className="partner-widget-vrat"
          style={{
            boxSizing: "border-box",
            height: WIDGET_VRAT_ROW_HEIGHT_PX,
            minHeight: WIDGET_VRAT_ROW_HEIGHT_PX,
            maxHeight: WIDGET_VRAT_ROW_HEIGHT_PX,
            overflow: "hidden",
            margin: "12px 0 0",
            lineHeight: "20px",
            fontSize: 13,
          }}
        >
          {sponsoredMark(hi)}
          <a
            href={partnerHref({ path: vrat.path, medium: "widget", campaign: vrat.campaign, slug })}
            target="_blank"
            rel={REL}
            className="font-semibold text-blue-800 underline"
          >
            {vratText.sidebarLink}
          </a>
        </p>
      ) : null}
    </aside>
  );
}

export function PartnerEndCard({
  lang,
  slug,
  diwaliCta = false,
  festivalCtaId = null,
  upcomingVratId = null,
  variant = null,
}: {
  lang: "hi" | "en";
  slug: string;
  diwaliCta?: boolean;
  festivalCtaId?: string | null;
  upcomingVratId?: string | null;
  variant?: PartnerVariant | null;
}) {
  const hi = lang === "hi";
  const cls = "font-semibold text-blue-700 underline underline-offset-2";
  const festival = getFestivalPartnerCta(festivalCtaId);
  if (festival) {
    const t = hi ? festival.text.hi : festival.text.en;
    return (
      <aside className="partner-endcard my-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700" aria-label="Partner">
        {label(hi)}
        <p className="m-0">
          {hi ? "हमारी पार्टनर साइट पर पढ़ें: " : "On our partner site: "}
          <a href={festivalPartnerHref(festival, slug, "widget", variant)} target="_blank" rel={REL} className={cls}>
            {t.endCard}
          </a>
          .
        </p>
      </aside>
    );
  }
  if (diwaliCta) {
    return (
      <aside className="partner-endcard my-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700" aria-label="Partner">
        {label(hi)}
        <p className="m-0">
          {hi ? "हमारी पार्टनर साइट पर पढ़ें: " : "On our partner site: "}
          <a href={diwaliPartnerHref(slug, "widget", variant)} target="_blank" rel={REL} className={cls}>
            {hi ? "दिवाली 2026 मुहूर्त गाइड" : "Diwali 2026 muhurat guide"}
          </a>
          .
        </p>
      </aside>
    );
  }
  const vrat = getUpcomingVrat(upcomingVratId);
  if (vrat) {
    const t = hi ? vrat.text.hi : vrat.text.en;
    return (
      <aside
        className="partner-endcard partner-vrat-end not-prose my-8 rounded-lg p-4 text-sm text-gray-800"
        style={{
          boxSizing: "border-box",
          height: VRAT_END_CARD_HEIGHT_PX,
          minHeight: VRAT_END_CARD_HEIGHT_PX,
          maxHeight: VRAT_END_CARD_HEIGHT_PX,
          overflow: "hidden",
          border: "2px solid #b45309",
          background: "#fffbeb",
        }}
        aria-label="Sponsored"
      >
        {sponsoredMark(hi)}
        <p className="m-0 mt-2" style={{ lineHeight: "24px", maxHeight: 96, overflow: "hidden" }}>
          {hi ? "हमारी पार्टनर साइट पर पढ़ें: " : "On our partner site: "}
          <a
            href={partnerHref({ path: vrat.path, medium: "ad", campaign: vrat.campaign, slug, variant })}
            target="_blank"
            rel={REL}
            className={cls}
          >
            {t.endCard}
          </a>
          .
        </p>
      </aside>
    );
  }
  return (
    <aside className="partner-endcard my-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700" aria-label="Partner">
      {label(hi)}
      <p className="m-0">
        {hi ? "हमारी पार्टनर साइट पर पढ़ें: " : "On our partner site: "}
        <a href={evergreen("/rashifal/", "widget", slug, variant)} target="_blank" rel={REL} className={cls}>
          {hi ? "आज का राशिफल" : "Today's rashifal"}
        </a>
        {hi ? " और " : " and "}
        <a href={evergreen("/milan/", "widget", slug, variant)} target="_blank" rel={REL} className={cls}>
          {hi ? "कुंडली मिलान" : "kundli milan"}
        </a>
        .
      </p>
    </aside>
  );
}

/** Desktop only. Hidden below 1536px so phones never get it. */
export function PartnerSidebar({
  lang,
  slug,
  diwaliCta = false,
  festivalCtaId = null,
  upcomingVratId = null,
  variant = null,
}: {
  lang: "hi" | "en";
  slug: string;
  diwaliCta?: boolean;
  festivalCtaId?: string | null;
  upcomingVratId?: string | null;
  variant?: PartnerVariant | null;
}) {
  const hi = lang === "hi";
  const linksOnly = getFestivalPartnerCta(festivalCtaId)?.linksOnly === true;
  // Small sponsored text link, astrology-eligible stories only (this sidebar
  // renders only when the partner widget is eligible). Never in header/nav.
  const kundliLine = (
    <p className="partner-sidebar-kundli mb-0 mt-3 border-t border-gray-100 pt-3 text-xs text-gray-600">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Partner:</span>
      <a
        href={evergreen("/kundli/", "sidebar", slug, variant)}
        target="_blank"
        rel={REL}
        className="text-blue-700 underline underline-offset-2"
      >
        Free Kundli
      </a>
    </p>
  );
  const festival = getFestivalPartnerCta(festivalCtaId);
  if (festival) {
    const t = hi ? festival.text.hi : festival.text.en;
    return (
      <div className="partner-sidebar absolute bottom-0 left-full top-40 ml-6 hidden w-[260px] 2xl:block" aria-hidden={false}>
        <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
          {label(hi)}
          <p className="mb-2 font-semibold text-gray-900">{t.sidebarTitle}</p>
          <p className="mb-3">{t.sidebarBody}</p>
          <a href={festivalPartnerHref(festival, slug, "sidebar", variant)} target="_blank" rel={REL} className="font-semibold text-blue-700 underline">
            {t.sidebarLink}
          </a>
          {linksOnly ? null : kundliLine}
        </div>
      </div>
    );
  }
  if (diwaliCta) {
    return (
      <div className="partner-sidebar absolute bottom-0 left-full top-40 ml-6 hidden w-[260px] 2xl:block" aria-hidden={false}>
        <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
          {label(hi)}
          <p className="mb-2 font-semibold text-gray-900">{hi ? "दिवाली मुहूर्त" : "Diwali muhurat"}</p>
          <p className="mb-3">
            {hi
              ? "दिवाली और लक्ष्मी पूजा का मुहूर्त हमारी पार्टनर साइट पर देखें."
              : "See Diwali and Lakshmi Puja muhurat timings on our partner site."}
          </p>
          <a href={diwaliPartnerHref(slug, "sidebar", variant)} target="_blank" rel={REL} className="font-semibold text-blue-700 underline">
            {hi ? "दिवाली गाइड देखें" : "See Diwali guide"}
          </a>
          {kundliLine}
        </div>
      </div>
    );
  }
  const vrat = getUpcomingVrat(upcomingVratId);
  if (vrat) {
    const t = hi ? vrat.text.hi : vrat.text.en;
    return (
      <div className="partner-sidebar absolute bottom-0 left-full top-40 ml-6 hidden w-[260px] 2xl:block" aria-hidden={false}>
        <div
          className="sticky top-24 rounded-lg p-4 text-sm text-gray-800"
          style={{ border: "2px solid #b45309", background: "#fffbeb" }}
        >
          {sponsoredMark(hi)}
          <p className="mb-2 font-semibold text-gray-900">{t.sidebarTitle}</p>
          <p className="mb-3">{t.sidebarBody}</p>
          <a
            href={partnerHref({ path: vrat.path, medium: "sidebar", campaign: vrat.campaign, slug, variant })}
            target="_blank"
            rel={REL}
            className="font-semibold text-blue-700 underline"
          >
            {t.sidebarLink}
          </a>
          {kundliLine}
        </div>
      </div>
    );
  }
  return (
    <div className="partner-sidebar absolute bottom-0 left-full top-40 ml-6 hidden w-[260px] 2xl:block" aria-hidden={false}>
      <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
        {label(hi)}
        <p className="mb-2 font-semibold text-gray-900">{hi ? "आज का राशिफल" : "Aaj ka Rashifal"}</p>
        <p className="mb-3">{hi ? "अपनी राशि का दैनिक फल हमारी पार्टनर साइट पर देखें." : "Read your daily sign forecast on our partner site."}</p>
        <a href={evergreen("/rashifal/", "sidebar", slug, variant)} target="_blank" rel={REL} className="font-semibold text-blue-700 underline">
          {hi ? "राशिफल देखें" : "See rashifal"}
        </a>
        {kundliLine}
      </div>
    </div>
  );
}

/** One small text line at the end of price guides. No image, no iframe. */
export function PartnerPriceLine({ lang, slug }: { lang: "hi" | "en"; slug: string }) {
  const hi = lang === "hi";
  return (
    <p className="partner-price-line my-6 text-sm text-gray-600" aria-label="Partner">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Partner:</span>
      <a
        href={evergreen("/rashifal/", "price_guide", slug)}
        target="_blank"
        rel={REL}
        className="text-blue-700 underline underline-offset-2"
      >
        {hi ? "Pocket Jyotish पर अपना मुफ्त दैनिक राशिफल देखें" : "Check your free daily rashifal on Pocket Jyotish"}
      </a>
    </p>
  );
}

/**
 * A/B test variant B: one mid-article 'Free Kundli' card after paragraph 3.
 * Server-rendered, fixed reserved height, no image, no iframe. Styled like the
 * site's other partner cards (Partner label, gray card), not like an ad.
 */
export function PartnerInlineCard({ lang, slug }: { lang: "hi" | "en"; slug: string }) {
  const hi = lang === "hi";
  return (
    <aside
      className="partner-inline-card not-prose my-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
      style={{ minHeight: 132, boxSizing: "border-box" }}
      aria-label="Partner"
    >
      {label(hi)}
      <p className="m-0 mb-3 leading-snug">
        {hi
          ? "हमारी पार्टनर साइट पर जन्म विवरण से अपनी मुफ्त कुंडली बनाएं."
          : "Make your free birth chart from your birth details on our partner site."}
      </p>
      <a
        href={evergreen("/kundli/", "inline_card", slug, "b")}
        target="_blank"
        rel={REL}
        className="inline-block rounded-md border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 no-underline hover:bg-blue-50"
      >
        Free Kundli in 1 minute
      </a>
    </aside>
  );
}

/** Tech/auto 7-day test: one small text line at the end of the story. */
export function PartnerTechAutoLine({ slug }: { slug: string }) {
  return (
    <p className="partner-techauto-line my-6 text-sm text-gray-600" style={{ minHeight: "1.5rem" }} aria-label="Partner">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Partner:</span>
      <a
        href={partnerHref({ path: "/kundli/", medium: "endline", campaign: PARTNER_CAMPAIGN_TECH_AUTO, slug })}
        target="_blank"
        rel={REL}
        className="text-blue-700 underline underline-offset-2"
      >
        Check your free kundli
      </a>
    </p>
  );
}

/**
 * Festival guide CTA: one labeled sponsored text line, rendered between the
 * article body and the end card (never next to an ad slot; the body never
 * ends in an ad). Server-rendered with a reserved line height. Link only, no
 * iframe or embed of the festival page.
 */
export function PartnerFestivalLine({
  lang,
  slug,
  festivalCtaId,
  variant = null,
}: {
  lang: "hi" | "en";
  slug: string;
  festivalCtaId: string | null | undefined;
  variant?: PartnerVariant | null;
}) {
  const festival = getFestivalPartnerCta(festivalCtaId);
  if (!festival) return null;
  const t = lang === "hi" ? festival.text.hi : festival.text.en;
  return (
    <p className="partner-festival-line my-6 text-sm text-gray-600" style={{ minHeight: "1.5rem" }} aria-label="Partner">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Partner:</span>
      <a
        href={festivalPartnerHref(festival, slug, "inline", variant)}
        target="_blank"
        rel={REL}
        className="text-blue-700 underline underline-offset-2"
      >
        {t.line}
      </a>
    </p>
  );
}

/**
 * Evergreen Sponsored house ad for stories that have no partner end unit.
 * Fixed 220px box: 2px border and 16px padding on each side, 16px label,
 * 12px gap, 72px copy, 12px gap, and three 24px link rows. The AI Astrologer
 * chat is the main link. Kundli
 * and rashifal are secondary. No image, no iframe, no third-party script.
 * Amber border and background so it is not story text and not an AdSense
 * "Advertisement" slot. Hard-news copy stays the neutral sentence and does
 * not mention the article. The chat is not called a free human astrologer
 * call. The live chat page says 10 questions a day are free.
 */
export function PartnerSponsoredUnit({
  lang,
  slug,
  tone,
  placement,
}: {
  lang: "hi" | "en";
  slug: string;
  tone: "hard-news" | "general";
  placement: "after-body" | "before-related";
}) {
  const hi = lang === "hi";
  // Both house-ad positions use medium "ad". The vrat widget and sidebar keep
  // their own mediums, so utm_medium still follows the placement.
  const link = (path: string) =>
    partnerHref({
      path,
      medium: "ad",
      campaign: PARTNER_CAMPAIGN_SPONSORED_EVERGREEN,
      slug,
    });
  const chat = link("/chat/");
  const kundli = link("/kundli/");
  const rashifal = link("/rashifal/");
  const copy =
    tone === "hard-news"
      ? SPONSORED_HARD_NEWS_COPY
      : hi
        ? "Pocket Jyotish के AI ज्योतिषी से पूछें. रोज़ 10 सवाल मुफ़्त हैं."
        : "Ask the Pocket Jyotish AI Astrologer. 10 questions a day are free.";
  const chatLabel = tone === "hard-news" || !hi ? "AI Astrologer" : "AI ज्योतिषी";
  const kundliLabel = tone === "hard-news" || !hi ? "Free kundli" : "मुफ्त कुंडली";
  const rashifalLabel = tone === "hard-news" || !hi ? "Free daily rashifal" : "मुफ्त दैनिक राशिफल";
  const row = (href: string, label: string, primary: boolean, marginTop: number) => (
    <p style={{ height: 24, lineHeight: "24px", margin: `${marginTop}px 0 0`, overflow: "hidden", whiteSpace: "nowrap" }}>
      <a
        href={href}
        target="_blank"
        rel={REL}
        className={
          primary
            ? "font-bold text-blue-800 underline underline-offset-2"
            : "font-semibold text-blue-800 underline underline-offset-2"
        }
      >
        {label}
      </a>
    </p>
  );
  return (
    <aside
      className="partner-sponsored-unit not-prose"
      data-house-ad="pocket-jyotish"
      data-sponsored-tone={tone}
      data-sponsored-placement={placement}
      aria-label={hi ? "प्रायोजित" : "Sponsored"}
      style={{
        boxSizing: "border-box",
        height: SPONSORED_END_UNIT_HEIGHT_PX,
        minHeight: SPONSORED_END_UNIT_HEIGHT_PX,
        maxHeight: SPONSORED_END_UNIT_HEIGHT_PX,
        overflow: "hidden",
        marginTop: placement === "before-related" ? 48 : 32,
        marginBottom: placement === "after-body" ? 40 : 32,
        border: "2px solid #b45309",
        backgroundColor: "#fffbeb",
        borderRadius: 12,
        padding: 16,
      }}
    >
      {sponsoredMark(hi)}
      <p
        style={{
          height: 72,
          lineHeight: "24px",
          margin: "12px 0 0",
          overflow: "hidden",
          fontSize: 14,
          color: "#1f2937",
        }}
      >
        {copy}
      </p>
      {row(chat, chatLabel, true, 12)}
      {row(kundli, kundliLabel, false, 0)}
      {row(rashifal, rashifalLabel, false, 0)}
    </aside>
  );
}
