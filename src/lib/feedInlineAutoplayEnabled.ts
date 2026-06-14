import { Platform } from "react-native";

/** Feed inline video autoplay — Android release'de geçici kapalı (crash önlemi). */
export function isFeedInlineAutoplayEnabled(): boolean {
  return Platform.OS !== "android";
}
