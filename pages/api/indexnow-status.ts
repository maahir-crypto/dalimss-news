import type { NextApiRequest, NextApiResponse } from "next";
import {
  INDEXNOW_STATUS_CACHE_CONTROL,
  getIndexNowStatus,
} from "../../lib/indexnow";

/**
 * Public read-only IndexNow configuration check.
 * Does not submit URLs and does not return the key. robots.txt disallows /api/.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Cache-Control", INDEXNOW_STATUS_CACHE_CONTROL);
  res.status(200).json(await getIndexNowStatus());
}
