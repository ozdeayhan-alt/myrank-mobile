import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { getProfileVoteControlLayout } from "../profileLayout";

/** Profil açılır kart başlığı — Takip/Mesaj yan buton yüksekliği ile hizalı. */
export function useProfileExpandableCardHeaderHeight(): number {
  const { width: screenWidth } = useWindowDimensions();
  return useMemo(
    () => getProfileVoteControlLayout(screenWidth).sideButtonHeight,
    [screenWidth]
  );
}
