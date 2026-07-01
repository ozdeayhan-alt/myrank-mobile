import type { LadderRung } from "../components/profileTotalScoreGaugeGeometry";
import { pickActiveAheadRung } from "../components/profileTotalScoreGaugeGeometry";

/** Penceredeki en yüksek basamak (1'e en yakın sıra). */
export function getLowestAheadRungRank(rungs: LadderRung[]): number | null {
  if (rungs.length === 0) {
    return null;
  }
  return Math.min(...rungs.map((rung) => rung.rank));
}

/** Canlı skor mevcut ahead penceresindeki tüm basamakları geçti mi? */
export function isAheadLadderWindowExhausted(
  aheadRungs: LadderRung[],
  score: number
): boolean {
  if (aheadRungs.length === 0) {
    return false;
  }
  return pickActiveAheadRung(aheadRungs, score) === null;
}

/**
 * Yukarı merdiven penceresi tükendiğinde bir sonraki ladder fetch anchor'ı.
 * null = kaydırma gerekmez veya 1. sıraya ulaşıldı.
 */
export function computeSlidingLadderAnchor(
  aheadRungs: LadderRung[],
  currentAnchor: number,
  score: number
): number | null {
  if (currentAnchor <= 1 || !isAheadLadderWindowExhausted(aheadRungs, score)) {
    return null;
  }

  const nextAnchor = getLowestAheadRungRank(aheadRungs);
  if (nextAnchor == null || nextAnchor <= 1 || nextAnchor >= currentAnchor) {
    return null;
  }

  return nextAnchor;
}
