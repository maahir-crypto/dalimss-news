import assert from "node:assert/strict";
import {
  getCategoriesByDbValue,
  pickBreadcrumbCategory,
  type Category,
} from "./categories";
import { sectionPath } from "./publicPaths";

function pick(dbValue: string | null | undefined): Category | undefined {
  return pickBreadcrumbCategory(getCategoriesByDbValue(dbValue));
}

{
  const gurugramBusiness = getCategoriesByDbValue("India, Gurugram, Business");
  assert.deepEqual(
    gurugramBusiness.map((category) => category.slug),
    ["india", "gurgaon", "business"]
  );
  const breadcrumb = pickBreadcrumbCategory(gurugramBusiness);
  assert.equal(breadcrumb?.slug, "gurgaon");
  assert.equal(breadcrumb?.name, "Gurugram");
  assert.equal(breadcrumb?.nameHi, "गुरुग्राम");
  assert.equal(sectionPath(breadcrumb?.slug), "/gurugram-news");
  assert.deepEqual(
    gurugramBusiness.map((category) => category.slug),
    ["india", "gurgaon", "business"]
  );
}

{
  const varanasiEducation = pick(
    "India, Uttar Pradesh, Varanasi, Education"
  );
  assert.equal(varanasiEducation?.slug, "varanasi");
  assert.equal(varanasiEducation?.name, "Varanasi");
  assert.equal(varanasiEducation?.nameHi, "वाराणसी");
  assert.equal(sectionPath(varanasiEducation?.slug), "/varanasi-news");
}

{
  assert.equal(pick("India, Varanasi, Gurugram, Business")?.slug, "gurgaon");
  assert.equal(
    sectionPath(pick("India, Varanasi, Gurugram, Business")?.slug),
    "/gurugram-news"
  );
  assert.equal(pick("India, Gurugram, Varanasi, Education")?.slug, "varanasi");
  assert.equal(
    sectionPath(pick("India, Gurugram, Varanasi, Education")?.slug),
    "/varanasi-news"
  );
}

{
  assert.equal(pick("India, Business")?.slug, "business");
  assert.equal(sectionPath(pick("India, Business")?.slug), "/category/business");
  assert.equal(pick("Education")?.slug, "education");
  assert.equal(pick("Business, Varanasi")?.slug, "varanasi");
  assert.equal(pick("Varanasi")?.slug, "varanasi");
  assert.equal(pick("Gurugram")?.slug, "gurgaon");
  assert.equal(pick("Gurgaon News")?.slug, "gurgaon");
  assert.equal(pick(null), undefined);
  assert.equal(pick(undefined), undefined);
  assert.equal(pick(""), undefined);
  assert.equal(pickBreadcrumbCategory([]), undefined);
}
