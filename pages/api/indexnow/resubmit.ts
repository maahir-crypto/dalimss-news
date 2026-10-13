import { timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { articleUrl, submitIndexNow } from "@/lib/indexnow";
import { SITE_URL } from "@/lib/seo";
import { authOptions } from "../auth/[...nextauth]";

const EDITOR_EMAILS = new Set([
  "admin@dalimss.com",
  "sushantgaurav@dalimss.com",
  "dalimsssushant@gmail.com",
]);

function isNewsroomUser(user: {
  role?: string | null;
  email?: string | null;
} | undefined): boolean {
  if (!user) return false;
  return (
    user.role === "admin" ||
    user.role === "editor" ||
    EDITOR_EMAILS.has(user.email || "")
  );
}

function indexNowSecretMatches(provided: unknown): boolean {
  const expected = process.env.INDEXNOW_KEY;
  if (typeof provided !== "string" || !expected) return false;
  const given = Buffer.from(provided);
  const actual = Buffer.from(expected);
  if (given.length === 0 || given.length !== actual.length) return false;
  return timingSafeEqual(given, actual);
}

/**
 * Resubmit the latest published articles to IndexNow.
 * Newsroom sessions (admin or editor) are accepted. A `?secret=` query
 * matching INDEXNOW_KEY is accepted when there is no newsroom session.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const newsroom = isNewsroomUser(session?.user);
  const secretOk = indexNowSecretMatches(req.query.secret);

  if (!newsroom && !secretOk) {
    if (session?.user) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return res.status(401).json({ error: "Unauthorized" });
  }

  const articles = await prisma.article.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
    select: { slug: true },
  });

  const urls = [
    ...articles.map((article) => articleUrl(article.slug)),
    `${SITE_URL}/`,
  ];

  const status = await submitIndexNow(urls);
  return res.status(200).json({ status, urls: urls.length });
}
