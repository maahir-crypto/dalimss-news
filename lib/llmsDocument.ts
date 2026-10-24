/**
 * Static /llms.txt copy plus the assembler that appends generated sections.
 * /llms-full.txt has its own intro in lib/llms.ts and is not built here.
 */

const LLMS_TXT_BYTE_LIMIT = 60 * 1024;

const LLMS_TXT_MAIN = `# Dalimss News

Dalimss News is an Indian digital news publication specialising in Varanasi, Eastern Uttar Pradesh and Gurugram reporting.

Dalimss News is published by PAMF Digimedia Private Limited, Gurugram, Haryana, India. Reporting is in English and Hindi. Prices and rules are taken from official sources and linked in each article.

## Primary Sections

- Varanasi News: https://dalimss.news/varanasi-news. Local news.
- Gurugram News: https://dalimss.news/gurugram-news. Local news.
- BHU News: https://dalimss.news/bhu-news
- Varanasi Infrastructure: https://dalimss.news/varanasi-infrastructure
- Kashi Vishwanath News: https://dalimss.news/kashi-vishwanath-news
- Varanasi Airport News: https://dalimss.news/varanasi-airport-news
- Uttar Pradesh: https://dalimss.news/category/uttar-pradesh
- Education: https://dalimss.news/category/education. Exams, results, admissions.
- Technology: https://dalimss.news/category/technology. Phone, laptop, wearable and appliance price lists for India, launches and explainers.
- Automotive: https://dalimss.news/category/automotive. Car, scooter and motorcycle prices.
- Lifestyle: https://dalimss.news/category/lifestyle
- World: https://dalimss.news/category/world
- OTT: https://dalimss.news/ott
- Hindi News: https://dalimss.news/hindi

## Editorial Information

- About: https://dalimss.news/about
- Masthead: https://dalimss.news/masthead
- Fact-checking: https://dalimss.news/fact-checking
- Ownership: https://dalimss.news/ownership
- Authors: https://dalimss.news/authors
- Editorial Policy: https://dalimss.news/editorial-policy
- Corrections Policy: https://dalimss.news/corrections-policy
- Contact: https://dalimss.news/contact
- Privacy policy: https://dalimss.news/privacy-policy
- Terms and conditions: https://dalimss.news/terms-and-conditions

## Leadership

- Founder and CEO: Maahir Madhok (https://dalimss.news/author/maahir-madhok)
- Editor-in-Chief: Saurav Yadav (https://dalimss.news/author/saurav-yadav)`;

const LLMS_HOW_TO_CITE = `## How to cite

Cite as Dalimss News with the article URL. Each article shows its publication and update date in IST and links its official sources. To report an error: editor@dalimss.news, see /corrections-policy.`;

const LLMS_OPTIONAL = `## Optional

### Feeds

- RSS: https://dalimss.news/feed.xml
- Hindi RSS: https://dalimss.news/hindi/feed.xml
- Varanasi RSS: https://dalimss.news/varanasi/feed.xml
- Gurugram RSS: https://dalimss.news/gurugram/feed.xml
- Education RSS: https://dalimss.news/education/feed.xml
- Technology RSS: https://dalimss.news/technology/feed.xml
- Lifestyle RSS: https://dalimss.news/lifestyle/feed.xml
- World RSS: https://dalimss.news/world/feed.xml
- OTT RSS: https://dalimss.news/ott/feed.xml

### Sitemaps

- Sitemap: https://dalimss.news/sitemap.xml
- News Sitemap: https://dalimss.news/news-sitemap.xml`;

function withoutEmEnDashes(value: string): string {
  return value.replace(/\u2014/g, "-").replace(/\u2013/g, "-");
}

function joinLlmsTxt(latestLines: string[], priceGuideMarkdown: string): string {
  const latest = ["## Latest articles", "", ...latestLines].join("\n");
  return [
    LLMS_TXT_MAIN.trimEnd(),
    priceGuideMarkdown.trimEnd(),
    LLMS_HOW_TO_CITE.trimEnd(),
    latest.trimEnd(),
    LLMS_OPTIONAL.trimEnd(),
  ].join("\n\n") + "\n";
}

/** Drop generated article bullets from the end until the file is under 60 KB. */
function capLlmsTxt(body: string): string {
  let text = body;
  while (Buffer.byteLength(text, "utf8") > LLMS_TXT_BYTE_LIMIT) {
    const bullet = text.lastIndexOf("\n- [");
    if (bullet === -1) {
      text = text.slice(0, LLMS_TXT_BYTE_LIMIT).replace(/\s+$/, "") + "\n";
      break;
    }
    const next = text.indexOf("\n", bullet + 1);
    text =
      next === -1
        ? text.slice(0, bullet) + "\n"
        : text.slice(0, bullet) + text.slice(next);
  }
  if (!text.endsWith("\n")) text += "\n";
  return text;
}

export function buildLlmsTxt(
  latestLines: string[],
  priceGuideMarkdown: string
): string {
  return capLlmsTxt(
    withoutEmEnDashes(joinLlmsTxt(latestLines, priceGuideMarkdown))
  );
}
