import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { STORY_DURATION_MS } from "../constants/types";

type StoryProgressBarProps = {
  active: boolean;
  completed: boolean;
};

export function StoryProgressBar({ active, completed }: StoryProgressBarProps) {
  const progress = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    if (completed) {
      progress.value = 1;
      return;
    }
    if (!active) {
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration: STORY_DURATION_MS });
  }, [active, completed, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progress.value)) * 100}%`,
  }));

  return (
    <View className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
      <Animated.View className="h-full bg-white" style={fillStyle} />
    </View>
  );
}
