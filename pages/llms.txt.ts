import { GetServerSideProps } from "next";
import { LLMS_CACHE_CONTROL, setCrawlerFileCache } from "@/lib/publicCache";
import {
  LLMS_TXT_BODY,
  latestArticleLines,
  withLatestArticles,
} from "@/lib/llms";

const LlmsTxt = () => null;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const lines = await latestArticleLines(50);
  const body = withLatestArticles(LLMS_TXT_BODY, lines);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  setCrawlerFileCache(req, res, LLMS_CACHE_CONTROL);
  res.write(body);
  res.end();

  return { props: {} };
};

export default LlmsTxt;
