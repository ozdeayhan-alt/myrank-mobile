import { useQuery } from "@tanstack/react-query";
import { fetchProfileRankings } from "@/features/profile/api/fetchProfileRankings";
import { profileRankingsQueryKey } from "@/features/profile/hooks/useProfileRankings";
import { EMPTY_METADATA } from "@/features/profile/types";
import { pickTopRanking } from "@/features/profile/utils/pickTopRanking";
import type { Post } from "@/features/posts/types";
import { useMemo } from "react";
import { formatTopRankingShort } from "../lib/formatDuelTopRankingShort";

export function useDuelAuthorTopRanking(
  post: Post | null,
  enabled: boolean
): string | null {
  const metadata = post?.metadata ?? EMPTY_METADATA;
  const authorId = post?.authorId ?? "";

  const query = useQuery({
    queryKey: profileRankingsQueryKey(authorId, metadata),
    queryFn: () => fetchProfileRankings(authorId, metadata),
    enabled: enabled && authorId.length > 0,
    staleTime: 60_000,
  });

  return useMemo(() => {
    const top = pickTopRanking(query.data ?? [], metadata);
    if (!top) {
      return null;
    }
    return formatTopRankingShort(top, metadata);
  }, [metadata, query.data]);
}
