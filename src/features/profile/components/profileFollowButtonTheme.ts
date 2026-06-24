/** Takip Et outline — klasik IG link mavisi */
export const INSTAGRAM_ACTION_BLUE = "#0095F6";

/** Meta / IG dolu aksiyon mavisi — Yükselt (profil + feed; reels hariç) */
export const VOTE_UP_BLUE = "#0866FF";

/** Ferrari Rosso Corsa */
export const FERRARI_RED = "#FF2800";

export const PROFILE_SECONDARY_BUTTON_COLORS = {
  fill: "#E5E7EB",
  fillActive: "#D1D5DB",
  foreground: "#374151",
} as const;

export type FollowTheme = {
  fill: string;
  foreground: string;
  borderColor?: string;
  borderWidth?: number;
};

/** Takip Et: outline IG mavisi; Takiptesin: IG Following gri */
export const FOLLOW_THEMES: Record<"idle" | "active", FollowTheme> = {
  idle: {
    fill: "#FFFFFF",
    foreground: INSTAGRAM_ACTION_BLUE,
    borderColor: INSTAGRAM_ACTION_BLUE,
    borderWidth: 2,
  },
  active: {
    fill: "#EFEFEF",
    foreground: "#262626",
    borderColor: "#DBDBDB",
    borderWidth: 1,
  },
};

export const PROFILE_VOTE_FLAT_COLORS = {
  up: VOTE_UP_BLUE,
  down: FERRARI_RED,
} as const;
