// pages/news-sitemap.xml.ts
// Google News sitemap: articles from the last 2 days only.

import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import { decodeEntities } from "@/lib/decodeEntities";
import { xmlEscape } from "@/lib/xml";
import { SITE_URL, canonicalArticleSlug, toISOWithTZ } from "@/lib/seo";
import { validDate } from "@/lib/sitemapDates";

const NewsSitemap = () => null;

const PUBLICATION_NAME = "Dalimss News";

function isPublicSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-+[a-z0-9]+)*$/.test(slug);
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const articles = await prisma.article.findMany({
    where: {
      createdAt: {
        gte: twoDaysAgo,
        lte: now,
      },
    },
    select: {
      slug: true,
      title: true,
      createdAt: true,
      language: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1000,
  });

  const byLoc = new Map<
    string,
    { loc: string; title: string; createdAt: Date; language: string; canonical: boolean }
  >();

  for (const article of articles) {
    const title = decodeEntities(article.title).trim();
    const publishedAt = validDate(article.createdAt);
    const slug = canonicalArticleSlug(article.slug);
    if (!title || !publishedAt || !isPublicSlug(slug)) continue;
    if (publishedAt < twoDaysAgo || publishedAt > now) continue;

    const loc = `${SITE_URL}/articles/${slug}`;
    const existing = byLoc.get(loc);
    const canonical = article.slug === slug;
    if (existing && (existing.canonical || !canonical)) continue;

    byLoc.set(loc, {
      loc,
      title,
      createdAt: publishedAt,
      language: article.language === "hi" ? "hi" : "en",
      canonical,
    });
  }

  const urls = Array.from(byLoc.values())
    .map(
      (article) => `
    <url>
      <loc>${xmlEscape(article.loc)}</loc>
      <news:news>
        <news:publication>
          <news:name>${xmlEscape(PUBLICATION_NAME)}</news:name>
          <news:language>${article.language}</news:language>
        </news:publication>
        <news:publication_date>${xmlEscape(toISOWithTZ(article.createdAt))}</news:publication_date>
        <news:title>${xmlEscape(article.title)}</news:title>
      </news:news>
    </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>
`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600"
  );
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default NewsSitemap;
