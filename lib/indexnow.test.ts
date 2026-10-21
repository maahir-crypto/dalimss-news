import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { NextRequest } from "next/server";
import nextConfig from "../next.config.mjs";
import { middleware } from "../middleware";
import keyFileHandler from "../pages/api/indexnow-key";
import {
  INDEXNOW_LOG_PREFIX,
  INDEXNOW_STATUS_CACHE_CONTROL,
  getIndexNowStatus,
  indexNowKeyLocation,
  indexNowSkipReason,
  submitIndexNow,
} from "./indexnow";
import { isRootTxtPath } from "./indexnowKeyFile";
import handler from "../pages/api/indexnow-status";

const KEY = "test-indexnow-key-not-real";

function captureLogs() {
  const lines: string[] = [];
  const original = {
    info: console.info,
    warn: console.warn,
    log: console.log,
    error: console.error,
  };
  const record =
    (level: string) =>
    (...args: unknown[]) => {
      lines.push(
        `${level} ${args
          .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
          .join(" ")}`
      );
    };
  console.info = record("info");
  console.warn = record("warn");
  console.log = record("log");
  console.error = record("error");
  return {
    lines,
    restore() {
      console.info = original.info;
      console.warn = original.warn;
      console.log = original.log;
      console.error = original.error;
    },
  };
}

function callKeyFile(method: string, key: string | undefined) {
  const headers = new Map<string, string>();
  const state = { statusCode: 0, body: "" };
  const req = {
    method,
    query: key === undefined ? {} : { key },
  } as Parameters<typeof keyFileHandler>[0];
  const res = {
    setHeader(name: string, value: string | number) {
      headers.set(name.toLowerCase(), String(value));
      return this;
    },
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    end(payload?: string | Buffer) {
      state.body = payload ? payload.toString() : "";
      return this;
    },
  } as unknown as Parameters<typeof keyFileHandler>[1];
  keyFileHandler(req, res);
  return { ...state, headers };
}

function jsonResponse(status: number, body: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  } as Response;
}

async function main() {
{
  assert.equal(
    indexNowSkipReason({ INDEXNOW_ENABLED: "false", VERCEL_ENV: "production", INDEXNOW_KEY: KEY }, 2),
    "disabled"
  );
  assert.equal(
    indexNowSkipReason({ INDEXNOW_ENABLED: "true", VERCEL_ENV: "preview", INDEXNOW_KEY: KEY }, 2),
    "not_production"
  );
  assert.equal(
    indexNowSkipReason({ INDEXNOW_ENABLED: "true", VERCEL_ENV: "production" }, 2),
    "key_missing"
  );
  assert.equal(
    indexNowSkipReason(
      { INDEXNOW_ENABLED: "true", VERCEL_ENV: "production", INDEXNOW_KEY: KEY },
      0
    ),
    "no_urls"
  );
  assert.equal(
    indexNowSkipReason(
      { INDEXNOW_ENABLED: "true", VERCEL_ENV: "production", INDEXNOW_KEY: KEY },
      3
    ),
    null
  );
}

{
  const logs = captureLogs();
  let calls = 0;
  const status = await submitIndexNow(["https://dalimss.news/articles/a"], {
    env: { INDEXNOW_ENABLED: "1", VERCEL_ENV: "production", INDEXNOW_KEY: KEY },
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse(200, "");
    },
  });
  logs.restore();
  assert.equal(status, null);
  assert.equal(calls, 0);
  assert.match(logs.lines.join("\n"), /\[indexnow\] skip reason=disabled urlCount=1/);
}

{
  const logs = captureLogs();
  const status = await submitIndexNow(
    [
      "https://dalimss.news/articles/a",
      "https://dalimss.news/articles/a",
      "https://example.com/not-ours",
      "https://dalimss.news/articles/b",
    ],
    {
      env: { INDEXNOW_ENABLED: "true", VERCEL_ENV: "preview", INDEXNOW_KEY: KEY },
    }
  );
  logs.restore();
  assert.equal(status, null);
  assert.match(logs.lines.join("\n"), /reason=not_production urlCount=2/);
}

{
  const logs = captureLogs();
  let method = "";
  let requestBody = "";
  const status = await submitIndexNow(
    ["https://dalimss.news/articles/a", "https://dalimss.news/articles/b"],
    {
      env: { INDEXNOW_ENABLED: "true", VERCEL_ENV: "production", INDEXNOW_KEY: KEY },
      fetchImpl: async (input, init) => {
        method = String(init?.method);
        requestBody = String(init?.body);
        assert.equal(String(input), "https://api.indexnow.org/indexnow");
        return jsonResponse(200, "ok");
      },
    }
  );
  logs.restore();
  assert.equal(status, 200);
  assert.equal(method, "POST");
  const payload = JSON.parse(requestBody) as {
    host?: string;
    key?: string;
    keyLocation?: string;
    urlList?: string[];
  };
  assert.equal(payload.host, "dalimss.news");
  assert.equal(payload.key, KEY);
  assert.equal(indexNowKeyLocation(KEY), `https://dalimss.news/${KEY}.txt`);
  assert.equal(payload.keyLocation, indexNowKeyLocation(KEY));
  assert.deepEqual(payload.urlList, [
    "https://dalimss.news/articles/a",
    "https://dalimss.news/articles/b",
  ]);
  const logged = logs.lines.join("\n");
  assert.match(logged, /\[indexnow\] submitted status=200 urlCount=2/);
  assert.equal(logged.includes(KEY), false);
  assert.equal(logs.lines.some((line) => line.startsWith("log ") || line.startsWith("error ")), false);
}

