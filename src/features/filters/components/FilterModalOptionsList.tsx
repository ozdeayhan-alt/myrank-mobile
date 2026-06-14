import { FlatList, Pressable, Text } from "react-native";
import type { UserMetadata } from "@/features/profile/types";
import type { FilterFieldKey } from "../config/filterFields";

type FilterModalOptionsListProps = {
  field: FilterFieldKey;
  filters: UserMetadata;
  options: string[];
  isAge: boolean;
  onSelectOption: (option: string) => void;
};

export function FilterModalOptionsList({
  field,
  filters,
  options,
  isAge,
  onSelectOption,
}: FilterModalOptionsListProps) {
  return (
    <FlatList
      data={options}
      keyExtractor={(item) => item}
      style={{ maxHeight: 280 }}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <Text className="py-6 text-center text-sm text-gray-500">
          Sonuç bulunamadı.
        </Text>
      }
      renderItem={({ item }) => {
        const selected = isAge
          ? filters.age !== null && String(filters.age) === item
          : filters[field] === item;

        return (
          <Pressable
            className={`mb-2 rounded-xl border px-4 py-3 ${
              selected
                ? "border-gray-400 bg-gray-50"
                : "border-gray-100 bg-gray-50"
            }`}
            onPress={() => onSelectOption(item)}
          >
            <Text
              className={`text-base ${
                selected ? "font-semibold text-gray-900" : "text-gray-800"
              }`}
            >
              {item}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
