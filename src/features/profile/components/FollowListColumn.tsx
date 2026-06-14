import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { FollowUserSummary } from "@/features/profile/types/followLists";
import { SPINNER_COLOR } from "@/lib/uiClasses";

export type FollowListColumnState = {
  loaded: boolean;
  loading: boolean;
  users: FollowUserSummary[];
  nextCursor: string | null;
};

type FollowListColumnProps = {
  title: string;
  count: number;
  state: FollowListColumnState;
  emptyHint: string;
  listEmptyText: string;
  onLoad: () => void;
  onUserPress: (user: FollowUserSummary) => void;
};

export function FollowListColumn({
  title,
  count,
  state,
  emptyHint,
  listEmptyText,
  onLoad,
  onUserPress,
}: FollowListColumnProps) {
  return (
    <View className="flex-1 border-r border-gray-100">
      <Pressable
        onPress={onLoad}
        disabled={state.loading}
        className="items-center border-b border-gray-100 px-2 py-4"
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${count}`}
      >
        <Text className="text-center text-xs font-semibold text-gray-500">
          {title}
        </Text>
        {state.loading && !state.loaded ? (
          <ActivityIndicator size="small" color={SPINNER_COLOR} className="mt-2" />
        ) : (
          <Text className="mt-1 text-2xl font-bold text-gray-900">{count}</Text>
        )}
        {!state.loaded && !state.loading ? (
          <Text className="mt-1 text-center text-[10px] text-gray-400">
            {emptyHint}
          </Text>
        ) : null}
      </Pressable>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 12 }}
      >
        {!state.loaded ? (
          <View className="flex-1 items-center justify-center px-3 py-8">
            <Ionicons name="people-outline" size={28} color="#D1D5DB" />
          </View>
        ) : state.users.length === 0 ? (
          <View className="px-3 py-8">
            <Text className="text-center text-sm text-gray-500">
              {listEmptyText}
            </Text>
          </View>
        ) : (
          state.users.map((user) => (
            <Pressable
              key={user.userId}
              onPress={() => onUserPress(user)}
              className="flex-row items-center px-3 py-2.5"
              accessibilityRole="button"
              accessibilityLabel={user.displayName}
            >
              <ProfileAvatar
                size={40}
                photoURL={user.photoURL ?? ""}
                fallbackLetter={user.displayName.slice(0, 1).toUpperCase()}
              />
              <Text
                className="ml-2.5 flex-1 text-sm font-semibold text-gray-900"
                numberOfLines={1}
              >
                {user.displayName}
              </Text>
            </Pressable>
          ))
        )}
        {state.loading && state.loaded ? (
          <ActivityIndicator size="small" color={SPINNER_COLOR} className="py-3" />
        ) : null}
      </ScrollView>
    </View>
  );
}
