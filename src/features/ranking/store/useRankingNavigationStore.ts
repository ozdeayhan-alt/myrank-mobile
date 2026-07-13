import { create } from "zustand";
import type { UserMetadata } from "@/features/profile/types";

type RankingNavigationIntent = {
  filters: UserMetadata | null;
  scrollToUserId: string;
};

type RankingNavigationState = {
  intent: RankingNavigationIntent | null;
  setIntent: (intent: RankingNavigationIntent) => void;
  consumeIntent: () => RankingNavigationIntent | null;
};

export const useRankingNavigationStore = create<RankingNavigationState>(
  (set, get) => ({
    intent: null,
    setIntent: (intent) => set({ intent }),
    consumeIntent: () => {
      const current = get().intent;
      if (!current) {
        return null;
      }
      set({ intent: null });
      return current;
    },
  })
);
