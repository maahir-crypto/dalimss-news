import { GetServerSideProps } from "next";
import { LLMS_CACHE_CONTROL, setCrawlerFileCache } from "@/lib/publicCache";
import { buildLlmsTxt } from "@/lib/llmsDocument";
import { latestArticleLines, priceGuideMarkdown } from "@/lib/llms";

const LlmsTxt = () => null;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const [lines, priceGuides] = await Promise.all([
    latestArticleLines(50),
    priceGuideMarkdown(),
  ]);
  const body = buildLlmsTxt(lines, priceGuides);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  setCrawlerFileCache(req, res, LLMS_CACHE_CONTROL);
  res.write(body);
  res.end();

  return { props: {} };
};

export default LlmsTxt;
