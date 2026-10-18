import prisma from "@/lib/prisma";
import { decodeEntities } from "@/lib/decodeEntities";
import {
  SITE_URL,
  articleMetaDescription,
  canonicalArticleSlug,
} from "@/lib/seo";

/**
 * Existing /llms.txt body. Kept as published, then "## Latest articles" is appended.
 * This lives in code because a public/llms.txt file would be served instead of the page.
 */
export const LLMS_TXT_BODY = `# Dalimss News

Dalimss News is an Indian digital news publication specialising in Varanasi, Eastern Uttar Pradesh and Gurugram reporting.

## Primary Sections

- Varanasi News: https://dalimss.news/varanasi-news
- Gurugram News: https://dalimss.news/gurugram-news
- BHU News: https://dalimss.news/bhu-news
- Varanasi Infrastructure: https://dalimss.news/varanasi-infrastructure
- Kashi Vishwanath News: https://dalimss.news/kashi-vishwanath-news
- Varanasi Airport News: https://dalimss.news/varanasi-airport-news
- Uttar Pradesh: https://dalimss.news/category/uttar-pradesh
- Education: https://dalimss.news/category/education
- Technology: https://dalimss.news/category/technology
- Automotive: https://dalimss.news/category/automotive
- Lifestyle: https://dalimss.news/category/lifestyle
- World: https://dalimss.news/category/world
- OTT: https://dalimss.news/ott
- Hindi News: https://dalimss.news/hindi

## Editorial Information

- About: https://dalimss.news/about
- Authors: https://dalimss.news/authors
- Editorial Policy: https://dalimss.news/editorial-policy
- Corrections Policy: https://dalimss.news/corrections-policy
- Contact: https://dalimss.news/contact

## Leadership

- Founder and CEO: Maahir Madhok (https://dalimss.news/author/maahir-madhok)
- Editor-in-Chief: Saurav Yadav (https://dalimss.news/author/saurav-yadav)

## Feeds

- RSS: https://dalimss.news/feed.xml
- Hindi RSS: https://dalimss.news/hindi/feed.xml
- Varanasi RSS: https://dalimss.news/varanasi/feed.xml
- Gurugram RSS: https://dalimss.news/gurugram/feed.xml
- Education RSS: https://dalimss.news/education/feed.xml
- Technology RSS: https://dalimss.news/technology/feed.xml
- Lifestyle RSS: https://dalimss.news/lifestyle/feed.xml
- World RSS: https://dalimss.news/world/feed.xml
- OTT RSS: https://dalimss.news/ott/feed.xml
- Sitemap: https://dalimss.news/sitemap.xml
- News Sitemap: https://dalimss.news/news-sitemap.xml`;

const LLMS_FULL_INTRO = `# Dalimss News

Dalimss News is an Indian digital news publication specialising in Varanasi, Eastern Uttar Pradesh and Gurugram reporting.

## About and policies

- About: ${SITE_URL}/about
- Masthead: ${SITE_URL}/masthead
- Fact-checking: ${SITE_URL}/fact-checking
- Ownership: ${SITE_URL}/ownership
- Authors: ${SITE_URL}/authors
- Editorial policy: ${SITE_URL}/editorial-policy
- Corrections policy: ${SITE_URL}/corrections-policy
- Contact: ${SITE_URL}/contact
- Privacy policy: ${SITE_URL}/privacy-policy
- Terms and conditions: ${SITE_URL}/terms-and-conditions

## Sections

- Varanasi News: ${SITE_URL}/varanasi-news
- Gurugram News: ${SITE_URL}/gurugram-news
- BHU News: ${SITE_URL}/bhu-news
- Varanasi Infrastructure: ${SITE_URL}/varanasi-infrastructure
- Kashi Vishwanath News: ${SITE_URL}/kashi-vishwanath-news
- Varanasi Airport News: ${SITE_URL}/varanasi-airport-news
- Uttar Pradesh: ${SITE_URL}/category/uttar-pradesh
- Education: ${SITE_URL}/category/education
- Technology: ${SITE_URL}/category/technology
- Automotive: ${SITE_URL}/category/automotive
- Lifestyle: ${SITE_URL}/category/lifestyle
- World: ${SITE_URL}/category/world
- OTT: ${SITE_URL}/ott
- Hindi News: ${SITE_URL}/hindi
- Articles: ${SITE_URL}/articles`;

interface ArticleLineSource {
  slug: string;
  title: string;
  content: string;
  metaDescription: string | null;
  createdAt: Date;
}

function isPublicSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-+[a-z0-9]+)*$/.test(slug);
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Calendar date in India Standard Time, YYYY-MM-DD. */
export function formatIsoDateIST(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

function articleLine(article: ArticleLineSource): string | null {
  const slug = canonicalArticleSlug(article.slug);
  if (!isPublicSlug(slug)) return null;
  const title = oneLine(decodeEntities(article.title))
    .replace(/\[/g, "(")
    .replace(/\]/g, ")");
  if (!title) return null;
  const description =
    oneLine(
      articleMetaDescription({
        metaDescription: article.metaDescription,
        content: article.content,
      })
    ) || "A news report from Dalimss News.";
  const date = formatIsoDateIST(article.createdAt);
  return `- [${title}](${SITE_URL}/articles/${slug}) (${date}): ${description}`;
}

/** Latest published articles. Every row in Article is a published story. */
export async function latestArticleLines(take: number): Promise<string[]> {
  const rows = await prisma.article.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    select: {
      slug: true,
      title: true,
      content: true,
      metaDescription: true,
      createdAt: true,
    },
  });

  const lines: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const line = articleLine(row);
    if (!line) continue;
    const slug = canonicalArticleSlug(row.slug);
    if (seen.has(slug)) continue;
    seen.add(slug);
    lines.push(line);
  }
  return lines;
}

export function withLatestArticles(existing: string, lines: string[]): string {
  const block = ["## Latest articles", "", ...lines].join("\n");
  return `${existing.replace(/\s+$/, "")}\n\n${block}\n`;
}

export function buildLlmsFull(lines: string[]): string {
  const articles = ["## Articles", "", ...lines].join("\n");
  return `${LLMS_FULL_INTRO}\n\n${articles}\n`;
}
