import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type TabScreenSafeAreaProps = {
  children: ReactNode;
  className?: string;
};

/** Tab ekranlarında status bar / çentik altında içerik başlasın */
export function TabScreenSafeArea({
  children,
  className = "flex-1 bg-white",
}: TabScreenSafeAreaProps) {
  return (
    <SafeAreaView edges={["top"]} className={className}>
      {children}
    </SafeAreaView>
  );
}
