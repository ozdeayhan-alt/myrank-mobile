import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { BonusPoints } from "../constants";
import type { EngagementStatus } from "../types";

const DEFAULT_ENGAGEMENT: EngagementStatus = {
  shared: false,
  saved: false,
  liked: false,
  disliked: false,
  likeBonusPoints: null,
  dislikeBonusPoints: null,
};

function parseBonusPoints(value: unknown): BonusPoints | null {
  if (value === 33 || value === 66 || value === 99) {
    return value;
  }
  return null;
}

function parseEngagement(data: Record<string, unknown>): EngagementStatus {
  return {
    shared: Boolean(data.shared),
    saved: Boolean(data.saved),
    liked: Boolean(data.liked),
    disliked: Boolean(data.disliked),
    likeBonusPoints: parseBonusPoints(data.likeBonusPoints),
    dislikeBonusPoints: parseBonusPoints(data.dislikeBonusPoints),
  };
}

export function useUserEngagement(postId: string | null) {
  const [engagement, setEngagement] = useState<EngagementStatus>(DEFAULT_ENGAGEMENT);
  const [loading, setLoading] = useState(Boolean(postId));

  const refresh = useCallback(async () => {
    if (!postId) {
      setEngagement(DEFAULT_ENGAGEMENT);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await getApiAuthToken();
      const response = await fetchWithTimeout(
        `${getApiBaseUrl()}/api/interactions/engagement?postId=${encodeURIComponent(postId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeoutMs: 20000,
        }
      );

      const data = await response.json();
      if (response.ok) {
        setEngagement(parseEngagement(data));
      }
    } catch {
      // varsayılan durumda kal
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markShared = useCallback(() => {
    setEngagement((prev) => ({ ...prev, shared: true }));
  }, []);

  const markSaved = useCallback(() => {
    setEngagement((prev) => ({ ...prev, saved: true }));
  }, []);

  const patchEngagement = useCallback((patch: Partial<EngagementStatus>) => {
    setEngagement((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    engagement,
    loading,
    refresh,
    markShared,
    markSaved,
    patchEngagement,
  };
}
