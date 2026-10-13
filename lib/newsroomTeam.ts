export interface TeamMember {
  name: string;
  slug: string;
  title: string;
}

export const editorialTeam: TeamMember[] = [
  { name: "Saurav Yadav", slug: "saurav-yadav", title: "Editor-in-Chief" },
  {
    name: "Ansh Sisodia",
    slug: "ansh-sisodia",
    title: "Editor and Content Head, India",
  },
  {
    name: "Jhinuk Barman",
    slug: "jhinuk-barman",
    title: "Content Head, Education",
  },
  { name: "Pankaj Yadav", slug: "pankaj-yadav", title: "Editor and Journalist" },
  {
    name: "Appurva Singh",
    slug: "appurva-singh",
    title: "Journalist and News Anchor",
  },
  {
    name: "Tanishka Upadhyay",
    slug: "tanishka-upadhyay",
    title: "Journalist and News Anchor",
  },
  {
    name: "Aditya Rudraksh Sehgal",
    slug: "aditya-rudraksh-sehgal",
    title: "Journalist, Varanasi and Automotive",
  },
];

export interface BusinessTeamMember {
  name: string;
  title: string;
  photoUrl: string;
  bio: string;
}

// Business staff, not editorial. No byline or author page.
export const businessTeam: BusinessTeamMember[] = [
  {
    name: "Anurag Pandey",
    title: "Revenue Head",
    photoUrl:
      "https://8mjpruwgqc0qkgho.public.blob.vercel-storage.com/dalimss-news/articles/image/1791805171268-anurag-pandey-author-DPfLdLCWTh1OvrNZZdzydObpQLOTMD.jpg",
    bio: "Anurag Pandey is Revenue Head at Dalimss News. He leads the newsroom's revenue strategy, builds advertising and business partnerships, and works with the editorial and product teams so the business grows in a way that keeps the journalism independent.",
  },
];
