import { Pressable, Text, View } from "react-native";
import type { StoryChip } from "../constants/types";

type StoryChipPickerProps = {
  label: string;
  chips: StoryChip[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
};

export function StoryChipPicker({
  label,
  chips,
  selectedKey,
  onSelect,
}: StoryChipPickerProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-gray-700">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {chips.map((chip) => {
          const selected = chip.key === selectedKey;
          return (
            <Pressable
              key={chip.key}
              onPress={() => onSelect(chip.key)}
              className={`rounded-full px-4 py-2 ${
                selected ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm ${
                  selected ? "font-semibold text-white" : "text-gray-700"
                }`}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
