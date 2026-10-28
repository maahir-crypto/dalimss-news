import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RelatedCandidate } from "./relatedArticles";
import {
  RELATED_CANDIDATE_TTL_MS,
  readRelatedCandidateCache,
  type RelatedCandidateCache,
} from "./relatedCandidatePool";

function row(slug: string): RelatedCandidate {
  return {
    slug,
    title: slug,
    tags: "",
    category: "Technology",
    language: "en",
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = function resolve() {
    return undefined;
  };
  let reject: (error: Error) => void = function reject() {
    return undefined;
  };
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function runTests(): Promise<void> {
{
  assert.equal(RELATED_CANDIDATE_TTL_MS, 10 * 60 * 1000);
  const here = path.dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(path.join(here, "relatedCandidatePool.ts"), "utf8");
  assert.equal(source.indexOf("\u2014"), -1);
  assert.equal(source.indexOf("\u2013"), -1);
}

{
  let time = 1_000;
  let calls = 0;
  const cache: RelatedCandidateCache = {};
  const gate = deferred<RelatedCandidate[]>();
  const load = () => {
    calls += 1;
    return gate.promise;
  };
  const read = () =>
    readRelatedCandidateCache({
      cache,
      now: function now() {
        return time;
      },
      ttlMs: RELATED_CANDIDATE_TTL_MS,
      load,
    });

  const first = read();
  const second = read();
  assert.equal(calls, 1);
  const initial = [row("first")];
  gate.resolve(initial);
  assert.deepEqual(await first, initial);
  assert.deepEqual(await second, initial);

  time = 1_000 + RELATED_CANDIDATE_TTL_MS;
  const stillFresh = await read();
  assert.equal(calls, 1);
  assert.deepEqual(stillFresh, initial);

  time = 1_000 + RELATED_CANDIDATE_TTL_MS + 1;
  const refreshGate = deferred<RelatedCandidate[]>();
  let refreshCalls = 0;
  const refreshing = () => {
    refreshCalls += 1;
    calls += 1;
    return refreshGate.promise;
  };
  const during = readRelatedCandidateCache({
    cache,
    now: function now() {
      return time;
    },
    ttlMs: RELATED_CANDIDATE_TTL_MS,
    load: refreshing,
  });
  const again = readRelatedCandidateCache({
    cache,
    now: function now() {
      return time;
    },
    ttlMs: RELATED_CANDIDATE_TTL_MS,
    load: refreshing,
  });
  assert.equal(refreshCalls, 1);
  assert.deepEqual(await during, initial);
  assert.deepEqual(await again, initial);
  assert.equal(cache.entry && cache.entry.loadedAt, 1_000);

  const updated = [row("second")];
  refreshGate.resolve(updated);
  await Promise.resolve();
  await Promise.resolve();
  const after = await readRelatedCandidateCache({
    cache,
    now: function now() {
      return time;
    },
    ttlMs: RELATED_CANDIDATE_TTL_MS,
    load: refreshing,
  });
  assert.deepEqual(after, updated);
  assert.equal(refreshCalls, 1);
  assert.equal(cache.entry && cache.entry.loadedAt, time);
}

{
  let time = 0;
  const cache: RelatedCandidateCache = {};
  let calls = 0;
  let fail = false;
  const errors: unknown[] = [];
  const read = () =>
    readRelatedCandidateCache({
      cache,
      now: function now() {
        return time;
      },
      ttlMs: RELATED_CANDIDATE_TTL_MS,
      load: function load() {
        calls += 1;
        if (fail) return Promise.reject(new Error("database down"));
        return Promise.resolve([row("kept")]);
      },
      onRefreshError: function onRefreshError(error: unknown) {
        errors.push(error);
      },
    });

  const first = await read();
  assert.equal(calls, 1);
  fail = true;
  time = RELATED_CANDIDATE_TTL_MS + 1;
  const duringFailure = await read();
  assert.deepEqual(duringFailure, first);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(calls, 2);
  assert.equal(errors.length, 1);
  const retried = await read();
  assert.deepEqual(retried, first);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(calls, 3);
  assert.equal(errors.length, 2);
}

}

runTests().then(
  function done() {
    console.log("relatedCandidatePool.test.ts ok");
  },
  function failed(error: unknown) {
    console.error(error);
    process.exit(1);
  }
);
