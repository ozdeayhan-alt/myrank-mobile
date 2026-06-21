import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { STORY_DURATION_MS, type AiStory } from "../constants/types";
import { StoryLayerComposer } from "./StoryLayerComposer";
import { StoryProgressBar } from "./StoryProgressBar";

type StoryViewerProps = {
  stories: AiStory[];
  initialIndex?: number;
  onClose?: () => void;
  onIndexChange?: (index: number) => void;
};

export function StoryViewer({
  stories,
  initialIndex = 0,
  onClose,
  onIndexChange,
}: StoryViewerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  const story = stories[index] ?? null;

  const goNext = useCallback(() => {
    setIndex((current) => {
      if (current >= stories.length - 1) {
        onClose?.();
        return current;
      }
      return current + 1;
    });
  }, [onClose, stories.length]);

  const goPrev = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  useEffect(() => {
    if (!story) {
      return;
    }
    const timer = setTimeout(goNext, STORY_DURATION_MS);
    return () => clearTimeout(timer);
  }, [goNext, index, story]);

  const progress = useMemo(
    () =>
      stories.map((item, itemIndex) => ({
        id: item.id,
        active: itemIndex === index,
        completed: itemIndex < index,
      })),
    [index, stories]
  );

  if (!story) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View
        className="absolute z-10 flex-row gap-1 px-3"
        style={{ top: insets.top + 8, left: 0, right: 0 }}
      >
        {progress.map((item) => (
          <StoryProgressBar
            key={item.id}
            active={item.active}
            completed={item.completed}
          />
        ))}
      </View>

      {onClose ? (
        <Pressable
          className="absolute z-10 rounded-full bg-black/40 px-3 py-1"
          style={{ top: insets.top + 24, right: 12 }}
          onPress={onClose}
        >
          <Text className="text-sm font-semibold text-white">Kapat</Text>
        </Pressable>
      ) : null}

      <StoryLayerComposer story={story} active />

      <View className="absolute inset-0 flex-row">
        <Pressable
          className="flex-1"
          onPress={goPrev}
          accessibilityLabel="Önceki story"
        />
        <Pressable
          style={{ width: width * 0.55 }}
          onPress={goNext}
          accessibilityLabel="Sonraki story"
        />
      </View>
    </View>
  );
}
