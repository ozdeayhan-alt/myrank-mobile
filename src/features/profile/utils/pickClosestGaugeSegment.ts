import { GLOBAL_RANKING_SEGMENT } from "@/features/filters/constants";
import type { CategoryRanking, ProfileRankingKey } from "../api/fetchProfileRankings";
import type { RankingLadderResult } from "../api/fetchRankingLadder";
import {
  computeRemainingPointsDown,
  computeRemainingPointsUp,
  pickActiveAheadRungByOfficialRank,
  pickActiveBehindRungByOfficialRank,
  type GaugeDirection,
} from "../components/profileTotalScoreGaugeGeometry";
import { buildSegmentKey, EMPTY_METADATA, type UserMetadata } from "../types";

function buildCategorySegmentKey(
  metadata: UserMetadata,
  field: keyof UserMetadata
): string {
  const partial = { ...EMPTY_METADATA, [field]: metadata[field] };
  return buildSegmentKey(partial);
}

const CATEGORY_PRIORITY: Record<ProfileRankingKey, number> = {
  profession: 0,
  city: 1,
  age: 2,
  gender: 3,
  maritalStatus: 4,
  country: 5,
  global: 6,
};

export type GaugeSegmentCandidate = {
  key: ProfileRankingKey;
  segmentKey: string;
  officialRank: number;
  ladder: RankingLadderResult;
  remainingUp: number;
  remainingDown: number;
  targetRankUp: number | null;
  targetRankDown: number | null;
  hasUpTarget: boolean;
  hasDownTarget: boolean;
};

export function segmentKeyForGaugeRanking(
  key: ProfileRankingKey,
  metadata: UserMetadata
): string {
  if (key === "global") {
    return GLOBAL_RANKING_SEGMENT;
  }
  return buildCategorySegmentKey(metadata, key);
}

/** Gauge adayları: resmi sırası olan tüm kategoriler + global */
export function listGaugeEligibleRankings(
  rankings: CategoryRanking[]
): Array<CategoryRanking & { rank: number }> {
  return rankings.filter(
    (item): item is CategoryRanking & { rank: number } =>
      item.rank !== null && item.rank > 0
  );
}

export function buildGaugeSegmentCandidate(
  ranking: CategoryRanking & { rank: number },
  metadata: UserMetadata,
  ladder: RankingLadderResult,
  displayScore: number
): GaugeSegmentCandidate {
  const officialRank = ladder.myRank ?? ranking.rank;
  const ahead = pickActiveAheadRungByOfficialRank(
    ladder.aheadRungs,
    displayScore,
    officialRank
  );
  const behind = pickActiveBehindRungByOfficialRank(
    ladder.behindRungs,
    displayScore,
    officialRank
  );

  return {
    key: ranking.key,
    segmentKey: segmentKeyForGaugeRanking(ranking.key, metadata),
    officialRank: ranking.rank,
    ladder,
    hasUpTarget: ahead !== null,
    remainingUp: ahead
      ? computeRemainingPointsUp(displayScore, ahead.totalScore)
      : Number.POSITIVE_INFINITY,
    targetRankUp: ahead?.rank ?? null,
    hasDownTarget: behind !== null,
    remainingDown: behind
      ? computeRemainingPointsDown(displayScore, behind.totalScore)
      : Number.POSITIVE_INFINITY,
    targetRankDown: behind?.rank ?? null,
  };
}

function compareCandidates(
  a: GaugeSegmentCandidate,
  b: GaugeSegmentCandidate,
  direction: GaugeDirection
): number {
  const remA = direction === "up" ? a.remainingUp : a.remainingDown;
  const remB = direction === "up" ? b.remainingUp : b.remainingDown;
  if (remA !== remB) {
    return remA - remB;
  }
  return CATEGORY_PRIORITY[a.key] - CATEGORY_PRIORITY[b.key];
}

/** En az kalan puana sahip segment (B stratejisi). */
export function pickClosestGaugeSegment(
  candidates: GaugeSegmentCandidate[],
  direction: GaugeDirection
): GaugeSegmentCandidate | null {
  let pool = candidates.filter((c) =>
    direction === "up" ? c.hasUpTarget : c.hasDownTarget
  );
  if (pool.length === 0 && direction === "up") {
    pool = candidates.filter((c) => c.officialRank > 1);
  }
  const withRemaining = pool.filter((c) =>
    direction === "up" ? c.remainingUp > 0 : c.remainingDown > 0
  );
  if (withRemaining.length > 0) {
    pool = withRemaining;
  }
  if (pool.length === 0) {
    return null;
  }
  return [...pool].sort((a, b) => compareCandidates(a, b, direction))[0] ?? null;
}

export function isGaugeAtPinnacle(
  globalRank: number | null,
  direction: GaugeDirection,
  selected: GaugeSegmentCandidate | null
): boolean {
  return (
    direction === "up" &&
    globalRank === 1 &&
    (selected === null || !selected.hasUpTarget)
  );
}

/** Aşağı: genel listede de düşülecek hedef kalmadıysa (gerçek dip). */
export function isGaugeAtGlobalLast(
  direction: GaugeDirection,
  selected: GaugeSegmentCandidate | null,
  globalCandidate: GaugeSegmentCandidate | null
): boolean {
  return (
    direction === "down" &&
    (selected === null || !selected.hasDownTarget) &&
    globalCandidate !== null &&
    !globalCandidate.hasDownTarget
  );
}
