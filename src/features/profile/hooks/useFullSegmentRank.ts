import { useQuery } from "@tanstack/react-query";
import { fetchFullSegmentRank } from "../api/fetchFullSegmentRank";
import { buildSegmentKey, type UserMetadata } from "../types";

export const fullSegmentRankQueryKey = (
  userId: string,
  metadata: UserMetadata,
  isOwnProfile: boolean
) =>
  [
    "profile",
    "fullSegmentRank",
    userId,
    buildSegmentKey(metadata),
    isOwnProfile,
  ] as const;

export function useFullSegmentRank(
  userId: string | undefined,
  metadata: UserMetadata,
  isOwnProfile: boolean,
  enabled = true
) {
  const query = useQuery({
    queryKey: fullSegmentRankQueryKey(userId ?? "", metadata, isOwnProfile),
    queryFn: () => fetchFullSegmentRank(userId!, metadata, isOwnProfile),
    enabled: Boolean(userId) && enabled,
    staleTime: 60_000,
  });

  return {
    rank: query.data ?? null,
    loading: query.isLoading && query.data === undefined,
    refresh: query.refetch,
  };
}
