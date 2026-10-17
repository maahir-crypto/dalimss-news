import { GetServerSideProps } from "next";
import { setPublicPageCache } from "@/lib/publicCache";
import Head from "next/head";
import ArticleCard from "@/components/ArticleCard";
import ArticleMediaPreview from "@/components/ArticleMediaPreview";
import { Pagination } from "@/components/Pagination";
import { Article } from "@/types";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import prisma from "@/lib/prisma";
import { englishArticleWhere } from "@/lib/articleLanguage";
import { decodeEntities } from "@/lib/decodeEntities";
import { canonicalAuthorName } from "@/lib/seo";
import { articlePath } from "@/lib/publicPaths";
import {
  LISTING_PAGE_SIZE,
  listingExcerpt,
  listingPath,
  parsePageParam,
} from "@/lib/pagination";

interface Props {
  articles: Article[];
  page: number;
  totalPages: number;
}

const SectionHeader = ({ title, href }: { title: string; href?: string }) => (
  <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
    <h2 className="text-xl md:text-2xl font-bold font-serif text-black uppercase tracking-tight relative">
      <span className="relative z-10 pr-4 bg-white">{title}</span>
      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-red-600 transform translate-y-[1px]"></span>
    </h2>
    {href && (
      <Link href={href} className="text-xs font-bold text-red-600 hover:text-red-700 uppercase flex items-center">
        View All <ChevronRightIcon className="h-3 w-3 ml-1" />
      </Link>
    )}
  </div>
);

export default function AllArticlesPage({
  articles,
  page,
  totalPages,
}: Props) {
  // Fallback if no articles
  if (!articles || articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-400">No articles found.</h1>
      </div>
    );
  }

  const heroArticle = articles[0];
  const heroTitle = decodeEntities(heroArticle.title);
  const heroExcerpt =
    typeof heroArticle.content === "string"
      ? `${decodeEntities(heroArticle.content.replace(/<[^>]+>/g, "")).slice(0, 150)}...`
      : "";
  const topStories = articles.slice(1, 5);
  const latestNews = articles.slice(5);
  const sidebarNews = articles.slice(2, 8); // Just reusing for demo

  const siteUrl = "https://dalimss.news";
  const canonicalUrl = `${siteUrl}${listingPath("/articles", page)}`;
  const pageTitle =
    page > 1
      ? `All Varanasi News Articles | Page ${page} | Dalimss News`
      : "All Varanasi News Articles | सभी खबरें - Dalimss News";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Read all Varanasi news articles on Dalimss News. वाराणसी की ताजा खबरें और समाचार सिर्फ Dalimss News पर पढ़ें।" />
        <meta name="keywords" content="Varanasi news articles, वाराणसी समाचार, latest news Varanasi, uttar pradesh news" />
        <link rel="canonical" href={canonicalUrl} />
        {page > 1 && (
          <link
            rel="prev"
            href={
              page === 2
                ? `${siteUrl}/articles`
                : `${siteUrl}/articles?page=${page - 1}`
            }
          />
        )}
        {page < totalPages && (
          <link rel="next" href={`${siteUrl}/articles?page=${page + 1}`} />
        )}
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Varanasi, Uttar Pradesh" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Dalimss News" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content="वाराणसी की ताजा खबरें और समाचार सिर्य Dalimss News पर पड़ें।" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:locale" content="hi_IN" />
      </Head>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-0">
        
        {/* HERO SECTION */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Hero Story */}
            <div className="lg:col-span-7">
              <div className="h-full border border-gray-100 rounded-lg overflow-hidden group relative">
                {heroArticle.mediaUrl && (
                  <div className="relative h-64 w-full overflow-hidden md:h-96">
                    <ArticleMediaPreview
                      src={heroArticle.mediaUrl}
                      mediaType={heroArticle.mediaType}
                      alt={heroTitle}
                      priority={heroArticle.mediaType !== "video"}
                      sizes="(max-width: 768px) 100vw, 720px"
                      quality={70}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6 bg-white absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-20 text-white">
                  <Link href={articlePath(heroArticle.slug)}>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-2 hover:text-red-400 transition-colors">
                      {heroTitle}
                    </h1>
                  </Link>
                  <p className="hidden md:block text-gray-200 text-sm line-clamp-2 max-w-2xl">
                    {heroExcerpt}
                  </p>
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
              <SectionHeader title="Latest News" />
              <div className="flex flex-col gap-6">
                {latestNews.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Most Read / Trending */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <SectionHeader title="Must Read" />
                <div className="flex flex-col gap-0">
                  {sidebarNews.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="compact" />
                  ))}
                </div>
              </div>



            </div>
          </div>
        </section>

        <Pagination page={page} totalPages={totalPages} pathname="/articles" />

      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = parsePageParam(context.query.page);
  if (page === null) return { notFound: true };
  if (page === 1 && context.query.page !== undefined) {
    return {
      redirect: { destination: "/articles", permanent: true },
    };
  }

  try {
    const totalCount = await prisma.article.count({ where: englishArticleWhere });
    const totalPages =
      totalCount === 0 ? 0 : Math.ceil(totalCount / LISTING_PAGE_SIZE);
    if (totalCount > 0 && page > totalPages) return { notFound: true };

    const rows = await prisma.article.findMany({
      where: englishArticleWhere,
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
    }));

    setPublicPageCache(context.req, context.res);
    return { props: { articles, page, totalPages } };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { props: { articles: [], page: 1, totalPages: 0 } };
  }
};
