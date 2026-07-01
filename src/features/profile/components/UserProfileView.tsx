import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Text, View } from "react-native";
import { clearReelsNavigationForProfileVisit } from "../navigateToAuthorProfile";
import { useRemoteProfileScreen } from "../hooks/useRemoteProfileScreen";
import { ProfileContent } from "./ProfileContent";

type UserProfileViewProps = {
  userId: string;
  displayName?: string;
  photoURL?: string;
};

export function UserProfileView({
  userId,
  displayName,
  photoURL,
}: UserProfileViewProps) {
  useFocusEffect(
    useCallback(() => {
      clearReelsNavigationForProfileVisit();
    }, [])
  );

  const profile = useRemoteProfileScreen(userId, { displayName, photoURL });

  if (profile.fatalError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-sm text-red-700">
          {profile.fatalError}
        </Text>
      </View>
    );
  }

  return (
    <ProfileContent
      userId={userId}
      displayName={profile.displayName}
      photoURL={profile.photoURL}
      bio={profile.bio}
      bioCategoryVisibility={profile.bioCategoryVisibility}
      loadedTotalScore={profile.loadedTotalScore}
      metadata={profile.metadata}
      isOwnProfile={false}
    />
  );
}
