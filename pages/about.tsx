import Head from "next/head";
import Link from "next/link";
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  EnvelopeIcon,
  MapPinIcon,
  NewspaperIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  ORGANIZATION_ADDRESS,
  ORGANIZATION_ID,
  ORGANIZATION_LANGUAGES,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

const facts = [
  {
    label: "Publishing since",
    value: "February 2024",
    icon: CalendarDaysIcon,
  },
  {
    label: "Reports from",
    value: "Varanasi and Gurugram",
    icon: MapPinIcon,
  },
  {
    label: "Core coverage",
    value: "Varanasi, Eastern Uttar Pradesh, Gurugram and Delhi-NCR",
    icon: NewspaperIcon,
  },
  {
    label: "Wider coverage",
    value: "India, education, business, technology, health, culture and sport",
    icon: NewspaperIcon,
  },
  {
    label: "Publication type",
    value: "Digital news publication",
    icon: BuildingOffice2Icon,
  },
  {
    label: "Publisher",
    value: "PAMF DIGIMEDIA PRIVATE LIMITED",
    icon: BuildingOffice2Icon,
  },
];

export default function AboutPage() {
  const canonicalUrl = `${SITE_URL}/about`;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    email: "editor@dalimss.news",
    address: ORGANIZATION_ADDRESS,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial",
      email: "editor@dalimss.news",
      telephone: "+91-6392752976",
      availableLanguage: ORGANIZATION_LANGUAGES,
    },
  };
  const pageTitle = `About ${SITE_NAME} | Varanasi, Gurugram & India News`;
  const pageDescription =
    "Learn about Dalimss News, a digital news publication reporting from Varanasi, Eastern Uttar Pradesh, Gurugram and Delhi-NCR, with coverage of major developments across India.";

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>

      <section className="bg-gray-950 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-red-400 font-semibold uppercase tracking-wider mb-4">
            About {SITE_NAME}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Digital news desk. Wider perspective.
          </h1>
          <div className="space-y-4 text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl">
            <p>
              Dalimss News has been publishing since February 2024 and is a
              digital news publication reporting from Varanasi and Gurugram.
            </p>
            <p>
              We publish original reporting from Varanasi, Eastern Uttar Pradesh,
              Gurugram and Delhi-NCR, alongside coverage of significant
              developments from across India. Our journalism covers civic
              administration, public safety, education, infrastructure, business,
              technology, health, culture, tourism, sport and other matters of
              public interest.
            </p>
            <p>
              Our aim is straightforward: to produce timely, credible and
              accessible journalism that keeps readers informed about the places
              in which they live, work and participate.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Publication facts
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {facts.map(({ label, value, icon: Icon }) => (
                <div key={label} className="border border-gray-200 rounded-xl p-5">
                  <Icon className="h-7 w-7 text-red-600 mb-4" />
                  <p className="text-sm text-gray-500 mb-1">{label}</p>
                  <p className="font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 p-7">
              <ShieldCheckIcon className="h-9 w-9 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How we work
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed mb-5">
                <p>Our articles carry a named byline and a publication date.</p>
                <p>
                  We start from official primary sources and do not copy from
                  other publishers. Many articles list their sources at the end.
                </p>
                <p>
                  If you find a mistake, write to editor@dalimss.news and we
                  will correct it.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link className="text-red-700 font-semibold hover:underline" href="/editorial-policy">
                  Editorial policy
                </Link>
                <Link className="text-red-700 font-semibold hover:underline" href="/ownership">
                  Ownership
                </Link>
                <Link className="text-red-700 font-semibold hover:underline" href="/corrections-policy">
                  Corrections policy
                </Link>
                <Link className="text-red-700 font-semibold hover:underline" href="/authors">
                  Newsroom and contributors
                </Link>
                <Link className="text-red-700 font-semibold hover:underline" href="/contact">
                  Contact us
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-7">
              <UserGroupIcon className="h-9 w-9 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Newsroom and bylines
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                Our newsroom page lists the named contributors currently
                represented in our published bylines. Each byline links to the
                contributor&apos;s published work.
              </p>
              <Link className="text-red-700 font-semibold hover:underline" href="/authors">
                View our newsroom and contributors
              </Link>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Ownership and leadership
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-7">
              <div className="border border-gray-200 rounded-xl p-6">
                <p className="text-sm text-gray-500 mb-1">Publisher</p>
                <p className="font-semibold text-gray-900">
                  PAMF DIGIMEDIA PRIVATE LIMITED
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <p className="text-sm text-gray-500 mb-1">
                  Chief Executive Officer
                </p>
                <p className="font-semibold text-gray-900">Maahir Madhok</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-4xl">
              Dalimss News is run by PAMF Digimedia Private Limited. Write to
              editor@dalimss.news with story tips, questions or correction
              requests.
            </p>
          </div>
        </section>

        <section id="contributors" aria-labelledby="contributors-heading" className="py-14 bg-gray-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 id="contributors-heading" className="text-3xl font-bold text-gray-900 mb-8">
              Contributors
            </h2>
            <div className="max-w-xl">
              <div className="bg-white border border-gray-200 rounded-xl p-7">
                <UserGroupIcon aria-hidden="true" className="h-9 w-9 text-red-600 mb-5" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Newsroom &amp; Published Contributors
                </h3>
                <p className="text-gray-600 leading-relaxed mb-5">
                  Meet the contributors behind our published reporting and
                  explore their latest work.
                </p>
                <Link className="text-red-700 font-semibold hover:underline" href="/authors">
                  View our contributors &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-900 text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold mb-8">Contact the newsroom</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-300">
              <div>
                <EnvelopeIcon className="h-6 w-6 text-red-500 mb-3" />
                <h3 className="text-white font-semibold mb-2">Email</h3>
                <p>
                  <span className="block text-sm text-gray-400">
                    News tips and editorial enquiries
                  </span>
                  <a className="hover:text-white" href="mailto:editor@dalimss.news">
                    editor@dalimss.news
                  </a>
                </p>
              </div>
              <div>
                <PhoneIcon className="h-6 w-6 text-red-500 mb-3" />
                <h3 className="text-white font-semibold mb-1">Phone</h3>
                <a className="hover:text-white" href="tel:+916392752976">
                  +91 63927 52976
                </a>
              </div>
              <div>
                <MapPinIcon className="h-6 w-6 text-red-500 mb-3" />
                <h3 className="text-white font-semibold mb-1">
                  Varanasi
                </h3>
                <p>Varanasi, Uttar Pradesh, India</p>
              </div>
              <div>
                <MapPinIcon className="h-6 w-6 text-red-500 mb-3" />
                <h3 className="text-white font-semibold mb-1">
                  Gurugram
                </h3>
                <p>Gurugram, Haryana, India</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
