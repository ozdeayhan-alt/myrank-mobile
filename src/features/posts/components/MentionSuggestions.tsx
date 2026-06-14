import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { searchUsers } from "@/features/search";

type MentionSuggestionsProps = {
  query: string;
  onSelect: (displayName: string) => void;
};

export function MentionSuggestions({ query, onSelect }: MentionSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<
    { userId: string; displayName: string; photoURL?: string | null }[]
  >([]);

  const activeQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (activeQuery.length < 2) {
      setUsers([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const result = await searchUsers(activeQuery);
        if (!cancelled) {
          setUsers(result.users.slice(0, 6));
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeQuery]);

  if (activeQuery.length < 2) {
    return null;
  }

  if (loading && users.length === 0) {
    return (
      <View className="mb-2 items-center py-2">
        <ActivityIndicator size="small" color="#6B7280" />
      </View>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <View className="mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {users.map((entry) => (
        <Pressable
          key={entry.userId}
          className="flex-row items-center border-b border-gray-100 px-3 py-2.5 last:border-b-0"
          onPress={() => onSelect(entry.displayName)}
        >
          {entry.photoURL ? (
            <Image
              source={{ uri: entry.photoURL }}
              style={{ width: 28, height: 28, borderRadius: 14 }}
            />
          ) : (
            <View className="h-7 w-7 items-center justify-center rounded-full bg-gray-200">
              <Text className="text-xs font-semibold text-gray-600">
                {entry.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="ml-2 text-sm font-medium text-gray-800">
            @{entry.displayName}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
