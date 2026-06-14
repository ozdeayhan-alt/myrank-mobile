import { useVideoPlayer, VideoView } from "expo-video";

type ShareVideoPreviewProps = {
  uri: string;
};

export function ShareVideoPreview({ uri }: ShareVideoPreviewProps) {
  const player = useVideoPlayer(uri);

  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: 200 }}
      contentFit="contain"
      nativeControls
    />
  );
}
