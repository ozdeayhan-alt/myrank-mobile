import { useAuth } from "@/features/auth";
import { useFollowingFeedInfinite } from "../hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "../hooks/useHomeFeedInfinite";

/** Auth sonrası ana sayfa feed'ini tab mount beklemeden ısıtır. */
export function HomeFeedPrefetch() {
  const { user } = useAuth();
  const enabled = Boolean(user?.uid);

  useHomeFeedInfinite(enabled);
  useFollowingFeedInfinite(enabled);

  return null;
}
