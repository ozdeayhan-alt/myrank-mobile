import { Modal, Pressable, Text, View } from "react-native";
import { LIKE_BONUS_TIERS, type BonusPoints } from "@/features/ranking/constants";
import { ui } from "@/lib/uiClasses";

type BonusPointsPickerProps = {
  variant: "like" | "dislike";
  visible: boolean;
  currentBonus?: BonusPoints | null;
  submitting?: boolean;
  onSelect: (points: BonusPoints) => void;
  onClose: () => void;
};

const COPY = {
  like: {
    title: "Beğeni bonusu",
    hint: "Ekstra puan seçin — kısa dokunuş beğeniden bağımsızdır.",
    emoji: "👍",
    sign: "+",
    selectedBorder: "border-indigo-500 bg-indigo-50",
    selectedText: "text-indigo-700",
    a11yPrefix: "puan bonus beğeni",
  },
  dislike: {
    title: "Beğenmeme bonusu",
    hint: "Ekstra ceza puanı seçin — kısa dokunuş beğenmemeden bağımsızdır.",
    emoji: "👎",
    sign: "−",
    selectedBorder: "border-red-500 bg-red-50",
    selectedText: "text-red-700",
    a11yPrefix: "puan bonus beğenmeme",
  },
} as const;

export function BonusPointsPicker({
  variant,
  visible,
  currentBonus,
  submitting = false,
  onSelect,
  onClose,
}: BonusPointsPickerProps) {
  const copy = COPY[variant];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
        disabled={submitting}
      >
        <Pressable
          className="rounded-t-3xl bg-white px-6 pb-10 pt-6"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="mb-1 text-lg font-bold text-gray-900">{copy.title}</Text>
          <Text className="mb-5 text-sm text-gray-500">{copy.hint}</Text>

          <View className="mb-4 flex-row justify-between gap-3">
            {LIKE_BONUS_TIERS.map((points) => {
              const selected = currentBonus === points;
              return (
                <Pressable
                  key={points}
                  className={`flex-1 items-center rounded-2xl border py-4 ${
                    selected ? copy.selectedBorder : "border-gray-200 bg-gray-50"
                  } ${submitting ? "opacity-60" : ""}`}
                  onPress={() => onSelect(points)}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel={`${points} ${copy.a11yPrefix}`}
                >
                  <Text className="text-2xl">{copy.emoji}</Text>
                  <Text
                    className={`mt-1 text-base font-bold ${
                      selected ? copy.selectedText : "text-gray-900"
                    }`}
                  >
                    {copy.sign}
                    {points}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            className="items-center py-2"
            onPress={onClose}
            disabled={submitting}
          >
            <Text className={`font-medium ${ui.inactiveText}`}>Vazgeç</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
