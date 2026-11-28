import { Breadcrumbs } from "@/components/Breadcrumbs";
import { listingHtmlCacheTag, setPublicPageCache } from "@/lib/publicCache";
import { loadCivicUpdates } from "@/lib/civicUpdatesData";
import {
  CIVIC_UPDATES_CANONICAL,
  CIVIC_UPDATES_DESCRIPTION,
  CIVIC_UPDATES_H1,
  CIVIC_UPDATES_INTRO,
  CIVIC_UPDATES_MORE_LABEL,
  CIVIC_UPDATES_PATH,
  CIVIC_UPDATES_TITLE,
  civicLastUpdatedLabel,
  civicUpdatesRobots,
  formatCivicPublishedAt,
} from "@/lib/civicUpdatesCopy";
import type { CivicUpdateGroup } from "@/lib/civicUpdates";
import {
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  itemListSchema,
  toISOWithTZ,
} from "@/lib/seo";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

export type CivicUpdatesPageProps = {
  groups: CivicUpdateGroup[];
  newestPublishedAt: string | null;
};

function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function VaranasiCivicUpdatesPage({
  groups,
  newestPublishedAt,
}: CivicUpdatesPageProps) {
  const items = groups.flatMap((group) => group.items);
  const updated = civicLastUpdatedLabel(newestPublishedAt);
  const itemList = itemListSchema(
    items.map((item) => ({
      name: item.title,
      url: `${SITE_URL}${item.href}`,
    }))
  );
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: CIVIC_UPDATES_TITLE,
    description: CIVIC_UPDATES_DESCRIPTION,
    url: CIVIC_UPDATES_CANONICAL,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: itemList,
    ...(updated.iso ? { dateModified: updated.iso } : {}),
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

  return (
    <>
      <Head>
        <title>{CIVIC_UPDATES_TITLE}</title>
        <meta name="description" content={CIVIC_UPDATES_DESCRIPTION} />
        <link rel="canonical" href={CIVIC_UPDATES_CANONICAL} />
        <meta name="robots" key="robots" content={civicUpdatesRobots(items.length)} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={CIVIC_UPDATES_TITLE} />
        <meta property="og:description" content={CIVIC_UPDATES_DESCRIPTION} />
        <meta property="og:url" content={CIVIC_UPDATES_CANONICAL} />
        <meta property="og:image" content={`${SITE_URL}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@dalimss_news" />
        <meta name="twitter:title" content={CIVIC_UPDATES_TITLE} />
        <meta name="twitter:description" content={CIVIC_UPDATES_DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/logo.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }}
        />
      </Head>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: "Varanasi News", href: "/varanasi-news" },
            { name: "Varanasi Civic Updates", href: CIVIC_UPDATES_PATH },
          ]}
        />

        <header className="border-b-2 border-red-600 pb-4 mb-8">
          <p className="text-xs uppercase tracking-wide text-red-600 font-bold mb-2">
            Dalimss News topic hub
          </p>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
            {CIVIC_UPDATES_H1}
          </h1>
          <p className="text-gray-600 mt-3 max-w-3xl">{CIVIC_UPDATES_INTRO}</p>
          <p className="text-xs text-gray-500 mt-3">
            Last updated:{" "}
            {updated.iso ? (
              <time dateTime={updated.iso}>{updated.label} IST</time>
            ) : (
              updated.label
            )}
          </p>
        </header>

        {items.length === 0 ? (
          <p className="text-gray-500 text-lg py-8">
            No matching civic reports from the last 30 days are published yet.
          </p>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.id} aria-labelledby={`civic-${group.id}`}>
                <h2
                  id={`civic-${group.id}`}
                  className="text-xl md:text-2xl font-bold font-serif text-gray-900 border-b border-gray-200 pb-2 mb-2"
                >
                  {group.label}
                </h2>
                <ul className="divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <li key={item.id} className="py-4">
                      <h3 className="text-lg font-bold font-serif text-gray-900">
                        <Link
                          href={item.href}
                          className="hover:text-red-600"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        <time dateTime={toISOWithTZ(item.publishedAt)}>
                          {formatCivicPublishedAt(item.publishedAt)} IST
                        </time>
                      </p>
                      {item.excerpt ? (
                        <p className="text-sm text-gray-600 mt-2">{item.excerpt}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="mt-10">
          <Link
            href="/varanasi-news"
            className="font-semibold text-red-600 hover:text-red-700"
          >
            {CIVIC_UPDATES_MORE_LABEL}
          </Link>
        </p>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CivicUpdatesPageProps> = async (
  context
) => {
  try {
    const list = await loadCivicUpdates(new Date());
    setPublicPageCache(
      context.req,
      context.res,
      listingHtmlCacheTag(CIVIC_UPDATES_PATH)
    );
    return {
      props: {
        groups: list.groups,
        newestPublishedAt: list.newestPublishedAt,
      },
    };
  } catch (error) {
    console.error("Error fetching Varanasi civic updates:", error);
    if (process.env.DATABASE_URL) throw error;
    return {
      props: {
        groups: [],
        newestPublishedAt: null,
      },
    };
  }
};
