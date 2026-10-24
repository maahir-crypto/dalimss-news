import prisma from "@/lib/prisma";
import { decodeEntities } from "@/lib/decodeEntities";
import { loadPriceHubCandidates } from "@/lib/priceHubData";
import { PRICE_INDEX, priceHubSummaries } from "@/lib/priceHubs";
import {
  renderPriceGuideSection,
  selectPriceGuides,
} from "@/lib/llmsPriceGuides";
import {
  SITE_URL,
  articleMetaDescription,
  canonicalArticleSlug,
} from "@/lib/seo";

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

const PRICE_GUIDE_CANDIDATES = 500;

/** Newest phone, car, scooter, bike and appliance price guides for /llms.txt. */
export async function priceGuideMarkdown(): Promise<string> {
  const [rows, candidates] = await Promise.all([
    prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: "price", mode: "insensitive" } },
          { tags: { contains: "price", mode: "insensitive" } },
        ],
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PRICE_GUIDE_CANDIDATES,
      select: {
        slug: true,
        title: true,
        tags: true,
        createdAt: true,
      },
    }),
    loadPriceHubCandidates(),
  ]);

  const summaries = priceHubSummaries(candidates);
  const hubLinks =
    summaries.length === 0
      ? []
      : [
          {
            label: "All price guides",
            href: `${SITE_URL}${PRICE_INDEX.path}`,
          },
          ...summaries.map((summary) => ({
            label: summary.hub.llmsLabel,
            href: `${SITE_URL}${summary.hub.path}`,
          })),
        ];

  return renderPriceGuideSection(selectPriceGuides(rows), hubLinks);
}

export function buildLlmsFull(lines: string[]): string {
  const articles = ["## Articles", "", ...lines].join("\n");
  return `${LLMS_FULL_INTRO}\n\n${articles}\n`;
}
