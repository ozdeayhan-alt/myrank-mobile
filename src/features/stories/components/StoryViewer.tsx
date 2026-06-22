import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { STORY_IMAGE_DURATION_MS, type Story } from "../constants/types";
import { StoryMediaLayer } from "./StoryMediaLayer";
import { StoryProgressBar } from "./StoryProgressBar";

const DISMISS_DRAG_THRESHOLD = 80;
const DISMISS_VELOCITY_THRESHOLD = 900;

type StoryViewerProps = {
  stories: Story[];
  initialIndex?: number;
  onClose?: () => void;
  onStoryViewed?: (storyId: string) => void;
};

export function StoryViewer({
  stories,
  initialIndex = 0,
  onClose,
  onStoryViewed,
}: StoryViewerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const [playbackReady, setPlaybackReady] = useState(false);
  const [slideDurationMs, setSlideDurationMs] = useState(STORY_IMAGE_DURATION_MS);
  const onCloseRef = useRef(onClose);
  const onStoryViewedRef = useRef(onStoryViewed);
  const markedStoryIdsRef = useRef<Set<string>>(new Set());
  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);

  onCloseRef.current = onClose;
  onStoryViewedRef.current = onStoryViewed;

  const story = stories[index] ?? null;

  const markStoryViewed = useCallback((storyId: string) => {
    if (markedStoryIdsRef.current.has(storyId)) {
      return;
    }
    markedStoryIdsRef.current.add(storyId);
    onStoryViewedRef.current?.(storyId);
  }, []);

  const dismissViewer = useCallback(() => {
    if (story) {
      markStoryViewed(story.id);
    }
    onCloseRef.current?.();
  }, [markStoryViewed, story]);

  const resetDismissDrag = useCallback(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 220 });
    backdropOpacity.value = withSpring(1, { damping: 20, stiffness: 220 });
  }, [backdropOpacity, translateY]);

  const goNext = useCallback(() => {
    setIndex((current) => {
      const currentStory = stories[current];
      if (currentStory) {
        markStoryViewed(currentStory.id);
      }
      if (current >= stories.length - 1) {
        onCloseRef.current?.();
        return current;
      }
      return current + 1;
    });
  }, [markStoryViewed, stories]);

  const goPrev = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  useEffect(() => {
    setPlaybackReady(false);
    setSlideDurationMs(STORY_IMAGE_DURATION_MS);
    translateY.value = 0;
    backdropOpacity.value = 1;
  }, [backdropOpacity, index, story?.id, translateY]);

  useEffect(() => {
    if (!story || !playbackReady) {
      return;
    }
    markStoryViewed(story.id);
    const timer = setTimeout(goNext, slideDurationMs);
    return () => clearTimeout(timer);
  }, [goNext, markStoryViewed, playbackReady, slideDurationMs, story]);

  const handlePlaybackReady = useCallback(() => {
    setPlaybackReady(true);
  }, []);

  const handleDurationResolved = useCallback((durationMs: number) => {
    setSlideDurationMs(durationMs);
  }, []);

  const handlePlaybackEnd = useCallback(() => {
    goNext();
  }, [goNext]);

  const dismissPan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(12)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
          if (event.translationY <= 0) {
            return;
          }
          translateY.value = event.translationY;
          backdropOpacity.value = Math.max(0.35, 1 - event.translationY / 320);
        })
        .onEnd((event) => {
          if (
            event.translationY >= DISMISS_DRAG_THRESHOLD ||
            event.velocityY >= DISMISS_VELOCITY_THRESHOLD
          ) {
            runOnJS(dismissViewer)();
            return;
          }
          runOnJS(resetDismissDrag)();
        }),
    [backdropOpacity, dismissViewer, resetDismissDrag, translateY]
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const progress = useMemo(
    () =>
      stories.map((item, itemIndex) => ({
        id: item.id,
        active: itemIndex === index,
        completed: itemIndex < index,
        durationMs:
          itemIndex === index ? slideDurationMs : STORY_IMAGE_DURATION_MS,
      })),
    [index, slideDurationMs, stories]
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
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, backdropStyle]}
        className="bg-black"
      />

      <GestureDetector gesture={dismissPan}>
        <Animated.View style={[{ flex: 1 }, sheetStyle]}>
          <View
            className="absolute z-10 flex-row gap-1 px-3"
            style={{ top: insets.top + 8, left: 0, right: 0 }}
          >
            {progress.map((item) => (
              <StoryProgressBar
                key={item.id}
                active={item.active && playbackReady}
                completed={item.completed}
                durationMs={item.durationMs}
              />
            ))}
          </View>

          {onClose ? (
            <Pressable
              className="absolute z-10 rounded-full bg-black/40 px-3 py-1"
              style={{ top: insets.top + 24, right: 12 }}
              onPress={dismissViewer}
            >
              <Text className="text-sm font-semibold text-white">Kapat</Text>
            </Pressable>
          ) : null}

          <StoryMediaLayer
            story={story}
            active
            onPlaybackReady={handlePlaybackReady}
            onDurationResolved={handleDurationResolved}
            onPlaybackEnd={handlePlaybackEnd}
          />

          <View className="absolute inset-0 z-20 flex-row">
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
        </Animated.View>
      </GestureDetector>
    </View>
  );
}