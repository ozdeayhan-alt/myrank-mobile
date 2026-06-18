import { router } from "expo-router";
import type { Post } from "./types";
import { openHomeVideoReels } from "./store/useHomeFeedContentStore";

export function navigateToReels(postId: string, seedPosts?: Post[]): void {
  openHomeVideoReels(postId, seedPosts);
  router.push("/(tabs)/");
}
