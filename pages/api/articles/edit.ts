import { readTimeMinutes } from "@/lib/readTime";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";
import { indexNowUrlsForArticle, notifyIndexNow } from "@/lib/indexnow";
import { createUniqueArticleSlug } from "@/lib/articleSlugs";
import { normalizeArticleSources } from "@/lib/articleSources";
import { canonicalAuthorName, stripForMeta } from "@/lib/seo";
import { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { slug, newSlug, title, content, mediaUrl, mediaType, mediaItems, customAuthor, category, metaTitle, metaDescription, focusKeyword, tags, imageAltText, imageCaption, sourceUrl, sourceUrls, reportingBasis, language } = req.body;

  if (!slug || !title || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const byline = canonicalAuthorName(String(customAuthor || ""));
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
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { authorId: true, slug: true, category: true, customAuthor: true },
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    const user = session.user as any;
    if (article.authorId !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: You do not own this article" });
    }

    const finalSlug = newSlug
      ? await createUniqueArticleSlug(newSlug, { ignoreSlug: article.slug })
      : undefined;
    const normalizedSources = normalizeArticleSources(sourceUrls);
    if (
      Array.isArray(sourceUrls) &&
      sourceUrls.length > 0 &&
      normalizedSources.length !== sourceUrls.length
    ) {
      return res.status(400).json({
        error: "Every source needs a descriptive label and a valid HTTP(S) URL",
      });
    }

    const updatedArticle = await prisma.article.update({
      where: { slug },
      data: {
        title,
        content,
        slug: finalSlug,
        sourceUrl: sourceUrl || null,
        sourceUrls: normalizedSources as unknown as Prisma.InputJsonValue,
        reportingBasis: reportingBasis.trim(),
        language,
        mediaUrl,
        mediaType,
        mediaItems: mediaItems || undefined,
        customAuthor: byline,
        category: category || undefined,
        metaTitle: cleanMetaTitle,
        readTimeInMinutes: readTimeMinutes(content),
        metaDescription: cleanMetaDescription,
        focusKeyword: focusKeyword || null,
        tags: tags || null,
        imageAltText: stripForMeta(imageAltText || "", 200) || null,
        imageCaption: stripForMeta(imageCaption || "", 240) || null,
      },
    });

    notifyIndexNow([
      ...indexNowUrlsForArticle(article),
      ...indexNowUrlsForArticle(updatedArticle),
    ]);

    return res.status(200).json(updatedArticle);
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
