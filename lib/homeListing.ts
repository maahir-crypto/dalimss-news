import { englishArticleWhere } from "@/lib/articleLanguage";
import { listingExcerpt } from "@/lib/pagination";
import prisma from "@/lib/prisma";
import { canonicalAuthorName } from "@/lib/seo";
import { activeStoryWhere } from "@/lib/storyLifetime";
import { Article } from "@/types";
import { Prisma } from "@prisma/client";

const HOME_PAGE_SIZE = 15;

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

export type HomePageProps = {
  articles: Article[];
  stories: HomeStory[];
  searchQuery: string;
};

function searchWhere(searchQuery: string): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = { ...englishArticleWhere };
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

export async function loadHomePage(searchQuery: string): Promise<HomePageProps> {
  const [rows, stories] = await Promise.all([
    prisma.article.findMany({
      where: searchWhere(searchQuery),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: HOME_PAGE_SIZE,
      select: {
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
      },
    }),
    prisma.webStory.findMany({
      where: activeStoryWhere(),
      include: { pages: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const articles: Article[] = rows.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
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
  }));

  return {
    articles,
    searchQuery,
    stories: stories.map((story) => ({
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
    })),
  };
}
