import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { setPublicPageCache } from "@/lib/publicCache";
import { loadPriceHubCandidates } from "@/lib/priceHubData";
import {
  PRICE_CHANGE_NOTE,
  PRICE_INDEX,
  collectionPageJsonLd,
  jsonLdHtml,
  priceDocumentTitle,
  priceHubSummaries,
} from "@/lib/priceHubs";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

type HubRow = {
  slug: string;
  path: string;
  h1: string;
  count: number;
};

interface Props {
  hubs: HubRow[];
}

export default function PriceIndexPage({ hubs }: Props) {
  const title = priceDocumentTitle(PRICE_INDEX.titleLead);
  const canonical = `${SITE_URL}${PRICE_INDEX.path}`;
  const jsonLd = collectionPageJsonLd({
    name: PRICE_INDEX.h1,
    description: PRICE_INDEX.description,
    url: canonical,
    items: hubs.map((hub) => ({
      name: hub.h1,
      url: `${SITE_URL}${hub.path}`,
    })),
  });

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={PRICE_INDEX.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={PRICE_INDEX.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE_URL}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={PRICE_INDEX.description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
        />
      </Head>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ name: PRICE_INDEX.h1, href: PRICE_INDEX.path }]} />
        <header className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="font-serif text-3xl font-bold text-gray-900 md:text-4xl">
            {PRICE_INDEX.h1}
          </h1>
          <p className="mt-3 max-w-3xl text-gray-700">
            {PRICE_INDEX.intro[0]} {PRICE_INDEX.intro[1]}
          </p>
          <p className="mt-3 text-sm text-gray-600">{PRICE_CHANGE_NOTE}</p>
        </header>
        <ul className="divide-y divide-gray-100 border-y border-gray-100">
          {hubs.map((hub) => (
            <li key={hub.slug} className="py-4">
              <Link
                href={hub.path}
                className="font-serif text-xl font-bold text-gray-900 hover:text-red-700"
              >
                {hub.h1}
              </Link>
              <p className="mt-1 text-sm text-gray-600">
                {hub.count} published {hub.count === 1 ? "guide" : "guides"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const summaries = priceHubSummaries(await loadPriceHubCandidates());
  if (summaries.length === 0) return { notFound: true };
  setPublicPageCache(req, res);
  return {
    props: {
      hubs: summaries.map((summary) => ({
        slug: summary.hub.slug,
        path: summary.hub.path,
        h1: summary.hub.h1,
        count: summary.count,
      })),
    },
  };
};
