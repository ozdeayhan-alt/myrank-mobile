export const LEGACY_STORAGE_BUCKET = "myrank-d62b9-storage";

const DEFAULT_STORAGE_BUCKET = "myrankapp-d62b9.firebasestorage.app";

function currentStorageBucket(): string {
  return (
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
    DEFAULT_STORAGE_BUCKET
  );
}

/** Eski bucket adını güncel Firebase Storage bucket ile değiştirir. */
export function normalizeAvatarUrl(url: string | undefined | null): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname !== "firebasestorage.googleapis.com") {
      return trimmed;
    }

    const bucket = currentStorageBucket();
    const legacyPrefix = `/v0/b/${LEGACY_STORAGE_BUCKET}/o/`;
    if (parsed.pathname.startsWith(legacyPrefix)) {
      const objectPath = parsed.pathname.slice(legacyPrefix.length);
      parsed.pathname = `/v0/b/${bucket}/o/${objectPath}`;
      return parsed.toString();
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

/** Avatar, poster, feed medyası — legacy bucket normalizasyonu. */
export function normalizeFirebaseStorageUrl(
  url: string | undefined | null
): string {
  return normalizeAvatarUrl(url);
}

export function isLegacyStoragePhotoUrl(url: string | undefined | null): boolean {
  const trimmed = url?.trim() ?? "";
  return trimmed.includes(LEGACY_STORAGE_BUCKET);
}

export function shouldRefreshAvatarFromProfile(
  url: string | undefined | null
): boolean {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    return true;
  }
  return isLegacyStoragePhotoUrl(trimmed);
}
