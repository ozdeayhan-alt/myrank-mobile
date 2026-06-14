import * as FileSystem from "expo-file-system/legacy";
import { resolveReadableUri } from "./uriToBlob";

const MIN_MP4_BYTES = 4096;

function decodeBase64Prefix(b64: string): string {
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(b64);
  }
  return Buffer.from(b64, "base64").toString("binary");
}

/** Yükleme öncesi MP4 geçerlilik kontrolü (ftyp kutusu). */
export async function assertValidMp4File(
  localUri: string,
  minBytes = MIN_MP4_BYTES
): Promise<string> {
  const readableUri = await resolveReadableUri(localUri);
  const info = await FileSystem.getInfoAsync(readableUri);

  if (!info.exists || typeof info.size !== "number" || info.size < minBytes) {
    throw new Error(
      "Video dosyası geçersiz veya çok küçük. Farklı bir video deneyin."
    );
  }

  const headerB64 = await FileSystem.readAsStringAsync(readableUri, {
    encoding: FileSystem.EncodingType.Base64,
    length: 12,
    position: 0,
  });

  const header = decodeBase64Prefix(headerB64);
  const boxType = header.slice(4, 8);
  if (boxType !== "ftyp" && boxType !== "moov" && boxType !== "wide") {
    throw new Error("Video dosyası geçerli bir MP4 formatında değil.");
  }

  return readableUri;
}
