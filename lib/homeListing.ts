import { hindiArticleWhere, englishArticleWhere } from "@/lib/articleLanguage";
import { getCategoryBySlug } from "@/lib/categories";
import { listingSlugNotIn } from "@/lib/listingExclusions";
import { applyListingPins } from "@/lib/listingPins";
import { cleanHubListingTitle } from "@/lib/listingTitle";
import { listingExcerpt } from "@/lib/pagination";
import prisma from "@/lib/prisma";
import { canonicalAuthorName } from "@/lib/seo";
import { activeStoryWhere } from "@/lib/storyLifetime";
import { TOPIC_HUBS } from "@/lib/topicHubs";
import { Article } from "@/types";
import { Prisma } from "@prisma/client";

const HOME_PAGE_SIZE = 15;
const LOCAL_LEAD_SIZE = 8;
const SECTION_SIZE = 4;

export type HomeStory = {
  id: number;
  slug: string;
  title: string;
  coverImage: string;
  published: boolean;
  createdAt: string;
  pages: {
    id: number;
    imageUrl: string;
    heading: string | null;
    text: string | null;
  }[];
};

export type HomeSection = {
  key: string;
  title: string;
  href: string;
  articles: Article[];
};

export type HomePageProps = {
  articles: Article[];
  localArticles: Article[];
  sections: HomeSection[];
  stories: HomeStory[];
  searchQuery: string;
};

const articleSelect = {
  id: true,
  slug: true,
  title: true,
  content: true,
  mediaUrl: true,
  mediaType: true,
  readTimeInMinutes: true,
  category: true,
  customAuthor: true,
  createdAt: true,
  language: true,
} satisfies Prisma.ArticleSelect;

function searchWhere(searchQuery: string): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = {
    ...englishArticleWhere,
    slug: listingSlugNotIn(),
  };
  const search = searchQuery.trim();
  if (!search) return where;
  where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { content: { contains: search, mode: "insensitive" } },
    { focusKeyword: { contains: search, mode: "insensitive" } },
    { metaTitle: { contains: search, mode: "insensitive" } },
    { metaDescription: { contains: search, mode: "insensitive" } },
    { category: { contains: search, mode: "insensitive" } },
    { customAuthor: { contains: search, mode: "insensitive" } },
    { author: { name: { contains: search, mode: "insensitive" } } },
  ];
  return where;
}

function hubKeywordWhere(hubSlug: "varanasi" | "gurugram"): Prisma.ArticleWhereInput {
  const hub = TOPIC_HUBS[hubSlug];
  return {
    OR: hub.keywords.flatMap((keyword) => [
      { title: { contains: keyword, mode: "insensitive" as const } },
      { category: { contains: keyword, mode: "insensitive" as const } },
      { focusKeyword: { contains: keyword, mode: "insensitive" as const } },
      { tags: { contains: keyword, mode: "insensitive" as const } },
      {
        slug: {
          contains: keyword.replace(/\s+/g, "-"),
          mode: "insensitive" as const,
        },
      },
    ]),
  };
}

function categoryWhere(categorySlug: string): Prisma.ArticleWhereInput {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { id: -1 };
  return {
    OR: category.dbValues.map((val) => ({
      category: { contains: val, mode: "insensitive" as const },
    })),
  };
}

function toArticle(
  article: {
    id: number;
    slug: string;
    title: string;
    content: string;
    mediaUrl: string | null;
    mediaType: string | null;
    readTimeInMinutes: number;
    category: string | null;
    customAuthor: string | null;
    createdAt: Date;
    language: string | null;
  },
  cleanTitle = false
): Article {
  return {
    id: article.id,
    slug: article.slug,
    title: cleanTitle ? cleanHubListingTitle(article.title) : article.title,
    content: listingExcerpt(article.content, 400),
    mediaUrl: article.mediaUrl,
    mediaType: article.mediaType as Article["mediaType"],
    createdAt: article.createdAt.toISOString(),
    authorName: canonicalAuthorName(
      article.customAuthor || "Dalimss News Desk"
    ),
    authorAvatarUrl: "",
    readTimeInMinutes: article.readTimeInMinutes,
    claps: 0,
    commentsCount: 0,
    category: article.category,
    language: article.language,
  };
}

