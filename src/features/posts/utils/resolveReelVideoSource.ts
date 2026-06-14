import type { VideoSource } from "expo-video";
import { isReelsHlsFirstEnabled } from "@/lib/reelsHlsFirstEnabled";
import { resolveVideoStreamUrl } from "@/lib/media/resolveMediaDisplayUrl";
import type { Post } from "../types";

function sourceKey(source: VideoSource): string {
  if (source == null) return "";
  if (typeof source === "string") return source;
  if (typeof source === "number") return String(source);
  return `${source.contentType ?? "auto"}:${source.uri ?? ""}`;
}

function appendUniqueSource(
  sources: VideoSource[],
  seen: Set<string>,
  source: VideoSource | null | undefined
): void {
  if (source == null) return;
  const key = sourceKey(source);
  if (seen.has(key)) return;
  sources.push(source);
  seen.add(key);
}

/** MP4 önce (varsayılan) veya HLS önce (feature flag) — her zaman fallback zinciri korunur. */
export function resolveReelVideoSources(post: Post | undefined): VideoSource[] {
  const sources: VideoSource[] = [];
  const seen = new Set<string>();

  const mp4 = resolveVideoStreamUrl(post?.mediaURL);
  const hlsUrl = resolveVideoStreamUrl(post?.hlsURL);
  const hlsSource: VideoSource | null = hlsUrl
    ? { uri: hlsUrl, contentType: "hls" }
    : null;

  if (isReelsHlsFirstEnabled()) {
    appendUniqueSource(sources, seen, hlsSource);
    appendUniqueSource(sources, seen, mp4);
  } else {
    appendUniqueSource(sources, seen, mp4);
    appendUniqueSource(sources, seen, hlsSource);
  }

  return sources;
}

export function resolveReelVideoSource(post: Post | undefined): VideoSource {
  return resolveReelVideoSources(post)[0] ?? null;
}

export function postHasReelVideo(post: Post | undefined): boolean {
  return resolveReelVideoSources(post).length > 0;
}