{
  const logs = captureLogs();
  const status = await submitIndexNow(["https://dalimss.news/articles/a"], {
    env: { INDEXNOW_ENABLED: "true", VERCEL_ENV: "production", INDEXNOW_KEY: KEY },
    fetchImpl: async () => jsonResponse(403, KEY),
  });
  logs.restore();
  assert.equal(status, 403);
  const logged = logs.lines.join("\n");
  assert.match(logged, /\[indexnow\] response status=403 urlCount=1/);
  assert.equal(logged.includes(KEY), false);
  assert.match(logs.lines[0], /^warn /);
}

{
  const logs = captureLogs();
  const status = await submitIndexNow(["https://dalimss.news/articles/a"], {
    env: { INDEXNOW_ENABLED: "true", VERCEL_ENV: "production", INDEXNOW_KEY: KEY },
    fetchImpl: async () => {
      throw new Error(`network down for key ${KEY}`);
    },
  });
  logs.restore();
  assert.equal(status, null);
  const logged = logs.lines.join("\n");
  assert.match(logged, /\[indexnow\] error urlCount=1 message=/);
  assert.match(logged, /\[redacted\]/);
  assert.equal(logged.includes(KEY), false);
}

{
  const status = await getIndexNowStatus({
    env: { INDEXNOW_ENABLED: "true", VERCEL_ENV: "preview" },
    fetchImpl: async () => {
      throw new Error("status check must not fetch without a key");
    },
  });
  assert.deepEqual(status, {
    enabled: true,
    isProduction: false,
    keyConfigured: false,
  });
  assert.equal("keyFileUrlServes" in status, false);
  assert.equal(JSON.stringify(status).includes(KEY), false);
}

{
  let requested = "";
  const status = await getIndexNowStatus({
    env: { INDEXNOW_ENABLED: "true", VERCEL_ENV: "production", INDEXNOW_KEY: KEY },
    fetchImpl: async (input, init) => {
      requested = String(input);
      assert.equal(init?.method, "GET");
      return jsonResponse(200, `${KEY}\n`);
    },
  });
  assert.equal(requested, indexNowKeyLocation(KEY));
  assert.equal(status.keyFileUrlServes, true);
  assert.equal(JSON.stringify(status).includes(KEY), false);
}

{
  const status = await getIndexNowStatus({
    env: { INDEXNOW_ENABLED: "false", VERCEL_ENV: "production", INDEXNOW_KEY: KEY },
    fetchImpl: async () => jsonResponse(404, "missing"),
  });
  assert.equal(status.enabled, false);
  assert.equal(status.keyFileUrlServes, false);
}

