/**
 * Instagram reel / post URL helpers for article-body embeds.
 * Facades load Instagram's embed.js only after a user click.
 */

export type InstagramEmbedKind = "reel" | "post";

export type InstagramPermalink = {
  kind: InstagramEmbedKind;
  /** Shortcode from the path (e.g. DQaBcDeFgHi). */
  shortcode: string;
  /** Canonical https://www.instagram.com/{p|reel}/{shortcode}/ URL. */
  url: string;
};

const IG_PATH =
  /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)\/?(?:[?#].*)?$/i;

/** Parse a bare Instagram reel or post URL. Returns null for anything else. */
export function parseInstagramPermalink(input: string | null | undefined): InstagramPermalink | null {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  const match = trimmed.match(IG_PATH);
  if (!match) return null;
  const kind: InstagramEmbedKind = match[1].toLowerCase() === "reel" ? "reel" : "post";
  const shortcode = match[2];
  return {
    kind,
    shortcode,
    url: `https://www.instagram.com/${kind === "reel" ? "reel" : "p"}/${shortcode}/`,
  };
}

/**
 * True when a paragraph's visible content is only an Instagram permalink
 * (plain text, or a single <a> whose href is that permalink).
 */
export function isInstagramOnlyParagraphText(text: string | null | undefined): boolean {
  return parseInstagramPermalink(text) !== null;
}

/** Pull a permalink from Instagram's official blockquote embed markup. */
export function permalinkFromInstagramBlockquote(attrs: {
  className?: string | null;
  "data-instgrm-permalink"?: string | null;
  cite?: string | null;
}): InstagramPermalink | null {
  const fromData = parseInstagramPermalink(attrs["data-instgrm-permalink"] || "");
  if (fromData) return fromData;
  const fromCite = parseInstagramPermalink(attrs.cite || "");
  if (fromCite) return fromCite;
  const className = String(attrs.className || "");
  if (/\binstagram-media\b/i.test(className)) {
    // Class alone is not enough without a URL; callers should also scan children.
    return null;
  }
  return null;
}

/**
 * Rewrite pasted HTML from Instagram's embed snippet (or a lone URL) into a
 * plain paragraph that holds only the canonical permalink. TipTap's default
 * schema drops blockquote data-* attrs and <script>; this keeps the link.
 */
export function sanitizeInstagramPasteHtml(html: string): string {
  if (!html || !/instagram\.com/i.test(html)) return html;

  // Official embed: <blockquote class="instagram-media" data-instgrm-permalink="...">
  const blockquotePermalink = html.match(
    /data-instgrm-permalink=["']([^"']+)["']/i
  );
  if (blockquotePermalink) {
    const parsed = parseInstagramPermalink(blockquotePermalink[1]);
    if (parsed) return `<p>${parsed.url}</p>`;
  }

  // Embed wrapper or bare URL somewhere in the paste.
  const urlMatch = html.match(
    /https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\/[A-Za-z0-9_-]+\/?/i
  );
  if (urlMatch) {
    const parsed = parseInstagramPermalink(urlMatch[0]);
    if (parsed) {
      // If the paste is only that URL (optionally wrapped), collapse to one paragraph.
      const stripped = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (parseInstagramPermalink(stripped) || stripped === "" || stripped === parsed.url) {
        return `<p>${parsed.url}</p>`;
      }
    }
  }

  // Drop Instagram embed.js script tags even when we leave other HTML alone.
  return html.replace(
    /<script\b[^>]*src=["'][^"']*instagram\.com\/embed\.js[^"']*["'][^>]*>\s*<\/script>/gi,
    ""
  );
}

export const INSTAGRAM_EMBED_SCRIPT = "https://www.instagram.com/embed.js";
export const INSTAGRAM_EMBED_TAG = "instagram-embed";
