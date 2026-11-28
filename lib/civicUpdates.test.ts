import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildLlmsFull } from "./llms";
import { buildLlmsTxt } from "./llmsDocument";
import { isAllowedSitemapLoc } from "./sitemapLocs";
import { trimTitleAtWordBoundary, metaDescription, SITE_URL } from "./seo";
import { TOPIC_HUBS } from "./topicHubs";
import {
  CIVIC_UPDATE_GROUPS,
  CIVIC_UPDATES_DESCRIPTION,
  CIVIC_UPDATES_H1,
  CIVIC_UPDATES_INDEX_MIN,
  CIVIC_UPDATES_INTRO,
  CIVIC_UPDATES_LLMS_LINE,
  CIVIC_UPDATES_MORE_LABEL,
  CIVIC_UPDATES_PATH,
  CIVIC_UPDATES_ROBOTS_INDEX,
  CIVIC_UPDATES_ROBOTS_THIN,
  CIVIC_UPDATES_TITLE,
  CIVIC_UPDATES_TITLE_BEFORE_PIPE,
  CIVIC_UPDATES_TRACKER_LABEL,
  civicGroupForStory,
  civicLastUpdatedLabel,
  civicUpdatesPathForArticle,
  civicUpdatesRobots,
  formatCivicPublishedAt,
  groupCivicStories,
  type CivicStorySource,
} from "./civicUpdates";

const NOW = new Date("2026-11-28T12:00:00.000Z");

function at(daysAgo: number, extraMs = 0): string {
  return new Date(
    NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000 - extraMs
  ).toISOString();
}

function story(
  partial: Partial<CivicStorySource> & Pick<CivicStorySource, "id" | "slug" | "title">
): CivicStorySource {
  return {
    content: "Reported from Varanasi.",
    createdAt: at(1),
    metaDescription: null,
    ...partial,
  };
}

function labelsOf(stories: CivicStorySource[]) {
  return groupCivicStories(stories, NOW).groups.map((group) => group.label);
}

{
  assert.equal(CIVIC_UPDATES_TITLE_BEFORE_PIPE.length, 51);
  assert.equal(
    CIVIC_UPDATES_TITLE,
    `${CIVIC_UPDATES_TITLE_BEFORE_PIPE} | Dalimss News`
  );
  const trimmed = trimTitleAtWordBoundary(CIVIC_UPDATES_TITLE);
  assert.ok(trimmed.length <= 60);
  assert.notEqual(trimmed, CIVIC_UPDATES_TITLE);
  assert.equal(CIVIC_UPDATES_H1.includes("\u2014"), false);
  assert.equal(CIVIC_UPDATES_H1.includes("\u2013"), false);
  assert.equal(CIVIC_UPDATES_DESCRIPTION.includes("\u2014"), false);
  assert.equal(CIVIC_UPDATES_DESCRIPTION.includes("\u2013"), false);
  assert.equal(CIVIC_UPDATES_INTRO.includes("\u2014"), false);
  assert.equal(CIVIC_UPDATES_INTRO.includes("\u2013"), false);
  assert.equal(CIVIC_UPDATES_LLMS_LINE.includes("\u2014"), false);
  assert.equal(CIVIC_UPDATES_LLMS_LINE.includes("\u2013"), false);
  assert.ok(CIVIC_UPDATES_DESCRIPTION.length <= 155);
  assert.equal(metaDescription(CIVIC_UPDATES_DESCRIPTION), CIVIC_UPDATES_DESCRIPTION);
}

