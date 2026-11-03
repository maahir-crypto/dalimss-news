import React from "react";

const REL = "sponsored noopener";
const label = (hi: boolean) => (
  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
    Partner
  </span>
);

export function PartnerRashifal({ sign, lang }: { sign: string; lang: "hi" | "en" }) {
  const hi = lang === "hi";
  return (
    <aside className="partner-rashifal my-6 mx-auto w-full" style={{ maxWidth: 360 }} aria-label="Partner">
      {label(hi)}
      <div style={{ minHeight: 440, height: 440 }}>
        <iframe
          src={`https://pocketjyotish.in/widget/rashifal?sign=${encodeURIComponent(sign)}&lang=${lang}`}
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

export function PartnerEndCard({ lang }: { lang: "hi" | "en" }) {
  const hi = lang === "hi";
  const cls = "font-semibold text-blue-700 underline underline-offset-2";
  return (
    <aside className="partner-endcard my-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700" aria-label="Partner">
      {label(hi)}
      <p className="m-0">
        {hi ? "हमारी पार्टनर साइट पर पढ़ें: " : "On our partner site: "}
        <a href="https://pocketjyotish.in/rashifal/" target="_blank" rel={REL} className={cls}>
          {hi ? "आज का राशिफल" : "Today's rashifal"}
        </a>
        {hi ? " और " : " and "}
        <a href="https://pocketjyotish.in/milan/" target="_blank" rel={REL} className={cls}>
          {hi ? "कुंडली मिलान" : "kundli milan"}
        </a>
        .
      </p>
    </aside>
  );
}

/** Desktop only. Hidden below 1536px so phones never get it. */
export function PartnerSidebar({ lang }: { lang: "hi" | "en" }) {
  const hi = lang === "hi";
  return (
    <div className="partner-sidebar absolute bottom-0 left-full top-40 ml-6 hidden w-[260px] 2xl:block" aria-hidden={false}>
      <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
        {label(hi)}
        <p className="mb-2 font-semibold text-gray-900">{hi ? "आज का राशिफल" : "Aaj ka Rashifal"}</p>
        <p className="mb-3">{hi ? "अपनी राशि का दैनिक फल हमारी पार्टनर साइट पर देखें." : "Read your daily sign forecast on our partner site."}</p>
        <a href="https://pocketjyotish.in/rashifal/" target="_blank" rel={REL} className="font-semibold text-blue-700 underline">
          {hi ? "राशिफल देखें" : "See rashifal"}
        </a>
      </div>
    </div>
  );
}

/** One small text line at the end of price guides. No image, no iframe. */
export function PartnerPriceLine({ lang }: { lang: "hi" | "en" }) {
  const hi = lang === "hi";
  return (
    <p className="partner-price-line my-6 text-sm text-gray-600" aria-label="Partner">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Partner:</span>
      <a
        href="https://pocketjyotish.in/rashifal/?utm_source=dalimss&utm_medium=price_guide"
        target="_blank"
        rel={REL}
        className="text-blue-700 underline underline-offset-2"
      >
        {hi ? "Pocket Jyotish पर अपना मुफ्त दैनिक राशिफल देखें" : "Check your free daily rashifal on Pocket Jyotish"}
      </a>
    </p>
  );
}
