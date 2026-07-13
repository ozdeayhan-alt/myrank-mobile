import type { DuelMatch } from "../types";

const voteCountFormatter = new Intl.NumberFormat("tr-TR");

export function duelTotalVoteCount(match: DuelMatch): number {
  return (
    match.postA.likeCount +
    match.postA.dislikeCount +
    match.postB.likeCount +
    match.postB.dislikeCount
  );
}

export function formatDuelVoteCountLabel(match: DuelMatch): string {
  const total = duelTotalVoteCount(match);
  if (total <= 0) {
    return "Oy vermeye başla";
  }
  return `${voteCountFormatter.format(total)} kişi oy verdi`;
}
