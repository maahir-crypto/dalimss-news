import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  INSTAGRAM_EMBED_SCRIPT,
  parseInstagramPermalink,
  type InstagramEmbedKind,
} from "@/lib/instagramEmbed";

declare global {
  interface Window {
    instgrm?: { Embeds?: { process: () => void } };
  }
}

type Props = {
  permalink?: string;
  kind?: InstagramEmbedKind | string;
  shortcode?: string;
};

let scriptPromise: Promise<void> | null = null;

function loadInstagramEmbedScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.instgrm?.Embeds?.process) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${INSTAGRAM_EMBED_SCRIPT}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("embed.js failed")), {
        once: true,
      });
      // Already loaded earlier in this session.
      if (window.instgrm?.Embeds?.process) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = INSTAGRAM_EMBED_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("embed.js failed"));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Click-to-load Instagram reel/post facade. Instagram's embed.js is fetched
 * only after the reader clicks — never on page load.
 */
export default function InstagramEmbedFacade({ permalink, kind, shortcode }: Props) {
  const parsed = parseInstagramPermalink(permalink || "") || (
    shortcode
      ? parseInstagramPermalink(
          `https://www.instagram.com/${kind === "reel" ? "reel" : "p"}/${shortcode}/`
        )
      : null
  );

  const url = parsed?.url || (typeof permalink === "string" ? permalink : "");
  const labelKind = parsed?.kind === "reel" ? "Reel" : "Post";

  const [activated, setActivated] = useState(false);
  const [failed, setFailed] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);

  const activate = useCallback(async () => {
    if (!url || activated) return;
    setActivated(true);
    try {
      await loadInstagramEmbedScript();
      window.instgrm?.Embeds?.process();
    } catch {
      setFailed(true);
    }
  }, [activated, url]);

  useEffect(() => {
    if (!activated || failed || !url) return;
    const id = window.setTimeout(() => {
      try {
        window.instgrm?.Embeds?.process();
      } catch {
        setFailed(true);
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [activated, failed, url]);

  if (!url) return null;

  // Fixed aspect box avoids CLS whether we show the facade or the embed.
  const shellClass =
    "instagram-embed-facade relative my-6 mx-auto w-full max-w-[540px] aspect-[4/5] overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm";

  if (failed) {
    return (
      <div className={`${shellClass} flex flex-col items-center justify-center gap-3 p-6 text-center`}>
        <p className="text-sm text-gray-600">Instagram embed could not be loaded.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-700 underline underline-offset-2"
        >
          Watch on Instagram
        </a>
      </div>
    );
  }

  if (activated) {
    return (
      <div className={shellClass} ref={mountRef}>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{
            background: "#fff",
            border: 0,
            margin: 0,
            maxWidth: "100%",
            minWidth: "100%",
            width: "100%",
            height: "100%",
          }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            View this {labelKind.toLowerCase()} on Instagram
          </a>
        </blockquote>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <button
        type="button"
        onClick={() => void activate()}
        className="group flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        aria-label={`Load Instagram ${labelKind}`}
      >
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition group-hover:scale-105"
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-gray-800">
          Load Instagram {labelKind}
        </span>
        <span className="text-xs text-gray-500">Click to play · privacy-friendly</span>
      </button>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center p-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-700 underline underline-offset-2"
          onClick={(e) => e.stopPropagation()}
        >
          Watch on Instagram
        </a>
      </div>
    </div>
  );
}
