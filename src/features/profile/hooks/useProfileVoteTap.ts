import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { fetchProfileVoteBatch } from "../api/fetchProfileVoteBatch";

const FLUSH_IDLE_MS = 3000;
const MAX_PENDING_DELTA = 10_000;
const MAX_AUTH_RETRY_DELAY_MS = 30_000;

type UseProfileVoteTapOptions = {
  targetUserId: string;
  initialTotalScore: number;
  enabled: boolean;
  /** Sunucu flush başarılı olduğunda (store / diğer sekmeler) */
  onFlushedScore?: (totalScore: number) => void;
};

function isAuthError(err: unknown): boolean {
  return err instanceof Error && err.message === "Oturum açık değil";
}

function clampPending(value: number): number {
  if (value > MAX_PENDING_DELTA) return MAX_PENDING_DELTA;
  if (value < -MAX_PENDING_DELTA) return -MAX_PENDING_DELTA;
  return value;
}

export function useProfileVoteTap({
  targetUserId,
  initialTotalScore,
  enabled,
  onFlushedScore,
}: UseProfileVoteTapOptions) {
  const serverTPRef = useRef(initialTotalScore);
  const pendingRef = useRef(0);
  const flushingRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authBlockedRef = useRef(false);
  const targetUserIdRef = useRef(targetUserId);
  const onFlushedScoreRef = useRef(onFlushedScore);
  const enabledRef = useRef(enabled);
  const prevTargetUserIdRef = useRef(targetUserId);

  const [displayTP, setDisplayTP] = useState(initialTotalScore);

  targetUserIdRef.current = targetUserId;
  onFlushedScoreRef.current = onFlushedScore;
  enabledRef.current = enabled;

  const computeDisplayTP = useCallback(
    () => serverTPRef.current + pendingRef.current,
    []
  );

  const publishDisplay = useCallback(() => {
    setDisplayTP(computeDisplayTP());
  }, [computeDisplayTP]);

  useEffect(() => {
    const targetChanged = prevTargetUserIdRef.current !== targetUserId;
    prevTargetUserIdRef.current = targetUserId;

    if (targetChanged) {
      serverTPRef.current = initialTotalScore;
      pendingRef.current = 0;
      authBlockedRef.current = false;
      publishDisplay();
      return;
    }

    // Gönderi puanı / refresh gibi dış güncellemeler bekleyen profil oylarını korur.
    serverTPRef.current = initialTotalScore;
    publishDisplay();
  }, [targetUserId, initialTotalScore, publishDisplay]);

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
      const result = await fetchProfileVoteBatch(
        targetUserIdRef.current,
        flushDelta
      );

      pendingRef.current = clampPending(pendingRef.current - flushDelta);
      serverTPRef.current = result.totalScore;
      publishDisplay();
      onFlushedScoreRef.current?.(result.totalScore);
      clearRetryTimer();

      if (pendingRef.current !== 0) {
        scheduleFlush();
      }
    } catch (err) {
      if (isAuthError(err)) {
        authBlockedRef.current = true;
        if (__DEV__) console.warn("profile vote flush skipped: not signed in");
        publishDisplay();
        return;
      }

      if (__DEV__) console.warn("profile vote flush failed", err);
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
    displayTP,
    registerUp,
    registerDown,
    flushPendingVotes,
    hasPendingVotes: pendingRef.current !== 0,
  };
}
