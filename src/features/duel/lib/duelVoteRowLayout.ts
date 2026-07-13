import {
  PROFILE_VOTE_BUTTON_LABEL_RESERVE,
  getProfileVoteControlLayout,
} from "@/features/profile/profileLayout";
import { DUEL_VOTE_ROW_NUDGE_DOWN } from "../constants";

/**
 * Alt yarı ile ekran dibinin ortası (7H/8) + hafif aşağı kaydırma.
 * Dönen değer: overlay'in `bottom` stili (safe area hariç container).
 */
export function getDuelVoteOverlayBottom(
  screenHeight: number,
  voteDiameter: number
): number {
  const voteBlockHeight = voteDiameter + PROFILE_VOTE_BUTTON_LABEL_RESERVE + 8;
  const centerY = screenHeight * (7 / 8) + DUEL_VOTE_ROW_NUDGE_DOWN;
  const bottom = screenHeight - centerY - voteBlockHeight / 2;
  return Math.max(12, bottom);
}

export { getProfileVoteControlLayout };
