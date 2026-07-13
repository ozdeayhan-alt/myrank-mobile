import { useCallback, useRef, useState } from "react";
import {
  postVoteDisplayKey,
  syncVoteDisplay,
} from "@/features/ranking/vote/voteDisplayStore";
import { triggerVoteHaptic } from "@/lib/voteFeedback";

const MAX_PENDING_DELTA = 10_000;

function clampPending(value: number): number {
  if (value > MAX_PENDING_DELTA) return MAX_PENDING_DELTA;
  if (value < -MAX_PENDING_DELTA) return -MAX_PENDING_DELTA;
  return value;
}

type DuelVoteSide = {
  postId: string;
  initialScore: number;
};

import type { DuelRoundSide } from "../types";

type UseDuelVoteAccumulatorOptions = {
  sideA: DuelVoteSide;
  sideB: DuelVoteSide;
  activeSide: DuelRoundSide | null;
};

export function useDuelVoteAccumulator({
  sideA,
  sideB,
  activeSide,
}: UseDuelVoteAccumulatorOptions) {
  const pendingARef = useRef(0);
  const pendingBRef = useRef(0);
  const upCountARef = useRef(0);
  const upCountBRef = useRef(0);
  const serverARef = useRef(sideA.initialScore);
  const serverBRef = useRef(sideB.initialScore);
  const activeSideRef = useRef(activeSide);
  activeSideRef.current = activeSide;

  const [netA, setNetA] = useState(0);
  const [netB, setNetB] = useState(0);

  serverARef.current = sideA.initialScore;
  serverBRef.current = sideB.initialScore;

  const keyA = postVoteDisplayKey(sideA.postId);
  const keyB = postVoteDisplayKey(sideB.postId);

  const publish = useCallback(() => {
    syncVoteDisplay(keyA, serverARef.current, pendingARef.current);
    syncVoteDisplay(keyB, serverBRef.current, pendingBRef.current);
  }, [keyA, keyB]);

  const registerVote = useCallback(
    (side: DuelRoundSide, direction: 1 | -1) => {
      if (activeSideRef.current !== side) {
        return;
      }

      if (side === "a") {
        pendingARef.current = clampPending(pendingARef.current + direction);
        if (direction > 0) {
          upCountARef.current += 1;
        }
        setNetA(pendingARef.current);
      } else {
        pendingBRef.current = clampPending(pendingBRef.current + direction);
        if (direction > 0) {
          upCountBRef.current += 1;
        }
        setNetB(pendingBRef.current);
      }

      publish();
      triggerVoteHaptic();
    },
    [publish]
  );

  const registerUpA = useCallback(() => registerVote("a", 1), [registerVote]);
  const registerDownA = useCallback(
    () => registerVote("a", -1),
    [registerVote]
  );
  const registerUpB = useCallback(() => registerVote("b", 1), [registerVote]);
  const registerDownB = useCallback(
    () => registerVote("b", -1),
    [registerVote]
  );

  const getPendingDeltas = useCallback(
    () => ({
      deltaA: pendingARef.current,
      deltaB: pendingBRef.current,
    }),
    []
  );

  const getUpCounts = useCallback(
    () => ({
      upA: upCountARef.current,
      upB: upCountBRef.current,
    }),
    []
  );

  const resetVoteStats = useCallback(() => {
    pendingARef.current = 0;
    pendingBRef.current = 0;
    upCountARef.current = 0;
    upCountBRef.current = 0;
    setNetA(0);
    setNetB(0);
    publish();
  }, [publish]);

  const resetPending = useCallback(() => {
    resetVoteStats();
  }, [resetVoteStats]);

  const commitFlushResults = useCallback(
    (results: Array<{ postId: string; postScore: number }>) => {
      for (const result of results) {
        if (result.postId === sideA.postId) {
          serverARef.current = result.postScore;
        }
        if (result.postId === sideB.postId) {
          serverBRef.current = result.postScore;
        }
      }
      pendingARef.current = 0;
      pendingBRef.current = 0;
      setNetA(0);
      setNetB(0);
      publish();
    },
    [publish, sideA.postId, sideB.postId]
  );

  return {
    registerUpA,
    registerDownA,
    registerUpB,
    registerDownB,
    getPendingDeltas,
    getUpCounts,
    resetPending,
    resetVoteStats,
    commitFlushResults,
    publish,
    netA,
    netB,
  };
}
