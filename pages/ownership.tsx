import Head from "next/head";
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ORGANIZATION_ID, SITE_NAME, SITE_URL, WEBSITE_ID } from "@/lib/seo";

const pageTitle = `Ownership | ${SITE_NAME}`;
const pageDescription =
  "Dalimss News is published by PAMF Digimedia Private Limited. See who owns the publication and where it is based.";

export default function OwnershipPage() {
  const canonicalUrl = `${SITE_URL}/ownership`;
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${SITE_URL}/logo.png`} />
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
            Ownership
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Who publishes {SITE_NAME}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl">
            Dalimss News is published by PAMF Digimedia Private Limited, a
            private limited company registered in India. Its CIN is
            U63910HR2026PTC141447.
          </p>
        </div>
      </section>

      <main>
        <div className="container mx-auto px-4 max-w-5xl pt-10">
          <Breadcrumbs items={[{ name: "Ownership", href: "/ownership" }]} />
        </div>

        <section className="pb-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <BuildingOffice2Icon className="h-7 w-7 text-red-600 mb-4" />
                <h2 className="text-sm text-gray-500 mb-1">Publisher</h2>
                <p className="font-semibold text-gray-900">
                  PAMF Digimedia Private Limited
                </p>
                <p className="text-gray-600 mt-3 leading-relaxed">
                  Private limited company registered in India. CIN
                  U63910HR2026PTC141447.
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <MapPinIcon className="h-7 w-7 text-red-600 mb-4" />
                <h2 className="text-sm text-gray-500 mb-1">Where we work</h2>
                <p className="font-semibold text-gray-900">
                  Gurugram, Haryana, India
                </p>
                <p className="text-gray-600 mt-3 leading-relaxed">
                  Based in Gurugram, Haryana, India.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4 max-w-5xl space-y-5 text-gray-600 text-lg leading-relaxed">
            <h2 className="text-3xl font-bold text-gray-900">The brand</h2>
            <p>The Dalimss News brand has published since February 2024.</p>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-start gap-4 mb-6">
              <UserGroupIcon className="h-9 w-9 text-red-600 flex-shrink-0" />
              <h2 className="text-3xl font-bold text-gray-900">Leadership</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <p className="text-sm text-gray-500 mb-1">Chief Executive Officer</p>
                <p className="font-semibold text-gray-900">Maahir Madhok</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Related interests
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
              Maahir Madhok is Additional Director of Dalimss Sunbeam Group of
              Schools in Varanasi and a director of Bob&apos;s Gym. When
              Dalimss News reports on these organisations, or on members of
              his family, the story says so.
            </p>
          </div>
        </section>

        <section className="py-14 bg-gray-900 text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <EnvelopeIcon className="h-7 w-7 text-red-500 mb-4" />
            <h2 className="text-3xl font-bold mb-3">Contact</h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              News tips, corrections and questions:{" "}
              <a className="text-white hover:underline" href="mailto:editor@dalimss.news">
                editor@dalimss.news
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
