import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types";
import { decodeEntities } from "@/lib/decodeEntities";
import { formatDateIST } from "@/lib/seo";
import { articlePath } from "@/lib/publicPaths";
import { isOptimizableImageSrc } from "@/lib/optimizableImage";

interface Props {
  articles: Article[];
}

const NewsShortsSidebar = ({ articles }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const motionOk = () =>
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const swapSlide = (update: () => void) => {
    if (!motionOk()) {
      update();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      update();
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    swapSlide(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    });
  };

  const handlePrev = () => {
    swapSlide(() => {
      setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
    });
  };

  const handleShuffle = () => {
    swapSlide(() => {
      let newIndex = Math.floor(Math.random() * articles.length);
      while (newIndex === currentIndex && articles.length > 1) {
        newIndex = Math.floor(Math.random() * articles.length);
      }
      setCurrentIndex(newIndex);
    });
  };

  // Auto-slide every 5 seconds, unless the reader prefers reduced motion.
  useEffect(() => {
    if (articles.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [articles.length, currentIndex]);

  // Reset currentIndex when articles array changes to avoid accessing undefined indices
  useEffect(() => {
    if (articles && articles.length > 0) {
      setCurrentIndex(0);
    }
  }, [articles]);

  if (!articles || articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentIndex];

  // Safety check: if currentArticle is undefined, reset to first article
  if (!currentArticle) {
    return null;
  }

  const title = decodeEntities(currentArticle.title);
  const cleanDescription = (html: string | null) => {
    if (!html) return "";
    return decodeEntities(html.replace(/<[^>]+>/g, "")).slice(0, 280);
  };

  return (
    <div className="w-full">
      {/* Phone Frame Container */}
      <div className="relative mx-auto w-full max-w-[380px]">
        
        {/* Phone Outer Frame */}
        <div className="relative bg-[#1a1a2e] rounded-[40px] p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          
          {/* Phone Inner Screen */}
          <div className="relative bg-white rounded-[32px] overflow-hidden">
            
            {/* Status Bar / Top Header */}
            <div className="bg-[#dc2626] py-2.5 px-4 flex items-center justify-center">
              <span className="text-white text-sm font-bold tracking-wide">Top News</span>
            </div>

            {/* Image Section */}
            <div className={`relative w-full h-[220px] bg-gray-200 overflow-hidden transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              {currentArticle.mediaUrl ? (
                isOptimizableImageSrc(currentArticle.mediaUrl) ? (
                  <Image
                    src={currentArticle.mediaUrl}
                    alt={title}
                    fill
                    sizes="380px"
                    quality={70}
                    className="object-cover"
                  />
                ) : (
                  <img
                    src={currentArticle.mediaUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                  <span className="text-white text-xl font-bold opacity-40">DALIMSS NEWS</span>
                </div>
              )}
              
              {/* Share Icon */}
              <button 
                onClick={handleShuffle}
                className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                title="Shuffle News"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>

            {/* Content Section */}
            <div className={`p-5 bg-white transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              
              {/* Title */}
              <Link href={articlePath(currentArticle.slug)}>
                <h2 className="text-[18px] leading-[1.35] font-bold text-gray-900 mb-3 font-serif hover:text-[#dc2626] transition-colors line-clamp-3">
                  {title}
                </h2>
              </Link>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-[#dc2626] text-white text-[10px] font-bold px-2.5 py-1 rounded">
                  {currentArticle.category || "News"}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {formatDateIST(currentArticle.createdAt, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              {/* Description */}
              <p className="text-[13px] text-gray-700 leading-[1.6] mb-5 line-clamp-5">
                {cleanDescription(currentArticle.content)}
              </p>

              {/* Read More Button */}
              <Link
                href={articlePath(currentArticle.slug)}
                className="block w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[14px] font-bold text-center py-3 rounded transition-colors"
              >
                Read More
              </Link>
            </div>

            {/* Bottom Navigation Dots & Swipe Hint */}
            <div className="bg-white pb-4 px-5">
              <div className="flex items-center justify-between">
                {/* Prev Button */}
                <button 
                  onClick={handlePrev}
                  className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Dots Indicator */}
                <div className="flex items-center gap-1.5">
                  {articles.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        swapSlide(() => setCurrentIndex(idx));
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex % 5 ? 'bg-[#dc2626] w-4' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                  {articles.length > 5 && (
                    <span className="text-[10px] text-gray-400 ml-1">+{articles.length - 5}</span>
                  )}
                </div>

                {/* Next Button */}
                <button 
                  onClick={handleNext}
                  className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              {/* Home Indicator Bar */}
              <div className="mt-3 flex justify-center">
                <div className="w-28 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Counter */}
        <div className="mt-4 text-center text-xs text-gray-500">
          {currentIndex + 1} / {articles.length}
        </div>
      </div>
    </div>
  );
};

export default NewsShortsSidebar;
