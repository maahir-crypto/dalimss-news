import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { priceHubFamilyFor, priceHubIdFor } from "./priceHubs";
import {
  RELATED_LINK_COUNT,
  applyRelatedArticleLinks,
  pickRelatedArticles,
  type RelatedCandidate,
  type RelatedPick,
} from "./relatedArticles";

function row(
  slug: string,
  title: string,
  tags: string,
  category = "Technology",
  language = "en"
): RelatedCandidate {
  return { slug, title, tags, category, language };
}

function linked(slugs: string[]): string {
  const anchors = slugs.map(
    (slug) => `<a href="https://dalimss.news/articles/${slug}">${slug}</a>`
  );
  return `<p>See ${anchors[0]}, ${anchors[1]} and ${anchors[2]}.</p>`;
}

function slugsOf(picks: RelatedPick[]): string[] {
  return picks.map((pick) => pick.slug);
}

function assertThree(picks: RelatedPick[], self: string) {
  assert.equal(picks.length, RELATED_LINK_COUNT);
  const seen: { [href: string]: boolean } = {};
  for (let index = 0; index < picks.length; index += 1) {
    assert.equal(seen[picks[index].href], undefined);
    seen[picks[index].href] = true;
    assert.notEqual(picks[index].slug, self);
    assert.equal(picks[index].label.indexOf("\u2014"), -1);
    assert.equal(picks[index].label.indexOf("\u2013"), -1);
  }
}

const oldPhone = row(
  "old-phone-exchange-sell-diwali-2026-backup-sign-out-reset-checklist",
  "Old phone exchange checklist",
  "phone, backup, exchange"
);
const xiaomiWarranty = row(
  "xiaomi-india-warranty-1-year-phones-6-months-accessories",
  "Xiaomi India warranty: 1 year on phones",
  "Xiaomi, Warranty, Phones"
);
const samsungWarranty = row(
  "samsung-india-warranty-terms-covered-voided-repairs-october-2026",
  "Samsung India warranty terms",
  "Samsung, Warranty, Repairs"
);
const chargingGuide = row(
  "fast-charging-explained-usb-pd-pps-supervooc-charger-india",
  "Fast charging explained: USB PD, PPS and SUPERVOOC",
  "fast charging, USB-C, smartphone chargers"
);
const hmdVs = row(
  "hmd-101-1119-vs-hmd-100-969",
  "HMD 101 vs HMD 100 keypad phone comparison",
  "comparison, feature phones"
);
const hmdHindiPrice = row(
  "hmd-105-price-hindi",
  "HMD 105 price",
  "HMD, price",
  "Technology",
  "hi"
);

const hmd = row(
  "hmd-105-1-year-replacement-guarantee-claim",
  "HMD 105 1-year replacement guarantee: how to prepare a claim",
  "Technology, HMD 105, Feature phones, Warranty, Consumer service, India"
);
hmd.content = linked([oldPhone.slug, xiaomiWarranty.slug, samsungWarranty.slug]);

{
  const picks = pickRelatedArticles(hmd, [
    hmd,
    oldPhone,
    xiaomiWarranty,
    samsungWarranty,
    hmdVs,
    hmdHindiPrice,
  ]);
  assertThree(picks, hmd.slug);
  assert.deepEqual(slugsOf(picks), [hmdVs.slug, xiaomiWarranty.slug, samsungWarranty.slug]);
  assert.equal(picks[0].kind, "article");
  assert.equal(picks.some((pick) => pick.kind === "hub"), false);
  assert.equal(picks.some((pick) => pick.slug === hmdHindiPrice.slug), false);
  const html = applyRelatedArticleLinks(hmd, [
    hmd,
    oldPhone,
    xiaomiWarranty,
    samsungWarranty,
    hmdVs,
  ]);
  assert.ok(html.indexOf(hmdVs.slug) !== -1);
  assert.equal(html.indexOf(oldPhone.slug), -1);
  assert.equal((html.match(/<a\b/g) || []).length, 3);
}

