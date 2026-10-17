import TopicHubPage from "@/components/TopicHubPage";
import { makeTopicHubStaticProps, TopicHubProps } from "@/lib/topicHubs";

export default function KashiVishwanathNewsPage(props: TopicHubProps) {
  return <TopicHubPage {...props} />;
}

export const getStaticProps = makeTopicHubStaticProps(
  "kashi-vishwanath"
);
