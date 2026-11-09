import React from "react";
import {
  diwaliPartnerHref,
  partnerHref,
  PARTNER_CAMPAIGN_EVERGREEN,
  PARTNER_CAMPAIGN_TECH_AUTO,
  type PartnerVariant,
} from "@/lib/partnerRashifal";

const REL = "sponsored noopener";
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

export function PartnerRashifal({ sign, lang, slug }: { sign: string; lang: "hi" | "en"; slug: string }) {
  const hi = lang === "hi";
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
    </aside>
  );
}

export function PartnerEndCard({
  lang,
  slug,
  diwaliCta = false,
  variant = null,
}: {
  lang: "hi" | "en";
  slug: string;
  diwaliCta?: boolean;
  variant?: PartnerVariant | null;
}) {
  const hi = lang === "hi";
  const cls = "font-semibold text-blue-700 underline underline-offset-2";
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
  variant = null,
}: {
  lang: "hi" | "en";
  slug: string;
  diwaliCta?: boolean;
  variant?: PartnerVariant | null;
}) {
  const hi = lang === "hi";
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
