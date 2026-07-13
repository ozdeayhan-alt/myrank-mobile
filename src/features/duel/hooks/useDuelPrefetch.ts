import { useEffect, useRef } from "react";
import { useDuelPrefetchStore } from "../store/useDuelPrefetchStore";

/** Prefetch duel match + images when a feed card becomes visible. */
export function useDuelCardPrefetch(cardKey: string, visible: boolean) {
  const prefetchForCard = useDuelPrefetchStore((s) => s.prefetchForCard);
  const readyMatch = useDuelPrefetchStore((s) => s.cardMatches[cardKey] ?? null);
  const isFetching = useDuelPrefetchStore((s) => s.cardFetching[cardKey] ?? false);
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
    void prefetchForCard(cardKey);
  }, [cardKey, visible, readyMatch, isFetching, prefetchForCard]);

  return { ready: Boolean(readyMatch), isFetching, match: readyMatch };
}

export function useDuelJoin(cardKey: string) {
  const consumeCardMatch = useDuelPrefetchStore((s) => s.consumeCardMatch);
  const prefetchForCard = useDuelPrefetchStore((s) => s.prefetchForCard);
  const getMatchForCard = useDuelPrefetchStore((s) => s.getMatchForCard);

  const resolveMatch = async () => {
    const cached = getMatchForCard(cardKey);
    if (cached) {
      return consumeCardMatch(cardKey);
    }
    const fetched = await prefetchForCard(cardKey);
    if (fetched) {
      return consumeCardMatch(cardKey);
    }
    return null;
  };

  return { resolveMatch };
}
