import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchDuelVoteBatch } from "../api/fetchDuelVoteBatch";
import {
  DUEL_COUNTDOWN_TICK_MS,
  DUEL_DURATION_MS,
} from "../constants";
import { simulateOpponentScores } from "../lib/simulateOpponentScore";
import type { DuelMatch, DuelSessionPhase, DuelWinnerSide } from "../types";
import { useDuelVoteAccumulator } from "./useDuelVoteAccumulator";

function resolveWinner(deltaA: number, deltaB: number): DuelWinnerSide {
  if (deltaA > deltaB) return "a";
  if (deltaB > deltaA) return "b";
  return "tie";
}

export function useDuelSession(match: DuelMatch | null) {
  const [phase, setPhase] = useState<DuelSessionPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(DUEL_DURATION_MS / 1000);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [winner, setWinner] = useState<DuelWinnerSide | null>(null);
  const [flushError, setFlushError] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  const voteAccumulator = useDuelVoteAccumulator({
    sideA: {
      postId: match?.postA.id ?? "",
      initialScore: match?.postA.postScore ?? 0,
    },
    sideB: {
      postId: match?.postB.id ?? "",
      initialScore: match?.postB.postScore ?? 0,
    },
    enabled: phase === "active" && Boolean(match),
  });

  const start = useCallback(() => {
    if (!match) return;
    finishedRef.current = false;
    setFlushError(null);
    setWinner(null);
    setElapsedMs(0);
    setSecondsLeft(DUEL_DURATION_MS / 1000);
    startTimeRef.current = Date.now();
    setPhase("active");
    voteAccumulator.publish();
  }, [match, voteAccumulator]);

  const finish = useCallback(async (options?: { silent?: boolean }) => {
    if (!match || finishedRef.current) {
      return;
    }
    finishedRef.current = true;

    const { deltaA, deltaB } = voteAccumulator.getPendingDeltas();
    if (!options?.silent) {
      setWinner(resolveWinner(deltaA, deltaB));
      setPhase("finished");
    } else {
      setPhase("idle");
    }

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
      await fetchDuelVoteBatch(votes);
      voteAccumulator.resetPending();
    } catch (err) {
      setFlushError(err instanceof Error ? err.message : "Oy gönderilemedi");
    }
  }, [match, voteAccumulator]);

  useEffect(() => {
    if (phase !== "active" || !match) {
      return;
    }

    const tick = setInterval(() => {
      const startedAt = startTimeRef.current ?? Date.now();
      const elapsed = Date.now() - startedAt;
      setElapsedMs(elapsed);
      const remainingMs = Math.max(0, DUEL_DURATION_MS - elapsed);
      setSecondsLeft(Math.ceil(remainingMs / 1000));

      if (remainingMs <= 0) {
        clearInterval(tick);
        void finish();
      }
    }, DUEL_COUNTDOWN_TICK_MS);

    return () => clearInterval(tick);
  }, [phase, match, finish]);

  const opponentScores = useMemo(() => {
    if (!match || phase !== "active") {
      return { scoreA: 0, scoreB: 0 };
    }
    return simulateOpponentScores(
      elapsedMs,
      voteAccumulator.netA,
      voteAccumulator.netB,
      match.matchId
    );
  }, [match, phase, elapsedMs, voteAccumulator.netA, voteAccumulator.netB]);

  return {
    phase,
    secondsLeft,
    elapsedMs,
    winner,
    flushError,
    opponentScores,
    userNetA: voteAccumulator.netA,
    userNetB: voteAccumulator.netB,
    start,
    finish,
    registerUpA: voteAccumulator.registerUpA,
    registerDownA: voteAccumulator.registerDownA,
    registerUpB: voteAccumulator.registerUpB,
    registerDownB: voteAccumulator.registerDownB,
  };
}
