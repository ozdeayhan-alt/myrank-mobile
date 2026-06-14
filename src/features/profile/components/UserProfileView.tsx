import { Text, View } from "react-native";
import { usePublicProfile } from "../hooks/usePublicProfile";
import { ProfileContent } from "./ProfileContent";
import { ProfileLoadingSkeleton } from "./ProfileLoadingSkeleton";

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
  const profile = usePublicProfile(userId, { displayName, photoURL });

  if (profile.loading) {
    return <ProfileLoadingSkeleton />;
  }

  if (profile.error && !displayName?.trim()) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-sm text-red-700">{profile.error}</Text>
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
      loadedTotalScore={profile.totalScore}
      metadata={profile.metadata}
      isOwnProfile={false}
    />
  );
}
