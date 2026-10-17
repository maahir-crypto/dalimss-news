import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { hindiArticleWhere } from "@/lib/articleLanguage";
import { hreflangLinks } from "@/lib/hreflang";
import {
  LISTING_PAGE_SIZE,
  listingExcerpt,
  listingPath,
  parsePageParam,
} from "@/lib/pagination";
import prisma from "@/lib/prisma";
import {
  DEFAULT_OG_IMAGE,
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  canonicalArticleSlug,
  canonicalAuthorName,
} from "@/lib/seo";
import { decodeEntities } from "@/lib/decodeEntities";
import { setPublicPageCache } from "@/lib/publicCache";
import { Article } from "@/types";

interface Props {
  articles: Article[];
  page: number;
  totalPages: number;
  totalCount: number;
  htmlLang: "hi";
}

const PAGE_DESCRIPTION =
  "Dalimss News पर वाराणसी, पूर्वांचल, गुरुग्राम और भारत की ताजा हिंदी खबरें पढ़ें: नागरिक मुद्दे, शिक्षा, व्यापार और स्थानीय घटनाओं की रिपोर्ट।";

export default function HindiSectionPage({
  articles,
  page,
  totalPages,
  totalCount,
}: Props) {
  const canonicalPath = listingPath("/hindi", page);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const pageTitle =
    page > 1
      ? `हिंदी समाचार, पृष्ठ ${page} | ${SITE_NAME}`
      : `हिंदी समाचार | ${SITE_NAME}`;
  const alternates = hreflangLinks({ path: canonicalPath, language: "hi" });

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "CollectionPage"],
    name: pageTitle,
    description: PAGE_DESCRIPTION,
    url: canonicalUrl,
    inLanguage: "hi",
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: (page - 1) * LISTING_PAGE_SIZE + index + 1,
        url: `${SITE_URL}/articles/${canonicalArticleSlug(article.slug)}`,
        name: decodeEntities(article.title),
      })),
    },
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={canonicalUrl} />
        {alternates.map((alternate) => (
          <link
            key={`${alternate.hrefLang}-${alternate.href}`}
            rel="alternate"
            hrefLang={alternate.hrefLang}
            href={alternate.href}
          />
        ))}
        {page > 1 && (
          <link
            rel="prev"
            href={`${SITE_URL}${listingPath("/hindi", page - 1)}`}
          />
        )}
        {page < totalPages && (
          <link rel="next" href={`${SITE_URL}/hindi?page=${page + 1}`} />
        )}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="हिंदी समाचार"
          href={`${SITE_URL}/hindi/feed.xml`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:locale" content="hi_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@dalimss_news" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c"),
          }}
        />
      </Head>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" lang="hi">
        <Breadcrumbs
          homeLabel="होम"
          navLabel="नेविगेशन पथ"
          items={[{ name: "हिंदी समाचार", href: canonicalPath }]}
        />

        <header className="mb-8 border-b-2 border-red-600 pb-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-serif text-3xl font-bold text-gray-900 md:text-4xl">
              हिंदी समाचार
            </h1>
            <Link
              href="/hindi/feed.xml"
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              आरएसएस
            </Link>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            वाराणसी, पूर्वांचल, गुरुग्राम और भारत की ताजा हिंदी खबरें.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {totalCount} खबर{totalCount === 1 ? "" : "ें"}
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="py-16 text-center text-xl text-gray-400">
            अभी यहां कोई हिंदी खबर नहीं है.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="horizontal"
              />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          pathname="/hindi"
          labels={{
            summary: `पृष्ठ ${page} / ${totalPages}`,
            previous: "पिछला",
            next: "अगला",
            nav: "पृष्ठ",
          }}
        />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const page = parsePageParam(context.query.page);
  if (page === null) return { notFound: true };
  if (page === 1 && context.query.page !== undefined) {
    return {
      redirect: { destination: "/hindi", permanent: true },
    };
  }

  try {
    const totalCount = await prisma.article.count({ where: hindiArticleWhere });
    const totalPages =
      totalCount === 0 ? 0 : Math.ceil(totalCount / LISTING_PAGE_SIZE);
    if (totalCount > 0 && page > totalPages) return { notFound: true };

    const rows = await prisma.article.findMany({
      where: hindiArticleWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * LISTING_PAGE_SIZE,
      take: LISTING_PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        readTimeInMinutes: true,
        category: true,
        customAuthor: true,
        createdAt: true,
        language: true,
      },
    });

    const articles: Article[] = rows.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      content: listingExcerpt(article.content),
      mediaUrl: article.mediaUrl,
      mediaType: article.mediaType as Article["mediaType"],
      createdAt: article.createdAt.toISOString(),
      authorName: canonicalAuthorName(
        article.customAuthor || "Dalimss News Desk"
      ),
      authorAvatarUrl: "",
      readTimeInMinutes: article.readTimeInMinutes,
      claps: 0,
      commentsCount: 0,
      category: article.category,
      language: article.language,
    }));

    setPublicPageCache(context.req, context.res);
    return {
      props: {
        articles,
        page,
        totalPages,
        totalCount,
        htmlLang: "hi",
      },
    };
  } catch (error) {
    console.error("Error fetching Hindi articles:", error);
    return {
      props: {
        articles: [],
        page: 1,
        totalPages: 0,
        totalCount: 0,
        htmlLang: "hi",
      },
    };
  }
};
