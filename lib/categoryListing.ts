import { Category } from "@/lib/categories";
import { englishArticleWhere } from "@/lib/articleLanguage";
import { listingSlugNotIn } from "@/lib/listingExclusions";
import {
  CATEGORY_ARCHIVE_PAGE_SIZE,
  isListingPageInRange,
  listingTotalPages,
  listingWindow,
} from "@/lib/pagination";
import prisma from "@/lib/prisma";
import { canonicalAuthorName } from "@/lib/seo";
import { Article } from "@/types";
import { Prisma } from "@prisma/client";

export function categoryArticleWhere(
  category: Category
): Prisma.ArticleWhereInput {
  return {
    AND: [
      englishArticleWhere,
      { slug: listingSlugNotIn() },
      {
        OR: category.dbValues.map((val) => ({
          category: {
            contains: val,
            mode: "insensitive" as const,
          },
        })),
      },
    ],
  };
}

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
  metaTitle: true,
  metaDescription: true,
  focusKeyword: true,
} satisfies Prisma.ArticleSelect;

export type CategoryListing = {
  articles: Article[];
  totalCount: number;
  totalPages: number;
  page: number;
};

/**
 * One page of a /category/* archive.
 * Returns null when the page is past the last story.
 */
export async function loadCategoryListing(
  category: Category,
  page: number
): Promise<CategoryListing | null> {
  const where = categoryArticleWhere(category);
  const totalCount = await prisma.article.count({ where });
  const totalPages = listingTotalPages(totalCount, CATEGORY_ARCHIVE_PAGE_SIZE);
  if (!isListingPageInRange(page, totalCount, CATEGORY_ARCHIVE_PAGE_SIZE)) {
    return null;
  }

  const { skip, take } = listingWindow(page, CATEGORY_ARCHIVE_PAGE_SIZE);
  const articles = await prisma.article.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take,
    select: articleSelect,
  });

  return {
    page,
    totalCount,
    totalPages,
    articles: articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      content: article.content,
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
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      focusKeyword: article.focusKeyword,
    })),
  };
}
