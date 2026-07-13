import { create } from "zustand";
import { fetchDuelMatch } from "../api/fetchDuelMatch";
import { prefetchDuelMatchImages } from "../lib/prefetchDuelMatch";
import type { DuelMatch } from "../types";

const MAX_RECENT_POST_IDS = 24;
const MAX_RECENT_MATCH_IDS = 12;

type DuelPrefetchState = {
  cardMatches: Record<string, DuelMatch>;
  cardFetching: Record<string, boolean>;
  sessionReadyMatch: DuelMatch | null;
  sessionFetching: boolean;
  recentPostIds: string[];
  recentMatchIds: string[];
  collectExcludeIds: (exceptCardKey?: string) => string[];
  prefetchForCard: (cardKey: string) => Promise<DuelMatch | null>;
  getMatchForCard: (cardKey: string) => DuelMatch | null;
  isCardFetching: (cardKey: string) => boolean;
  consumeCardMatch: (cardKey: string) => DuelMatch | null;
  prefetchSessionMatch: (excludeIds?: string[]) => Promise<DuelMatch | null>;
  consumeSessionReady: () => DuelMatch | null;
  setSessionReady: (match: DuelMatch) => void;
  reset: () => void;
};

function rememberMatch(
  recentPostIds: string[],
  recentMatchIds: string[],
  match: DuelMatch
): { recentPostIds: string[]; recentMatchIds: string[] } {
  const nextPostIds = [
    match.postA.id,
    match.postB.id,
    ...recentPostIds,
  ].slice(0, MAX_RECENT_POST_IDS);
  const uniquePostIds = [...new Set(nextPostIds)];

  const nextMatchIds = [match.matchId, ...recentMatchIds].slice(
    0,
    MAX_RECENT_MATCH_IDS
  );
  const uniqueMatchIds = [...new Set(nextMatchIds)];

  return {
    recentPostIds: uniquePostIds,
    recentMatchIds: uniqueMatchIds,
  };
}

function collectExcludeIdsFromState(
  state: Pick<DuelPrefetchState, "cardMatches" | "recentPostIds">,
  exceptCardKey?: string
): string[] {
  const fromCards = Object.entries(state.cardMatches)
    .filter(([key]) => key !== exceptCardKey)
    .flatMap(([, match]) => [match.postA.id, match.postB.id]);

  return [...new Set([...fromCards, ...state.recentPostIds])];
}

let prefetchChain: Promise<unknown> = Promise.resolve();

function enqueuePrefetch<T>(task: () => Promise<T>): Promise<T> {
  const next = prefetchChain.then(task, task);
  prefetchChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export const useDuelPrefetchStore = create<DuelPrefetchState>((set, get) => ({
  cardMatches: {},
  cardFetching: {},
  sessionReadyMatch: null,
  sessionFetching: false,
  recentPostIds: [],
  recentMatchIds: [],

  collectExcludeIds: (exceptCardKey) =>
    collectExcludeIdsFromState(get(), exceptCardKey),

  prefetchForCard: async (cardKey) => {
    const state = get();
    const existing = state.cardMatches[cardKey];
    if (existing) {
      return existing;
    }
    if (state.cardFetching[cardKey]) {
      return null;
    }

    return enqueuePrefetch(async () => {
      const latest = get();
      if (latest.cardMatches[cardKey]) {
        return latest.cardMatches[cardKey];
      }

      set({
        cardFetching: { ...get().cardFetching, [cardKey]: true },
      });

      try {
        const excludeIds = collectExcludeIdsFromState(get(), cardKey);
        const match = await fetchDuelMatch(excludeIds);
        prefetchDuelMatchImages(match);

        const remembered = rememberMatch(
          get().recentPostIds,
          get().recentMatchIds,
          match
        );

        set((current) => ({
          cardMatches: { ...current.cardMatches, [cardKey]: match },
          cardFetching: { ...current.cardFetching, [cardKey]: false },
          recentPostIds: remembered.recentPostIds,
          recentMatchIds: remembered.recentMatchIds,
        }));

        return match;
      } catch {
        set((current) => ({
          cardFetching: { ...current.cardFetching, [cardKey]: false },
        }));
        return null;
      }
    });
  },

  getMatchForCard: (cardKey) => get().cardMatches[cardKey] ?? null,

  isCardFetching: (cardKey) => Boolean(get().cardFetching[cardKey]),

  consumeCardMatch: (cardKey) => {
    const match = get().cardMatches[cardKey];
    if (!match) {
      return null;
    }

    const remembered = rememberMatch(
      get().recentPostIds,
      get().recentMatchIds,
      match
    );

    set((current) => {
      const { [cardKey]: _removed, ...restMatches } = current.cardMatches;
      return {
        cardMatches: restMatches,
        recentPostIds: remembered.recentPostIds,
        recentMatchIds: remembered.recentMatchIds,
      };
    });

    return match;
  },

  prefetchSessionMatch: async (excludeIds = []) => {
    return enqueuePrefetch(async () => {
      const state = get();
      if (state.sessionReadyMatch) {
        return state.sessionReadyMatch;
      }

      set({ sessionFetching: true });

      try {
        const mergedExclude = [
          ...new Set([
            ...excludeIds,
            ...collectExcludeIdsFromState(state),
            ...state.recentPostIds,
          ]),
        ];

        const match = await fetchDuelMatch(mergedExclude);
        prefetchDuelMatchImages(match);

        const remembered = rememberMatch(
          get().recentPostIds,
          get().recentMatchIds,
          match
        );

        set({
          sessionReadyMatch: match,
          sessionFetching: false,
          recentPostIds: remembered.recentPostIds,
          recentMatchIds: remembered.recentMatchIds,
        });

        return match;
      } catch {
        set({ sessionFetching: false });
        return null;
      }
    });
  },

  consumeSessionReady: () => {
    const match = get().sessionReadyMatch;
    if (!match) {
      return null;
    }

    set({ sessionReadyMatch: null });
    void get().prefetchSessionMatch([match.postA.id, match.postB.id]);
    return match;
  },

  setSessionReady: (match) => {
    prefetchDuelMatchImages(match);
    const remembered = rememberMatch(
      get().recentPostIds,
      get().recentMatchIds,
      match
    );
    set({
      sessionReadyMatch: match,
      recentPostIds: remembered.recentPostIds,
      recentMatchIds: remembered.recentMatchIds,
    });
  },

  reset: () => {
    set({
      cardMatches: {},
      cardFetching: {},
      sessionReadyMatch: null,
      sessionFetching: false,
      recentPostIds: [],
      recentMatchIds: [],
    });
  },
}));
