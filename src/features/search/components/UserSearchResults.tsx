import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useAuth } from "@/features/auth";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import { MIN_USER_SEARCH_LENGTH } from "../api/searchUsers";
import type { SearchUserResult } from "../types";
import { SPINNER_COLOR } from "@/lib/uiClasses";

type UserSearchResultsProps = {
  query: string;
  users: SearchUserResult[];
  loading: boolean;
  error: string | null;
};

export function UserSearchResults({
  query,
  users,
  loading,
  error,
}: UserSearchResultsProps) {
  const { user } = useAuth();
  const trimmed = query.trim();

  const handlePress = (item: SearchUserResult) => {
    navigateToAuthorProfile(item.userId, user?.uid, {
      displayName: item.displayName,
      photoURL: item.photoURL ?? undefined,
    });
  };

  if (trimmed.length > 0 && trimmed.length < MIN_USER_SEARCH_LENGTH) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-sm text-gray-500">
          Aramak için en az {MIN_USER_SEARCH_LENGTH} karakter yazın.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-sm text-red-600">{error}</Text>
      </View>
    );
  }

  if (loading && users.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color={SPINNER_COLOR} />
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.userId}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="bg-white py-2"
      ListHeaderComponent={
        trimmed.length >= MIN_USER_SEARCH_LENGTH ? (
          <Text className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Kişiler
          </Text>
        ) : null
      }
      ListEmptyComponent={
        !loading ? (
          <View className="px-6 py-10">
            <Text className="text-center text-sm text-gray-500">
              {`"${trimmed}" için kişi bulunamadı.`}
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => handlePress(item)}
          className="flex-row items-center px-4 py-3"
          accessibilityRole="button"
          accessibilityLabel={item.displayName}
        >
          <ProfileAvatar
            size={44}
            photoURL={item.photoURL ?? ""}
            fallbackLetter={item.displayName.slice(0, 1).toUpperCase()}
          />
          <Text
            className="ml-3 flex-1 text-base font-semibold text-gray-900"
            numberOfLines={1}
          >
            {item.displayName}
          </Text>
        </Pressable>
      )}
    />
  );
}
