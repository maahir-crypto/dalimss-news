import Link from "next/link";
import { NAV_CATEGORIES } from "@/lib/categories";
import { formatDateIST } from "@/lib/seo";

const footerLinkClass =
  "inline-flex min-h-11 items-center text-gray-200 transition-colors hover:text-white";
const footerAccentLinkClass =
  "inline-flex min-h-11 items-center font-semibold text-red-300 transition-colors hover:text-white";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-gray-800 bg-gray-950 py-12 font-sans text-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-10 text-left md:grid-cols-3 md:gap-8">
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold tracking-tight text-white">
              Dalimss <span className="text-red-400">News</span>
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-gray-300">
              Dalimss News is a digital news publication covering Varanasi,
              Eastern Uttar Pradesh, Gurugram, Delhi-NCR and major developments
              from across India.
            </p>
            <p className="flex max-w-sm items-center gap-1.5 text-xs font-medium leading-relaxed text-gray-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
              Original reporting. Clear attribution. Journalism in the public interest.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              News Categories
            </h4>
            <div className="grid grid-cols-1 gap-x-4 text-left text-sm sm:grid-cols-2">
              <Link href="/ott" className={footerAccentLinkClass}>
                OTT
              </Link>
              <Link href="/hindi" className={footerAccentLinkClass}>
                हिंदी
              </Link>
              {NAV_CATEGORIES.filter(
                (cat, index) =>
                  index < 11 ||
                  cat.slug === "lifestyle" ||
                  cat.slug === "world"
              ).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={footerLinkClass}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Policies & Trust
            </h4>
            <ul className="flex flex-col text-left text-sm">
              <li>
                <Link href="/editorial-policy" className={footerLinkClass}>
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link href="/corrections-policy" className={footerLinkClass}>
                  Corrections Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className={footerLinkClass}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/ownership" className={footerLinkClass}>
                  Ownership
                </Link>
              </li>
              <li>
                <Link href="/authors" className={footerLinkClass}>
                  Newsroom & Contributors
                </Link>
              </li>
              <li>
                <Link href="/contact" className={footerLinkClass}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/ott/feed.xml" className={footerLinkClass}>
                  OTT RSS Feed
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className={footerLinkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href="https://google.com/preferences/source?q=dalimss.news"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
                >
                  Make us a preferred source on Google
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-gray-800" />

        <div className="flex flex-col items-start justify-between gap-4 text-left text-sm text-gray-300 sm:flex-row sm:items-center">
          <p>
            © {formatDateIST(new Date(), { year: "numeric" })} Dalimss News. All rights reserved.
          </p>

          <div className="flex gap-2">
            <Link
              href="https://www.instagram.com/dalimss.news.banaras/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center text-gray-200 transition-colors hover:text-[#E1306C]"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-instagram"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>

            <Link
              href="https://www.youtube.com/@dalimss_news"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center text-gray-200 transition-colors hover:text-[#FF0000]"
              aria-label="YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-youtube"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
