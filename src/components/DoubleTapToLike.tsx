import { useCallback, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { triggerLikeHaptic } from "@/lib/likeFeedback";

type DoubleTapToLikeProps = {
  children?: ReactNode;
  onLike: () => void;
  /** true ise çift tık beğeniyi kaldırır — haptic/kalp yok */
  liked?: boolean;
  /** Yeni beğeni anında (üst katmanda kalp animasyonu) */
  onLikeAnimated?: () => void;
  /** Tek tık (ör. feed video → reels aç) */
  onSinglePress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Video reels: video arkada, şeffaf jest katmanı */
  overlay?: boolean;
};

export function DoubleTapToLike({
  children,
  onLike,
  liked = false,
  onLikeAnimated,
  onSinglePress,
  style,
  accessibilityLabel,
  overlay = false,
}: DoubleTapToLikeProps) {
  const handleDoubleTap = useCallback(() => {
    const willLike = !liked;
    onLike();
    if (willLike) {
      triggerLikeHaptic();
      onLikeAnimated?.();
    }
  }, [liked, onLike, onLikeAnimated]);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onEnd(() => {
      runOnJS(handleDoubleTap)();
    });

  const containerStyle = [overlay && styles.overlay, style];

  const content = (
    <View
      style={containerStyle}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? "Çift dokunarak beğen"}
    >
      {children}
    </View>
  );

  if (!onSinglePress) {
    return <GestureDetector gesture={doubleTap}>{content}</GestureDetector>;
  }

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .requireExternalGestureToFail(doubleTap)
    .onEnd(() => {
      runOnJS(onSinglePress)();
    });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(doubleTap, singleTap)}>
      {content}
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
