import { waitUntil } from "@vercel/functions";
import { getCategoriesByDbValue } from "@/lib/categories";
import { SITE_URL, authorSlug, canonicalArticleSlug } from "@/lib/seo";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_TIMEOUT_MS = 4000;
const HOST = "dalimss.news";

export function articleUrl(slug: string): string {
  return `${SITE_URL}/articles/${canonicalArticleSlug(slug)}`;
}

/**
 * Article URL plus the pages that actually list it.
 * Hindi stories are indexed on /hindi and the author page. English stories
 * are indexed on the homepage, /articles, and their category pages.
 */
export function indexNowUrlsForArticle(article: {
  slug: string;
  category?: string | null;
  customAuthor?: string | null;
  language?: string | null;
}): string[] {
  const urls = [articleUrl(article.slug)];
  const author = article.customAuthor ? authorSlug(article.customAuthor) : "";
  if (author) urls.push(`${SITE_URL}/author/${author}`);

  if (article.language === "hi") {
    urls.push(`${SITE_URL}/hindi`);
    return urls;
  }

  urls.push(`${SITE_URL}/`, `${SITE_URL}/articles`);
  getCategoriesByDbValue(article.category).forEach((category) => {
    urls.push(`${SITE_URL}/category/${category.slug}`);
  });
  return urls;
}

/**
 * POST the URL list to IndexNow.
 * Runs only when INDEXNOW_ENABLED=true and VERCEL_ENV=production.
 * Never throws. Uses a short timeout so a slow IndexNow response cannot hang a caller.
 * Returns the IndexNow HTTP status, or null when the ping is skipped or fails.
 */
export async function submitIndexNow(urls: string[]): Promise<number | null> {
  try {
    if (process.env.INDEXNOW_ENABLED !== "true") return null;
    if (process.env.VERCEL_ENV !== "production") return null;

    const key = process.env.INDEXNOW_KEY;
    const urlList = Array.from(
      new Set(
        urls.filter(
          (url) => typeof url === "string" && url.startsWith(`https://${HOST}/`)
        )
      )
    );
    if (!key || urlList.length === 0) return null;

    const submitted = urlList.slice(0, 10000);
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `https://${HOST}/${key}.txt`,
        urlList: submitted,
      }),
      signal: AbortSignal.timeout(INDEXNOW_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(
        new Error(`IndexNow ${response.status} ${submitted.length} urls`)
      );
      return response.status;
    }

    console.log(`IndexNow ${response.status} ${submitted.length} urls`);
    return response.status;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Schedule the IndexNow ping without blocking the response.
 * waitUntil keeps the Vercel function alive after the route returns; a bare
 * floating promise is frozen when the serverless invocation ends.
 */
export function notifyIndexNow(urls: string[]): void {
  waitUntil(submitIndexNow(urls));
}
