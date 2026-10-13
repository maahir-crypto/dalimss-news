import { activeStoryWhere } from "@/lib/storyLifetime";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import prisma from "@/lib/prisma";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDateIST } from "@/lib/seo";
import { storyPath } from "@/lib/publicPaths";

interface StoryPage {
  id: number;
  imageUrl: string;
  heading: string | null;
  text: string | null;
}

interface WebStory {
  id: number;
  slug: string;
  title: string;
  coverImage: string;
  createdAt: string;
  pages: StoryPage[];
}

interface Props {
  stories: WebStory[];
}

export default function StoriesPage({ stories }: Props) {
  const { data: session } = useSession();
  
  const isAdmin = session?.user && (
    session.user.role === "admin" || 
    session.user.role === "editor" || 
    session.user.email === "admin@dalimss.com" || 
    session.user.email === "sushantgaurav@dalimss.com" || 
    session.user.email === "dalimsssushant@gmail.com"
  );

  return (
    <>
      <Head>
        <title>Web Stories | Dalimss News</title>
        <meta name="description" content="Explore visual stories from Dalimss News - quick, engaging news in a swipeable format." />
        <link rel="canonical" href="https://dalimss.news/stories" />
        <meta property="og:title" content="Web Stories | Dalimss News" />
        <meta property="og:description" content="Explore visual stories from Dalimss News - quick, engaging news in a swipeable format." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dalimss.news/stories" />
      </Head>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">
              Web Stories
            </h1>
            <p className="text-gray-500 mt-2">
              Visual stories you can swipe through
            </p>
          </div>
          
          {isAdmin && (
            <Link
              href="/stories/new"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Story
            </Link>
          )}
        </div>

        {/* Stories Grid */}
        {stories && stories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {stories.map((story) => (
              <div key={story.id} className="relative group">
                <a
                  href={storyPath(story.slug)}
                  className="block"
                >
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-lg border-2 border-transparent group-hover:border-red-500 transition-all duration-300">
                    {/* Cover Image */}
                    <ImageWithFallback
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Story Ring Indicator */}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500 to-orange-400 p-0.5 shadow-lg">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Page Count Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                        {story.pages?.length || 0} slides
                      </span>
                    </div>
                    
                    {/* Title and Date */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-sm md:text-base font-bold leading-tight line-clamp-2 mb-2">
                        {story.title}
                      </h3>
                      <p className="text-white/60 text-xs">
                        {formatDateIST(story.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </a>

                {isAdmin && (
                  <Link
                    href={`/stories/${story.slug}/edit`}
                    className="absolute top-3 right-14 z-20 bg-white/90 p-1.5 rounded-full text-gray-700 hover:text-red-600 hover:bg-white shadow-lg transition-all transform hover:scale-110"
                    title="Edit Story"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No stories yet</h2>
            <p className="text-gray-500 mb-6">Be the first to create a visual story!</p>
            
            {isAdmin && (
              <Link
                href="/stories/new"
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                Create Your First Story
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const stories = await (prisma as any).webStory.findMany({
      where: activeStoryWhere(),
      include: { pages: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    
    return { 
      props: { 
        stories: JSON.parse(JSON.stringify(stories)) 
      } 
    };
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { props: { stories: [] } };
  }
};

