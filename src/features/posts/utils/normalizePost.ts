import { normalizeDate } from "@/lib/normalizeDate";
import type { Post } from "../types";

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

/** API + persist cache postlarını render-safe hale getirir. */
export function normalizePost(post: Post): Post {
  return {
    ...post,
    id: String(post.id ?? ""),
    authorId: String(post.authorId ?? ""),
    authorDisplayName: asOptionalString(post.authorDisplayName),
    authorPhotoURL: asOptionalString(post.authorPhotoURL),
    segmentKey: asOptionalString(post.segmentKey),
    postScore: asNumber(post.postScore),
    likeCount: asNumber(post.likeCount),
    likeBonusTotal: asNumber(post.likeBonusTotal),
    dislikeBonusTotal: asNumber(post.dislikeBonusTotal),
    dislikeCount: asNumber(post.dislikeCount),
    shareCount: asNumber(post.shareCount),
    saveCount: asNumber(post.saveCount),
    commentCount: asNumber(post.commentCount),
    content: asOptionalString(post.content),
    mediaURL: asOptionalString(post.mediaURL),
    hlsURL: asOptionalString(post.hlsURL),
    posterURL: asOptionalString(post.posterURL),
    mediaWidth:
      typeof post.mediaWidth === "number" && post.mediaWidth > 0
        ? post.mediaWidth
        : undefined,
    mediaHeight:
      typeof post.mediaHeight === "number" && post.mediaHeight > 0
        ? post.mediaHeight
        : undefined,
    createdAt: normalizeDate(post.createdAt) ?? undefined,
    originalSnapshot: post.originalSnapshot
      ? {
          ...post.originalSnapshot,
          authorId: String(post.originalSnapshot.authorId ?? ""),
          authorDisplayName: asOptionalString(
            post.originalSnapshot.authorDisplayName
          ),
          authorPhotoURL: asOptionalString(post.originalSnapshot.authorPhotoURL),
          content: asOptionalString(post.originalSnapshot.content),
          mediaURL: asOptionalString(post.originalSnapshot.mediaURL),
          hlsURL: asOptionalString(post.originalSnapshot.hlsURL),
          posterURL: asOptionalString(post.originalSnapshot.posterURL),
        }
      : undefined,
  };
}
