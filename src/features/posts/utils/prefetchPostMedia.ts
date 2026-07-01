import { Image } from "expo-image";
import type { VideoSource } from "expo-video";
import {
  resolveMediaDisplayUrl,
  resolveVideoPosterUrl,
} from "@/lib/media/resolveMediaDisplayUrl";
import type { Post } from "../types";
import { resolveFeedMediaDisplayUrls } from "@/features/feed/resolveFeedMediaDisplayUrls";
import { resolveReelVideoSources } from "./resolveReelVideoSource";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "./repostUtils";
import { isVideoPost } from "./videoPosts";

const MP4_WARMUP_BYTES = 131_071;
const PREFETCH_TIMEOUT_MS = 8_000;

async function fetchWithPrefetchTimeout(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PREFETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

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

function resolvePlaylistSegmentUrl(
  manifestUrl: string,
  segmentRef: string
): string {
  if (/^https?:\/\//i.test(segmentRef)) {
    return segmentRef;
  }
  return new URL(segmentRef, manifestUrl).toString();
}

async function warmMp4Uri(uri: string): Promise<void> {
  try {
    await fetchWithPrefetchTimeout(uri, { method: "HEAD" });
  } catch {
    try {
      await fetchWithPrefetchTimeout(uri, {
        method: "GET",
        headers: { Range: `bytes=0-${MP4_WARMUP_BYTES}` },
      });
    } catch {
      // CDN warmup best-effort
    }
  }
}

async function warmHlsManifest(manifestUrl: string): Promise<void> {
  try {
    const response = await fetchWithPrefetchTimeout(manifestUrl);
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
    await fetchWithPrefetchTimeout(segmentUrl, {
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

function prefetchSinglePostMedia(post: Post): void {
  if (post.contentType === "image") {
    const uri = resolveMediaDisplayUrl(post.mediaURL);
    if (uri) {
      void Image.prefetch(uri, { cachePolicy: "memory-disk" });
    }
    return;
  }

  if (!isVideoPost(post)) {
    return;
  }

  const posterUri = resolveVideoPosterUrl(post);
  if (posterUri) {
    void Image.prefetch(posterUri, { cachePolicy: "memory-disk" });
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

export function prefetchPostMedia(post: Post): void {
  if (isRepostPost(post)) {
    const embedded = resolveEmbeddedOriginalPost(post);
    if (embedded) {
      prefetchSinglePostMedia(embedded);
    }
    return;
  }

  prefetchSinglePostMedia(post);
}

export function prefetchFeedPostsBatch(posts: Post[]): void {
  for (const post of posts) {
    prefetchPostMedia(post);
  }
}

function prefetchSinglePostImagesOnly(post: Post): void {
  const { previewUri, fullUri } = resolveFeedMediaDisplayUrls(post);

  if (previewUri) {
    void Image.prefetch(previewUri, { cachePolicy: "memory-disk" });
  }

  if (fullUri && fullUri !== previewUri) {
    void Image.prefetch(fullUri, { cachePolicy: "memory-disk" });
  }
}

/** Scroll sırasında — video manifest/segment warmup yok, sadece görsel/poster. */
export function prefetchFeedPostsImagesBatch(posts: Post[]): void {
  const seen = new Set<string>();

  for (const post of posts) {
    if (seen.has(post.id)) {
      continue;
    }
    seen.add(post.id);

    if (isRepostPost(post)) {
      const embedded = resolveEmbeddedOriginalPost(post);
      if (embedded) {
        prefetchSinglePostImagesOnly(embedded);
      }
      continue;
    }

    prefetchSinglePostImagesOnly(post);
  }
}
