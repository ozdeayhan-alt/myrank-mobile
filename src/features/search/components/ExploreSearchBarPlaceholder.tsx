import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type ExploreSearchBarPlaceholderProps = {
  onPress: () => void;
  compact?: boolean;
};

export function ExploreSearchBarPlaceholder({
  onPress,
  compact = false,
}: ExploreSearchBarPlaceholderProps) {
  return (
    <View
      className={`border-b border-gray-100 bg-white px-4 ${
        compact ? "py-1.5" : "py-3"
      }`}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Kişi ara"
        className="flex-row items-center gap-2"
      >
        <View
          className={`flex-1 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 ${
            compact ? "px-2.5" : "px-3"
          }`}
        >
          <Ionicons
            name="search-outline"
            size={compact ? 15 : 18}
            color="#9CA3AF"
          />
          <Text
            className={`ml-2 flex-1 text-gray-400 ${
              compact ? "py-1.5 text-xs" : "py-3 text-base"
            }`}
          >
            Kişi ara…
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
