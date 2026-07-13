import type { Post } from "@/features/posts/types";

import type { PostCounts } from "@/features/ranking/types";

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
  counts?: PostCounts;
};

export type DuelWinnerSide = "a" | "b" | "tie";

export type DuelRoundSide = "a" | "b";

export type DuelSessionPhase =
  | "idle"
  | "round_a"
  | "transition"
  | "round_b"
  | "finished";
