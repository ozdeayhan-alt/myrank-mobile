/** Duel round length in milliseconds. */
export const DUEL_DURATION_MS = 9_000;

/** Countdown tick interval. */
export const DUEL_COUNTDOWN_TICK_MS = 1_000;

/**
 * Max net delta per post sent to server (mirrors backend MAX_DUEL_DELTA_PER_MATCH).
 * Client sends full delta; server clamps silently.
 */
export const MAX_DUEL_DELTA_PER_MATCH = 72;

/** Min/max normal feed posts between duel cards. */
export const DUEL_CARD_INTERVAL_MIN = 8;
export const DUEL_CARD_INTERVAL_MAX = 12;

export function duelIntervalForCardIndex(cardIndex: number): number {
  const span = DUEL_CARD_INTERVAL_MAX - DUEL_CARD_INTERVAL_MIN + 1;
  return DUEL_CARD_INTERVAL_MIN + ((cardIndex * 7919 + 13) % span);
}
