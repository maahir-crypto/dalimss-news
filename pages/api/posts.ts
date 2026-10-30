import { readTimeMinutes } from "@/lib/readTime";

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { normalizeArticleSources } from "@/lib/articleSources";
import {
  canonicalAuthorName,
  stripForMeta,
} from "@/lib/seo";
import { Prisma } from "@prisma/client";
import { indexNowUrlsForArticle, notifyIndexNow } from "@/lib/indexnow";
import { revalidateArticlePaths } from "@/lib/revalidate";
import { findRepeatArticle } from "@/lib/findRepeatArticle";
import {
  findSameEventArticle,
  sameEventWarning,
  wantsSameEventOverride,
} from "@/lib/findSameEventArticle";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Validations
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check for Secret Key Authentication
  const secret = req.headers["x-api-key"] || req.query.key;
  // NOTE: User must set PIPELINE_SECRET in .env
  if (secret !== process.env.PIPELINE_SECRET) {
    return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }

  const {
    title,
    content,
    category,
    author,
    source_url,
    image_url,
    image_type,
    reporting_basis,
    language,
    editorial_summary,
    image_alt_text,
    image_caption,
    source_label,
    human_reviewed,
  } = req.body;

  if (!title || !content || !author || human_reviewed !== true) {
    return res.status(400).json({
      error: "A title, article content, accountable human byline and confirmed human editorial review are required",
    });
  }

  const byline = canonicalAuthorName(author);
  if (/\b(admin|ai|bot|automated|automation)\b/i.test(byline)) {
    return res.status(400).json({
      error:
        "Automated bylines are not accepted. Every article needs an accountable human byline.",
    });
  }

  if (!reporting_basis || reporting_basis.trim().length < 30) {
    return res.status(400).json({
      error:
        "A specific reporting_basis is required. Name the document, interview, on-ground reporting, data or response used.",
    });
  }

  const cleanSummary = stripForMeta(editorial_summary || "", 160);
  if (cleanSummary.length < 50) {
    return res.status(400).json({
      error: "A plain-language editorial_summary of at least 50 characters is required",
    });
  }

  try {
    // A repeat post returns the existing article instead of a second copy.
    const repeat = await findRepeatArticle({ title, content });
    if (repeat) {
      return res.status(200).json({ success: true, duplicate: true, article: repeat });
    }
    // A same-event rewrite from the last 72 hours gets a warning naming the
    // existing story. A real follow-up can pass allowSameEvent: true.
    if (!wantsSameEventOverride(req.body)) {
      const sameEvent = await findSameEventArticle({ title, content, category: category || "General News" });
      if (sameEvent) {
        return res.status(409).json(sameEventWarning(sameEvent));
      }
    }

    // Generate slug
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Date.now();

    // Determine basic logic for media type if not provided
    let mediaType = image_type || "image";
    if (image_url && !image_type) {
        if (image_url.includes("youtube") || image_url.includes("mp4")) {
            mediaType = "video";
        }
    }
    if (
      mediaType !== "video" &&
      (!String(image_alt_text || "").trim() ||
        !String(image_caption || "").trim())
    ) {
      return res.status(400).json({
        error: "A descriptive image_alt_text and factual image_caption are required",
      });
    }

    const sourceUrls = normalizeArticleSources(
      source_url
        ? [
            {
              label: source_label || "Original source material",
              url: source_url,
            },
          ]
        : []
    );
    if (source_url && sourceUrls.length === 0) {
      return res.status(400).json({ error: "source_url must be a valid HTTP(S) URL" });
    }

    // Create Article
    const article = await prisma.article.create({
      data: {
        title,
        content,
        slug,
        category: category || "General News",
        sourceUrl: source_url,
        sourceUrls: sourceUrls as unknown as Prisma.InputJsonValue,
        reportingBasis: reporting_basis.trim(),
        language: language === "hi" ? "hi" : "en",
        mediaUrl: image_url,
        mediaType: mediaType,
        customAuthor: byline,
        metaTitle: stripForMeta(title, 110),
        metaDescription: cleanSummary,
        imageAltText: stripForMeta(image_alt_text || "", 200),
        imageCaption: stripForMeta(image_caption || "", 240),
        readTimeInMinutes: readTimeMinutes(content),
      },
    });

    notifyIndexNow(indexNowUrlsForArticle(article));
    await revalidateArticlePaths(res, article);

    return res.status(200).json({ success: true, article });
  } catch (error) {
    console.error("Pipeline Publish Error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: (error as any).message });
  }
}
