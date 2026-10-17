import TopicHubPage from "@/components/TopicHubPage";
import { makeTopicHubStaticProps, TopicHubProps } from "@/lib/topicHubs";

export default function GurugramNewsPage(props: TopicHubProps) {
  return <TopicHubPage {...props} />;
}

export const getStaticProps = makeTopicHubStaticProps("gurugram");
