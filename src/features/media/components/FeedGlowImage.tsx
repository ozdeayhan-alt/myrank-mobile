import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

type ImagePriority = "low" | "normal" | "high";

type FeedGlowImageProps = {
  uri: string;
  recyclingKey?: string;
  priority?: ImagePriority;
};

/** Feed foto — tam görünür (contain), blur arka plan. PostFeedMedia ile aynı. */
export function FeedGlowImage({
  uri,
  recyclingKey = "feed-preview",
  priority = "normal",
}: FeedGlowImageProps) {
  return (
    <View className="h-full w-full overflow-hidden bg-neutral-950">
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        blurRadius={42}
        priority="low"
        cachePolicy="memory-disk"
        recyclingKey={`${recyclingKey}-bg`}
      />
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
        className="bg-black/40"
      />
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        cachePolicy="memory-disk"
        recyclingKey={recyclingKey}
        priority={priority}
      />
    </View>
  );
}
