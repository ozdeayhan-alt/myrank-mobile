import type { HomeFeedContentFilter } from "@/features/posts/store/useHomeFeedContentStore";

/** API query param values for server-side feed pagination. */
export type FeedApiContentType = "all" | "whisp" | "glow" | "flow";

export function toFeedApiContentType(
  filter: HomeFeedContentFilter
): FeedApiContentType {
  if (filter === "tweet") {
    return "whisp";
  }
  if (filter === "image") {
    return "glow";
  }
  if (filter === "flow") {
    return "flow";
  }
  return "all";
}
