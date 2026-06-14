import type { RankingTrendLabel } from "../types";

export const TREND_LABEL_TR: Record<Exclude<RankingTrendLabel, null>, string> = {
  rising: "Yükselişte",
  falling: "Düşüşte",
  stable: "Stabil",
};

export function formatRankChange(rankChange: number): string {
  const sign = rankChange > 0 ? "+" : "";
  return `${sign}${rankChange}`;
}

export function formatTpChange(tpChange: number): string {
  const sign = tpChange > 0 ? "+" : "";
  return `${sign}${tpChange} TP`;
}
