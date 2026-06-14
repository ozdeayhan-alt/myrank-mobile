import * as VideoThumbnails from "expo-video-thumbnails";
import { devWarn } from "@/lib/devLog";

const THUMBNAIL_TIMES_MS = [0, 100, 500, 1000] as const;

export type VideoPosterResult = {
  uri: string;
  width: number;
  height: number;
};

/** expo-video-thumbnails geçerli file:// veya content:// URI bekler. */
export function toThumbnailUri(uri: string): string {
  const trimmed = uri.trim();
  if (
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `file://${trimmed}`;
  }
  return trimmed;
}

async function tryThumbnailAt(
  uri: string,
  timeMs: number
): Promise<VideoPosterResult | null> {
  try {
    const result = await VideoThumbnails.getThumbnailAsync(toThumbnailUri(uri), {
      time: timeMs,
      quality: 0.8,
    });
    const posterUri = result.uri?.trim();
    if (!posterUri) {
      return null;
    }
    return {
      uri: posterUri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    devWarn(
      `[generateVideoPoster] thumbnail failed (${timeMs}ms):`,
      error
    );
    return null;
  }
}

/**
 * Orijinal ve sıkıştırılmış videodan kapak dener; başarısızsa null (paylaşım devam eder).
 */
export async function generateVideoPosterUri(
  sourceUri: string,
  compressedUri: string
): Promise<VideoPosterResult | null> {
  const candidates = [
    toThumbnailUri(sourceUri),
    toThumbnailUri(compressedUri),
  ].filter((value, index, array) => array.indexOf(value) === index);

  for (const uri of candidates) {
    for (const timeMs of THUMBNAIL_TIMES_MS) {
      const poster = await tryThumbnailAt(uri, timeMs);
      if (poster) {
        return poster;
      }
    }
  }

  return null;
}
