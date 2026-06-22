import { FeedVideoPreviewFrame } from "@/features/media/components/FeedVideoPreviewFrame";
import { ReelsVideoPreviewFrame } from "@/features/media/components/ReelsVideoPreviewFrame";

type ShareVideoPreviewProps = {
  uri: string;
};

export function ShareVideoPreview({ uri }: ShareVideoPreviewProps) {
  return (
    <>
      <FeedVideoPreviewFrame uri={uri} />
      <ReelsVideoPreviewFrame uri={uri} />
    </>
  );
}
