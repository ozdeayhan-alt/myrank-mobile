import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GLOBAL_RANKING_SEGMENT } from "@/features/filters/constants";
import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";
import type { RankingLadderResult } from "../api/fetchRankingLadder";
import {
  fetchRankingLadderFull,
  GAUGE_LADDER_MAX_RUNGS,
} from "../api/fetchRankingLadder";
import type { ProfileRankingKey } from "../api/fetchProfileRankings";
import { useProfileRankings } from "./useProfileRankings";
import { useProfileSummaryStatus } from "./useProfileSummary";
import { EMPTY_METADATA, type UserMetadata } from "../types";
import {
  buildGaugeSegmentCandidate,
  isGaugeAtGlobalLast,
  isGaugeAtPinnacle,
} from "../utils/pickClosestGaugeSegment";
import type { GaugeDirection } from "../components/profileTotalScoreGaugeGeometry";
import {
  computeSlidingLadderAnchor,
  isAheadLadderWindowExhausted,
} from "../utils/gaugeLadderWindow";

export const rankingLadderSnapshotQueryKey = (
  userId: string,
  segmentKey: string
) => ["profile", "rankingLadderSnapshot", userId, segmentKey] as const;

export const rankingLadderFullQueryKey = (
  userId: string,
  segmentKey: string,
  maxRungs?: number | null,
  anchorRank?: number | null
) =>
  [
    "profile",
    "rankingLadderFull",
    "v16-lazy",
    userId,
    segmentKey,
    maxRungs ?? "default",
    anchorRank ?? "default",
  ] as const;

/** Gece rebuild'e kadar segment entry donuk; profil ziyaretinde bir kez yeter. */
const LADDER_STALE_MS = 30 * 60_000;

export type GaugeLabelCategory = {
  key: ProfileRankingKey;
  rank: number;
};

type UseRankingLadderOptions = {
  rankingsReady?: boolean;
  displayScore?: number;
  gaugeVoteMode?: GaugeVoteMode;
  /** false: ince snapshot; true: tam 12 basamak (ilk oy veya kendi profil) */
  fullLadderEnabled?: boolean;
};

function resolveDirection(gaugeVoteMode: GaugeVoteMode): GaugeDirection {
  return gaugeVoteMode === "down" ? "down" : "up";
}

function readThinLadderFallback(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string
): RankingLadderResult | undefined {
  return queryClient.getQueryData<RankingLadderResult>(
    rankingLadderSnapshotQueryKey(userId, GLOBAL_RANKING_SEGMENT)
  );
}