{
  const picks = pickRelatedArticles(hmd, [hmd, oldPhone, xiaomiWarranty, samsungWarranty, hmdHindiPrice]);
  assertThree(picks, hmd.slug);
  assert.equal(picks[0].kind, "hub");
  assert.equal(picks[0].href, "https://dalimss.news/prices/phones");
  assert.equal(picks[0].label, "Phone price guide");
  assert.equal(picks.some((pick) => pick.slug === hmdHindiPrice.slug), false);
  assert.equal(priceHubIdFor(hmd), null);
  assert.equal(priceHubFamilyFor(hmd), "phones");
}

const tecno = row(
  "tecno-pova-5-pro-5g-68w-charging-repair-checks",
  "Before a TECNO POVA 5 Pro repair, check the 68W charging kit",
  "Technology, TECNO, POVA 5 Pro 5G, Repair, Charging, India, How-to"
);
tecno.content = `<p>Our <a href="https://dalimss.news/articles/${chargingGuide.slug}">charging-protocol guide</a> gives background. See <a href="https://example.com/policy">the official note</a>, the <a href="https://dalimss.news/articles/${xiaomiWarranty.slug}">Xiaomi guide</a> and the <a href="https://dalimss.news/articles/${samsungWarranty.slug}">Samsung guide</a>.</p>`;

{
  const pool = [tecno, chargingGuide, xiaomiWarranty, samsungWarranty, hmdVs];
  const picks = pickRelatedArticles(tecno, pool);
  assertThree(picks, tecno.slug);
  assert.equal(picks[0].kind, "hub");
  assert.equal(picks[0].href, "https://dalimss.news/prices/phones");
  assert.equal(picks[0].label, "Phone price guide");
  assert.deepEqual(slugsOf(picks).slice(1), [chargingGuide.slug, samsungWarranty.slug]);
  assert.equal(picks.some((pick) => pick.slug.indexOf("tecno") === 0 && pick.kind === "article"), false);
  assert.equal(priceHubIdFor(tecno), null);
  assert.equal(priceHubFamilyFor(tecno), "phones");
  const html = applyRelatedArticleLinks(tecno, pool);
  assert.ok(html.indexOf("https://dalimss.news/prices/phones") !== -1);
  assert.ok(html.indexOf("Phone price guide") !== -1);
  assert.ok(html.indexOf("https://example.com/policy") !== -1);
  assert.equal(html.indexOf(xiaomiWarranty.slug), -1);
  assert.equal((html.match(/<a\b/g) || []).length, 4);
}

const cmf = row(
  "cmf-phone-2-pro-charging-65-minutes-conditions",
  "CMF Phone 2 Pro charging: the conditions behind 65 minutes",
  "Technology, CMF, Phone 2 Pro, Charging, India, Explainer"
);
cmf.content = linked([chargingGuide.slug, xiaomiWarranty.slug, samsungWarranty.slug]);
const nothingPrice = row(
  "nothing-phone-2-price-list",
  "Nothing Phone 2 price list",
  "Nothing, Phone prices"
);

{
  const picks = pickRelatedArticles(cmf, [
    cmf,
    chargingGuide,
    xiaomiWarranty,
    samsungWarranty,
    nothingPrice,
  ]);
  assertThree(picks, cmf.slug);
  assert.equal(picks[0].href, "https://dalimss.news/prices/phones");
  assert.equal(picks[0].label, "Phone price guide");
  assert.equal(picks.some((pick) => pick.slug === nothingPrice.slug), false);
  assert.equal(priceHubIdFor(cmf), null);
  assert.equal(priceHubFamilyFor(cmf), "phones");
}

