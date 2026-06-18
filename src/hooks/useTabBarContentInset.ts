import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Tab bar + home indicator; overlay/listeler tab bar üstünde bitsin diye. */
export function useTabBarContentInset() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;

  return {
    top: insets.top,
    tabBarHeight,
    bottom: tabBarHeight,
  };
}
