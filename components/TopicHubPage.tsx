import LatestStories from "@/components/LatestStories";
import Head from "next/head";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  absoluteImageUrl,
  formatDateIST,
} from "@/lib/seo";
import { TopicHubProps } from "@/lib/topicHubs";

export default function TopicHubPage({
  hub,
  articles,
  latestUpdate,
  latestArticles,
}: TopicHubProps) {
  const canonicalUrl = `${SITE_URL}${hub.canonicalPath}`;
  const pageTitle = `${hub.title} - Latest Verified Updates | ${SITE_NAME}`;
  const heroArticle = articles[0];
  const ogImage = heroArticle
    ? absoluteImageUrl(heroArticle.mediaUrl)
    : `${SITE_URL}/logo.png`;
  const latestUpdateLabel = latestUpdate
    ? formatDateIST(latestUpdate, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Updates automatically";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: hub.description,
    url: canonicalUrl,
    inLanguage: "en-IN",
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: hub.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={hub.description} />
        <link rel="canonical" href={canonicalUrl} />
        {hub.feedPath && (
          <link
            rel="alternate"
            type="application/rss+xml"
            title={`${hub.title} RSS Feed`}
            href={`${SITE_URL}${hub.feedPath}`}
          />
        )}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={hub.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@dalimss_news" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={hub.description} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ name: hub.title, href: hub.canonicalPath }]} />

        <header className="border-b-2 border-red-600 pb-4 mb-8">
          <p className="text-xs uppercase tracking-wide text-red-600 font-bold mb-2">
            Dalimss News topic hub
          </p>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
            {hub.title}
            {hub.titleHi && <span className="text-red-600"> | {hub.titleHi}</span>}
          </h1>
          <p className="text-gray-600 mt-3 max-w-3xl">{hub.description}</p>
          <p className="text-xs text-gray-500 mt-3">
            Latest update: {latestUpdateLabel}
          </p>
        </header>

        <LatestStories stories={latestArticles} />

        {articles.length === 0 ? (
          <section className="py-16 text-center">
            <p className="text-gray-500 text-lg">
              No matching reports are published yet.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-block text-red-600 font-semibold hover:text-red-700"
            >
              Send a news tip
            </Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-8">
              <ArticleCard article={articles[0]} variant="horizontal" />
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {articles.slice(1, 7).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="vertical"
                  />
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
                <h2 className="text-lg font-bold font-serif text-gray-900 border-b border-red-600 pb-2 mb-4">
                  Important Background
                </h2>
                <div className="flex flex-col gap-3">
                  {hub.backgroundLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-semibold text-gray-700 hover:text-red-600"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        )}

        {articles.length > 7 && (
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-900 border-b border-gray-200 pb-2 mb-6">
              Latest Verified Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(7).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="vertical"
                />
              ))}
            </div>
          </section>
        )}

        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-xl md:text-2xl font-bold font-serif text-gray-900 mb-5">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hub.faqs.map((faq) => (
              <div key={faq.question} className="border border-gray-100 rounded-lg p-5">
                <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
