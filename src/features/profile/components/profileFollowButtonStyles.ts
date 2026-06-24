import { StyleSheet } from "react-native";

export function createProfileFollowButtonStyles(size: number) {
  return StyleSheet.create({
    wrapper: {
      width: size,
      height: size + 6,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    face: {
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    content: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: Math.max(6, Math.round(size * 0.1)),
    },
    iconCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 6,
    },
    label: {
      fontSize: size >= 74 ? 10 : 9,
      fontWeight: "600",
      color: "#374151",
      letterSpacing: 0.1,
      textAlign: "center",
      alignSelf: "center",
    },
  });
}
