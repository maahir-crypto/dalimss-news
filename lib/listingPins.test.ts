import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LISTING_PINS,
  PIN_MAX_AGE_DAYS,
  activeListingPinSlugs,
  applyListingPins,
  isActiveListingPin,
} from "./listingPins";

describe("listingPins", () => {
  it("expires pins past their event date", () => {
    const pin = {
      slug: "karwa-chauth-29-october-2026-date-holiday-rituals",
      eventDateIst: "2026-10-29",
      pinnedOnIst: "2026-10-26",
      untilIst: "2026-11-02",
    };
    assert.equal(
      isActiveListingPin(pin, new Date("2026-10-28T12:00:00+05:30")),
      true
    );
    assert.equal(
      isActiveListingPin(pin, new Date("2026-10-30T12:00:00+05:30")),
      false
    );
  });

  it(`expires pins older than ${PIN_MAX_AGE_DAYS} days from pinnedOnIst`, () => {
    const pin = {
      slug: "saras-food-festival-delhi-21-november-8-december-2026",
      eventDateIst: "2026-12-08",
      pinnedOnIst: "2026-11-08",
      untilIst: "2026-11-15",
    };
    assert.equal(
      isActiveListingPin(pin, new Date("2026-11-14T12:00:00+05:30")),
      true
    );
    assert.equal(
      isActiveListingPin(pin, new Date("2026-11-16T12:00:00+05:30")),
      false
    );
  });

  it("returns no active pins on 20 Nov 2026 for the stale festival list", () => {
    assert.deepEqual(
      activeListingPinSlugs(new Date("2026-11-20T12:00:00+05:30")),
      []
    );
    assert.ok(LISTING_PINS.length >= 2);
  });

  it("leaves listing order alone when every pin has expired", () => {
    const rows = [
      { slug: "fresh-local-story" },
      { slug: "karwa-chauth-29-october-2026-date-holiday-rituals" },
      { slug: "another-story" },
    ];
    assert.deepEqual(
      applyListingPins(rows, new Date("2026-11-20T12:00:00+05:30")).map(
        (row) => row.slug
      ),
      ["fresh-local-story", "karwa-chauth-29-october-2026-date-holiday-rituals", "another-story"]
    );
  });
});
