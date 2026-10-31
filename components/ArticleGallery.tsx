import { useCallback, useEffect, useRef, useState } from "react";

type Photo = { src: string; alt: string; caption: string };

type Props = {
  children?: React.ReactNode;
  count?: string;
  language?: string | null;
};

/**
 * Grid of photo figures with a small tap-to-enlarge viewer.
 * The figures (img + figcaption) are server rendered as children, so the
 * images stay in the HTML. The viewer is only built on the client.
 */
export default function ArticleGallery({ children, count, language }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const hi = language === "hi";

  const collect = useCallback((): Photo[] => {
    const root = gridRef.current;
    if (!root) return [];
    const figs = Array.prototype.slice.call(root.querySelectorAll("figure")) as HTMLElement[];
    return figs.map((f) => {
      const im = f.querySelector("img");
      const cap = f.querySelector("figcaption");
      return {
        src: (im && (im.currentSrc || im.getAttribute("src"))) || "",
        alt: (im && im.getAttribute("alt")) || "",
        caption: (cap && cap.textContent) || "",
      };
    });
  }, []);

  // Make each figure keyboard focusable and labelled as an enlarge control.
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const figs = Array.prototype.slice.call(root.querySelectorAll("figure")) as HTMLElement[];
    figs.forEach((f, i) => {
      f.setAttribute("tabindex", "0");
      f.setAttribute("role", "button");
      f.setAttribute("data-index", String(i));
      const im = f.querySelector("img");
      const alt = (im && im.getAttribute("alt")) || "";
      f.setAttribute("aria-label", (hi ? "बड़ा करके देखें: " : "Enlarge photo: ") + alt);
    });
  }, [hi]);

  const openAt = (i: number) => {
    lastFocus.current = (document.activeElement as HTMLElement) || null;
    setPhotos(collect());
    setOpen(i);
  };

  const indexFromEvent = (target: EventTarget | null): number => {
    let el = target as HTMLElement | null;
    while (el && el !== gridRef.current) {
      if (el.tagName === "FIGURE") return Number(el.getAttribute("data-index") || "0");
      el = el.parentElement;
    }
    return -1;
  };

  const onGridClick = (e: React.MouseEvent) => {
    const i = indexFromEvent(e.target);
    if (i < 0) return;
    e.preventDefault();
    openAt(i);
  };

  const onGridKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const i = indexFromEvent(e.target);
    if (i < 0) return;
    e.preventDefault();
    openAt(i);
  };

  const close = useCallback(() => {
    setOpen(null);
    if (lastFocus.current) lastFocus.current.focus();
  }, []);

  const step = useCallback(
    (d: number) => {
      setOpen((cur) => {
        if (cur === null || !photos.length) return cur;
        return (cur + d + photos.length) % photos.length;
      });
    },
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, step]);

  const photo = open !== null ? photos[open] : null;

  return (
    <>
      <div
        ref={gridRef}
        className="article-gallery not-prose"
        data-count={count}
        onClick={onGridClick}
        onKeyDown={onGridKey}
      >
        {children}
      </div>
      {photo && (
        <div
          className="article-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={hi ? "फोटो गैलरी" : "Photo viewer"}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          }}
        >
          <button ref={closeRef} type="button" className="article-lightbox__close" onClick={close} aria-label={hi ? "बंद करें" : "Close"}>
            ×
          </button>
          <button type="button" className="article-lightbox__nav article-lightbox__prev" onClick={() => step(-1)} aria-label={hi ? "पिछली फोटो" : "Previous photo"}>
            ‹
          </button>
          <figure className="article-lightbox__figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={photo.alt} />
            <figcaption>
              {photo.caption}
              <span className="article-lightbox__count">
                {" "}
                {(open as number) + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
          <button type="button" className="article-lightbox__nav article-lightbox__next" onClick={() => step(1)} aria-label={hi ? "अगली फोटो" : "Next photo"}>
            ›
          </button>
        </div>
      )}
    </>
  );
}
