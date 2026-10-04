import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ReactNode } from "react";
import Script from "next/script";
import { useRouter } from "next/router";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

interface LayoutProps {
  children: ReactNode;
}

import Head from "next/head";

const NO_ADS_PREFIXES = [
  "/404",
  "/500",
  "/_error",
  "/profile",
  "/my-courses",
  "/courses",
  "/contact",
  "/advertise-with-us",
  "/privacy",
  "/terms-and-conditions",
  "/about",
  "/ownership",
  "/authors",
  "/editorial-policy",
  "/corrections-policy",
  "/mobile-post",
  "/admin",
  "/auth",
];

function isNoAdsPath(pathname: string): boolean {
  return NO_ADS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useRouter();
  const showAds = !isNoAdsPath(pathname);

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans">
      <Head>
        <title>Dalimss News | Varanasi, Gurugram and India News</title>
        <meta name="description" content="Dalimss News is a digital news publication covering Varanasi, Gurugram, Delhi-NCR and major stories from across India, including crime, civic affairs, education, business, culture and lifestyle." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#E21B22" />
        <meta name="robots" key="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="search" type="application/opensearchdescription+xml" title={SITE_NAME} href={`${SITE_URL}/opensearch.xml`} />
        <link rel="alternate" type="application/rss+xml" title="Dalimss News Feed" href="https://dalimss.news/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="हिंदी समाचार" href="https://dalimss.news/hindi/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="Varanasi News Feed" href="https://dalimss.news/varanasi/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="Gurugram News Feed" href="https://dalimss.news/gurugram/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="Education News Feed" href="https://dalimss.news/education/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="Technology News Feed" href="https://dalimss.news/technology/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="Lifestyle News Feed" href="https://dalimss.news/lifestyle/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="World News Feed" href="https://dalimss.news/world/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="Dalimss News OTT" href="https://dalimss.news/ott/feed.xml" />
      </Head>
      {showAds ? (
        <Script
          id="google-adsense"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7477796529453554"
          crossOrigin="anonymous"
        />
      ) : null}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
