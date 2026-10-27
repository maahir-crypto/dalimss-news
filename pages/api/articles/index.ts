import { readTimeMinutes } from "@/lib/readTime";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import { getCategoryBySlug, getCategoryByDbValue } from "@/lib/categories";
import { indexNowUrlsForArticle, notifyIndexNow } from "@/lib/indexnow";
import { revalidateArticlePaths } from "@/lib/revalidate";
import { articleCreateFields } from "@/lib/articleCreateInput";
import { createUniqueArticleSlug } from "@/lib/articleSlugs";
import { normalizeArticleSources } from "@/lib/articleSources";
import { englishArticleWhere } from "@/lib/articleLanguage";
import {
  articleCreateFailureResponse,
  logArticleCreateError,
} from "@/lib/createArticleError";
import { canonicalAuthorName, stripForMeta } from "@/lib/seo";
import { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ----------- CREATE ARTICLE (POST) -----------
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { role, email } = session.user;
    const isAdminCaller =
      role === "admin" ||
      email === "admin@dalimss.com" ||
      email === "sushantgaurav@dalimss.com" ||
      email === "dalimsssushant@gmail.com";
    const isAuthorized = isAdminCaller || role === "editor";

    if (!isAuthorized) {
       return res.status(403).json({ error: "Forbidden: Admins or Editors only" });
    }

    const draft = articleCreateFields(req.body);
    const {
      title,
      content,
      mediaUrl,
      mediaType,
      mediaItems,
      category,
      customAuthor,
      metaTitle,
      metaDescription,
      focusKeyword,
      tags,
      imageAltText,
      imageCaption,
      slug,
      sourceUrl,
      rawSources,
      sourceUrls,
      reportingBasis,
      language,
    } = draft;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: "Content is too short" });
    }

    const byline = canonicalAuthorName(customAuthor);
    if (byline.length < 2 || /\b(admin|ai|bot|automation)\b/i.test(byline)) {
      return res.status(400).json({
        error: "An accountable public byline is required; administrative or automated bylines are not accepted",
      });
    }

    const cleanMetaDescription = stripForMeta(metaDescription || "", 160);
    const cleanMetaTitle = stripForMeta(metaTitle || title, 110);
    if (cleanMetaDescription.length < 50) {
      return res.status(400).json({
        error: "A plain-language editorial summary of at least 50 characters is required",
      });
    }

    if (mediaType !== "video" && !String(imageAltText || "").trim()) {
      return res.status(400).json({
        error: "Descriptive image alt text is required for the lead image",
      });
    }
    if (mediaType !== "video" && !String(imageCaption || "").trim()) {
      return res.status(400).json({
        error: "A factual caption is required for the lead image",
      });
    }

    if (!reportingBasis || reportingBasis.trim().length < 30) {
      return res.status(400).json({
        error:
          "A specific reporting basis is required (official document, interview, on-ground reporting, data or named statement).",
      });
    }

    if (!["en", "hi"].includes(language)) {
      return res.status(400).json({ error: "Article language must be English or Hindi" });
    }
    if (
      sourceUrl &&
      normalizeArticleSources([{ label: "Primary source", url: sourceUrl }])
        .length === 0
    ) {
      return res.status(400).json({ error: "Primary source URL is invalid" });
    }

    try {
      const finalSlug = await createUniqueArticleSlug(slug || title);
      if (
        Array.isArray(rawSources) &&
        rawSources.length > 0 &&
        sourceUrls.length !== rawSources.length
      ) {
        return res.status(400).json({
          error: "Every source needs a descriptive label and a valid HTTP(S) URL",
        });
      }

      const authorId =
        typeof session.user.id === "string" && session.user.id
          ? session.user.id
          : null;

      const article = await prisma.article.create({
        data: {
          title,
          content,
          slug: finalSlug,
          sourceUrl,
          sourceUrls: sourceUrls as unknown as Prisma.InputJsonValue,
          reportingBasis: reportingBasis.trim(),
          language,
          mediaUrl,
          mediaType,
          ...(mediaItems !== undefined ? { mediaItems } : {}),
          category,
          customAuthor: byline,
          metaTitle: cleanMetaTitle,
          metaDescription: cleanMetaDescription,
          focusKeyword,
          tags,
          imageAltText: stripForMeta(imageAltText || "", 200),
          imageCaption: stripForMeta(imageCaption || "", 240),
          readTimeInMinutes: readTimeMinutes(content),
          authorId,
        },
      });

      try {
        notifyIndexNow(indexNowUrlsForArticle(article));
        await revalidateArticlePaths(res, article);
      } catch (postCreateError) {
        // The row is already committed. IndexNow and cache refresh must not
        // turn a successful insert into "Create failed".
        console.error("Article created but post-create refresh failed:", postCreateError);
      }

      return res.status(200).json(article);
    } catch (err) {
      logArticleCreateError(err);
      return res.status(500).json(articleCreateFailureResponse(err, isAdminCaller));
    }
  }

  // ----------- GET ALL ARTICLES -----------
  const { category, search, page, limit } = req.query;
  const where: any = { ...englishArticleWhere };

  if (category) {
    const matchedCategory = getCategoryBySlug(String(category)) || getCategoryByDbValue(String(category));
    if (matchedCategory) {
      where.OR = matchedCategory.dbValues.map((val) => ({
        category: { contains: val, mode: "insensitive" as const },
      }));
    } else {
      where.category = {
        contains: String(category),
        mode: "insensitive" as const,
      };
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } }, 
      { content: { contains: String(search), mode: 'insensitive' } },
      { focusKeyword: { contains: String(search), mode: 'insensitive' } },
      { metaTitle: { contains: String(search), mode: 'insensitive' } },
      { metaDescription: { contains: String(search), mode: 'insensitive' } },
      { category: { contains: String(search), mode: 'insensitive' } },
      { customAuthor: { contains: String(search), mode: 'insensitive' } },
      { author: { name: { contains: String(search), mode: 'insensitive' } } },
    ];
  }

  // Pagination logic
  const pageInt = parseInt(page as string) || 1;
  const limitInt = parseInt(limit as string); 
  
  const queryOptions: any = {
    where,
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" } // Tie-breaker for stable pagination
    ],
  };

  if (limitInt) {
    queryOptions.take = limitInt;
    queryOptions.skip = (pageInt - 1) * limitInt;
  }

  console.log(`Fetching articles: page=${pageInt}, limit=${limitInt}, skip=${queryOptions.skip}, take=${queryOptions.take}`);

  const articles = await prisma.article.findMany(queryOptions);

  return res.json(articles);
}
