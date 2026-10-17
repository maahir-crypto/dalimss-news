import { GetStaticPaths, GetStaticProps } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleMediaPreview from "@/components/ArticleMediaPreview";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Article } from "@/types";
import { decodeEntities } from "@/lib/decodeEntities";
import {
  SITE_URL,
  SITE_NAME,
  absoluteImageUrl,
  canonicalAuthorName,
  formatDateIST,
} from "@/lib/seo";
import { CATEGORIES, getCategoryBySlug, Category } from "@/lib/categories";
import { LISTING_REVALIDATE_SECONDS } from "@/lib/publicCache";
import { articlePath, categoryPath } from "@/lib/publicPaths";
import { englishArticleWhere } from "@/lib/articleLanguage";
import prisma from "@/lib/prisma";

interface Props {
  category: Category;
  articles: Article[];
  totalCount: number;
}

const ARTICLES_PER_PAGE = 20;

export default function CategoryPage({ category, articles, totalCount }: Props) {
  const [articleList, setArticleList] = useState<Article[]>(articles);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(articles.length >= ARTICLES_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  // Sync when initial props change (navigation)
  useEffect(() => {
    setArticleList(articles);
    setPage(1);
    setHasMore(articles.length >= ARTICLES_PER_PAGE);
  }, [articles]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        category: category.dbValues[0],
        page: String(nextPage),
        limit: String(ARTICLES_PER_PAGE),
      });

      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more");

      const newArticles: Article[] = await res.json();

      setArticleList((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const uniqueNew = newArticles.filter((a) => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });
      setPage(nextPage);

      if (newArticles.length < ARTICLES_PER_PAGE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more articles:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const canonicalUrl = `${SITE_URL}/category/${category.slug}`;
  const pageTitle = `${category.name} News - Latest ${category.name} Headlines | ${SITE_NAME}`;
  const heroArticle = articleList[0];
  const heroTitle = heroArticle ? decodeEntities(heroArticle.title) : "";
  const heroExcerpt =
    heroArticle && typeof heroArticle.content === "string"
      ? `${decodeEntities(heroArticle.content.replace(/<[^>]+>/g, "")).slice(0, 200)}...`
      : "";
  const gridArticles = articleList.slice(1);
  const heroOgImage = heroArticle
    ? absoluteImageUrl(heroArticle.mediaUrl)
    : `${SITE_URL}/logo.png`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: category.description,
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={category.description} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={category.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={heroOgImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@dalimss_news" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={category.description} />
        <meta name="twitter:image" content={heroOgImage} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      </Head>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[{ name: category.name, href: categoryPath(category.slug) }]}
        />

        {/* Category Header */}
        <div className="border-b-2 border-red-600 pb-3 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
            {category.name} News
            {category.nameHi && (
              <span className="text-red-600"> | {category.nameHi}</span>
            )}
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-3xl">
            {category.description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalCount} article{totalCount !== 1 ? "s" : ""} published
          </p>
        </div>

        {articleList.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">
              No articles found in {category.name}.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-red-600 hover:text-red-700 font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        ) : (
          <>
            {/* Hero Section - First Article Featured Large */}
            {heroArticle && (
              <section className="mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <div className="h-full border border-gray-100 rounded-lg overflow-hidden group bg-white hover:shadow-md transition-shadow">
                      {heroArticle.mediaUrl && (
                        <div className="relative h-64 w-full overflow-hidden bg-black md:h-[450px]">
                          {heroArticle.mediaType !== "video" && (
                            <div
                              className="absolute inset-0 hidden scale-110 bg-cover bg-center opacity-50 blur-xl md:block"
                              style={{
                                backgroundImage: `url(${heroArticle.mediaUrl})`,
                              }}
                              aria-hidden="true"
                            />
                          )}
                          <ArticleMediaPreview
                            src={heroArticle.mediaUrl}
                            mediaType={heroArticle.mediaType}
                            alt={heroTitle}
                            priority={heroArticle.mediaType !== "video"}
                            sizes="(max-width: 768px) 100vw, 768px"
                            quality={70}
                            className="z-10 object-contain transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col">
                        <Link href={articlePath(heroArticle.slug)}>
                          <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-3 text-gray-900 hover:text-red-600 transition-colors">
                            {heroTitle}
                          </h2>
                        </Link>
                        <p className="hidden md:block text-gray-600 text-base line-clamp-3 max-w-full">
                          {heroExcerpt}
                        </p>
                        <div className="mt-4 flex items-center text-xs text-gray-500 font-semibold uppercase tracking-wider">
                          <span className="text-red-600 mr-2">
                            {category.name}
                          </span>
                          <time dateTime={heroArticle.createdAt}>
                            •{" "}
                            {formatDateIST(heroArticle.createdAt, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Top Stories */}
                  <div className="lg:col-span-4">
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 h-full">
                      <h3 className="text-lg font-bold font-serif text-gray-800 border-b border-red-600 pb-2 mb-4">
                        More in {category.name}
                      </h3>
                      <div className="flex flex-col gap-0">
                        {articleList.slice(1, 7).map((article) => (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            variant="compact"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Article Grid */}
            {gridArticles.length > 0 && (
              <section>
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold font-serif text-black uppercase tracking-tight relative">
                    <span className="relative z-10 pr-4 bg-white">
                      All {category.name} News
                    </span>
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-red-600 transform translate-y-[1px]" />
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {gridArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="vertical"
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-10 text-center bg-gray-50 p-4 rounded-lg">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {loadingMore ? "Loading..." : "Load More Articles"}
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: CATEGORIES.map((category) => ({ params: { slug: category.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return { notFound: true };
  }

  try {
    const categoryFilter = {
      AND: [
        englishArticleWhere,
        {
          OR: category.dbValues.map((val) => ({
            category: {
              contains: val,
              mode: "insensitive" as const,
            },
          })),
        },
      ],
    };

    // Query articles matching the category's dbValues (case-insensitive contains)
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where: categoryFilter,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: ARTICLES_PER_PAGE,
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
          metaTitle: true,
          metaDescription: true,
          focusKeyword: true,
        },
      }),
      prisma.article.count({
        where: categoryFilter,
      }),
    ]);

    // Serialize articles to match the Article type used by ArticleCard
    const serializedArticles: Article[] = articles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      content: a.content,
      mediaUrl: a.mediaUrl,
      mediaType: a.mediaType as Article["mediaType"],
      createdAt: a.createdAt.toISOString(),
      authorName: canonicalAuthorName(
        a.customAuthor || "Dalimss News Desk"
      ),
      authorAvatarUrl: "",
      readTimeInMinutes: a.readTimeInMinutes,
      claps: 0,
      commentsCount: 0,
      category: a.category,
      metaTitle: a.metaTitle,
      metaDescription: a.metaDescription,
      focusKeyword: a.focusKeyword,
    }));

    return {
      props: {
        category,
        articles: serializedArticles,
        totalCount,
      },
      revalidate: LISTING_REVALIDATE_SECONDS,
    };
  } catch (error) {
    console.error("Error fetching category articles:", error);
    if (process.env.DATABASE_URL) throw error;
    return {
      props: {
        category,
        articles: [],
        totalCount: 0,
      },
      revalidate: LISTING_REVALIDATE_SECONDS,
    };
  }
};
