import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { ProfileAvatar } from "@/features/profile";
import { useUserStoryAvailability } from "../hooks/useUserStoryAvailability";

type ProfileStoryAvatarProps = {
  userId: string;
  photoURL?: string | null;
  fallbackLetter: string;
  size?: number;
  reloadSignal?: number;
};

export function ProfileStoryAvatar({
  userId,
  photoURL,
  fallbackLetter,
  size = 108,
  reloadSignal = 0,
}: ProfileStoryAvatarProps) {
  const router = useRouter();
  const { hasStories, hasUnseen, firstStoryId, reload } = useUserStoryAvailability(
    userId,
    reloadSignal
  );

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const avatar = (
    <ProfileAvatar
      photoURL={photoURL}
      fallbackLetter={fallbackLetter}
      size={hasStories ? size - 6 : size}
    />
  );

  if (!hasStories || !firstStoryId) {
    return avatar;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Story izle"
      onPress={() => {
        router.push({
          pathname: "/stories/view",
          params: { userId, storyId: firstStoryId, scope: "singleUser" },
        });
      }}
    >
      <View
        className={`rounded-full p-[3px] ${
          hasUnseen ? "bg-pink-500" : "bg-gray-300"
        }`}
      >
        {avatar}
      </View>
    </Pressable>
  );
}
