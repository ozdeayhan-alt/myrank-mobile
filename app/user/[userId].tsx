import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { UserProfileView } from "@/features/profile/components/UserProfileView";

export default function UserProfileScreen() {
  const { userId, displayName, photoURL } = useLocalSearchParams<{
    userId: string;
    displayName?: string;
    photoURL?: string;
  }>();

  if (!userId || typeof userId !== "string") {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-sm text-gray-600">
          Profil bulunamadı.
        </Text>
      </View>
    );
  }

  return (
    <TabScreenSafeArea className="flex-1 bg-white">
      <UserProfileView
        userId={userId}
        displayName={typeof displayName === "string" ? displayName : undefined}
        photoURL={typeof photoURL === "string" ? photoURL : undefined}
      />
    </TabScreenSafeArea>
  );
}
