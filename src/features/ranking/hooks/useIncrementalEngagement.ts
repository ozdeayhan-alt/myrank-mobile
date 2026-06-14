import { useCallback, useEffect, useMemo, useRef } from "react";
import { fetchBatchEngagement } from "../api/fetchBatchEngagement";
import {
  DEFAULT_ENGAGEMENT,
  useEngagementStore,
} from "../store/useEngagementStore";
import type { EngagementStatus } from "../types";

const BATCH_CHUNK_SIZE = 50;
const FETCH_DEBOUNCE_MS = 100;

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

/**
 * Fetches engagement only for post IDs not seen yet (avoids full refetch on scroll).
 * Pass `resetKey` when the feed identity changes (e.g. explore filters).
 */
export function useIncrementalEngagement(
  postIds: string[],
  resetKey?: string
) {
  const knownIdsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const mergeBatch = useEngagementStore((s) => s.mergeBatch);
  const patchEngagement = useEngagementStore((s) => s.patchEngagement);

  const idsKey = useMemo(
    () => [...new Set(postIds.filter(Boolean))].sort().join(","),
    [postIds]
  );

  useEffect(() => {
    knownIdsRef.current = new Set();
    useEngagementStore.getState().reset();
  }, [resetKey]);

  useEffect(() => {
    const allIds = idsKey ? idsKey.split(",") : [];
    const toFetch = allIds.filter((id) => {
      if (knownIdsRef.current.has(id)) {
        return false;
      }
      const stored = useEngagementStore.getState().engagements[id];
      if (stored) {
        knownIdsRef.current.add(id);
        return false;
      }
      return true;
    });
    if (toFetch.length === 0) return;

    for (const id of toFetch) {
      pendingIdsRef.current.add(id);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    let cancelled = false;

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      const batch = [...pendingIdsRef.current];
      pendingIdsRef.current = new Set();
      if (batch.length === 0) return;

      void (async () => {
        try {
          const chunks = chunkArray(batch, BATCH_CHUNK_SIZE);
          const results = await Promise.all(
            chunks.map((chunk) => fetchBatchEngagement(chunk))
          );
          if (cancelled) return;

          const merged = results.reduce<Record<string, EngagementStatus>>(
            (acc, chunkData) => ({ ...acc, ...chunkData }),
            {}
          );

          for (const id of batch) {
            knownIdsRef.current.add(id);
          }
          mergeBatch(merged);
        } catch {
          // Keep existing engagement state
        }
      })();
    }, FETCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [idsKey, mergeBatch, resetKey]);

  const getEngagement = useCallback((postId: string): EngagementStatus => {
    const stored = useEngagementStore.getState().engagements[postId];
    return {
      ...DEFAULT_ENGAGEMENT,
      ...stored,
    };
  }, []);

  return { getEngagement, patchEngagement };
}
