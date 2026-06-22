import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SharePostSheetProps = {
  visible: boolean;
  canRepost: boolean;
  canShareToStory: boolean;
  loading?: boolean;
  onClose: () => void;
  onRepost: () => void;
  onStory: () => void;
  onExternalShare: () => void;
};

type ShareOptionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function ShareOption({ icon, label, onPress, disabled }: ShareOptionProps) {
  return (
    <Pressable
      className={`flex-row items-center px-5 py-4 active:bg-gray-50 ${
        disabled ? "opacity-40" : ""
      }`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-gray-100">
        <Ionicons name={icon} size={22} color="#111827" />
      </View>
      <Text className="flex-1 text-base font-medium text-gray-900">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </Pressable>
  );
}

export function SharePostSheet({
  visible,
  canRepost,
  canShareToStory,
  loading = false,
  onClose,
  onRepost,
  onStory,
  onExternalShare,
}: SharePostSheetProps) {
  const insets = useSafeAreaInsets();

  const handleBackdropPress = (event: GestureResponderEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/45"
        onPress={handleBackdropPress}
        accessibilityLabel="Kapat"
      >
        <Pressable
          className="overflow-hidden rounded-t-3xl bg-white"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          onPress={(event) => event.stopPropagation()}
        >
          <View className="items-center pb-2 pt-3">
            <View className="h-1 w-10 rounded-full bg-gray-300" />
          </View>

          <Text className="border-b border-gray-100 px-5 pb-4 text-center text-base font-semibold text-gray-900">
            Paylaş
          </Text>

          {canRepost ? (
            <ShareOption
              icon="repeat"
              label="Akışa paylaş"
              onPress={onRepost}
              disabled={loading}
            />
          ) : null}

          {canShareToStory ? (
            <ShareOption
              icon="ellipse-outline"
              label="Story'ye ekle"
              onPress={onStory}
              disabled={loading}
            />
          ) : null}

          <ShareOption
            icon="share-outline"
            label="Başka uygulamada paylaş"
            onPress={onExternalShare}
            disabled={loading}
          />

          <View className="border-t border-gray-100 px-5 pt-2">
            <Pressable
              className="items-center py-3.5"
              onPress={onClose}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="İptal"
            >
              <Text className="text-base font-semibold text-gray-500">İptal</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
