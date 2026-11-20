import Head from "next/head";
import Link from "next/link";
import {
  EnvelopeIcon,
  PencilSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ORGANIZATION_ID, SITE_NAME, SITE_URL, WEBSITE_ID } from "@/lib/seo";

export default function HowWeUseAiPage() {
  const canonicalUrl = `${SITE_URL}/how-we-use-ai`;
  const pageTitle = `How we use AI | ${SITE_NAME}`;
  const pageDescription =
    "How Dalimss News uses AI tools in research, transcription, translation and drafting, and how editors review every story before publishing.";
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
            Transparency
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            How we use AI
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl">
            Our stories are reported, written and checked by our named
            journalists. We may use AI tools to help with the work, and every
            story is reviewed by an editor before it is published.
          </p>
        </div>
      </section>

      <main>
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-4xl space-y-8 text-gray-700 leading-relaxed text-lg">
            <div className="border border-gray-200 rounded-xl p-7">
              <PencilSquareIcon className="h-9 w-9 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                People write the news
              </h2>
              <p>
                Dalimss News stories are reported, written and checked by our
                named journalists. Bylines name the people responsible for the
                work. We do not publish AI-generated articles as finished news
                without human reporting and editorial review.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-7">
              <SparklesIcon className="h-9 w-9 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Where AI may help
              </h2>
              <p className="mb-4">
                We may use AI tools to help with research, transcription,
                translation and drafting. We may also use AI for some
                illustrations; when we do, those images are labelled.
              </p>
              <p>
                AI does not replace reporting. Journalists still gather facts,
                speak to sources where needed, and decide what to publish.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Editor review before publishing
              </h2>
              <p>
                Every story is reviewed by an editor before publishing. Editors
                check facts, sourcing, fairness and clarity. If something is
                wrong after publication, we correct it.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-7">
              <EnvelopeIcon className="h-9 w-9 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Corrections
              </h2>
              <p className="mb-4">
                To report an error, write to{" "}
                <a
                  className="text-red-700 font-semibold hover:underline"
                  href="mailto:editor@dalimss.news"
                >
                  editor@dalimss.news
                </a>{" "}
                or use the{" "}
                <Link
                  className="text-red-700 font-semibold hover:underline"
                  href="/contact"
                >
                  contact page
                </Link>
                . See also our{" "}
                <Link
                  className="text-red-700 font-semibold hover:underline"
                  href="/corrections-policy"
                >
                  corrections policy
                </Link>
                .
              </p>
              <div className="flex flex-wrap gap-4 text-base">
                <Link
                  className="text-red-700 font-semibold hover:underline"
                  href="/editorial-policy"
                >
                  Editorial policy
                </Link>
                <Link
                  className="text-red-700 font-semibold hover:underline"
                  href="/about"
                >
                  About us
                </Link>
                <Link
                  className="text-red-700 font-semibold hover:underline"
                  href="/fact-checking"
                >
                  Fact-checking
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
