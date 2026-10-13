import { activeStoryWhere } from "@/lib/storyLifetime";
import { findStoryRedirectSlug } from "@/lib/legacySlug";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";

export default function WebStoryPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  res.setHeader("Cache-Control", "no-store");
  const slug = String(params?.slug || "");

  try {
    const story = await (prisma as any).webStory.findFirst({
      where: { slug, ...activeStoryWhere() },
      include: { pages: { orderBy: { order: "asc" } } },
    });

    if (!story) {
      const redirectSlug = await findStoryRedirectSlug(slug);
      if (redirectSlug) {
        return {
          redirect: {
            destination: `/stories/${redirectSlug}`,
            permanent: true,
          },
        };
      }
      return { notFound: true };
    }

    const publisherLogoSrc = "https://dalimss.news/logo.png";
    const datePublished = new Date(story.createdAt).toISOString();
    const ctaLink = story.relatedLink || "/";
    const ctaText = story.relatedLink ? "Read Full Story" : "Read More News";

    // Generate inner pages HTML
    const pagesHtml = story.pages.map((page: any, index: number) => `
      <amp-story-page id="page-${index + 1}" auto-advance-after="10s">
        <amp-story-grid-layer template="fill">
          <amp-img
            src="${page.imageUrl}"
            width="720"
            height="1280"
            layout="responsive"
            alt="${page.heading || ''}"
            animate-in="zoom-out"
            scale-start="1.1"
            scale-end="1"
          ></amp-img>
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical" class="bottom-align">
           <div class="gradient-overlay"></div>
           <div class="content-wrapper">
              ${page.heading ? `<h2 class="heading" animate-in="fly-in-bottom">${page.heading}</h2>` : ''}
              ${page.text ? `<p class="text" animate-in="fade-in" animate-in-delay="0.3s">${page.text}</p>` : ''}
           </div>
        </amp-story-grid-layer>
        ${index === story.pages.length - 1 ? `
        <amp-story-cta-layer>
          <div class="cta-container">
              <a href="${ctaLink}" class="cta-button">${ctaText}</a>
          </div>
        </amp-story-cta-layer>
        ` : ''}
      </amp-story-page>
    `).join('');

    const html = `<!doctype html>
<html amp lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <title>${story.title}</title>
    <link rel="canonical" href="https://dalimss.news/stories/${story.slug}">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    <style amp-custom>
      amp-story {
        font-family: 'Roboto', sans-serif;
        color: #fff;
      }
      amp-story-page {
        background-color: #000;
      }
      .bottom-align {
        align-content: end;
        padding: 0;
      }
      .gradient-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60%;
        background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0));
        z-index: 1;
      }
      .content-wrapper {
        position: relative;
        z-index: 2;
        padding: 32px 24px 48px;
      }
      .title {
        font-weight: 800;
        font-size: 2.5em;
        line-height: 1.1;
        margin-bottom: 16px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      }
      .tap-to-read {
        font-size: 1em;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .heading {
        font-weight: 700;
        font-size: 1.8em;
        margin-bottom: 12px;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        line-height: 1.2;
      }
      .text {
        font-size: 1.1em;
        line-height: 1.5;
        opacity: 0.95;
        background: rgba(0,0,0,0.3);
        padding: 12px;
        border-radius: 8px;
        backdrop-filter: blur(4px);
      }
      .cta-container {
        position: absolute;
        bottom: 40px;
        width: 100%;
        display: flex;
        justify-content: center;
      }
      .cta-button {
        background-color: #ef4444;
        color: white;
        padding: 12px 32px;
        border-radius: 99px;
        text-decoration: none;
        font-weight: bold;
        font-size: 1.1em;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        text-transform: uppercase;
      }
    </style>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://dalimss.news/stories/${story.slug}"
        },
        "headline": "${story.title}",
        "image": ${JSON.stringify(story.pages.map((p: any) => p.imageUrl))},
        "datePublished": "${datePublished}",
        "dateModified": "${datePublished}",
        "author": {
          "@type": "Organization",
          "name": "Dalimss News"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Dalimss News",
          "logo": {
            "@type": "ImageObject",
            "url": "${publisherLogoSrc}"
          }
        }
      }
    </script>
  </head>
  <body>
    <amp-story
      standalone
      title="${story.title}"
      publisher="Dalimss News"
      publisher-logo-src="${publisherLogoSrc}"
      poster-portrait-src="${story.coverImage}"
    >
      <amp-story-page id="cover" auto-advance-after="7s">
        <amp-story-grid-layer template="fill">
          <amp-img
            src="${story.coverImage}"
            width="720"
            height="1280"
            layout="responsive"
            alt="${story.title}"
          ></amp-img>
        </amp-story-grid-layer>
        <amp-story-grid-layer template="vertical" class="bottom-align">
           <div class="gradient-overlay"></div>
           <div class="content-wrapper">
              <h1 class="title">${story.title}</h1>
              <p class="tap-to-read">Tap to read more</p>
           </div>
        </amp-story-grid-layer>
      </amp-story-page>
      ${pagesHtml}
    </amp-story>
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=59");
    res.write(html);
    res.end();

    return { props: {} };
  } catch (err) {
    console.error("Story fetch error:", err);
    return { notFound: true };
  }
};
