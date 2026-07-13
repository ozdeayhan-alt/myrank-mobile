import {
  FERRARI_RED,
  VOTE_UP_BLUE,
} from "@/features/profile/components/profileFollowButtonTheme";

export type FlowVoteButtonTheme = {
  cap: readonly [string, string, string];
  capPressed: readonly [string, string, string];
  recess: string;
  recessPressed: string;
  icon: string;
  label: string;
  labelActive: string;
  activeGlow: string;
};

/** Flow Yükselt ana mavi — tek yerden ayarlanır. */
export const FLOW_VOTE_COLOR_UP = VOTE_UP_BLUE;

/** Flow Alçalt ana kırmızı — tek yerden ayarlanır. */
export const FLOW_VOTE_COLOR_DOWN = FERRARI_RED;

export const FLOW_VOTE_THEMES: Record<"up" | "down", FlowVoteButtonTheme> = {
  up: {
    cap: [
      "rgba(106,158,232,0.65)",
      `rgba(8,102,255,0.6)`,
      "rgba(10,82,200,0.55)",
    ],
    capPressed: [
      "rgba(90,143,216,0.72)",
      "rgba(5,80,208,0.68)",
      "rgba(8,72,176,0.65)",
    ],
    recess: "rgba(30,40,54,0.45)",
    recessPressed: "rgba(20,26,36,0.55)",
    icon: "#FFFFFF",
    label: "rgba(255,255,255,0.88)",
    labelActive: FLOW_VOTE_COLOR_UP,
    activeGlow: "rgba(37,99,235,0.22)",
  },
  down: {
    cap: [
      "rgba(232,106,80,0.65)",
      `rgba(255,40,0,0.6)`,
      "rgba(192,40,24,0.55)",
    ],
    capPressed: [
      "rgba(216,90,64,0.72)",
      "rgba(208,32,0,0.68)",
      "rgba(168,32,16,0.65)",
    ],
    recess: "rgba(42,30,32,0.45)",
    recessPressed: "rgba(26,18,20,0.55)",
    icon: "#FFFFFF",
    label: "rgba(255,255,255,0.88)",
    labelActive: FLOW_VOTE_COLOR_DOWN,
    activeGlow: "rgba(220,38,38,0.22)",
  },
};

/** Hafif cam yüzey — blur + yarı saydam (Android’de scrim fallback). */
export const FLOW_VOTE_GLASS = {
  visualOpacity: 0.92,
  blurIntensity: 32,
  blurTint: "dark" as const,
  androidBackdrop: "rgba(14,18,24,0.36)",
  chromeRing: [
    "rgba(255,255,255,0.28)",
    "rgba(255,255,255,0.14)",
    "rgba(255,255,255,0.08)",
  ] as const,
  ringBorder: "rgba(255,255,255,0.22)",
  labelShadow: "rgba(0,0,0,0.55)",
};
