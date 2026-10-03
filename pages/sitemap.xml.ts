// pages/sitemap.xml.ts
// Indexable https://dalimss.news URLs only. lastmod is a real content date or omitted.

import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import { CATEGORIES, getCategoriesByDbValue } from "@/lib/categories";
import {
  authorNameVariants,
  authorSlug,
  canonicalArticleSlug,
  canonicalAuthorName,
  articleModifiedAt,
} from "@/lib/seo";
import { LISTING_PAGE_SIZE, listingPath } from "@/lib/pagination";
import { activeStoryWhere } from "@/lib/storyLifetime";
import { xmlEscape } from "@/lib/xml";
import {
  bulkUpdatedAtMillis,
  contentLastMod,
  laterDate,
  maxDate,
} from "@/lib/sitemapDates";

const BASE_URL = "https://dalimss.news";

const Sitemap = () => null;

type ArticleRow = {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  category: string | null;
  customAuthor: string | null;
  language: string;
  lastmod: Date | null;
};

type UrlEntry = {
  loc: string;
  lastmod: Date | null;
  changefreq: string;
  priority: string;
};

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

/**
 * Slug of the public author page that lists this byline.
 * Case and stray whitespace resolve to the canonical name. A byline the
 * author route would not match, such as one with extra punctuation, stays out.
 */
function authorPageSlug(name: string): string | null {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  const slug = authorSlug(normalized);
  if (!slug) return null;
  const lookup = canonicalAuthorName(slugToName(slug));
  const accepted = new Set(
    authorNameVariants(lookup).map((variant) =>
      variant.trim().replace(/\s+/g, " ").toLowerCase()
    )
  );
  if (!accepted.has(normalized.toLowerCase())) return null;
  return slug;
}

function isPublicSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-+[a-z0-9]+)*$/.test(slug);
}

