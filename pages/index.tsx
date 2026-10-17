import { GetStaticProps } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import ArticleMediaPreview from "@/components/ArticleMediaPreview";
import NewsShortsSidebar from "@/components/NewsShortsSidebar";
import WebStoriesCarousel from "@/components/WebStoriesCarousel";
import { Article } from "@/types";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { decodeEntities } from "@/lib/decodeEntities";
import { ORGANIZATION_ADDRESS, ORGANIZATION_ID, ORGANIZATION_LANGUAGES, WEBSITE_ID, formatDateIST } from "@/lib/seo";
import { LISTING_REVALIDATE_SECONDS } from "@/lib/publicCache";
import { loadHomePage } from "@/lib/homeListing";
import { articlePath } from "@/lib/publicPaths";

interface Props {
  articles: Article[];
  stories: any[];
  searchQuery: string;
}

const HOME_TITLE = "Dalimss News | Varanasi, Gurugram and India News";
const SITE_URL = "https://dalimss.news";

const SectionHeader = ({ title, href }: { title: string; href?: string }) => (
  <div className="mb-5 flex items-end justify-between border-b border-gray-200">
    <h2 className="border-b-2 border-red-600 pb-2 font-serif text-lg font-bold uppercase tracking-[0.08em] text-gray-900 md:text-xl">
      {title}
    </h2>
    {href && (
      <Link href={href} className="mb-2 flex items-center text-xs font-bold uppercase tracking-wide text-red-700 hover:text-red-800">
        View All <ChevronRightIcon className="ml-1 h-3 w-3" />
      </Link>
    )}
  </div>
);

// ... imports
import { useRouter } from "next/router";

