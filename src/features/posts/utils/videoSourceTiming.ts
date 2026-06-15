import type { VideoSource } from "expo-video";

export function isHlsVideoSource(source: VideoSource): boolean {
  if (source == null || typeof source === "number") {
    return false;
  }
  if (typeof source === "string") {
    return source.includes(".m3u8");
  }
  return (
    source.contentType === "hls" || Boolean(source.uri?.includes(".m3u8"))
  );
}

export function sourceReadyTimeoutMs(source: VideoSource): number {
  return isHlsVideoSource(source) ? 2_000 : 4_000;
}
