import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { rehypeFigureGallery } from "./rehypeFigureGallery";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  INSTAGRAM_EMBED_SCRIPT,
  INSTAGRAM_EMBED_TAG,
  isInstagramOnlyParagraphText,
  parseInstagramPermalink,
  permalinkFromInstagramBlockquote,
  sanitizeInstagramPasteHtml,
} from "./instagramEmbed";
import {
  instagramPermalinkFromBlockquote,
  instagramPermalinkFromParagraph,
  rehypeInstagramEmbed,
  separateInstagramEmbedsFromAdSlots,
} from "./rehypeInstagramEmbed";
import { rehypeAdSlots } from "./rehypeAdSlots";

{
  assert.deepEqual(parseInstagramPermalink("https://www.instagram.com/reel/DQaBcDeFgHi/"), {
    kind: "reel",
    shortcode: "DQaBcDeFgHi",
    url: "https://www.instagram.com/reel/DQaBcDeFgHi/",
  });
  assert.deepEqual(parseInstagramPermalink("https://instagram.com/p/AbCdEfGhIjK/?img_index=1"), {
    kind: "post",
    shortcode: "AbCdEfGhIjK",
    url: "https://www.instagram.com/p/AbCdEfGhIjK/",
  });
  assert.equal(parseInstagramPermalink("https://www.instagram.com/dalimss.news.banaras/"), null);
  assert.equal(parseInstagramPermalink("https://example.com/reel/nope"), null);
  assert.equal(isInstagramOnlyParagraphText("https://www.instagram.com/reel/DQaBcDeFgHi/"), true);
  assert.equal(isInstagramOnlyParagraphText("See https://www.instagram.com/reel/DQaBcDeFgHi/"), false);
}

{
  const fromData = permalinkFromInstagramBlockquote({
    className: "instagram-media",
    "data-instgrm-permalink": "https://www.instagram.com/reel/DQaBcDeFgHi/",
  });
  assert.equal(fromData?.kind, "reel");
  assert.equal(fromData?.shortcode, "DQaBcDeFgHi");
}

{
  const embedPaste = `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DQaBcDeFgHi/?utm_source=ig_embed" data-instgrm-version="14"><a href="https://www.instagram.com/reel/DQaBcDeFgHi/">View</a></blockquote><script async src="//www.instagram.com/embed.js"></script>`;
  assert.equal(
    sanitizeInstagramPasteHtml(embedPaste),
    "<p>https://www.instagram.com/reel/DQaBcDeFgHi/</p>"
  );
  assert.equal(
    sanitizeInstagramPasteHtml("https://www.instagram.com/p/AbCdEfGhIjK/"),
    "<p>https://www.instagram.com/p/AbCdEfGhIjK/</p>"
  );
  assert.equal(
    sanitizeInstagramPasteHtml('<p>Hello <a href="https://example.com">x</a></p>'),
    '<p>Hello <a href="https://example.com">x</a></p>'
  );
  assert.ok(!sanitizeInstagramPasteHtml(embedPaste).includes("embed.js"));
  assert.equal(INSTAGRAM_EMBED_SCRIPT, "https://www.instagram.com/embed.js");
  assert.equal(INSTAGRAM_EMBED_TAG, "instagram-embed");
}

{
  const pText = {
    type: "element",
    tagName: "p",
    children: [{ type: "text", value: "https://www.instagram.com/reel/DQaBcDeFgHi/" }],
  };
  assert.equal(instagramPermalinkFromParagraph(pText)?.shortcode, "DQaBcDeFgHi");

  const pLink = {
    type: "element",
    tagName: "p",
    children: [
      {
        type: "element",
        tagName: "a",
        properties: { href: "https://www.instagram.com/p/AbCdEfGhIjK/" },
        children: [{ type: "text", value: "https://www.instagram.com/p/AbCdEfGhIjK/" }],
      },
    ],
  };
  assert.equal(instagramPermalinkFromParagraph(pLink)?.kind, "post");

  const normal = {
    type: "element",
    tagName: "p",
    children: [{ type: "text", value: "A normal paragraph about Varanasi." }],
  };
  assert.equal(instagramPermalinkFromParagraph(normal), null);

  const bq = {
    type: "element",
    tagName: "blockquote",
    properties: {
      className: ["instagram-media"],
      "data-instgrm-permalink": "https://www.instagram.com/reel/DQaBcDeFgHi/",
    },
    children: [],
  };
  assert.equal(instagramPermalinkFromBlockquote(bq)?.kind, "reel");
}

{
  const children: any[] = [
    { type: "element", tagName: "p", children: [{ type: "text", value: "P1" }] },
    { type: "element", tagName: "ad-slot", properties: { index: "1" }, children: [] },
    {
      type: "element",
      tagName: "instagram-embed",
      properties: { permalink: "https://www.instagram.com/reel/DQaBcDeFgHi/", kind: "reel" },
      children: [],
    },
    { type: "element", tagName: "p", children: [{ type: "text", value: "P2" }] },
  ];
  separateInstagramEmbedsFromAdSlots(children);
  const tags = children.map((c) => c.tagName);
  assert.ok(!tags.includes(undefined));
  const embedAt = tags.indexOf("instagram-embed");
  const adAt = tags.indexOf("ad-slot");
  assert.ok(embedAt >= 0 && adAt >= 0);
  assert.notEqual(Math.abs(embedAt - adAt), 1);
}

