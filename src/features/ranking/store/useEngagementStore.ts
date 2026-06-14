import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { EngagementStatus } from "../types";

export const DEFAULT_ENGAGEMENT: EngagementStatus = {
  shared: false,
  saved: false,
  liked: false,
  disliked: false,
  likeBonusPoints: null,
  dislikeBonusPoints: null,
};

type EngagementStore = {
  engagements: Record<string, EngagementStatus>;
  patchEngagement: (postId: string, patch: Partial<EngagementStatus>) => void;
  mergeBatch: (data: Record<string, EngagementStatus>) => void;
  reset: () => void;
};

export const useEngagementStore = create<EngagementStore>((set) => ({
  engagements: {},
  patchEngagement: (postId, patch) =>
    set((state) => ({
      engagements: {
        ...state.engagements,
        [postId]: {
          ...DEFAULT_ENGAGEMENT,
          ...state.engagements[postId],
          ...patch,
        },
      },
    })),
  mergeBatch: (data) =>
    set((state) => {
      const next = { ...state.engagements };
      for (const [postId, engagement] of Object.entries(data)) {
        next[postId] = {
          ...DEFAULT_ENGAGEMENT,
          ...state.engagements[postId],
          ...engagement,
        };
      }
      return { engagements: next };
    }),
  reset: () => set({ engagements: {} }),
}));

export function usePostEngagement(postId: string): EngagementStatus {
  return useEngagementStore(
    useShallow((state) => state.engagements[postId] ?? DEFAULT_ENGAGEMENT)
  );
}
