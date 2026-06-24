export const PRESTIGE_RING = {
  gold: { border: "#D4AF37", glow: "rgba(212, 175, 55, 0.35)" },
  silver: { border: "#B8B8B8", glow: "rgba(192, 192, 192, 0.3)" },
  bronze: { border: "#CD7F32", glow: "rgba(205, 127, 50, 0.3)" },
} as const;

export const PRESTIGE_ROW = {
  gold: {
    borderColor: PRESTIGE_RING.gold.border,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 2,
    shadowColor: PRESTIGE_RING.gold.glow,
  },
  silver: {
    borderColor: PRESTIGE_RING.silver.border,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    borderWidth: 2,
    shadowColor: PRESTIGE_RING.silver.glow,
  },
  bronze: {
    borderColor: PRESTIGE_RING.bronze.border,
    backgroundColor: "rgba(205, 127, 50, 0.1)",
    borderWidth: 2,
    shadowColor: PRESTIGE_RING.bronze.glow,
  },
} as const;

export type PrestigeTier = keyof typeof PRESTIGE_RING;

export function prestigeTierFromRank(rank?: number): PrestigeTier | null {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return null;
}
