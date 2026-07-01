import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";
import type { VoteFlashDirection } from "./ProfileVoteProvider";

export type FlameDirection = "up" | "down" | "neutral";

export type FireBarTheme = {
  fillGradientId: string;
  glow: string;
  glowRgb: string;
};

export function isFlamingMode(gaugeVoteMode: GaugeVoteMode): boolean {
  return gaugeVoteMode === "up" || gaugeVoteMode === "down";
}

export function getFireBarTheme(gaugeVoteMode: GaugeVoteMode): FireBarTheme | null {
  if (gaugeVoteMode === "up") {
    return {
      fillGradientId: "gaugeFireBlue",
      glow: "#3B82F6",
      glowRgb: "59,130,246",
    };
  }
  if (gaugeVoteMode === "down") {
    return {
      fillGradientId: "gaugeFireRed",
      glow: "#EF4444",
      glowRgb: "239,68,68",
    };
  }
  return null;
}

export function resolveFlameDirection(
  gaugeVoteMode: GaugeVoteMode,
  voteFlash: VoteFlashDirection = null
): FlameDirection {
  if (voteFlash === "down" || gaugeVoteMode === "down") return "down";
  if (voteFlash === "up" || gaugeVoteMode === "up") return "up";
  return "neutral";
}
