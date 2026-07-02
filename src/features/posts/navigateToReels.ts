import type { UserMetadata } from "@/features/profile/types";
import type { Post } from "./types";
import type { ReelsPlaylistSource } from "./store/useReelsNavigationStore";
import { openFlow } from "@/features/feed-v2/renderers/flow/FlowNavigator";

export type NavigateToReelsOptions = {
  source?: ReelsPlaylistSource;
  authorId?: string;
  exploreFilters?: UserMetadata | null;
};

export function navigateToReels(
  postId: string,
  seedPosts?: Post[],
  anchorPost?: Post | null,
  options?: NavigateToReelsOptions
): void {
  openFlow(postId, seedPosts ?? [], anchorPost, options);
}
