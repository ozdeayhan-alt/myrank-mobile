export type FollowTheme = {
  gradient: readonly [string, string, string];
  rim: string;
  dropShadow: string;
};

export const FOLLOW_THEMES: Record<"idle" | "active", FollowTheme> = {
  idle: {
    gradient: ["#4ade80", "#16a34a", "#14532d"],
    rim: "#15803d",
    dropShadow: "#052e16",
  },
  active: {
    gradient: ["#d1d5db", "#9ca3af", "#6b7280"],
    rim: "#6b7280",
    dropShadow: "#374151",
  },
};
