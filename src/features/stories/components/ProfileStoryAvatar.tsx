import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { StoryRingAvatar } from "./StoryRingAvatar";
import { useStoriesRingStore } from "../store/useStoriesRingStore";

type ProfileStoryAvatarProps = {
  userId: string;
  photoURL?: string | null;
  fallbackLetter: string;
  size?: number;
  isOwnProfile?: boolean;
  reloadSignal?: number;
};

export function ProfileStoryAvatar({
  userId,
  photoURL,
  fallbackLetter,
  size = 108,
  isOwnProfile = false,
  reloadSignal = 0,
}: ProfileStoryAvatarProps) {
  const reload = useStoriesRingStore((state) => state.reload);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  useEffect(() => {
    void reload();
  }, [reload, reloadSignal]);

  return (
    <StoryRingAvatar
      userId={userId}
      photoURL={photoURL}
      fallbackLetter={fallbackLetter}
      size={size}
      isOwnProfile={isOwnProfile}
    />
  );
}
