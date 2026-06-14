import { create } from "zustand";

type FeedRefreshState = {
  version: number;
  bump: () => void;
};

export const useFeedRefreshStore = create<FeedRefreshState>((set) => ({
  version: 0,
  bump: () => set((state) => ({ version: state.version + 1 })),
}));
