import assert from "node:assert/strict";
import {
  articleBreadcrumbName,
  trimTitleAtWordBoundary,
} from "./seo";

const VIVO =
  "vivo phone price list India: Rs 13,999 to Rs 2,19,999 for T5e to X Fold6";
const MONITOR =
  "Samsung monitor price list India: Rs 6,199 to Rs 1,73,999 for Essential, ViewFinity, smart and Odyssey";
const WASHER_META = "Samsung washing machine price list: Rs 9,990 to Rs 3,19,000";
const WASHER_HEADLINE =
  "Samsung washing machine price list India: Rs 9,990 to Rs 3,19,000 for semi automatic, top load and front load";

function assertWordBoundary(full: string): void {
  const cut = trimTitleAtWordBoundary(full, 60);
  assert.ok(cut.length <= 60, `length ${cut.length} for ${cut}`);
  assert.equal(cut.includes("..."), false);
  assert.equal(cut.includes("\u2026"), false);
  assert.equal(full.startsWith(cut), true);
  if (full.length > 60) {
    assert.equal(full.charAt(cut.length), " ");
  }
}

{
  assertWordBoundary(VIVO);
  assertWordBoundary(MONITOR);
  assert.equal(trimTitleAtWordBoundary(WASHER_META, 60), WASHER_META);
  assert.equal(trimTitleAtWordBoundary("A".repeat(80), 60).length, 60);
  const sixty = "A".repeat(60);
  assert.equal(trimTitleAtWordBoundary(sixty, 60), sixty);
}

{
  assert.equal(articleBreadcrumbName(VIVO, VIVO), VIVO);
  assert.equal(articleBreadcrumbName(VIVO, VIVO).includes("..."), false);
  assert.equal(articleBreadcrumbName(WASHER_META, WASHER_HEADLINE), WASHER_META);
  assert.equal(
    articleBreadcrumbName(WASHER_HEADLINE.slice(0, 50), WASHER_HEADLINE),
    WASHER_HEADLINE
  );
  assert.equal(articleBreadcrumbName(null, VIVO), VIVO);
  assert.equal(articleBreadcrumbName("   ", MONITOR).includes("..."), false);
}

{
  const ampere =
    "Ampere Nexus electric scooter price in India: variants range from Rs 1.10 lakh to Rs 1.30 lakh";
  const trimmed = trimTitleAtWordBoundary(ampere, 60);
  assert.ok(trimmed.length <= 60);
  assert.equal(/\b(from|to)$/i.test(trimmed), false, trimmed);
  assert.equal(
    trimTitleAtWordBoundary("Bike prices drop this week across all dealers from Rs 50,000", 50),
    "Bike prices drop this week across all dealers"
  );
  assert.equal(
    /\bto$/.test(trimTitleAtWordBoundary(VIVO, 40)),
    false
  );
}

console.log("seoTitle.test.ts ok");
