import { FirebaseError } from "firebase/app";

function reportToCrashlytics(error: unknown, context: string): void {
  try {
    // Lazy load: jest tests import firebaseErrors without RN native modules.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { recordError } = require("./crashReporting") as typeof import("./crashReporting");
    recordError(error, context);
  } catch {
    // Crash reporting must never break error logging.
  }
}

export function logFirebaseError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
): void {
  const payload: Record<string, unknown> = { ...extra };

  if (error instanceof FirebaseError) {
    payload.code = error.code;
    payload.message = error.message;
    payload.customData = error.customData;
    const serverResponse = error.customData?.serverResponse;
    if (serverResponse) {
      payload.serverResponse = serverResponse;
    }
  } else if (error instanceof Error) {
    payload.message = error.message;
    payload.stack = error.stack;
  } else {
    payload.raw = error;
  }

  console.error(`[${context}]`, payload);
  if (payload.serverResponse) {
    console.error(`[${context}] serverResponse:`, payload.serverResponse);
  }

  if (error instanceof FirebaseError) {
    const benignCodes = new Set([
      "permission-denied",
      "storage/unauthorized",
      "storage/canceled",
    ]);
    if (benignCodes.has(error.code)) {
      return;
    }
  }

  const reportError =
    error instanceof Error ? error : new Error(`[${context}] ${String(error)}`);
  reportToCrashlytics(reportError, context);
}

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "timeout") {
    return "İşlem zaman aşımına uğradı. Tekrar deneyin.";
  }

  if (error instanceof Error && !("code" in error)) {
    const msg = error.message;
    if (
      msg.includes("permission-denied") ||
      msg.includes("Missing or insufficient permissions")
    ) {
      return "İzin reddedildi. Profilinizi tamamladığınızdan emin olun.";
    }
    if (msg.includes("index") || msg.includes("requires an index")) {
      return "Veritabanı indeksi hazırlanıyor. Birkaç dakika sonra tekrar deneyin.";
    }
    return msg || "Beklenmeyen bir hata oluştu.";
  }

  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);

    if (code.startsWith("storage/")) {
      switch (code) {
        case "storage/unauthorized":
          return "Storage izni reddedildi. Oturum açık olduğundan emin olun.";
        case "storage/canceled":
          return "Yükleme iptal edildi.";
        case "storage/unknown":
          return "Dosya yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.";
        case "storage/object-not-found":
          return "Storage bucket veya dosya yolu bulunamadı.";
        case "storage/bucket-not-found":
          return "Storage bucket bulunamadı. EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET değerini kontrol edin.";
        case "storage/invalid-checksum":
          return "Dosya bozuk veya eksik yüklendi. Tekrar deneyin.";
        case "storage/retry-limit-exceeded":
          return "Yükleme çok kez başarısız oldu. Bağlantınızı kontrol edin.";
        default:
          return `Storage hatası (${code}). Lütfen tekrar deneyin.`;
      }
    }

    switch (code) {
      case "permission-denied":
        return "İzin reddedildi. Güvenlik kurallarını kontrol edin.";
      case "unavailable":
        return "Servis şu an kullanılamıyor. İnternet bağlantınızı kontrol edin.";
      case "not-found":
        return "Kaynak bulunamadı.";
      case "ERR_GENERATE_THUMBNAIL":
        return "Kapak görseli oluşturulamadı. Video yine de yüklenecek; tekrar deneyin.";
      default:
        if (code.startsWith("ERR_")) {
          return `İşlem başarısız (${code}). Lütfen tekrar deneyin.`;
        }
        return `Firebase hatası (${code}). Lütfen tekrar deneyin.`;
    }
  }

  return "Beklenmeyen bir hata oluştu.";
}
