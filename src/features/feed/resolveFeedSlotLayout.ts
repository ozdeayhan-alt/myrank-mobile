/**
 * Fixed-slot feed layout — tek kaynak.
 * Phase 1: mevcut feedStreamLayout üzerine ince wrapper.
 */
export {
  estimateFeedStreamRowHeight,
  estimateFeedStreamRowMinHeight,
  getFeedStreamItemType,
  resolveFeedStreamAspectRatio,
  resolveFeedStreamMediaLayout,
} from "@/features/posts/utils/feedStreamLayout";

export { resolveFeedStreamMediaLayout as resolveFeedSlotMediaLayout } from "@/features/posts/utils/feedStreamLayout";

export { getFeedStreamItemType as getFeedSlotItemType } from "@/features/posts/utils/feedStreamLayout";
