/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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
