import { create } from "zustand";
import type { Post } from "../types";

type ReelsNavigationState = {
  targetPostId: string | null;
  seedPosts: Post[] | null;
  setNavigation: (postId: string, seedPosts?: Post[]) => void;
  clearNavigation: () => void;
};

export const useReelsNavigationStore = create<ReelsNavigationState>((set) => ({
  targetPostId: null,
  seedPosts: null,
  setNavigation: (postId, seedPosts) =>
    set({
      targetPostId: postId,
      seedPosts: seedPosts ?? null,
    }),
  clearNavigation: () =>
    set({
      targetPostId: null,
      seedPosts: null,
    }),
}));
