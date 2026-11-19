import React from "react";

interface PreferredSourceButtonProps {
  theme: "light" | "dark";
  lang: "en" | "hi";
}

export default function PreferredSourceButton({
  theme,
  lang,
}: PreferredSourceButtonProps) {
  const assetLanguage = lang === "hi" ? "HI" : "en";
  const asset = `/preferred-source/google_preferred_source_badge_${theme}_${assetLanguage}`;
  const imageHeight = lang === "hi" ? 106 : 107;

  return (
    <a
      href="https://www.google.com/preferences/source?q=dalimss.news"
      target="_blank"
      rel="noopener"
      style={{
        display: "inline-flex",
        width: "100%",
        maxWidth: 338,
        height: "auto",
        aspectRatio: "338 / 107",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={`${asset}.png`}
        srcSet={`${asset}@2x.png 2x`}
        alt={lang === "hi" ? "पसंदीदा स्रोत के रूप में जोड़ें" : "Add as Preferred Source"}
        width={338}
        height={imageHeight}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </a>
  );
}