export function useRankingLadder(
  userId: string | undefined,
  metadata: UserMetadata = EMPTY_METADATA,
  options: UseRankingLadderOptions = {}
) {
  const {
    rankingsReady = false,
    displayScore = 0,
    gaugeVoteMode = null,
    fullLadderEnabled = false,
  } = options;

  const queryClient = useQueryClient();
  const direction = resolveDirection(gaugeVoteMode);
  const summaryStatus = useProfileSummaryStatus(userId);

  const { rankings, loading: rankingsLoading } = useProfileRankings(
    userId,
    metadata,
    Boolean(userId) && rankingsReady
  );

  const globalRanking = useMemo(() => {
    const global = rankings.find((item) => item.key === "global");
    if (global?.rank == null || global.rank <= 0) {
      return null;
    }
    return global as typeof global & { rank: number };
  }, [rankings]);

  const globalRank = globalRanking?.rank ?? null;

  const [slideAnchor, setSlideAnchor] = useState<number | null>(null);

  useEffect(() => {
    setSlideAnchor(null);
  }, [userId, globalRank]);

  const ladderAnchorRank = slideAnchor ?? globalRank;

  const globalLadderQuery = useQuery({
    queryKey: rankingLadderFullQueryKey(
      userId ?? "",
      GLOBAL_RANKING_SEGMENT,
      GAUGE_LADDER_MAX_RUNGS,
      ladderAnchorRank
    ),
    queryFn: () =>
      fetchRankingLadderFull(
        userId!,
        GLOBAL_RANKING_SEGMENT,
        ladderAnchorRank!,
        GAUGE_LADDER_MAX_RUNGS
      ),
    enabled:
      fullLadderEnabled &&
      Boolean(userId) &&
      rankingsReady &&
      summaryStatus.isFetched &&
      ladderAnchorRank != null,
    staleTime: LADDER_STALE_MS,
    gcTime: LADDER_STALE_MS,
  });

  useEffect(() => {
    if (!fullLadderEnabled || direction !== "up" || ladderAnchorRank == null) {
      return;
    }

    const aheadRungs = globalLadderQuery.data?.aheadRungs;
    if (!aheadRungs?.length) {
      return;
    }

    const nextAnchor = computeSlidingLadderAnchor(
      aheadRungs,
      ladderAnchorRank,
      displayScore
    );
    if (nextAnchor == null) {
      return;
    }

    setSlideAnchor(nextAnchor);
  }, [
    direction,
    ladderAnchorRank,
    displayScore,
    globalLadderQuery.data?.aheadRungs,
    fullLadderEnabled,
  ]);

  const thinSnapshot =
    userId && summaryStatus.isFetched
      ? readThinLadderFallback(queryClient, userId)
      : undefined;

  const displayLadder = useMemo((): RankingLadderResult | undefined => {
    if (fullLadderEnabled && globalLadderQuery.data !== undefined) {
      return globalLadderQuery.data;
    }
    if (thinSnapshot) {
      return thinSnapshot;
    }
    if (fullLadderEnabled && globalLadderQuery.isError) {
      return undefined;
    }
    return undefined;
  }, [
    fullLadderEnabled,
    globalLadderQuery.data,
    globalLadderQuery.isError,
    thinSnapshot,
  ]);

  const laddersReady = useMemo(() => {
    if (!rankingsReady || !summaryStatus.isFetched) {
      return false;
    }
    if (globalRank == null) {
      return !rankingsLoading;
    }
    if (!fullLadderEnabled) {
      return thinSnapshot !== undefined;
    }
    if (globalLadderQuery.data !== undefined) {
      return true;
    }
    if (globalLadderQuery.isError && thinSnapshot !== undefined) {
      return true;
    }
    return thinSnapshot !== undefined;
  }, [
    rankingsReady,
    summaryStatus.isFetched,
    globalRank,
    rankingsLoading,
    fullLadderEnabled,
    globalLadderQuery.data,
    globalLadderQuery.isError,
    thinSnapshot,
  ]);

  const globalCandidate = useMemo(() => {
    if (!globalRanking || !displayLadder) {
      return null;
    }
    return buildGaugeSegmentCandidate(
      globalRanking,
      metadata,
      displayLadder,
      displayScore
    );
  }, [globalRanking, metadata, displayLadder, displayScore]);

  const windowExhausted =
    fullLadderEnabled &&
    direction === "up" &&
    Boolean(displayLadder?.aheadRungs?.length) &&
    isAheadLadderWindowExhausted(displayLadder!.aheadRungs, displayScore);

  const pendingSlide =
    fullLadderEnabled &&
    direction === "up" &&
    windowExhausted &&
    ladderAnchorRank != null &&
    computeSlidingLadderAnchor(
      displayLadder!.aheadRungs,
      ladderAnchorRank,
      displayScore
    ) != null;

  const slidingLadder =
    fullLadderEnabled &&
    direction === "up" &&
    windowExhausted &&
    (pendingSlide ||
      globalLadderQuery.isFetching ||
      globalLadderQuery.isPending);

  const labelLoading =
    rankingsLoading ||
    !summaryStatus.isFetched ||
    !laddersReady ||
    slidingLadder;
  const pointsLoading = !laddersReady || slidingLadder;

  const atPinnacle = useMemo(
    () => isGaugeAtPinnacle(globalRank, direction, globalCandidate),
    [globalRank, direction, globalCandidate]
  );

  const atGlobalLast = useMemo(
    () => isGaugeAtGlobalLast(direction, globalCandidate, globalCandidate),
    [direction, globalCandidate]
  );

  const labelCategory = useMemo((): GaugeLabelCategory | null => {
    if (globalRank == null) {
      return null;
    }
    return {
      key: "global",
      rank: globalRank,
    };
  }, [globalRank]);

  const gaugeOfficialRank = ladderAnchorRank ?? globalRank;

  return {
    snapshotScore: displayLadder?.snapshotScore ?? displayScore,
    myRank: displayLadder?.myRank ?? globalRank,
    gaugeOfficialRank,
    aheadRungs: displayLadder?.aheadRungs ?? [],
    behindRungs: displayLadder?.behindRungs ?? [],
    labelCategory,
    segmentKey: GLOBAL_RANKING_SEGMENT,
    atPinnacle,
    atGlobalLast,
    labelLoading,
    pointsLoading,
    ready: laddersReady,
    ladderFullReady: fullLadderEnabled && globalLadderQuery.data !== undefined,
  };
}
