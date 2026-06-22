import { create } from "zustand";
import type { Post } from "../types";

export type ReelsPlaylistSource = "discover" | "profile";

type ReelsNavigationState = {
  targetPostId: string | null;
  seedPosts: Post[] | null;
  playlistSource: ReelsPlaylistSource | null;
  authorId: string | null;
  setNavigation: (
    postId: string,
    seedPosts?: Post[],
    options?: {
      source?: ReelsPlaylistSource;
      authorId?: string;
    }
  ) => void;
  clearNavigation: () => void;
};

export const useReelsNavigationStore = create<ReelsNavigationState>((set) => ({
  targetPostId: null,
  seedPosts: null,
  playlistSource: null,
  authorId: null,
  setNavigation: (postId, seedPosts, options) =>
    set({
      targetPostId: postId,
      seedPosts: seedPosts ?? null,
      playlistSource: options?.source ?? "discover",
      authorId: options?.authorId ?? null,
    }),
  clearNavigation: () =>
    set({
      targetPostId: null,
      seedPosts: null,
      playlistSource: null,
      authorId: null,
    }),
}));
