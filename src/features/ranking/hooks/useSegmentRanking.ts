import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFilterSegmentLabel } from "@/features/filters/utils/segmentLabel";
import type { UserMetadata } from "@/features/profile/types";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import {
  fetchRankingEntries,
  RANKING_LIST_MAX,
} from "../api/fetchRankingEntries";

export const segmentRankingQueryKey = (filters: UserMetadata | null) =>
  ["ranking", "segment", getFilterSegmentLabel(filters)] as const;

async function fetchSegmentRanking(filters: UserMetadata | null) {
  return fetchRankingEntries(filters, RANKING_LIST_MAX);
}

export function useSegmentRanking(filters: UserMetadata | null) {
  const segmentKey = getFilterSegmentLabel(filters);

  const query = useQuery({
    queryKey: segmentRankingQueryKey(filters),
    queryFn: () => fetchSegmentRanking(filters),
    staleTime: 60_000,
  });

  const error = useMemo(
    () => (query.error ? getUserFacingErrorMessage(query.error) : null),
    [query.error]
  );

  return {
    entries: query.data ?? [],
    loading: query.isLoading && query.data === undefined,
    isRefetching: query.isRefetching,
    error,
    segmentKey,
    refresh: query.refetch,
  };
}