{
  assert.match(INDEXNOW_STATUS_CACHE_CONTROL, /^public,/);
  assert.match(INDEXNOW_STATUS_CACHE_CONTROL, /max-age=/);
  assert.equal(INDEXNOW_STATUS_CACHE_CONTROL.includes("no-store"), false);
  assert.equal(INDEXNOW_LOG_PREFIX, "[indexnow]");

  const previous = {
    INDEXNOW_ENABLED: process.env.INDEXNOW_ENABLED,
    VERCEL_ENV: process.env.VERCEL_ENV,
    INDEXNOW_KEY: process.env.INDEXNOW_KEY,
  };
  process.env.INDEXNOW_ENABLED = "true";
  process.env.VERCEL_ENV = "production";
  delete process.env.INDEXNOW_KEY;
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    return jsonResponse(200, "");
  }) as typeof fetch;

  const headers = new Map<string, string>();
  let statusCode = 0;
  let payload: unknown;
  const req = { method: "GET" } as Parameters<typeof handler>[0];
  const res = {
    setHeader(name: string, value: string) {
      headers.set(name, value);
      return this;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      payload = body;
      return this;
    },
  } as unknown as Parameters<typeof handler>[1];

  try {
    await handler(req, res);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }

  assert.equal(statusCode, 200);
  assert.equal(headers.get("Cache-Control"), INDEXNOW_STATUS_CACHE_CONTROL);
  assert.equal(fetchCalls, 0);
  assert.deepEqual(payload, {
    enabled: true,
    isProduction: true,
    keyConfigured: false,
  });

  let denied = 0;
  const deniedRes = {
    setHeader() {
      return this;
    },
    status(code: number) {
      denied = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Parameters<typeof handler>[1];
  await handler({ method: "POST" } as Parameters<typeof handler>[0], deniedRes);
  assert.equal(denied, 405);
}

{
  const nodeRequire = createRequire(__filename);
  const imported = nodeRequire("next/dist/compiled/path-to-regexp") as
    | ((path: string, keys: { name: string | number }[]) => RegExp)
    | { pathToRegexp: (path: string, keys: { name: string | number }[]) => RegExp };
  const pathToRegexp = typeof imported === "function" ? imported : imported.pathToRegexp;
  const keys: { name: string | number }[] = [];
  const pattern = pathToRegexp("/:key.txt", keys);
  const matched = pattern.exec(`/${KEY}.txt`);
  assert.ok(matched);
  assert.equal(String(keys[0]?.name), "key");
  assert.equal(matched[1], KEY);
  assert.equal(pattern.test("/about"), false);
  assert.equal(pattern.test("/articles/[slug]"), false);
  assert.equal(pattern.test("/courses/old.txt"), false);
  assert.equal(pattern.test("/llms.txt"), true);

  assert.equal(isRootTxtPath(`/${KEY}.txt`), true);
  assert.equal(isRootTxtPath("/llms.txt"), true);
  assert.equal(isRootTxtPath("/articles/[slug]"), false);
  assert.equal(isRootTxtPath("/courses/old.txt"), false);
  assert.equal(isRootTxtPath("/home/legacy.txt"), false);

  const statusFor = (pathname: string) =>
    middleware(new NextRequest(new URL(pathname, "https://dalimss.news"))).status;
  assert.equal(statusFor(`/${KEY}.txt`), 200);
  assert.equal(statusFor("/llms.txt"), 200);
  assert.equal(statusFor("/articles/[slug]"), 410);
  assert.equal(statusFor("/category/[slug]"), 410);
  assert.equal(statusFor("/courses/[slug]"), 410);
  assert.equal(statusFor("/courses/old-course"), 410);
  assert.equal(statusFor("/courses/old.txt"), 410);
  assert.equal(statusFor("/home/legacy"), 410);

  assert.ok(nextConfig.rewrites);
  const rewrites = await nextConfig.rewrites();
  assert.equal(Array.isArray(rewrites), false);
  if (Array.isArray(rewrites)) throw new Error("key rewrite must be afterFiles");
  const afterFiles = rewrites.afterFiles ?? [];
  const beforeFiles = rewrites.beforeFiles ?? [];
  const keyRewrite = afterFiles.find((rule) => rule.source === "/:key.txt");
  assert.ok(keyRewrite);
  assert.equal(keyRewrite.destination, "/api/indexnow-key?key=:key");
  assert.equal(
    beforeFiles.some((rule) => rule.source.includes(".txt")),
    false
  );

  assert.ok(nextConfig.redirects);
  const redirects = await nextConfig.redirects();
  for (const rule of redirects) {
    if (
      rule.source === "/:path*" ||
      rule.source === "/:key.txt" ||
      rule.source === "/:path*.txt"
    ) {
      const host = rule.has?.find((item) => item.type === "host");
      assert.equal(host?.value, "www.dalimss.news");
      assert.equal(rule.destination.includes(":path*"), true);
    }
  }
}

{
  const previous = process.env.INDEXNOW_KEY;
  process.env.INDEXNOW_KEY = KEY;
  const logs = captureLogs();
  try {
    const ok = await callKeyFile("GET", KEY);
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.headers.get("content-type"), "text/plain; charset=utf-8");
    assert.equal(ok.body, KEY);

    const head = await callKeyFile("HEAD", KEY);
    assert.equal(head.statusCode, 200);
    assert.equal(head.headers.get("content-type"), "text/plain; charset=utf-8");
    assert.equal(head.body, "");

    const wrong = await callKeyFile("GET", "not-the-key");
    assert.equal(wrong.statusCode, 404);
    assert.equal(wrong.headers.get("content-type"), "text/plain; charset=utf-8");
    assert.equal(wrong.headers.get("cache-control"), "no-store");
    assert.equal(wrong.body.includes(KEY), false);

    const missing = await callKeyFile("GET", undefined);
    assert.equal(missing.statusCode, 404);

    const posted = await callKeyFile("POST", KEY);
    assert.equal(posted.statusCode, 405);

    process.env.INDEXNOW_KEY = "";
    const unset = await callKeyFile("GET", KEY);
    assert.equal(unset.statusCode, 404);
    assert.equal(unset.body.includes(KEY), false);
  } finally {
    logs.restore();
    assert.equal(logs.lines.some((line) => line.includes(KEY)), false);
    if (previous === undefined) delete process.env.INDEXNOW_KEY;
    else process.env.INDEXNOW_KEY = previous;
  }
}

console.log("indexnow checks passed");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
