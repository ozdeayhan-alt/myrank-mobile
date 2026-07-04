import type { Post } from "@/features/posts/types";

export type DuelMatch = {
  matchId: string;
  postA: Post;
  postB: Post;
};

export type DuelVoteEntry = {
  postId: string;
  delta: number;
};

export type DuelVoteBatchResult = {
  postId: string;
  authorId: string;
  postScore: number;
  authorTotalScore: number;
  delta: number;
  appliedDelta?: number;
  requestedDelta?: number;
};

export type DuelWinnerSide = "a" | "b" | "tie";

export type DuelSessionPhase = "idle" | "active" | "finished";
