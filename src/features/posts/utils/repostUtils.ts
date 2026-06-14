import type { OriginalPostSnapshot, Post } from "../types";

export function isRepostPost(post: Post): boolean {
  return post.contentType === "repost";
}

export function snapshotAsPost(
  snapshot: OriginalPostSnapshot,
  postId = "embedded"
): Post {
  return {
    id: postId,
    authorId: snapshot.authorId,
    authorDisplayName: snapshot.authorDisplayName,
    authorPhotoURL: snapshot.authorPhotoURL,
    postScore: 0,
    likeCount: 0,
    dislikeCount: 0,
    shareCount: 0,
    saveCount: 0,
    commentCount: 0,
    contentType: snapshot.contentType ?? "tweet",
    content: snapshot.content,
    mediaURL: snapshot.mediaURL,
    hlsURL: snapshot.hlsURL,
    posterURL: snapshot.posterURL,
    mediaWidth: snapshot.mediaWidth,
    mediaHeight: snapshot.mediaHeight,
  };
}

export function resolveEmbeddedOriginalPost(post: Post): Post | null {
  if (!isRepostPost(post) || !post.originalSnapshot) {
    return null;
  }
  return snapshotAsPost(post.originalSnapshot, post.originalPostId ?? "original");
}

export function canRepostPost(post: Post, currentUserId?: string | null): boolean {
  if (!currentUserId) {
    return false;
  }
  if (isRepostPost(post)) {
    return false;
  }
  return post.authorId !== currentUserId;
}
