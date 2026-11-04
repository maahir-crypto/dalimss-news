import Link from "next/link";
import { articlePath } from "@/lib/publicPaths";
import { decodeEntities } from "@/lib/decodeEntities";
import type { LatestStory } from "@/lib/latestStories";

export default function LatestStories({ stories, heading = "Latest stories" }: {
  stories: LatestStory[];
  heading?: string;
}) {
  if (!stories.length) return null;
  return (
    <section className="my-8 border-t border-gray-200 pt-5">
      <h2 className="mb-3 font-serif text-xl font-bold text-gray-900">{heading}</h2>
      <ul className="space-y-3">
        {stories.map((story) => (
          <li key={story.slug}>
            <Link href={articlePath(story.slug)} className="font-semibold text-gray-900 hover:text-red-700">
              {decodeEntities(story.title)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
