import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { articleSchemaType, isEvergreenGuide } from "./isEvergreenGuide";

const EVERGREEN_FROM_SITE = [
  {
    slug: "kisan-credit-card-online-apply-eligibility-documents",
    title: "Kisan Credit Card online apply: eligibility, documents and loan rules",
    category: "India",
  },
  {
    slug: "itr-download-pdf-filed-return-itr-v-receipt",
    title: "ITR download PDF: get your filed return and ITR-V receipt",
    category: "Business",
  },
  {
    slug: "waist-hip-ratio-measurement-formula-limits",
    title: "Waist-to-hip ratio: how to measure it and understand its limits",
    category: "Health",
  },
  {
    slug: "oscar-voting-best-picture-nominees-process",
    title: "Oscar voting explained: who picks Best Picture nominees?",
    category: "Entertainment",
  },
  {
    slug: "pathaan-worldwide-collection-yrf-july-2023-gross",
    title: "Pathaan worldwide collection: what YRF's 5 July 2023 figure says",
    category: "Entertainment",
  },
  {
    slug: "credit-utilisation-ratio-formula-cibil-examples",
    title: "Credit utilisation ratio: formula, examples and CIBIL context",
    category: "Business",
  },
  {
    slug: "ipl-slow-over-rate-penalty-fines-captain-fielding",
    title: "IPL slow over rate penalty: fines, captain liability and field limits",
    category: "Sports",
  },
  {
    slug: "premier-league-tie-breaker-rules-goal-difference-playoff",
    title: "Premier League tie breaker rules: goal difference to playoffs",
    category: "Sports",
  },
  {
    slug: "what-are-embeddings-in-ai-vectors-search-context",
    title: "What are embeddings in AI? Vectors, search and context explained",
    category: "Explainers",
  },
  {
    slug: "claude-privacy-settings-turn-off-model-training",
    title: "Claude privacy settings: how to turn off model training",
    category: "Explainers",
  },
  {
    slug: "adobe-firefly-vs-canva-free-image-limits-india-plans",
    title: "Adobe Firefly vs Canva: free AI image limits and India plans",
    category: "Explainers",
  },
  {
    slug: "form-10-iea-applicability-due-date-regime-switch",
    title: "Form 10-IEA: who must file it, due date and regime switch rules",
    category: "Business",
  },
  {
    slug: "esanjeevani-opd-registration-free-consultations-records",
    title: "eSanjeevani OPD: registration, free consultations and records",
    category: "Health",
  },
  {
    slug: "pm-yasasvi-school-scholarship-eligibility-application",
    title: "PM YASASVI school scholarship: eligibility, amounts and application",
    category: "India",
  },
  {
    slug: "ibps-clerk-exam-pattern-2026-csa-xvi-prelims-mains",
    title: "IBPS Clerk exam pattern 2026: CSA XVI sections, marks and timers",
    category: "Education",
  },
  {
    slug: "ipo-allotment-status-nse-bid-pan-blocked-money",
    title: "IPO allotment status on NSE: check bids, PAN and blocked money",
    category: "Business",
  },
  {
    slug: "silver-hallmark-check-925-999-huid-bis",
    title: "Silver hallmark check: what 925, 999 and HUID mean",
    category: "Business",
  },
  {
    slug: "national-consumer-helpline-1915-complaint-tracking",
    title: "National Consumer Helpline: 1915, online complaints and tracking",
    category: "India",
  },
  {
    slug: "stair-climbing-benefits-intensity-strength-safe-limits",
    title: "Stair climbing benefits: intensity, strength and safe limits",
    category: "Health",
  },
  {
    slug: "hypothermia-lakshan-winter-cold-warning-signs",
    title: "हाइपोथर्मिया के लक्षण: ठंड में किन संकेतों पर तुरंत मदद लें",
    category: "स्वास्थ्य",
  },
  {
    slug: "palanhar-yojana-patrata-rashi-avedan-navinikaran",
    title: "पालनहार योजना: पात्रता, सहायता राशि, आवेदन और नवीनीकरण",
    category: "भारत",
  },
  {
    slug: "maiya-samman-yojana-status-patrata-pavti-bhugtan",
    title: "मंईयां सम्मान योजना स्टेटस: पात्रता, पावती और भुगतान की जांच",
    category: "भारत",
  },
] as const;

