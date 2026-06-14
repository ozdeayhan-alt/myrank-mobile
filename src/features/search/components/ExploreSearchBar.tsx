import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { Pressable, TextInput, View } from "react-native";

type ExploreSearchBarProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  onClear: () => void;
};

export const ExploreSearchBar = forwardRef<TextInput, ExploreSearchBarProps>(
  function ExploreSearchBar({ query, onChangeQuery, onClear }, ref) {
    return (
      <View className="border-b border-gray-100 bg-white px-4 py-3">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              ref={ref}
              className="ml-2 flex-1 py-3 text-base text-gray-900"
              placeholder="Kişi ara…"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={onChangeQuery}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="never"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={onClear}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Aramayı temizle"
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    );
  }
);
