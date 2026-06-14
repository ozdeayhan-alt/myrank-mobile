const FIREBASE_STORAGE_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
]);

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

/**
 * Geçersiz download token'lı Firebase URL'lerinde public Storage kuralları devreye girsin.
 * EXPO_PUBLIC_MEDIA_PROXY_ORIGIN tanımlıysa medya same-origin CDN proxy üzerinden servis edilir.
 */
export function resolveMediaDisplayUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = stripFirebaseDownloadToken(new URL(trimmed));
    return applyMediaProxy(parsed).toString();
  } catch {
    return trimmed;
  }
}
