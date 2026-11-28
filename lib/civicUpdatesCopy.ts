/**
 * Page copy and date formatting for the civic updates tracker.
 * This module stays free of the database client so the browser bundle
 * does not load it.
 */

import { SITE_URL, formatDateIST, toISOWithTZ } from "@/lib/seo";

export const CIVIC_UPDATES_PATH = "/varanasi-news/civic-updates";
export const CIVIC_UPDATES_CANONICAL = `${SITE_URL}${CIVIC_UPDATES_PATH}`;

/** Part before the pipe. 51 characters, used unchanged. */
export const CIVIC_UPDATES_TITLE_BEFORE_PIPE =
  "Varanasi Civic Updates: Traffic, Transfers, Schools";

/**
 * Full document title. Topic hubs set <title> directly. Do not pass this
 * through trimTitleAtWordBoundary: that helper stops at 60 characters and
 * would cut the brand off this title.
 */
export const CIVIC_UPDATES_TITLE = `${CIVIC_UPDATES_TITLE_BEFORE_PIPE} | Dalimss News`;

export const CIVIC_UPDATES_H1 =
  "Varanasi Civic Updates: Traffic Diversions, Transfers and School Notices";

export const CIVIC_UPDATES_DESCRIPTION =
  "Latest Varanasi civic notices in one place: traffic diversions, police transfers, school timings, power and water updates, each from an official order.";

export const CIVIC_UPDATES_INTRO =
  "This page collects Dalimss News reports on public notices in Varanasi: traffic diversions and road closures, police transfers and postings, school timings and closures, power and water supply notices, voter services and municipal orders. Each entry links to a full story written from the official order or notice, with its publish date in IST. The list updates automatically as the Varanasi desk publishes new civic reports.";

export const CIVIC_UPDATES_TRACKER_LABEL = "Varanasi civic updates tracker";
export const CIVIC_UPDATES_MORE_LABEL = "More Varanasi news";

export const CIVIC_UPDATES_LLMS_LINE =
  "Varanasi civic updates: traffic diversions, police transfers, school notices, power and water updates, collected from official orders.";

export const CIVIC_UPDATES_LLMS_BULLET = `- Varanasi civic updates: ${CIVIC_UPDATES_CANONICAL}. ${CIVIC_UPDATES_LLMS_LINE}`;

export const CIVIC_UPDATES_WINDOW_DAYS = 30;
export const CIVIC_UPDATES_WINDOW_MS =
  CIVIC_UPDATES_WINDOW_DAYS * 24 * 60 * 60 * 1000;
export const CIVIC_UPDATES_GROUP_LIMIT = 15;
export const CIVIC_UPDATES_INDEX_MIN = 3;

/** Same robots directive the site layout uses when the list is indexable. */
export const CIVIC_UPDATES_ROBOTS_INDEX =
  "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
export const CIVIC_UPDATES_ROBOTS_THIN = "noindex, follow";

/** Same clock style as the Varanasi hub Last updated line. */
const CIVIC_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

export function civicWindowStart(now: Date): Date {
  return new Date(now.getTime() - CIVIC_UPDATES_WINDOW_MS);
}

export function formatCivicPublishedAt(value: string | Date): string {
  return formatDateIST(value, CIVIC_DATE_FORMAT);
}

export function civicUpdatesRobots(itemCount: number): string {
  return itemCount >= CIVIC_UPDATES_INDEX_MIN
    ? CIVIC_UPDATES_ROBOTS_INDEX
    : CIVIC_UPDATES_ROBOTS_THIN;
}

export function civicLastUpdatedLabel(newestPublishedAt: string | null): {
  iso: string | null;
  label: string;
} {
  if (!newestPublishedAt) {
    return { iso: null, label: "Updates automatically" };
  }
  return {
    iso: toISOWithTZ(newestPublishedAt),
    label: formatCivicPublishedAt(newestPublishedAt),
  };
}
