/** Read-only scan: npx tsx scripts/find-broken-internal-links.ts */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import prisma from "../lib/prisma";
import { internalArticleSlugs } from "../lib/internalArticleLinks";

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filename);
    return /\.[jt]sx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? [filename] : [];
  }));
  return nested.flat();
}

async function main() {
  // Article has no draft/status column. All stored slugs are live targets,
  // including duplicate copies omitted from the sitemap.
  const articles = await prisma.article.findMany({
    select: { slug: true, content: true },
  });
  const existing = new Set(articles.map((article) => article.slug));
  const broken: { source: string; target: string }[] = [];
  const scan = (source: string, content: string) => {
    for (const slug of internalArticleSlugs(content)) {
      if (!existing.has(slug)) broken.push({ source, target: `/articles/${slug}` });
    }
  };
  articles.forEach((article) => scan(`/articles/${article.slug}`, article.content));
  const files = (await Promise.all(["pages", "components", "lib"].map(sourceFiles))).flat();
  for (const filename of files) scan(filename, await readFile(filename, "utf8"));
  broken.forEach((link) => console.log(`${link.source} -> ${link.target}`));
  console.log(`Scanned ${articles.length} articles and ${files.length} source files. Found ${broken.length} broken internal links.`);
  if (broken.length) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error("Internal link scan failed:", error);
  process.exitCode = 2;
}).finally(() => prisma.$disconnect());
