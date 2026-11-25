import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowRightIcon,
  MicrophoneIcon,
  PlayIcon,
  PlusIcon,
  SignalIcon,
} from "@heroicons/react/24/solid";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";
import {
  PODCAST_CATEGORIES,
  PodcastEpisodeData,
  formatContentType,
  formatDuration,
  formatEpisodeLabel,
} from "@/lib/podcasts";
import PodcastCard from "@/components/PodcastCard";
import PodcastPlayer from "@/components/PodcastPlayer";

interface PodcastIndexProps {
  episodes: PodcastEpisodeData[];
}

const EDITOR_EMAILS = new Set([
  "admin@dalimss.com",
  "sushantgaurav@dalimss.com",
  "dalimsssushant@gmail.com",
]);

const LETS_NOT_PRETEND_SHOW = "Let's Not Pretend";
const CGP_SPOTLIGHT_SERIES_URL =
  "https://www.cgpspotlight.com/series/let-s-not-pretend";

function isLetsNotPretendShow(showName?: string | null): boolean {
  return (showName || "").trim().toLowerCase() === "let's not pretend";
}

export default function PodcastIndex({ episodes }: PodcastIndexProps) {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState("All");
  const isEditor =
    session?.user?.role === "admin" ||
    session?.user?.role === "editor" ||
    EDITOR_EMAILS.has(session?.user?.email || "");

  const featuredEpisode =
    episodes.find((episode) => episode.featured) || episodes[0] || null;
  const filteredEpisodes = useMemo(() => {
    if (activeCategory === "All") return episodes;
    return episodes.filter((episode) => episode.category === activeCategory);
  }, [activeCategory, episodes]);
  const availableCategories = PODCAST_CATEGORIES.filter((category) =>
    episodes.some((episode) => episode.category === category)
  );
  const hasLetsNotPretend = episodes.some((episode) =>
    isLetsNotPretendShow(episode.showName)
  );

  return (
    <>
      <Head>
        <title>Dalimss OTT | Stories worth watching</title>
        <meta
          name="description"
          content="Watch premium Dalimss News originals, interviews, explainers and on-ground stories from Varanasi and beyond."
        />
        <link rel="canonical" href={`${SITE_URL}/ott`} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Dalimss News OTT"
          href={`${SITE_URL}/ott/feed.xml`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Dalimss OTT | Stories worth watching"
        />
        <meta
          property="og:description"
          content="Original conversations, explainers and stories from Dalimss News."
        />
        <meta
          property="og:image"
          content={featuredEpisode?.coverImage || `${SITE_URL}/logo.png`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "PodcastSeries",
              name: "Dalimss News OTT",
              url: `${SITE_URL}/ott`,
              description:
                "Original news conversations, interviews and explainers from Dalimss News.",
              webFeed: `${SITE_URL}/ott/feed.xml`,
            }),
          }}
        />
        {hasLetsNotPretend && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "TVSeries",
                name: LETS_NOT_PRETEND_SHOW,
                url: `${SITE_URL}/ott`,
                description:
                  "A parenting series from Dalimss News Education, with honest conversations about raising children.",
                sameAs: [CGP_SPOTLIGHT_SERIES_URL],
                inLanguage: "en-IN",
                creator: {
                  "@type": "Organization",
                  name: "Dalimss News Education",
                  url: SITE_URL,
                },
              }),
            }}
          />
        )}
      </Head>

      <section className="relative overflow-hidden bg-[#070b14] text-white">
        <div className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#e23b2e]/20 blur-[100px]" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                <SignalIcon className="h-3.5 w-3.5 text-[#ff5a4c]" />
                Dalimss Originals
              </div>
              <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-[1.03] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Stories worth
                <span className="block text-white/45">stopping to hear.</span>
              </h1>
            </div>
            {isEditor && (
              <Link
                href="/ott/new"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-[#ff5a4c] hover:text-white"
              >
                <PlusIcon className="h-4 w-4" />
                Publish OTT
              </Link>
            )}
          </div>

          {featuredEpisode ? (
            <div className="grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
              <Link
                href={`/ott/${featuredEpisode.slug}`}
                className="group relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-[0_30px_90px_rgba(0,0,0,.45)]"
              >
                <img
                  src={featuredEpisode.coverImage}
                  alt={`${featuredEpisode.title} cover`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs font-semibold backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff5a4c] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff5a4c]" />
                  </span>
                  Featured {formatContentType(featuredEpisode.contentType).toLowerCase()}
                </div>
              </Link>

              <div className="max-w-2xl">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-[#ff6a5e]">
                  <span>
                    {formatEpisodeLabel(
                      featuredEpisode.seasonNumber,
                      featuredEpisode.episodeNumber,
                      featuredEpisode.contentType
                    )}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span className="text-white/45">
                    {formatDuration(featuredEpisode.duration)}
                  </span>
                  {featuredEpisode.category && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      <span className="text-white/45">
                        {featuredEpisode.category}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="font-serif text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
                  {featuredEpisode.title}
                </h2>
                <p className="mt-5 line-clamp-4 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
                  {featuredEpisode.description}
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-white/50">
                  <MicrophoneIcon className="h-4 w-4 text-[#ff5a4c]" />
                  Hosted by{" "}
                  <span className="font-semibold text-white/80">
                    {featuredEpisode.hostName}
                  </span>
                </div>

                <div className="mt-8">
                  {featuredEpisode.audioUrl ? (
                    <PodcastPlayer
                      src={featuredEpisode.audioUrl}
                      title={featuredEpisode.title}
                      compact
                    />
                  ) : (
                    <Link
                      href={`/ott/${featuredEpisode.slug}`}
                      className="inline-flex items-center gap-3 rounded-full bg-[#ff4d3d] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_40px_rgba(255,77,61,.28)] transition hover:-translate-y-0.5 hover:bg-[#ff6254]"
                    >
                      <PlayIcon className="h-5 w-5" />
                      Watch {formatContentType(featuredEpisode.contentType).toLowerCase()}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-16 text-center backdrop-blur">
              <MicrophoneIcon className="mx-auto h-10 w-10 text-[#ff5a4c]" />
              <h2 className="mt-5 font-serif text-3xl font-semibold">
                The studio is ready.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/55">
                Your first OTT release will appear here with a premium player
                and artwork.
              </p>
              {isEditor && (
                <Link
                  href="/ott/new"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950"
                >
                  <PlusIcon className="h-4 w-4" />
                  Publish the first release
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {hasLetsNotPretend && (
        <section className="border-t border-white/5 bg-[#10151f] py-10 text-white sm:py-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff6a5e]">
                {LETS_NOT_PRETEND_SHOW}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Now streaming on CGP Spotlight
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Our parenting series is on CGP Spotlight, and you can still
                watch the episodes here on Dalimss OTT.
              </p>
            </div>
            <a
              href={CGP_SPOTLIGHT_SERIES_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-[#ff5a4c] hover:text-white"
            >
              Watch on CGP Spotlight
            </a>
          </div>
        </section>
      )}

      <section className="bg-[#f7f6f2] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#df3d31]">
                The latest
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Browse all OTT releases
              </h2>
            </div>
            <Link
              href="/ott/feed.xml"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#df3d31]"
            >
              Follow via RSS
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {availableCategories.length > 0 && (
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              {["All", ...availableCategories].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`flex-none rounded-full border px-4 py-2 text-xs font-bold transition ${
                    activeCategory === category
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {filteredEpisodes.length > 0 ? (
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEpisodes.map((episode) => (
                <PodcastCard key={episode.id} episode={episode} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center text-sm text-slate-500">
              No OTT releases in this category yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  PodcastIndexProps
> = async () => {
  const episodes = await prisma.podcastEpisode.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });

  return {
    props: {
      episodes: JSON.parse(JSON.stringify(episodes)),
    },
  };
};
