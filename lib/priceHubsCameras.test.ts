import assert from "node:assert/strict";
import { priceHubIdFor } from "./priceHubs";

// Live titles and sections from dalimss.news, 1 Nov 2026. Tags left empty on purpose.
const cases: [string, string, string, string | null][] = [
  ["canon-eos-r8-mark-ii-r8-178995-142995", "Canon EOS R8 Mark II vs R8 price: R8 starts lower at Rs 1,42,995", "Technology", "gadgets-and-accessories"],
  ["canon-eos-r5-mark-ii-405995", "Canon EOS R5 Mark II price: Rs 4,05,995 for the body", "Technology", "gadgets-and-accessories"],
  ["imac-m6-174900-199900", "iMac M6 price: Rs 1,74,900 starting figure, 6 November arrival", "Technology", "laptops-and-tablets"],
  ["apple-mac-mini-m6-94400-amazon-gif-early-deal-october-2026", "Apple Mac mini M6 listed at Rs 94,400 in Amazon Great Indian Festival early deals", "Technology", "laptops-and-tablets"],
  ["qubo-smart-cam-360-3mp-price-2789", "Qubo Smart Cam 360 3MP price: Rs 2,789", "Technology", "gadgets-and-accessories"],
  ["qubo-16a-10a-price-949-899", "Qubo Smart Plug 16A vs 10A price: 10A starts lower at Rs 899", "Technology", "gadgets-and-accessories"],
  ["qubo-smart-bulb-price-list-599-to-799", "Qubo smart bulb price list: Rs 599 to Rs 799", "Technology", "gadgets-and-accessories"],
  ["qubo-video-doorbell-pro-2k-price-8990", "Qubo Video Doorbell Pro 2K price: Rs 8,990", "Technology", "gadgets-and-accessories"],
  ["insta360-x5-essential-62990-amazon-gif-early-deal-oct-2026", "Insta360 X5 Essential listed at Rs 62,990 in Amazon GIF early deals", "Technology", "gadgets-and-accessories"],
  // Must stay off the hubs: explainers with no price, civic camera stories.
  ["canon-eos-r50-v-4k-60p-crop", "Canon EOS R50 V video: why 4K 60p changes the frame", "Technology", null],
  ["canon-eos-r1-upscaling-96mp", "Canon EOS R1 upscaling: how the 96MP output works", "Technology", null],
  ["xiaomi-camera-1080p-2i-6-month-warranty", "Xiaomi Camera 2i warranty: how to claim 6-month cover", "Technology", null],
  ["gurugram-itms-1000-more-traffic-cameras-planned", "Gurugram plans 1,000 more cameras for traffic enforcement", "India, Gurugram", null],
  ["5000-personnel-cctv-security-shravan-varanasi", "5,000 Personnel and Expanded CCTV Network Deployed for Shravan in Varanasi", "India,Uttar Pradesh,Varanasi", null],
  // Regression guards for existing hubs.
  ["macbook-air-vs-mac-mini-m6-india-festive-price-compare-2026", "MacBook Air vs Mac mini M6 price", "Technology", "laptops-and-tablets"],
];
let fail = 0;
for (const [slug, title, category, want] of cases) {
  const got = priceHubIdFor({ slug, title, tags: "", category, language: "en" });
  if (got !== want) { fail += 1; console.log(`FAIL ${slug}: got ${got}, want ${want}`); }
}
assert.equal(fail, 0);
console.log(`priceHubsCameras: ${cases.length} cases ok`);
