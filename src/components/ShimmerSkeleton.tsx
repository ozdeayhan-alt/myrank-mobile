import { useEffect, useRef } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

type ShimmerSkeletonProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function ShimmerSkeleton({
  width = "100%",
  height,
  borderRadius = 8,
  className,
  style,
}: ShimmerSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.75,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      className={className ?? "bg-gray-200"}
      style={[
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}
