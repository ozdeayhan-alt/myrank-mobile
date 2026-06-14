import { AppState, type AppStateStatus } from "react-native";
import { create } from "zustand";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { fetchInteractionSession } from "../api/fetchInteractionSession";
import { VOTE_SESSION_FLUSH_MS } from "../constants";
import type { EngagementStatus, PostCounts } from "../types";
import {
  applyLocalDislikeBonusDelta,
  applyLocalDislikeTap,
  applyLocalLikeBonusDelta,
  applyLocalLikeTap,
  buildVoteLocalState,
  type VoteLocalState,
} from "../voteSessionLogic";

type SyncedVoteState = {
  liked: boolean;
  disliked: boolean;
};

type SessionMeta = {
  authorId: string;
  enabled: boolean;
  onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onAuthorScoreUpdate?: (authorId: string, totalScore: number) => void;
};

type VoteSessionStore = {
  sessions: Record<string, VoteLocalState>;
  synced: Record<string, SyncedVoteState>;
  versions: Record<string, number>;
  ensureSession: (
    postId: string,
    params: {
      authorId: string;
      initialCounts: PostCounts;
      initialPostScore: number;
      initialLikeBonusTotal: number;
      initialDislikeBonusTotal: number;
      initialEngagement: EngagementStatus;
      enabled: boolean;
      onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
      onScoreUpdate?: (postId: string, postScore: number) => void;
      onAuthorScoreUpdate?: (authorId: string, totalScore: number) => void;
    }
  ) => void;
  registerLikeTap: (postId: string) => void;
  registerDislikeTap: (postId: string) => void;
  applyLikeBonusDelta: (postId: string, delta: number) => number;
  applyDislikeBonusDelta: (postId: string, delta: number) => number;
  flushSession: (postId: string) => Promise<void>;
  removeSession: (postId: string) => void;
};

const metaByPostId = new Map<string, SessionMeta>();
const flushTimers = new Map<string, ReturnType<typeof setTimeout>>();
const flushingPosts = new Set<string>();
let appStateListenerAttached = false;

function bumpVersion(postId: string) {
  useVoteSessionStore.setState((state) => ({
    versions: {
      ...state.versions,
      [postId]: (state.versions[postId] ?? 0) + 1,
    },
  }));
}

function scheduleFlush(postId: string) {
  const existing = flushTimers.get(postId);
  if (existing) {
    clearTimeout(existing);
  }

  flushTimers.set(
    postId,
    setTimeout(() => {
      flushTimers.delete(postId);
      void useVoteSessionStore.getState().flushSession(postId);
    }, VOTE_SESSION_FLUSH_MS)
  );
}

function attachAppStateListener() {
  if (appStateListenerAttached) return;
  appStateListenerAttached = true;

  AppState.addEventListener("change", (state: AppStateStatus) => {
    if (state === "background" || state === "inactive") {
      const { sessions, synced, flushSession } =
        useVoteSessionStore.getState();
      for (const postId of Object.keys(sessions)) {
        const local = sessions[postId];
        const syncedState = synced[postId];
        if (
          local &&
          syncedState &&
          (local.liked !== syncedState.liked ||
            local.disliked !== syncedState.disliked)
        ) {
          void flushSession(postId);
        }
      }
    }
  });
}

