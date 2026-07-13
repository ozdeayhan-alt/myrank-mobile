import { AppState, Platform } from "react-native";
import ExpoShareIntentModule from "expo-share-intent/build/ExpoShareIntentModule";

const REFRESH_DELAYS_MS = [0, 250, 600];

/** Re-read Android share intent after warm resume (onNewIntent can lag AppState active). */
export function refreshShareIntentNative(): void {
  if (Platform.OS !== "android") {
    return;
  }

  for (const delay of REFRESH_DELAYS_MS) {
    setTimeout(() => {
      ExpoShareIntentModule?.getShareIntent("");
    }, delay);
  }
}

export function subscribeShareIntentRefreshOnActive(): () => void {
  const subscription = AppState.addEventListener("change", (nextState) => {
    if (nextState === "active") {
      refreshShareIntentNative();
    }
  });

  return () => subscription.remove();
}
