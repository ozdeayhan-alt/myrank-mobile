import { create } from "zustand";
import type { HomeContentFilter } from "../utils/filterPostsByContentType";

export type HomeFeedContentFilter = HomeContentFilter | null;

type HomeFeedContentState = {
  contentFilter: HomeFeedContentFilter;
  setContentFilter: (filter: HomeFeedContentFilter) => void;
};

export const useHomeFeedContentStore = create<HomeFeedContentState>((set) => ({
  contentFilter: null,
  setContentFilter: (contentFilter) => set({ contentFilter }),
}));
