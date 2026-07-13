import type { UserMetadata } from "@/features/profile/types";

export type PostContentType = "tweet" | "image" | "video" | "repost" | "flow";

export type ShareContentType = "tweet" | "image" | "flow";

export type OriginalPostSnapshot = {
  authorId: string;
  authorDisplayName?: string;
  authorPhotoURL?: string;
  contentType?: Exclude<PostContentType, "repost">;
  content?: string;
  mediaURL?: string;
  hlsURL?: string;
  posterURL?: string;
  thumbURL?: string;
  provider?: string;
  providerUrl?: string;
  providerVideoId?: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: number;
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
  /** @deprecated Legacy Flow video alanı — yalnızca eski veri okuma */
  hlsURL?: string;
  posterURL?: string;
  thumbURL?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  hashtags?: string[];
  mentionUserIds?: string[];
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  provider?: string;
  providerUrl?: string;
  providerVideoId?: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: number;
  createdAt?: Date;
};

export type CreatePostInput = {
  contentType: PostContentType;
  content: string;
  mediaURL?: string;
  /** @deprecated Legacy Flow video alanı — yalnızca eski veri okuma */
  hlsURL?: string;
  posterURL?: string;
  thumbURL?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  providerUrl?: string;
};
