import { normalizeFirebaseStorageUrl } from "@/lib/media/normalizeAvatarUrl";

const FIREBASE_STORAGE_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
]);

export type ResolveMediaDisplayUrlOptions = {
  /** Poster/görsel için true (varsayılan). */
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
 * Poster — token korunur, proxy kapalı (Firebase path encoding).
 */
export function resolvePosterDisplayUrl(
  url: string | undefined
): string | undefined {
  return resolveMediaUrl(url, { useProxy: false, keepToken: true });
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

function pushUnique(seen: Set<string>, candidates: string[], value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || seen.has(trimmed)) {
    return;
  }
  seen.add(trimmed);
  candidates.push(trimmed);
}
