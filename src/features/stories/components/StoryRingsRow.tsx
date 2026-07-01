import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useStoriesRingStore } from "../store/useStoriesRingStore";
import { StoryAddBadge } from "./StoryAddBadge";

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
  onAddPress?: () => void;
};

const AVATAR_SIZE = 56;
const LOADING_MIN_HEIGHT = AVATAR_SIZE + 28;

function StoryRing({
  label,
  photoURL,
  hasUnseen,
  isSelf,
  onPress,
  onAddPress,
}: Omit<StoryRingItem, "key">) {
  const initials = label.trim().charAt(0).toUpperCase() || "?";

  return (
    <View className="mr-3 items-center" style={{ width: 72, overflow: "visible" }}>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View
          className={`rounded-full p-0.5 ${
            hasUnseen ? "bg-pink-500" : "bg-gray-300"
          }`}
        >
          <View
            className="rounded-full border-2 border-white bg-white p-0.5"
            style={{ position: "relative", overflow: "visible" }}
          >
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
            {isSelf && onAddPress ? (
              <StoryAddBadge onPress={onAddPress} />
            ) : null}
          </View>
        </View>
      </Pressable>
      <Text
        className="mt-2.5 w-full text-center text-xs text-gray-700"
        numberOfLines={1}
      >
        {isSelf ? "Story'in" : label}
      </Text>
    </View>
  );
}

export function StoryRingsRow({
  currentUserId,
  currentUserDisplayName,
  currentUserPhotoURL,
  reloadSignal = 0,
}: StoryRingsRowProps) {
  const router = useRouter();
  const groups = useStoriesRingStore((state) => state.groups);
  const loading = useStoriesRingStore((state) => state.loading);
  const reload = useStoriesRingStore((state) => state.reload);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }
    void reload();
  }, [currentUserId, reload, reloadSignal]);

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
      onAddPress: openCreate,
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
      style={{ flexGrow: 0, overflow: "visible" }}
      contentContainerStyle={{
        paddingHorizontal: 4,
        paddingTop: 4,
        paddingBottom: 12,
      }}
      renderItem={({ item }) => (
        <StoryRing
          label={item.label}
          photoURL={item.photoURL}
          hasUnseen={item.hasUnseen}
          isSelf={item.isSelf}
          onPress={item.onPress}
          onAddPress={item.onAddPress}
        />
      )}
    />
  );
}