{
  const p = (t: string) => ({
    type: "element",
    tagName: "p",
    properties: {},
    children: [{ type: "text", value: t }],
  });
  const nl = () => ({ type: "text", value: "\n" });
  const tree: any = {
    type: "root",
    children: [
      p("Intro one."),
      nl(),
      p("Intro two."),
      nl(),
      p("Intro three."),
      nl(),
      p("https://www.instagram.com/reel/DQaBcDeFgHi/"),
      nl(),
      p("Intro five."),
      nl(),
      p("Intro six."),
      nl(),
      {
        type: "element",
        tagName: "blockquote",
        properties: {
          className: ["instagram-media"],
          "data-instgrm-permalink": "https://www.instagram.com/p/AbCdEfGhIjK/",
        },
        children: [
          {
            type: "element",
            tagName: "a",
            properties: { href: "https://www.instagram.com/p/AbCdEfGhIjK/" },
            children: [{ type: "text", value: "View" }],
          },
        ],
      },
      nl(),
      p("Outro."),
    ],
  };

  rehypeAdSlots({ after: [3, 7] })()(tree);
  rehypeInstagramEmbed()()(tree);

  const elements = tree.children.filter((c: any) => c.type === "element");
  const tags = elements.map((c: any) => c.tagName);
  assert.ok(tags.includes("instagram-embed"));
  assert.ok(tags.includes("ad-slot"));

  const embeds = elements.filter((c: any) => c.tagName === "instagram-embed");
  assert.equal(embeds.length, 2);
  assert.equal(embeds[0].properties.kind, "reel");
  assert.equal(embeds[0].properties.permalink, "https://www.instagram.com/reel/DQaBcDeFgHi/");
  assert.equal(embeds[1].properties.kind, "post");

  for (let i = 0; i < elements.length; i++) {
    if (elements[i].tagName !== "instagram-embed") continue;
    const prev = elements[i - 1]?.tagName;
    const next = elements[i + 1]?.tagName;
    assert.notEqual(prev, "ad-slot", `embed adjacent before at ${i}`);
    assert.notEqual(next, "ad-slot", `embed adjacent after at ${i}`);
  }
}

{
  // Article template wires the facade and does not load embed.js on page load.
  const src = readFileSync(new URL("../pages/articles/[slug].tsx", import.meta.url), "utf8");
  assert.ok(src.includes("rehypeInstagramEmbed"));
  assert.ok(src.includes("InstagramEmbedFacade"));
  assert.ok(src.includes('"instagram-embed"'));
  assert.equal(src.includes("instagram.com/embed.js"), false);
  assert.equal(/src=\{`https:\/\/www\.instagram\.com\/p\/\$\{/.test(src), false);

  const facade = readFileSync(
    new URL("../components/InstagramEmbedFacade.tsx", import.meta.url),
    "utf8"
  );
  assert.ok(facade.includes("loadInstagramEmbedScript"));
  assert.ok(facade.includes("Watch on Instagram"));
  assert.ok(facade.includes("aspect-[4/5]"));

  const editor = readFileSync(
    new URL("../components/RichTextEditor.tsx", import.meta.url),
    "utf8"
  );
  assert.ok(editor.includes("sanitizeInstagramPasteHtml"));
  assert.ok(editor.includes("transformPastedHTML"));
}


{
  // End-to-end ReactMarkdown + rehypePlugins render check: body text, inline
  // Instagram links, and standalone Instagram embeds must all render non-empty.
  const html = renderToStaticMarkup(
    React.createElement(
      ReactMarkdown,
      {
        rehypePlugins: [
          rehypeRaw as any,
          rehypeFigureGallery,
          rehypeAdSlots({ after: [3, 7] }),
          rehypeInstagramEmbed(),
        ],
      },
      `<p>VARANASI: Lead paragraph.</p><p><a href="https://www.instagram.com/dalimss.news.banaras/reel/Df6pF4FSLzX/">Watch the video on Instagram</a> | Field reporting.</p><p>https://www.instagram.com/reel/DQaBcDeFgHi/</p><p>Closing paragraph.</p>`
    )
  );
  assert.ok(html.includes("VARANASI: Lead paragraph."), "lead paragraph missing");
  assert.ok(html.includes("https://www.instagram.com/dalimss.news.banaras/reel/Df6pF4FSLzX/"), "inline reel link missing");
  assert.ok(html.includes("Closing paragraph."), "closing paragraph missing");
  assert.ok(html.includes("instagram-embed"), "standalone embed marker missing");
}

console.log("instagramEmbed.test.ts ok");
