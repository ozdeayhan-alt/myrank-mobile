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

type UseDuelVoteAccumulatorOptions = {
  sideA: DuelVoteSide;
  sideB: DuelVoteSide;
  enabled: boolean;
};

export function useDuelVoteAccumulator({
  sideA,
  sideB,
  enabled,
}: UseDuelVoteAccumulatorOptions) {
  const pendingARef = useRef(0);
  const pendingBRef = useRef(0);
  const serverARef = useRef(sideA.initialScore);
  const serverBRef = useRef(sideB.initialScore);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

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
    (side: "a" | "b", direction: 1 | -1) => {
      if (!enabledRef.current) {
        return;
      }

      if (side === "a") {
        pendingARef.current = clampPending(pendingARef.current + direction);
        setNetA(pendingARef.current);
      } else {
        pendingBRef.current = clampPending(pendingBRef.current + direction);
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

  const resetPending = useCallback(() => {
    pendingARef.current = 0;
    pendingBRef.current = 0;
    setNetA(0);
    setNetB(0);
    publish();
  }, [publish]);

  return {
    registerUpA,
    registerDownA,
    registerUpB,
    registerDownB,
    getPendingDeltas,
    resetPending,
    publish,
    netA,
    netB,
  };
}
