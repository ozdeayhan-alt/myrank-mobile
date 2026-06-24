import { create } from "zustand";
import type { UserMetadata } from "@/features/profile/types";
import type { Post } from "../types";

export type ReelsPlaylistSource = "home" | "explore" | "profile";

type ReelsNavigationState = {
  targetPostId: string | null;
  seedPosts: Post[] | null;
  playlistSource: ReelsPlaylistSource | null;
  authorId: string | null;
  exploreFilters: UserMetadata | null;
  setNavigation: (
    postId: string,
    seedPosts?: Post[],
    options?: {
      source?: ReelsPlaylistSource;
      authorId?: string;
      exploreFilters?: UserMetadata | null;
    }
  ) => void;
  clearScrollTarget: () => void;
  clearNavigation: () => void;
};

export const useReelsNavigationStore = create<ReelsNavigationState>((set) => ({
  targetPostId: null,
  seedPosts: null,
  playlistSource: null,
  authorId: null,
  exploreFilters: null,
  setNavigation: (postId, seedPosts, options) =>
    set({
      targetPostId: postId,
      seedPosts: seedPosts ?? null,
      playlistSource: options?.source ?? "home",
      authorId: options?.authorId ?? null,
      exploreFilters:
        options?.source === "explore" ? (options.exploreFilters ?? null) : null,
    }),
  clearScrollTarget: () => set({ targetPostId: null }),
  clearNavigation: () =>
    set({
      targetPostId: null,
      seedPosts: null,
      playlistSource: null,
      authorId: null,
      exploreFilters: null,
    }),
}));
