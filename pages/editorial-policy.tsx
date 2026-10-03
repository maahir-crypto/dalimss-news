import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  EnvelopeIcon,
  NewspaperIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const rules = [
  "Official primary sources first.",
  "No copying from other publishers.",
  "Corrections on request, at editor@dalimss.news.",
];

const EditorialPolicyPage: React.FC = () => {
  const canonicalUrl = `${SITE_URL}/editorial-policy`;
  const pageTitle = `Editorial Policy | ${SITE_NAME}`;
  const pageDescription = `Editorial rules for ${SITE_NAME}: official primary sources first, no copying from other publishers, and corrections on request at editor@dalimss.news.`;

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
      </Head>

      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
              <NewspaperIcon className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium text-red-300">
                Editorial Policy
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Editorial Policy
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
              These are the editorial rules {SITE_NAME} follows.
            </p>
            <p className="text-sm text-gray-400">
              Last Updated: October 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <ul className="space-y-4">
              {rules.map((rule) => (
                <li key={rule} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-900 text-lg leading-relaxed">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-gray-600 text-lg leading-relaxed">
              Some illustrations on Dalimss News are AI-generated. They are
              labelled as AI-generated illustrations and are not photographs of
              the event.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Have Concerns About Our Reporting?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              If you find a mistake, write to editor@dalimss.news with the
              article link and a short description of the error.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="bg-gray-800 rounded-xl px-6 py-4 hover:bg-gray-700 transition-colors">
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-semibold text-white">
                  editor@dalimss.news
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl px-6 py-4 hover:bg-gray-700 transition-colors">
                <p className="text-sm text-gray-400 mb-1">Phone</p>
                <p className="font-semibold text-white">+91 63927 52976</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/corrections-policy"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-red-600/30"
              >
                <PencilSquareIcon className="h-5 w-5" />
                Corrections Policy
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
              >
                <EnvelopeIcon className="h-5 w-5" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditorialPolicyPage;
