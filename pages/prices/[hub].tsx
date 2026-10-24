import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { decodeEntities } from "@/lib/decodeEntities";
import { listingPath, parsePageParam } from "@/lib/pagination";
import { loadPriceHubCandidates } from "@/lib/priceHubData";
import { setPublicPageCache } from "@/lib/publicCache";
import { articlePath } from "@/lib/publicPaths";
import {
  PRICE_CHANGE_NOTE,
  PRICE_INDEX,
  articlesForHub,
  collectionPageJsonLd,
  formatIsoDateTimeIST,
  jsonLdHtml,
  presentHubPage,
  priceDocumentTitle,
  priceHubBySlug,
} from "@/lib/priceHubs";
import { SITE_NAME, SITE_URL, formatDateIST } from "@/lib/seo";

type Row = {
  slug: string;
  title: string;
  updatedAt: string;
};

type Group = {
  brand: string | null;
  articles: Row[];
};

interface Props {
  slug: string;
  path: string;
  h1: string;
  description: string;
  intro: [string, string];
  page: number;
  totalPages: number;
  showUngroupedHeading: boolean;
  groups: Group[];
}

export default function PriceHubPage({
  slug,
  path,
  h1,
  description,
  intro,
  page,
  totalPages,
  showUngroupedHeading,
  groups,
}: Props) {
  const title = priceDocumentTitle(
    priceHubBySlug(slug)?.titleLead || h1,
    page
  );
  const canonical = `${SITE_URL}${listingPath(path, page)}`;
  const rows = groups.flatMap((group) => group.articles);
  const jsonLd = collectionPageJsonLd({
    name: h1,
    description,
    url: canonical,
    items: rows.map((row) => ({
      name: decodeEntities(row.title),
      url: `${SITE_URL}${articlePath(row.slug)}`,
    })),
  });
  const breadcrumbItems = [
    { name: PRICE_INDEX.h1, href: PRICE_INDEX.path },
    { name: h1, href: path },
  ];
  if (page > 1) {
    breadcrumbItems.push({
      name: `Page ${page}`,
      href: listingPath(path, page),
    });
  }
  const prev =
    page > 1 ? `${SITE_URL}${listingPath(path, page - 1)}` : null;
  const next =
    page < totalPages ? `${SITE_URL}${listingPath(path, page + 1)}` : null;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        {prev && <link rel="prev" href={prev} />}
        {next && <link rel="next" href={next} />}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE_URL}/logo.png`} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
        />
      </Head>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <header className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="font-serif text-3xl font-bold text-gray-900 md:text-4xl">
            {h1}
          </h1>
          <p className="mt-3 max-w-3xl text-gray-700">
            {intro[0]} {intro[1]}
          </p>
          <p className="mt-3 text-sm text-gray-600">{PRICE_CHANGE_NOTE}</p>
        </header>

        {groups.map((group, index) => (
          <section key={`${group.brand || "list"}-${index}`} className="mb-8">
            {group.brand ? (
              <h2 className="mb-3 font-serif text-2xl font-bold text-gray-900">
                {group.brand}
              </h2>
            ) : showUngroupedHeading ? (
              <h2 className="mb-3 font-serif text-2xl font-bold text-gray-900">
                More guides
              </h2>
            ) : null}
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Guide
                  </th>
                  <th scope="col" className="whitespace-nowrap py-2 font-semibold">
                    Updated (IST)
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.articles.map((article) => {
                  const headline = decodeEntities(article.title);
                  return (
                    <tr key={article.slug} className="border-b border-gray-100">
                      <td className="py-3 pr-4">
                        <Link
                          href={articlePath(article.slug)}
                          className="font-medium text-gray-900 hover:text-red-700"
                        >
                          {headline}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap py-3 text-gray-600">
                        <time dateTime={formatIsoDateTimeIST(article.updatedAt)}>
                          {formatDateIST(article.updatedAt)}
                        </time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}

        <Pagination page={page} totalPages={totalPages} pathname={path} />
        <p className="mt-6 text-sm">
          <a href={`${path}.csv`} className="font-semibold text-red-700 hover:text-red-800">
            Download CSV
          </a>
        </p>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const param = context.params?.hub;
  const slug = Array.isArray(param) ? param[0] : param || "";
  const hub = priceHubBySlug(slug);
  if (!hub) return { notFound: true };

  const pageParam = context.query.page;
  const page = parsePageParam(pageParam);
  if (page === null) return { notFound: true };
  if (page === 1 && pageParam !== undefined) {
    return { redirect: { destination: hub.path, permanent: true } };
  }

  const ordered = articlesForHub(await loadPriceHubCandidates(), hub.slug);
  const presented = presentHubPage(ordered, page);
  if (!presented) return { notFound: true };

  setPublicPageCache(context.req, context.res);
  return {
    props: {
      slug: hub.slug,
      path: hub.path,
      h1: hub.h1,
      description: hub.description,
      intro: hub.intro,
      page,
      totalPages: presented.totalPages,
      showUngroupedHeading: presented.showUngroupedHeading,
      groups: presented.groups.map((group) => ({
        brand: group.brand,
        articles: group.articles.map((article) => ({
          slug: article.slug,
          title: article.title,
          updatedAt: article.updatedAt.toISOString(),
        })),
      })),
    },
  };
};
