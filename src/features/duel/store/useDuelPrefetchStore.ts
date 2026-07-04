import { create } from "zustand";
import { fetchDuelMatch } from "../api/fetchDuelMatch";
import { prefetchDuelMatchImages } from "../lib/prefetchDuelMatch";
import type { DuelMatch } from "../types";

type DuelPrefetchState = {
  readyMatch: DuelMatch | null;
  isFetching: boolean;
  lastError: string | null;
  recentMatchIds: string[];
  prefetch: (excludeIds?: string[]) => Promise<DuelMatch | null>;
  consumeReady: () => DuelMatch | null;
  setReady: (match: DuelMatch) => void;
  reset: () => void;
};

function rememberMatchIds(existing: string[], match: DuelMatch): string[] {
  const next = [match.postA.id, match.postB.id, ...existing];
  return [...new Set(next)].slice(0, 12);
}

export const useDuelPrefetchStore = create<DuelPrefetchState>((set, get) => ({
  readyMatch: null,
  isFetching: false,
  lastError: null,
  recentMatchIds: [],

  setReady: (match) => {
    prefetchDuelMatchImages(match);
    set({
      readyMatch: match,
      recentMatchIds: rememberMatchIds(get().recentMatchIds, match),
    });
  },

  prefetch: async (excludeIds = []) => {
    const state = get();
    if (state.isFetching) {
      return state.readyMatch;
    }

    const mergedExclude = [
      ...new Set([...excludeIds, ...state.recentMatchIds]),
    ];

    set({ isFetching: true, lastError: null });

    try {
      const match = await fetchDuelMatch(mergedExclude);
      prefetchDuelMatchImages(match);
      set({
        readyMatch: match,
        isFetching: false,
        recentMatchIds: rememberMatchIds(get().recentMatchIds, match),
      });
      return match;
    } catch (err) {
      set({
        isFetching: false,
        lastError: err instanceof Error ? err.message : "Prefetch failed",
      });
      return null;
    }
  },

  consumeReady: () => {
    const match = get().readyMatch;
    if (!match) {
      return null;
    }
    set({ readyMatch: null });
    void get().prefetch([match.postA.id, match.postB.id]);
    return match;
  },

  reset: () => {
    set({
      readyMatch: null,
      isFetching: false,
      lastError: null,
      recentMatchIds: [],
    });
  },
}));
