import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { put } from "@vercel/blob";
import { revalidateArticlePaths } from "@/lib/revalidate";

/**
 * Admin-only migration endpoint.
 * Finds articles & web stories still using Cloudinary URLs,
 * downloads each image, re-uploads to Vercel Blob, and updates the DB.
 *
 * Processes in batches to avoid serverless function timeouts.
 *
 * Usage: POST /api/admin/migrate-cloudinary
 * Body options:
 *   { "dryRun": true }       — preview without changes
 *   { "batchSize": 10 }      — migrate N items per call (default: 10)
 *
 * Call repeatedly until "remaining" reaches 0.
 */

export const config = {
  maxDuration: 60, // Allow up to 60s on Vercel (Pro plan) or 10s on Hobby
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth check – admin only
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isAdmin =
    (session.user as any).role === "admin" ||
    session.user.email === "admin@dalimss.com" ||
    session.user.email === "sushantgaurav@dalimss.com" ||
    session.user.email === "dalimsssushant@gmail.com";

  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  const dryRun = req.body?.dryRun === true;
  const batchSize = Math.min(Math.max(req.body?.batchSize || 10, 1), 50); // clamp 1-50

  const results = {
    batchSize,
    dryRun,
    articles: { total: 0, migrated: 0, failed: [] as any[], remaining: 0 },
    webStoryCovers: { total: 0, migrated: 0, failed: [] as any[], remaining: 0 },
    webStoryPages: { total: 0, migrated: 0, failed: [] as any[], remaining: 0 },
  };

  try {
    // ─── 1. Migrate Article mediaUrls (batched) ─────────────────
    const totalArticles = await prisma.article.count({
      where: { mediaUrl: { contains: "cloudinary" } },
    });
    results.articles.total = totalArticles;

    const articles = await prisma.article.findMany({
      where: { mediaUrl: { contains: "cloudinary" } },
      select: { id: true, title: true, mediaUrl: true, slug: true },
      take: batchSize,
      orderBy: { id: "asc" },
    });

    for (const article of articles) {
      if (!article.mediaUrl) continue;

      try {
        if (dryRun) {
          results.articles.migrated++;
          continue;
        }

        const newUrl = await downloadAndReupload(article.mediaUrl, "dalimss-news");

        await prisma.article.update({
          where: { id: article.id },
          data: { mediaUrl: newUrl },
        });
        await revalidateArticlePaths(res, { slug: article.slug });

        results.articles.migrated++;
        console.log(`✅ Article #${article.id} migrated`);
      } catch (err: any) {
        results.articles.failed.push({
          id: article.id,
          title: article.title,
          error: err.message,
        });
        console.error(`❌ Article #${article.id} failed:`, err.message);
      }
    }

    results.articles.remaining = dryRun
      ? totalArticles
      : totalArticles - results.articles.migrated;

    // ─── 2. Migrate WebStory cover images (batched) ─────────────
    const totalCovers = await prisma.webStory.count({
      where: { coverImage: { contains: "cloudinary" } },
    });
    results.webStoryCovers.total = totalCovers;

    const webStories = await prisma.webStory.findMany({
      where: { coverImage: { contains: "cloudinary" } },
      select: { id: true, title: true, coverImage: true },
      take: batchSize,
      orderBy: { id: "asc" },
    });

    for (const story of webStories) {
      try {
        if (dryRun) {
          results.webStoryCovers.migrated++;
          continue;
        }

        const newUrl = await downloadAndReupload(story.coverImage, "web-stories");

        await prisma.webStory.update({
          where: { id: story.id },
          data: { coverImage: newUrl },
        });

        results.webStoryCovers.migrated++;
        console.log(`✅ WebStory #${story.id} cover migrated`);
      } catch (err: any) {
        results.webStoryCovers.failed.push({
          id: story.id,
          title: story.title,
          error: err.message,
        });
      }
    }

    results.webStoryCovers.remaining = dryRun
      ? totalCovers
      : totalCovers - results.webStoryCovers.migrated;

    // ─── 3. Migrate WebStoryPage images (batched) ───────────────
    const totalPages = await prisma.webStoryPage.count({
      where: { imageUrl: { contains: "cloudinary" } },
    });
    results.webStoryPages.total = totalPages;

    const storyPages = await prisma.webStoryPage.findMany({
      where: { imageUrl: { contains: "cloudinary" } },
      select: { id: true, storyId: true, imageUrl: true },
      take: batchSize,
      orderBy: { id: "asc" },
    });

    for (const page of storyPages) {
      try {
        if (dryRun) {
          results.webStoryPages.migrated++;
          continue;
        }

        const newUrl = await downloadAndReupload(page.imageUrl, "web-stories");

        await prisma.webStoryPage.update({
          where: { id: page.id },
          data: { imageUrl: newUrl },
        });

        results.webStoryPages.migrated++;
        console.log(`✅ StoryPage #${page.id} migrated`);
      } catch (err: any) {
        results.webStoryPages.failed.push({
          id: page.id,
          storyId: page.storyId,
          error: err.message,
        });
      }
    }

    results.webStoryPages.remaining = dryRun
      ? totalPages
      : totalPages - results.webStoryPages.migrated;

    const totalRemaining =
      results.articles.remaining +
      results.webStoryCovers.remaining +
      results.webStoryPages.remaining;

    return res.status(200).json({
      message: dryRun
        ? "Dry run complete – no changes made"
        : totalRemaining === 0
        ? "✅ Migration fully complete!"
        : `Batch complete. ${totalRemaining} items remaining – call again to continue.`,
      ...results,
    });
  } catch (err: any) {
    console.error("❌ Migration error:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Downloads an image from a URL and re-uploads it to Vercel Blob.
 */
async function downloadAndReupload(sourceUrl: string, folder: string): Promise<string> {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());

  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "video/mp4": "mp4",
  };
  const ext = extMap[contentType] || "png";

  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const blob = await put(filename, buffer, {
    access: "public",
    contentType,
  });

  return blob.url;
}
