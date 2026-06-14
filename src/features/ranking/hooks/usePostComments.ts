import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { fetchPostComments } from "../api/fetchPostComments";
import type { PostComment } from "../types";

export const postCommentsQueryKey = (postId: string) =>
  ["postComments", postId] as const;

export function usePostComments(postId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const activePostId = postId ?? "";

  const query = useQuery({
    queryKey: postCommentsQueryKey(activePostId),
    queryFn: () => fetchPostComments(activePostId),
    enabled: enabled && Boolean(postId),
    staleTime: 30_000,
  });

  const prependComment = useCallback(
    (comment: PostComment) => {
      if (!postId) return;
      queryClient.setQueryData<PostComment[]>(
        postCommentsQueryKey(postId),
        (prev) => [comment, ...(prev ?? []).filter((c) => c.id !== comment.id)]
      );
    },
    [postId, queryClient]
  );

  return {
    comments: query.data ?? [],
    loading: query.isFetching && query.data === undefined,
    error: query.error ? getUserFacingErrorMessage(query.error) : null,
    refresh: query.refetch,
    prependComment,
  };
}
