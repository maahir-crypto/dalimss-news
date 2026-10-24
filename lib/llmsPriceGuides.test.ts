import assert from "node:assert/strict";
import {
  renderPriceGuideSection,
  selectPriceGuides,
  type PriceGuideSource,
} from "./llmsPriceGuides";

function article(
  slug: string,
  title: string,
  tags: string,
  hoursAgo: number
): PriceGuideSource {
  return {
    slug,
    title,
    tags,
    createdAt: new Date(Date.UTC(2026, 9, 24, 12) - hoursAgo * 60 * 60 * 1000),
  };
}

const samples: PriceGuideSource[] = [
  article(
    "samsung-washer",
    "Samsung washing machine price list India",
    "Samsung, Washing machines, Home appliances, Price list, Technology",
    1
  ),
  article(
    "samsung-fridge",
    "Samsung fridge price list India",
    "Samsung, Refrigerators, Home appliances, Price list, Technology",
    2
  ),
  article(
    "samsung-phone",
    "Samsung Galaxy phone price list India",
    "Samsung, Galaxy S26, Phone prices, Technology",
    3
  ),
  article(
    "samsung-monitor",
    "Samsung monitor price list India",
    "Samsung, Monitors, Gaming monitors, Price list, Technology",
    4
  ),
  article(
    "vivo-phone",
    "vivo phone price list India",
    "vivo, vivo V80, Phone prices",
    5
  ),
  article(
    "kia-one",
    "Kia Carens price",
    "Kia, Kia Carens, Car prices, MPV, Automotive",
    6
  ),
  article(
    "kia-two",
    "Kia Syros price",
    "Kia, Kia Syros, SUV prices, Car prices, Automotive",
    7
  ),
  article(
    "kia-three",
    "Kia Seltos price",
    "Kia, Kia Seltos, Car prices, Automotive",
    8
  ),
  article(
    "kia-four",
    "Kia Sonet price",
    "Kia, Kia Sonet, Car prices, Automotive",
    9
  ),
  article(
    "kia-five",
    "Kia Carnival price",
    "Kia, Kia Carnival, Car prices, Automotive",
    10
  ),
  article(
    "tvs-jupiter",
    "TVS Jupiter price",
    "TVS Motor, TVS Jupiter, Scooter prices, Automotive",
    11
  ),
];

{
  const picks = selectPriceGuides(samples);
  const slugs = picks.map((pick) => pick.slug);
  assert.equal(slugs.includes("samsung-monitor"), false);
  assert.equal(slugs.filter((slug) => slug.startsWith("kia-")).length, 3);
  assert.deepEqual(
    picks
      .filter((pick) => pick.brand === "Samsung" && pick.categoryHeading === "Appliances")
      .map((pick) => pick.slug),
    ["samsung-washer", "samsung-fridge"]
  );
  assert.equal(
    picks.some(
      (pick) => pick.slug === "samsung-phone" && pick.categoryHeading === "Phones"
    ),
    true
  );
  assert.equal(
    picks.some(
      (pick) =>
        pick.slug === "tvs-jupiter" &&
        pick.categoryHeading === "Scooters and bikes" &&
        pick.brand === "TVS Motor"
    ),
    true
  );

  const markdown = renderPriceGuideSection(picks);
  assert.ok(markdown.startsWith("## Price guides"));
  assert.ok(markdown.includes("### Phones"));
  assert.ok(markdown.includes("### Cars"));
  assert.ok(markdown.includes("### Scooters and bikes"));
  assert.ok(markdown.includes("### Appliances"));
  assert.equal(markdown.includes("samsung-monitor"), false);
  assert.equal(markdown.includes("\u2014"), false);
  assert.equal(markdown.includes("\u2013"), false);
}

{
  const many: PriceGuideSource[] = [];
  const headings = ["Phones", "Cars", "Scooters and bikes", "Appliances"];
  const tags = [
    "Phone prices",
    "Car prices",
    "Scooter prices",
    "Home appliances, Price list",
  ];
  headings.forEach((_, categoryIndex) => {
    for (let brand = 0; brand < 15; brand += 1) {
      for (let copy = 0; copy < 4; copy += 1) {
        many.push(
          article(
            `c${categoryIndex}-b${brand}-n${copy}`,
            `Model ${categoryIndex}-${brand}-${copy} price`,
            `Brand ${categoryIndex}-${brand}, ${tags[categoryIndex]}`,
            categoryIndex * 100 + brand * 4 + copy
          )
        );
      }
    }
  });
  const picks = selectPriceGuides(many);
  assert.ok(picks.length >= 40 && picks.length <= 42, String(picks.length));
  const perBrand = new Map<string, number>();
  for (const pick of picks) {
    const key = `${pick.categoryHeading}:${pick.brand}`;
    perBrand.set(key, (perBrand.get(key) || 0) + 1);
  }
  perBrand.forEach((count) => {
    assert.equal(count, 3);
  });
  for (const heading of headings) {
    assert.equal(
      picks.some((pick) => pick.categoryHeading === heading),
      true,
      heading
    );
  }
}

console.log("llmsPriceGuides.test.ts ok");
