import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { articleUrl, submitIndexNow } from "@/lib/indexnow";
import { revalidateArticlePaths } from "@/lib/revalidate";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ error: "Missing slug" });
  }

  try {
    // User can delete only their own articles (OR admin)
    const article = await prisma.article.findUnique({ where: { slug } });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (article.authorId !== userId && role !== "admin") {
      return res.status(403).json({ error: "Forbidden: You cannot delete this." });
    }

    await prisma.article.delete({ where: { slug } });

    await revalidateArticlePaths(res, article);
    await submitIndexNow([articleUrl(article.slug)]);

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ error: "Delete failed" });
  }
}
