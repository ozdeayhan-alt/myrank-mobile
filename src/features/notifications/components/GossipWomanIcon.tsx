import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type GossipWomanIconProps = {
  onPress: () => void;
  speaking?: boolean;
  disabled?: boolean;
};

export function GossipWomanIcon({
  onPress,
  speaking = false,
  disabled = false,
}: GossipWomanIconProps) {
  return (
    <Pressable
      className="ml-2 h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white"
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Dedikoducu kadın, bildirimleri sesli oku"
    >
      {speaking ? (
        <ActivityIndicator size="small" color="#374151" />
      ) : (
        <View className="items-center">
          <Ionicons name="woman-outline" size={22} color="#374151" />
          <Ionicons
            name="chatbubble-ellipses"
            size={12}
            color="#6366F1"
            style={{ marginTop: -4 }}
          />
        </View>
      )}
    </Pressable>
  );
}
