import { Image } from "expo-image";
import type { VideoSource } from "expo-video";
import { resolveMediaDisplayUrl, resolveVideoPosterUrl } from "@/lib/media/resolveMediaDisplayUrl";
import type { Post } from "../types";
import { resolveReelVideoSources } from "./resolveReelVideoSource";
import { isVideoPost } from "./videoPosts";

const MP4_WARMUP_BYTES = 131_071;

function resolveVideoPrefetchUri(source: VideoSource): string | null {
  if (source == null) {
    return null;
  }
  if (typeof source === "string") {
    return source;
  }
  if (typeof source === "number") {
    return null;
  }
  return source.uri?.trim() || null;
}

function isHlsSource(source: VideoSource): boolean {
  if (source == null || typeof source === "number") {
    return false;
  }
  if (typeof source === "string") {
    return source.includes(".m3u8");
  }
  return (
    source.contentType === "hls" ||
    Boolean(source.uri?.includes(".m3u8"))
  );
}

async function warmMp4Uri(uri: string): Promise<void> {
  try {
    await fetch(uri, { method: "HEAD" });
  } catch {
    try {
      await fetch(uri, {
        method: "GET",
        headers: { Range: `bytes=0-${MP4_WARMUP_BYTES}` },
      });
    } catch {
      // CDN warmup best-effort
    }
  }
}

function resolvePlaylistSegmentUrl(
  manifestUrl: string,
  segmentRef: string
): string {
  if (/^https?:\/\//i.test(segmentRef)) {
    return segmentRef;
  }
  return new URL(segmentRef, manifestUrl).toString();
}

async function warmHlsManifest(manifestUrl: string): Promise<void> {
  try {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      return;
    }

    const playlist = await response.text();
    const segmentRef = playlist
      .split("\n")
      .map((line) => line.trim())
      .find(
        (line) =>
          line.length > 0 &&
          !line.startsWith("#") &&
          (line.endsWith(".ts") ||
            line.endsWith(".m4s") ||
            line.includes(".ts?"))
      );

    if (!segmentRef) {
      return;
    }

    const segmentUrl = resolvePlaylistSegmentUrl(manifestUrl, segmentRef);
    await fetch(segmentUrl, {
      method: "GET",
      headers: { Range: `bytes=0-${MP4_WARMUP_BYTES}` },
    });
  } catch {
    // HLS warmup best-effort
  }
}

async function warmVideoSource(source: VideoSource): Promise<void> {
  const uri = resolveVideoPrefetchUri(source);
  if (!uri) {
    return;
  }

  if (isHlsSource(source)) {
    await warmHlsManifest(uri);
    return;
  }

  await warmMp4Uri(uri);
}

export function prefetchPostMedia(post: Post): void {
  if (post.contentType === "image") {
    const uri = resolveMediaDisplayUrl(post.mediaURL);
    if (uri) {
      void Image.prefetch(uri);
    }
    return;
  }

  if (!isVideoPost(post)) {
    return;
  }

  const posterUri = resolveVideoPosterUrl(post);
  if (posterUri) {
    void Image.prefetch(posterUri);
  }

  const sources = resolveReelVideoSources(post);
  const primary = sources[0];
  if (primary) {
    void warmVideoSource(primary);
  }

  const secondary = sources[1];
  if (secondary) {
    void warmVideoSource(secondary);
  }
}
