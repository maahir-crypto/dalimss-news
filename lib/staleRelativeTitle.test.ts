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

  it("does not rewrite कल inside कलर्स in a stale Hindi title", () => {
    const title = "बिग बॉस 20 कहां देखें: जियोहॉटस्टार और कलर्स का समय";
    assert.equal(
      resolveStaleRelativeTitle(title, PUBLISHED_28_OCT, NOW_29_OCT),
      title
    );
  });

  it("does not rewrite Hindi relative syllables inside ordinary words", () => {
    const titles = [
      "कलेक्टर पहुंचे दफ्तर",
      "यह एक विकल्प है",
      "नतीजा निकलेगा शाम तक",
      "आजमगढ़ में बैठक हुई",
      "आजादी का अमृत महोत्सव",
    ];
    for (const title of titles) {
      assert.equal(
        resolveStaleRelativeTitle(title, PUBLISHED_28_OCT, NOW_29_OCT),
        title
      );
    }
  });

  it("replaces standalone Hindi आज, कल, and आज रात when the story is stale", () => {
    assert.equal(
      resolveStaleRelativeTitle(
        "वाराणसी में आज बारिश",
        PUBLISHED_28_OCT,
        NOW_29_OCT
      ),
      "वाराणसी में, 28 October 2026 बारिश"
    );
    assert.equal(
      resolveStaleRelativeTitle(
        "कल का मौसम अपडेट",
        PUBLISHED_28_OCT,
        NOW_29_OCT
      ),
      "28 October 2026 का मौसम अपडेट"
    );
    assert.equal(
      resolveStaleRelativeTitle(
        "लखनऊ में आज रात बारिश",
        PUBLISHED_28_OCT,
        NOW_29_OCT
      ),
      "लखनऊ में, 28 October 2026 बारिश"
    );
  });
});
