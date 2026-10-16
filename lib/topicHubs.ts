import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import { Article } from "@/types";
import { canonicalAuthorName } from "@/lib/seo";

export type TopicHubConfig = {
  slug: string;
  title: string;
  titleHi?: string;
  description: string;
  canonicalPath: string;
  feedPath?: string;
  keywords: string[];
  backgroundLinks: { label: string; href: string }[];
  faqs: { question: string; answer: string }[];
};

export type TopicHubProps = {
  hub: TopicHubConfig;
  articles: Article[];
  latestUpdate: string | null;
};

export const TOPIC_HUBS: Record<string, TopicHubConfig> = {
  varanasi: {
    slug: "varanasi",
    title: "Varanasi News",
    titleHi: "वाराणसी समाचार",
    description:
      "Verified Varanasi and Banaras news covering civic updates, culture, education, governance, tourism, infrastructure and public-interest reporting.",
    canonicalPath: "/varanasi-news",
    feedPath: "/varanasi/feed.xml",
    keywords: ["Varanasi", "Banaras", "Kashi", "वाराणसी", "बनारस"],
    backgroundLinks: [
      { label: "Uttar Pradesh updates", href: "/category/uttar-pradesh" },
      { label: "Education coverage", href: "/category/education" },
      { label: "Corrections policy", href: "/corrections-policy" },
      { label: "BHU news hub", href: "/bhu-news" },
    ],
    faqs: [
      {
        question: "What does Dalimss News cover in Varanasi?",
        answer:
          "Dalimss News covers civic issues, local administration, BHU and education updates, tourism, culture, transport, public safety and neighbourhood developments in Varanasi.",
      },
      {
        question: "How often is this Varanasi news page updated?",
        answer:
          "This hub updates automatically as new verified Varanasi reports are published or corrected on Dalimss News.",
      },
      {
        question: "Can readers send Varanasi news tips?",
        answer:
          "Readers can send tips, documents and corrections through the Dalimss News contact page or newsroom email.",
      },
    ],
  },
  gurugram: {
    slug: "gurugram",
    title: "Gurugram News",
    titleHi: "गुरुग्राम समाचार",
    description:
      "Verified Gurugram news covering civic agencies, traffic, real estate, corporate hubs, neighbourhood issues, infrastructure and Haryana updates.",
    canonicalPath: "/gurugram-news",
    feedPath: "/gurugram/feed.xml",
    keywords: ["Gurugram", "Gurgaon", "Cyber City", "Haryana", "गुरुग्राम"],
    backgroundLinks: [
      { label: "Business coverage", href: "/category/business" },
      { label: "India headlines", href: "/category/india" },
      { label: "Contact newsroom", href: "/contact" },
    ],
    faqs: [
      {
        question: "What Gurugram topics are tracked here?",
        answer:
          "This hub tracks local administration, traffic, civic services, corporate and real-estate developments, public safety and neighbourhood updates in Gurugram.",
      },
      {
        question: "Is Gurgaon news included on this page?",
        answer:
          "Yes. Dalimss News treats Gurugram and Gurgaon as the same local coverage area and consolidates those reports here.",
      },
      {
        question: "How can a Gurugram correction be reported?",
        answer:
          "Corrections can be sent through the corrections policy page with the article URL, specific issue and supporting evidence.",
      },
    ],
  },
  bhu: {
    slug: "bhu",
    title: "BHU News",
    titleHi: "बीएचयू समाचार",
    description:
      "Latest Banaras Hindu University updates, admissions, campus notices, student issues, research, events and education reporting from Varanasi.",
    canonicalPath: "/bhu-news",
    keywords: ["BHU", "Banaras Hindu University", "IIT BHU", "campus", "admission"],
    backgroundLinks: [
      { label: "Education news", href: "/category/education" },
      { label: "Varanasi news", href: "/varanasi-news" },
      { label: "Editorial standards", href: "/editorial-policy" },
    ],
    faqs: [
      {
        question: "What BHU updates are covered?",
        answer:
          "Coverage includes admissions, exams, campus administration, research, student issues, events and public notices related to BHU.",
      },
      {
        question: "Does Dalimss News link to official BHU notices?",
        answer:
          "When available, articles should link or refer to official notices, institutional statements, documents or on-ground reporting.",
      },
      {
        question: "Where can students send campus tips?",
        answer:
          "Students can contact the newsroom through the Dalimss News contact page with documents, photos or detailed context.",
      },
    ],
  },
  "varanasi-infrastructure": {
    slug: "varanasi-infrastructure",
    title: "Varanasi Infrastructure News",
    description:
      "Updates on roads, bridges, transport, airport connectivity, civic works, smart city projects and public infrastructure in Varanasi and Eastern Uttar Pradesh.",
    canonicalPath: "/varanasi-infrastructure",
    keywords: ["Varanasi infrastructure", "road", "bridge", "metro", "transport", "smart city"],
    backgroundLinks: [
      { label: "Varanasi news", href: "/varanasi-news" },
      { label: "Uttar Pradesh news", href: "/category/uttar-pradesh" },
      { label: "Corrections policy", href: "/corrections-policy" },
    ],
    faqs: [
      {
        question: "Which infrastructure stories are included?",
        answer:
          "This hub includes roads, bridges, transport, civic utilities, public works, airport links and major project updates affecting Varanasi residents.",
      },
      {
        question: "Why does source attribution matter for project updates?",
        answer:
          "Infrastructure reports often rely on tenders, official orders, agency statements and site verification, so clear reporting basis helps readers assess accuracy.",
      },
      {
        question: "How current are the project updates?",
        answer:
          "The hub updates automatically when relevant reports are published, updated or corrected.",
      },
    ],
  },
  "kashi-vishwanath": {
    slug: "kashi-vishwanath",
    title: "Kashi Vishwanath News",
    titleHi: "काशी विश्वनाथ समाचार",
    description:
      "Kashi Vishwanath Temple and corridor updates covering pilgrim facilities, administration, festivals, tourism, security and civic arrangements in Varanasi.",
    canonicalPath: "/kashi-vishwanath-news",
    keywords: ["Kashi Vishwanath", "Vishwanath Temple", "corridor", "pilgrim", "temple"],
    backgroundLinks: [
      { label: "Varanasi news", href: "/varanasi-news" },
      { label: "Culture coverage", href: "/category/entertainment" },
      { label: "Contact newsroom", href: "/contact" },
    ],
    faqs: [
      {
        question: "What Kashi Vishwanath updates appear here?",
        answer:
          "This hub includes temple administration, corridor updates, festivals, pilgrim services, tourism advisories, security arrangements and civic facilities.",
      },
      {
        question: "Are festival advisories included?",
        answer:
          "Yes. Relevant advisories, crowd management updates and public notices are grouped here when reported by Dalimss News.",
      },
      {
        question: "How are temple-related reports verified?",
        answer:
          "Reports should be based on official notices, administration statements, eyewitness accounts or Dalimss News on-ground reporting.",
      },
    ],
  },
  "varanasi-airport": {
    slug: "varanasi-airport",
    title: "Varanasi Airport News",
    description:
      "Lal Bahadur Shastri International Airport updates, flight changes, expansion plans, passenger advisories and airport connectivity reports.",
    canonicalPath: "/varanasi-airport-news",
    keywords: ["Varanasi Airport", "Lal Bahadur Shastri Airport", "flight", "airport expansion"],
    backgroundLinks: [
      { label: "Varanasi infrastructure", href: "/varanasi-infrastructure" },
      { label: "Varanasi news", href: "/varanasi-news" },
      { label: "Uttar Pradesh news", href: "/category/uttar-pradesh" },
    ],
    faqs: [
      {
        question: "What airport updates are tracked?",
        answer:
          "This hub tracks flight advisories, expansion plans, connectivity, passenger facilities, weather disruptions and official airport notices.",
      },
      {
        question: "Does this page replace airline alerts?",
        answer:
          "No. Readers should confirm flight status with their airline or airport authority; Dalimss News reports verified public updates and context.",
      },
      {
        question: "How are airport stories sourced?",
        answer:
          "Airport stories should cite or refer to official statements, passenger advisories, airline updates or verified reporting by Dalimss News.",
      },
    ],
  },
};

