import type { CategoryRanking } from "../api/fetchProfileRankings";
import type { ProfileRankingKey } from "../api/fetchProfileRankings";
import type { TopRanking } from "../types/achievement";
import type { UserMetadata } from "../types";
import { formatAchievementBadgeLabel } from "./formatAchievementBadgeLabel";

const CATEGORY_PRIORITY: Record<ProfileRankingKey, number> = {
  profession: 0,
  city: 1,
  age: 2,
  gender: 3,
  maritalStatus: 4,
  country: 5,
  global: 6,
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

export function pickTopRanking(
  rankings: CategoryRanking[],
  metadata: UserMetadata
): TopRanking | null {
  const valid = rankings.filter(
    (item): item is CategoryRanking & { rank: number } =>
      item.rank !== null && item.rank > 0
  );

  if (valid.length === 0) {
    return null;
  }

  const official = valid.filter((item) => item.isOfficial);
  const pool = official.length > 0 ? official : valid;
  const best = [...pool].sort(compareRankings)[0];

  if (!best?.rank) {
    return null;
  }

  return {
    rank: best.rank,
    label: formatAchievementBadgeLabel(best.key, metadata, best.rank),
  };
}
