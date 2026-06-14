import { getFirebaseErrorMessage } from "./firebaseErrors";

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "İstek geçersiz. Lütfen tekrar deneyin.",
  401: "Oturum süresi doldu. Çıkış yapıp tekrar giriş yapın.",
  403: "Bu işlem için yetkiniz yok. Oturumu yenileyip tekrar deneyin.",
  404: "İstenen kaynak bulunamadı.",
  408: "İşlem zaman aşımına uğradı. Tekrar deneyin.",
  429: "Çok fazla istek gönderildi. Biraz bekleyip tekrar deneyin.",
  500: "Sunucu hatası. Kısa süre sonra tekrar deneyin.",
  502: "Sunucu geçici olarak yanıt vermiyor.",
  503: "Sunucu şu an meşgul. Lütfen birkaç dakika sonra tekrar deneyin.",
  504: "Sunucu yanıt vermedi. Bağlantınızı kontrol edip tekrar deneyin.",
};

function messageFromHttpStatus(status: number): string | null {
  return HTTP_STATUS_MESSAGES[status] ?? null;
}

function parseStatusFromMessage(message: string): number | null {
  const patterns = [
    /\((\d{3})\)\s*$/,
    /status code (\d{3})/i,
    /upload failed \((\d{3})\)/i,
    /failed with status (\d{3})/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      return Number.parseInt(match[1], 10);
    }
  }

  return null;
}

function mapNetworkError(message: string): string | null {
  const lower = message.toLowerCase();

  if (
    lower.includes("network request failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("network error")
  ) {
    return "İnternet bağlantısı kurulamadı. Wi‑Fi veya mobil veriyi kontrol edin.";
  }

  if (
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("eai_again") ||
    lower.includes("unable to resolve host")
  ) {
    return "Sunucuya ulaşılamıyor. API adresini ve internet bağlantınızı kontrol edin.";
  }

  if (lower.includes("token expired") || lower.includes("invalid token")) {
    return "Oturum süresi doldu. Çıkış yapıp tekrar giriş yapın.";
  }

  if (lower.includes("downloadurl")) {
    return "Yükleme tamamlandı ancak dosya adresi alınamadı. Tekrar deneyin.";
  }

  return null;
}

/**
 * Upload, API ve ağ hataları için kullanıcıya gösterilecek Türkçe metin.
 */
export function getUserFacingErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const networkMapped = mapNetworkError(error.message);
    if (networkMapped) {
      return networkMapped;
    }

    const status = parseStatusFromMessage(error.message);
    if (status !== null) {
      const detailMatch = error.message.match(/^(.+?) \((\d{3})\)$/);
      const detail = detailMatch?.[1]?.trim();
      if (
        detail &&
        (status === 500 ||
          status === 403 ||
          status === 400 ||
          status === 401) &&
        !detail.toLowerCase().includes("ffmpeg version")
      ) {
        return detail;
      }

      const httpMessage = messageFromHttpStatus(status);
      if (httpMessage) {
        return httpMessage;
      }
    }

    if (error.message === "timeout") {
      return "İşlem zaman aşımına uğradı. Tekrar deneyin.";
    }

    if (error.message.includes("Sunucu yanıt vermedi")) {
      return error.message;
    }

    if (error.message.includes("Storage yüklemesi için oturum")) {
      return error.message;
    }

    if (error.message.includes("Storage path boş")) {
      return "Yükleme yolu geçersiz. Lütfen tekrar deneyin.";
    }

    if (
      error.message.includes("MB olabilir") ||
      error.message.includes("dosyası okunamadı")
    ) {
      return error.message;
    }
  }

  return getFirebaseErrorMessage(error);
}
