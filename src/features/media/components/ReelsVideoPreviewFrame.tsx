import { Text, useWindowDimensions, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

type ReelsVideoPreviewFrameProps = {
  uri: string;
  label?: string;
};

/** Reels tam ekran önizlemesi — 9:16 çerçeve, cover. */
export function ReelsVideoPreviewFrame({
  uri,
  label = "Reels'te böyle görünecek",
}: ReelsVideoPreviewFrameProps) {
  const { width: screenWidth } = useWindowDimensions();
  const frameWidth = Math.max(0, screenWidth - 40);
  const frameHeight = Math.round(frameWidth * (16 / 9));
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  return (
    <View className="mb-3">
      <Text className="mb-2 text-xs font-medium text-gray-500">{label}</Text>
      <View
        className="self-center overflow-hidden rounded-2xl border border-gray-200 bg-black"
        style={{ width: frameWidth, height: frameHeight }}
      >
        <VideoView
          player={player}
          style={{ width: frameWidth, height: frameHeight }}
          contentFit="cover"
          nativeControls
        />
      </View>
    </View>
  );
}
