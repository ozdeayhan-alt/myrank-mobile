import type { UserMetadata } from "@/features/profile/types";
import type { InteractionType } from "./constants";

export type PostCounts = {
  likeCount: number;
  dislikeCount: number;
  shareCount: number;
  saveCount: number;
  commentCount: number;
};

export type PostComment = {
  id: string;
  actorId: string;
  commentText: string;
  createdAt: string;
  actorDisplayName?: string;
  actorPhotoURL?: string;
};

export type InteractionRequest = {
  postId: string;
  type: InteractionType;
  commentText?: string;
};

export type EngagementStatus = {
  shared: boolean;
  saved: boolean;
  liked: boolean;
  disliked: boolean;
  voteNet?: number;
};

export type InteractionResponse = {
  ok: boolean;
  postId: string;
  authorId: string;
  postScore: number;
  scoreDelta: number;
  authorTotalScore: number;
  counts: PostCounts;
  engagement: EngagementStatus;
  alreadyInteracted: boolean;
  firstAction: boolean;
  comment?: PostComment;
};

export type RankingTrendLabel = "rising" | "falling" | "stable" | null;

export type RankingEntry = {
  userId: string;
  displayName: string;
  totalScore: number;
  rank?: number;
  metadata?: UserMetadata;
  photoURL?: string;
  previousRank?: number | null;
  rankChange?: number | null;
  previousTotalScore?: number | null;
  tpChange?: number | null;
  trendLabel?: RankingTrendLabel;
};
