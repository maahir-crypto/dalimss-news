import React from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { useSession } from "next-auth/react";
import prisma from "../../lib/prisma";
import * as RMarkdownModule from "react-markdown";
import * as rRawModule from "rehype-raw";
import { rehypeAdSlots } from "@/lib/rehypeAdSlots";

const getDefault = (m: any) =>
  m && typeof m.default === "function" ? m.default : null;

const ReactMarkdown = getDefault(RMarkdownModule);
const rehypeRaw = getDefault(rRawModule);

function rehypeDecodeEntities() {
  const walk = (node: {
    type?: string;
    value?: string;
    children?: unknown[];
  }) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "text" && typeof node.value === "string") {
      node.value = decodeEntities(node.value);
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child as { type?: string; value?: string; children?: unknown[] });
      }
    }
  };

  return (tree: { type?: string; value?: string; children?: unknown[] }) => {
    walk(tree);
  };
}

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface RelatedArticleData {
  id: number;
  slug: string;
  title: string;
  mediaUrl: string | null;
  createdAt: string;
  category: string | null;
  customAuthor: string | null;
}

interface Article {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  createdAt: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaItems?: MediaItem[] | null;
  readTimeInMinutes?: number | null;
  corrections?: { id?: string | number; date?: string | null; note?: string | null; text?: string | null }[] | null;
  customAuthor?: string | null;
  category?: string | null;
  sourceUrl?: string | null;
  sourceUrls?: unknown;
  reportingBasis?: string | null;
  language?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  tags?: string | null;
  imageAltText?: string | null;
  imageCaption?: string | null;
}

interface Props {
  article?: Article | null;
  relatedArticles: RelatedArticleData[];
  authorStats?: AuthorPublicationStats | null;
}

import Head from "next/head";
import ShareButton from "@/components/ShareButton";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { CorrectionNotice } from "@/components/CorrectionNotice";
import { DealDisclosure } from "@/components/DealDisclosure";
import { AuthorBox } from "@/components/AuthorBox";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedArticles } from "@/components/RelatedArticles";
import AdSlot from "@/components/AdSlot";
import {
  SITE_URL,
  absoluteImageUrl,
  stripForMeta,
  authorSlug,
  canonicalArticleSlug,
  ARTICLE_SLUG_REDIRECTS,
  toISOWithTZ,
  canonicalAuthorName,
  articleMetaDescription,
  articleModifiedAt,
  articleWasMeaningfullyUpdated,
  formatDateIST,
  isNewsroomByline,
} from "@/lib/seo";
import { getCategoriesByDbValue } from "@/lib/categories";
import { isDealArticle } from "@/lib/dealArticles";
import { normalizeImageCaption } from "@/lib/imageCaption";
import { normalizeArticleSources } from "@/lib/articleSources";
import { getAuthorBox } from "@/lib/authorBoxes";
import {
  getAuthorPublicationStats,
  type AuthorPublicationStats,
} from "@/lib/authorStats";
import { decodeEntities } from "@/lib/decodeEntities";
import { hreflangLinks } from "@/lib/hreflang";
import Image from "next/image";
import ArticleLeadImage from "@/components/ArticleLeadImage";
import { isOptimizableImageSrc } from "@/lib/optimizableImage";

