import { Pressable, Text, View } from "react-native";

export type HomeFeedMode = "following" | "global";

type HomeFeedModeToggleProps = {
  mode: HomeFeedMode;
  onModeChange: (mode: HomeFeedMode) => void;
};

export function HomeFeedModeToggle({
  mode,
  onModeChange,
}: HomeFeedModeToggleProps) {
  return (
    <View className="mb-4 flex-row rounded-full border border-gray-200 bg-gray-100/80 p-1">
      <Pressable
        onPress={() => onModeChange("following")}
        className={`flex-1 items-center rounded-full py-2.5 ${
          mode === "following" ? "bg-white shadow-sm" : ""
        }`}
        accessibilityRole="button"
        accessibilityState={{ selected: mode === "following" }}
      >
        <Text
          className={`text-sm font-semibold ${
            mode === "following" ? "text-gray-900" : "text-gray-500"
          }`}
        >
          Takip
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onModeChange("global")}
        className={`flex-1 items-center rounded-full py-2.5 ${
          mode === "global" ? "bg-white shadow-sm" : ""
        }`}
        accessibilityRole="button"
        accessibilityState={{ selected: mode === "global" }}
      >
        <Text
          className={`text-sm font-semibold ${
            mode === "global" ? "text-gray-900" : "text-gray-500"
          }`}
        >
          Global
        </Text>
      </Pressable>
    </View>
  );
}
