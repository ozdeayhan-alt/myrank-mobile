import { isFeedPerfLogEnabled } from "@/lib/featureFlags/feedFlags";

type FeedPerfEvent =
  | "cell_render"
  | "scroll_gap"
  | "image_load"
  | "buffer";

export function feedPerfLog(
  event: FeedPerfEvent,
  payload: Record<string, unknown>
): void {
  if (!isFeedPerfLogEnabled()) {
    return;
  }

  console.log(`[feed-perf] ${event}`, {
    ts: Date.now(),
    ...payload,
  });
}

export function feedPerfNow(): number {
  return Date.now();
}
