import { DUEL_DURATION_MS } from "../constants";

export type OpponentSimScores = {
  scoreA: number;
  scoreB: number;
};

function hashSeed(seed: string, salt: number): number {
  let hash = salt;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 997;
  }
  return hash;
}

/**
 * Client-side opponent score simulation — no network.
 * Opponent activity ramps over 9s and counters the user's favored side.
 */
export function simulateOpponentScores(
  elapsedMs: number,
  userNetA: number,
  userNetB: number,
  matchId: string
): OpponentSimScores {
  const progress = Math.min(1, Math.max(0, elapsedMs / DUEL_DURATION_MS));
  const variance = hashSeed(matchId, 17) % 9;
  const baseActivity = Math.floor(progress * 26 + variance);

  const userLead = userNetA - userNetB;

  if (userLead >= 0) {
    return {
      scoreA: Math.floor(baseActivity * 0.25),
      scoreB: baseActivity + Math.floor(Math.abs(userLead) * 0.4),
    };
  }

  return {
    scoreA: baseActivity + Math.floor(Math.abs(userLead) * 0.4),
    scoreB: Math.floor(baseActivity * 0.25),
  };
}
