import { useQuery } from "@tanstack/react-query";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { fetchSavedPosts } from "../api/fetchSavedPosts";

export const savedPostsQueryKey = (userId: string) =>
  ["savedPosts", userId] as const;

export function useSavedPosts(userId: string | undefined) {
  const query = useQuery({
    queryKey: savedPostsQueryKey(userId ?? ""),
    queryFn: () => fetchSavedPosts(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  return {
    posts: query.data ?? [],
    loading: query.isLoading && query.data === undefined,
    error: query.error ? getUserFacingErrorMessage(query.error) : null,
    refresh: query.refetch,
    isRefetching: query.isRefetching,
  };
}
