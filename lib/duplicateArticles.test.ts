import assert from "node:assert/strict";
import {
  DUPLICATE_ARTICLE_CANONICALS,
  duplicateCanonicalSlug,
  isDuplicateArticleCopy,
  isRepeatPost,
} from "./duplicateArticles";

{
  assert.equal(Object.keys(DUPLICATE_ARTICLE_CANONICALS).length, 6);
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

console.log("duplicateArticles.test.ts ok");
