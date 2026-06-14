import { Alert } from "react-native";

export const REPORT_PICKER_MESSAGE =
  "Uygunsuz içerikleri bildirin. Şikayetler moderasyon ekibimiz tarafından incelenir; ihlal tespit edilirse içerik kaldırılabilir veya hesap askıya alınabilir.";

export const REPORT_SUBMITTED_TITLE = "Şikayet alındı";

export const REPORT_SUBMITTED_MESSAGE =
  "Bildiriminiz moderasyon ekibimize iletildi. İnceleme tamamlandığında gerekli işlem yapılacaktır.";

export function showReportSubmittedAlert(): void {
  Alert.alert(REPORT_SUBMITTED_TITLE, REPORT_SUBMITTED_MESSAGE);
}
