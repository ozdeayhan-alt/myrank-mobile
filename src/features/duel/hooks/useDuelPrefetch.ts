import { useCallback, useEffect, useRef } from "react";
import { useDuelPrefetchStore } from "../store/useDuelPrefetchStore";

/** Prefetch duel match + images when feed card becomes visible. */
export function useDuelCardPrefetch(visible: boolean) {
  const prefetch = useDuelPrefetchStore((s) => s.prefetch);
  const readyMatch = useDuelPrefetchStore((s) => s.readyMatch);
  const isFetching = useDuelPrefetchStore((s) => s.isFetching);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      triggeredRef.current = false;
      return;
    }
    if (readyMatch || isFetching || triggeredRef.current) {
      return;
    }
    triggeredRef.current = true;
    void prefetch();
  }, [visible, readyMatch, isFetching, prefetch]);

  return { ready: Boolean(readyMatch), isFetching };
}

export function useDuelJoin() {
  const consumeReady = useDuelPrefetchStore((s) => s.consumeReady);
  const prefetch = useDuelPrefetchStore((s) => s.prefetch);
  const setReady = useDuelPrefetchStore((s) => s.setReady);

  const resolveMatch = useCallback(async () => {
    const cached = consumeReady();
    if (cached) {
      return cached;
    }
    const fetched = await prefetch();
    if (fetched) {
      consumeReady();
      return fetched;
    }
    return null;
  }, [consumeReady, prefetch]);

  return { resolveMatch, setReady };
}
