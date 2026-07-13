import type { HomeFeedMode } from "@/components/HomeFeedModeToggle";
import { usePrefetchFlowFeed } from "./usePrefetchFlowFeed";

type UsePrefetchFlowFeedOnHomeOptions = {
  feedMode: HomeFeedMode;
  /** Home tab focused and not already showing Flow filter */
  enabled: boolean;
};

/** Home tab: global or following flow-feed prefetch. */
export function usePrefetchFlowFeedOnHome({
  feedMode,
  enabled,
}: UsePrefetchFlowFeedOnHomeOptions) {
  usePrefetchFlowFeed({
    variant: feedMode === "following" ? "following" : "home",
    enabled,
  });
}