function absoluteUrl(path: string): string {
  if (!path) return BASE_URL;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Canonical https URL, or a listing page query of ?page=2 and later. */
function isAllowedSitemapLoc(loc: string): boolean {
  if (loc === BASE_URL) return true;
  if (!loc.startsWith(`${BASE_URL}/`) || loc.includes("www.") || loc.includes("http://")) {
    return false;
  }
  const pathAndQuery = loc.slice(BASE_URL.length);
  const [path, query] = pathAndQuery.split("?");
  if (!path || path.endsWith("/") || pathAndQuery.split("?").length > 2) return false;
  // RSS feeds and llms.txt are not HTML pages. Discover them via link
  // rel="alternate" and /llms.txt, not as urlset locs.
  if (path === "/llms.txt" || path.endsWith("/feed.xml") || path === "/feed.xml") {
    return false;
  }
  if (path === "/search" || path.startsWith("/search/")) return false;
  if (!query) return true;
  if (/(^|&)search=/.test(query)) return false;
  return (
    /^page=([2-9]|[1-9]\d+)$/.test(query) &&
    (path === "/articles" || path === "/hindi")
  );
}

function renderUrl(entry: UrlEntry): string {
  const lastmod = entry.lastmod
    ? `\n        <lastmod>${xmlEscape(entry.lastmod.toISOString())}</lastmod>`
    : "";
  return `
      <url>
        <loc>${xmlEscape(entry.loc)}</loc>${lastmod}
      </url>`;
}

function listingEntries(
  pathname: string,
  items: ArticleRow[],
  totalCount: number,
  changefreq: string,
  priority: string
): UrlEntry[] {
  const pageCount = Math.max(1, Math.ceil(totalCount / LISTING_PAGE_SIZE));
  const entries: UrlEntry[] = [];
  for (let page = 1; page <= pageCount; page += 1) {
    const slice = items.slice(
      (page - 1) * LISTING_PAGE_SIZE,
      page * LISTING_PAGE_SIZE
    );
    entries.push({
      loc: absoluteUrl(listingPath(pathname, page)),
      lastmod: maxDate(slice.map((item) => item.lastmod)),
      changefreq,
      priority: page === 1 ? priority : "0.5",
    });
  }
  return entries;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [articles, stories, podcastEpisodes] = await Promise.all([
    prisma.article.findMany({
      select: {
        slug: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        customAuthor: true,
        language: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    prisma.webStory.findMany({
      where: activeStoryWhere(),
      select: {
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.podcastEpisode.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const bulkUpdatedAt = bulkUpdatedAtMillis(
    articles.map((article) => article.updatedAt)
  );

  const preparedArticles: ArticleRow[] = articles.map((article) => ({
    ...article,
    lastmod: contentLastMod(article, bulkUpdatedAt),
  }));

  const articleUrls = new Map<string, UrlEntry & { canonical: boolean }>();
  for (const article of preparedArticles) {
    const slug = canonicalArticleSlug(article.slug);
    if (!isPublicSlug(slug)) continue;
    const loc = absoluteUrl(`/articles/${slug}`);
    const canonical = article.slug === slug;
    const existing = articleUrls.get(loc);
    if (existing?.canonical) continue;
    if (existing && !canonical) continue;
    articleUrls.set(loc, {
      loc,
      lastmod: articleModifiedAt(article.createdAt, article.updatedAt),
      changefreq: "daily",
      priority: "0.8",
      canonical,
    });
  }

  const englishArticles = preparedArticles.filter(
    (article) => article.language !== "hi"
  );
  const hindiArticles = preparedArticles.filter(
    (article) => article.language === "hi"
  );

  const categoryLastMod = new Map<string, Date | null>();
  for (const article of englishArticles) {
    for (const category of getCategoriesByDbValue(article.category)) {
      categoryLastMod.set(
        category.slug,
        laterDate(categoryLastMod.get(category.slug), article.lastmod)
      );
    }
  }

  const authors = new Map<string, ArticleRow[]>();
  for (const article of preparedArticles) {
    if (!article.customAuthor?.trim()) continue;
    const slug = authorPageSlug(article.customAuthor);
    if (!slug) continue;
    const bucket = authors.get(slug) || [];
    bucket.push(article);
    authors.set(slug, bucket);
  }

  const newestArticle = maxDate(englishArticles.map((article) => article.lastmod));
  const episodeLastMods = podcastEpisodes.map((episode) =>
    contentLastMod(episode, new Set())
  );
  const newestEpisode = maxDate(episodeLastMods);

  const staticPages: UrlEntry[] = [
    { path: "", priority: "1.0", freq: "hourly", lastmod: newestArticle },
    { path: "/ott", priority: "0.9", freq: "daily", lastmod: newestEpisode },
    { path: "/about", priority: "0.5", freq: "monthly", lastmod: null },
    { path: "/ownership", priority: "0.5", freq: "monthly", lastmod: null },
    { path: "/contact", priority: "0.5", freq: "monthly", lastmod: null },
    { path: "/privacy-policy", priority: "0.3", freq: "monthly", lastmod: null },
    { path: "/editorial-policy", priority: "0.5", freq: "monthly", lastmod: null },
    { path: "/corrections-policy", priority: "0.5", freq: "monthly", lastmod: null },
    { path: "/authors", priority: "0.5", freq: "weekly", lastmod: newestArticle },
    { path: "/terms-and-conditions", priority: "0.3", freq: "monthly", lastmod: null },
    { path: "/advertise-with-us", priority: "0.3", freq: "monthly", lastmod: null },
    {
      path: "/varanasi-news",
      priority: "0.9",
      freq: "hourly",
      lastmod: categoryLastMod.get("varanasi") || null,
    },
    {
      path: "/gurugram-news",
      priority: "0.9",
      freq: "hourly",
      lastmod: categoryLastMod.get("gurgaon") || null,
    },
    { path: "/bhu-news", priority: "0.8", freq: "hourly", lastmod: null },
    { path: "/varanasi-infrastructure", priority: "0.8", freq: "hourly", lastmod: null },
    { path: "/kashi-vishwanath-news", priority: "0.8", freq: "hourly", lastmod: null },
    { path: "/varanasi-airport-news", priority: "0.8", freq: "hourly", lastmod: null },
  ].map((page) => ({
    loc: absoluteUrl(page.path),
    lastmod: page.lastmod,
    changefreq: page.freq,
    priority: page.priority,
  }));

  const articleListing = listingEntries(
    "/articles",
    englishArticles,
    englishArticles.length,
    "hourly",
    "0.9"
  );
  const articlePageUrls = articleListing.slice(1);
  const hindiListing = listingEntries(
    "/hindi",
    hindiArticles,
    hindiArticles.length,
    "hourly",
    "0.9"
  );

  const authorUrls = Array.from(authors.entries()).flatMap(([slug, rows]) => {
    const ordered = [...rows].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const [firstPage] = listingEntries(
      `/author/${slug}`,
      ordered,
      ordered.length,
      "weekly",
      "0.5"
    );
    return firstPage ? [firstPage] : [];
  });

  const storyUrls: UrlEntry[] = stories.flatMap((story) => {
    if (!isPublicSlug(story.slug)) return [];
    return [
      {
        loc: absoluteUrl(`/stories/${story.slug}`),
        lastmod: contentLastMod(story, new Set()),
        changefreq: "daily",
        priority: "0.8",
      },
    ];
  });

  const episodeUrls: UrlEntry[] = podcastEpisodes.flatMap((episode, index) => {
    if (!isPublicSlug(episode.slug)) return [];
    return [
      {
        loc: absoluteUrl(`/ott/${episode.slug}`),
        lastmod: episodeLastMods[index] || null,
        changefreq: "weekly",
        priority: "0.8",
      },
    ];
  });

  // Keep empty category pages out of the sitemap until an English article matches.
  const categoryUrls: UrlEntry[] = CATEGORIES.filter((category) =>
    englishArticles.some((article) => {
      const haystack = (article.category || "").toLowerCase();
      return category.dbValues.some((value) =>
        haystack.includes(value.toLowerCase())
      );
    })
  ).map((category) => ({
    loc: absoluteUrl(`/category/${category.slug}`),
    lastmod: categoryLastMod.get(category.slug) || null,
    changefreq: "hourly",
    priority: String(category.priority),
  }));

  const entries = [
    ...staticPages,
    ...articleListing.slice(0, 1),
    ...hindiListing.slice(0, 1),
    ...categoryUrls,
    ...articlePageUrls,
    ...hindiListing.slice(1),
    ...authorUrls,
    ...storyUrls,
    ...episodeUrls,
    ...Array.from(articleUrls.values()).map(
      ({ loc, lastmod, changefreq, priority }) => ({
        loc,
        lastmod,
        changefreq,
        priority,
      })
    ),
  ];

  const seen = new Set<string>();
  const uniqueEntries = entries.filter((entry) => {
    if (!isAllowedSitemapLoc(entry.loc) || seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${uniqueEntries
    .map(renderUrl)
    .join("")}
</urlset>
`;

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=600, stale-while-revalidate=1200"
  );
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default Sitemap;
