import Head from "next/head";
import Link from "next/link";
import { EnvelopeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import {
  authorBoxes,
  type AuthorBoxProfile,
} from "@/lib/authorBoxes";
import { businessTeam, editorialTeam } from "@/lib/newsroomTeam";
import {
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  WEBSITE_ID,
  authorSlug,
} from "@/lib/seo";

const founder = authorBoxes["Maahir Madhok"];

function profileFor(name: string): AuthorBoxProfile | undefined {
  return authorBoxes[name];
}

export default function MastheadPage() {
  const canonicalUrl = `${SITE_URL}/masthead`;
  const pageTitle = `Masthead | ${SITE_NAME}`;
  const pageDescription =
    "Leadership, the editorial team and the business team at Dalimss News, and how to reach the newsroom.";
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
            Masthead
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Who runs {SITE_NAME}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl">
            Dalimss News is a digital news publication. This page lists the
            leadership, the editorial team and the business team.
          </p>
        </div>
      </section>

      <main>
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Leadership</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <li>
                <Link
                  href={`/author/${authorSlug(founder.name)}`}
                  className="flex items-center gap-4 border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-sm"
                >
                  {founder.photoUrl ? (
                    <img
                      src={founder.photoUrl}
                      alt={founder.photoAlt}
                      width={72}
                      height={72}
                      loading="lazy"
                      className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
                    />
                  ) : null}
                  <span>
                    <span className="block font-semibold text-gray-900">
                      {founder.name}
                    </span>
                    <span className="block text-sm text-gray-600">
                      Founder and CEO
                    </span>
                  </span>
                </Link>
              </li>
            </ul>
            <p className="mt-6 max-w-3xl text-gray-700 leading-relaxed">
              {founder.bio}
            </p>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Editorial team
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {editorialTeam.map((member) => {
                const profile = profileFor(member.name);
                return (
                  <li key={member.slug}>
                    <Link
                      href={`/author/${member.slug}`}
                      className="flex h-full items-center gap-4 border border-gray-200 rounded-xl bg-white p-5 hover:border-red-300 hover:shadow-sm"
                    >
                      {profile?.photoUrl ? (
                        <img
                          src={profile.photoUrl}
                          alt={profile.photoAlt}
                          width={72}
                          height={72}
                          loading="lazy"
                          className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
                        />
                      ) : null}
                      <span>
                        <span className="block font-semibold text-gray-900">
                          {member.name}
                        </span>
                        <span className="block text-sm text-gray-600">
                          {member.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Business team
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessTeam.map((member) => (
                <li key={member.name}>
                  <div className="flex items-center gap-4 border border-gray-200 rounded-xl p-5">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      width={72}
                      height={72}
                      loading="lazy"
                      className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
                    />
                    <span>
                      <span className="block font-semibold text-gray-900">
                        {member.name}
                      </span>
                      <span className="block text-sm text-gray-600">
                        {member.title}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {businessTeam.map((member) => (
              <p
                key={`${member.name}-bio`}
                className="mt-6 max-w-3xl text-gray-700 leading-relaxed"
              >
                {member.bio}
              </p>
            ))}
          </div>
        </section>

        <section className="py-14 bg-gray-900 text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-start gap-4">
              <EnvelopeIcon className="h-8 w-8 text-red-500 shrink-0" />
              <div>
                <h2 className="text-3xl font-bold mb-4">Contact the newsroom</h2>
                <p className="text-gray-300 leading-relaxed max-w-3xl">
                  For story tips, questions or correction requests, email{" "}
                  <a className="text-white underline" href="mailto:editor@dalimss.news">
                    editor@dalimss.news
                  </a>
                  .
                </p>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  <UserGroupIcon className="mr-2 inline h-5 w-5 text-red-500" />
                  <Link className="text-white underline" href="/ownership">
                    Ownership
                  </Link>{" "}
                  explains who publishes Dalimss News.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
