import { timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Body of https://dalimss.news/<INDEXNOW_KEY>.txt.
 * next.config rewrites /:key.txt here after real files such as /llms.txt.
 * The key is read from INDEXNOW_KEY on each request. 200 only when the
 * rewrite param equals that value; every other name is 404.
 * The handler does not log the request or the key.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).end();
    return;
  }

  const requested = typeof req.query.key === "string" ? req.query.key : "";
  const key = process.env.INDEXNOW_KEY;
  if (!key || !sameKey(requested, key)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.status(404).end();
    return;
  }

  const body = Buffer.from(key, "utf8");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Length", String(body.length));
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.status(200);
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  res.end(body);
}

function sameKey(requested: string, expected: string): boolean {
  const given = Buffer.from(requested);
  const actual = Buffer.from(expected);
  if (given.length === 0 || given.length !== actual.length) return false;
  return timingSafeEqual(given, actual);
}