{
  assert.equal(
    TOPIC_HUBS.varanasi.introLink?.label,
    CIVIC_UPDATES_TRACKER_LABEL
  );
  assert.equal(TOPIC_HUBS.varanasi.introLink?.href, CIVIC_UPDATES_PATH);
  assert.equal(CIVIC_UPDATES_MORE_LABEL, "More Varanasi news");
  assert.equal(isAllowedSitemapLoc(`${SITE_URL}${CIVIC_UPDATES_PATH}`), true);
  const newsSitemap = readFileSync(
    new URL("../pages/news-sitemap.xml.ts", import.meta.url),
    "utf8"
  );
  assert.equal(newsSitemap.includes("civic-updates"), false);
  assert.equal(newsSitemap.includes(CIVIC_UPDATES_PATH), false);
}

{
  const llms = buildLlmsTxt([], "");
  const full = buildLlmsFull([]);
  for (const body of [llms, full]) {
    assert.ok(body.includes(CIVIC_UPDATES_LLMS_LINE), body.slice(0, 400));
    const hub = body.indexOf(`${SITE_URL}/varanasi-news.`);
    const civic = body.indexOf(`${SITE_URL}${CIVIC_UPDATES_PATH}`);
    const gurugram = body.indexOf(`${SITE_URL}/gurugram-news`);
    assert.ok(hub !== -1 && hub < civic && civic < gurugram);
  }
}

{
  assert.equal(civicUpdatesRobots(0), CIVIC_UPDATES_ROBOTS_THIN);
  assert.equal(civicUpdatesRobots(CIVIC_UPDATES_INDEX_MIN - 1), CIVIC_UPDATES_ROBOTS_THIN);
  assert.equal(civicUpdatesRobots(CIVIC_UPDATES_INDEX_MIN), CIVIC_UPDATES_ROBOTS_INDEX);
  assert.equal(CIVIC_UPDATES_ROBOTS_INDEX.startsWith("index, follow"), true);
  assert.equal(CIVIC_UPDATES_ROBOTS_THIN, "noindex, follow");
}

{
  const formatted = formatCivicPublishedAt("2026-01-15T18:30:00.000Z");
  assert.equal(formatted, "16 January 2026, 12:00 am");
  const updated = civicLastUpdatedLabel("2026-01-15T18:30:00.000Z");
  assert.equal(updated.label, formatted);
  assert.equal(updated.iso?.endsWith("+05:30"), true);
  assert.equal(civicLastUpdatedLabel(null).label, "Updates automatically");
  assert.equal(civicLastUpdatedLabel(null).iso, null);
}

{
  assert.equal(
    civicGroupForStory({ title: "Varanasi business summit", slug: "varanasi-business-summit" })
      ?.id,
    undefined
  );
  assert.equal(
    civicGroupForStory({ title: "An example notice", slug: "example-notice" })?.id,
    undefined
  );
  assert.equal(
    civicGroupForStory({ title: "A desire for change", slug: "desire-for-change" })?.id,
    undefined
  );
  assert.equal(
    civicGroupForStory({ title: "City buses diverted", slug: "city-buses" })?.id,
    "traffic"
  );
  assert.equal(
    civicGroupForStory({ title: "School timings changed", slug: "school-timings" })?.id,
    "schools"
  );
  assert.equal(
    civicGroupForStory({ title: "Inspector transferred to the city", slug: "inspector-moved" })
      ?.id,
    "police"
  );
  assert.equal(
    civicGroupForStory({ title: "Road closed near the bridge", slug: "road-closed-bridge" })?.id,
    "traffic"
  );
  assert.equal(
    civicGroupForStory({ title: "Road closure near the school", slug: "road-closure-school" })
      ?.id,
    "schools"
  );
  assert.equal(
    civicGroupForStory({ title: "SIR voter list published", slug: "sir-voter-list" })?.id,
    "voters"
  );
  assert.equal(
    civicGroupForStory({ title: "Traffic plan for SIR booths", slug: "traffic-sir" })?.id,
    "traffic"
  );
  assert.equal(
    civicGroupForStory({ title: "वाराणसी में डायवर्जन और तबादला", slug: "hi-note" })?.id,
    "traffic"
  );
  assert.equal(
    civicGroupForStory({ title: "स्कूल की छुट्टी", slug: "school-holiday" })?.id,
    "schools"
  );
  assert.equal(
    civicGroupForStory({ title: "बिजली और पानी आपूर्ति", slug: "bijli" })?.id,
    "utilities"
  );
  assert.equal(
    civicGroupForStory({
      title: "Cantt order",
      slug: "cantt-order",
      tags: "nagar nigam, VDA",
    })?.id,
    "utilities"
  );
}

