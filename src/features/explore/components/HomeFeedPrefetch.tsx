import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import { useFollowingFeedInfinite } from "../hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "../hooks/useHomeFeedInfinite";

const FOLLOWING_PREFETCH_DELAY_MS = 4_000;

/** Auth sonrası ana sayfa feed'ini tab mount beklemeden ısıtır. */
export function HomeFeedPrefetch() {
  const { user } = useAuth();
  const enabled = Boolean(user?.uid);
  const [followingPrefetchEnabled, setFollowingPrefetchEnabled] =
    useState(false);

  useEffect(() => {
    if (!enabled) {
      setFollowingPrefetchEnabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setFollowingPrefetchEnabled(true);
    }, FOLLOWING_PREFETCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled]);

  useHomeFeedInfinite(enabled);
  useFollowingFeedInfinite(followingPrefetchEnabled);

  return null;
}
