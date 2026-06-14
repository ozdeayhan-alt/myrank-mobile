import { memo } from "react";
import { View } from "react-native";

type VideoReelPageProps = {
  width: number;
  height: number;
};

/** Kaydırma için şeffaf tam ekran hücre — video altta görünür. */
export const VideoReelPage = memo(function VideoReelPage({
  width,
  height,
}: VideoReelPageProps) {
  return <View style={{ width, height, backgroundColor: "transparent" }} />;
});
