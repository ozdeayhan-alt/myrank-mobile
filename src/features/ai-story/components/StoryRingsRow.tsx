import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { fetchAiStoriesFeed } from "../api/fetchAiStoriesFeed";
import {
  groupStoriesByUser,
  type StoryUserGroup,
} from "../lib/groupStoriesByUser";

type StoryRingsRowProps = {
  currentUserId: string | null;
  currentUserPhotoURL?: string | null;
  currentUserDisplayName?: string;
  reloadSignal?: number;
};

type StoryRingProps = {
  label: string;
  photoURL?: string | null;
  hasStory: boolean;
  isSelf?: boolean;
  onPress: () => void;
};

function StoryRing({
  label,
  photoURL,
  hasStory,
  isSelf = false,
  onPress,
}: StoryRingProps) {
  const innerSize = 56;
  const outerSize = 64;

  return (
    <Pressable className="mr-3 items-center" onPress={onPress}>
      <View style={{ width: outerSize, height: outerSize }}>
        {hasStory ? (
          <LinearGradient
            colors={["#F97316", "#EC4899", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              className="items-center justify-center overflow-hidden rounded-full bg-white"
              style={{ width: innerSize + 4, height: innerSize + 4 }}
            >
              {photoURL ? (
                <Image
                  source={{ uri: photoURL }}
                  style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
                />
              ) : (
                <View
                  className="items-center justify-center bg-gray-200"
                  style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
                >
                  <Text className="text-lg font-semibold text-gray-600">
                    {label.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        ) : (
          <View
            className="items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50"
            style={{ width: outerSize, height: outerSize }}
          >
            {isSelf ? (
              <View className="h-7 w-7 items-center justify-center rounded-full bg-gray-900">
                <Text className="text-lg font-bold leading-none text-white">+</Text>
              </View>
            ) : photoURL ? (
              <Image
                source={{ uri: photoURL }}
                style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
              />
            ) : (
              <View
                className="items-center justify-center bg-gray-200"
                style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
              >
                <Text className="text-lg font-semibold text-gray-600">
                  {label.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      <Text
        className="mt-1.5 max-w-[72px] text-center text-xs text-gray-700"
        numberOfLines={1}
      >
        {isSelf ? "Story'n" : label.split(" ")[0]}
      </Text>
    </Pressable>
  );
}

export function StoryRingsRow({
  currentUserId,
  currentUserPhotoURL,
  currentUserDisplayName = "Sen",
  reloadSignal = 0,
}: StoryRingsRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<StoryUserGroup[]>([]);

  const load = useCallback(async () => {
    if (!currentUserId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const stories = await fetchAiStoriesFeed();
      setGroups(groupStoriesByUser(stories));
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void load();
  }, [load, reloadSignal]);

  const selfGroup = useMemo(
    () => groups.find((group) => group.userId === currentUserId) ?? null,
    [currentUserId, groups]
  );

  const otherGroups = useMemo(
    () => groups.filter((group) => group.userId !== currentUserId),
    [currentUserId, groups]
  );

  const openUserStories = (group: StoryUserGroup) => {
    const firstStory = group.stories[0];
    if (!firstStory) {
      return;
    }
    router.push({
      pathname: "/ai-story/view",
      params: { userId: group.userId, storyId: firstStory.id },
    });
  };

  const handleSelfPress = () => {
    if (selfGroup) {
      openUserStories(selfGroup);
      return;
    }
    router.push("/ai-story/create");
  };

  if (!currentUserId) {
    return null;
  }

  if (loading && groups.length === 0) {
    return (
      <View className="mb-3 h-[92px] items-center justify-center">
        <ActivityIndicator size="small" color="#6B7280" />
      </View>
    );
  }

  return (
    <View className="mb-2 border-b border-gray-100 pb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
      >
        <StoryRing
          label={currentUserDisplayName}
          photoURL={currentUserPhotoURL ?? selfGroup?.photoURL}
          hasStory={Boolean(selfGroup?.stories.length)}
          isSelf
          onPress={handleSelfPress}
        />
        {otherGroups.map((group) => (
          <StoryRing
            key={group.userId}
            label={group.displayName}
            photoURL={group.photoURL}
            hasStory
            onPress={() => openUserStories(group)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
