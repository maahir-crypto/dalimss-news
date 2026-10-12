import Head from "next/head";
import Link from "next/link";
import { EnvelopeIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { ORGANIZATION_ID, SITE_NAME, SITE_URL, WEBSITE_ID } from "@/lib/seo";

export default function FactCheckingPage() {
  const canonicalUrl = `${SITE_URL}/fact-checking`;
  const pageTitle = `Fact-checking | ${SITE_NAME}`;
  const pageDescription =
    "How Dalimss News checks stories against primary sources, how corrections work, and how to report an error.";
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@dalimss_news" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
        />
      </Head>

      <section className="bg-gray-950 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-red-400 font-semibold uppercase tracking-wider mb-4">
            Fact-checking
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            How we check what we publish
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl">
            Dalimss News starts from official primary sources. We do not copy
            from other publishers.
          </p>
        </div>
      </section>

      <main>
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-4xl space-y-6 text-gray-700 leading-relaxed text-lg">
            <div className="border border-gray-200 rounded-xl p-7">
              <ShieldCheckIcon className="h-9 w-9 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Primary sources
              </h2>
              <p>
                We start from official primary sources. Articles carry a named
                byline and a publication date. Many articles list their sources
                at the end.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Corrections
              </h2>
              <p>
                If a story needs a correction, we correct the article. The{" "}
                <Link
                  className="text-red-700 font-semibold hover:underline"
                  href="/corrections-policy"
                >
                  corrections policy
                </Link>{" "}
                explains how that works. Corrections are made on request.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-7">
              <EnvelopeIcon className="h-9 w-9 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Report an error
              </h2>
              <p>
                If you find a mistake, email{" "}
                <a
                  className="text-red-700 font-semibold hover:underline"
                  href="mailto:editor@dalimss.news"
                >
                  editor@dalimss.news
                </a>{" "}
                with the article link and a short description of the error.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
