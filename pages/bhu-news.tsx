import TopicHubPage from "@/components/TopicHubPage";
import { makeTopicHubServerSideProps, TopicHubProps } from "@/lib/topicHubs";

export default function BhuNewsPage(props: TopicHubProps) {
  return <TopicHubPage {...props} />;
}

export const getServerSideProps = makeTopicHubServerSideProps("bhu");
