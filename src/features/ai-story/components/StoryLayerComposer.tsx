import { Image } from "expo-image";
import { Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  ACTION_CHIPS,
  chipLabel,
  LOCATION_CHIPS,
  MOOD_CHIPS,
} from "../constants/chips";
import type { AiStory } from "../constants/types";

type StoryLayerComposerProps = {
  story: AiStory;
  active: boolean;
};

export function StoryLayerComposer({ story, active }: StoryLayerComposerProps) {
  const scale = useSharedValue(1);
  const player = useVideoPlayer(story.template.backgroundUrl, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });

  useEffect(() => {
    if (active) {
      player.play();
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2500 }),
          withTiming(1, { duration: 2500 })
        ),
        -1,
        true
      );
      return;
    }
    player.pause();
    scale.value = 1;
  }, [active, player, scale]);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const mood = chipLabel(MOOD_CHIPS, story.moodKey);
  const location = chipLabel(LOCATION_CHIPS, story.locationKey);
  const action = chipLabel(ACTION_CHIPS, story.actionKey);

  return (
    <View className="flex-1 bg-black">
      <Animated.View className="absolute inset-0" style={zoomStyle}>
        <VideoView
          player={player}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          nativeControls={false}
        />
      </Animated.View>

      <View className="absolute inset-0 bg-black/20" />

      <View className="absolute bottom-24 left-5 right-5">
        <View className="mb-4 flex-row items-center">
          {story.authorPhotoURL ? (
            <Image
              source={{ uri: story.authorPhotoURL }}
              className="mr-3 h-12 w-12 rounded-full border-2 border-white"
            />
          ) : (
            <View className="mr-3 h-12 w-12 rounded-full border-2 border-white bg-gray-300" />
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold text-white">
              {story.authorDisplayName}
            </Text>
            <Text className="text-sm text-white/80">
              {mood} · {location} · {action}
            </Text>
          </View>
        </View>

        {story.caption ? (
          <Text className="text-lg font-medium text-white">{story.caption}</Text>
        ) : null}
      </View>
    </View>
  );
}
