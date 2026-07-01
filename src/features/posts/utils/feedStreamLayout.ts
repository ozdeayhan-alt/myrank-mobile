import type { Post } from "../types";
import {
  DEFAULT_VIDEO_ASPECT_RATIO,
  feedVideoMediaLayout,
  normalizeAspectRatio,
  type FeedMediaLayout,
} from "./mediaAspectRatio";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "./repostUtils";
import { isVideoPost } from "./videoPosts";

/** Görsel boyutu yoksa Instagram benzeri 4:5 (w/h = 0.8). */
const DEFAULT_IMAGE_ASPECT_RATIO = 4 / 5;

const HEADER_BLOCK_HEIGHT = 56;
const ACTION_BAR_HEIGHT = 56;
const TEXT_LINE_HEIGHT = 22;
const CARD_VERTICAL_PADDING = 16;
/** ui.postCard mb-5 */
const CARD_MARGIN_BOTTOM = 20;
const REPOST_ATTRIBUTION_HEIGHT = 38;
const EMBEDDED_HEADER_HEIGHT = 52;
const EMBEDDED_BLOCK_MARGIN = 28;
const EMBEDDED_TEXT_PADDING = 16;
/** FlashList ölçümü için küçük tampon — kırpma yerine hafif fazla yükseklik. */
const HEIGHT_SAFETY_BUFFER = 8;

function storedAspectRatio(post: Post): number | null {
  if (
    typeof post.mediaWidth !== "number" ||
    typeof post.mediaHeight !== "number" ||
    post.mediaWidth <= 0 ||
    post.mediaHeight <= 0
  ) {
    return null;
  }
  return normalizeAspectRatio(post.mediaWidth, post.mediaHeight);
}

export function resolveFeedStreamAspectRatio(post: Post): number {
  const stored = storedAspectRatio(post);
  if (stored != null) {
    return stored;
  }
  if (post.contentType === "image") {
    return DEFAULT_IMAGE_ASPECT_RATIO;
  }
  if (isVideoPost(post)) {
    return DEFAULT_VIDEO_ASPECT_RATIO;
  }
  return 1;
}

export function resolveFeedStreamMediaLayout(
  post: Post,
  containerWidth: number
): FeedMediaLayout {
  return feedVideoMediaLayout(
    containerWidth,
    resolveFeedStreamAspectRatio(post)
  );
}

function estimateTextBlockHeight(text: string | null | undefined): number {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) {
    return 0;
  }
  const lines = Math.min(6, Math.max(1, Math.ceil(trimmed.length / 38)));
  return lines * TEXT_LINE_HEIGHT + 12;
}

function postHasStreamMedia(post: Post): boolean {
  return (
    post.contentType === "image" ||
    isVideoPost(post) ||
    Boolean(post.mediaURL?.trim())
  );
}

function mediaBlockHeight(post: Post, containerWidth: number): number {
  if (!postHasStreamMedia(post)) {
    return 0;
  }
  return resolveFeedStreamMediaLayout(post, containerWidth).height;
}

function embeddedRepostExtraHeight(post: Post, containerWidth: number): number {
  const embedded = resolveEmbeddedOriginalPost(post);
  if (!embedded) {
    return 0;
  }

  let height = EMBEDDED_BLOCK_MARGIN + EMBEDDED_HEADER_HEIGHT;
  const embeddedBody = embedded.content?.trim() ?? "";

  if (embeddedBody && embedded.contentType === "tweet") {
    height += estimateTextBlockHeight(embeddedBody);
  }

  height += mediaBlockHeight(embedded, containerWidth - 32);

  if (embeddedBody && embedded.contentType !== "tweet") {
    height += estimateTextBlockHeight(embeddedBody);
  }

  return height;
}

/** FlashList + hücre için sabit satır yüksekliği (margin dahil). */
export function estimateFeedStreamRowHeight(
  post: Post,
  containerWidth: number
): number {
  let height =
    HEADER_BLOCK_HEIGHT +
    ACTION_BAR_HEIGHT +
    CARD_VERTICAL_PADDING +
    CARD_MARGIN_BOTTOM +
    HEIGHT_SAFETY_BUFFER;

  const bodyText = post.content?.trim() ?? "";

  if (isRepostPost(post)) {
    if (resolveEmbeddedOriginalPost(post)) {
      height += REPOST_ATTRIBUTION_HEIGHT;
    }
    height += estimateTextBlockHeight(bodyText);
    height += embeddedRepostExtraHeight(post, containerWidth);
    return height;
  }

  if (bodyText && post.contentType === "tweet") {
    height += estimateTextBlockHeight(bodyText);
  }

  height += mediaBlockHeight(post, containerWidth);

  if (bodyText && post.contentType !== "tweet") {
    height += estimateTextBlockHeight(bodyText);
  }

  return height;
}

/** @deprecated Use estimateFeedStreamRowHeight */
export function estimateFeedStreamRowMinHeight(
  post: Post,
  containerWidth: number
): number {
  return estimateFeedStreamRowHeight(post, containerWidth);
}

export function getFeedStreamItemType(post: Post): string {
  if (isRepostPost(post)) {
    const embedded = resolveEmbeddedOriginalPost(post);
    if (embedded?.contentType === "image") {
      return "post-repost-image";
    }
    if (embedded && isVideoPost(embedded)) {
      return "post-repost-video";
    }
    return "post-repost-text";
  }
  if (post.contentType === "image") {
    return "post-image";
  }
  if (isVideoPost(post)) {
    return "post-video";
  }
  return "post-text";
}
