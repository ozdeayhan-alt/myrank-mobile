import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { fetchStoryVoteBatch } from "../api/fetchStoryVoteBatch";
import type { StoryVoteCounts } from "../constants/types";
import { flushVoteDeltaInChunks } from "@/features/ranking/lib/flushVoteDeltaInChunks";

const FLUSH_IDLE_MS = 3000;
const MAX_PENDING_DELTA = 10_000;
const MAX_AUTH_RETRY_DELAY_MS = 30_000;

export type StoryVoteFlushResult = {
  storyScore: number;
  authorTotalScore: number;
  authorId: string;
  counts: StoryVoteCounts;
};

type UseStoryVoteTapOptions = {
  storyId: string;
  initialStoryScore: number;
  enabled: boolean;
  onFlushed?: (result: StoryVoteFlushResult) => void;
};

function isAuthError(err: unknown): boolean {
  return err instanceof Error && err.message === "Oturum açık değil";
}

function clampPending(value: number): number {
  if (value > MAX_PENDING_DELTA) return MAX_PENDING_DELTA;
  if (value < -MAX_PENDING_DELTA) return -MAX_PENDING_DELTA;
  return value;
}

export function useStoryVoteTap({
  storyId,
  initialStoryScore,
  enabled,
  onFlushed,
}: UseStoryVoteTapOptions) {
  const serverScoreRef = useRef(initialStoryScore);
  const pendingRef = useRef(0);
  const flushingRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authBlockedRef = useRef(false);
  const storyIdRef = useRef(storyId);
  const onFlushedRef = useRef(onFlushed);
  const enabledRef = useRef(enabled);
  const prevStoryIdRef = useRef(storyId);

  const [displayScore, setDisplayScore] = useState(initialStoryScore);

  storyIdRef.current = storyId;
  onFlushedRef.current = onFlushed;
  enabledRef.current = enabled;

  const computeDisplayScore = useCallback(
    () => serverScoreRef.current + pendingRef.current,
    []
  );

  const publishDisplay = useCallback(() => {
    setDisplayScore(computeDisplayScore());
  }, [computeDisplayScore]);

  useEffect(() => {
    const storyChanged = prevStoryIdRef.current !== storyId;
    prevStoryIdRef.current = storyId;

    if (storyChanged) {
      serverScoreRef.current = initialStoryScore;
      pendingRef.current = 0;
      authBlockedRef.current = false;
      publishDisplay();
      return;
    }

    serverScoreRef.current = initialStoryScore;
    publishDisplay();
  }, [storyId, initialStoryScore, publishDisplay]);

  useEffect(() => {
    if (enabled) {
      authBlockedRef.current = false;
    }
  }, [enabled]);

  const flushPendingVotesRef = useRef<() => Promise<void>>(async () => {});

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback(
    (delayMs: number) => {
      clearRetryTimer();
      if (!enabledRef.current || authBlockedRef.current) {
        return;
      }
      if (pendingRef.current === 0) {
        return;
      }
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        void flushPendingVotesRef.current();
      }, delayMs);
    },
    [clearRetryTimer]
  );

  const scheduleFlush = useCallback(() => {
    if (!enabledRef.current || authBlockedRef.current) {
      return;
    }
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
    }
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      void flushPendingVotesRef.current();
    }, FLUSH_IDLE_MS);
  }, []);

  const flushPendingVotes = useCallback(async () => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    const flushDelta = pendingRef.current;
    if (flushDelta === 0 || flushingRef.current || !enabledRef.current) {
      return;
    }

    if (authBlockedRef.current) {
      return;
    }

    flushingRef.current = true;

    try {
      const result = await flushVoteDeltaInChunks(flushDelta, async (chunk) => {
        const batchResult = await fetchStoryVoteBatch(
          storyIdRef.current,
          chunk
        );
        pendingRef.current = clampPending(pendingRef.current - chunk);
        serverScoreRef.current = batchResult.storyScore;
        publishDisplay();
        onFlushedRef.current?.({
          storyScore: batchResult.storyScore,
          authorTotalScore: batchResult.authorTotalScore,
          authorId: batchResult.authorId,
          counts: batchResult.counts,
        });
        return batchResult;
      });

      if (result == null) {
        return;
      }

      clearRetryTimer();

      if (pendingRef.current !== 0) {
        scheduleFlush();
      }
    } catch (err) {
      if (isAuthError(err)) {
        authBlockedRef.current = true;
        if (__DEV__) console.warn("story vote flush skipped: not signed in");
        publishDisplay();
        return;
      }

      if (__DEV__) console.warn("story vote flush failed", err);
      scheduleRetry(Math.min(FLUSH_IDLE_MS * 2, MAX_AUTH_RETRY_DELAY_MS));
    } finally {
      flushingRef.current = false;

      if (
        pendingRef.current !== 0 &&
        !authBlockedRef.current &&
        enabledRef.current &&
        !retryTimerRef.current &&
        !flushTimerRef.current
      ) {
        scheduleFlush();
      }
    }
  }, [clearRetryTimer, publishDisplay, scheduleFlush, scheduleRetry]);

  flushPendingVotesRef.current = flushPendingVotes;

  const registerVote = useCallback(
    (direction: 1 | -1) => {
      if (!enabledRef.current || authBlockedRef.current) {
        return;
      }

      pendingRef.current = clampPending(pendingRef.current + direction);
      publishDisplay();
      scheduleFlush();
    },
    [publishDisplay, scheduleFlush]
  );

  const registerUp = useCallback(() => registerVote(1), [registerVote]);
  const registerDown = useCallback(() => registerVote(-1), [registerVote]);

  useLayoutEffect(() => {
    publishDisplay();
  }, [publishDisplay]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (
        (state === "background" || state === "inactive") &&
        enabledRef.current &&
        !authBlockedRef.current
      ) {
        void flushPendingVotes();
      }
    });
    return () => sub.remove();
  }, [flushPendingVotes]);

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
      clearRetryTimer();
      if (enabledRef.current && !authBlockedRef.current) {
        void flushPendingVotes();
      }
    };
  }, [clearRetryTimer, flushPendingVotes]);

  return {
    displayScore,
    registerUp,
    registerDown,
    flushPendingVotes,
  };
}
