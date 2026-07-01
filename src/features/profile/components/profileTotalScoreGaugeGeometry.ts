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

/** Horizontal energy bar: progress 0 = left end, 1 = right end. */
export function pointOnHorizontalBar(
  barX: number,
  barY: number,
  barLength: number,
  progress: number
) {
  return {
    x: barX + clamp01(progress) * barLength,
    y: barY,
  };
}

export function describeHorizontalBar(
  barX: number,
  barY: number,
  barLength: number
): string {
  if (barLength <= 0) {
    return "";
  }
  return `M ${barX} ${barY} L ${barX + barLength} ${barY}`;
}

export function getHorizontalBarLength(barLength: number): number {
  return Math.max(0, barLength);
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

/**
 * Resmi sıradan yukarı: officialRank−1, −2 … basamakları sırayla dene.
 * Donmuş skoru geçilmiş basamak atlanır; hedef resmi zincirdeki ilk geçilmemiş kişi.
 */
export function pickActiveAheadRungByOfficialRank(
  rungs: LadderRung[],
  score: number,
  officialRank: number
): LadderRung | null {
  if (officialRank <= 1) {
    return null;
  }

  const byRank = new Map<number, LadderRung>();
  for (const rung of rungs) {
    byRank.set(rung.rank, rung);
  }

  let fallback: LadderRung | null = null;

  for (let rank = officialRank - 1; rank >= 1; rank -= 1) {
    const rung = byRank.get(rank);
    if (!rung) {
      continue;
    }
    if (fallback === null) {
      fallback = rung;
    }
    if (score < rung.totalScore) {
      return rung;
    }
  }

  if (fallback !== null && score >= fallback.totalScore) {
    return pickActiveAheadRung(rungs, score);
  }

  return fallback;
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

/** Resmi sıradan aşağı: officialRank+1, +2 … basamakları sırayla dene. */
export function pickActiveBehindRungByOfficialRank(
  rungs: LadderRung[],
  score: number,
  officialRank: number
): LadderRung | null {
  const byRank = new Map<number, LadderRung>();
  for (const rung of rungs) {
    byRank.set(rung.rank, rung);
  }

  for (let rank = officialRank + 1; ; rank += 1) {
    const rung = byRank.get(rank);
    if (!rung) {
      break;
    }
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
  /** Resmi gece sırası — hedef basamak seçimi için */
  officialRank?: number | null;
};

export function computeLadderGaugeProgress({
  score,
  baselineScore,
  direction,
  aheadRungs,
  behindRungs,
  officialRank = null,
}: LadderGaugeInput): GaugeProgressResult {
  if (direction === "up") {
    const activeRung =
      officialRank != null && officialRank > 0
        ? pickActiveAheadRungByOfficialRank(aheadRungs, score, officialRank)
        : pickActiveAheadRung(aheadRungs, score);
    if (!activeRung) {
      const atOfficialTop = officialRank != null && officialRank <= 1;
      return {
        hasTarget: false,
        isLeader: atOfficialTop,
        isLast: false,
        progress: atOfficialTop ? 1 : 0,
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

  const activeRung =
    officialRank != null && officialRank > 0
      ? pickActiveBehindRungByOfficialRank(behindRungs, score, officialRank)
      : pickActiveBehindRung(behindRungs, score);
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
