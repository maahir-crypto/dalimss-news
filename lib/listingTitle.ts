/**
 * Strip keyword-stuffed "City based Company" prefixes from hub/home listing
 * labels. Full article pages keep the stored headline unchanged.
 */
const CITY_BASED_PREFIX =
  /^(Gurugram|Gurgaon|Varanasi|Banaras|Kashi)\s+based\s+/i;

export function cleanHubListingTitle(title: string): string {
  const trimmed = String(title || "").trim();
  if (!trimmed) return trimmed;
  const cleaned = trimmed.replace(CITY_BASED_PREFIX, "").trim();
  if (!cleaned || cleaned === trimmed) return trimmed;
  // Keep the first letter capitalised after stripping the prefix.
  return cleaned.replace(/^[a-z]/, (ch) => ch.toUpperCase());
}
