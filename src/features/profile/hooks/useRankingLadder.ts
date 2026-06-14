import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRankingLadderFull,
  fetchRankingLadderSnapshot,
} from "../api/fetchRankingLadder";

export const rankingLadderSnapshotQueryKey = (userId: string) =>
  ["profile", "rankingLadderSnapshot", userId] as const;

export const rankingLadderFullQueryKey = (userId: string) =>
  ["profile", "rankingLadderFull", "v3", userId] as const;

const FULL_LADDER_DEFER_MS = 800;

type UseRankingLadderOptions = {
  /** Tam merdiven sorgusu — varsayılan: snapshot sonrası kısa gecikme */
  enableFullLadder?: boolean;
};

export function useRankingLadder(
  userId: string | undefined,
  options: UseRankingLadderOptions = {}
) {
  const { enableFullLadder: enableFullLadderProp } = options;
  const [deferredFull, setDeferredFull] = useState(false);

  useEffect(() => {
    if (!userId) {
      setDeferredFull(false);
      return;
    }
    setDeferredFull(false);
    const timer = setTimeout(() => setDeferredFull(true), FULL_LADDER_DEFER_MS);
    return () => clearTimeout(timer);
  }, [userId]);

  const enableFullLadder =
    enableFullLadderProp ?? deferredFull;

  const snapshotQuery = useQuery({
    queryKey: rankingLadderSnapshotQueryKey(userId ?? ""),
    queryFn: () => fetchRankingLadderSnapshot(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  const fullQuery = useQuery({
    queryKey: rankingLadderFullQueryKey(userId ?? ""),
    queryFn: () => fetchRankingLadderFull(userId!),
    enabled: Boolean(userId) && enableFullLadder && snapshotQuery.isSuccess,
    staleTime: 60_000,
  });

  const ladder = fullQuery.data ?? snapshotQuery.data;

  const ready = snapshotQuery.data !== undefined;

  const loading = useMemo(
    () => !ready && (snapshotQuery.isLoading || snapshotQuery.isFetching),
    [ready, snapshotQuery.isLoading, snapshotQuery.isFetching]
  );

  return {
    snapshotScore: ladder?.snapshotScore ?? 0,
    myRank: ladder?.myRank ?? null,
    aheadRungs: ladder?.aheadRungs ?? [],
    behindRungs: ladder?.behindRungs ?? [],
    loading,
    ready,
    requestFullLadder: () => setDeferredFull(true),
  };
}
