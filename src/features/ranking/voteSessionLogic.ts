import { calculatePostScore } from "./constants";
import type { PostCounts } from "./types";

export type VoteLocalState = {
  liked: boolean;
  disliked: boolean;
  counts: PostCounts;
  likeBonusTotal: number;
  dislikeBonusTotal: number;
  postScore: number;
};

/** Mirror server toggle for one like tap. */
export function applyLocalLikeTap(state: VoteLocalState): VoteLocalState {
  const counts = { ...state.counts };

  if (state.liked) {
    counts.likeCount = Math.max(0, counts.likeCount - 1);
    const liked = false;
    return finalizeState({ ...state, counts, liked, disliked: state.disliked });
  }

  counts.likeCount += 1;
  let disliked = state.disliked;
  if (disliked) {
    counts.dislikeCount = Math.max(0, counts.dislikeCount - 1);
    disliked = false;
  }

  return finalizeState({ ...state, counts, liked: true, disliked });
}

/** Mirror server toggle for one dislike tap. */
export function applyLocalDislikeTap(state: VoteLocalState): VoteLocalState {
  const counts = { ...state.counts };

  if (state.disliked) {
    counts.dislikeCount = Math.max(0, counts.dislikeCount - 1);
    const disliked = false;
    return finalizeState({ ...state, counts, liked: state.liked, disliked });
  }

  counts.dislikeCount += 1;
  let liked = state.liked;
  if (liked) {
    counts.likeCount = Math.max(0, counts.likeCount - 1);
    liked = false;
  }

  return finalizeState({ ...state, counts, liked, disliked: true });
}

/** Basılı tut beğeni bonusu — toggle'dan bağımsız. */
export function applyLocalLikeBonusDelta(
  state: VoteLocalState,
  delta: number
): VoteLocalState {
  if (delta === 0) {
    return state;
  }

  return finalizeState({
    ...state,
    likeBonusTotal: Math.max(0, state.likeBonusTotal + delta),
  });
}

/** Basılı tut beğenmeme bonusu — toggle'dan bağımsız ekstra ceza. */
export function applyLocalDislikeBonusDelta(
  state: VoteLocalState,
  delta: number
): VoteLocalState {
  if (delta === 0) {
    return state;
  }

  return finalizeState({
    ...state,
    dislikeBonusTotal: Math.max(0, state.dislikeBonusTotal + delta),
  });
}

function finalizeState(state: VoteLocalState): VoteLocalState {
  const postScore = calculatePostScore({
    ...state.counts,
    likeBonusTotal: state.likeBonusTotal,
    dislikeBonusTotal: state.dislikeBonusTotal,
  });
  return { ...state, postScore };
}

export function buildVoteLocalState(params: {
  liked: boolean;
  disliked: boolean;
  counts: PostCounts;
  likeBonusTotal: number;
  dislikeBonusTotal: number;
  postScore: number;
}): VoteLocalState {
  return {
    liked: params.liked,
    disliked: params.disliked,
    counts: { ...params.counts },
    likeBonusTotal: params.likeBonusTotal,
    dislikeBonusTotal: params.dislikeBonusTotal,
    postScore: params.postScore,
  };
}
