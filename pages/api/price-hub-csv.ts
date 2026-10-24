import type { NextApiRequest, NextApiResponse } from "next";
import { setPublicPageCache } from "@/lib/publicCache";
import { loadPriceHubCandidates } from "@/lib/priceHubData";
import { articlesForHub, priceHubBySlug, priceHubCsv } from "@/lib/priceHubs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method not allowed");
    return;
  }

  const hubParam = req.query.hub;
  const slug = Array.isArray(hubParam) ? hubParam[0] : hubParam || "";
  const hub = priceHubBySlug(slug);
  if (!hub) {
    res.status(404).end("Not found");
    return;
  }

  const articles = articlesForHub(await loadPriceHubCandidates(), hub.slug);
  if (articles.length === 0) {
    res.status(404).end("Not found");
    return;
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${hub.slug}.csv"`
  );
  setPublicPageCache(req, res);
  res.status(200).send(priceHubCsv(articles));
}
