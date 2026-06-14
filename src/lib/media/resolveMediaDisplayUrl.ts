const FIREBASE_STORAGE_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
]);

export type ResolveMediaDisplayUrlOptions = {
  /** Poster/görsel için true (varsayılan). Video stream (MP4/HLS) için false. */
  useProxy?: boolean;
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

  try {
    const parsed = stripFirebaseDownloadToken(new URL(trimmed));
    if (useProxy) {
      return applyMediaProxy(parsed).toString();
    }
    return parsed.toString();
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
 * MP4 / HLS oynatma ve prefetch — doğrudan Firebase (proxy HLS segmentlerini bozar).
 */
export function resolveVideoStreamUrl(
  url: string | undefined
): string | undefined {
  return resolveMediaUrl(url, { useProxy: false });
}
