import { Text, useWindowDimensions, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  DEFAULT_VIDEO_ASPECT_RATIO,
  feedVideoMediaLayout,
} from "@/features/posts/utils/mediaAspectRatio";
import { useUriAspectRatio } from "../hooks/useUriAspectRatio";

type FeedVideoPreviewFrameProps = {
  uri: string;
  label?: string;
};

/** Feed video kartı önizlemesi — yayınla aynı oran ve cover poster. */
export function FeedVideoPreviewFrame({
  uri,
  label = "Feed'de böyle görünecek",
}: FeedVideoPreviewFrameProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = Math.max(0, screenWidth - 40);
  const aspectRatio = useUriAspectRatio(uri, DEFAULT_VIDEO_ASPECT_RATIO);
  const layout = feedVideoMediaLayout(containerWidth, aspectRatio);
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  return (
    <View className="mb-3">
      <Text className="mb-2 text-xs font-medium text-gray-500">{label}</Text>
      <View
        className="overflow-hidden rounded-2xl border border-gray-200 bg-black"
        style={{ width: layout.width, height: layout.height }}
      >
        <VideoView
          player={player}
          style={{ width: layout.width, height: layout.height }}
          contentFit="cover"
          nativeControls
        />
      </View>
    </View>
  );
}
