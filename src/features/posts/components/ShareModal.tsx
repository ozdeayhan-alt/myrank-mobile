import { Dimensions, Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShareComposer } from "./ShareComposer";
import type { PostContentType } from "../types";

const SHEET_HEIGHT_RATIO = 0.85;

type ShareModalProps = {
  visible: boolean;
  initialType?: PostContentType;
  onClose: () => void;
  onCreated?: () => void;
};

export function ShareModal({
  visible,
  initialType = "tweet",
  onClose,
  onCreated,
}: ShareModalProps) {
  const insets = useSafeAreaInsets();
  const sheetHeight = Dimensions.get("window").height * SHEET_HEIGHT_RATIO;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityLabel="Kapat"
        />
        <View
          className="overflow-hidden rounded-t-3xl bg-white px-5 pt-3 shadow-2xl"
          style={{
            height: sheetHeight,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <ShareComposer
            key={`${visible}-${initialType}`}
            initialType={initialType}
            onClose={onClose}
            onCreated={onCreated}
            variant="sheet"
          />
        </View>
      </View>
    </Modal>
  );
}
