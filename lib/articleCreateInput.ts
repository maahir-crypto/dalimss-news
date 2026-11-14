import { normalizeArticleSources, type ArticleSource } from "@/lib/articleSources";
import type { Prisma } from "@prisma/client";

/**
 * Fields the create route validates, after publisher JSON is mapped onto the
 * Article columns. `tags`, `category`, and `focusKeyword` are strings in the
 * schema. Scripts often send tags as a string array; Prisma then rejects the
 * whole insert before it reaches the database.
 */
export type ArticleCreateFields = {
  title: string;
  content: string;
  slug?: string;
  sourceUrl: string | null;
  rawSources: unknown;
  sourceUrls: ArticleSource[];
  reportingBasis: string;
  language: string;
  mediaUrl: string | null;
  mediaType: string | null;
  mediaItems?: Prisma.InputJsonValue;
  category: string | null;
  customAuthor: string;
  metaTitle?: string;
  metaDescription: string;
  focusKeyword: string | null;
  tags: string | null;
  imageAltText: string;
  imageCaption: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** A string, a finite number, or a list of those joined with commas. */
function textValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (!Array.isArray(value)) return undefined;

  const parts = value
    .map((item) =>
      typeof item === "string" || (typeof item === "number" && Number.isFinite(item))
        ? String(item).trim()
        : ""
    )
    .filter((item) => item.length > 0);

  return parts.length > 0 ? parts.join(", ") : undefined;
}

function optionalText(value: unknown): string | null {
  const text = textValue(value);
  if (text == null) return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mediaItemsValue(
  value: unknown,
  mediaUrl: string | null,
  mediaType: string | null
): Prisma.InputJsonValue | undefined {
  if (Array.isArray(value) || isRecord(value)) return value as Prisma.InputJsonValue;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed) || isRecord(parsed)) return parsed as Prisma.InputJsonValue;
    } catch {
      // A bare URL is handled below.
    }
  }
  if (!mediaUrl) return undefined;
  return [{ url: mediaUrl, type: mediaType === "video" ? "video" : "image" }];
}

function sourceList(body: Record<string, unknown>): unknown {
  const sourceUrls = body.sourceUrls;
  const sources = body.sources;
  if (Array.isArray(sourceUrls) && sourceUrls.length > 0) return sourceUrls;
  if (Array.isArray(sources)) return sources;
  return sourceUrls;
}

/**
 * Map an admin form body or a publisher script body onto Article columns.
 * Unknown keys such as `excerpt`, `sources`, and `image` are not returned.
 */
export function articleCreateFields(body: unknown): ArticleCreateFields {
  const source = isRecord(body) ? body : {};
  const mediaUrl = optionalText(source.mediaUrl) ?? optionalText(source.image);
  const mediaType = optionalText(source.mediaType) ?? (mediaUrl ? "image" : null);
  const rawSources = sourceList(source);

  return {
    title: typeof source.title === "string" ? source.title : "",
    content: typeof source.content === "string" ? source.content : "",
    slug: textValue(source.slug),
    sourceUrl: optionalText(source.sourceUrl),
    rawSources,
    sourceUrls: normalizeArticleSources(rawSources),
    reportingBasis: textValue(source.reportingBasis) || "",
    language: typeof source.language === "string" ? source.language : "",
    mediaUrl,
    mediaType,
    mediaItems: mediaItemsValue(source.mediaItems, mediaUrl, mediaType),
    category: optionalText(source.category),
    customAuthor: textValue(source.customAuthor) || textValue(source.author) || "",
    metaTitle: textValue(source.metaTitle),
    metaDescription: textValue(source.metaDescription) || textValue(source.excerpt) || "",
    focusKeyword: optionalText(source.focusKeyword),
    tags: optionalText(source.tags),
    imageAltText: textValue(source.imageAltText) || "",
    imageCaption: textValue(source.imageCaption) || "",
  };
}
