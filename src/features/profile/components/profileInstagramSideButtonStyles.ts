import { StyleSheet } from "react-native";
import { PROFILE_VOTE_BUTTON_LABEL_RESERVE } from "../profileLayout";

export const INSTAGRAM_SIDE_BUTTON = {
  fill: "#EFEFEF",
  foreground: "#262626",
  border: "#DBDBDB",
} as const;

export function getProfileSideButtonFontSize(
  voteDiameter: number,
  fontScale: number
): number {
  const base = voteDiameter * 0.24;
  const scaled = base / Math.min(Math.max(fontScale, 1), 1.25);
  return Math.max(10, Math.min(13, Math.round(scaled)));
}

export function createInstagramSideButtonStyles(
  height: number,
  maxWidth: number,
  fontSize: number
) {
  return StyleSheet.create({
    wrapper: {
      width: maxWidth,
      maxWidth,
    },
    face: {
      height,
      width: "100%",
      maxWidth,
      minWidth: height,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
      overflow: "hidden",
    },
    label: {
      width: "100%",
      fontSize,
      fontWeight: "600",
      textAlign: "center",
      letterSpacing: 0.02,
    },
    labelSpacer: {
      height: PROFILE_VOTE_BUTTON_LABEL_RESERVE,
    },
  });
}

/** Takip Et gibi dairesel yan butonlar için (başka profil). */
export function createProfileFollowCircleStyles(size: number) {
  const labelFontSize = size >= 52 ? 9 : size >= 48 ? 8 : 7;

  return StyleSheet.create({
    wrapper: {
      width: size,
      alignItems: "center",
    },
    face: {
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 5,
    },
    label: {
      fontSize: labelFontSize,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: labelFontSize + 2,
    },
    labelSpacer: {
      height: PROFILE_VOTE_BUTTON_LABEL_RESERVE,
    },
  });
}
