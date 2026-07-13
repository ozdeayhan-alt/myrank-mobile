import type { ProfileRankingKey } from "@/features/profile/api/fetchProfileRankings";
import { EMPTY_METADATA, type UserMetadata } from "@/features/profile/types";

/** Tam metadata segmenti — MyRank Sıran badge. */
export function buildRankingFiltersForFullSegment(
  metadata: UserMetadata
): UserMetadata {
  return { ...metadata };
}

/** En iyi kategori badge — tek alanlı segment filtresi. */
export function buildRankingFiltersForCategory(
  key: ProfileRankingKey,
  metadata: UserMetadata
): UserMetadata | null {
  if (key === "global") {
    return null;
  }
  return { ...EMPTY_METADATA, [key]: metadata[key] };
}
