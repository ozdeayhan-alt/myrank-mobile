import { useEffect, useSyncExternalStore } from "react";
import {
  getVoteDisplayScore,
  getVoteDisplayVersion,
  initVoteDisplay,
  subscribeVoteDisplay,
} from "./voteDisplayStore";

/** Subscribes to optimistic vote score for a single key — isolated re-renders. */
export function useVoteDisplay(
  key: string,
  initialServerScore: number
): number {
  useEffect(() => {
    initVoteDisplay(key, initialServerScore);
  }, [key, initialServerScore]);

  return useSyncExternalStore(
    (listener) => subscribeVoteDisplay(key, listener),
    () => {
      void getVoteDisplayVersion(key);
      return getVoteDisplayScore(key);
    },
    () => initialServerScore
  );
}