{
  const list = groupCivicStories(
    [
      story({
        id: 1,
        slug: "delhi-traffic",
        title: "Delhi traffic diversion",
        content: "This is about Delhi only.",
      }),
      story({
        id: 2,
        slug: "varanasi-business",
        title: "Varanasi business summit",
      }),
      story({
        id: 3,
        slug: "evening-report",
        title: "Varanasi evening report",
        content: "A bus was stuck for an hour.",
      }),
      story({
        id: 4,
        slug: "varanasi-traffic-diversion-cantt",
        title: "Traffic diversion near Cantt",
        content: "Drivers should follow the new route.",
      }),
      story({
        id: 5,
        slug: "varanasi-school-bus",
        title: "School bus timings changed",
        createdAt: at(2),
        metaDescription: "  Power   cut\n\nstays one line ",
      }),
      story({
        id: 6,
        slug: "varanasi-school-holiday",
        title: "वाराणसी में स्कूल की छुट्टी",
        createdAt: at(0.5),
        metaDescription: "Notice &amp; timing",
      }),
      story({
        id: 7,
        slug: "bridge-works",
        title: "Bridge works begin",
        content: "The work is in Varanasi.",
        createdAt: at(3),
        metaDescription: "Power cut in Sigra",
      }),
      story({
        id: 8,
        slug: "old-traffic",
        title: "Varanasi traffic diversion",
        createdAt: at(30, 1),
      }),
      story({
        id: 9,
        slug: "future-traffic",
        title: "Varanasi traffic diversion tomorrow",
        createdAt: new Date(NOW.getTime() + 1000).toISOString(),
      }),
      story({
        id: 10,
        slug: "edge-traffic",
        title: "Varanasi traffic diversion on the boundary",
        createdAt: at(30),
      }),
      story({
        id: 11,
        slug: "varanasi-transfer",
        title: "Inspector transferred",
        category: "Varanasi",
        content: "",
        createdAt: at(1),
        metaDescription: null,
      }),
    ],
    NOW
  );

  assert.deepEqual(labelsOf([
    story({ id: 5, slug: "varanasi-school-bus", title: "School bus timings changed" }),
    story({ id: 6, slug: "varanasi-school-holiday", title: "वाराणसी में स्कूल की छुट्टी", createdAt: at(0.5) }),
    story({ id: 7, slug: "bridge-works", title: "Bridge works begin", content: "The work is in Varanasi.", createdAt: at(3) }),
    story({ id: 10, slug: "edge-traffic", title: "Varanasi traffic diversion on the boundary", createdAt: at(30) }),
    story({ id: 11, slug: "varanasi-transfer", title: "Inspector transferred", category: "Varanasi", content: "", createdAt: at(1) }),
  ]), [
    "Traffic and diversions",
    "Police transfers and postings",
    "Schools and exams",
  ]);

  assert.equal(
    list.items.some((item) => item.slug === "delhi-traffic"),
    false
  );
  assert.equal(
    list.items.some((item) => item.slug === "varanasi-business"),
    false
  );
  assert.equal(
    list.items.some((item) => item.slug === "evening-report"),
    false
  );
  assert.equal(
    list.items.some((item) => item.slug === "varanasi-traffic-diversion-cantt"),
    false
  );
  assert.equal(
    list.items.some((item) => item.slug === "old-traffic" || item.slug === "future-traffic"),
    false
  );

  const traffic = list.groups.find((group) => group.id === "traffic");
  assert.ok(traffic);
  assert.deepEqual(
    traffic.items.map((item) => item.slug),
    ["varanasi-school-bus", "bridge-works", "edge-traffic"]
  );
  assert.equal(traffic.items[0].excerpt, "Power cut stays one line");
  const school = list.groups.find((group) => group.id === "schools");
  assert.equal(school?.items[0].excerpt, "Notice & timing");
  assert.equal(school?.items[0].title, "वाराणसी में स्कूल की छुट्टी");
  const police = list.groups.find((group) => group.id === "police");
  assert.equal(police?.items[0].excerpt, null);
  assert.equal(list.items[0].href, "/articles/varanasi-school-bus");
  assert.equal(list.newestPublishedAt, at(0.5));
  assert.equal(list.indexable, true);
  assert.deepEqual(
    CIVIC_UPDATE_GROUPS.map((group) => group.label),
    [
      "Traffic and diversions",
      "Police transfers and postings",
      "Schools and exams",
      "Power, water and civic works",
      "Voters and elections",
    ]
  );
}

