/** Duel round length in milliseconds. */
export const DUEL_DURATION_MS = 7_000;

/** Duel oy satırı — 7/8 ekran hizasından yukarı nudge (px, negatif = yukarı). */
export const DUEL_VOTE_ROW_NUDGE_DOWN = -74;

/** @deprecated use DUEL_VOTE_ROW_NUDGE_DOWN */
export const DUEL_VOTE_ROW_EXTRA_OFFSET = 16;

/** Countdown tick interval. */
export const DUEL_COUNTDOWN_TICK_MS = 1_000;

/** Fade between round A and round B. */
export const DUEL_ROUND_TRANSITION_MS = 250;

/** Entry / exit screen fade duration. */
export const DUEL_SCREEN_FADE_MS = 300;

/**
 * Max net delta per post sent to server (mirrors backend MAX_DUEL_DELTA_PER_MATCH).
 * Client sends full delta; server clamps silently.
 */
export const MAX_DUEL_DELTA_PER_MATCH = 72;

/** Min/max normal feed posts between duel cards. */
export const DUEL_CARD_INTERVAL_MIN = 3;
export const DUEL_CARD_INTERVAL_MAX = 5;

export function duelIntervalForCardIndex(cardIndex: number): number {
  const span = DUEL_CARD_INTERVAL_MAX - DUEL_CARD_INTERVAL_MIN + 1;
  return DUEL_CARD_INTERVAL_MIN + ((cardIndex * 7919 + 13) % span);
}
