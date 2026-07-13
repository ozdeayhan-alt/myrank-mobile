import { useCallback, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

type DoubleTapToLikeProps = {
  children?: ReactNode;
  onLike: () => void;
  /** Yeni beğeni anında (üst katmanda kalp animasyonu) */
  onLikeAnimated?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function DoubleTapToLike({
  children,
  onLike,
  onLikeAnimated,
  style,
  accessibilityLabel,
}: DoubleTapToLikeProps) {
  const handleDoubleTap = useCallback(() => {
    onLike();
    onLikeAnimated?.();
  }, [onLike, onLikeAnimated]);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onEnd(() => {
      runOnJS(handleDoubleTap)();
    });

  return (
    <GestureDetector gesture={doubleTap}>
      <View
        style={style}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? "Çift dokunarak beğen"}
      >
        {children}
      </View>
    </GestureDetector>
  );
}
