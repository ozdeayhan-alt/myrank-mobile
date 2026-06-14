import { Alert } from "react-native";

type ShareOptionsParams = {
  canRepost: boolean;
  onRepost: () => void;
  onExternalShare: () => void;
};

export function openShareOptions({
  canRepost,
  onRepost,
  onExternalShare,
}: ShareOptionsParams): void {
  const buttons: {
    text: string;
    onPress?: () => void;
    style?: "cancel" | "default" | "destructive";
  }[] = [];

  if (canRepost) {
    buttons.push({ text: "Akışa paylaş", onPress: onRepost });
  }

  buttons.push({ text: "Dış paylaş", onPress: onExternalShare });
  buttons.push({ text: "İptal", style: "cancel" });

  Alert.alert("Paylaş", undefined, buttons);
}
