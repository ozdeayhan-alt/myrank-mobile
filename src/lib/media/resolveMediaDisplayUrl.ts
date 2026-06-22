import type { Post } from "@/features/posts/types";
import { normalizeFirebaseStorageUrl } from "@/lib/media/normalizeAvatarUrl";

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

  const normalizedInput = normalizeFirebaseStorageUrl(trimmed);
  const useProxy = options.useProxy !== false;
  const keepToken = options.keepToken === true;

  try {
    const parsed = new URL(normalizedInput);
    const normalized = keepToken ? parsed : stripFirebaseDownloadToken(parsed);
    if (useProxy) {
      return applyMediaProxy(normalized).toString();
    }
    return normalized.toString();
  } catch {
    return normalizedInput;
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

function extractObjectPathFromFirebaseUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/o\/(.+)$/);
    if (!match?.[1]) {
      return null;
    }
    return decodeURIComponent(match[1]);
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

/** Profil avatar — token, tokensız, proxy ve public URL fallback zinciri. */
export function listAvatarDisplayCandidateUrls(
  url: string | undefined | null
): string[] {
  const normalized = normalizeFirebaseStorageUrl(url?.trim() ?? "");
  if (!normalized) {
    return [];
  }

  const seen = new Set<string>();
  const candidates: string[] = [];

  pushUnique(seen, candidates, resolvePosterDisplayUrl(normalized));
  pushUnique(
    seen,
    candidates,
    resolveMediaUrl(normalized, { useProxy: false, keepToken: false })
  );
  pushUnique(
    seen,
    candidates,
    resolveMediaUrl(normalized, { useProxy: true, keepToken: false })
  );
  pushUnique(
    seen,
    candidates,
    resolveMediaUrl(normalized, { useProxy: true, keepToken: true })
  );

  const bucket = extractBucketFromFirebaseUrl(normalized);
  const objectPath = extractObjectPathFromFirebaseUrl(normalized);
  if (bucket && objectPath) {
    const publicUrl = buildPublicFirebaseMediaUrl(bucket, objectPath);
    pushUnique(seen, candidates, publicUrl);
    pushUnique(
      seen,
      candidates,
      resolveMediaUrl(publicUrl, { useProxy: true, keepToken: false })
    );
  }

  return candidates;
}

/** Feed/reels poster: önce posterURL, yoksa mediaURL'den türet. */
export function resolveVideoPosterUrl(
  post: Pick<Post, "posterURL" | "mediaURL">
): string | undefined {
  const candidates = listVideoPosterCandidateUrls(post);
  return candidates[0];
}

/** Poster yükleme hatasında denenecek URL listesi (sıralı). */
export function listVideoPosterCandidateUrls(
  post: Pick<Post, "posterURL" | "mediaURL">
): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];

  const pushPosterVariants = (raw?: string | null) => {
    const normalized = normalizeFirebaseStorageUrl(raw?.trim() ?? "");
    if (!normalized) {
      return;
    }

    pushUnique(seen, candidates, resolvePosterDisplayUrl(normalized));
    pushUnique(seen, candidates, resolveMediaDisplayUrl(normalized));
    pushUnique(
      seen,
      candidates,
      resolveMediaUrl(normalized, { useProxy: false, keepToken: false })
    );
    pushUnique(
      seen,
      candidates,
      resolveMediaUrl(normalized, { useProxy: true, keepToken: true })
    );

    const bucket = extractBucketFromFirebaseUrl(normalized);
    const objectPath = extractObjectPathFromFirebaseUrl(normalized);
    if (bucket && objectPath) {
      const publicUrl = buildPublicFirebaseMediaUrl(bucket, objectPath);
      pushUnique(seen, candidates, publicUrl);
      pushUnique(
        seen,
        candidates,
        resolveMediaUrl(publicUrl, { useProxy: true, keepToken: false })
      );
    }
  };

  pushPosterVariants(post.posterURL);
  pushUnique(seen, candidates, derivePosterUrlFromMediaUrl(post.mediaURL));

  const normalizedMedia = normalizeFirebaseStorageUrl(post.mediaURL);
  if (normalizedMedia && normalizedMedia !== post.mediaURL?.trim()) {
    pushUnique(seen, candidates, derivePosterUrlFromMediaUrl(normalizedMedia));
  }

  const derived = derivePosterUrlFromMediaUrl(post.mediaURL);
  pushUnique(seen, candidates, resolveMediaDisplayUrl(derived));
  pushUnique(
    seen,
    candidates,
    resolveMediaUrl(derived, { useProxy: true, keepToken: false })
  );

  return candidates;
}

function pushUnique(seen: Set<string>, candidates: string[], value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || seen.has(trimmed)) {
    return;
  }
  seen.add(trimmed);
  candidates.push(trimmed);
}
