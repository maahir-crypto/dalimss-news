// components/ArticleJsonLd.tsx
// Reusable NewsArticle JSON-LD structured data component

import React from "react";
import {
  SITE_URL,
  SITE_NAME,
  ORGANIZATION_ID,
  WEBSITE_ID,
  absoluteImageUrl,
  canonicalArticleSlug,
  toISOWithTZ,
  stripForMeta,
  canonicalAuthorName,
  articleMetaDescription,
  articleModifiedAt,
  isNewsroomByline,
} from "@/lib/seo";
import { normalizeArticleSources } from "@/lib/articleSources";
import { authorSameAsUrls, type AuthorBoxProfile } from "@/lib/authorBoxes";
import { decodeEntities } from "@/lib/decodeEntities";
import { normalizeImageCaption } from "@/lib/imageCaption";

interface ArticleJsonLdProps {
  article: {
    title: string;
    slug: string;
    content?: string | null;
    excerpt?: string;
    mediaUrl?: string | null;
    createdAt: string;
    publishedAt?: string | null;
    updatedAt?: string | null;
    customAuthor?: string | null;
    category?: string | null;
    sourceUrl?: string | null;
    sourceUrls?: unknown;
    metaTitle?: string | null;
    metaDescription?: string | null;
    tags?: string | null;
    language?: string | null;
    imageCaption?: string | null;
  };
  authorUrl?: string;
  authorProfile?: AuthorBoxProfile | null;
  description?: string;
}

export function ArticleJsonLd({
  article,
  authorUrl,
  authorProfile,
  description: descriptionOverride,
}: ArticleJsonLdProps) {
  const url = `${SITE_URL}/articles/${canonicalArticleSlug(article.slug)}`;
  const imageUrl = absoluteImageUrl(article.mediaUrl);
  const authorName = canonicalAuthorName(
    article.customAuthor || "Dalimss News Desk"
  );
  const newsroomByline = isNewsroomByline(authorName);
  const sources = normalizeArticleSources(article.sourceUrls);
  const citations = [
    ...sources.map((source) => source.url),
    ...(article.sourceUrl &&
    !sources.some((source) => source.url === article.sourceUrl)
      ? [article.sourceUrl]
      : []),
  ];

  const description = descriptionOverride ?? articleMetaDescription(article);
  const modifiedAt =
    articleModifiedAt(article.createdAt, article.updatedAt) ||
    new Date(article.createdAt);
  const displayCaption = normalizeImageCaption(
    decodeEntities(article.imageCaption),
    {
      slug: article.slug,
      publishedAt: article.publishedAt ?? article.createdAt,
    }
  );
  const profileSameAs = authorSameAsUrls(authorProfile);
  const image = !imageUrl
    ? []
    : displayCaption.ai
      ? [
          {
            "@type": "ImageObject",
            url: imageUrl,
            caption: displayCaption.text,
            description: "AI-generated illustration for Dalimss News.",
            creditText: "AI-generated illustration for Dalimss News",
            creator: {
              "@type": "Organization",
              "@id": ORGANIZATION_ID,
              name: SITE_NAME,
            },
          },
        ]
      : [imageUrl];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: stripForMeta(article.metaTitle || article.title, 110),
    description,
    image,
    datePublished: toISOWithTZ(article.createdAt),
    dateModified: toISOWithTZ(modifiedAt),
    inLanguage: article.language === "hi" ? "hi" : "en-IN",
    articleSection: article.category || "News",
    isAccessibleForFree: true,
    keywords: article.tags
      ? article.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : undefined,
    citation:
      citations.length === 1
        ? citations[0]
        : citations.length > 1
        ? citations
        : undefined,
    author: {
      "@type": newsroomByline ? "Organization" : "Person",
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
      ...(authorProfile && !newsroomByline
        ? {
            "@type": "Person",
            jobTitle: authorProfile.jobTitle,
            image: absoluteImageUrl(authorProfile.photoUrl),
            worksFor: {
              "@type": "Organization",
              name: authorProfile.organizationName,
            },
            ...(profileSameAs.length > 0 ? { sameAs: profileSameAs } : {}),
          }
        : {}),
    },
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-square.png`,
        width: 512,
        height: 512,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
