/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Vercel sets VERCEL_ENV at build (production, preview, or development)
  // and does not send it to the browser. Inline it so Clarity in
  // pages/_app.tsx can skip preview and dev without a server/client
  // mismatch. Empty means the variable was not set; the snippet then
  // loads only on dalimss.news.
  env: {
    NEXT_PUBLIC_VERCEL_ENV:
      process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || "",
  },

  images: {
    // 31-day edge cache for optimized images. WebP only, so each
    // photo is not also encoded as AVIF. deviceSizes drops 2048 and
    // 3840; layout slots are 768px or smaller and sources are 1536px,
    // so 1920 is enough. OG images and max-image-preview are untouched.
    minimumCacheTTL: 2678400,
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // <-- Google profile images
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com", // Vercel Blob storage
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.dalimss.news" }],
        destination: "https://dalimss.news/:path*",
        permanent: true,
      },
      {
        source: "/varanasi",
        destination: "/varanasi-news",
        permanent: true,
      },
      {
        source: "/gurugram",
        destination: "/gurugram-news",
        permanent: true,
      },
      {
        source: "/gurgaon",
        destination: "/gurugram-news",
        permanent: true,
      },
      // City category archives fold onto the topic hubs. Next.js forwards
      // the request query, so ?page=N is preserved. Trailing slashes follow
      // the same default strip as the other permanent redirects.
      {
        source: "/category/varanasi",
        destination: "/varanasi-news",
        permanent: true,
      },
      {
        source: "/category/gurugram",
        destination: "/gurugram-news",
        permanent: true,
      },
      {
        source: "/category/gurgaon",
        destination: "/gurugram-news",
        permanent: true,
      },
      {
        source: "/technology",
        destination: "/category/technology",
        permanent: true,
      },
      {
        source: "/world",
        destination: "/category/world",
        permanent: true,
      },
      {
        source: "/lifestyle",
        destination: "/category/lifestyle",
        permanent: true,
      },
      {
        source: "/automotive",
        destination: "/category/automotive",
        permanent: true,
      },
      {
        source: "/education",
        destination: "/category/education",
        permanent: true,
      },
      {
        source: "/gurgaon-news",
        destination: "/gurugram-news",
        permanent: true,
      },
      {
        source: "/podcasts",
        destination: "/ott",
        permanent: true,
      },
      {
        source: "/podcasts/:path((?!feed\\.xml$).*)",
        destination: "/ott/:path",
        permanent: true,
      },
      {
        source: "/courses",
        destination: "/",
        permanent: true,
      },
      {
        source: "/my-courses",
        destination: "/",
        permanent: true,
      },
      {
        source: "/authors/:slug",
        destination: "/author/:slug",
        permanent: true,
      },
      {
        source: "/dalimss-news/about",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/articles/what-is-artificial-intelligence-ai",
        destination:
          "/articles/vda-cracks-down-on-illegal-constructions-in-zone-4-multiple-buildings-sealed",
        permanent: true,
      },
      // Thin-audit merges, 19 Nov 2026. Duplicate English or one-spec URLs
      // 301 to the surviving guide. Articles are not deleted.
      {
        source: "/articles/varanasi-census-self-enumeration-launch-id-nov16-2026",
        destination: "/articles/varanasi-census-self-enumeration-launch-nov16-2026",
        permanent: true,
      },
      {
        source: "/articles/gurugram-mcg-9am-cleaning-january-road-target-november-16",
        destination: "/articles/gurugram-road-cleaning-january-15-weekly-inspections-nov16",
        permanent: true,
      },
      {
        source: "/articles/xiaomi-18-pro-oppo-reno17-specs-india-launch-status",
        destination: "/articles/xiaomi-18-pro-global-launch-uk-prices-specs",
        permanent: true,
      },
      {
        source: "/articles/backpack-clearing-cftc-registration-exchange-pending",
        destination: "/articles/backpack-cftc-exchange-designation-november-2026",
        permanent: true,
      },
      {
        source: "/articles/ipad-a16-price-list-49900-to-103900",
        destination: "/articles/ipad-a16-49900-103900",
        permanent: true,
      },
      {
        source: "/articles/redmi-a7-pro-64gb-2tb",
        destination: "/articles/redmi-a7-pro-5g-4-6",
        permanent: true,
      },
      {
        source: "/articles/nokia-210-4g-24",
        destination: "/articles/nokia-210-4g-ai-180-days-2999",
        permanent: true,
      },
      {
        source: "/articles/nokia-110-4g-177",
        destination: "/articles/nokia-110-4g-2599",
        permanent: true,
      },
      {
        source: "/articles/nokia-106-4g-contacts-mobile-home-number-field",
        destination: "/articles/nokia-106-4g-hmd-101-4g-2599-2199",
        permanent: true,
      },
      {
        source: "/articles/ipad-pro-m5-139900-163900",
        destination: "/articles/ipad-pro-m5-2500-8900",
        permanent: true,
      },
      {
        source: "/articles/skoda-octavia-rs-park-assist",
        destination: "/articles/skoda-octavia-rs-price-5669000",
        permanent: true,
      },
      // 20 Nov 2026 Varanasi desk same-event merges.
      // The short land-lease slug is not a published article, so it stays
      // out of MERGED_ARTICLE_REDIRECTS and is config-only.
      {
        source: "/articles/varanasi-ganga-mahotsav-artist-programme-nov18-2026",
        destination: "/articles/varanasi-ganga-mahotsav-artists-namo-ghat-nov18-2026",
        permanent: true,
      },
      {
        source: "/articles/varanasi-central-forces-land-lease-419-acres-nov19-2026",
        destination: "/articles/varanasi-dham-security-land-lease-nov18-2026",
        permanent: true,
      },
      {
        source: "/articles/varanasi-central-forces-land-lease-419-acres-nov19",
        destination: "/articles/varanasi-dham-security-land-lease-nov18-2026",
        permanent: true,
      },
      {
        source: "/articles/varanasi-svanidhi-vendor-welfare-award-nov20-2026",
        destination:
          "/articles/varanasi-vendor-welfare-award-scheme-linkages-nov20-2026",
        permanent: true,
      },
      {
        source:
          "/articles/varanasi-kashi-security-land-lease-approved-nov18-2026",
        destination: "/articles/varanasi-dham-security-land-lease-nov18-2026",
        permanent: true,
      },
      // 24 Nov 2026 Gurugram desk same-event merges.
      {
        source:
          "/articles/gurugram-public-places-smoking-signboards-november23",
        destination:
          "/articles/gurugram-smoking-ban-parks-markets-signs-november-23",
        permanent: true,
      },
      {
        source:
          "/articles/gurugram-local-government-water-revenue-meet-november-23",
        destination:
          "/articles/gurugram-local-body-water-grants-upkeep-conference-nov23",
        permanent: true,
      },
      {
        source:
          "/articles/gurugram-panchayat-assets-caretakers-conference-nov23",
        destination:
          "/articles/gurugram-local-body-water-grants-upkeep-conference-nov23",
        permanent: true,
      },
      // 25 Nov 2026 Varanasi and Gurugram desk same-event merges.
      {
        source:
          "/articles/varanasi-ignca-accounts-post-karaundi-nov23-2026",
        destination:
          "/articles/varanasi-ignca-accounts-post-dec8-notice-nov23-2026",
        permanent: true,
      },
      {
        source:
          "/articles/apeda-varanasi-meeting-farrukhabad-qatar-nov20-2026",
        destination:
          "/articles/varanasi-apeda-export-meeting-support-nov24-2026",
        permanent: true,
      },
      {
        source:
          "/articles/gurugram-ten-debris-sites-500-acre-search-november-24",
        destination:
          "/articles/gurugram-ten-waste-sites-network-review-november-24",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      // afterFiles runs after public files and non-dynamic pages (robots.txt,
      // ads.txt, llms.txt) and before dynamic routes. A Pages Router file
      // named [key].txt does not keep the ".txt" suffix in its route regex,
      // so the key file is this rewrite instead of a dynamic page.
      beforeFiles: [],
      afterFiles: [
        {
          source: "/:key.txt",
          destination: "/api/indexnow-key?key=:key",
        },
        {
          source: "/prices/:hub.csv",
          destination: "/api/price-hub-csv?hub=:hub",
        },
      ],
      fallback: [],
    };
  },

  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      },
      {
        source: '/auth/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      },
      {
        source: '/articles/:slug/edit',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      },
      {
        source: '/stories/:slug/edit',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      },
      {
        source: '/profile',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      },
      {
        source: '/ott/new',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      },
      {
        source: '/ott/:slug/edit',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
