import { canonicalAuthorName } from "@/lib/seo";

export interface AuthorProfileLink {
  label: string;
  url: string;
}

export interface AuthorBoxProfile {
  name: string;
  photoUrl: string;
  photoAlt: string;
  jobTitle: string;
  organizationName: string;
  bio: string;
  /** Schools named in the bio. Author pages use these for Person JSON-LD. */
  alumniOf?: string[];
  /**
   * Public profile links. Rendered on the author page and emitted as
   * schema.org sameAs. Other authors can add links the same way.
   */
  sameAs?: AuthorProfileLink[];
}

/** Role line shown under an author name. Skips a repeated organization. */
export function formatAuthorRole(profile: AuthorBoxProfile): string {
  const title = profile.jobTitle.trim();
  const organization = profile.organizationName.trim();
  if (
    !organization ||
    title === organization ||
    title.endsWith(`, ${organization}`)
  ) {
    return title;
  }
  return `${title}, ${organization}`;
}

export function authorSameAsUrls(
  profile: { sameAs?: AuthorProfileLink[] } | null | undefined
): string[] {
  return (profile?.sameAs ?? [])
    .map((link) => link.url.trim())
    .filter((url) => url.length > 0);
}

/**
 * Curated author boxes, keyed by canonical author name.
 * Add a writer by inserting one entry under that name.
 */
export const authorBoxes: Record<string, AuthorBoxProfile> = {
  "Fizaa Madhok": {
    name: "Fizaa Madhok",
    photoUrl:
      "https://8mjpruwgqc0qkgho.public.blob.vercel-storage.com/dalimss-news/articles/image/1790920701678-fizaa-madhok-author-yOWjDXzHieFjnT0R7JshNaOVRrKaYH.jpg",
    photoAlt: "Fizaa Madhok",
    jobTitle: "Additional Director",
    organizationName: "Dalimss Sunbeam Group of Schools",
    bio: "Fizaa Madhok is Additional Director at the Dalimss Sunbeam Group of Schools. She gives her working hours to the betterment of the foundation school and works with toddlers who struggle with separation anxiety. Fizaa writes about parenting and working women.",
  },
  "Jhinuk Barman": {
    name: "Jhinuk Barman",
    photoUrl: "/newsroom-portraits/jhinuk-barman.png",
    photoAlt:
      "Jhinuk Barman, Content Head for Education at Dalimss News",
    jobTitle: "Content Head, Education",
    organizationName: "Dalimss News",
    bio: "Jhinuk Barman is Content Head for Education at Dalimss News. Originally from Assam, she is based in Varanasi and holds a postgraduate degree in Philosophy from Banaras Hindu University (BHU). She leads the education desk's content and also works on social issues, interviews, ground reports and digital journalism. Her philosophy background and her interest in gender and society shape how she reports. She looks past the headline to why a story matters and explains complicated subjects in plain language.",
    alumniOf: ["Banaras Hindu University"],
  },
  "Appurva Singh": {
    name: "Appurva Singh",
    photoUrl: "/newsroom-portraits/appurva-singh.png",
    photoAlt: "Appurva Singh, Journalist and News Anchor at Dalimss News",
    jobTitle: "Journalist and News Anchor",
    organizationName: "Dalimss News",
    bio: "Appurva Singh is a Journalist and News Anchor at Dalimss News. She completed her graduation in Mass Communication from the School of Management Sciences (SMS), Varanasi, and is now pursuing her postgraduate studies in Mass Communication at Mahatma Gandhi Kashi Vidyapith (MGKVP), Varanasi. She reports and presents the news with a focus on clear facts and on stories that connect with people, aiming to make news easier to follow and more meaningful for viewers.",
    alumniOf: [
      "School of Management Sciences, Varanasi",
      "Mahatma Gandhi Kashi Vidyapith",
    ],
  },
  "Maahir Madhok": {
    name: "Maahir Madhok",
    photoUrl: "https://maahirmadhok.in/img/maahir-madhok.jpg",
    photoAlt: "Portrait of Maahir Madhok",
    jobTitle: "Founder and CEO, Dalimss News",
    organizationName: "Dalimss News",
    bio: "Maahir Madhok is the Founder and CEO of Dalimss News, a digital newsroom he launched in February 2024, headquartered in Gurugram. He is also Additional Director of Dalimss Sunbeam Group of Schools, a CBSE school group in Varanasi founded in 1972, a role he has held since October 2021. He writes about how Indian schools can prepare children for adult life and an AI-shaped world.",
    sameAs: [
      { label: "Website", url: "https://maahirmadhok.in" },
      {
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/maahir-madhok-b1b336b9",
      },
      { label: "X", url: "https://x.com/maahirmadhok" },
      { label: "Facebook", url: "https://www.facebook.com/maahirmadhok" },
      { label: "Instagram", url: "https://www.instagram.com/madhokmaahir" },
      { label: "Wikidata", url: "https://www.wikidata.org/wiki/Q141636630" },
    ],
  },
};

export function getAuthorBox(
  name: string | null | undefined
): AuthorBoxProfile | null {
  if (!name) return null;
  return authorBoxes[canonicalAuthorName(name)] ?? null;
}
