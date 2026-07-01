import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { fetchProfileGaugeBootstrap } from "../api/fetchProfileGaugeBootstrap";
import type { ProfileSummaryResult } from "../api/fetchProfileSummary";
import { EMPTY_METADATA, type UserMetadata } from "../types";
import {
  profileSummaryQueryKey,
  seedProfileGaugeCaches,
} from "./useProfileSummary";

export const profileGaugeBootstrapQueryKey = (
  userId: string,
  feedVersion: number
) => ["profile", "gauge-bootstrap", userId, feedVersion] as const;

export function useProfileGaugeBootstrap(
  userId: string | undefined,
  metadata: UserMetadata,
  enabled = true
) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  return useQuery({
    queryKey: profileGaugeBootstrapQueryKey(userId ?? "", feedVersion),
    queryFn: async () => {
      const bootstrap = await fetchProfileGaugeBootstrap(userId!);
      const seedMetadata = metadata ?? EMPTY_METADATA;

      seedProfileGaugeCaches(
        queryClient,
        userId!,
        seedMetadata,
        bootstrap
      );

      const summarySeed: ProfileSummaryResult = {
        profile: null,
        rankings: bootstrap.rankings,
        ladderSegmentKey: bootstrap.ladderSegmentKey,
        ladderSnapshot: bootstrap.ladderSnapshot,
        ladderSnapshotsBySegmentKey: bootstrap.ladderSnapshotsBySegmentKey,
        postsPage: {
          posts: [],
          cursor: null,
          hasMore: false,
        },
      };

      queryClient.setQueryData(
        profileSummaryQueryKey(userId!, feedVersion),
        summarySeed
      );

      return bootstrap;
    },
    enabled: Boolean(userId) && enabled,
    staleTime: 60_000,
  });
}
