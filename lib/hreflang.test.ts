import assert from "node:assert/strict";
import { duplicateCanonicalSlug } from "./duplicateArticles";
import {
  TRANSLATION_PAIRS,
  hreflangLinks,
  translationPairForSlug,
  type PublishedArticle,
} from "./hreflang";
import { articlePath } from "./publicPaths";
import { SITE_URL } from "./seo";

function canonicalHref(slug: string): string {
  return `${SITE_URL}${articlePath(duplicateCanonicalSlug(slug))}`;
}

const cityBudget: PublishedArticle[] = [
  { slug: "city-budget", published: true, language: "en" },
  { slug: "city-budget-hindi", published: true, language: "hi" },
];

{
  const pair = translationPairForSlug("city-budget", cityBudget);
  assert.deepEqual(pair, {
    en: "/articles/city-budget",
    hi: "/articles/city-budget-hindi",
  });
  assert.deepEqual(
    translationPairForSlug("city-budget-hindi", cityBudget),
    pair
  );

  const expected = [
    { hrefLang: "en", href: canonicalHref("city-budget") },
    { hrefLang: "hi", href: canonicalHref("city-budget-hindi") },
    { hrefLang: "x-default", href: canonicalHref("city-budget") },
  ];
  assert.deepEqual(
    hreflangLinks({
      path: "/articles/city-budget",
      language: "en",
      articles: cityBudget,
    }),
    expected
  );
  assert.deepEqual(
    hreflangLinks({
      path: "/articles/city-budget-hindi",
      language: "hi",
      articles: cityBudget,
    }),
    expected
  );
  assert.equal(expected[0].href, "https://dalimss.news/articles/city-budget");
  assert.equal(expected[2].href, expected[0].href);
}

{
  const english = "india-new-zealand-fifth-odi-series-win-november-2026";
  const hindi = "india-new-zealand-fifth-odi-series-win-hindi-2026";
  const articles: PublishedArticle[] = [
    { slug: english, published: true, language: "en" },
    { slug: hindi, published: true, language: "hi" },
    { slug: `${english}-hindi`, published: true, language: "hi" },
  ];
  const pair = translationPairForSlug(english, articles);
  assert.deepEqual(pair, {
    en: `/articles/${english}`,
    hi: `/articles/${hindi}`,
  });
  assert.notEqual(pair?.hi, `/articles/${english}-hindi`);
  const links = hreflangLinks({
    path: `/articles/${hindi}`,
    language: "hi",
    articles,
  });
  assert.deepEqual(
    links.map((link) => link.hrefLang),
    ["en", "hi", "x-default"]
  );
  assert.equal(links[0].href, canonicalHref(english));
  assert.equal(links[1].href, canonicalHref(hindi));
  assert.equal(links[2].href, links[0].href);
}

{
  const english = "ipl-2027-retentions-team-purses-key-releases-auction";
  const hindi = "ipl-2027-retention-purse-released-players-auction-hindi";
  const articles: PublishedArticle[] = [
    { slug: english, published: true, language: "en" },
    { slug: hindi, published: true, language: "hi" },
    { slug: `${english}-hindi`, published: true, language: "hi" },
  ];
  const pair = translationPairForSlug(english, articles);
  assert.deepEqual(pair, {
    en: `/articles/${english}`,
    hi: `/articles/${hindi}`,
  });
  assert.notEqual(pair?.hi, `/articles/${english}-hindi`);
  const links = hreflangLinks({
    path: `/articles/${hindi}`,
    language: "hi",
    articles,
  });
  assert.deepEqual(
    links.map((link) => link.hrefLang),
    ["en", "hi", "x-default"]
  );
  assert.equal(links[0].href, canonicalHref(english));
  assert.equal(links[1].href, canonicalHref(hindi));
  assert.equal(links[2].href, links[0].href);
}

{
  const english = "varanasi-mangari-road-land-notice-nov18-2026";
  const hindi = "varanasi-mangari-karmi-bhumi-adhisuchna-upload-nov18-2026";
  const articles: PublishedArticle[] = [
    { slug: english, published: true, language: "en" },
    { slug: hindi, published: true, language: "hi" },
    { slug: `${english}-hindi`, published: true, language: "hi" },
  ];
  const pair = translationPairForSlug(english, articles);
  assert.deepEqual(pair, {
    en: `/articles/${english}`,
    hi: `/articles/${hindi}`,
  });
  assert.notEqual(pair?.hi, `/articles/${english}-hindi`);
  const links = hreflangLinks({
    path: `/articles/${hindi}`,
    language: "hi",
    articles,
  });
  assert.deepEqual(
    links.map((link) => link.hrefLang),
    ["en", "hi", "x-default"]
  );
  assert.equal(links[0].href, canonicalHref(english));
  assert.equal(links[1].href, canonicalHref(hindi));
  assert.equal(links[2].href, links[0].href);
}

