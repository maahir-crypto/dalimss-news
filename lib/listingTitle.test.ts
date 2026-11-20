import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cleanHubListingTitle } from "./listingTitle";

describe("cleanHubListingTitle", () => {
  it("strips Gurugram based prefixes", () => {
    assert.equal(
      cleanHubListingTitle("Gurugram based Urban Company closes placement"),
      "Urban Company closes placement"
    );
    assert.equal(
      cleanHubListingTitle("Gurugram based SpiceJet board clears plan"),
      "SpiceJet board clears plan"
    );
  });

  it("leaves ordinary headlines alone", () => {
    assert.equal(
      cleanHubListingTitle("Gurugram Metro depot moves to acceptance"),
      "Gurugram Metro depot moves to acceptance"
    );
  });
});
