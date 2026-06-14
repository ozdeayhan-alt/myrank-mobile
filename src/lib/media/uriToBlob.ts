import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Android content:// URI'lerini okunabilir file:// yoluna kopyalar.
 */
export async function resolveReadableUri(localUri: string): Promise<string> {
  if (
    Platform.OS === "android" &&
    localUri.startsWith("content://") &&
    FileSystem.cacheDirectory
  ) {
    const dest = `${FileSystem.cacheDirectory}upload_${Date.now()}`;
    await FileSystem.copyAsync({ from: localUri, to: dest });
    return dest;
  }
  return localUri;
}

/** Dosyayı base64 olarak okur (backend upload için). */
export async function uriToUploadBase64(localUri: string): Promise<string> {
  const readableUri = await resolveReadableUri(localUri);
  const base64 = await FileSystem.readAsStringAsync(readableUri, {
    encoding: "base64",
  });

  if (!base64 || base64.length < 16) {
    throw new Error("Dosya okunamadı (boş veya çok kısa base64)");
  }

  return base64;
}