const NEWS_FROM_SITE = [
  {
    slug: "gurugram-nhb-three-agribusiness-consultants-november-13",
    title: "Gurugram NHB seeks three agribusiness consultants at Rs 80,000",
    category: "India, Gurugram, Business",
  },
  {
    slug: "gurugram-34-hospitals-billing-records-package-checks-november-12",
    title: "Gurugram seeks billing records from 34 hospitals for package checks",
    category: "India, Gurugram, Health",
  },
  {
    slug: "varanasi-chhath-revenue-office-holiday-nov16-2026",
    title: "Varanasi November 16 Chhath holiday: revenue office work affected",
    category: "India, Uttar Pradesh, Varanasi, Civic",
  },
  {
    slug: "varanasi-bhu-sangamam-volunteer-call-nov12-2026",
    title: "Varanasi students invited to volunteer for Kashi Tamil Sangamam 5.0",
    category: "India, Uttar Pradesh, Varanasi, Education",
  },
  {
    slug: "gurugram-four-village-pond-tenders-november-13",
    title: "Gurugram invites Rs 1.91 crore bids for four village ponds",
    category: "Gurugram",
  },
  {
    slug: "varanasi-aqi-130-pm25-prominent-nov12-2026",
    title: "Varanasi AQI falls to 130 on November 12; PM2.5 joins prominent pollutants",
    category: "Varanasi",
  },
  {
    slug: "india-new-zealand-fifth-odi-15-november-2026",
    title: "India vs New Zealand 5th ODI, 15 November: time and updated squads",
    category: "Sports",
  },
  {
    slug: "supreme-court-stridhan-ownership-proof-2024-ruling",
    title: "Supreme Court on stridhan: ownership, proof and the 2024 ruling",
    category: "India",
  },
  {
    slug: "epfo-auto-claim-settlement-limit-five-lakh-eligibility",
    title: "EPFO auto claim settlement limit: Rs 5 lakh and eligibility checks",
    category: "India",
  },
  {
    slug: "heartland-netflix-2026-release-cast-hindi-audio",
    title: "Heartland on Netflix: November 13 release, cast and Hindi audio",
    category: "Entertainment",
  },
  {
    slug: "bihar-vidhan-sabha-recruitment-2026-junior-secretariat-assistant",
    title: "Bihar Vidhan Sabha recruitment 2026: 15 assistant posts, apply by 6 December",
    category: "Education",
  },
  {
    slug: "up-board-time-table-2027-class-10-12-exam-dates-pdf",
    title: "यूपी बोर्ड टाइम टेबल 2027: 5 से 24 फरवरी तक परीक्षा, विषयवार तारीखें",
    category: "शिक्षा",
  },
  {
    slug: "cds-1-final-result-2026-pdf-check-roll-number",
    title: "CDS 1 final result 2026: how to check the 2 November merit list",
    category: "Education",
  },
  {
    slug: "gurugram-university-final-ug-exam-dates-november-13",
    title: "Gurugram University issues final UG exam dates from November 26",
    category: "Education",
  },
  {
    slug: "gurugram-acb-hsvp-engineer-bribe-arrest-november-13",
    title: "Gurugram ACB arrests HSVP engineer in bribe case",
    category: "India, Gurugram, Crime",
  },
  {
    slug: "tvs-x-price-266141",
    title: "TVS X price: Rs 2,66,141, charger included",
    category: "Automotive",
  },
  {
    slug: "bmw-ce-02-449900",
    title: "BMW CE 02 price: Rs 4,49,900 ex-showroom, urban EV guide",
    category: "Automotive",
  },
  {
    slug: "voltas-245inv-vectra-plush-60000",
    title: "Voltas 245INV Vectra Plush price: Rs 60,000 for the 2 ton AC",
    category: "Technology",
  },
] as const;

describe("isEvergreenGuide", () => {
  for (const story of EVERGREEN_FROM_SITE) {
    it(`classifies ${story.slug} as evergreen`, () => {
      assert.equal(isEvergreenGuide(story), true, story.slug);
      assert.equal(articleSchemaType(story), "Article");
    });
  }

  for (const story of NEWS_FROM_SITE) {
    it(`keeps ${story.slug} as news`, () => {
      assert.equal(isEvergreenGuide(story), false, story.slug);
      assert.equal(articleSchemaType(story), "NewsArticle");
    });
  }

  it("does not treat a how-to title as evergreen when the slug is a timely result", () => {
    assert.equal(
      isEvergreenGuide({
        slug: "cds-1-final-result-2026-pdf-check-roll-number",
        title: "CDS 1 final result 2026: how to check the 2 November merit list",
        category: "Education",
      }),
      false
    );
  });

  it("returns false for empty fields", () => {
    assert.equal(isEvergreenGuide({}), false);
    assert.equal(isEvergreenGuide({ slug: "", title: "", category: "" }), false);
    assert.equal(isEvergreenGuide({ slug: null, title: null, category: null }), false);
  });
});

describe("evergreen wiring", () => {
  const newsSitemap = readFileSync(
    new URL("../pages/news-sitemap.xml.ts", import.meta.url),
    "utf8"
  );
  const mainSitemap = readFileSync(
    new URL("../pages/sitemap.xml.ts", import.meta.url),
    "utf8"
  );
  const jsonLd = readFileSync(
    new URL("../components/ArticleJsonLd.tsx", import.meta.url),
    "utf8"
  );

  it("drops evergreen guides from the Google News sitemap only", () => {
    assert.match(newsSitemap, /isEvergreenGuide/);
    assert.doesNotMatch(mainSitemap, /isEvergreenGuide/);
  });

  it("switches evergreen guides to Article schema", () => {
    assert.match(jsonLd, /articleSchemaType|isEvergreenGuide/);
  });
});
