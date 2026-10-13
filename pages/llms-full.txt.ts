import { GetServerSideProps } from "next";
import {
  LLMS_CACHE_CONTROL,
  buildLlmsFull,
  latestArticleLines,
} from "@/lib/llms";

const LlmsFullTxt = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const lines = await latestArticleLines(200);
  const body = buildLlmsFull(lines);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", LLMS_CACHE_CONTROL);
  res.write(body);
  res.end();

  return { props: {} };
};

export default LlmsFullTxt;
