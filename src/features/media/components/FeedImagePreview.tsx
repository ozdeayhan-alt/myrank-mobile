import { Text, useWindowDimensions, View } from "react-native";
import { feedImageMediaLayout } from "@/features/posts/utils/mediaAspectRatio";
import { useUriAspectRatio } from "../hooks/useUriAspectRatio";
import { FeedGlowImage } from "./FeedGlowImage";

type FeedImagePreviewProps = {
  uri: string;
  label?: string;
};

/** Paylaşım önizlemesi — feed'de görüneceği gibi (Glow + gerçek oran). */
export function FeedImagePreview({
  uri,
  label = "Feed'de böyle görünecek",
}: FeedImagePreviewProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = Math.max(0, screenWidth - 40);
  const aspectRatio = useUriAspectRatio(uri, 1);
  const layout = feedImageMediaLayout(containerWidth, aspectRatio);

  return (
    <View className="mb-3">
      <Text className="mb-2 text-xs font-medium text-gray-500">{label}</Text>
      <View
        className="overflow-hidden rounded-2xl border border-gray-200 bg-black"
        style={{ width: layout.width, height: layout.height }}
      >
        <FeedGlowImage uri={uri} recyclingKey={`feed-preview-${uri}`} />
      </View>
    </View>
  );
}
