import { useQuery } from "@tanstack/react-query";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import {
  fetchProfileRankings,
  type CategoryRanking,
} from "../api/fetchProfileRankings";
import { buildSegmentKey, type UserMetadata } from "../types";

export type { CategoryRanking };

export const profileRankingsQueryKey = (
  userId: string,
  metadata: UserMetadata
) => ["profile", "rankings", userId, buildSegmentKey(metadata)] as const;

export function useProfileRankings(
  userId: string | undefined,
  metadata: UserMetadata,
  queryEnabled = true
) {
  const query = useQuery({
    queryKey: profileRankingsQueryKey(userId ?? "", metadata),
    queryFn: () => fetchProfileRankings(userId!, metadata),
    enabled: Boolean(userId) && queryEnabled,
    staleTime: 60_000,
  });

  return {
    rankings: query.data ?? [],
    loading: query.isFetching && query.data === undefined,
    isRefreshing: query.isFetching && query.data !== undefined,
    error: query.error ? getUserFacingErrorMessage(query.error) : null,
    refresh: query.refetch,
  };
}
