import TopicHubPage from "@/components/TopicHubPage";
import { makeTopicHubStaticProps, TopicHubProps } from "@/lib/topicHubs";

export default function VaranasiNewsPage(props: TopicHubProps) {
  return <TopicHubPage {...props} />;
}

export const getStaticProps = makeTopicHubStaticProps("varanasi");
