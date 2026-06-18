import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchBatchEngagement } from "../api/fetchBatchEngagement";
import type { EngagementStatus } from "../types";

const DEFAULT_ENGAGEMENT: EngagementStatus = {
  shared: false,
  saved: false,
  liked: false,
  disliked: false,
};

export function useBatchEngagement(postIds: string[]) {
  const [engagements, setEngagements] = useState<Record<string, EngagementStatus>>({});
  const [loading, setLoading] = useState(false);

  const idsKey = useMemo(
    () => [...new Set(postIds.filter(Boolean))].join(","),
    [postIds]
  );

  const refresh = useCallback(async () => {
    const normalizedIds = idsKey ? idsKey.split(",") : [];
    if (normalizedIds.length === 0) {
      setEngagements({});
      return;
    }

    setLoading(true);
    try {
      const data = await fetchBatchEngagement(normalizedIds);
      setEngagements(data);
    } catch {
      // Mevcut durumda kal
    } finally {
      setLoading(false);
    }
  }, [idsKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const patchEngagement = useCallback(
    (postId: string, patch: Partial<EngagementStatus>) => {
      setEngagements((prev) => ({
        ...prev,
        [postId]: {
          ...DEFAULT_ENGAGEMENT,
          ...prev[postId],
          ...patch,
        },
      }));
    },
    []
  );

  const getEngagement = useCallback(
    (postId: string): EngagementStatus => ({
      ...DEFAULT_ENGAGEMENT,
      ...engagements[postId],
    }),
    [engagements]
  );

  return {
    engagements,
    loading,
    refresh,
    patchEngagement,
    getEngagement,
  };
}