export const useVoteSessionStore = create<VoteSessionStore>((set, get) => ({
  sessions: {},
  synced: {},
  versions: {},

  ensureSession: (postId, params) => {
    attachAppStateListener();

    metaByPostId.set(postId, {
      authorId: params.authorId,
      enabled: params.enabled,
      onEngagementPatch: params.onEngagementPatch,
      onScoreUpdate: params.onScoreUpdate,
      onAuthorScoreUpdate: params.onAuthorScoreUpdate,
    });

    set((state) => ({
      sessions: {
        ...state.sessions,
        [postId]: buildVoteLocalState({
          liked: params.initialEngagement.liked,
          disliked: params.initialEngagement.disliked,
          counts: params.initialCounts,
          likeBonusTotal: params.initialLikeBonusTotal,
          dislikeBonusTotal: params.initialDislikeBonusTotal,
          postScore: params.initialPostScore,
        }),
      },
      synced: {
        ...state.synced,
        [postId]: {
          liked: params.initialEngagement.liked,
          disliked: params.initialEngagement.disliked,
        },
      },
      versions: {
        ...state.versions,
        [postId]: (state.versions[postId] ?? 0) + 1,
      },
    }));
  },

  registerLikeTap: (postId) => {
    const meta = metaByPostId.get(postId);
    if (!meta?.enabled) return;

    set((state) => {
      const current = state.sessions[postId];
      if (!current) return state;
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [postId]: applyLocalLikeTap(current),
        },
      };
    });
    bumpVersion(postId);
    scheduleFlush(postId);
  },

  registerDislikeTap: (postId) => {
    const meta = metaByPostId.get(postId);
    if (!meta?.enabled) return;

    set((state) => {
      const current = state.sessions[postId];
      if (!current) return state;
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [postId]: applyLocalDislikeTap(current),
        },
      };
    });
    bumpVersion(postId);
    scheduleFlush(postId);
  },

  applyLikeBonusDelta: (postId, delta) => {
    const meta = metaByPostId.get(postId);
    if (!meta?.enabled || delta === 0) {
      return get().sessions[postId]?.postScore ?? 0;
    }

    let nextScore = 0;
    set((state) => {
      const current = state.sessions[postId];
      if (!current) return state;
      const next = applyLocalLikeBonusDelta(current, delta);
      nextScore = next.postScore;
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [postId]: next,
        },
      };
    });
    bumpVersion(postId);
    return nextScore;
  },

  applyDislikeBonusDelta: (postId, delta) => {
    const meta = metaByPostId.get(postId);
    if (!meta?.enabled || delta === 0) {
      return get().sessions[postId]?.postScore ?? 0;
    }

    let nextScore = 0;
    set((state) => {
      const current = state.sessions[postId];
      if (!current) return state;
      const next = applyLocalDislikeBonusDelta(current, delta);
      nextScore = next.postScore;
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [postId]: next,
        },
      };
    });
    bumpVersion(postId);
    return nextScore;
  },

  flushSession: async (postId) => {
    const timer = flushTimers.get(postId);
    if (timer) {
      clearTimeout(timer);
      flushTimers.delete(postId);
    }

    const meta = metaByPostId.get(postId);
    if (!meta?.enabled || flushingPosts.has(postId)) {
      return;
    }

    const state = get();
    const local = state.sessions[postId];
    const syncedState = state.synced[postId];
    if (!local || !syncedState) return;

    if (
      local.liked === syncedState.liked &&
      local.disliked === syncedState.disliked
    ) {
      return;
    }

    flushingPosts.add(postId);

    try {
      const result = await fetchInteractionSession({
        postId,
        liked: local.liked,
        disliked: local.disliked,
      });

      set((current) => ({
        sessions: {
          ...current.sessions,
          [postId]: buildVoteLocalState({
            liked: result.engagement.liked,
            disliked: result.engagement.disliked,
            counts: result.counts,
            likeBonusTotal: local.likeBonusTotal,
            dislikeBonusTotal: local.dislikeBonusTotal,
            postScore: result.postScore,
          }),
        },
        synced: {
          ...current.synced,
          [postId]: {
            liked: result.engagement.liked,
            disliked: result.engagement.disliked,
          },
        },
      }));

      meta.onEngagementPatch?.({
        liked: result.engagement.liked,
        disliked: result.engagement.disliked,
      });
      meta.onScoreUpdate?.(postId, result.postScore);
      meta.onAuthorScoreUpdate?.(result.authorId, result.authorTotalScore);
      bumpVersion(postId);
    } catch (err) {
      if (!(err instanceof Error && err.message === "Oturum açık değil")) {
        console.warn(
          "vote session flush failed",
          getUserFacingErrorMessage(err)
        );
      }
    } finally {
      flushingPosts.delete(postId);
    }
  },

  removeSession: (postId) => {
    const timer = flushTimers.get(postId);
    if (timer) {
      clearTimeout(timer);
      flushTimers.delete(postId);
    }
    metaByPostId.delete(postId);
    set((state) => {
      const { [postId]: _session, ...sessions } = state.sessions;
      const { [postId]: _synced, ...synced } = state.synced;
      const { [postId]: _version, ...versions } = state.versions;
      return { sessions, synced, versions };
    });
  },
}));
