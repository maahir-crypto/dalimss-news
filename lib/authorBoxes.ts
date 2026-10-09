import { canonicalAuthorName } from "@/lib/seo";

export interface AuthorProfileLink {
  label: string;
  url: string;
}

export interface AuthorBoxProfile {
  name: string;
  /** Other names the person is known by. Emitted as schema.org alternateName. */
  alternateName?: string[];
  photoUrl: string;
  photoAlt: string;
  jobTitle: string;
  organizationName: string;
  /**
   * Outside contributor, not a Dalimss News reporter. The author card
   * omits the staff byline, and article JSON-LD must not list this
   * person as newsroom staff.
   */
  guest?: boolean;
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
  "Ansh Sisodia": {
    name: "Ansh Sisodia",
    alternateName: ["Rana Anshuman Singh"],
    photoUrl:
      "https://8mjpruwgqc0qkgho.public.blob.vercel-storage.com/dalimss-news/articles/image/1791295872535-ansh-sisodia-author-q4DTm9UilIT6lJzmhp8ukuDp3hDFAi.jpg",
    photoAlt: "Ansh Sisodia, Editor and Content Head for India at Dalimss News",
    jobTitle: "Editor and Content Head, India",
    organizationName: "Dalimss News",
    bio: "Ansh Sisodia, also known as Rana Anshuman Singh, is Editor and Content Head for India at Dalimss News, where he oversees the newsroom's India news and current affairs coverage. He holds a master's degree in Mass Communication from Mahatma Gandhi Kashi Vidyapith, Varanasi. His work spans reporting, research, script writing, video production and social media.",
    alumniOf: ["Mahatma Gandhi Kashi Vidyapith"],
  },
  "Pankaj Yadav": {
    name: "Pankaj Yadav",
    photoUrl:
      "https://8mjpruwgqc0qkgho.public.blob.vercel-storage.com/dalimss-news/articles/image/1791295874252-pankaj-yadav-author-8euwS8kTrOleqHLeIp0jxxGrX5wqxn.jpg",
    photoAlt: "Pankaj Yadav, Editor and Journalist at Dalimss News",
    jobTitle: "Editor and Journalist",
    organizationName: "Dalimss News",
    bio: "Pankaj Yadav is an editor and journalist at Dalimss News. He holds a postgraduate degree in Mass Communication from Mahatma Gandhi Kashi Vidyapith, Varanasi. Pankaj specialises in visual storytelling, video production and graphic design, and his focus is on making every story clear and easy to follow, in words and in pictures.",
    alumniOf: ["Mahatma Gandhi Kashi Vidyapith"],
  },
  "Tanishka Upadhyay": {
    name: "Tanishka Upadhyay",
    photoUrl:
      "https://8mjpruwgqc0qkgho.public.blob.vercel-storage.com/dalimss-news/articles/image/1791296311996-tanishka-upadhyay-author-v2-R9xtB905fMW5782fERTnYfQEaa0whN.jpg",
    photoAlt: "Tanishka Upadhyay, Journalist and News Anchor at Dalimss News",
    jobTitle: "Journalist and News Anchor",
    organizationName: "Dalimss News",
    bio: "Tanishka Upadhyay is a journalist and news anchor at Dalimss News. A Mass Communication graduate of Mahatma Gandhi Kashi Vidyapith, Varanasi, she covers important news, current affairs and public-interest stories, and cares most about explaining them clearly.",
    alumniOf: ["Mahatma Gandhi Kashi Vidyapith"],
  },
  "Saurav Yadav": {
    name: "Saurav Yadav",
    photoUrl:
      "https://8mjpruwgqc0qkgho.public.blob.vercel-storage.com/dalimss-news/articles/image/1791295877261-saurav-yadav-author-h6jmLfLS0AA3Q2AWUBt0M1q3mlC1Iv.jpg",
    photoAlt: "Saurav Yadav, Editor-in-Chief of Dalimss News",
    jobTitle: "Editor-in-Chief",
    organizationName: "Dalimss News",
    bio: "Saurav Yadav is the Editor-in-Chief of Dalimss News. He leads the newsroom's editorial strategy, daily operations and digital content. Saurav holds a master's degree in Communication and Media Studies from Banaras Hindu University, and his focus is on accurate, credible journalism and a stronger digital presence for Dalimss News.",
    alumniOf: ["Banaras Hindu University"],
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
  // Public author slug: dr-sangeeta-bhatia
  "Dr Sangeeta Bhatia": {
    name: "Dr Sangeeta Bhatia",
    photoUrl: "",
    photoAlt: "Dr Sangeeta Bhatia",
    jobTitle: "Founder and Principal, KIIT World School, Delhi",
    organizationName: "KIIT World School, Delhi",
    guest: true,
    bio: "Dr Sangeeta Bhatia is the principal of KIIT World School, Delhi. She writes here as a guest contributor, and the views in this piece are her own.",
  },
};

export function getAuthorBox(
  name: string | null | undefined
): AuthorBoxProfile | null {
  if (!name) return null;
  return authorBoxes[canonicalAuthorName(name)] ?? null;
}
