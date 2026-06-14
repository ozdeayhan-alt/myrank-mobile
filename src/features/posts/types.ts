import type { UserMetadata } from "@/features/profile/types";

export type PostContentType = "tweet" | "image" | "video" | "repost";

export type OriginalPostSnapshot = {
  authorId: string;
  authorDisplayName?: string;
  authorPhotoURL?: string;
  contentType?: Exclude<PostContentType, "repost">;
  content?: string;
  mediaURL?: string;
  hlsURL?: string;
  posterURL?: string;
  mediaWidth?: number;
  mediaHeight?: number;
};

export type Post = {
  id: string;
  authorId: string;
  authorDisplayName?: string;
  authorPhotoURL?: string;
  segmentKey?: string;
  metadata?: UserMetadata;
  postScore: number;
  likeCount: number;
  likeBonusTotal?: number;
  dislikeBonusTotal?: number;
  dislikeCount: number;
  shareCount: number;
  saveCount: number;
  commentCount: number;
  contentType?: PostContentType;
  content?: string;
  originalPostId?: string;
  repostCaption?: string;
  originalSnapshot?: OriginalPostSnapshot;
  mediaURL?: string;
  /** HLS manifest — reels için öncelikli kaynak */
  hlsURL?: string;
  posterURL?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  hashtags?: string[];
  mentionUserIds?: string[];
  createdAt?: Date;
};

export type CreatePostInput = {
  contentType: PostContentType;
  content: string;
  mediaURL?: string;
  /** HLS manifest — reels için öncelikli kaynak */
  hlsURL?: string;
  posterURL?: string;
  mediaWidth?: number;
  mediaHeight?: number;
};
