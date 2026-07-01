export const PRESTIGE_RING = {
  gold: { border: "#D4AF37", glow: "rgba(212, 175, 55, 0.35)" },
  silver: { border: "#B8B8B8", glow: "rgba(192, 192, 192, 0.3)" },
  bronze: { border: "#CD7F32", glow: "rgba(205, 127, 50, 0.3)" },
} as const;

export const PODIUM_GRADIENT = {
  gold: ["#F5E6A3", "#D4AF37", "#B8962E"] as const,
  silver: ["#E8EBF0", "#B8B8B8", "#9CA3AF"] as const,
  bronze: ["#E8C9A0", "#CD7F32", "#A66B28"] as const,
};

export const PODIUM_FRAME = {
  gold: {
    gradient: ["#FFF8DC", "#F5E6A3", "#D4AF37", "#9A7B1A"] as const,
    tint: "rgba(255, 251, 235, 0.55)",
    shadowColor: "#D4AF37",
    shadowOpacity: 0.25,
    borderWidth: 2.5,
    marginBottom: 12,
  },
  silver: {
    gradient: ["#F8FAFC", "#E2E8F0", "#94A3B8", "#64748B"] as const,
    tint: "rgba(248, 250, 252, 0.85)",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.2,
    borderWidth: 2,
    marginBottom: 10,
  },
  bronze: {
    gradient: ["#FDF4E8", "#E8C9A0", "#CD7F32", "#8B5A2B"] as const,
    tint: "rgba(255, 247, 237, 0.55)",
    shadowColor: "#CD7F32",
    shadowOpacity: 0.22,
    borderWidth: 2,
    marginBottom: 10,
  },
} as const;

export type PrestigeTier = keyof typeof PRESTIGE_RING;

/** Sıralama listesinde sol şerit vurgusu (1–9). */
export const RANKING_HIGHLIGHT_TOP = 9;

const ELITE_ACCENT = {
  stripeColor: "#CBD5E1",
  rankColor: "#64748B",
} as const;

export type RankingAccent = {
  stripeColor: string;
  rankColor: string;
  isPodium: boolean;
};

export function prestigeTierFromRank(rank?: number): PrestigeTier | null {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return null;
}

export function isRankingTopNine(rank?: number): boolean {
  return typeof rank === "number" && rank >= 1 && rank <= RANKING_HIGHLIGHT_TOP;
}

export function rankingAccentFromRank(rank?: number): RankingAccent | null {
  if (!isRankingTopNine(rank)) {
    return null;
  }
  const tier = prestigeTierFromRank(rank);
  if (tier) {
    return {
      stripeColor: PRESTIGE_RING[tier].border,
      rankColor: PRESTIGE_RING[tier].border,
      isPodium: true,
    };
  }
  return {
    stripeColor: ELITE_ACCENT.stripeColor,
    rankColor: ELITE_ACCENT.rankColor,
    isPodium: false,
  };
}

/** @deprecated Use rankingAccentFromRank */
export function rankingRankColorFromRank(rank?: number): string | undefined {
  return rankingAccentFromRank(rank)?.rankColor;
}
