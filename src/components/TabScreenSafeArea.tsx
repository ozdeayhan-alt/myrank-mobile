import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarContentInset } from "@/hooks/useTabBarContentInset";

type TabScreenSafeAreaProps = {
  children: ReactNode;
  className?: string;
  /** Video gibi tam ekran içerik; alt tab bar padding uygulanmaz */
  edgeToEdge?: boolean;
};

/** Tab ekranlarında status bar / çentik altında içerik başlasın */
export function TabScreenSafeArea({
  children,
  className = "flex-1 bg-white",
  edgeToEdge = false,
}: TabScreenSafeAreaProps) {
  const { bottom } = useTabBarContentInset();

  return (
    <SafeAreaView
      edges={["top"]}
      className={className}
      style={edgeToEdge ? undefined : { paddingBottom: bottom }}
    >
      {children}
    </SafeAreaView>
  );
}
