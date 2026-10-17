import { GetServerSideProps } from "next";
import HomePage from "../index";
import { loadHomePage } from "@/lib/homeListing";

export default HomePage;

/**
 * Server-rendered `/?search=` results.
 * Middleware rewrites the public URL here and redirects a direct visit back,
 * so this path is not a second public URL.
 * Search HTML is per-query and noindex, so it is never shared-cached.
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader("Cache-Control", "private, no-store");
  context.res.setHeader("X-Robots-Tag", "noindex, follow");

  const search = context.query.search;
  const searchQuery = Array.isArray(search) ? search[0] || "" : search || "";

  try {
    return { props: await loadHomePage(searchQuery) };
  } catch (error) {
    console.error("Error fetching search results:", error);
    return { props: { articles: [], stories: [], searchQuery } };
  }
};
