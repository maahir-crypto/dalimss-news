import assert from "node:assert/strict";
import {
  INDEXNOW_LOG_PREFIX,
  INDEXNOW_STATUS_CACHE_CONTROL,
  getIndexNowStatus,
  indexNowSkipReason,
  submitIndexNow,
} from "./indexnow";
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
  assert.match(requestBody, new RegExp(KEY));
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
  assert.equal(requested, `https://dalimss.news/${KEY}.txt`);
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

console.log("indexnow checks passed");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
