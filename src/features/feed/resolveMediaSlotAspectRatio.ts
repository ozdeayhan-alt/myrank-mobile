import type { Post } from "@/features/posts/types";
import {
  DEFAULT_VIDEO_ASPECT_RATIO,
  normalizeAspectRatio,
} from "@/features/posts/utils/mediaAspectRatio";
import { isVideoPost } from "@/features/posts/utils/videoPosts";

/** Instagram feed varsayılanı — metadata yokken tek seferlik fallback (setState yok). */
const FALLBACK_IMAGE_ASPECT_RATIO = 4 / 5;

const clientAspectCache = new Map<string, number>();

export function rememberMediaAspectRatio(mediaKey: string, ratio: number): void {
  if (mediaKey && ratio > 0) {
    clientAspectCache.set(mediaKey, ratio);
  }
}

function storedPostAspectRatio(post: Post): number | null {
  if (
    typeof post.mediaWidth !== "number" ||
    typeof post.mediaHeight !== "number" ||
    post.mediaWidth <= 0 ||
    post.mediaHeight <= 0
  ) {
    return null;
  }
  return normalizeAspectRatio(post.mediaWidth, post.mediaHeight);
}

function cachedUrlAspectRatio(url: string | undefined): number | null {
  const key = url?.trim();
  if (!key) {
    return null;
  }
  return clientAspectCache.get(key) ?? null;
}

/**
 * Metadata-first aspect ratio — layout shift önleme.
 * Runtime Image.getSize kullanmaz.
 */
export function resolveMediaSlotAspectRatio(post: Post): number {
  const stored = storedPostAspectRatio(post);
  if (stored != null) {
    return stored;
  }

  if (post.contentType === "image") {
    const cached = cachedUrlAspectRatio(post.mediaURL);
    if (cached != null) {
      return cached;
    }
    return FALLBACK_IMAGE_ASPECT_RATIO;
  }

  if (isVideoPost(post)) {
    const posterCached = cachedUrlAspectRatio(post.posterURL);
    if (posterCached != null) {
      return posterCached;
    }
    return DEFAULT_VIDEO_ASPECT_RATIO;
  }

  return 1;
}
