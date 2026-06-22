import { create } from "zustand";
import type { Post } from "../types";
import type { HomeContentFilter } from "../utils/filterPostsByContentType";
import {
  type ReelsPlaylistSource,
  useReelsNavigationStore,
} from "./useReelsNavigationStore";

export type HomeFeedContentFilter = HomeContentFilter | null;

type HomeFeedContentState = {
  contentFilter: HomeFeedContentFilter;
  setContentFilter: (filter: HomeFeedContentFilter) => void;
};

export const useHomeFeedContentStore = create<HomeFeedContentState>((set) => ({
  contentFilter: null,
  setContentFilter: (contentFilter) => set({ contentFilter }),
}));

export function openHomeVideoReels(
  postId: string,
  seedPosts?: Post[],
  options?: {
    source?: ReelsPlaylistSource;
    authorId?: string;
  }
): void {
  useReelsNavigationStore.getState().setNavigation(postId, seedPosts, options);
  useHomeFeedContentStore.getState().setContentFilter("video");
}
