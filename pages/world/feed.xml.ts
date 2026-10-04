import { GetServerSideProps } from "next";
import { buildRssFeed } from "@/lib/rss";

const WorldFeed = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const rss = await buildRssFeed({
    categorySlug: "world",
    title: "World News - Dalimss News",
    description:
      "World news: global stories with an India angle, from Dalimss News.",
    selfPath: "/world/feed.xml",
  });

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=600, stale-while-revalidate=1200"
  );
  res.write(rss);
  res.end();

  return { props: {} };
};

export default WorldFeed;
