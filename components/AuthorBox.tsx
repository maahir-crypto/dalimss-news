import { formatAuthorRole, type AuthorBoxProfile } from "@/lib/authorBoxes";
import { AuthorProfileLinks } from "@/components/AuthorProfileLinks";

export interface AuthorFallback {
  name: string;
  href: string;
  storyCount: number | null;
  topCategory: string | null;
}

interface AuthorBoxProps {
  author?: AuthorBoxProfile | null;
  fallback?: AuthorFallback | null;
  language?: string | null;
}

function storiesOnDalimss(count: number): string {
  return count === 1
    ? "1 story on Dalimss News"
    : `${count} stories on Dalimss News`;
}

function englishFallbackLine(fallback: AuthorFallback): string {
  const base = `${fallback.name} reports for Dalimss News.`;
  if (!fallback.storyCount || fallback.storyCount < 1) return base;
  const stories = storiesOnDalimss(fallback.storyCount);
  if (fallback.topCategory) {
    return `${base} ${stories}, most often in ${fallback.topCategory}.`;
  }
  return `${base} ${stories}.`;
}

function hindiStoryCount(count: number): string {
  return count === 1 ? "1 खबर" : `${count} खबरें`;
}

function hindiFallbackLine(fallback: AuthorFallback): string {
  const base = `दलिम्स न्यूज़ पर ${fallback.name} की खबरें`;
  if (!fallback.storyCount || fallback.storyCount < 1) return `${base}.`;
  if (fallback.topCategory) {
    return `${base}. ${hindiStoryCount(fallback.storyCount)}, सबसे अधिक ${fallback.topCategory} में.`;
  }
  return `${base}. ${hindiStoryCount(fallback.storyCount)}.`;
}

function authorInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9\u0900-\u097F]/g, ""))
    .filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return `${first}${last}`.toUpperCase();
}

export function AuthorBox({ author, fallback, language }: AuthorBoxProps) {
  if (!author && !fallback?.name) return null;

  const isHindi = language === "hi";
  const heading = isHindi ? "लेखक के बारे में" : "About the author";

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
      <h2 className="mb-4 text-base font-bold text-gray-900">{heading}</h2>
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        {author ? (
          <img
            src={author.photoUrl}
            alt={author.photoAlt}
            width={80}
            height={80}
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold text-gray-800"
          >
            {authorInitials(fallback?.name || "")}
          </div>
        )}
        <div className="min-w-0 text-sm leading-relaxed text-gray-700">
          {author ? (
            <>
              <p className="font-semibold text-gray-900">{author.name}</p>
              <p className="mb-2 text-gray-600">
                {formatAuthorRole(author)}
              </p>
              <p>{author.bio}</p>
              <AuthorProfileLinks links={author.sameAs} className="mt-2" />
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900">{fallback?.name}</p>
              <p className="mt-1">
                {isHindi
                  ? hindiFallbackLine(fallback as AuthorFallback)
                  : englishFallbackLine(fallback as AuthorFallback)}
              </p>
              <p className="mt-2">
                <a
                  href={fallback?.href}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {isHindi
                    ? `${fallback?.name} की सभी खबरें`
                    : `More from ${fallback?.name}`}
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
