/** Profil butonlarıyla aynı vurgu renkleri (ikon daireleri için). */
export const PROFILE_ICON_THEMES = {
  up: {
    iconColor: "#2563eb",
    iconBg: "#dbeafe",
  },
  down: {
    iconColor: "#dc2626",
    iconBg: "#fee2e2",
  },
  follow: {
    iconColor: "#16a34a",
    iconBg: "#dcfce7",
  },
  message: {
    iconColor: "#14b8a6",
    iconBg: "#ccfbf1",
  },
} as const;

export type ProfileIconTheme = keyof typeof PROFILE_ICON_THEMES;

/** Profil kart/satır ikonları — dairesiz, nötr vurgu */
export const PROFILE_MUTED_ICON_COLOR = "#6b7280";
