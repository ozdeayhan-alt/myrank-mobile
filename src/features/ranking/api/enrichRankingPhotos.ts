import { getPublicProfile } from "@/features/profile/api/getPublicProfile";
import type { RankingEntry } from "../types";

/** İlk ekranda görünen satırlar — kalanları harf avatarı ile göster. */
const PHOTO_ENRICHMENT_LIMIT = 15;
const PHOTO_ENRICHMENT_BATCH = 5;

export async function enrichRankingPhotos(
  entries: RankingEntry[]
): Promise<RankingEntry[]> {
  if (entries.length === 0) return entries;

  const needsEnrichment = entries
    .filter((entry) => !entry.photoURL?.trim())
    .slice(0, PHOTO_ENRICHMENT_LIMIT);
  if (needsEnrichment.length === 0) return entries;

  const enrichedById = new Map<string, RankingEntry>();

  for (let i = 0; i < needsEnrichment.length; i += PHOTO_ENRICHMENT_BATCH) {
    const batch = needsEnrichment.slice(i, i + PHOTO_ENRICHMENT_BATCH);
    await Promise.all(
      batch.map(async (entry) => {
        try {
          const profile = await getPublicProfile(entry.userId);
          const photoURL = profile?.photoURL?.trim();
          if (!photoURL) return;
          enrichedById.set(entry.userId, { ...entry, photoURL });
        } catch {
          // keep original entry
        }
      })
    );
  }

  return entries.map((entry) => enrichedById.get(entry.userId) ?? entry);
}
