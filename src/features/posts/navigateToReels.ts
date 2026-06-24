import { router } from "expo-router";
import type { UserMetadata } from "@/features/profile/types";
import type { Post } from "./types";
import type { ReelsPlaylistSource } from "./store/useReelsNavigationStore";
import { openHomeVideoReels } from "./store/useHomeFeedContentStore";
import { ensureVideoInPlaylist } from "./utils/videoPosts";

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
  const playlist = ensureVideoInPlaylist(postId, seedPosts ?? [], anchorPost);
  openHomeVideoReels(postId, playlist, options);
  router.navigate("/(tabs)/");
}