export default function HomePage({ articles, stories, searchQuery }: Props) {
  const { data: session } = useSession();
  const router = useRouter(); // <--- Added router
  
  // Pagination State
  const [newsList, setNewsList] = useState<Article[]>(Array.isArray(articles) ? articles : []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(Array.isArray(articles) && articles.length >= 15);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync newsList when initial articles change (e.g. navigation)
  useEffect(() => {
    setNewsList(Array.isArray(articles) ? articles : []);
    setPage(1);
    setHasMore(Array.isArray(articles) && articles.length >= 15);
  }, [articles]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      
      // Construct query params
      const params = new URLSearchParams();
      params.append("page", String(nextPage));
      params.append("limit", "15");
      
      const { category, search } = router.query;
      if (category) params.append("category", String(category));
      if (search) params.append("search", String(search));

      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more");
      
      const newArticles = await res.json();
      
      if (!Array.isArray(newArticles)) {
        throw new Error("Invalid response format");
      }

      setNewsList((prev) => {
        if (!Array.isArray(prev)) return newArticles;
        const existingIds = new Set(prev.map((a) => a.id));
        const uniqueNew = newArticles.filter((a: Article) => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });
      setPage(nextPage);
      
      if (newArticles.length < 15) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Fallback if no articles
  if (!articles || !Array.isArray(articles) || articles.length === 0) {
    return (
      <>
      <Head>
        <title>{HOME_TITLE}</title>
        <link rel="canonical" href={SITE_URL} />
        {searchQuery ? (
          <meta name="robots" key="robots" content="noindex, follow" />
        ) : null}
      </Head>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-400">No articles found.</h1>
        {session && session.user && (session.user.role === "admin" || session.user.email === "admin@dalimss.com" || session.user.email === "sushantgaurav@dalimss.com" || session.user.email === "dalimsssushant@gmail.com") && (
          <Link
            href="/articles/new"
            className="mt-6 inline-block bg-blue-600 px-5 py-2.5 rounded-full text-white hover:bg-blue-700"
          >
            Start Writing
          </Link>
        )}
      </div>
      </>
    );
  }


  const heroArticle = articles[0];
  const heroTitle = decodeEntities(heroArticle.title);
  const heroExcerpt =
    typeof heroArticle.content === "string"
      ? `${decodeEntities(heroArticle.content.replace(/<[^>]+>/g, "")).slice(0, 200)}...`
      : "";
  const topStories = articles.slice(1, 5);
  // Keep the full list for pagination. Skip only the first row when it repeats the hero.
  const latestNews =
    newsList[0] && heroArticle && newsList[0].id === heroArticle.id
      ? newsList.slice(1)
      : newsList; 
  const sidebarNews = articles.slice(2, 8); // Just reusing for demo

  const siteUrl = "https://dalimss.news";
  const heroOgImage = heroArticle?.mediaUrl?.startsWith('http')
    ? heroArticle.mediaUrl
    : heroArticle?.mediaUrl
    ? `${siteUrl}${heroArticle.mediaUrl}`
    : `${siteUrl}/logo.png`;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "Dalimss News",
    alternateName: "Dalimss",
    url: `${siteUrl}/`,
    inLanguage: "en-IN",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": ORGANIZATION_ID,
    name: "Dalimss News",
    legalName: "PAMF Digimedia Private Limited",
    url: `${siteUrl}/`,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo-square.png`,
      width: 512,
      height: 512,
    },
    description:
      "Dalimss News is a digital news publication based in Gurugram, Haryana, reporting from Varanasi, Eastern Uttar Pradesh, Gurugram and Delhi-NCR, with coverage of major developments across India.",
    foundingDate: "2024-02",
    email: "editor@dalimss.news",
    address: ORGANIZATION_ADDRESS,
    areaServed: [
      "Varanasi",
      "Eastern Uttar Pradesh",
      "Gurugram",
      "Delhi-NCR",
      "India",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "editorial",
        email: "editor@dalimss.news",
        availableLanguage: ORGANIZATION_LANGUAGES,
      },
    ],
    publishingPrinciples: `${siteUrl}/editorial-policy`,
    ethicsPolicy: `${siteUrl}/editorial-policy`,
    correctionsPolicy: `${siteUrl}/corrections-policy`,
    ownershipFundingInfo: `${siteUrl}/ownership`,
    parentOrganization: {
      "@type": "Organization",
      name: "PAMF Digimedia Private Limited",
    },
    sameAs: [
      "https://www.instagram.com/dalimss.news.banaras/",
      "https://x.com/Dalimss_News",
      "https://www.youtube.com/@dalimss_news",
      "https://www.linkedin.com/company/dalimss-news",
    ],
  };

  return (
    <>
    <Head>
      <title>{HOME_TITLE}</title>
      <meta name="description" content="Dalimss News is a digital news publication covering Varanasi, Gurugram, Delhi-NCR and major stories from across India, including crime, civic affairs, education, business, culture and lifestyle." />
      <meta name="keywords" content="Varanasi news, वाराणसी समाचार, Purvanchal news, Banaras news, Varanasi civic news, BHU news, Dalimss News" />
      <link rel="canonical" href={siteUrl} />
      {searchQuery ? (
        <meta name="robots" key="robots" content="noindex, follow" />
      ) : null}

      {/* Geo Targeting */}
      <meta name="geo.region" content="IN-UP" />
      <meta name="geo.placename" content="India, Uttar Pradesh, Varanasi" />
      <meta name="geo.position" content="25.3176;82.9739" />
      <meta name="ICBM" content="25.3176, 82.9739" />
      <meta name="language" content="English, Hindi" />
      <meta name="content-language" content="en-IN, hi-IN" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Dalimss News" />
      <meta property="og:title" content={HOME_TITLE} />
      <meta property="og:description" content="Dalimss News is a digital news publication covering Varanasi, Gurugram, Delhi-NCR and major stories from across India, including crime, civic affairs, education, business, culture and lifestyle." />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={heroOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="hi_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@dalimss_news" />
      <meta name="twitter:title" content={HOME_TITLE} />
      <meta name="twitter:description" content="Dalimss News is a digital news publication covering Varanasi, Gurugram, Delhi-NCR and major stories from across India, including crime, civic affairs, education, business, culture and lifestyle." />
      <meta name="twitter:image" content={heroOgImage} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </Head>
    <div className="container mx-auto space-y-10 px-4 py-6 sm:px-6 md:space-y-12 md:py-8 lg:px-8">
        
        {/* WEB STORIES CAROUSEL */}
        {stories && stories.length > 0 && (
          <section>
            <WebStoriesCarousel stories={stories} />
          </section>
        )}

        {/* HERO SECTION */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Hero Story */}
            <div className="lg:col-span-7">
              <div className="h-full border border-gray-100 rounded-lg overflow-hidden group bg-white hover:shadow-md transition-shadow">
                {heroArticle.mediaUrl && (
                  <div className="relative h-64 w-full overflow-hidden bg-black md:h-[500px]">
                    {heroArticle.mediaType !== "video" && (
                      <div
                        className="absolute inset-0 hidden scale-110 bg-cover bg-center opacity-50 blur-xl md:block"
                        style={{ backgroundImage: `url(${heroArticle.mediaUrl})` }}
                        aria-hidden="true"
                      />
                    )}
                    <ArticleMediaPreview
                      src={heroArticle.mediaUrl}
                      mediaType={heroArticle.mediaType}
                      alt={heroTitle}
                      priority={heroArticle.mediaType !== "video"}
                      sizes="(max-width: 768px) 100vw, 720px"
                      quality={70}
                      className="z-10 object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col">
                  <Link href={articlePath(heroArticle.slug)}>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-3 text-gray-900 hover:text-red-600 transition-colors">
                      {heroTitle}
                    </h1>
                  </Link>
                  <p className="hidden md:block text-gray-600 text-base line-clamp-3 max-w-full">
                    {heroExcerpt}
                  </p>
                  
                  <div className="mt-4 flex items-center text-xs text-gray-500 font-semibold uppercase tracking-wider">
                     <span className="text-red-600 mr-2">Latest Story</span>
                     <time dateTime={heroArticle.createdAt}>
                       • {formatDateIST(heroArticle.createdAt, {
                         day: "numeric",
                         month: "short",
                         year: "numeric",
                       })}
                     </time>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Stories Grid */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                {topStories.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="vertical" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Latest News */}
            <div className="lg:col-span-8">
              <SectionHeader 
                title={searchQuery ? `Search Results: ${searchQuery} (${articles.length})` : "Latest News"} 
              />
              <div className="flex flex-col">
                {latestNews.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 text-center bg-gray-50 p-4 rounded-lg">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loadingMore ? "Loading..." : "Read More News"}
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Most Read / Trending */}
              {/* Most Read / Trending */}
              <div className="sticky top-4">
                <SectionHeader title="News Shorts" />
                <NewsShortsSidebar articles={articles} />
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const props = await loadHomePage("");
    return { props, revalidate: LISTING_REVALIDATE_SECONDS };
  } catch (error) {
    console.error("Error fetching articles:", error);
    if (process.env.DATABASE_URL) throw error;
    return {
      props: { articles: [], stories: [], searchQuery: "" },
      revalidate: LISTING_REVALIDATE_SECONDS,
    };
  }
};
