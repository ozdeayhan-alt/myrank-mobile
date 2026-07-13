import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDuelVoteBatch } from "../api/fetchDuelVoteBatch";
import { applyDuelFlushResults } from "../lib/applyDuelFlushResults";
import {
  DUEL_DURATION_MS,
  DUEL_ROUND_TRANSITION_MS,
} from "../constants";
import type {
  DuelMatch,
  DuelRoundSide,
  DuelSessionPhase,
  DuelWinnerSide,
} from "../types";
import { useDuelVoteAccumulator } from "./useDuelVoteAccumulator";

const TIMER_TICK_MS = 250;

function resolveWinner(deltaA: number, deltaB: number): DuelWinnerSide {
  if (deltaA > deltaB) return "a";
  if (deltaB > deltaA) return "b";
  return "tie";
}

function activeSideForPhase(phase: DuelSessionPhase): DuelRoundSide | null {
  if (phase === "round_a") return "a";
  if (phase === "round_b") return "b";
  return null;
}

export function useDuelSession(match: DuelMatch | null) {
  const [phase, setPhase] = useState<DuelSessionPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(DUEL_DURATION_MS / 1000);
  const [winner, setWinner] = useState<DuelWinnerSide | null>(null);
  const [winnerUpCount, setWinnerUpCount] = useState(0);
  const [flushError, setFlushError] = useState<string | null>(null);
  const roundStartRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const activeSide = activeSideForPhase(phase);

  const voteAccumulator = useDuelVoteAccumulator({
    sideA: {
      postId: match?.postA.id ?? "",
      initialScore: match?.postA.postScore ?? 0,
    },
    sideB: {
      postId: match?.postB.id ?? "",
      initialScore: match?.postB.postScore ?? 0,
    },
    activeSide,
  });

  const voteAccumulatorRef = useRef(voteAccumulator);
  voteAccumulatorRef.current = voteAccumulator;

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const flushVotes = useCallback(async () => {
    if (!match) {
      return;
    }

    const { deltaA, deltaB } = voteAccumulatorRef.current.getPendingDeltas();
    const votes = [];
    if (deltaA !== 0) {
      votes.push({ postId: match.postA.id, delta: deltaA });
    }
    if (deltaB !== 0) {
      votes.push({ postId: match.postB.id, delta: deltaB });
    }

    if (votes.length === 0) {
      return;
    }

    try {
      const response = await fetchDuelVoteBatch(votes);
      voteAccumulatorRef.current.commitFlushResults(response.results);
      applyDuelFlushResults(response.results);
      setFlushError(null);
    } catch (err) {
      setFlushError(err instanceof Error ? err.message : "Oy gönderilemedi");
    }
  }, [match]);

  const finishRef = useRef<(options?: { silent?: boolean }) => Promise<void>>(
    async () => {}
  );

  finishRef.current = async (options?: { silent?: boolean }) => {
    if (!match || finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    clearTransitionTimer();

    const { deltaA, deltaB } = voteAccumulatorRef.current.getPendingDeltas();
    const { upA, upB } = voteAccumulatorRef.current.getUpCounts();
    if (!options?.silent) {
      const resolvedWinner = resolveWinner(deltaA, deltaB);
      setWinner(resolvedWinner);
      setWinnerUpCount(
        resolvedWinner === "a" ? upA : resolvedWinner === "b" ? upB : 0
      );
      setPhase("finished");
    } else {
      setPhase("idle");
    }

    await flushVotes();
  };

  const beginRoundRef = useRef<(round: DuelRoundSide) => void>(() => {});
  beginRoundRef.current = (round: DuelRoundSide) => {
    roundStartRef.current = Date.now();
    setSecondsLeft(DUEL_DURATION_MS / 1000);
    setPhase(round === "a" ? "round_a" : "round_b");
  };

  const start = useCallback(() => {
    if (!match) return;
    finishedRef.current = false;
    setFlushError(null);
    setWinner(null);
    setWinnerUpCount(0);
    voteAccumulatorRef.current.resetVoteStats();
    voteAccumulatorRef.current.publish();
    beginRoundRef.current("a");
  }, [match]);

  const skipToNextRound = useCallback(() => {
    clearTransitionTimer();
    const current = phaseRef.current;
    if (current === "round_a") {
      beginRoundRef.current("b");
      return;
    }
    if (current === "round_b") {
      void finishRef.current();
    }
  }, [clearTransitionTimer]);

  const reset = useCallback(() => {
    clearTransitionTimer();
    finishedRef.current = false;
    setFlushError(null);
    setWinner(null);
    setWinnerUpCount(0);
    setPhase("idle");
    setSecondsLeft(DUEL_DURATION_MS / 1000);
    roundStartRef.current = null;
    voteAccumulatorRef.current.resetVoteStats();
  }, [clearTransitionTimer]);

  useEffect(() => {
    if (phase !== "round_a" && phase !== "round_b") {
      return;
    }

    const tick = () => {
      const startedAt = roundStartRef.current ?? Date.now();
      const elapsed = Date.now() - startedAt;
      const remainingMs = Math.max(0, DUEL_DURATION_MS - elapsed);
      setSecondsLeft(Math.ceil(remainingMs / 1000));

      if (remainingMs <= 0) {
        const currentPhase = phaseRef.current;
        if (currentPhase === "round_a") {
          setPhase("transition");
          transitionTimerRef.current = setTimeout(() => {
            transitionTimerRef.current = null;
            beginRoundRef.current("b");
          }, DUEL_ROUND_TRANSITION_MS);
          return;
        }

        if (currentPhase === "round_b") {
          void finishRef.current();
        }
      }
    };

    tick();
    const intervalId = setInterval(tick, TIMER_TICK_MS);
    return () => clearInterval(intervalId);
  }, [phase]);

  useEffect(() => () => clearTransitionTimer(), [clearTransitionTimer]);

  const finish = useCallback(
    (options?: { silent?: boolean }) => finishRef.current(options),
    []
  );

  return {
    phase,
    secondsLeft,
    winner,
    winnerUpCount,
    flushError,
    activeSide,
    userNetA: voteAccumulator.netA,
    userNetB: voteAccumulator.netB,
    start,
    finish,
    reset,
    skipToNextRound,
    registerUpA: voteAccumulator.registerUpA,
    registerDownA: voteAccumulator.registerDownA,
    registerUpB: voteAccumulator.registerUpB,
    registerDownB: voteAccumulator.registerDownB,
  };
}
