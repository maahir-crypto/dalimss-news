import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveStaleRelativeTitle } from "./staleRelativeTitle";

// 28 October 2026 12:00 IST = 28 Oct 2026 06:30 UTC
const PUBLISHED_28_OCT = "2026-10-28T06:30:00.000Z";
// 29 October 2026 12:00 IST
const NOW_29_OCT = new Date("2026-10-29T06:30:00.000Z");
// Still 28 October 2026 IST
const NOW_28_OCT = new Date("2026-10-28T18:00:00.000Z");

describe("resolveStaleRelativeTitle", () => {
  it("replaces today with the published IST date after that day", () => {
    assert.equal(
      resolveStaleRelativeTitle(
        "Varanasi weather today: fog and a cool morning",
        PUBLISHED_28_OCT,
        NOW_29_OCT
      ),
      "Varanasi weather, 28 October 2026: fog and a cool morning"
    );
  });

  it("replaces this weekend with the published IST date", () => {
    assert.equal(
      resolveStaleRelativeTitle(
        "Storm Boelo gathers strength this weekend along the coast",
        PUBLISHED_28_OCT,
        NOW_29_OCT
      ),
      "Storm Boelo gathers strength, 28 October 2026 along the coast"
    );
  });

  it("leaves titles unchanged when published on the current IST day", () => {
    assert.equal(
      resolveStaleRelativeTitle(
        "Varanasi weather today: fog and a cool morning",
        PUBLISHED_28_OCT,
        NOW_28_OCT
      ),
      "Varanasi weather today: fog and a cool morning"
    );
  });

  it("leaves titles without relative day words unchanged", () => {
    assert.equal(
      resolveStaleRelativeTitle(
        "Varanasi weather, 28 October 2026: fog and a cool morning",
        PUBLISHED_28_OCT,
        NOW_29_OCT
      ),
      "Varanasi weather, 28 October 2026: fog and a cool morning"
    );
  });

  it("replaces Hindi आज when the story is stale", () => {
    assert.equal(
      resolveStaleRelativeTitle(
        "वाराणसी मौसम आज: सुबह कोहरा",
        PUBLISHED_28_OCT,
        NOW_29_OCT
      ),
      "वाराणसी मौसम, 28 October 2026: सुबह कोहरा"
    );
  });
});
