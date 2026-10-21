import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  WORDS_PER_MINUTE,
  countReadableWords,
  planReadTimeBackfill,
  readTimeMinutes,
} from "./readTime";

function words(count: number, word = "alpha"): string[] {
  return Array.from({ length: count }, () => word);
}

/** The old create-path formula: raw HTML characters, not visible words. */
function legacyCharacterMinutes(content: string): number {
  return Math.max(1, Math.ceil(content.length / 500));
}

{
  assert.equal(countReadableWords(null), 0);
  assert.equal(countReadableWords(undefined), 0);
  assert.equal(countReadableWords(""), 0);
  assert.equal(countReadableWords("   \n\t  "), 0);
  assert.equal(readTimeMinutes(null), 1);
  assert.equal(readTimeMinutes(""), 1);
  assert.equal(readTimeMinutes("<p>Hi</p>"), 1);
}

{
  assert.ok(WORDS_PER_MINUTE >= 200 && WORDS_PER_MINUTE <= 230);
}

{
  const html = `<p>${words(904).join(" ")}</p>`;
  assert.equal(countReadableWords(html), 904);
  assert.equal(readTimeMinutes(html), 4);
  assert.ok(legacyCharacterMinutes(html) > readTimeMinutes(html));
}

{
  // ~670–710 visible words were stored as 10 or 11 minutes under the
  // character formula. The shared helper stays near a 220 wpm estimate.
  for (const count of [670, 700, 710]) {
    const html = words(count)
      .map((word) => `<span>${word}</span>`)
      .join("");
    assert.equal(countReadableWords(html), count);
    assert.equal(readTimeMinutes(html), 3);
    const legacy = legacyCharacterMinutes(html);
    assert.ok(
      legacy >= readTimeMinutes(html) + 3,
      `expected character formula to inflate ${count} words, got ${legacy}`
    );
  }
}

{
  const html =
    "<style>.x{color:red}</style><script>const words = 'one two three four';</script>" +
    "<p>Visible <strong>sentence</strong> only.</p>" +
    "<!-- hidden words in a comment -->";
  assert.equal(countReadableWords(html), 3);
}

{
  const markdown =
    "Read the [city desk](https://dalimss.news/articles/example) report. ![photo](https://cdn.example/a.jpg)";
  assert.equal(countReadableWords(markdown), 5);
}

{
  assert.equal(countReadableWords("<p>AT&amp;T filed&nbsp;today</p>"), 3);
  assert.equal(countReadableWords("<p>Hello&mdash;world</p>"), 2);
}

{
  const hindi = "<p>वाराणसी में आज यातायात प्रभावित रहा।</p>";
  assert.equal(countReadableWords(hindi), 6);
  assert.equal(readTimeMinutes(hindi), 1);
  // A danda separates words even when the space is missing.
  assert.equal(countReadableWords("वाराणसी।यातायात"), 2);
  // Numeric character references are letters, not one word per entity.
  assert.equal(
    countReadableWords("&#2357;&#2366;&#2352;&#2366;&#2339;&#2360;&#2368; में"),
    2
  );
  assert.equal(countReadableWords("कीमत &#x0967;&#x0968;&#x0969; रुपये"), 3);
  const hindiBody = `<p>${words(440, "वाराणसी").join(" ")}</p>`;
  assert.equal(countReadableWords(hindiBody), 440);
  assert.equal(readTimeMinutes(hindiBody), 2);
}

{
  const html = `<article><p>${words(700).join(" ")}</p></article>`;
  const stored = legacyCharacterMinutes(html);
  const changes = planReadTimeBackfill([
    {
      id: 11,
      slug: "india-post-blue-dart-parcel-delivery-agreement-hindi",
      content: html,
      readTimeInMinutes: stored,
    },
    {
      id: 12,
      slug: "already-correct",
      content: html,
      readTimeInMinutes: readTimeMinutes(html),
    },
  ]);
  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0], {
    id: 11,
    slug: "india-post-blue-dart-parcel-delivery-agreement-hindi",
    from: stored,
    to: 3,
  });
  const again = planReadTimeBackfill([
    {
      id: 11,
      slug: changes[0].slug,
      content: html,
      readTimeInMinutes: changes[0].to,
    },
  ]);
  assert.deepEqual(again, []);
}

{
  const roots = ["pages", "lib", "scripts"];
  const writers: { file: string; expression: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx|js|mjs)$/.test(entry) || entry.endsWith(".test.ts")) continue;
      const source = readFileSync(full, "utf8");
      assert.equal(
        source.includes("content.length / 500"),
        false,
        `${full} still estimates read time from raw characters`
      );
      source.split("\n").forEach((line) => {
        const match = line.match(/readTimeInMinutes:\s*([^,]+)/);
        if (!match) return;
        const expression = match[1].trim().replace(/;$/, "");
        if (
          expression === "true" ||
          expression === "number" ||
          expression === "article.readTimeInMinutes" ||
          expression === "a.readTimeInMinutes"
        ) {
          return;
        }
        writers.push({ file: full.split(path.sep).join("/"), expression });
      });
    }
  };
  roots.forEach(walk);

  assert.deepEqual(
    writers.map((writer) => writer.file).sort(),
    [
      "pages/api/articles/edit.ts",
      "pages/api/articles/index.ts",
      "pages/api/posts.ts",
    ]
  );
  for (const writer of writers) {
    assert.equal(writer.expression, "readTimeMinutes(content)");
  }
}

console.log("readTime checks passed");
