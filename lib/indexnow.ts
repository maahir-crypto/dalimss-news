import { waitUntil } from "@vercel/functions";
import { getCategoriesByDbValue } from "@/lib/categories";
import { SITE_URL, authorSlug, canonicalArticleSlug } from "@/lib/seo";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_TIMEOUT_MS = 4000;
const HOST = "dalimss.news";

export const INDEXNOW_LOG_PREFIX = "[indexnow]";

/**
 * Public diagnostic response. It has no key and does not vary by user, so a
 * shared cache may store it. The TTL is one minute so a production redeploy
 * is visible on the next check.
 */
export const INDEXNOW_STATUS_CACHE_CONTROL = "public, max-age=60, s-maxage=60";

export type IndexNowSkipReason =
  | "disabled"
  | "not_production"
  | "key_missing"
  | "no_urls";

type IndexNowEnv = {
  INDEXNOW_ENABLED?: string;
  VERCEL_ENV?: string;
  INDEXNOW_KEY?: string;
};

function currentIndexNowEnv(): IndexNowEnv {
  return {
    INDEXNOW_ENABLED: process.env.INDEXNOW_ENABLED,
    VERCEL_ENV: process.env.VERCEL_ENV,
    INDEXNOW_KEY: process.env.INDEXNOW_KEY,
  };
}

export type IndexNowStatus = {
  enabled: boolean;
  isProduction: boolean;
  keyConfigured: boolean;
  keyFileUrlServes?: boolean;
};

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

/** URLs on this host, deduped, capped at IndexNow's batch limit. */
export function indexNowSubmissionUrls(urls: string[]): string[] {
  return Array.from(
    new Set(
      urls.filter(
        (url) => typeof url === "string" && url.startsWith(`https://${HOST}/`)
      )
    )
  ).slice(0, 10000);
}

/** Why a ping will not be sent, or null when it should be sent. */
export function indexNowSkipReason(
  env: IndexNowEnv,
  urlCount: number
): IndexNowSkipReason | null {
  if (env.INDEXNOW_ENABLED !== "true") return "disabled";
  if (env.VERCEL_ENV !== "production") return "not_production";
  if (!env.INDEXNOW_KEY) return "key_missing";
  if (urlCount === 0) return "no_urls";
  return null;
}

function redactKey(value: string, key: string | undefined): string {
  if (!key) return value;
  return value.split(key).join("[redacted]");
}

function indexNowLog(
  level: "info" | "warn",
  event: string,
  fields: Record<string, string | number>,
  key?: string
): void {
  const parts = Object.entries(fields).map(
    ([name, value]) => `${name}=${redactKey(String(value), key)}`
  );
  const line = `${INDEXNOW_LOG_PREFIX} ${event} ${parts.join(" ")}`;
  if (level === "warn") console.warn(line);
  else console.info(line);
}

/**
 * POST the URL list to IndexNow.
 * Runs only when INDEXNOW_ENABLED=true and VERCEL_ENV=production.
 * Never throws. Uses a short timeout so a slow IndexNow response cannot hang a caller.
 * Returns the IndexNow HTTP status, or null when the ping is skipped or fails.
 * Logs the skip reason or the HTTP status and URL count. Never logs the key.
 */
export async function submitIndexNow(
  urls: string[],
  options: { env?: IndexNowEnv; fetchImpl?: typeof fetch } = {}
): Promise<number | null> {
  const env = options.env ?? currentIndexNowEnv();
  const urlList = indexNowSubmissionUrls(urls);
  const reason = indexNowSkipReason(env, urlList.length);
  if (reason) {
    indexNowLog("info", "skip", { reason, urlCount: urlList.length });
    return null;
  }

  const key = env.INDEXNOW_KEY || "";
  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `https://${HOST}/${key}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(INDEXNOW_TIMEOUT_MS),
    });

    if (!response.ok) {
      indexNowLog(
        "warn",
        "response",
        { status: response.status, urlCount: urlList.length },
        key
      );
      return response.status;
    }

    indexNowLog(
      "info",
      "submitted",
      { status: response.status, urlCount: urlList.length },
      key
    );
    return response.status;
  } catch (error) {
    const message = error instanceof Error ? error.message : "request failed";
    indexNowLog(
      "warn",
      "error",
      { urlCount: urlList.length, message: message.slice(0, 300) },
      key
    );
    return null;
  }
}

/**
 * Read-only view of whether production pings can leave the server.
 * Does not submit URLs. Omits keyFileUrlServes when INDEXNOW_KEY is unset.
 * The boolean is true only when the public key file body equals the key.
 */
export async function getIndexNowStatus(
  options: { env?: IndexNowEnv; fetchImpl?: typeof fetch } = {}
): Promise<IndexNowStatus> {
  const env = options.env ?? currentIndexNowEnv();
  const key = env.INDEXNOW_KEY || "";
  const status: IndexNowStatus = {
    enabled: env.INDEXNOW_ENABLED === "true",
    isProduction: env.VERCEL_ENV === "production",
    keyConfigured: key.length > 0,
  };
  if (!status.keyConfigured) return status;

  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `https://${HOST}/${encodeURIComponent(key)}.txt`,
      {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(INDEXNOW_TIMEOUT_MS),
      }
    );
    const body = response.ok ? (await response.text()).trim() : "";
    status.keyFileUrlServes = body === key;
  } catch {
    status.keyFileUrlServes = false;
  }
  return status;
}

/**
 * Schedule the IndexNow ping without blocking the response.
 * waitUntil keeps the Vercel function alive after the route returns; a bare
 * floating promise is frozen when the serverless invocation ends.
 */
export function notifyIndexNow(urls: string[]): void {
  waitUntil(submitIndexNow(urls));
}
