import type { Post } from "@/features/posts/types";

const FIREBASE_STORAGE_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
]);

export type ResolveMediaDisplayUrlOptions = {
  /** Poster/görsel için true (varsayılan). Video stream (MP4/HLS) için false. */
  useProxy?: boolean;
  /** Firebase download token'ı koru (poster yükleme güvenilirliği). */
  keepToken?: boolean;
};

function getMediaProxyOrigin(): string | null {
  const raw = process.env.EXPO_PUBLIC_MEDIA_PROXY_ORIGIN?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/\/+$/, "");
}

function stripFirebaseDownloadToken(url: URL): URL {
  if (FIREBASE_STORAGE_HOSTS.has(url.hostname)) {
    url.searchParams.delete("token");
  }
  return url;
}

function applyMediaProxy(url: URL): URL {
  const proxyOrigin = getMediaProxyOrigin();
  if (!proxyOrigin || !FIREBASE_STORAGE_HOSTS.has(url.hostname)) {
    return url;
  }

  return new URL(`${proxyOrigin}/fb-media${url.pathname}${url.search}`);
}

function resolveMediaUrl(
  url: string | undefined,
  options: ResolveMediaDisplayUrlOptions
): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) {
    return undefined;
  }

  const useProxy = options.useProxy !== false;
  const keepToken = options.keepToken === true;

  try {
    const parsed = new URL(trimmed);
    const normalized = keepToken ? parsed : stripFirebaseDownloadToken(parsed);
    if (useProxy) {
      return applyMediaProxy(normalized).toString();
    }
    return normalized.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Poster, profil fotoğrafı, feed görselleri — CDN proxy kullanılabilir.
 */
export function resolveMediaDisplayUrl(
  url: string | undefined,
  options?: ResolveMediaDisplayUrlOptions
): string | undefined {
  return resolveMediaUrl(url, options ?? { useProxy: true });
}

/**
 * Video poster — token korunur, proxy kapalı (Firebase path encoding).
 */
export function resolvePosterDisplayUrl(
  url: string | undefined
): string | undefined {
  return resolveMediaUrl(url, { useProxy: false, keepToken: true });
}

/**
 * MP4 / HLS oynatma ve prefetch — doğrudan Firebase (proxy HLS segmentlerini bozar).
 */
export function resolveVideoStreamUrl(
  url: string | undefined
): string | undefined {
  return resolveMediaUrl(url, { useProxy: false });
}

/** mediaURL'den poster object path türet: …/123_fast.mp4 → …/123_poster.jpg */
export function derivePosterObjectPathFromMediaUrl(
  mediaUrl: string
): string | null {
  try {
    const parsed = new URL(mediaUrl);
    if (!parsed.hostname.includes("firebasestorage.googleapis.com")) {
      return null;
    }

    const match = parsed.pathname.match(/\/o\/(.+)$/);
    if (!match?.[1]) {
      return null;
    }

    const objectPath = decodeURIComponent(match[1]);
    const posterPath = objectPath
      .replace(/_fast\.mp4$/i, "_poster.jpg")
      .replace(/\.mp4$/i, "_poster.jpg");

    if (posterPath === objectPath || !posterPath.endsWith("_poster.jpg")) {
      return null;
    }

    return posterPath;
  } catch {
    return null;
  }
}

function extractBucketFromFirebaseUrl(mediaUrl: string): string | null {
  try {
    const parsed = new URL(mediaUrl);
    const match = parsed.pathname.match(/\/b\/([^/]+)\/o\//);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function buildPublicFirebaseMediaUrl(
  bucket: string,
  objectPath: string
): string {
  const encoded = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media`;
}

/** posterURL alanı boşsa mediaURL'den public poster adresi türet. */
export function derivePosterUrlFromMediaUrl(
  mediaURL: string | undefined
): string | undefined {
  const trimmed = mediaURL?.trim();
  if (!trimmed) {
    return undefined;
  }

  const posterPath = derivePosterObjectPathFromMediaUrl(trimmed);
  const bucket = extractBucketFromFirebaseUrl(trimmed);
  if (!posterPath || !bucket) {
    return undefined;
  }

  return buildPublicFirebaseMediaUrl(bucket, posterPath);
}

/** Feed/reels poster: önce posterURL, yoksa mediaURL'den türet. */
export function resolveVideoPosterUrl(
  post: Pick<Post, "posterURL" | "mediaURL">
): string | undefined {
  const fromField = resolvePosterDisplayUrl(post.posterURL);
  if (fromField) {
    return fromField;
  }

  return derivePosterUrlFromMediaUrl(post.mediaURL);
}
