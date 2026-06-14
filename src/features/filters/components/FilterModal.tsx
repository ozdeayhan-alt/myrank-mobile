import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import type { UserMetadata } from "@/features/profile/types";
import {
  getFieldConfig,
  getOptionsForField,
  isCityFieldDisabled,
  type FilterFieldKey,
  type FilterType,
} from "../config/filterFields";
import { validateAgeValue } from "../utils/applyFieldValue";
import { FilterModalOptionsList } from "./FilterModalOptionsList";

type FilterModalProps = {
  visible: boolean;
  field: FilterFieldKey | null;
  filterType: FilterType;
  title: string;
  filters: UserMetadata;
  onApply: (value: string | number | null) => void;
  onClose: () => void;
  allowCustomValue?: boolean;
};

export function FilterModal({
  visible,
  field,
  filterType,
  title,
  filters,
  onApply,
  onClose,
  allowCustomValue = true,
}: FilterModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const config = getFieldConfig(field);
  const isAge = field === "age";
  const cityRequiresCountry = field === "city" && isCityFieldDisabled(filters);

  useEffect(() => {
    if (!visible || !field) {
      setSearchQuery("");
      setCustomValue("");
      setValidationError(null);
      return;
    }

    if (field === "age") {
      setCustomValue(
        filters.age !== null && filters.age > 0 ? String(filters.age) : ""
      );
    } else {
      const current = filters[field];
      setCustomValue(typeof current === "string" ? current : "");
    }
    setSearchQuery("");
    setValidationError(null);
  }, [visible, field, filters]);

  const options = useMemo(() => {
    if (!field) return [];
    const base = getOptionsForField(field, filters);
    const q = searchQuery.trim().toLowerCase();
    if (filterType !== "searchable" || !q) {
      return base;
    }
    return base.filter((item) => item.toLowerCase().includes(q));
  }, [field, filterType, searchQuery, filters]);

  const handleSelectOption = (option: string) => {
    if (!field) return;
    if (isAge) {
      onApply(Number.parseInt(option, 10));
      return;
    }
    onApply(option);
  };

  const handleApplyCustom = () => {
    if (!field) return;

    if (isAge) {
      const error = validateAgeValue(customValue);
      if (error) {
        setValidationError(error);
        return;
      }
      const trimmed = customValue.trim();
      onApply(trimmed ? Number.parseInt(trimmed, 10) : null);
      return;
    }

    onApply(customValue.trim() || null);
  };

  const handleClear = () => {
    if (!field) return;
    onApply(isAge ? null : "");
  };

  if (!field || !config) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="max-h-[75%] rounded-t-3xl bg-white px-5 pb-8 pt-5"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text className="text-base font-semibold text-gray-700">
                Kapat
              </Text>
            </Pressable>
          </View>

          {cityRequiresCountry ? (
            <Text className="mb-4 text-sm text-gray-500">
              Şehir seçmek için önce ülke seçin.
            </Text>
          ) : null}

          {filterType === "searchable" && !isAge && !cityRequiresCountry ? (
            <TextInput
              className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholder={`${title} ara…`}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
              autoCorrect={false}
            />
          ) : null}

          {isAge && allowCustomValue ? (
            <TextInput
              className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholder="Yaş girin (1–120)"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={customValue}
              onChangeText={(text) => {
                setCustomValue(text);
                setValidationError(null);
              }}
            />
          ) : filterType === "searchable" && allowCustomValue && !cityRequiresCountry ? (
            <TextInput
              className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholder={`Özel ${title.toLowerCase()} yazın`}
              placeholderTextColor="#9CA3AF"
              value={customValue}
              onChangeText={setCustomValue}
              autoCapitalize="words"
            />
          ) : null}

          {validationError ? (
            <Text className="mb-2 text-sm text-red-600">{validationError}</Text>
          ) : null}

          {!cityRequiresCountry ? (
            <FilterModalOptionsList
              field={field}
              filters={filters}
              options={options}
              isAge={isAge}
              onSelectOption={handleSelectOption}
            />
          ) : null}

          {!cityRequiresCountry ? (
            <View className="mt-4 flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-xl border border-gray-200 py-3"
                onPress={handleClear}
              >
                <Text className="font-semibold text-gray-600">Temizle</Text>
              </Pressable>
              {(isAge || (filterType === "searchable" && allowCustomValue)) && (
                <Pressable
                  className="flex-1 items-center rounded-xl border border-gray-200 bg-white py-3"
                  onPress={handleApplyCustom}
                >
                  <Text className="font-semibold text-gray-900">Uygula</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
