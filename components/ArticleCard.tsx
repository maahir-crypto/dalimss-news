import React from 'react';
import Link from 'next/link';
import { Article } from '../types';
import ShareButton from './ShareButton';
import ArticleMediaPreview from './ArticleMediaPreview';
import { decodeEntities } from '@/lib/decodeEntities';
import { formatDateIST } from '@/lib/seo';
import { articlePath } from '@/lib/publicPaths';

interface ArticleCardProps {
  article: Article;
  variant?: 'vertical' | 'horizontal' | 'compact';
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'vertical' }) => {
  const formattedDate = formatDateIST(article.createdAt, {
    month: 'short',
    day: 'numeric',
  });
  const titleLang = article.language === "hi" ? "hi" : undefined;
  const title = decodeEntities(article.title);

  const snippet =
    typeof article.content === "string"
      ? decodeEntities(article.content.replace(/<[^>]+>/g, "")).split("\n")[0].slice(0, 100) + "..."
      : "";
  const articleHref = articlePath(article.slug);

  // Horizontal Card (Image Left, Content Right)
  if (variant === 'horizontal') {
    return (
      <div className="group flex gap-4 border-b border-gray-200 py-5 last:border-b-0">
        {article.mediaUrl && (
          <div className="relative aspect-[3/2] w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100 md:w-48">
             <ArticleMediaPreview
                src={article.mediaUrl}
                mediaType={article.mediaType}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                sizes="(max-width: 768px) 128px, 192px"
              />
          </div>
        )}
        <div className="flex min-w-0 flex-col justify-between">
          <Link href={articleHref}>
            <h3 lang={titleLang} className="text-lg md:text-xl font-serif font-bold text-gray-900 leading-tight group-hover:text-[#E21B22] transition-colors">
              {title}
            </h3>
          </Link>
          <p className="hidden md:block text-sm text-gray-600 mt-2 line-clamp-2">
            {snippet}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <time dateTime={article.createdAt} className="text-xs font-semibold uppercase text-gray-500">
              {formattedDate}
            </time>
            <ShareButton 
              url={articleHref}
              title={title} 
              variant="minimal"
            />
          </div>
        </div>
      </div>
    );
  }

  // Compact Card (Text only or small thumbnail)
  if (variant === 'compact') {
    return (
      <div className="group py-3 border-b border-gray-100 last:border-0">
        <Link href={articleHref} className="block">
          <h4 lang={titleLang} className="font-serif text-sm font-bold leading-snug text-gray-900 group-hover:text-[#E21B22] md:text-base">
            {title}
          </h4>
        </Link>
        <div className="flex items-center justify-between mt-1">
          <time dateTime={article.createdAt} className="text-xs text-gray-500">
            {formattedDate}
          </time>
          <ShareButton 
            url={articleHref}
            title={title} 
            variant="minimal"
          />
        </div>
      </div>
    );
  }

  // Default Vertical Card
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {article.mediaUrl && (
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100">
          <ArticleMediaPreview
            src={article.mediaUrl}
            mediaType={article.mediaType}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={articleHref} className="block mb-2">
          <h3 lang={titleLang} className="text-xl font-serif font-bold text-gray-900 leading-tight group-hover:text-[#E21B22] transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
          {snippet}
        </p>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <time dateTime={article.createdAt}>
              {formattedDate}
            </time>
            {article.authorName && <span className="font-medium text-gray-700">• {article.authorName}</span>}
          </div>
          <ShareButton 
            url={articleHref}
            title={title} 
            variant="minimal"
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
