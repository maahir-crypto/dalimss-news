import { istCalendarDate } from "@/lib/partnerRashifal";

/** Soft-featured items older than this many days drop from pin slots. */
export const PIN_MAX_AGE_DAYS = 7;

export type ListingPin = {
  slug: string;
  /**
   * Inclusive last Asia/Calcutta calendar day the pin may appear.
   * When omitted, the pin expires PIN_MAX_AGE_DAYS after `pinnedOnIst`
   * (or today when that is also omitted — i.e. already expired).
   */
  untilIst?: string;
  /** Event day in IST; the pin drops after this calendar date. */
  eventDateIst?: string;
  /** Day the item was intentionally pinned (IST YYYY-MM-DD). */
  pinnedOnIst?: string;
};

/**
 * Intentional short-lived pins for city hubs and the homepage lead.
 * Stale festival soft-pins (Karwa Chauth, SARAS, etc.) that previously
 * floated via updatedAt bumps are listed here so they expire by date.
 */
export const LISTING_PINS: ListingPin[] = [
  {
    slug: "karwa-chauth-29-october-2026-date-holiday-rituals",
    eventDateIst: "2026-10-29",
    pinnedOnIst: "2026-10-26",
    untilIst: "2026-11-02",
  },
  {
    slug: "saras-food-festival-delhi-21-november-8-december-2026",
    eventDateIst: "2026-12-08",
    pinnedOnIst: "2026-11-08",
    untilIst: "2026-11-15",
  },
  {
    slug: "saras-aajeevika-mela-gurugram-2026-shopping-guide",
    eventDateIst: "2026-11-30",
    pinnedOnIst: "2026-10-20",
    untilIst: "2026-10-27",
  },
];

function addDaysIst(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + days);
  return new Date(utc).toISOString().slice(0, 10);
}

/** True when a pin is still within its age and event windows. */
export function isActiveListingPin(
  pin: ListingPin,
  now: Date = new Date()
): boolean {
  const today = istCalendarDate(now);
  if (pin.eventDateIst && today > pin.eventDateIst) return false;
  if (pin.untilIst && today > pin.untilIst) return false;
  if (pin.pinnedOnIst) {
    const ageLimit = addDaysIst(pin.pinnedOnIst, PIN_MAX_AGE_DAYS);
    if (today > ageLimit) return false;
  } else if (!pin.untilIst && !pin.eventDateIst) {
    return false;
  }
  return true;
}

/** Slugs that may still occupy a featured/pin slot today. */
export function activeListingPinSlugs(now: Date = new Date()): string[] {
  return LISTING_PINS.filter((pin) => isActiveListingPin(pin, now)).map(
    (pin) => pin.slug
  );
}

/**
 * Drop expired pin slugs from the front of a listing. Active pins keep
 * their relative order at the front; everything else follows in the
 * order already provided (normally createdAt desc).
 */
export function applyListingPins<T extends { slug: string }>(
  articles: readonly T[],
  now: Date = new Date()
): T[] {
  const active = new Set(activeListingPinSlugs(now));
  if (!active.size) return articles.slice();
  const pinned: T[] = [];
  const rest: T[] = [];
  for (const article of articles) {
    if (active.has(article.slug)) pinned.push(article);
    else rest.push(article);
  }
  return [...pinned, ...rest];
}
