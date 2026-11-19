import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PreferredSourceButton from "../components/PreferredSourceButton";

describe("official preferred source badge", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const lang of ["en", "hi"] as const) {
      it(`renders the ${theme} ${lang} badge with a stable box and safe link`, () => {
        const markup = renderToStaticMarkup(
          React.createElement(PreferredSourceButton, { theme, lang })
        );
        const language = lang === "hi" ? "HI" : "en";
        const base = `google_preferred_source_badge_${theme}_${language}`;
        const height = lang === "hi" ? 106 : 107;

        assert.ok(markup.includes('href="https://www.google.com/preferences/source?q=dalimss.news"'));
        assert.ok(markup.includes('target="_blank"'));
        assert.ok(markup.includes('rel="noopener"'));
        assert.ok(markup.includes(`src="/preferred-source/${base}.png"`));
        assert.ok(markup.includes(`srcSet="/preferred-source/${base}@2x.png 2x"`));
        assert.ok(markup.includes(`alt="${lang === "hi" ? "पसंदीदा स्रोत के रूप में जोड़ें" : "Add as Preferred Source"}"`));
        assert.match(markup, /<a[^>]*style="[^"]*width:100%;max-width:338px;height:auto;aspect-ratio:338 \/ 107;flex-shrink:0;align-items:center;justify-content:center/);
        assert.ok(markup.includes(`width="338" height="${height}"`));
        assert.ok(markup.includes('loading="lazy" decoding="async"'));
        assert.ok(markup.includes("object-fit:contain"));
        assert.doesNotMatch(markup, /<script|publisher\.(?:js|mjs)/i);

        for (const suffix of ["", "@2x"]) {
          const png = readFileSync(new URL(`../public/preferred-source/${base}${suffix}.png`, import.meta.url));
          assert.equal(png.toString("hex", 0, 8), "89504e470d0a1a0a");
          assert.equal(png.readUInt32BE(16), suffix ? 676 : 338);
          assert.equal(png.readUInt32BE(20), suffix ? (lang === "hi" ? 212 : 213) : height);
        }
      });
    }
  }
});
