import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PencilSquareIcon,
  PlusIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { NAV_CATEGORIES } from "@/lib/categories";
import { isPlaceholderSegment } from "@/lib/publicPaths";
import { formatDateIST } from "@/lib/seo";

const EDITOR_EMAILS = new Set([
  "admin@dalimss.com",
  "sushantgaurav@dalimss.com",
  "dalimsssushant@gmail.com",
]);

const PRIMARY_CATEGORY_SLUGS = new Set([
  "india",
  "uttar-pradesh",
  "varanasi",
  "gurgaon",
  "education",
  "business",
  "technology",
]);

function categoryHref(slug: string) {
  if (isPlaceholderSegment(slug)) return "/";
  if (slug === "varanasi") return "/varanasi-news";
  if (slug === "gurgaon") return "/gurugram-news";
  return `/category/${slug}`;
}

const primaryCategories = NAV_CATEGORIES.filter((category) =>
  PRIMARY_CATEGORY_SLUGS.has(category.slug)
);
const moreCategories = NAV_CATEGORIES.filter(
  (category) => !PRIMARY_CATEGORY_SLUGS.has(category.slug)
);

const Nav: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"create" | "more" | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navContainerRef = useRef<HTMLDivElement>(null);

  const isEditor =
    session?.user?.role === "admin" ||
    session?.user?.role === "editor" ||
    EDITOR_EMAILS.has(session?.user?.email || "");

  useEffect(() => {
    setCurrentDate(
      formatDateIST(new Date(), {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Close dropdowns & mobile menu on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close dropdowns & mobile menu on route change
  useEffect(() => {
    const closeAll = () => {
      setIsMenuOpen(false);
      setOpenDropdown(null);
    };
    router.events.on("routeChangeStart", closeAll);
    return () => router.events.off("routeChangeStart", closeAll);
  }, [router.events]);

  useEffect(() => {
    setSearchQuery(router.query.search ? String(router.query.search) : "");
  }, [router.query.search]);

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (query) {
      // Full navigation so middleware can render server-side, noindex results.
      window.location.assign(`/?search=${encodeURIComponent(query)}`);
    } else if (router.query.search) {
      window.location.assign("/");
    }
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdown: "create" | "more") => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
    setIsMenuOpen(false);
  };

  const isActive = (href: string) => {
    const path = router.asPath.split("?")[0];
    return href === "/"
      ? path === "/"
      : path === href || path.startsWith(`${href}/`);
  };

  const desktopLinkClass = (href: string) =>
    `relative whitespace-nowrap py-3 text-[12px] font-extrabold uppercase tracking-[0.055em] transition-colors xl:text-[13px] ${
      isActive(href)
        ? "text-[#E21B22] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#E21B22]"
        : "text-slate-800 hover:text-[#E21B22]"
    }`;

  return (
    <div ref={navContainerRef} className="w-full font-sans">
      {/* Upper Section: Date Bar + Main Header (Scrolls away with page) */}
      <header className="border-b border-slate-100 bg-white">
        {/* Top Date Bar */}
        <div className="hidden border-b border-slate-100 bg-slate-50/80 md:block">
          <div className="mx-auto flex h-8 max-w-[1500px] items-center px-5 text-[11px] text-slate-500 lg:px-8">
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Main Logo & User Action Bar */}
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-5 md:h-[88px]">
            <Link
              href="/"
              onClick={closeDropdowns}
              className="flex min-w-0 shrink-0 items-center"
              aria-label="Dalimss News home"
            >
              <Image
                src="/logo.png"
                alt="Dalimss News"
                width={226}
                height={100}
                className="h-10 w-[90px] object-contain md:h-14 md:w-[127px]"
                loading="eager"
              />
            </Link>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 xl:hidden"
              onClick={() => {
                setIsMenuOpen((open) => !open);
                setOpenDropdown(null);
              }}
              aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>

            <div className="hidden min-w-0 items-center gap-3 xl:flex">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search news..."
                  className="w-52 rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-4 pr-11 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-[#E21B22] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 xl:w-72"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch();
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-[#E21B22]"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="h-[18px] w-[18px]" />
                </button>
              </div>

              {isEditor && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("create")}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#E21B22]"
                    aria-expanded={openDropdown === "create"}
                    aria-haspopup="true"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        openDropdown === "create" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === "create" && (
                    <div className="absolute right-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
                      <Link
                        href="/articles/new"
                        onClick={closeDropdowns}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-[#E21B22]"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-[#E21B22]">
                          <PencilSquareIcon className="h-5 w-5" />
                        </span>
                        Write article
                      </Link>
                      <Link
                        href="/ott/new"
                        onClick={closeDropdowns}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-[#E21B22]"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-[#E21B22]">
                          <MicrophoneIcon className="h-5 w-5" />
                        </span>
                        Upload OTT episode
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {!session ? (
                <button
                  type="button"
                  onClick={() => {
                    closeDropdowns();
                    signIn();
                  }}
                  className="flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-slate-700 transition hover:text-[#E21B22]"
                >
                  <UserCircleIcon className="h-7 w-7" />
                  <span className="hidden xl:inline">Sign in</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={34}
                      height={34}
                      className="h-[34px] w-[34px] rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-slate-600" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      closeDropdowns();
                      signOut();
                    }}
                    className="whitespace-nowrap rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-[#E21B22] transition hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Category Navigation Bar (Desktop) */}
      <nav className="sticky top-0 z-50 hidden border-b border-slate-200 bg-white shadow-[0_2px_14px_rgba(15,23,42,0.035)] xl:block">
        <div className="mx-auto flex h-12 max-w-[1500px] items-stretch justify-between gap-4 px-6 lg:px-8">
          <ul className="flex min-w-0 items-stretch gap-4 xl:gap-6">
            <li className="flex items-stretch">
              <Link href="/" onClick={closeDropdowns} className={desktopLinkClass("/")}>
                Home
              </Link>
            </li>
            <li className="flex items-stretch">
              <Link
                href="/hindi"
                onClick={closeDropdowns}
                className={desktopLinkClass("/hindi")}
              >
                हिंदी
              </Link>
            </li>
            {primaryCategories.map((category) => {
              const href = categoryHref(category.slug);
              return (
                <li key={category.slug} className="flex items-stretch">
                  <Link href={href} onClick={closeDropdowns} className={desktopLinkClass(href)}>
                    {category.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <ul className="flex shrink-0 items-stretch gap-4 xl:gap-6">
            <li className="flex items-stretch">
              <Link
                href="/ott"
                onClick={closeDropdowns}
                className={`${desktopLinkClass(
                  "/ott"
                )} flex items-center gap-1.5`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E21B22] opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E21B22]" />
                </span>
                OTT
              </Link>
            </li>
            <li className="flex items-stretch">
              <Link href="/about" onClick={closeDropdowns} className={desktopLinkClass("/about")}>
                About
              </Link>
            </li>
            <li className="relative flex items-center">
              <button
                type="button"
                onClick={() => toggleDropdown("more")}
                className="flex cursor-pointer items-center gap-1.5 py-3 text-[12px] font-extrabold uppercase tracking-[0.055em] text-slate-800 transition hover:text-[#E21B22] xl:text-[13px]"
                aria-expanded={openDropdown === "more"}
                aria-haspopup="true"
              >
                More
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    openDropdown === "more" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openDropdown === "more" && (
                <div className="absolute right-0 top-full z-[60] mt-1 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
                  {moreCategories.map((category) => {
                    const href = categoryHref(category.slug);
                    return (
                      <Link
                        key={category.slug}
                        href={href}
                        onClick={closeDropdowns}
                        className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-red-50 hover:text-[#E21B22] ${
                          isActive(href)
                            ? "bg-red-50 text-[#E21B22]"
                            : "text-slate-700"
                        }`}
                      >
                        {category.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMenuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-5 pt-4 shadow-xl xl:hidden">
          <div className="mx-auto max-w-2xl">
            <div className="relative mb-5">
              <input
                type="search"
                placeholder="Search news..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-4 pr-12 text-sm focus:border-[#E21B22] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-500"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <Link
                href="/"
                onClick={closeDropdowns}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:text-[#E21B22]"
              >
                Home
              </Link>
              <Link
                href="/hindi"
                onClick={closeDropdowns}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:text-[#E21B22]"
              >
                हिंदी
              </Link>
              {NAV_CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={categoryHref(category.slug)}
                  onClick={closeDropdowns}
                  className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:text-[#E21B22]"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/ott"
                onClick={closeDropdowns}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-[#E21B22]"
              >
                <MicrophoneIcon className="h-4 w-4" />
                OTT
              </Link>
              <Link
                href="/about"
                onClick={closeDropdowns}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:text-[#E21B22]"
              >
                About
              </Link>
            </div>

            {isEditor && (
              <div className="mt-4 rounded-2xl bg-slate-950 p-3 text-white">
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Creator studio
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/articles/new"
                    onClick={closeDropdowns}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-3 text-xs font-bold transition hover:bg-white/15"
                  >
                    <PencilSquareIcon className="h-4 w-4 text-red-400" />
                    Write article
                  </Link>
                  <Link
                    href="/ott/new"
                    onClick={closeDropdowns}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#E21B22] px-3 py-3 text-xs font-bold transition hover:bg-red-600"
                  >
                    <MicrophoneIcon className="h-4 w-4" />
                    Upload OTT episode
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-slate-100 pt-4">
              {!session ? (
                <button
                  type="button"
                  onClick={() => {
                    closeDropdowns();
                    signIn();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  Sign in
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        width={30}
                        height={30}
                        className="h-[30px] w-[30px] rounded-full object-cover"
                        alt=""
                      />
                    ) : (
                      <UserCircleIcon className="h-7 w-7 text-slate-500" />
                    )}
                    <span className="truncate text-xs font-semibold normal-case text-slate-600">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeDropdowns();
                      signOut();
                    }}
                    className="shrink-0 text-xs font-bold text-[#E21B22]"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Nav;
