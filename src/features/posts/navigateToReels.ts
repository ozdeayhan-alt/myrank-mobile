import { router } from "expo-router";
import type { Post } from "./types";
import { openHomeVideoReels } from "./store/useHomeFeedContentStore";
import { ensureVideoInPlaylist } from "./utils/videoPosts";

export function navigateToReels(
  postId: string,
  seedPosts?: Post[],
  anchorPost?: Post | null
): void {
  const playlist = ensureVideoInPlaylist(postId, seedPosts ?? [], anchorPost);
  openHomeVideoReels(postId, playlist);
  router.navigate("/(tabs)/");
}