{
  const stories = Array.from({ length: 16 }, (_, index) =>
    story({
      id: index + 1,
      slug: `varanasi-traffic-${index + 1}`,
      title: `Varanasi traffic update ${index + 1}`,
      createdAt: new Date(NOW.getTime() - (16 - index) * 60 * 1000).toISOString(),
    })
  );
  const list = groupCivicStories(stories, NOW);
  assert.equal(list.groups.length, 1);
  assert.equal(list.items.length, 15);
  assert.equal(list.items[0].id, 16);
  assert.equal(list.items[14].id, 2);
  assert.equal(list.items.some((item) => item.id === 1), false);
}

{
  const sameTime = at(1);
  const list = groupCivicStories(
    [
      story({ id: 1, slug: "varanasi-jam-1", title: "Varanasi traffic jam one", createdAt: sameTime }),
      story({ id: 2, slug: "varanasi-jam-2", title: "Varanasi traffic jam two", createdAt: sameTime }),
    ],
    NOW
  );
  assert.deepEqual(list.items.map((item) => item.id), [2, 1]);
}

{
  const thin = groupCivicStories(
    [
      story({ id: 1, slug: "varanasi-voter", title: "Varanasi voter booth schedule" }),
      story({ id: 2, slug: "varanasi-power", title: "Varanasi power supply notice" }),
    ],
    NOW
  );
  assert.equal(thin.items.length, 2);
  assert.equal(thin.indexable, false);
  assert.deepEqual(
    thin.groups.map((group) => group.id),
    ["utilities", "voters"]
  );
}

{
  assert.equal(
    civicUpdatesPathForArticle({
      slug: "varanasi-school-chhutti",
      title: "वाराणसी में स्कूल की छुट्टी",
      language: "hi",
    } as { slug: string; title: string }),
    CIVIC_UPDATES_PATH
  );
  assert.equal(
    civicUpdatesPathForArticle({
      slug: "evening-report",
      title: "Varanasi evening report",
      content: "A bus was stuck.",
    }),
    null
  );
  assert.equal(
    civicUpdatesPathForArticle({
      slug: "varanasi-airport",
      title: "Varanasi airport expansion",
      content: "Gurugram traffic update",
    }),
    null
  );
}

{
  const assumed = groupCivicStories(
    [
      story({
        id: 1,
        slug: "cantt-diversion",
        title: "Cantt diversion from Monday",
        content: "",
      }),
    ],
    NOW,
    { assumeVaranasi: true }
  );
  assert.equal(assumed.items.length, 1);
  assert.equal(
    groupCivicStories(
      [
        story({
          id: 1,
          slug: "cantt-diversion",
          title: "Cantt diversion from Monday",
          content: "",
        }),
      ],
      NOW
    ).items.length,
    0
  );
}

console.log("civicUpdates.test.ts ok");
