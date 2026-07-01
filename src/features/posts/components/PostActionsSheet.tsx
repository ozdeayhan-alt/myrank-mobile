import {
  Modal,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DESTRUCTIVE_COLOR = "#ED4956";

export type PostSheetAction = {
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

type PostActionsSheetProps = {
  visible: boolean;
  actions: PostSheetAction[];
  onClose: () => void;
  headerTitle?: string;
  headerMessage?: string;
  cancelLabel?: string;
};

type ActionRowProps = {
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  showTopBorder: boolean;
  onPress: () => void;
};

function ActionRow({
  label,
  destructive,
  disabled,
  showTopBorder,
  onPress,
}: ActionRowProps) {
  return (
    <Pressable
      className={`items-center px-5 py-3.5 active:bg-gray-50 ${
        disabled ? "opacity-40" : ""
      } ${showTopBorder ? "border-t border-gray-100" : ""}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        className="text-base font-semibold"
        style={{ color: destructive ? DESTRUCTIVE_COLOR : "#111827" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PostActionsSheet({
  visible,
  actions,
  onClose,
  headerTitle,
  headerMessage,
  cancelLabel = "İptal",
}: PostActionsSheetProps) {
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
        <View
          className="px-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          onStartShouldSetResponder={() => true}
        >
          <View className="overflow-hidden rounded-2xl bg-white">
            {headerTitle ? (
              <View className="border-b border-gray-100 px-5 py-3.5">
                <Text className="text-center text-base font-semibold text-gray-900">
                  {headerTitle}
                </Text>
              </View>
            ) : null}

            {headerMessage ? (
              <View
                className={`px-5 py-3 ${headerTitle ? "" : "border-b border-gray-100"}`}
              >
                <Text className="text-center text-sm leading-5 text-gray-500">
                  {headerMessage}
                </Text>
              </View>
            ) : null}

            {actions.map((action, index) => (
              <ActionRow
                key={`${action.label}-${index}`}
                label={action.label}
                destructive={action.destructive}
                disabled={action.disabled}
                showTopBorder={index > 0 || Boolean(headerTitle || headerMessage)}
                onPress={() => {
                  onClose();
                  action.onPress();
                }}
              />
            ))}
          </View>

          <View className="mt-2 overflow-hidden rounded-2xl bg-white">
            <Pressable
              className="items-center px-5 py-3.5 active:bg-gray-50"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text className="text-base font-semibold text-gray-900">
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
