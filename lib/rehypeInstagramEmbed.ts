import {
  INSTAGRAM_EMBED_TAG,
  parseInstagramPermalink,
  type InstagramPermalink,
} from "./instagramEmbed";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type HastRoot = {
  type?: string;
  children?: HastNode[];
};

function isWhitespaceText(node: HastNode): boolean {
  return node.type === "text" && !String(node.value || "").trim();
}

function isElement(node: HastNode, tag: string): boolean {
  return node.type === "element" && node.tagName === tag;
}

function textContent(node: HastNode): string {
  if (node.type === "text") return String(node.value || "");
  if (!node.children) return "";
  return node.children.map(textContent).join("");
}

function classList(node: HastNode): string {
  const raw = node.properties?.className;
  if (Array.isArray(raw)) return raw.map(String).join(" ");
  if (typeof raw === "string") return raw;
  return "";
}

function hrefOf(node: HastNode): string {
  const href = node.properties?.href;
  return typeof href === "string" ? href : "";
}

/** Paragraph whose only content is an Instagram permalink (text or one link). */
export function instagramPermalinkFromParagraph(node: HastNode): InstagramPermalink | null {
  if (!isElement(node, "p")) return null;
  const kids = (node.children || []).filter((c) => !isWhitespaceText(c));
  if (kids.length === 0) return null;

  if (kids.length === 1 && kids[0].type === "text") {
    return parseInstagramPermalink(String(kids[0].value || ""));
  }

  if (kids.length === 1 && isElement(kids[0], "a")) {
    const fromHref = parseInstagramPermalink(hrefOf(kids[0]));
    if (fromHref) return fromHref;
    return parseInstagramPermalink(textContent(kids[0]).trim());
  }

  // TipTap sometimes wraps: <p><a>url</a></p> with trailing empty text already filtered.
  if (kids.every((k) => k.type === "text" || isElement(k, "a"))) {
    const urls = kids
      .map((k) => {
        if (k.type === "text") return parseInstagramPermalink(String(k.value || ""));
        if (isElement(k, "a")) {
          return parseInstagramPermalink(hrefOf(k)) || parseInstagramPermalink(textContent(k).trim());
        }
        return null;
      })
      .filter(Boolean) as InstagramPermalink[];
    if (urls.length === 1 && kids.length <= 2) return urls[0];
  }

  return null;
}

/** Official Instagram blockquote embed, or a blockquote that only holds the permalink. */
export function instagramPermalinkFromBlockquote(node: HastNode): InstagramPermalink | null {
  if (!isElement(node, "blockquote")) return null;
  const props = node.properties || {};
  const fromData = parseInstagramPermalink(
    typeof props["data-instgrm-permalink"] === "string"
      ? props["data-instgrm-permalink"]
      : ""
  );
  if (fromData) return fromData;

  if (/\binstagram-media\b/i.test(classList(node))) {
    // Scan descendant anchors for the permalink.
    const stack = [...(node.children || [])];
    while (stack.length) {
      const cur = stack.pop()!;
      if (isElement(cur, "a")) {
        const hit =
          parseInstagramPermalink(hrefOf(cur)) ||
          parseInstagramPermalink(textContent(cur).trim());
        if (hit) return hit;
      }
      if (cur.children) stack.push(...cur.children);
    }
  }

  // Lone permalink inside a blockquote.
  const only = (node.children || []).filter((c) => !isWhitespaceText(c));
  if (only.length === 1) {
    if (only[0].type === "text") return parseInstagramPermalink(String(only[0].value || ""));
    if (isElement(only[0], "a") || isElement(only[0], "p")) {
      return (
        parseInstagramPermalink(hrefOf(only[0])) ||
        parseInstagramPermalink(textContent(only[0]).trim()) ||
        (isElement(only[0], "p") ? instagramPermalinkFromParagraph(only[0]) : null)
      );
    }
  }

  return null;
}

function embedNode(permalink: InstagramPermalink): HastNode {
  return {
    type: "element",
    tagName: INSTAGRAM_EMBED_TAG,
    properties: {
      permalink: permalink.url,
      kind: permalink.kind,
      shortcode: permalink.shortcode,
    },
    children: [],
  };
}

function isAdSlot(node: HastNode | undefined): boolean {
  return !!node && isElement(node, "ad-slot");
}

function isEmbed(node: HastNode | undefined): boolean {
  return !!node && isElement(node, INSTAGRAM_EMBED_TAG);
}

function nearestNonWhitespace(children: HastNode[], from: number, dir: -1 | 1): number {
  let j = from;
  while (j >= 0 && j < children.length && isWhitespaceText(children[j])) j += dir;
  return j;
}

/**
 * Move Instagram embeds so they are never the previous or next sibling of an
 * <ad-slot> (ignoring whitespace text nodes).
 */
export function separateInstagramEmbedsFromAdSlots(children: HastNode[]): void {
  for (let round = 0; round < children.length; round += 1) {
    let changed = false;
    for (let i = 0; i < children.length; i += 1) {
      if (!isEmbed(children[i])) continue;
      const prev = nearestNonWhitespace(children, i - 1, -1);
      const next = nearestNonWhitespace(children, i + 1, 1);
      const prevIsAd = prev >= 0 && isAdSlot(children[prev]);
      const nextIsAd = next < children.length && isAdSlot(children[next]);
      if (!prevIsAd && !nextIsAd) continue;

      const [embed] = children.splice(i, 1);
      let adPos: number;
      if (nextIsAd) {
        adPos = next > i ? next - 1 : next;
      } else {
        adPos = prev > i ? prev - 1 : prev;
      }
      let insertAt = adPos + 1;
      while (insertAt < children.length && isWhitespaceText(children[insertAt])) {
        insertAt += 1;
      }
      // Was immediately after the ad: skip one more real block so we stay clear.
      if (prevIsAd && insertAt < children.length && !isAdSlot(children[insertAt])) {
        insertAt += 1;
        while (insertAt < children.length && isWhitespaceText(children[insertAt])) {
          insertAt += 1;
        }
      }
      children.splice(Math.min(insertAt, children.length), 0, embed);
      changed = true;
      break;
    }
    if (!changed) break;
  }
}

/**
 * Convert Instagram-only paragraphs and Instagram blockquote embeds into
 * <instagram-embed> markers, then keep them off AdSense <ad-slot> neighbors.
 * Run after rehypeAdSlots.
 */
export function rehypeInstagramEmbed() {
  return function rehypeInstagramEmbedPlugin() {
    return function transformer(tree: HastRoot) {
      const children = tree.children;
      if (!Array.isArray(children)) return;

      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const fromP = instagramPermalinkFromParagraph(node);
        if (fromP) {
          children[i] = embedNode(fromP);
          continue;
        }
        const fromBq = instagramPermalinkFromBlockquote(node);
        if (fromBq) {
          children[i] = embedNode(fromBq);
        }
      }

      separateInstagramEmbedsFromAdSlots(children);
    };
  };
}
