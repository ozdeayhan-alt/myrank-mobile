import { router } from "expo-router";
import type { UserMetadata } from "@/features/profile/types";
import type { Post } from "@/features/posts/types";
import type { ReelsPlaylistSource } from "@/features/posts/store/useReelsNavigationStore";
import { useHomeFeedContentStore } from "@/features/posts/store/useHomeFeedContentStore";
import { useReelsNavigationStore } from "@/features/posts/store/useReelsNavigationStore";
import { ensureVideoInPlaylist } from "@/features/posts/utils/videoPosts";
import { useFlowSessionStore } from "./FlowSession";

export type OpenFlowOptions = {
  source?: ReelsPlaylistSource;
  authorId?: string;
  exploreFilters?: UserMetadata | null;
  navigateHome?: boolean;
};

/** Unified Flow entry — poster tap or Flow chip. */
export function openFlow(
  postId: string | null,
  seedPosts: Post[] = [],
  anchorPost?: Post | null,
  options?: OpenFlowOptions
): void {
  const playlist = postId
    ? ensureVideoInPlaylist(postId, seedPosts, anchorPost)
    : seedPosts;

  useFlowSessionStore.getState().openFlow(postId, playlist, options);

  // Legacy stores — kept in sync until full migration.
  if (postId) {
    useReelsNavigationStore.getState().setNavigation(postId, playlist, options);
  }
  useHomeFeedContentStore.getState().setContentFilter("video");

  if (options?.navigateHome !== false) {
    router.navigate("/(tabs)/");
  }
}

export function closeFlow(): void {
  useFlowSessionStore.getState().closeFlow();
  useReelsNavigationStore.getState().clearNavigation();
  useHomeFeedContentStore.getState().setContentFilter(null);
}

/** @deprecated Use openFlow */
export function navigateToReelsV2(
  postId: string,
  seedPosts?: Post[],
  anchorPost?: Post | null,
  options?: OpenFlowOptions
): void {
  openFlow(postId, seedPosts ?? [], anchorPost, options);
}