{
  const articles: PublishedArticle[] = [
    { slug: "city-budget", published: true, language: "en" },
    { slug: "city-budget-hindi", published: false, language: "hi" },
  ];
  assert.equal(translationPairForSlug("city-budget", articles), null);
  assert.equal(translationPairForSlug("city-budget-hindi", articles), null);
  assert.deepEqual(
    hreflangLinks({
      path: "/articles/city-budget",
      language: "en",
      articles,
    }),
    []
  );
  assert.deepEqual(
    hreflangLinks({
      path: "/articles/city-budget-hindi",
      language: "hi",
      articles,
    }),
    [
      {
        hrefLang: "hi",
        href: "https://dalimss.news/articles/city-budget-hindi",
      },
    ]
  );
}

{
  const articles: PublishedArticle[] = [
    { slug: "only-english", published: true, language: "en" },
  ];
  assert.equal(translationPairForSlug("only-english", articles), null);
  assert.deepEqual(
    hreflangLinks({
      path: "/articles/only-english",
      language: "en",
      articles,
    }),
    []
  );

  const hindiOnly: PublishedArticle[] = [
    { slug: "only-hindi", published: true, language: "hi" },
  ];
  assert.equal(translationPairForSlug("only-hindi", hindiOnly), null);
  assert.deepEqual(
    hreflangLinks({
      path: "/articles/only-hindi",
      language: "hi",
      articles: hindiOnly,
    }),
    [{ hrefLang: "hi", href: "https://dalimss.news/articles/only-hindi" }]
  );
}

{
  assert.deepEqual(
    TRANSLATION_PAIRS.map((pair) => [pair.en, pair.hi]),
    [
      [
        "/articles/india-new-zealand-fifth-odi-series-win-november-2026",
        "/articles/india-new-zealand-fifth-odi-series-win-hindi-2026",
      ],
      [
        "/articles/varanasi-bhu-two-tavi-patients-discharged-nov15-2026",
        "/articles/varanasi-bhu-do-hriday-valve-upchar-nov15-2026",
      ],
      [
        "/articles/karwa-chauth-delhi-gurugram-noida-lucknow-moonrise-2026",
        "/articles/karwa-chauth-2026-delhi-gurugram-noida-lucknow-hindi",
      ],
      [
        "/articles/ipl-2027-retentions-team-purses-key-releases-auction",
        "/articles/ipl-2027-retention-purse-released-players-auction-hindi",
      ],
      [
        "/articles/varanasi-mangari-road-land-notice-nov18-2026",
        "/articles/varanasi-mangari-karmi-bhumi-adhisuchna-upload-nov18-2026",
      ],
    ]
  );

  const trains: PublishedArticle[] = [
    {
      slug: "chhath-shakur-basti-patna-mansi-jhanjharpur-trains",
      published: true,
      language: "en",
    },
    {
      slug: "chhath-shakur-basti-patna-mansi-jhanjharpur-trains-hindi",
      published: true,
      language: "hi",
    },
  ];
  assert.equal(
    TRANSLATION_PAIRS.some((pair) => pair.hi.endsWith("trains-hindi")),
    false
  );
  assert.deepEqual(translationPairForSlug(trains[0].slug, trains), {
    en: "/articles/chhath-shakur-basti-patna-mansi-jhanjharpur-trains",
    hi: "/articles/chhath-shakur-basti-patna-mansi-jhanjharpur-trains-hindi",
  });
}

{
  const articles: PublishedArticle[] = [
    { slug: "city-budget", published: true, language: "en" },
    { slug: "city-budget-hindi", published: true, language: "en" },
  ];
  assert.equal(translationPairForSlug("city-budget", articles), null);
}

{
  assert.deepEqual(hreflangLinks({ path: "/hindi", language: "hi" }), [
    { hrefLang: "hi", href: "https://dalimss.news/hindi" },
  ]);
  assert.deepEqual(
    hreflangLinks({ path: "/hindi?page=2", language: "hi" }),
    [{ hrefLang: "hi", href: "https://dalimss.news/hindi?page=2" }]
  );
  assert.deepEqual(
    hreflangLinks({ path: "/articles/plain-english", language: "en" }),
    []
  );
}
