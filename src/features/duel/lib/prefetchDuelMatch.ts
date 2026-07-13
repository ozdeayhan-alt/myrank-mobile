import { prefetchFeedPostsImagesBatch } from "@/features/posts/utils/prefetchPostMedia";
import type { DuelMatch } from "../types";

export function prefetchDuelMatchImages(match: DuelMatch): void {
  prefetchFeedPostsImagesBatch([match.postA, match.postB]);
}
