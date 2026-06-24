import { PROFILE_SECONDARY_BUTTON_COLORS } from "@/features/profile/components/profileFollowButtonTheme";

/** WhatsApp-like chat UI with MyRank gray palette */
export const messageTheme = {
  screenBg: "#F3F4F6",
  inboxBg: "#F9FAFB",
  rowBg: "#FFFFFF",
  border: "#E5E7EB",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  sentBubble: "#111827",
  sentText: "#FFFFFF",
  sentTime: "rgba(255,255,255,0.65)",
  receivedBubble: "#FFFFFF",
  receivedText: "#111827",
  receivedTime: "#9CA3AF",
  unreadBadge: "#111827",
  sendButton: "#111827",
  composerBg: "#FFFFFF",
  composerInputBg: "#F9FAFB",
} as const;

export const MESSAGE_BUTTON_THEME = {
  fill: PROFILE_SECONDARY_BUTTON_COLORS.fill,
  foreground: PROFILE_SECONDARY_BUTTON_COLORS.foreground,
};