const boleroPrice = row(
  "mahindra-bolero-price-rs-8-56-999-to-rs-9-98-999-october-2026",
  "Mahindra Bolero price",
  "Mahindra, Bolero, Car prices",
  "Automotive"
);
const boleroNeo = row(
  "mahindra-bolero-neo-price-rs-9-06-lakh-to-rs-10-85-lakh-october-2026",
  "Mahindra Bolero Neo price",
  "Mahindra, Bolero Neo, Car prices",
  "Automotive"
);
const scorpioPrice = row(
  "mahindra-scorpio-n-price-rs-13-69-lakh-to-rs-25-49-lakh-october-2026",
  "Mahindra Scorpio N price",
  "Mahindra, Scorpio N, Car prices",
  "Automotive"
);
const fada = row(
  "fada-september-2026-cv-retail-1-03-lakh-electric-three-wheelers-65",
  "Commercial vehicle retail trends",
  "FADA, commercial vehicles, Automotive",
  "Automotive"
);
const goodsEntry = row(
  "bs-iv-goods-vehicles-delhi-entry-ends-31-october-2026-caqm",
  "Goods vehicle entry explainer",
  "goods vehicles, Delhi, Automotive",
  "Automotive"
);
const loanGuide = row(
  "car-two-wheeler-loan-diwali-2026-rbi-rules-kfs-apr-prepayment",
  "Vehicle loan documentation guide",
  "car loan, two-wheeler, RBI",
  "Automotive"
);
const bolero = row(
  "mahindra-bolero-maxx-pik-up-hd-2000-kg-payload-variants",
  "Bolero MaXX Pik-Up HD: which version carries 2,000 kg?",
  "Automotive, Mahindra, Bolero MaXX, Pickup Trucks, Payload, Variant Guide",
  "Automotive"
);
bolero.content = linked([fada.slug, goodsEntry.slug, loanGuide.slug]);

{
  const picks = pickRelatedArticles(bolero, [
    bolero,
    fada,
    goodsEntry,
    loanGuide,
    boleroPrice,
    boleroNeo,
    scorpioPrice,
  ]);
  assertThree(picks, bolero.slug);
  assert.deepEqual(slugsOf(picks), [boleroPrice.slug, boleroNeo.slug, scorpioPrice.slug]);
  assert.equal(picks.some((pick) => pick.kind === "hub"), false);
  for (let index = 0; index < picks.length; index += 1) {
    assert.equal(picks[index].slug.indexOf("mahindra-"), 0);
  }
}

const cretaSafety = row(
  "hyundai-creta-safety-airbags-explained",
  "Hyundai Creta safety and airbags",
  "Hyundai, Creta, Car safety",
  "Automotive"
);
const nexonSafety = row(
  "tata-nexon-safety-airbag-count",
  "Tata Nexon safety: airbag count",
  "Tata, Nexon, Car safety",
  "Automotive"
);
const seltosSafety = row(
  "kia-seltos-safety-features-guide",
  "Kia Seltos safety features",
  "Kia, Seltos, Car safety",
  "Automotive"
);
const cretaPrice = row(
  "hyundai-creta-price-list-october-2026",
  "Hyundai Creta price list",
  "Hyundai, Creta, Car prices",
  "Automotive"
);
const forceGurkha = row(
  "force-gurkha-safety-airbags-explained",
  "Force Gurkha safety: airbags explained",
  "Force, Gurkha, Car safety, Automotive",
  "Automotive"
);
forceGurkha.content = linked([cretaSafety.slug, nexonSafety.slug, seltosSafety.slug]);

{
  const picks = pickRelatedArticles(forceGurkha, [
    forceGurkha,
    cretaSafety,
    nexonSafety,
    seltosSafety,
    cretaPrice,
  ]);
  assertThree(picks, forceGurkha.slug);
  assert.equal(picks[0].kind, "hub");
  assert.equal(picks[0].href, "https://dalimss.news/prices/cars");
  assert.equal(picks[0].label, "Car price guide");
  assert.deepEqual(slugsOf(picks).slice(1), [cretaSafety.slug, nexonSafety.slug]);
  assert.equal(picks.some((pick) => pick.slug === cretaPrice.slug), false);
  assert.equal(priceHubIdFor(forceGurkha), null);
  assert.equal(priceHubFamilyFor(forceGurkha), "cars");
}

const ghatA = row(
  "varanasi-dashashwamedh-crowd",
  "Dashashwamedh crowd",
  "Varanasi, Ghats",
  "Varanasi"
);
const ghatB = row(
  "kashi-vishwanath-evening-aarti",
  "Evening aarti",
  "Varanasi, Temple",
  "Varanasi"
);
const ghatC = row(
  "varanasi-ghat-cleaning-drive",
  "Ghat cleaning drive",
  "Varanasi, Civic",
  "Varanasi"
);
const vivoPrice = row(
  "vivo-phone-price-list-india",
  "vivo phone price list India",
  "vivo, Phone prices"
);
const ghats = row(
  "varanasi-ghats-evening-aarti-crowd",
  "Varanasi ghats draw evening crowds",
  "Varanasi, Ghats, Civic",
  "Varanasi"
);
ghats.content = linked([ghatA.slug, ghatB.slug, ghatC.slug]);

