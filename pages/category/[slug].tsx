import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleMediaPreview from "@/components/ArticleMediaPreview";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ListingPager } from "@/components/ListingPager";
import { Article } from "@/types";
import { decodeEntities } from "@/lib/decodeEntities";
import { loadCategoryListing } from "@/lib/categoryListing";
import {
  SITE_URL,
  SITE_NAME,
  absoluteImageUrl,
  formatDateIST,
  itemListSchema,
} from "@/lib/seo";
import { getCategoryBySlug, Category } from "@/lib/categories";
import { listingHtmlCacheTag, setPublicPageCache } from "@/lib/publicCache";
import { articlePath, sectionPath } from "@/lib/publicPaths";
import {
  CATEGORY_ARCHIVE_PAGE_SIZE,
  listingPath,
  listingRelHrefs,
  parsePageParam,
  withPageSuffix,
} from "@/lib/pagination";

interface Props {
  category: Category;
  articles: Article[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export default function CategoryPage({
  category,
  articles,
  totalCount,
  page,
  totalPages,
}: Props) {
  const [articleList, setArticleList] = useState<Article[]>(articles);
  const [loadedPage, setLoadedPage] = useState(page);
  const [hasMore, setHasMore] = useState(page < totalPages);
  const [loadingMore, setLoadingMore] = useState(false);
  // Sync when initial props change (navigation)
  useEffect(() => {
    setArticleList(articles);
    setLoadedPage(page);
    setHasMore(page < totalPages);
  }, [articles, page, totalPages]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      const nextPage = loadedPage + 1;
      const params = new URLSearchParams({
        category: category.dbValues[0],
        page: String(nextPage),
        limit: String(CATEGORY_ARCHIVE_PAGE_SIZE),
      });

      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more");

      const newArticles: Article[] = await res.json();

      setArticleList((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const uniqueNew = newArticles.filter((a) => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });
      setLoadedPage(nextPage);

      if (
        newArticles.length < CATEGORY_ARCHIVE_PAGE_SIZE ||
        nextPage >= totalPages
      ) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more articles:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const archivePath = `/category/${category.slug}`;
  const canonicalPath =
    page > 1 ? listingPath(archivePath, page) : sectionPath(category.slug);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const baseTitle =
    category.seoTitle ||
    `${category.name} News - Latest ${category.name} Headlines | ${SITE_NAME}`;
  const pageTitle = withPageSuffix(baseTitle, page);
  const description = withPageSuffix(category.description, page);
  const rel = listingRelHrefs(archivePath, page, totalPages);
  const heading = category.h1 || `${category.name} News`;
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

  const storyItems = articles.map((article) => ({
    name: decodeEntities(article.title),
    url: `${SITE_URL}${articlePath(article.slug)}`,
  }));
  const itemList = itemListSchema(storyItems);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description,
    url: canonicalUrl,
    mainEntity: itemList,
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
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        {rel.prev && <link rel="prev" href={rel.prev} />}
        {rel.next && <link rel="next" href={rel.next} />}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={heroOgImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@dalimss_news" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={heroOgImage} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
        />
      </Head>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[{ name: category.name, href: canonicalPath }]}
        />

        {/* Category Header */}
        <div className="border-b-2 border-red-600 pb-3 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
            {heading}
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
              </section>
            )}

            <ListingPager
              page={page}
              pathname={archivePath}
              hasMore={hasMore}
              nextPage={loadedPage + 1}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
            />
          </>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const slugParam = context.params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const category = slug ? getCategoryBySlug(slug) : undefined;

  if (!category) return { notFound: true };

  const page = parsePageParam(context.query.page);
  if (page === null) return { notFound: true };
  if (page === 1 && context.query.page !== undefined) {
    return {
      redirect: { destination: `/category/${category.slug}`, permanent: true },
    };
  }

  try {
    const listing = await loadCategoryListing(category, page);
    if (!listing) return { notFound: true };

    setPublicPageCache(
      context.req,
      context.res,
      listingHtmlCacheTag(`/category/${category.slug}`)
    );
    return {
      props: {
        category,
        articles: listing.articles,
        totalCount: listing.totalCount,
        page: listing.page,
        totalPages: listing.totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching category articles:", error);
    if (process.env.DATABASE_URL) throw error;
    if (page > 1) return { notFound: true };
    return {
      props: {
        category,
        articles: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
      },
    };
  }
};
