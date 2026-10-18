import { GetServerSideProps } from "next";
import { LLMS_CACHE_CONTROL, setCrawlerFileCache } from "@/lib/publicCache";
import { buildLlmsFull, latestArticleLines } from "@/lib/llms";

const LlmsFullTxt = () => null;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const lines = await latestArticleLines(200);
  const body = buildLlmsFull(lines);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  setCrawlerFileCache(req, res, LLMS_CACHE_CONTROL);
  res.write(body);
  res.end();

  return { props: {} };
};

export default LlmsFullTxt;
