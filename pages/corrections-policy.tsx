import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  EnvelopeIcon,
  MegaphoneIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const CorrectionsPolicyPage: React.FC = () => {
  const canonicalUrl = `${SITE_URL}/corrections-policy`;
  const pageTitle = `Corrections Policy | ${SITE_NAME}`;
  const pageDescription =
    "Corrections are made on request. Email editor@dalimss.news with the article link and a short description of the error.";

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
                Corrections Policy
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Corrections
            </h1>
            <p className="text-sm text-gray-400">
              Last Updated: October 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Corrections
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Corrections are made on request. Email editor@dalimss.news with
              the article link and a short description of the error. We will
              correct the article.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MegaphoneIcon className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Spotted an Error?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Email editor@dalimss.news with the article link and a short
              description of the error.
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
                href="/editorial-policy"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-red-600/30"
              >
                <NewspaperIcon className="h-5 w-5" />
                Editorial Policy
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

export default CorrectionsPolicyPage;
