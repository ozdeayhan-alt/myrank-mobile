import type { DocumentData } from "firebase/firestore";
import type { OriginalPostSnapshot, Post } from "../types";
import { parsePostMetadata } from "./parsePostMetadata";

function mapOriginalSnapshot(data: DocumentData): OriginalPostSnapshot | undefined {
  const snapshot = data.originalSnapshot;
  if (!snapshot || typeof snapshot !== "object") {
    return undefined;
  }

  return {
    authorId: String(snapshot.authorId ?? ""),
    authorDisplayName: snapshot.authorDisplayName
      ? String(snapshot.authorDisplayName)
      : undefined,
    authorPhotoURL: snapshot.authorPhotoURL
      ? String(snapshot.authorPhotoURL)
      : undefined,
    contentType: snapshot.contentType as OriginalPostSnapshot["contentType"],
    content: snapshot.content ? String(snapshot.content) : undefined,
    mediaURL: snapshot.mediaURL ? String(snapshot.mediaURL) : undefined,
    hlsURL: snapshot.hlsURL ? String(snapshot.hlsURL) : undefined,
    posterURL: snapshot.posterURL ? String(snapshot.posterURL) : undefined,
    mediaWidth:
      typeof snapshot.mediaWidth === "number" ? snapshot.mediaWidth : undefined,
    mediaHeight:
      typeof snapshot.mediaHeight === "number" ? snapshot.mediaHeight : undefined,
  };
}

export function mapPostDoc(id: string, data: DocumentData): Post {
  const metadata = parsePostMetadata(data);

  return {
    id,
    authorId: String(data.authorId ?? ""),
    authorDisplayName: data.authorDisplayName
      ? String(data.authorDisplayName)
      : undefined,
    authorPhotoURL: data.authorPhotoURL
      ? String(data.authorPhotoURL)
      : undefined,
    segmentKey: data.segmentKey ? String(data.segmentKey) : undefined,
    metadata,
    postScore: typeof data.postScore === "number" ? data.postScore : 0,
    likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
    likeBonusTotal:
      typeof data.likeBonusTotal === "number" ? data.likeBonusTotal : 0,
    dislikeBonusTotal:
      typeof data.dislikeBonusTotal === "number" ? data.dislikeBonusTotal : 0,
    dislikeCount: typeof data.dislikeCount === "number" ? data.dislikeCount : 0,
    shareCount: typeof data.shareCount === "number" ? data.shareCount : 0,
    saveCount: typeof data.saveCount === "number" ? data.saveCount : 0,
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    contentType: data.contentType as Post["contentType"],
    originalPostId: data.originalPostId
      ? String(data.originalPostId)
      : undefined,
    repostCaption: data.repostCaption ? String(data.repostCaption) : undefined,
    originalSnapshot: mapOriginalSnapshot(data),
    content: data.content ? String(data.content) : undefined,
    mediaURL: data.mediaURL ? String(data.mediaURL) : undefined,
    hlsURL: data.hlsURL ? String(data.hlsURL) : undefined,
    posterURL: data.posterURL ? String(data.posterURL) : undefined,
    mediaWidth:
      typeof data.mediaWidth === "number" ? data.mediaWidth : undefined,
    mediaHeight:
      typeof data.mediaHeight === "number" ? data.mediaHeight : undefined,
    hashtags: Array.isArray(data.hashtags)
      ? data.hashtags.map((tag) => String(tag))
      : undefined,
    mentionUserIds: Array.isArray(data.mentionUserIds)
      ? data.mentionUserIds.map((id) => String(id))
      : undefined,
    createdAt: data.createdAt?.toDate?.() ?? undefined,
  };
}
