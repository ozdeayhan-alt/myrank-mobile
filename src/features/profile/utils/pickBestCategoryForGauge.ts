import type { CategoryRanking } from "../api/fetchProfileRankings";
import type { ProfileRankingKey } from "../api/fetchProfileRankings";
import { buildSegmentKey, EMPTY_METADATA, type UserMetadata } from "../types";

const CATEGORY_PRIORITY: Record<ProfileRankingKey, number> = {
  profession: 0,
  city: 1,
  age: 2,
  gender: 3,
  maritalStatus: 4,
  country: 5,
  global: 6,
};

export type BestCategoryForGauge = {
  key: ProfileRankingKey;
  rank: number;
  segmentKey: string;
};

function compareRankings(a: CategoryRanking, b: CategoryRanking): number {
  const rankA = a.rank ?? Number.POSITIVE_INFINITY;
  const rankB = b.rank ?? Number.POSITIVE_INFINITY;

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  if (a.isOfficial !== b.isOfficial) {
    return a.isOfficial ? -1 : 1;
  }

  return CATEGORY_PRIORITY[a.key] - CATEGORY_PRIORITY[b.key];
}

function buildCategorySegmentKey(
  metadata: UserMetadata,
  field: keyof UserMetadata
): string {
  const partial = { ...EMPTY_METADATA, [field]: metadata[field] };
  return buildSegmentKey(partial);
}

/** En iyi kategori segmenti — gauge Önündeki/Kalan için (global hariç). */
export function pickBestCategoryForGauge(
  rankings: CategoryRanking[],
  metadata: UserMetadata
): BestCategoryForGauge | null {
  const valid = rankings.filter(
    (item): item is CategoryRanking & { rank: number; key: keyof UserMetadata } =>
      item.key !== "global" && item.rank !== null && item.rank > 0
  );

  if (valid.length === 0) {
    return null;
  }

  const official = valid.filter((item) => item.isOfficial);
  const pool = official.length > 0 ? official : valid;

  // Gauge merdiveni için önce önünde hedef olan kategoriler (rank > 1)
  const withRoomAbove = pool.filter((item) => item.rank > 1);
  const candidatePool = withRoomAbove.length > 0 ? withRoomAbove : pool;
  const best = [...candidatePool].sort(compareRankings)[0];

  if (!best?.rank) {
    return null;
  }

  return {
    key: best.key,
    rank: best.rank,
    segmentKey: buildCategorySegmentKey(metadata, best.key),
  };
}
