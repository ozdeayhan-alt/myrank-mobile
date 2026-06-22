import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { fetchStoriesFeed } from "../api/fetchStoriesFeed";
import { groupStoriesByUser } from "../lib/groupStoriesByUser";
import { getSeenStoryIds } from "../lib/storySeenStorage";
import type { StoryUserGroup } from "../lib/groupStoriesByUser";

type StoryRingsRowProps = {
  currentUserId: string | null;
  currentUserDisplayName: string;
  currentUserPhotoURL?: string | null;
  reloadSignal?: number;
};

type StoryRingItem = {
  key: string;
  label: string;
  photoURL?: string | null;
  hasUnseen: boolean;
  isSelf?: boolean;
  onPress: () => void;
};

const AVATAR_SIZE = 56;
const LOADING_MIN_HEIGHT = AVATAR_SIZE + 28;

function StoryRing({
  label,
  photoURL,
  hasUnseen,
  isSelf,
  onPress,
}: Omit<StoryRingItem, "key">) {
  const initials = label.trim().charAt(0).toUpperCase() || "?";

  return (
    <Pressable
      className="mr-3 items-center"
      style={{ width: 72 }}
      onPress={onPress}
    >
      <View
        className={`rounded-full p-0.5 ${
          hasUnseen ? "bg-pink-500" : "bg-gray-300"
        }`}
      >
        <View className="rounded-full border-2 border-white bg-white p-0.5">
          {photoURL ? (
            <Image
              source={{ uri: photoURL }}
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
              }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
              }}
              className="items-center justify-center bg-gray-200"
            >
              <Text className="text-lg font-semibold text-gray-600">
                {initials}
              </Text>
            </View>
          )}
          {isSelf ? (
            <View className="absolute bottom-0 right-0 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-900">
              <Text className="text-xs font-bold text-white">+</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text
        className="mt-1.5 w-full text-center text-xs text-gray-700"
        numberOfLines={1}
      >
        {isSelf ? "Story'in" : label}
      </Text>
    </Pressable>
  );
}

export function StoryRingsRow({
  currentUserId,
  currentUserDisplayName,
  currentUserPhotoURL,
  reloadSignal = 0,
}: StoryRingsRowProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<StoryUserGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentUserId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [stories, seenStoryIds] = await Promise.all([
        fetchStoriesFeed(),
        getSeenStoryIds(),
      ]);
      setGroups(groupStoriesByUser(stories, seenStoryIds));
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void load();
  }, [load, reloadSignal]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const selfGroup = useMemo(
    () => groups.find((group) => group.userId === currentUserId) ?? null,
    [currentUserId, groups]
  );

  const otherGroups = useMemo(
    () => groups.filter((group) => group.userId !== currentUserId),
    [currentUserId, groups]
  );

  const openUserStories = useCallback(
    (userId: string, storyId: string) => {
      router.push({
        pathname: "/stories/view",
        params: { userId, storyId, scope: "ring" },
      });
    },
    [router]
  );

  const openCreate = useCallback(() => {
    router.push("/stories/create");
  }, [router]);

  const ringItems = useMemo((): StoryRingItem[] => {
    const selfItem: StoryRingItem = {
      key: `self-${currentUserId ?? "unknown"}`,
      label: currentUserDisplayName,
      photoURL: currentUserPhotoURL ?? selfGroup?.photoURL,
      hasUnseen: selfGroup?.hasUnseen ?? false,
      isSelf: true,
      onPress: () => {
        if (selfGroup?.stories[0]) {
          openUserStories(selfGroup.userId, selfGroup.stories[0].id);
          return;
        }
        openCreate();
      },
    };

    const others = otherGroups.map((group) => ({
      key: group.userId,
      label: group.displayName,
      photoURL: group.photoURL,
      hasUnseen: group.hasUnseen,
      onPress: () => {
        if (group.stories[0]) {
          openUserStories(group.userId, group.stories[0].id);
        }
      },
    }));

    return [selfItem, ...others];
  }, [
    currentUserDisplayName,
    currentUserId,
    currentUserPhotoURL,
    openCreate,
    openUserStories,
    otherGroups,
    selfGroup,
  ]);

  if (!currentUserId) {
    return null;
  }

  if (loading && groups.length === 0) {
    return (
      <View
        className="items-center justify-center py-3"
        style={{ minHeight: LOADING_MIN_HEIGHT }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={ringItems}
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      style={{ flexGrow: 0 }}
      contentContainerStyle={{
        paddingHorizontal: 4,
        paddingTop: 4,
        paddingBottom: 8,
      }}
      renderItem={({ item }) => (
        <StoryRing
          label={item.label}
          photoURL={item.photoURL}
          hasUnseen={item.hasUnseen}
          isSelf={item.isSelf}
          onPress={item.onPress}
        />
      )}
    />
  );
}
