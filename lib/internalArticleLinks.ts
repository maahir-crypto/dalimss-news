/** Extract article targets from HTML, Markdown and static source strings. */
export function internalArticleSlugs(content: string): string[] {
  const targets = new Set<string>();
  const urls = content.match(/(?:https?:\/\/|\/\/)[^\s"'<>`\)\]]+|\/articles\/[^\s"'<>`\)\]]+/gi) || [];
  for (const raw of urls) {
    try {
      const url = new URL(raw.replace(/&amp;/g, "&"), "https://dalimss.news");
      if (url.hostname !== "dalimss.news" && url.hostname !== "www.dalimss.news") continue;
      const match = url.pathname.match(/^\/articles\/([^/]+)\/?$/);
      if (!match) continue;
      const slug = decodeURIComponent(match[1]);
      // Skip dynamic routes and template expressions in source files.
      if (!slug || /[\s${}\[\]:]/.test(slug)) continue;
      targets.add(slug);
    } catch {
      // Invalid URLs are not article targets.
    }
  }
  return Array.from(targets);
}
