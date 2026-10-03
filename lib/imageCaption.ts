export const AI_ILLUSTRATION_LABEL = "AI-generated illustration";

/**
 * Slugs whose legacy "illustrative" wording is not an AI illustration.
 * Checked even when the article is inside the rewrite window.
 */
export const LEGACY_NOT_AI_SLUGS = new Set([
  "the-titans-of-kashi-the-homegrown-brands-shaping-v-o87un7",
  "sampurnanand-sanskrit-university-book-reading-dikshaotsav",
  "damdami-taksal-chief-harnam-singh-khalsa-urges-schools-to-strengthen-indian-cultural-values",
]);

/** 22 August 2026, 00:00 IST. Legacy wording before this stays as typed. */
const AI_LABEL_START_MS = Date.parse("2026-08-22T00:00:00+05:30");

const ALREADY_AI = /ai[-\s]+generated\s+illustration/i;
const NEWS_VERB = /\b(is|are|was|were|has|have)\b/i;

const ILLUSTRATIVE_ALONE =
  /^illustrative(?:\s+editorial)?\s+image\.?$/i;
const ILLUSTRATIVE_OF =
  /^illustrative\s+image\s+(?:of|representing|depicting)\s+([\s\S]+)$/i;
const ILLUSTRATIVE_COLON =
  /^illustrative(?:\s+editorial)?\s+image\s*:\s*([\s\S]*)$/i;

const REPRESENTATIONAL_START =
  /^(?:(?:representational|representative)\s+(?:illustration|image)|editorial\s+illustration)\b/i;
const REPRESENTATIONAL_END =
  /(?:(?:representational|representative)\s+(?:illustration|image)|editorial\s+illustration)\b[\s\S]{0,80}$/i;

type CaptionResult = { text: string; ai: boolean };

type CaptionOptions = {
  slug?: string;
  publishedAt?: Date | string | null;
};

function legacyWindowOpen(opts?: CaptionOptions): boolean {
  if (opts?.slug && LEGACY_NOT_AI_SLUGS.has(opts.slug)) return false;
  const publishedAt = opts?.publishedAt;
  if (publishedAt == null || publishedAt === "") return false;
  const time =
    publishedAt instanceof Date
      ? publishedAt.getTime()
      : Date.parse(String(publishedAt));
  if (Number.isNaN(time)) return false;
  return time >= AI_LABEL_START_MS;
}

function hasExternalCredit(caption: string): boolean {
  return (
    /\bphotographers?\b/i.test(caption) ||
    /\bphoto\s+by\b/i.test(caption) ||
    /(?:^|[\s.(])Photo\s*:/.test(caption) ||
    /(?:^|[\s.(])Image\s*:/.test(caption) ||
    /company\s+materials/i.test(caption)
  );
}

function capitalizeFirst(value: string): string {
  const text = value.trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * A remainder is a news sentence when it is longer than 140 characters, or it
 * ends in a full stop and contains is, are, was, were, has, or have.
 */
function readsLikeNewsSentence(remainder: string): boolean {
  const text = remainder.trim();
  if (text.length > 140) return true;
  if (!/\.\s*$/.test(text)) return false;
  return NEWS_VERB.test(text);
}

function labelOnly(): CaptionResult {
  return { text: `${AI_ILLUSTRATION_LABEL}.`, ai: true };
}

function fromRemainder(
  remainder: string,
  mode: "colon" | "of" | "boilerplate"
): CaptionResult {
  const rest = remainder.trim();
  if (!rest) {
    if (mode === "boilerplate") {
      return {
        text: `${AI_ILLUSTRATION_LABEL} for Dalimss News.`,
        ai: true,
      };
    }
    return labelOnly();
  }
  if (readsLikeNewsSentence(rest)) return labelOnly();
  if (mode === "of") {
    return { text: `${AI_ILLUSTRATION_LABEL} of ${rest}`, ai: true };
  }
  return {
    text: `${AI_ILLUSTRATION_LABEL}: ${capitalizeFirst(rest)}`,
    ai: true,
  };
}

function stripRepresentationalBoilerplate(value: string): string {
  const phrase =
    /(?:\b(?:representational|representative)\s+(?:illustration|image)\b|\beditorial\s+illustration\b)(?:\s+(?:created|generated))?(?:\s+for\s+dalimss\s+news)?(?:\s*[.;,]?\s*not\s+a\s+photograph\s+of\s+the\s+reported\s+event)?/gi;

  const text = value
    .replace(phrase, " ")
    .replace(/\b(?:created|generated)\s+for\s+dalimss\s+news\b/gi, " ")
    .replace(/\bfor\s+dalimss\s+news\b/gi, " ")
    .replace(/\bnot\s+a\s+photograph\s+of\s+the\s+reported\s+event\b/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/\.\s+\./g, ".")
    .trim()
    .replace(/^[\s.;:,-]+/, "")
    .replace(/\s+\./g, ".")
    .trim();

  if (!/[A-Za-z0-9]/.test(text)) return "";
  return text;
}

/**
 * Turn legacy AI illustration captions into one honest label.
 *
 * Empty captions stay empty. A caption that already says "AI-generated
 * illustration" (any case, hyphen or space) is returned as typed.
 * Hindi captions that start with "प्रतीकात्मक चित्र" stay as typed.
 * Legacy wording is rewritten only on or after 22 August 2026 IST, and only
 * when the slug is outside LEGACY_NOT_AI_SLUGS. Older articles, excluded
 * slugs, photographer credits, "Image:" credits, and "company materials"
 * stay as typed.
 *
 * Rewrites, case-insensitive:
 * - "Illustrative image: X" and "Illustrative editorial image: X"
 *   become "AI-generated illustration: X" (first letter of X capitalised).
 * - "Illustrative image of|representing|depicting X"
 *   becomes "AI-generated illustration of X".
 * - "Illustrative image." and "Illustrative editorial image." alone
 *   become "AI-generated illustration."
 * - "Representational illustration ...", "Representational image generated
 *   for Dalimss News", "Representative image ...", and "Editorial illustration
 *   generated for Dalimss News" become "AI-generated illustration for Dalimss
 *   News." when only boilerplate remains, otherwise "AI-generated illustration:
 *   <rest>".
 * - If the remainder is a news sentence (longer than 140 characters, or a
 *   full stop plus is/are/was/were/has/have), the result is
 *   "AI-generated illustration." with no news sentence after the label.
 */
export function normalizeImageCaption(
  caption: string | null | undefined,
  opts?: CaptionOptions
): CaptionResult {
  if (caption == null || caption.trim() === "") {
    return { text: "", ai: false };
  }

  if (ALREADY_AI.test(caption)) {
    return { text: caption, ai: true };
  }

  const trimmed = caption.trim();
  if (trimmed.startsWith("प्रतीकात्मक चित्र")) {
    return { text: caption, ai: false };
  }

  if (!legacyWindowOpen(opts) || hasExternalCredit(trimmed)) {
    return { text: caption, ai: false };
  }

  if (ILLUSTRATIVE_ALONE.test(trimmed)) return labelOnly();

  const ofMatch = trimmed.match(ILLUSTRATIVE_OF);
  if (ofMatch) return fromRemainder(ofMatch[1] ?? "", "of");

  const colonMatch = trimmed.match(ILLUSTRATIVE_COLON);
  if (colonMatch) return fromRemainder(colonMatch[1] ?? "", "colon");

  if (REPRESENTATIONAL_START.test(trimmed) || REPRESENTATIONAL_END.test(trimmed)) {
    return fromRemainder(stripRepresentationalBoilerplate(trimmed), "boilerplate");
  }

  return { text: caption, ai: false };
}
