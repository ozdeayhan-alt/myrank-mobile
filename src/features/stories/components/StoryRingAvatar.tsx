import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { ProfileAvatar } from "@/features/profile";
import { useAuthorStoryRing } from "../hooks/useAuthorStoryRing";

function ringPaddingForSize(size: number): number {
  return size >= 72 ? 3 : 2;
}

type StoryRingAvatarProps = {
  userId: string;
  photoURL?: string | null;
  fallbackLetter: string;
  size: number;
  onPressWithoutStory?: () => void;
};

export function StoryRingAvatar({
  userId,
  photoURL,
  fallbackLetter,
  size,
  onPressWithoutStory,
}: StoryRingAvatarProps) {
  const router = useRouter();
  const { hasStories, hasUnseen, firstStoryId } = useAuthorStoryRing(userId);
  const ringPadding = ringPaddingForSize(size);
  const innerSize = hasStories ? size - ringPadding * 2 : size;

  const avatar = (
    <ProfileAvatar
      photoURL={photoURL}
      fallbackLetter={fallbackLetter}
      size={innerSize}
    />
  );

  const openStory = () => {
    if (!firstStoryId) {
      return;
    }
    router.push({
      pathname: "/stories/view",
      params: { userId, storyId: firstStoryId, scope: "singleUser" },
    });
  };

  if (!hasStories || !firstStoryId) {
    if (onPressWithoutStory) {
      return (
        <Pressable
          onPress={onPressWithoutStory}
          hitSlop={8}
          accessibilityRole="button"
        >
          {avatar}
        </Pressable>
      );
    }
    return avatar;
  }

  return (
    <Pressable
      onPress={openStory}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Story izle"
    >
      <View
        className={`rounded-full ${hasUnseen ? "bg-pink-500" : "bg-gray-300"}`}
        style={{ padding: ringPadding }}
      >
        {avatar}
      </View>
    </Pressable>
  );
}
