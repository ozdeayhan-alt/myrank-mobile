import { getPublicProfile } from "@/features/profile/api/getPublicProfile";
import {
  isLegacyStoragePhotoUrl,
  normalizeAvatarUrl,
} from "@/lib/media/normalizeAvatarUrl";
import type { RankingEntry } from "../types";

const PHOTO_ENRICHMENT_BATCH = 5;

function resolveEntryPhotoURL(
  entry: RankingEntry,
  profilePhotoURL?: string | null
): string | undefined {
  const normalizedEntryPhoto = normalizeAvatarUrl(entry.photoURL);
  if (normalizedEntryPhoto) {
    return normalizedEntryPhoto;
  }

  const normalizedProfilePhoto = normalizeAvatarUrl(profilePhotoURL);
  if (normalizedProfilePhoto) {
    return normalizedProfilePhoto;
  }

  return undefined;
}

function needsProfilePhotoLookup(entry: RankingEntry): boolean {
  const photoURL = entry.photoURL?.trim() ?? "";
  if (!photoURL) {
    return true;
  }
  return isLegacyStoragePhotoUrl(photoURL);
}

export async function enrichRankingPhotos(
  entries: RankingEntry[]
): Promise<RankingEntry[]> {
  if (entries.length === 0) return entries;

  const enrichedById = new Map<string, RankingEntry>();

  for (let i = 0; i < entries.length; i += PHOTO_ENRICHMENT_BATCH) {
    const batch = entries.slice(i, i + PHOTO_ENRICHMENT_BATCH);
    await Promise.all(
      batch.map(async (entry) => {
        const normalizedOnly = resolveEntryPhotoURL(entry);
        if (normalizedOnly && !needsProfilePhotoLookup(entry)) {
          if (normalizedOnly !== entry.photoURL?.trim()) {
            enrichedById.set(entry.userId, {
              ...entry,
              photoURL: normalizedOnly,
            });
          }
          return;
        }

        try {
          const profile = await getPublicProfile(entry.userId);
          const photoURL = resolveEntryPhotoURL(entry, profile?.photoURL);
          if (!photoURL) {
            return;
          }
          enrichedById.set(entry.userId, { ...entry, photoURL });
        } catch {
          if (normalizedOnly) {
            enrichedById.set(entry.userId, {
              ...entry,
              photoURL: normalizedOnly,
            });
          }
        }
      })
    );
  }

  return entries.map((entry) => enrichedById.get(entry.userId) ?? entry);
}
