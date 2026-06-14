/** Manifesto puanlama sabitleri — PROJECT_MANIFEST.md */

export const SHARE_POINTS = 66;
export const SAVE_POINTS = 66;
export const COMMENT_POINTS = 33;

/** Basılı tut beğeni/beğenmeme bonus seçenekleri */
export const LIKE_BONUS_TIERS = [33, 66, 99] as const;
export type BonusPoints = (typeof LIKE_BONUS_TIERS)[number];
/** @deprecated Use BonusPoints */
export type LikeBonusPoints = BonusPoints;

/** Beğeni/beğenmeme oturumu sunucuya sync gecikmesi (ms) */
export const VOTE_SESSION_FLUSH_MS = 3000;

export const INTERACTION_TYPES = [
  "like",
  "dislike",
  "share",
  "comment",
  "save",
] as const;

export type InteractionType = (typeof INTERACTION_TYPES)[number];

/**
 * Post Score = (likes - dislikes) + likeBonusTotal - dislikeBonusTotal + ...
 */
export function calculatePostScore(params: {
  likeCount?: number;
  dislikeCount?: number;
  shareCount?: number;
  saveCount?: number;
  commentCount?: number;
  likeBonusTotal?: number;
  dislikeBonusTotal?: number;
}): number {
  const {
    likeCount = 0,
    dislikeCount = 0,
    shareCount = 0,
    saveCount = 0,
    commentCount = 0,
    likeBonusTotal = 0,
    dislikeBonusTotal = 0,
  } = params;

  return (
    likeCount -
    dislikeCount +
    likeBonusTotal -
    dislikeBonusTotal +
    shareCount * SHARE_POINTS +
    saveCount * SAVE_POINTS +
    commentCount * COMMENT_POINTS
  );
}
