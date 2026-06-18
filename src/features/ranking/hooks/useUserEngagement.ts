import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { EngagementStatus } from "../types";

const DEFAULT_ENGAGEMENT: EngagementStatus = {
  shared: false,
  saved: false,
  liked: false,
  disliked: false,
};

function parseEngagement(data: Record<string, unknown>): EngagementStatus {
  const voteNet =
    typeof data.voteNet === "number" && Number.isFinite(data.voteNet)
      ? data.voteNet
      : undefined;

  return {
    shared: Boolean(data.shared),
    saved: Boolean(data.saved),
    liked: false,
    disliked: false,
    voteNet,
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
