import { Alert } from "react-native";
import type { ReportReason } from "../api/reportContent";
import { REPORT_PICKER_MESSAGE } from "./reportFeedback";

const REPORT_OPTIONS: { reason: ReportReason; label: string }[] = [
  { reason: "spam", label: "Spam" },
  { reason: "harassment", label: "Taciz" },
  { reason: "inappropriate", label: "Uygunsuz içerik" },
  { reason: "other", label: "Diğer" },
];

export function showReportReasonPicker(
  onSelect: (reason: ReportReason) => void
): void {
  Alert.alert(
    "Şikayet et",
    REPORT_PICKER_MESSAGE,
    [
      ...REPORT_OPTIONS.map((option) => ({
        text: option.label,
        onPress: () => onSelect(option.reason),
      })),
      { text: "Vazgeç", style: "cancel" },
    ]
  );
}
