import { Redirect } from "expo-router";

/** Reels artık ana sayfa Video filtresinde; derin link uyumluluğu için yönlendirme. */
export default function ReelsScreen() {
  return <Redirect href="/(tabs)/" />;
}
