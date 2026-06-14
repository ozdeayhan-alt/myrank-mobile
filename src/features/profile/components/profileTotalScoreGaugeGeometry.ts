/**
 * Upper semicircle gauge geometry (opens upward).
 * progress 0 = left chord end, 0.5 = peak, 1 = right chord end.
 */

export type LadderRung = {
  rank: number;
  totalScore: number;
};

export type GaugeDirection = "up" | "down";

export function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function getSemicircleArcLength(radius: number): number {
  return Math.PI * radius;
}

export function pointOnUpperSemicircle(
  cx: number,
  cy: number,
  radius: number,
  progress: number
) {
  const theta = Math.PI * (1 - clamp01(progress));
  return {
    x: cx + radius * Math.cos(theta),
    y: cy - radius * Math.sin(theta),
  };
}

export function getUpperSemicirclePeakY(
  cx: number,
  cy: number,
  radius: number
): number {
  return pointOnUpperSemicircle(cx, cy, radius, 0.5).y;
}

export function describeUpperSemicircleArc(
  cx: number,
  cy: number,
  radius: number,
  progressStart: number,
  progressEnd: number
): string {
  const start = clamp01(progressStart);
  const end = clamp01(progressEnd);
  if (end <= start + 0.0001) {
    return "";
  }

  const startPoint = pointOnUpperSemicircle(cx, cy, radius, start);
  const endPoint = pointOnUpperSemicircle(cx, cy, radius, end);
  const sweep = end - start;
  const largeArcFlag = sweep > 0.5 ? 1 : 0;

  return [
    "M",
    startPoint.x,
    startPoint.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    1,
    endPoint.x,
    endPoint.y,
  ].join(" ");
}

export type GaugeProgressInput = {
  score: number;
  baselineScore: number;
  targetScore: number | null;
  aheadRank?: number | null;
};

export type GaugeProgressResult = {
  hasTarget: boolean;
  isLeader: boolean;
  isLast: boolean;
  progress: number;
  span: number;
  remainingPoints: number;
  neighborRank: number | null;
  activeRung: LadderRung | null;
};

export function computeRemainingPointsUp(
  score: number,
  targetScore: number
): number {
  if (targetScore <= score) {
    return 0;
  }
  return Math.max(0, Math.ceil(targetScore - score));
}

export function computeRemainingPointsDown(
  score: number,
  targetScore: number
): number {
  if (score <= targetScore) {
    return 0;
  }
  return Math.max(0, Math.ceil(score - targetScore));
}

/** Yukarı (+) merdiven: gece listesinde henüz ulaşılmamış ilk üst basamak. */
export function pickActiveAheadRung(
  rungs: LadderRung[],
  score: number
): LadderRung | null {
  for (const rung of rungs) {
    if (score < rung.totalScore) {
      return rung;
    }
  }
  return null;
}

/** Aşağı (−) merdiven: gece listesinde henüz geçilmemiş ilk alt basamak. */
export function pickActiveBehindRung(
  rungs: LadderRung[],
  score: number
): LadderRung | null {
  for (const rung of rungs) {
    if (score > rung.totalScore) {
      return rung;
    }
  }
  return null;
}

export function computeGaugeProgress({
  score,
  baselineScore,
  targetScore,
  aheadRank = null,
}: GaugeProgressInput): GaugeProgressResult {
  const hasTarget = targetScore !== null;

  const rangeMin = baselineScore;
  const scoreGap = hasTarget ? targetScore - rangeMin : 0;
  const span = hasTarget
    ? Math.max(scoreGap, 1)
    : Math.max(baselineScore * 0.2, 50);
  const rawProgress = hasTarget
    ? scoreGap <= 0
      ? 1
      : clamp01((score - rangeMin) / span)
    : 1;
  const progress =
    rawProgress <= 0 && hasTarget && scoreGap > 0
      ? 0.015
      : clamp01(rawProgress);

  const activeRung =
    hasTarget && aheadRank !== null
      ? { rank: aheadRank, totalScore: targetScore! }
      : null;

  return {
    hasTarget,
    isLeader: !hasTarget && targetScore === null,
    isLast: false,
    progress,
    span,
    remainingPoints: hasTarget
      ? computeRemainingPointsUp(score, targetScore!)
      : 0,
    neighborRank: hasTarget ? aheadRank : null,
    activeRung,
  };
}

export type LadderGaugeInput = {
  score: number;
  baselineScore: number;
  direction: GaugeDirection;
  aheadRungs: LadderRung[];
  behindRungs: LadderRung[];
};

export function computeLadderGaugeProgress({
  score,
  baselineScore,
  direction,
  aheadRungs,
  behindRungs,
}: LadderGaugeInput): GaugeProgressResult {
  if (direction === "up") {
    const activeRung = pickActiveAheadRung(aheadRungs, score);
    if (!activeRung) {
      return {
        hasTarget: false,
        isLeader: true,
        isLast: false,
        progress: 1,
        span: Math.max(baselineScore * 0.2, 50),
        remainingPoints: 0,
        neighborRank: null,
        activeRung: null,
      };
    }

    const targetScore = activeRung.totalScore;
    const rangeMin = baselineScore;
    const scoreGap = targetScore - rangeMin;
    const span = Math.max(scoreGap, 1);
    const rawProgress =
      scoreGap <= 0 ? 1 : clamp01((score - rangeMin) / span);
    const progress =
      rawProgress <= 0 && scoreGap > 0 ? 0.015 : clamp01(rawProgress);

    return {
      hasTarget: true,
      isLeader: false,
      isLast: false,
      progress,
      span,
      remainingPoints: computeRemainingPointsUp(score, targetScore),
      neighborRank: activeRung.rank,
      activeRung,
    };
  }

  const activeRung = pickActiveBehindRung(behindRungs, score);
  if (!activeRung) {
    return {
      hasTarget: false,
      isLeader: false,
      isLast: true,
      progress: 0,
      span: Math.max(baselineScore * 0.2, 50),
      remainingPoints: 0,
      neighborRank: null,
      activeRung: null,
    };
  }

  const targetScore = activeRung.totalScore;
  const rangeMax = baselineScore;
  const scoreGap = rangeMax - targetScore;
  const span = Math.max(scoreGap, 1);
  const rawProgress =
    scoreGap <= 0 ? 0 : clamp01((score - targetScore) / span);
  const progress =
    rawProgress >= 1 && scoreGap > 0 ? 0.985 : clamp01(rawProgress);

  return {
    hasTarget: true,
    isLeader: false,
    isLast: false,
    progress,
    span,
    remainingPoints: computeRemainingPointsDown(score, targetScore),
    neighborRank: activeRung.rank,
    activeRung,
  };
}

export function remainingFromProgress(
  span: number,
  progress: number,
  direction: GaugeDirection = "up"
): number {
  if (direction === "down") {
    return Math.max(0, Math.ceil(clamp01(progress) * span));
  }
  return Math.max(0, Math.ceil((1 - clamp01(progress)) * span));
}

export function formatGaugeScoreLabel(value: number): string {
  return Math.round(value).toLocaleString("tr-TR");
}

export function formatRankLabel(rank: number | null): string {
  if (rank === null || rank <= 0) {
    return "—";
  }
  return `#${rank}`;
}
