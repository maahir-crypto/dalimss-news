import assert from "node:assert/strict";
import {
  DUPLICATE_ARTICLE_CANONICALS,
  duplicateCanonicalSlug,
  isDuplicateArticleCopy,
  isRepeatPost,
} from "./duplicateArticles";

{
  assert.equal(Object.keys(DUPLICATE_ARTICLE_CANONICALS).length, 9);
  for (const [copy, main] of Object.entries(DUPLICATE_ARTICLE_CANONICALS)) {
    assert.notEqual(copy, main);
    assert.equal(isDuplicateArticleCopy(copy), true);
    assert.equal(isDuplicateArticleCopy(main), false);
    assert.equal(duplicateCanonicalSlug(copy), main);
    assert.equal(duplicateCanonicalSlug(main), main);
    // A main copy must never itself be marked as a copy.
    assert.equal(DUPLICATE_ARTICLE_CANONICALS[main], undefined);
  }
  assert.equal(
    duplicateCanonicalSlug("jiofiber-prepaid-ott-999-1499-8499-2"),
    "jiofiber-prepaid-ott-999-1499-8499"
  );
  assert.equal(duplicateCanonicalSlug("some-other-story"), "some-other-story");
  assert.equal(isDuplicateArticleCopy("toString"), false);
}

{
  const body = "<p>" + "JioFiber prepaid plans now bundle OTT apps. ".repeat(10) + "</p>";
  assert.equal(
    isRepeatPost({ title: "JioFiber prepaid OTT plans" }, { title: "  jiofiber prepaid OTT plans " }),
    true
  );
  assert.equal(
    isRepeatPost({ title: "New title", content: body }, { title: "Old title", content: body.replace(/<p>/, "<p> ") }),
    true
  );
  assert.equal(
    isRepeatPost({ title: "A story", content: "short" }, { title: "Other", content: "short" }),
    false
  );
  assert.equal(
    isRepeatPost({ title: "Story one", content: body }, { title: "Story two", content: body + " New line added." }),
    false
  );
}

{
  const { scoreSameEvent, duplicateCanonicalSlug, isDuplicateArticleCopy } = require("./duplicateArticles");
  const base = "The Union Cabinet approved six AMRUT water supply and sewerage projects for Varanasi worth crores, covering new pipelines, treatment plants and house connections across city wards. ";
  const a = { title: "Varanasi gets six water and sewerage projects under AMRUT", content: base + "Work starts next month." };
  const b = { title: "Cabinet clears six water, sewerage projects for Varanasi", content: "Six projects for water supply and sewerage in Varanasi were approved by the Union Cabinet, with treatment plants, pipelines and house connections planned across wards. Officials gave a timeline." };
  const c = { title: "Six water and sewerage projects approved for Varanasi", content: base };
  assert.equal(scoreSameEvent(b, a).sameEvent, true);
  assert.equal(scoreSameEvent(c, a).sameEvent, true);
  const followUp = { title: "Varanasi sewerage work begins in Sigra ward after cabinet nod", content: "Contractors dug the first trench in Sigra on Thursday. Residents said traffic was diverted near the market and the ward councillor asked for night shifts. The municipal engineer said the first phase would take four months." };
  assert.equal(scoreSameEvent(followUp, a).sameEvent, false);
  const other = { title: "Delhi Varanasi Vande Bharat sleeper timetable released", content: "Railways released the timetable of the sleeper train between Delhi and Varanasi with stops and timings." };
  assert.equal(scoreSameEvent(other, a).sameEvent, false);
  assert.equal(duplicateCanonicalSlug("varanasi-six-water-sewerage-projects-cabinet-oct27-2026"), "varanasi-water-sewerage-six-amrut-projects-oct27-2026");
  assert.equal(duplicateCanonicalSlug("varanasi-delhi-vande-bharat-sleeper-timetable-oct27-2026"), "varanasi-delhi-sleeper-timetable-oct27-2026");
  assert.equal(isDuplicateArticleCopy("varanasi-water-sewerage-six-amrut-projects-oct27-2026"), false);
  const { wantsSameEventOverride } = require("./findSameEventArticle");
  assert.equal(wantsSameEventOverride({ allowSameEvent: true }), true);
  assert.equal(wantsSameEventOverride({ allow_same_event: "true" }), true);
  assert.equal(wantsSameEventOverride({}), false);
}

console.log("duplicateArticles.test.ts ok");
