import { create } from "zustand";
import type { UserMetadata } from "@/features/profile/types";
import type { Post } from "@/features/posts/types";
import type { ReelsPlaylistSource } from "@/features/posts/store/useReelsNavigationStore";

export type FlowSession = {
  isOpen: boolean;
  targetPostId: string | null;
  seedPosts: Post[];
  source: ReelsPlaylistSource;
  authorId: string | null;
  exploreFilters: UserMetadata | null;
};

type FlowSessionState = FlowSession & {
  openFlow: (
    targetPostId: string | null,
    seedPosts: Post[],
    options?: {
      source?: ReelsPlaylistSource;
      authorId?: string;
      exploreFilters?: UserMetadata | null;
    }
  ) => void;
  closeFlow: () => void;
  clearScrollTarget: () => void;
};

const initialSession: FlowSession = {
  isOpen: false,
  targetPostId: null,
  seedPosts: [],
  source: "home",
  authorId: null,
  exploreFilters: null,
};

export const useFlowSessionStore = create<FlowSessionState>((set) => ({
  ...initialSession,
  openFlow: (targetPostId, seedPosts, options) =>
    set({
      isOpen: true,
      targetPostId,
      seedPosts,
      source: options?.source ?? "home",
      authorId: options?.authorId ?? null,
      exploreFilters:
        options?.source === "explore"
          ? (options.exploreFilters ?? null)
          : null,
    }),
  closeFlow: () => set({ ...initialSession }),
  clearScrollTarget: () => set({ targetPostId: null }),
}));
