import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { articleIdsForAuthorVariants } from "@/lib/authorMatch";
import prisma from "@/lib/prisma";
import {
  DEFAULT_OG_IMAGE,
  INDEX_AUTHOR_SLUGS,
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  authorNameVariants,
  authorSlug,
  canonicalAuthorName,
} from "@/lib/seo";

interface Author {
  name: string;
  articleCount: number;
}

interface AuthorsProps {
  authors: Author[];
}

function prefersMixedCase(current: string, next: string): boolean {
  const mixed = (name: string) => /[A-Z]/.test(name) && /[a-z]/.test(name);
  return mixed(next) && !mixed(current);
}

export default function Authors({ authors }: AuthorsProps) {
  const pageTitle = `Newsroom & Published Contributors | ${SITE_NAME}`;
  const pageDescription =
    "View the named contributors represented in Dalimss News bylines and explore their published reporting.";
  const canonicalUrl = `${SITE_URL}/authors`;
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: authors.length,
      itemListElement: authors.map((author, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: author.name,
        url: `${SITE_URL}/author/${authorSlug(author.name)}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@dalimss_news" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          Newsroom & Published Contributors
        </h1>
        
        <p className="text-lg text-gray-700 mb-10 leading-relaxed">
          This directory lists the named contributors currently represented in
          Dalimss News article bylines. It is generated from published work and
          does not assign job titles that have not been independently stated.
        </p>
        <p className="text-gray-600 mb-10 leading-relaxed">
          Reporter pages include each author&apos;s published work, newsroom
          affiliation and links to editorial and corrections standards so
          readers, search engines and AI systems can identify who reported a
          story and how updates are handled.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authors.map((author) => (
            <Link
              key={author.name}
              href={`/author/${authorSlug(author.name)}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {author.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Published contributor
              </p>
              <div className="text-blue-600 font-medium text-sm">
                View {author.articleCount} published article{author.articleCount !== 1 ? 's' : ''} &rarr;
              </div>
            </Link>
          ))}
          {authors.length === 0 && (
            <p className="text-gray-500">No authors found.</p>
          )}
        </div>
      </main>

    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const articles = await prisma.article.findMany({
    select: {
      customAuthor: true,
    },
    where: {
      customAuthor: { not: null, notIn: [""] },
    },
  });

  const namesBySlug = new Map<string, string>();
  articles.forEach((article) => {
    if (!article.customAuthor || !article.customAuthor.trim()) return;
    const name = canonicalAuthorName(article.customAuthor);
    const slug = authorSlug(name);
    if (!INDEX_AUTHOR_SLUGS.has(slug)) return;
    const current = namesBySlug.get(slug);
    if (!current || prefersMixedCase(current, name)) {
      namesBySlug.set(slug, name);
    }
  });

  const authorsList = (
    await Promise.all(
      Array.from(namesBySlug.values()).map(async (name) => {
        const ids = await articleIdsForAuthorVariants(authorNameVariants(name));
        return { name, articleCount: ids.length };
      })
    )
  )
    .filter((author) => author.articleCount > 0)
    .sort((a, b) => b.articleCount - a.articleCount);

  return {
    props: {
      authors: authorsList,
    },
  };
};