export async function loadHomePage(searchQuery: string): Promise<HomePageProps> {
  const search = searchQuery.trim();

  if (search) {
    const [rows, stories] = await Promise.all([
      prisma.article.findMany({
        where: searchWhere(search),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: HOME_PAGE_SIZE,
        select: articleSelect,
      }),
      prisma.webStory.findMany({
        where: activeStoryWhere(),
        include: { pages: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return {
      articles: rows.map((row) => toArticle(row)),
      localArticles: [],
      sections: [],
      searchQuery: search,
      stories: mapStories(stories),
    };
  }

  const localWhere: Prisma.ArticleWhereInput = {
    AND: [
      englishArticleWhere,
      { slug: listingSlugNotIn() },
      {
        OR: [hubKeywordWhere("varanasi"), hubKeywordWhere("gurugram")],
      },
    ],
  };

  const techAutoWhere: Prisma.ArticleWhereInput = {
    AND: [
      englishArticleWhere,
      { slug: listingSlugNotIn() },
      { OR: [categoryWhere("technology"), categoryWhere("automotive")] },
    ],
  };

  const worldWhere: Prisma.ArticleWhereInput = {
    AND: [
      englishArticleWhere,
      { slug: listingSlugNotIn() },
      categoryWhere("world"),
    ],
  };

  const hindiWhere: Prisma.ArticleWhereInput = {
    AND: [hindiArticleWhere, { slug: listingSlugNotIn() }],
  };

  const [
    localRows,
    techAutoRows,
    hindiRows,
    worldRows,
    latestRows,
    stories,
  ] = await Promise.all([
    prisma.article.findMany({
      where: localWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: LOCAL_LEAD_SIZE + 5,
      select: articleSelect,
    }),
    prisma.article.findMany({
      where: techAutoWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: SECTION_SIZE,
      select: articleSelect,
    }),
    prisma.article.findMany({
      where: hindiWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: SECTION_SIZE,
      select: articleSelect,
    }),
    prisma.article.findMany({
      where: worldWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: SECTION_SIZE,
      select: articleSelect,
    }),
    prisma.article.findMany({
      where: {
        ...englishArticleWhere,
        slug: listingSlugNotIn(),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: HOME_PAGE_SIZE + LOCAL_LEAD_SIZE,
      select: articleSelect,
    }),
    prisma.webStory.findMany({
      where: activeStoryWhere(),
      include: { pages: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const localArticles = applyListingPins(localRows)
    .slice(0, LOCAL_LEAD_SIZE)
    .map((row) => toArticle(row, true));

  const localIds = new Set(localArticles.map((article) => article.id));
  const articles = latestRows
    .filter((row) => !localIds.has(row.id))
    .slice(0, HOME_PAGE_SIZE)
    .map((row) => toArticle(row));

  const sections: HomeSection[] = [
    {
      key: "tech-auto",
      title: "Tech & Auto",
      href: "/category/technology",
      articles: techAutoRows.map((row) => toArticle(row)),
    },
    {
      key: "hindi",
      title: "Hindi",
      href: "/hindi",
      articles: hindiRows.map((row) => toArticle(row)),
    },
    {
      key: "world",
      title: "World",
      href: "/category/world",
      articles: worldRows.map((row) => toArticle(row)),
    },
  ].filter((section) => section.articles.length > 0);

  return {
    articles,
    localArticles,
    sections,
    searchQuery: "",
    stories: mapStories(stories),
  };
}

function mapStories(
  stories: {
    id: number;
    slug: string;
    title: string;
    coverImage: string;
    published: boolean;
    createdAt: Date;
    pages: {
      id: number;
      imageUrl: string;
      heading: string | null;
      text: string | null;
    }[];
  }[]
): HomeStory[] {
  return stories.map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    coverImage: story.coverImage,
    published: story.published,
    createdAt: story.createdAt.toISOString(),
    pages: story.pages.map((page) => ({
      id: page.id,
      imageUrl: page.imageUrl,
      heading: page.heading,
      text: page.text,
    })),
  }));
}