{
  const pool = [ghats, ghatA, ghatB, ghatC, vivoPrice, hmdVs];
  const picks = pickRelatedArticles(ghats, pool);
  assertThree(picks, ghats.slug);
  assert.deepEqual(slugsOf(picks), [ghatA.slug, ghatB.slug, ghatC.slug]);
  assert.equal(priceHubFamilyFor(ghats), null);
  assert.equal(applyRelatedArticleLinks(ghats, pool), ghats.content);
}

const cityPrice = row(
  "honda-city-price-list-1199900-to-2099900",
  "Honda City variant price guide",
  "Honda, City, Car prices",
  "Automotive"
);
const elevatePrice = row(
  "honda-new-elevate-price-rs-11-80-lakh-to-rs-18-40-lakh-ex-showroom",
  "Honda Elevate price coverage",
  "Honda, Elevate, Car prices",
  "Automotive"
);
const hondaRoundup = row(
  "honda-car-starting-prices-amaze-rs-6-97-700-zr-v-rs-49-99-900",
  "Honda starting-price roundup",
  "Honda, Amaze, Car prices",
  "Automotive"
);
const amazePrice = row(
  "honda-amaze-price-list-october-2026",
  "Honda Amaze price list",
  "Honda, Amaze, Car prices",
  "Automotive"
);
const amaze = row(
  "honda-amaze-safety-6-airbags-v-vx-zx",
  "Honda Amaze safety explained: 6 airbags on V, VX and ZX",
  "Honda, Amaze, Car safety, Honda Sensing, Bharat NCAP, Sedans",
  "Automotive"
);
amaze.content = linked([cityPrice.slug, elevatePrice.slug, hondaRoundup.slug]);

const magnitePrice = row(
  "nissan-magnite-price-rs-5-69-400-to-rs-8-76-000-october-2026",
  "Nissan Magnite price report",
  "Nissan, Magnite, Car prices",
  "Automotive"
);
const gravitePrice = row(
  "nissan-gravite-price-list-573400-to-908500",
  "Nissan Gravite price list",
  "Nissan, Gravite, Car prices",
  "Automotive"
);
const tektonPrice = row(
  "nissan-tekton-price-list-1049000-to-1859000",
  "Nissan Tekton price list",
  "Nissan, Tekton, Car prices",
  "Automotive"
);
const magniteWarranty = row(
  "nissan-magnite-warranty-10-years-engine-transmission",
  "Nissan Magnite warranty: 10 years, with narrower cover after year 7",
  "Nissan, Magnite, Warranty, Car ownership, Consumer guides, India",
  "Automotive"
);
magniteWarranty.content = linked([magnitePrice.slug, gravitePrice.slug, tektonPrice.slug]);

{
  const hondaPool = [amaze, cityPrice, elevatePrice, hondaRoundup, amazePrice];
  const hondaPicks = pickRelatedArticles(amaze, hondaPool);
  assertThree(hondaPicks, amaze.slug);
  assert.deepEqual(slugsOf(hondaPicks), [cityPrice.slug, elevatePrice.slug, hondaRoundup.slug]);
  assert.equal(hondaPicks.some((pick) => pick.slug === amazePrice.slug), false);
  assert.equal(applyRelatedArticleLinks(amaze, hondaPool), amaze.content);

  const nissanPool = [magniteWarranty, magnitePrice, gravitePrice, tektonPrice, amazePrice];
  const nissanPicks = pickRelatedArticles(magniteWarranty, nissanPool);
  assertThree(nissanPicks, magniteWarranty.slug);
  assert.deepEqual(slugsOf(nissanPicks), [magnitePrice.slug, gravitePrice.slug, tektonPrice.slug]);
  assert.equal(applyRelatedArticleLinks(magniteWarranty, nissanPool), magniteWarranty.content);
}

{
  const here = path.dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(path.join(here, "relatedArticles.ts"), "utf8");
  assert.equal(source.indexOf("\u2014"), -1);
  assert.equal(source.indexOf("\u2013"), -1);
}

console.log("relatedArticles.test.ts ok");
