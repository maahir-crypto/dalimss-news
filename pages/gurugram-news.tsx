import TopicHubPage from "@/components/TopicHubPage";
import { makeTopicHubServerSideProps, TopicHubProps } from "@/lib/topicHubs";

export default function GurugramNewsPage(props: TopicHubProps) {
  return <TopicHubPage {...props} />;
}

export const getServerSideProps = makeTopicHubServerSideProps("gurugram");