const ArticlePage: React.FC<Props> = ({
  article,
  relatedArticles,
  authorStats = null,
}) => {
  const { data: session } = useSession();
  
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center text-xl text-white">
        Article not found or has been removed.
      </div>
    );
  }

  const seoDescription = articleMetaDescription(article);
  const modifiedAt = articleModifiedAt(article.createdAt, article.updatedAt);
  const showUpdated = articleWasMeaningfullyUpdated(
    article.createdAt,
    article.updatedAt
  );
  const publishedLabel = formatDateIST(article.createdAt, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const updatedLabel = modifiedAt
    ? formatDateIST(modifiedAt, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  // OG image
  const ogImageUrl = absoluteImageUrl(article.mediaUrl);

  const categories = getCategoriesByDbValue(article.category);
  const breadcrumbCategory = categories[categories.length - 1];
  const isOpinion = categories.some((category) => category.slug === "opinion");
  const sources = normalizeArticleSources(article.sourceUrls);
  const visibleSources = [
    ...sources,
    ...(article.sourceUrl &&
    !sources.some((source) => source.url === article.sourceUrl)
      ? [{ label: "Primary source", url: article.sourceUrl }]
      : []),
  ];

  // Author URL
  const authorName = canonicalAuthorName(
    article.customAuthor || "Dalimss News Desk"
  );
  const hasNamedByline = Boolean(article.customAuthor?.trim());
  const newsroomByline = !hasNamedByline || isNewsroomByline(authorName);
  const authorPath = hasNamedByline
    ? `/author/${authorSlug(authorName)}`
    : "/authors";
  const authorUrl = `${SITE_URL}${authorPath}`;
  const curatedAuthor = newsroomByline ? null : getAuthorBox(authorName);

  const articleSlug = canonicalArticleSlug(article.slug);
  const canonicalUrl = `${SITE_URL}/articles/${articleSlug}`;
  const plainTitle = decodeEntities(article.title);
  const plainAlt = decodeEntities(article.imageAltText || article.title);
  const breadcrumbTitle =
    plainTitle.length > 60 ? `${plainTitle.slice(0, 57)}...` : plainTitle;
  const seoTitle = stripForMeta(article.metaTitle || article.title, 70);
  const isHindi = article.language === "hi";
  const categoryTags = categories.filter((category, index, list) => {
    const label = (isHindi && category.nameHi ? category.nameHi : category.name)
      .trim()
      .toLowerCase();
    return (
      list.findIndex((other) => {
        const otherLabel = (
          isHindi && other.nameHi ? other.nameHi : other.name
        )
          .trim()
          .toLowerCase();
        return otherLabel === label;
      }) === index
    );
  });
  const alternates = hreflangLinks({
    path: `/articles/${articleSlug}`,
    language: isHindi ? "hi" : "en",
  });
  const cap = normalizeImageCaption(decodeEntities(article.imageCaption), {
    slug: article.slug,
    publishedAt: article.publishedAt ?? article.createdAt,
  });

  return (
      <article
      className="mx-auto max-w-3xl px-6 py-8 text-gray-900"
      lang={article.language === "hi" ? "hi" : "en"}
    >
      <Head>
        <title>{article.metaTitle ? seoTitle : `${plainTitle} | Dalimss News`}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        {alternates.map((alternate) => (
          <link
            key={`${alternate.hrefLang}-${alternate.href}`}
            rel="alternate"
            hrefLang={alternate.hrefLang}
            href={alternate.href}
          />
        ))}
        
        {/* Robots with max-image-preview */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        
        {/* Open Graph - Essential for WhatsApp/Facebook */}
        <meta property="og:site_name" content="Dalimss News" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={plainAlt} />
        <meta property="og:locale" content={article.language === "hi" ? "hi_IN" : "en_IN"} />
        
        {/* Article specific Meta tags */}
        <meta property="article:published_time" content={toISOWithTZ(article.createdAt)} />
        <meta property="article:modified_time" content={toISOWithTZ(modifiedAt || article.createdAt)} />
        {article.customAuthor && <meta property="article:author" content={authorName} />}
        {article.category && <meta property="article:section" content={article.category} />}
        {article.tags && article.tags.split(",").map((t: string, i: number) => (
          <meta key={i} property="article:tag" content={t.trim()} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@dalimss_news" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>

      {/* JSON-LD Structured Data */}
      <ArticleJsonLd
        article={article}
        authorUrl={authorUrl}
        authorProfile={curatedAuthor}
        description={seoDescription}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        homeLabel={isHindi ? "होम" : "Home"}
        navLabel={isHindi ? "नेविगेशन पथ" : "Breadcrumb"}
        items={[
          ...(breadcrumbCategory
            ? [{
                name:
                  isHindi && breadcrumbCategory.nameHi
                    ? breadcrumbCategory.nameHi
                    : breadcrumbCategory.name,
                href: `/category/${breadcrumbCategory.slug}`,
              }]
            : []),
          { name: breadcrumbTitle, href: `/articles/${articleSlug}` },
        ]}
      />

      {/* EDIT & DELETE BUTTONS (ADMIN ONLY) */}
      {session && session.user && (session.user.role === "admin" || session.user.role === "editor" || session.user.email === "admin@dalimss.com" || session.user.email === "sushantgaurav@dalimss.com" || session.user.email === "dalimsssushant@gmail.com") && (
        <div className="flex justify-end mb-4 gap-4">
          <a
            href={`/articles/${article.slug}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Article
          </a>
          <button
            onClick={async () => {
              if (!confirm("Are you sure you want to delete this article?")) return;
          
              const res = await fetch("/api/articles/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: article.slug }),
              });
          
              const data = await res.json();
              if (data.success) {
                window.location.href = "/articles";
              } else {
                alert("Delete failed: " + data.error);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Article
          </button>
        </div>
      )}

      {/* HEADER */}
      <header>
        {categoryTags.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            {categoryTags.map((category) => (
              <a
                key={category.slug}
                href={`/category/${category.slug}`}
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700 hover:text-red-800"
              >
                {isHindi && category.nameHi ? category.nameHi : category.name}
              </a>
            ))}
          </div>
        )}
        <h1 className="mb-3 font-serif text-4xl font-bold leading-tight text-gray-900 md:text-[2.6rem] md:leading-[1.15]">
          {plainTitle}
        </h1>
        {isOpinion && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {isHindi ? (
              <>
                <strong>राय:</strong> यह लेख लेखक के विश्लेषण या विचार को
                दर्शाता है. तथ्यों को नीचे दिए गए स्रोतों से जांचें.
              </>
            ) : (
              <>
                <strong>Opinion:</strong> This article reflects the writer&apos;s
                analysis or viewpoint. Factual claims should be assessed against
                the linked source material below.
              </>
            )}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <a
              href={authorPath}
              className="font-bold text-gray-900 hover:text-red-700 transition-colors"
            >
              {isHindi ? authorName : `By ${authorName}`}
            </a>
            <span className="text-gray-300" aria-hidden="true">·</span>
            <time dateTime={toISOWithTZ(article.createdAt)} className="text-gray-500">
              {publishedLabel} IST
            </time>
            {showUpdated && modifiedAt && (
              <>
                <span className="text-gray-300" aria-hidden="true">·</span>
                <time dateTime={toISOWithTZ(modifiedAt)} className="text-gray-500">
                  Updated: {updatedLabel} IST
                </time>
              </>
            )}
            {article.readTimeInMinutes ? (
              <>
                <span className="text-gray-300" aria-hidden="true">·</span>
                <span className="text-gray-500">
                  {isHindi
                    ? `${article.readTimeInMinutes} मिनट`
                    : `${article.readTimeInMinutes} min read`}
                </span>
              </>
            ) : null}
          </div>
          <div className="ml-auto shrink-0">
            <ShareButton
              url={`/articles/${articleSlug}`}
              title={plainTitle}
              variant="full"
            />
          </div>
        </div>
      </header>

      <CorrectionNotice corrections={article.corrections} />

      {isDealArticle(article) && (
        <DealDisclosure language={article.language} />
      )}

      {/* MEDIA RENDERER */}
      {(() => {
        // Build media list: prefer mediaItems, fallback to single mediaUrl
        const items: MediaItem[] = [];
        if (article.mediaItems && Array.isArray(article.mediaItems) && article.mediaItems.length > 0) {
          items.push(...article.mediaItems);
        } else if (article.mediaUrl) {
          items.push({ url: article.mediaUrl, type: (article.mediaType as "image" | "video") || "image" });
        }

        if (items.length === 0) {
          return (
            <p className="text-gray-500 italic my-6">
              {isHindi ? "कोई मीडिया शामिल नहीं है." : "No media included."}
            </p>
          );
        }

        if (items.length === 1) {
          const item = items[0];
          return (
            <figure className="mt-6 mb-6">
              {item.type === "video" ? (
                <video
                  src={item.url}
                  controls
                  className="w-full max-h-[500px] rounded-lg bg-gray-100"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <ArticleLeadImage
                  src={item.url}
                  alt={plainAlt}
                  priority
                />
              )}
              {item.type === "image" && cap.text && (
                <figcaption className="mt-3 text-sm leading-relaxed text-gray-500">
                  {cap.text}
                </figcaption>
              )}
            </figure>
          );
        }

        // Multiple media: show a gallery grid
        return (
          <figure className="mt-6 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {items.map((item, idx) => (
                <div key={idx} className={`overflow-hidden rounded-lg bg-gray-100 ${idx === 0 && items.length % 2 !== 0 ? "col-span-2" : ""}`}>
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      controls
                      className="max-h-[400px] h-full w-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : isOptimizableImageSrc(item.url) ? (
                    <Image
                      src={item.url}
                      alt={
                        idx === 0 && article.imageAltText
                          ? plainAlt
                          : `${plainTitle} - image ${idx + 1}`
                      }
                      width={1536}
                      height={1024}
                      quality={70}
                      sizes={
                        idx === 0 && items.length % 2 !== 0
                          ? "(max-width: 768px) 100vw, 768px"
                          : "(max-width: 768px) 50vw, 384px"
                      }
                      className="h-full max-h-[400px] w-full object-cover"
                      {...(idx === 0
                        ? { priority: true }
                        : { loading: "lazy" as const })}
                    />
                  ) : (
                    <img
                      src={item.url}
                      className="h-full max-h-[400px] w-full object-cover"
                      alt={
                        idx === 0 && article.imageAltText
                          ? plainAlt
                          : `${plainTitle} - image ${idx + 1}`
                      }
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  )}
                </div>
              ))}
            </div>
            {cap.text && (
              <figcaption className="mt-3 text-sm leading-relaxed text-gray-500">
                {cap.text}
              </figcaption>
            )}
          </figure>
        );
      })()}

      <div className="article-body prose max-w-none text-gray-800">
        {ReactMarkdown ? (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeDecodeEntities, rehypeAdSlots({ after: [3, 7] })]}
            components={{
              p: ({ children }: any) => {
                let text = "";
                if (typeof children === "string") {
                  text = children;
                } else if (
                  Array.isArray(children) &&
                  children.length === 1 &&
                  typeof children[0] === "string"
                ) {
                  text = children[0];
                }

                if (text) {
                  // YouTube Regex
                  const ytMatch = text
                    .trim()
                    .match(
                      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:&\S*)?$/
                    );
                  if (ytMatch && ytMatch[1]) {
                    return (
                      <div className="my-6 aspect-video w-full">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full rounded-lg shadow-md"
                        ></iframe>
                      </div>
                    );
                  }

                  // Instagram Regex
                  const igMatch = text
                    .trim()
                    .match(
                      /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([\w-]+)(?:\/?\S*)?$/
                    );
                  if (igMatch && igMatch[1]) {
                    return (
                      <div className="my-6 flex justify-center">
                        <iframe
                          src={`https://www.instagram.com/p/${igMatch[1]}/embed`}
                          width="400"
                          height="550"
                          frameBorder="0"
                          scrolling="no"
                          allowTransparency={true}
                          className="rounded-lg shadow-md bg-white border border-gray-200"
                        ></iframe>
                      </div>
                    );
                  }
                }

                return <p className="mb-4 whitespace-pre-line leading-[1.75] md:text-[1.125rem]">{children}</p>;
              },
              h2: ({ children }: any) => (
                <h2 className="mb-3 mt-8 font-serif text-2xl font-bold leading-tight text-gray-900">
                  {children}
                </h2>
              ),
              // Make sure links also work if they are auto-linked
              a: ({ href, children }: any) => {
                const text = href || "";
                 // YouTube
                 const ytMatch = text
                 .trim()
                 .match(
                   /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:&\S*)?$/
                 );
               if (ytMatch && ytMatch[1]) {
                 return (
                   <div className="my-6 aspect-video w-full">
                     <iframe
                       src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                       title="YouTube video player"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                       className="w-full h-full rounded-lg shadow-md"
                     ></iframe>
                   </div>
                 );
               }

               // Instagram
               const igMatch = text
                 .trim()
                 .match(
                   /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([\w-]+)(?:\/?\S*)?$/
                 );
               if (igMatch && igMatch[1]) {
                 return (
                   <div className="my-6 flex justify-center">
                     <iframe
                       src={`https://www.instagram.com/p/${igMatch[1]}/embed`}
                       width="400"
                       height="550"
                       frameBorder="0"
                       scrolling="no"
                       allowTransparency={true}
                       className="rounded-lg shadow-md bg-white border border-gray-200"
                     ></iframe>
                   </div>
                 );
               }
               
               return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline underline-offset-2 decoration-1 hover:decoration-2">{children}</a>
              },
              "ad-slot": ({ index }: any) => (
                <AdSlot
                  key={`${article.slug}-${index}`}
                  slot={
                    index === "1"
                      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE_1
                      : process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE_2
                  }
                  name={`in-article-${index}`}
                />
              ),
            }}
          >
            {article.content ||
              (isHindi ? "सामग्री उपलब्ध नहीं है." : "No content available.")}
          </ReactMarkdown>
        ) : (
          <pre>
            {decodeEntities(
              article.content ||
                (isHindi ? "सामग्री उपलब्ध नहीं है." : "No content available.")
            )}
          </pre>
        )}
      </div>

      {!newsroomByline && (
        <AuthorBox
          author={curatedAuthor}
          language={article.language}
          moreFromHref={
            curatedAuthor?.guest && (authorStats?.storyCount ?? 0) > 1
              ? authorPath
              : undefined
          }
          fallback={
            curatedAuthor
              ? null
              : {
                  name: authorName,
                  href: authorPath,
                  storyCount: authorStats?.storyCount ?? null,
                  topCategory: authorStats?.topCategory ?? null,
                }
          }
        />
      )}

      {curatedAuthor?.guest && visibleSources.length === 0 ? (
        <p className="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-600">
          {isHindi
            ? "यह एक अतिथि राय लेख है. विचार लेखक के अपने हैं."
            : "This is a guest opinion piece. The views are the author's own."}
        </p>
      ) : (
        (article.reportingBasis || visibleSources.length > 0) && (
          <section className="mt-8 pt-5 border-t border-gray-200 text-sm text-gray-600">
            <h2 className="text-base font-bold text-gray-900 mb-2">
              {isHindi ? "स्रोत और रिपोर्टिंग" : "Sources and reporting"}
            </h2>
            {article.reportingBasis && <p>{article.reportingBasis}</p>}
            {visibleSources.length > 0 && (
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {visibleSources.map((source) => (
                  <li key={`${source.label}-${source.url}`}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      )}

      <AdSlot
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_ARTICLE}
        name="below-article"
        format="auto"
        layout={undefined}
        minHeight={280}
      />

      {/* RELATED ARTICLES */}
      <RelatedArticles
        articles={relatedArticles}
        heading={isHindi ? "संबंधित खबरें" : "Related Stories"}
        itemLang={isHindi ? "hi" : undefined}
      />
    </article>
  );
};

export default ArticlePage;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug || "");
  const legacySlug = Object.entries(ARTICLE_SLUG_REDIRECTS).find(
    ([, canonicalSlug]) => canonicalSlug === slug
  )?.[0];

  const whereClause: any = { OR: [{ slug }] };
  if (legacySlug) whereClause.OR.push({ slug: legacySlug });

  const numericId = Number(slug);
  if (!isNaN(numericId)) whereClause.OR.push({ id: numericId });

  let article = null;
  let relatedArticles: any[] = [];
  let authorStats: AuthorPublicationStats | null = null;

  try {
    article = await prisma.article.findFirst({
      where: whereClause,
    });

    // Fetch related articles from the same category
    if (article && article.category) {
      const categoryList = article.category.split(",").map((c) => c.trim()).filter(Boolean);
      relatedArticles = await prisma.article.findMany({
        where: {
          AND: [
            {
              OR: categoryList.map((cat) => ({
                category: { contains: cat, mode: "insensitive" as const },
              })),
            },
            article.language === "hi"
              ? { language: "hi" }
              : { NOT: { language: "hi" } },
          ],
          id: { not: article.id },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          mediaUrl: true,
          createdAt: true,
          category: true,
          customAuthor: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
    }
  } catch (err) {
    console.error("DB ERROR:", err);
    throw err;
  }

  if (article?.customAuthor) {
    const statsName = canonicalAuthorName(article.customAuthor);
    const curatedForStats = statsName ? getAuthorBox(statsName) : null;
    if (
      statsName &&
      !isNewsroomByline(statsName) &&
      (!curatedForStats || curatedForStats.guest)
    ) {
      try {
        authorStats = await getAuthorPublicationStats(
          statsName,
          article.language
        );
      } catch (err) {
        console.error("Author stats query failed:", err);
      }
    }
  }

  if (!article) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  return {
    props: {
      article: JSON.parse(
        JSON.stringify({
          ...article,
          customAuthor: article.customAuthor
            ? canonicalAuthorName(article.customAuthor)
            : null,
          metaTitle: article.metaTitle
            ? stripForMeta(article.metaTitle, 70)
            : null,
        })
      ),
      htmlLang: article.language === "hi" ? "hi" : "en",
      relatedArticles: JSON.parse(
        JSON.stringify(
          relatedArticles.map((relatedArticle) => ({
            ...relatedArticle,
            customAuthor: relatedArticle.customAuthor
              ? canonicalAuthorName(relatedArticle.customAuthor)
              : null,
          }))
        )
      ),
      authorStats,
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  let paths: { params: { slug: string } }[] = [];
  try {
    // Pre-render the most recent 20 articles at build time
    const recentArticles = await prisma.article.findMany({
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    paths = recentArticles.map((art) => ({
      params: { slug: art.slug },
    }));
  } catch (err) {
    console.error("Failed to fetch paths for pre-rendering:", err);
  }

  return {
    paths,
    fallback: "blocking",
  };
};
