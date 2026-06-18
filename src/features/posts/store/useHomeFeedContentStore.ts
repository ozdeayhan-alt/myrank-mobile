import { create } from "zustand";
import type { Post } from "../types";
import type { HomeContentFilter } from "../utils/filterPostsByContentType";
import { useReelsNavigationStore } from "./useReelsNavigationStore";

export type HomeFeedContentFilter = HomeContentFilter | null;

type HomeFeedContentState = {
  contentFilter: HomeFeedContentFilter;
  setContentFilter: (filter: HomeFeedContentFilter) => void;
};

export const useHomeFeedContentStore = create<HomeFeedContentState>((set) => ({
  contentFilter: null,
  setContentFilter: (contentFilter) => set({ contentFilter }),
}));

export function openHomeVideoReels(postId: string, seedPosts?: Post[]): void {
  useReelsNavigationStore.getState().setNavigation(postId, seedPosts);
  useHomeFeedContentStore.getState().setContentFilter("video");
}
