import "@/styles/globals.css";
import Script from "next/script";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Layout from "@/components/Layout";
import { NextPage } from "next";
import { ReactElement, ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { fontRootStyle } from "@/lib/fonts";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const router = useRouter();
  const htmlLang =
    pageProps &&
    typeof pageProps === "object" &&
    "htmlLang" in pageProps &&
    (pageProps as { htmlLang?: string }).htmlLang === "hi"
      ? "hi"
      : "en";

  useEffect(() => {
    document.documentElement.lang = htmlLang;
  }, [htmlLang]);

  useEffect(() => {
    document.documentElement.classList.add("fonts-ready");
  }, []);

  // Suppress common Next.js navigation errors
  // These are expected behaviors when navigation is interrupted or same-URL navigation occurs
  useEffect(() => {
    const handleRouteChangeError = (err: Error & { cancelled?: boolean }, url: string) => {
      if (err.cancelled) {
        // Navigation was cancelled - this is expected behavior
        return;
      }
      if (err.message?.includes('hard navigate to the same URL')) {
        // Same URL navigation - this is expected behavior
        return;
      }
      if (err.message?.includes('Loading initial props cancelled')) {
        // Props loading was cancelled - this is expected behavior
        return;
      }
      console.error('Route change error:', err, url);
    };

    // Also suppress these errors from appearing as unhandled rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || '';
      if (
        message.includes('hard navigate to the same URL') ||
        message.includes('Loading initial props cancelled') ||
        message.includes('Invariant: attempted to hard navigate')
      ) {
        event.preventDefault();
        return;
      }
    };

    router.events.on('routeChangeError', handleRouteChangeError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      router.events.off('routeChangeError', handleRouteChangeError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router.events]);

  // Use the page's getLayout if defined, otherwise use default Layout
  const isEditorFlow = router.pathname.startsWith('/admin/') ||
    router.pathname.startsWith('/auth/') || router.pathname.startsWith('/mobile-sign-in') ||
    /^\/(articles|stories|ott)\/(new|.*\/edit)$/.test(router.pathname);
  const getLayout = Component.getLayout ?? ((page) => isEditorFlow ? page : <Layout>{page}</Layout>);

  const isStory = router.pathname.startsWith('/stories/') && !router.pathname.includes('/edit') && !router.pathname.includes('/new');

  return (
    <SessionProvider session={session}>
      <Head>
        <style>{fontRootStyle}</style>
      </Head>
      <div>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2N4BWSS6GL"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2N4BWSS6GL');
          `}
        </Script>
        {getLayout(<Component {...pageProps} />)}
        {!isStory && <Analytics />}
      </div>
    </SessionProvider>
  );
}
