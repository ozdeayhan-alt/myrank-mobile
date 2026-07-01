import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import {
  fetchProfileRankings,
  type CategoryRanking,
} from "../api/fetchProfileRankings";
import { buildSegmentKey, type UserMetadata } from "../types";
import { useProfileSummaryStatus } from "./useProfileSummary";

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
  const queryClient = useQueryClient();
  const summaryStatus = useProfileSummaryStatus(userId);
  const queryKey = profileRankingsQueryKey(userId ?? "", metadata);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchProfileRankings(userId!, metadata),
    enabled:
      Boolean(userId) &&
      queryEnabled &&
      summaryStatus.isFetched &&
      summaryStatus.isError,
    staleTime: 60_000,
  });

  const seededRankings = queryClient.getQueryData<CategoryRanking[]>(queryKey);
  const rankings = query.data ?? seededRankings ?? [];

  const loading =
    queryEnabled &&
    Boolean(userId) &&
    (!summaryStatus.isFetched ||
      summaryStatus.isLoading ||
      (summaryStatus.isError &&
        query.isFetching &&
        rankings.length === 0 &&
        query.data === undefined));

  return {
    rankings,
    loading,
    isRefreshing:
      summaryStatus.isFetching ||
      (query.isFetching && query.data !== undefined),
    error: query.error ? getUserFacingErrorMessage(query.error) : null,
    refresh: query.refetch,
  };
}
