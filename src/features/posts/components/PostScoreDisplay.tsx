import { memo } from "react";
import { postVoteDisplayKey } from "@/features/ranking/vote/voteDisplayStore";
import { useVoteDisplay } from "@/features/ranking/vote/useVoteDisplay";
import { PostScorePill } from "./PostScorePill";

type PostScoreDisplayProps = {
  postId: string;
  initialScore: number;
};

function PostScoreDisplayInner({
  postId,
  initialScore,
}: PostScoreDisplayProps) {
  const score = useVoteDisplay(postVoteDisplayKey(postId), initialScore);
  return <PostScorePill score={score} />;
}

export const PostScoreDisplay = memo(PostScoreDisplayInner);