export function getTopicHubBySlug(slug: string) {
  return TOPIC_HUBS[slug];
}

export function makeTopicHubServerSideProps(slug: string): GetServerSideProps {
  return async () => {
    const hub = getTopicHubBySlug(slug);

    if (!hub) {
      return { notFound: true };
    }

    const articleWhere = {
      AND: [
        { NOT: { language: "hi" } },
        {
          OR: hub.keywords.flatMap((keyword) => [
            { title: { contains: keyword, mode: "insensitive" as const } },
            { content: { contains: keyword, mode: "insensitive" as const } },
            { category: { contains: keyword, mode: "insensitive" as const } },
            { focusKeyword: { contains: keyword, mode: "insensitive" as const } },
            { tags: { contains: keyword, mode: "insensitive" as const } },
          ]),
        },
      ],
    };

    const articles = await prisma.article.findMany({
      where: articleWhere,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      take: 30,
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        readTimeInMinutes: true,
        category: true,
        customAuthor: true,
        createdAt: true,
        updatedAt: true,
        metaTitle: true,
        metaDescription: true,
        focusKeyword: true,
      },
    });

    const serializedArticles: Article[] = articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      content: article.content,
      mediaUrl: article.mediaUrl,
      mediaType: article.mediaType as Article["mediaType"],
      createdAt: article.createdAt.toISOString(),
      authorName: canonicalAuthorName(
        article.customAuthor || "Dalimss News Desk"
      ),
      authorAvatarUrl: "",
      readTimeInMinutes: article.readTimeInMinutes,
      claps: 0,
      commentsCount: 0,
      category: article.category,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      focusKeyword: article.focusKeyword,
    }));

    return {
      props: {
        hub,
        articles: serializedArticles,
        latestUpdate: articles[0]?.updatedAt.toISOString() || null,
      },
    };
  };
}
